// GET /api/profile - fetch profile for current user
// POST /api/profile - save profile for current user

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { validateCsrfOrigin } from "@/lib/csrf"
import { sanitizeText } from "@/lib/sanitize"
import { generalApiRatelimit, checkRateLimit } from "@/lib/ratelimit"

async function fetchUserProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { profile: null, user: null, error: 'Unauthorized' }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { profile: null, user, error: error.message }
  return { profile, user, error: null }
}

export async function GET() {
  const supabase = await createClient()
  const { profile, user, error } = await fetchUserProfile(supabase)

  if (!user || error === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await checkRateLimit(generalApiRatelimit, user.id)
  if (!rl.allowed) return rl.response!

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  // Map database columns to frontend types
  return NextResponse.json({
    displayName: profile.display_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    avatarFeather: profile.avatar_feather ?? 0,
    avatarSize: profile.avatar_size ?? 80,
    showAvatar: profile.show_avatar ?? true,
    showTitle: profile.show_title ?? true,
    titleSize: profile.title_size,
    showLogo: profile.show_logo ?? false,
    logoUrl: profile.logo_url,
    logoScale: profile.logo_scale ?? 100,
    profileLayout: profile.profile_layout,
    showSocialIcons: profile.show_social_icons,
    socialIcons: profile.social_icons || [],
    headerTextColor: profile.header_text_color,
    socialIconColor: profile.social_icon_color ?? null,
  })
}

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

  // Map frontend types to database columns, sanitizing user-generated text
  const updateData: Record<string, unknown> = {
    display_name: body.displayName ? sanitizeText(body.displayName) : body.displayName,
    bio: body.bio ? sanitizeText(body.bio) : body.bio,
    avatar_url: body.avatarUrl,
    avatar_feather: body.avatarFeather,
    avatar_size: body.avatarSize,
    show_avatar: body.showAvatar,
    show_title: body.showTitle,
    title_size: body.titleSize,
    show_logo: body.showLogo,
    logo_url: body.logoUrl,
    logo_scale: body.logoScale,
    profile_layout: body.profileLayout,
    show_social_icons: body.showSocialIcons,
    social_icons: body.socialIcons,
    header_text_color: body.headerTextColor,
    social_icon_color: body.socialIconColor,
    updated_at: new Date().toISOString(),
  }

  let { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  // If social_icon_color column doesn't exist yet, retry without it
  if (error?.message?.includes('social_icon_color')) {
    delete updateData.social_icon_color
    const retry = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
    error = retry.error
  }

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
