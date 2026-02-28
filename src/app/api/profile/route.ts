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
  try {
    const supabase = await createClient()
    const { profile, user, error } = await fetchUserProfile(supabase)

    if (!user || error === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    if (error || !profile) {
      return NextResponse.json({ error: error || 'Profile not found' }, { status: 500 })
    }

    // Map database columns to frontend types
    return NextResponse.json({
      displayName: profile.display_name,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      avatarFeather: profile.avatar_feather ?? 0,
      avatarSize: profile.avatar_size ?? 80,
      avatarShape: profile.avatar_shape ?? 'circle',
      showAvatar: profile.show_avatar ?? true,
      showTitle: profile.show_title ?? true,
      showBio: profile.show_bio ?? true,
      titleSize: profile.title_size,
      showLogo: profile.show_logo ?? false,
      logoUrl: profile.logo_url,
      logoScale: profile.logo_scale ?? 100,
      profileLayout: profile.profile_layout,
      showSocialIcons: profile.show_social_icons,
      socialIcons: profile.social_icons || [],
      headerTextColor: profile.header_text_color,
      socialIconColor: profile.social_icon_color ?? null,
      titleFont: profile.title_font ?? null,
      bioFont: profile.bio_font ?? null,
    })
  } catch (err) {
    console.error('GET /api/profile error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
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
    avatar_shape: body.avatarShape,
    show_avatar: body.showAvatar,
    show_title: body.showTitle,
    show_bio: body.showBio,
    title_size: body.titleSize,
    show_logo: body.showLogo,
    logo_url: body.logoUrl,
    logo_scale: body.logoScale,
    profile_layout: body.profileLayout,
    show_social_icons: body.showSocialIcons,
    social_icons: body.socialIcons,
    header_text_color: body.headerTextColor,
    social_icon_color: body.socialIconColor,
    title_font: body.titleFont,
    bio_font: body.bioFont,
    updated_at: new Date().toISOString(),
  }

  let { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  // If new columns don't exist yet in schema cache, retry without them
  if (error?.message?.includes('avatar_shape') || error?.message?.includes('avatar_size') || error?.message?.includes('social_icon_color') || error?.message?.includes('title_font') || error?.message?.includes('bio_font')) {
    delete updateData.avatar_shape
    delete updateData.avatar_size
    delete updateData.social_icon_color
    delete updateData.title_font
    delete updateData.bio_font
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
