// PUT /api/cards/[id] - upsert a card (create or update)
// PATCH /api/cards/[id] - update a card
// DELETE /api/cards/[id] - delete a card

import { NextResponse } from "next/server"
import { updateCard, upsertCard, deleteCard, fetchUserPage } from "@/lib/supabase/cards"
import { validateCsrfOrigin } from "@/lib/csrf"
import { sanitizeText } from "@/lib/sanitize"
import { generalApiRatelimit, checkRateLimit } from "@/lib/ratelimit"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const cardData = await request.json()

    if (cardData.title) cardData.title = sanitizeText(cardData.title)
    if (cardData.description) cardData.description = sanitizeText(cardData.description)

    // Use upsert to handle both new cards (from duplicate) and existing cards
    const card = await upsertCard(id, { ...cardData, page_id: page.id })
    return NextResponse.json({ card })
  } catch (error) {
    console.error("Error upserting card:", error)
    return NextResponse.json(
      { error: "Failed to save card" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    if (updates.title) updates.title = sanitizeText(updates.title)
    if (updates.description) updates.description = sanitizeText(updates.description)

    const card = await updateCard(id, updates)
    return NextResponse.json({ card })
  } catch (error) {
    console.error("Error updating card:", error)
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    await deleteCard(id)

    // Clean up associated storage files — wrap in try/catch so a storage failure
    // does not affect the already-successful card deletion response.
    try {
      // Delete audio files stored at card-audio/{cardId}/
      const { data: audioFiles } = await supabase.storage
        .from('card-audio')
        .list(id)

      if (audioFiles?.length) {
        const audioFilePaths = audioFiles.map((f) => `${id}/${f.name}`)
        await supabase.storage.from('card-audio').remove(audioFilePaths)

        // Decrement storage_used_bytes by actual audio bytes removed
        const audioBytes = audioFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0)
        if (audioBytes > 0) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('storage_used_bytes')
            .eq('id', user.id)
            .single()
          const newUsage = Math.max(0, (profileData?.storage_used_bytes || 0) - audioBytes)
          await supabase
            .from('profiles')
            .update({ storage_used_bytes: newUsage })
            .eq('id', user.id)
        }
      }

      // Delete image files stored at card-images/{cardId}/
      const { data: imageFiles } = await supabase.storage
        .from('card-images')
        .list(id)

      if (imageFiles?.length) {
        const imageFilePaths = imageFiles.map((f) => `${id}/${f.name}`)
        await supabase.storage.from('card-images').remove(imageFilePaths)
      }
    } catch (storageErr) {
      // Log but do not fail — card is already deleted from DB
      console.error('Storage cleanup error after card deletion:', storageErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting card:", error)
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    )
  }
}
