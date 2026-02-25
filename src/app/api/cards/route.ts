// GET /api/cards - fetch all cards for current user's page
// POST /api/cards - create a new card

import { NextResponse } from "next/server"
import { fetchCards, createCard, fetchUserPage } from "@/lib/supabase/cards"
import { validateCsrfOrigin } from "@/lib/csrf"
import { sanitizeText } from "@/lib/sanitize"
import { generalApiRatelimit, checkRateLimit } from "@/lib/ratelimit"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
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

    const body = await request.json()
    const { card_type, url, content, size, sortKey, is_visible } = body
    const title = body.title ? sanitizeText(body.title) : null
    const description = body.description ? sanitizeText(body.description) : null

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
