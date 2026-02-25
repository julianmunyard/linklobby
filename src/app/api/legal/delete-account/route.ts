// POST /api/legal/delete-account - Initiate account deletion (30-day grace period)
// PATCH /api/legal/delete-account - Recover account during grace period

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateCsrfOrigin } from "@/lib/csrf"

/**
 * POST - Initiate account deletion
 * Sets deleted_at, schedules deletion for 30 days, disables account
 */
export async function POST(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 })
  }

  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { confirmUsername } = body

    // Fetch profile to verify username
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Verify username confirmation matches
    if (profile.username !== confirmUsername) {
      return NextResponse.json(
        { error: "Username confirmation does not match" },
        { status: 400 }
      )
    }

    // Calculate deletion date (30 days from now)
    const deletedAt = new Date()
    const deletionScheduledFor = new Date()
    deletionScheduledFor.setDate(deletionScheduledFor.getDate() + 30)

    // Fetch page to unpublish
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!pageError && page) {
      // Unpublish page immediately
      await supabase
        .from("pages")
        .update({ is_published: false })
        .eq("id", page.id)
    }

    // Mark account for deletion
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        deleted_at: deletedAt.toISOString(),
        deletion_scheduled_for: deletionScheduledFor.toISOString(),
        is_active: false,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Account deletion error:", updateError)
      return NextResponse.json(
        { error: "Failed to schedule account deletion" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deletionScheduledFor: deletionScheduledFor.toISOString(),
      message: "Account deletion scheduled. You have 30 days to recover your account by logging in.",
    })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deletion failed" },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Recover account during grace period
 * Clears deletion timestamps, reactivates account
 */
export async function PATCH(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: "CSRF validation failed" }, { status: 403 })
  }

  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if account is actually scheduled for deletion
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("deleted_at, deletion_scheduled_for")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (!profile.deleted_at || !profile.deletion_scheduled_for) {
      return NextResponse.json(
        { error: "Account is not scheduled for deletion" },
        { status: 400 }
      )
    }

    // Check if still within grace period
    const deletionDate = new Date(profile.deletion_scheduled_for)
    const now = new Date()

    if (now > deletionDate) {
      return NextResponse.json(
        { error: "Grace period has expired. Account cannot be recovered." },
        { status: 410 }
      )
    }

    // Recover account
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        deleted_at: null,
        deletion_scheduled_for: null,
        is_active: true,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Account recovery error:", updateError)
      return NextResponse.json(
        { error: "Failed to recover account" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Account recovered successfully. You can now continue using LinkLobby.",
    })
  } catch (error) {
    console.error("Account recovery error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recovery failed" },
      { status: 500 }
    )
  }
}
