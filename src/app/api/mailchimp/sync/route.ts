// POST /api/mailchimp/sync - sync collected emails to Mailchimp
// Syncs unsynced emails for a page to a specified Mailchimp list

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { addSubscriber, isMailchimpConfigured } from "@/lib/fan-tools/mailchimp"
import { generalApiRatelimit, checkRateLimit } from "@/lib/ratelimit"

export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json()
    const { pageId, listId } = body

    if (!pageId || !listId) {
      return NextResponse.json(
        { error: "pageId and listId are required" },
        { status: 400 }
      )
    }

    // Check if Mailchimp is configured
    if (!isMailchimpConfigured()) {
      return NextResponse.json(
        {
          error: "Mailchimp not configured",
          details: "Set MAILCHIMP_API_KEY and MAILCHIMP_SERVER_PREFIX environment variables",
        },
        { status: 503 }
      )
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

    // Fetch unsynced emails for this page
    const { data: unsyncedEmails, error: fetchError } = await supabase
      .from("collected_emails")
      .select("id, email, name")
      .eq("page_id", pageId)
      .eq("synced_to_mailchimp", false)

    if (fetchError) {
      console.error("Error fetching unsynced emails:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch emails" },
        { status: 500 }
      )
    }

    if (!unsyncedEmails || unsyncedEmails.length === 0) {
      return NextResponse.json({
        synced: 0,
        failed: 0,
        alreadyExists: 0,
        message: "No unsynced emails to process",
      })
    }

    // Sync each email to Mailchimp
    let synced = 0
    let failed = 0
    let alreadyExists = 0
    const syncedIds: string[] = []

    for (const emailRecord of unsyncedEmails) {
      const result = await addSubscriber(
        listId,
        emailRecord.email,
        emailRecord.name || undefined
      )

      if (result.success) {
        syncedIds.push(emailRecord.id)
        if (result.alreadyExists) {
          alreadyExists++
        }
        synced++
      } else {
        failed++
        console.error(
          `Failed to sync email ${emailRecord.email}:`,
          result.error
        )
      }
    }

    // Update synced emails in database
    if (syncedIds.length > 0) {
      const { error: updateError } = await supabase
        .from("collected_emails")
        .update({
          synced_to_mailchimp: true,
          mailchimp_sync_at: new Date().toISOString(),
        })
        .in("id", syncedIds)

      if (updateError) {
        console.error("Error updating sync status:", updateError)
        // Don't fail the request, emails were synced to Mailchimp
      }
    }

    return NextResponse.json({
      synced,
      failed,
      alreadyExists,
      message:
        failed > 0
          ? `Synced ${synced} emails with ${failed} failures`
          : `Successfully synced ${synced} emails`,
    })
  } catch (error) {
    console.error("Error in Mailchimp sync:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
