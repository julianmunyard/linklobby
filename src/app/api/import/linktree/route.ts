// src/app/api/import/linktree/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeLinktreeProfile, LinktreeNotFoundError, LinktreeEmptyError, LinktreeFetchError } from '@/lib/import/linktree-scraper'
import { mapLinktreeToCards } from '@/lib/import/linktree-mapper'
import { fetchUserPage, createCard } from '@/lib/supabase/cards'
import { generateAppendKey } from '@/lib/ordering'
import type { Card } from '@/types/card'

const BUCKET_NAME = 'card-images'

export async function POST(request: Request) {
  console.log('[API /import/linktree] POST request received')

  try {
    // Authenticate user
    console.log('[API /import/linktree] Authenticating user...')
    const page = await fetchUserPage()
    console.log('[API /import/linktree] User page:', page ? page.id : 'null')
    if (!page) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get username from request
    const { username, existingCards = [] } = await request.json()
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Scrape Linktree profile
    console.log('[API /import/linktree] Scraping username:', username)
    const profileData = await scrapeLinktreeProfile(username)
    console.log('[API /import/linktree] Scraped links count:', profileData.links.length)
    console.log('[API /import/linktree] Social links count:', profileData.socialLinks?.length ?? 0)

    // Map to our card format - returns structured {card, imageBlob} pairs + detected social icons
    const { mappedCards, detectedSocialIcons, failures } = await mapLinktreeToCards(
      profileData.links,
      profileData.socialLinks
    )

    // Create cards in database with images uploaded
    const supabase = await createClient()
    const createdCards: Card[] = []
    let sortKeyBase = existingCards.length > 0
      ? generateAppendKey(existingCards)
      : 'a0'

    for (const { card: cardData, imageBlob } of mappedCards) {
      try {
        // Upload image if we have one - imageBlob is already extracted, not embedded
        let imageUrl: string | undefined

        if (imageBlob) {
          const fileExt = imageBlob.type.split('/')[1] || 'jpg'
          const tempId = crypto.randomUUID()
          const fileName = `${tempId}/${crypto.randomUUID()}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, imageBlob, {
              contentType: imageBlob.type,
              upsert: false,
            })

          if (!uploadError && uploadData) {
            const { data: urlData } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(uploadData.path)
            imageUrl = urlData.publicUrl
          }
        }

        // Create the card - merge imageUrl into content (which has alignment defaults)
        const card = await createCard({
          page_id: page.id,
          card_type: cardData.card_type,
          title: cardData.title,
          description: cardData.description,
          url: cardData.url,
          content: imageUrl ? { ...cardData.content, imageUrl } : cardData.content,
          size: cardData.size,
          position: cardData.position,
          sortKey: sortKeyBase,
          is_visible: true,
        })

        createdCards.push(card)

        // Update sortKey for next card
        sortKeyBase = generateAppendKey([...existingCards, ...createdCards])
      } catch (cardError) {
        console.error('Failed to create card:', cardError)
        failures.push({
          index: mappedCards.findIndex(m => m.card === cardData),
          title: cardData.title || 'Untitled',
          reason: 'Failed to save card',
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported: createdCards.length,
      failed: failures.length,
      cards: createdCards,
      detectedSocialIcons,
      failures,
    })
  } catch (error) {
    // Handle known error types with user-friendly messages
    // Use error.name check as instanceof can fail in bundled environments
    const errorName = error instanceof Error ? error.name : ''
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('Import error:', errorName, errorMessage, error)

    if (errorName === 'LinktreeNotFoundError' || error instanceof LinktreeNotFoundError) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }
    if (errorName === 'LinktreeEmptyError' || error instanceof LinktreeEmptyError) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }
    if (errorName === 'LinktreeFetchError' || error instanceof LinktreeFetchError) {
      return NextResponse.json({ error: errorMessage }, { status: 502 })
    }

    return NextResponse.json(
      { error: 'Failed to import Linktree. Please try again.' },
      { status: 500 }
    )
  }
}
