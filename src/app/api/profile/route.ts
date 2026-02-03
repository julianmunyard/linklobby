// GET /api/profile - fetch profile for current user
// POST /api/profile - save profile for current user

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function fetchUserProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { profile: null, error: 'Unauthorized' }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { profile: null, error: error.message }
  return { profile, error: null }
}

export async function GET() {
  const supabase = await createClient()
  const { profile, error } = await fetchUserProfile(supabase)

  if (error) {
    return NextResponse.json({ error }, { status: error === 'Unauthorized' ? 401 : 500 })
  }

  // Map database columns to frontend types
  return NextResponse.json({
    displayName: profile.display_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    avatarFeather: profile.avatar_feather ?? 0,
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
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Map frontend types to database columns
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: body.displayName,
      bio: body.bio,
      avatar_url: body.avatarUrl,
      avatar_feather: body.avatarFeather,
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
