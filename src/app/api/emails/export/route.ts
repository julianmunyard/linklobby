// GET /api/emails/export - export collected emails for a page
// Returns JSON array of emails for the authenticated user's page

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get pageId from query params
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get("pageId")

    if (!pageId) {
      return NextResponse.json({ error: "pageId is required" }, { status: 400 })
    }

    // Verify the page belongs to the authenticated user
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, user_id")
      .eq("id", pageId)
      .single()

    if (pageError || !page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    if (page.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Fetch collected emails for this page
    const { data: emails, error: emailsError } = await supabase
      .from("collected_emails")
      .select("id, email, name, collected_at")
      .eq("page_id", pageId)
      .order("collected_at", { ascending: false })

    if (emailsError) {
      console.error("Error fetching emails:", emailsError)
      return NextResponse.json(
        { error: "Failed to fetch emails" },
        { status: 500 }
      )
    }

    // Return emails array
    return NextResponse.json({
      emails: emails || [],
      count: emails?.length || 0,
    })
  } catch (error) {
    console.error("Error in email export:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
