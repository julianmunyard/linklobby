// POST /api/cards/bulk - bulk upsert cards (used by sendBeacon on page unload)

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fetchUserPage } from "@/lib/supabase/cards"
import { POSITION_MAP } from "@/types/card"
import type { HorizontalPosition } from "@/types/card"

export async function POST(request: Request) {
  try {
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { cards } = await request.json()
    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "No cards provided" }, { status: 400 })
    }

    const supabase = await createClient()

    // Map cards to database format and upsert all at once
    const dbCards = cards.map((card: Record<string, unknown>) => ({
      id: card.id,
      page_id: page.id,
      card_type: card.card_type,
      title: card.title ?? null,
      description: card.description ?? null,
      url: card.url ?? null,
      content: card.content ?? {},
      size: card.size ?? 'big',
      position_x: POSITION_MAP[(card.position as HorizontalPosition) ?? 'left'] ?? 0,
      sort_key: card.sortKey,
      is_visible: card.is_visible ?? true,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from("cards")
      .upsert(dbCards, { onConflict: "id" })

    if (error) {
      console.error("Bulk upsert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Bulk save error:", error)
    return NextResponse.json(
      { error: "Failed to bulk save cards" },
      { status: 500 }
    )
  }
}
