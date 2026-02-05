// src/app/api/import/linktree/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeLinktreeProfile, LinktreeNotFoundError, LinktreeEmptyError, LinktreeFetchError } from '@/lib/import/linktree-scraper'
import { mapLinktreeToCards } from '@/lib/import/linktree-mapper'
import { fetchUserPage } from '@/lib/supabase/cards'
import { generateKeyBetween } from 'fractional-indexing'
import type { Card, CardType, CardSize, HorizontalPosition } from '@/types/card'
import { POSITION_MAP } from '@/types/card'

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

    console.log('[API /import/linktree] Mapped cards count:', mappedCards.length)

    // Log first 5 mapped cards to verify order
    console.log('[API /import/linktree] First 5 mapped cards:')
    mappedCards.slice(0, 5).forEach((m, i) => {
      console.log(`  ${i}: "${m.card.title}" (${m.card.card_type})`)
    })

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
    const supabase = await createClient()

    // Prepare all card records for batch insert
    const cardRecords = mappedCards.map(({ card: cardData }, index) => ({
      id: crypto.randomUUID(),
      page_id: page.id,
      card_type: cardData.card_type,
      title: cardData.title,
      description: cardData.description,
      url: cardData.url,
      content: cardData.content,
      size: cardData.size,
      position_x: POSITION_MAP[cardData.position as HorizontalPosition] ?? 0,
      sort_key: sortKeys[index],
      is_visible: true,
    }))

    // Log first 5 card records with sortKeys
    console.log('[API /import/linktree] First 5 card records with sortKeys:')
    cardRecords.slice(0, 5).forEach((r, i) => {
      console.log(`  ${i}: "${r.title}" sortKey="${r.sort_key}"`)
    })

    console.log('[API /import/linktree] Inserting', cardRecords.length, 'cards in batch')

    // Single batch insert - much faster than sequential inserts
    const { data: insertedCards, error: insertError } = await supabase
      .from('cards')
      .insert(cardRecords)
      .select()

    if (insertError) {
      console.error('[API /import/linktree] Batch insert error:', insertError)
      throw new Error(`Failed to insert cards: ${insertError.message}`)
    }

    console.log('[API /import/linktree] Successfully inserted', insertedCards?.length ?? 0, 'cards')

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

    // Log final order
    console.log('[API /import/linktree] Final cards order (first 5):')
    createdCards.slice(0, 5).forEach((c, i) => {
      console.log(`  ${i}: "${c.title}" sortKey="${c.sortKey}"`)
    })

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
