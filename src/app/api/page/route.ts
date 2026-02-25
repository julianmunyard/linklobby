// GET /api/page - fetch the current user's page info
// PATCH /api/page - update page fields (e.g. is_published)

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkPublishEligibility } from "@/lib/supabase/publish-gate"
import { generalApiRatelimit, checkRateLimit } from "@/lib/ratelimit"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    // Fetch the user's page
    const { data: page, error } = await supabase
      .from("pages")
      .select("id, user_id, is_published, created_at, updated_at")
      .eq("user_id", user.id)
      .single()

    if (error || !page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    const body = await request.json()

    // Gate publishing behind email verification
    if (body.is_published === true) {
      const eligibilityError = await checkPublishEligibility(supabase)
      if (eligibilityError) {
        return NextResponse.json({ error: eligibilityError }, { status: 403 })
      }
    }

    // Update the user's page
    const { data: page, error } = await supabase
      .from("pages")
      .update(body)
      .eq("user_id", user.id)
      .select("id, user_id, is_published, created_at, updated_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error updating page:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
