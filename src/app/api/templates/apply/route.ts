// src/app/api/templates/apply/route.ts
// Template application API route.
// Uploads template media assets to user Supabase storage,
// creates cards with user-scoped URLs, and returns theme/profile data.

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { fetchUserPage } from '@/lib/supabase/cards'
import { getTemplate } from '@/lib/templates'
import { generateKeyBetween } from 'fractional-indexing'
import type { Card, CardType, CardSize, HorizontalPosition } from '@/types/card'
import { POSITION_MAP, POSITION_REVERSE } from '@/types/card'

export const runtime = 'nodejs'

const IMAGE_BUCKET = 'card-images'
const AUDIO_BUCKET = 'card-audio'

// Map file extension to Supabase bucket name
function getBucketForExtension(ext: string): string {
  const lower = ext.toLowerCase()
  if (lower === 'mp3') return AUDIO_BUCKET
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lower)) return IMAGE_BUCKET
  return IMAGE_BUCKET // fallback to images
}

// Map file extension to MIME content type
function getContentTypeForExtension(ext: string): string {
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  return map[ext.toLowerCase()] || 'application/octet-stream'
}

export async function POST(request: Request) {
  console.log('[API /templates/apply] POST request received')

  try {
    // --- Step 1: Auth check ---
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // We need the user ID for scoping storage paths
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // --- Step 2: Parse request body ---
    const body = await request.json()
    const { templateId, mode = 'replace' } = body as {
      templateId: string
      mode: 'replace' | 'add'
    }

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }
    if (mode !== 'replace' && mode !== 'add') {
      return NextResponse.json({ error: 'mode must be "replace" or "add"' }, { status: 400 })
    }

    // --- Step 3: Load template ---
    const template = getTemplate(templateId)
    if (!template) {
      return NextResponse.json({ error: `Template "${templateId}" not found` }, { status: 404 })
    }

    console.log(`[API /templates/apply] Applying template "${template.name}" for user ${user.id}, mode=${mode}`)

    // --- Step 4: Upload media assets ---
    // urlMap: filename -> { newUrl, newStoragePath }
    const urlMap: Record<string, { newUrl: string; newStoragePath: string }> = {}

    for (const assetFilename of template.mediaAssets) {
      try {
        const ext = assetFilename.split('.').pop() || ''
        const bucket = getBucketForExtension(ext)
        const contentType = getContentTypeForExtension(ext)

        // Read the asset from disk (public/templates/{templateId}/{filename})
        const diskPath = path.join(process.cwd(), 'public', 'templates', template.id, assetFilename)
        let fileBuffer: Buffer
        try {
          fileBuffer = fs.readFileSync(diskPath)
        } catch (readErr) {
          console.warn(`[API /templates/apply] Could not read asset "${assetFilename}" from ${diskPath}:`, readErr)
          continue // Skip this asset — missing file is non-fatal
        }

        // Generate user-scoped upload path: {userId}/{uuid}.{ext}
        const uploadPath = `${user.id}/${crypto.randomUUID()}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(uploadPath, fileBuffer, {
            contentType,
            upsert: false,
          })

        if (uploadError || !uploadData) {
          console.warn(`[API /templates/apply] Upload failed for "${assetFilename}":`, uploadError?.message)
          continue // Non-fatal — missing image beats failed template apply
        }

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(uploadData.path)

        urlMap[assetFilename] = {
          newUrl: urlData.publicUrl,
          newStoragePath: uploadData.path,
        }

        console.log(`[API /templates/apply] Uploaded "${assetFilename}" -> ${urlData.publicUrl}`)
      } catch (err) {
        console.warn(`[API /templates/apply] Unexpected error uploading "${assetFilename}":`, err)
        // Continue — non-fatal
      }
    }

    // --- Step 5: Build card records ---
    const now = new Date().toISOString()

    // For 'add' mode, fetch existing cards to compute sort keys after them
    let lastSortKey: string | null = null
    if (mode === 'add') {
      const { data: existingCards } = await supabase
        .from('cards')
        .select('sort_key')
        .eq('page_id', page.id)
        .order('sort_key', { ascending: false })
        .limit(1)

      if (existingCards && existingCards.length > 0) {
        lastSortKey = existingCards[0].sort_key
      }
    }

    // Pre-generate sort keys for all template cards
    const sortKeys: string[] = []
    let currentKey = lastSortKey
    for (let i = 0; i < template.cards.length; i++) {
      const nextKey = generateKeyBetween(currentKey, null)
      sortKeys.push(nextKey)
      currentKey = nextKey
    }

    const cardRecords = template.cards.map((templateCard, index) => {
      // Deep clone content to avoid mutating template definition
      const content = JSON.parse(JSON.stringify(templateCard.content)) as Record<string, unknown>

      // Shape A: imageUrl (hero, square, horizontal link cards)
      if (typeof content.imageUrl === 'string' && content.imageUrl.startsWith('/templates/')) {
        const filename = content.imageUrl.split('/').pop() || ''
        const mapped = urlMap[filename]
        if (mapped) {
          content.imageUrl = mapped.newUrl
          content.storagePath = mapped.newStoragePath
        }
      }

      // Shape B: tracks[] (audio cards)
      if (Array.isArray(content.tracks)) {
        content.tracks = (content.tracks as Record<string, unknown>[]).map((track) => {
          if (typeof track.audioUrl === 'string' && track.audioUrl.startsWith('/templates/')) {
            const filename = track.audioUrl.split('/').pop() || ''
            const mapped = urlMap[filename]
            if (mapped) {
              return { ...track, audioUrl: mapped.newUrl, storagePath: mapped.newStoragePath }
            }
          }
          return track
        })
      }

      // Shape C: images[] (gallery cards)
      if (Array.isArray(content.images)) {
        content.images = (content.images as Record<string, unknown>[]).map((image) => {
          if (typeof image.imageUrl === 'string' && image.imageUrl.startsWith('/templates/')) {
            const filename = image.imageUrl.split('/').pop() || ''
            const mapped = urlMap[filename]
            if (mapped) {
              return { ...image, imageUrl: mapped.newUrl, storagePath: mapped.newStoragePath }
            }
          }
          return image
        })
      }

      return {
        id: crypto.randomUUID(),
        page_id: page.id,
        card_type: templateCard.card_type,
        title: templateCard.title,
        description: templateCard.description,
        url: templateCard.url,
        content,
        size: templateCard.size,
        position_x: POSITION_MAP[templateCard.position as HorizontalPosition] ?? 0,
        sort_key: sortKeys[index],
        is_visible: templateCard.is_visible,
        created_at: now,
        updated_at: now,
      }
    })

    // --- Step 6: Handle existing cards (replace or add) ---
    if (mode === 'replace') {
      console.log(`[API /templates/apply] Deleting existing cards for page ${page.id}`)
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('page_id', page.id)

      if (deleteError) {
        console.error('[API /templates/apply] Failed to delete existing cards:', deleteError)
        return NextResponse.json(
          { error: `Failed to clear existing cards: ${deleteError.message}` },
          { status: 500 }
        )
      }
    }

    // --- Step 7: Batch insert card records ---
    console.log(`[API /templates/apply] Inserting ${cardRecords.length} cards`)
    const { data: insertedCards, error: insertError } = await supabase
      .from('cards')
      .insert(cardRecords)
      .select()

    if (insertError || !insertedCards) {
      console.error('[API /templates/apply] Batch insert error:', insertError)
      return NextResponse.json(
        { error: `Failed to insert cards: ${insertError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    console.log(`[API /templates/apply] Successfully inserted ${insertedCards.length} cards`)

    // --- Step 8: Map DB rows back to Card type ---
    const createdCards: Card[] = insertedCards
      .map((row) => ({
        id: row.id,
        page_id: row.page_id,
        card_type: row.card_type as CardType,
        title: row.title,
        description: row.description,
        url: row.url,
        content: (row.content as Record<string, unknown>) || {},
        size: row.size as CardSize,
        position: POSITION_REVERSE[row.position_x ?? 0] || 'left',
        sortKey: row.sort_key,
        is_visible: row.is_visible,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }))
      .sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0))

    // --- Step 9: Remap phoneHomeDock sortKey refs → new card IDs ---
    // Templates store dock entries as sortKey references (not card IDs)
    // because card IDs change on every apply. Map them back to real IDs.
    const themeResponse = { ...template.theme }
    if (Array.isArray(themeResponse.phoneHomeDock) && themeResponse.phoneHomeDock.length > 0) {
      // Build map: template sortKey → new card ID
      const sortKeyToNewId = new Map<string, string>()
      template.cards.forEach((tc, i) => {
        sortKeyToNewId.set(tc.sortKey, cardRecords[i].id)
      })

      themeResponse.phoneHomeDock = themeResponse.phoneHomeDock
        .map((sk: string) => sortKeyToNewId.get(sk))
        .filter((id: string | undefined): id is string => !!id)
    }

    // --- Step 10: Return response ---
    return NextResponse.json({
      cards: createdCards,
      theme: themeResponse,
      profile: template.profile,
      templateName: template.name,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[API /templates/apply] Unexpected error:', errorMessage, error)
    return NextResponse.json(
      { error: 'Failed to apply template. Please try again.' },
      { status: 500 }
    )
  }
}
