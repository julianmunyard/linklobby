// src/app/api/import/linktree/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeLinktreeProfile, LinktreeNotFoundError, LinktreeEmptyError, LinktreeFetchError } from '@/lib/import/linktree-scraper'
import { mapLinktreeToCards } from '@/lib/import/linktree-mapper'
import { fetchUserPage } from '@/lib/supabase/cards'
import { generateKeyBetween } from 'fractional-indexing'
import type { Card, CardType, CardSize, HorizontalPosition } from '@/types/card'
import { POSITION_MAP } from '@/types/card'
import { validateCsrfOrigin } from '@/lib/csrf'
import { generalApiRatelimit, checkRateLimit } from '@/lib/ratelimit'

const BUCKET_NAME = 'card-images'

export async function POST(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  try {
    // Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

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

    // Map to our card format - returns structured {card, imageBlob} pairs + detected social icons
    const { mappedCards, detectedSocialIcons, failures } = await mapLinktreeToCards(
      profileData.links,
      profileData.socialLinks
    )

    // Pre-generate all sortKeys upfront for correct ordering
    // This is much faster than generating them one at a time
    const sortKeys: string[] = []
    let lastKey: string | null = existingCards.length > 0
      ? [...existingCards].sort((a: Card, b: Card) => a.sortKey < b.sortKey ? -1 : 1).pop()?.sortKey ?? null
      : null

    for (let i = 0; i < mappedCards.length; i++) {
      const newKey = generateKeyBetween(lastKey, null)
      sortKeys.push(newKey)
      lastKey = newKey
    }

    // Create cards in database using batch insert (single query)
    // (supabase client already created above for auth check)

    // Upload images to Supabase storage and prepare card records
    const cardRecords = await Promise.all(
      mappedCards.map(async ({ card: cardData, imageBlob }, index) => {
        const cardId = crypto.randomUUID()
        let content = { ...cardData.content }

        // Upload image blob to storage if available
        if (imageBlob && imageBlob.size > 0) {
          try {
            const contentType = imageBlob.type || 'image/jpeg'
            const ext = contentType.split('/')[1] || 'jpg'
            const fileName = `${cardId}/${crypto.randomUUID()}.${ext}`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(fileName, imageBlob, {
                contentType,
                upsert: false,
              })

            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(uploadData.path)

              content.imageUrl = urlData.publicUrl
            } else if (uploadError) {
              console.warn(`[API /import/linktree] Image upload failed for "${cardData.title}":`, uploadError.message)
            }
          } catch (err) {
            console.warn(`[API /import/linktree] Image upload error for "${cardData.title}":`, err)
          }
        }

        return {
          id: cardId,
          page_id: page.id,
          card_type: cardData.card_type,
          title: cardData.title,
          description: cardData.description,
          url: cardData.url,
          content,
          size: cardData.size,
          position_x: POSITION_MAP[cardData.position as HorizontalPosition] ?? 0,
          sort_key: sortKeys[index],
          is_visible: true,
        }
      })
    )

    // Single batch insert - much faster than sequential inserts
    const { data: insertedCards, error: insertError } = await supabase
      .from('cards')
      .insert(cardRecords)
      .select()

    if (insertError) {
      console.error('[API /import/linktree] Batch insert error:', insertError)
      throw new Error(`Failed to insert cards: ${insertError.message}`)
    }

    // Map back to Card type and sort by sortKey to ensure correct order
    const createdCards: Card[] = (insertedCards || [])
      .map((row) => ({
        id: row.id,
        page_id: row.page_id,
        card_type: row.card_type as CardType,
        title: row.title,
        description: row.description,
        url: row.url,
        content: (row.content as Record<string, unknown>) || {},
        size: row.size as CardSize,
        position: (['left', 'center', 'right'] as const)[row.position_x ?? 0] || 'left',
        sortKey: row.sort_key,
        is_visible: row.is_visible,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }))
      .sort((a, b) => a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0)

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
