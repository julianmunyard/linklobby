// GET /api/theme - fetch theme settings for current user's page
// POST /api/theme - save theme settings for current user's page

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { ThemeState } from "@/types/theme"
import { validateCsrfOrigin } from "@/lib/csrf"
import { generalApiRatelimit, checkRateLimit } from "@/lib/ratelimit"

/**
 * GET /api/theme
 * Fetches theme_settings from the user's page
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    // Get user's page with theme settings
    const { data: page, error } = await supabase
      .from('pages')
      .select('id, theme_settings')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // If no page exists, return null (not an error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ theme: null })
      }
      console.error('Theme fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      theme: page.theme_settings,
      pageId: page.id
    })
  } catch (err) {
    console.error('GET /api/theme error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/theme
 * Saves theme_settings to the user's page
 */
export async function POST(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await checkRateLimit(generalApiRatelimit, user.id)
  if (!rl.allowed) return rl.response!

  const body = await request.json()
  const themeSettings: ThemeState = body.theme

  // Validate theme structure (basic check)
  if (!themeSettings || typeof themeSettings !== 'object') {
    return NextResponse.json({ error: 'Invalid theme data' }, { status: 400 })
  }

  // Update user's page with new theme settings
  const { error } = await supabase
    .from('pages')
    .update({
      theme_settings: themeSettings,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Theme update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
