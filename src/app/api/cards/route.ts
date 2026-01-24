// GET /api/cards - fetch all cards for current user's page
// POST /api/cards - create a new card

import { NextResponse } from "next/server"
import { fetchCards, createCard, fetchUserPage } from "@/lib/supabase/cards"

export async function GET() {
  try {
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const cards = await fetchCards(page.id)
    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const page = await fetchUserPage()
    if (!page) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { card_type, title, description, url, content, size, sortKey, is_visible } = body

    const card = await createCard({
      page_id: page.id,
      card_type,
      title: title || null,
      description: description || null,
      url: url || null,
      content: content || {},
      size: size || "big",
      position: body.position || "left",
      sortKey,
      is_visible: is_visible ?? true,
    })

    return NextResponse.json({ card }, { status: 201 })
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    )
  }
}
