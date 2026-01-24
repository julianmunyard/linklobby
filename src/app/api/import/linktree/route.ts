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
  try {
    // Authenticate user
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get username from request
    const { username, existingCards = [] } = await request.json()
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Scrape Linktree profile
    const profileData = await scrapeLinktreeProfile(username)

    // Map to our card format - returns structured {card, imageBlob} pairs
    const { mappedCards, failures } = await mapLinktreeToCards(profileData.links)

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

        // Create the card - content is clean, just add imageUrl if we have one
        const card = await createCard({
          page_id: page.id,
          card_type: cardData.card_type,
          title: cardData.title,
          description: cardData.description,
          url: cardData.url,
          content: imageUrl ? { imageUrl } : {},
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
      failures,
    })
  } catch (error) {
    // Handle known error types with user-friendly messages
    if (error instanceof LinktreeNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof LinktreeEmptyError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof LinktreeFetchError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import Linktree. Please try again.' },
      { status: 500 }
    )
  }
}
