// src/lib/supabase/public.ts
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { PublicPageData, Page } from '@/types/page'
import type { Card, CardType, CardSize, HorizontalPosition } from '@/types/card'
import { POSITION_REVERSE } from '@/types/card'

// Helper to migrate legacy size values
function mapLegacySize(size: string | null | undefined): CardSize {
  if (size === 'large') return 'big'
  if (size === 'small' || size === 'medium') return 'small'
  return 'big' // Default to big
}

/**
 * Fetch complete public page data for a given username
 *
 * Returns null if:
 * - Username doesn't exist
 * - Page doesn't exist for that user
 * - Page is not published (is_published = false)
 *
 * @param username - The username to fetch (case-insensitive)
 * @returns PublicPageData or null
 */
export async function fetchPublicPageData(username: string): Promise<PublicPageData | null> {
  // Opt out of Next.js data cache - always fetch fresh data
  noStore()

  const supabase = await createClient()

  // Fetch profile, page, and cards in single query
  // Using !inner join to require pages table relationship (filters out users without pages)
  // Try with social_icon_color first, fall back without it if column doesn't exist
  let profile: Record<string, unknown> | null = null

  const selectWithColor = `
      username,
      display_name,
      bio,
      avatar_url,
      avatar_feather,
      avatar_size,
      show_avatar,
      show_title,
      title_size,
      show_logo,
      logo_url,
      logo_scale,
      profile_layout,
      show_social_icons,
      social_icons,
      header_text_color,
      social_icon_color,
      pages!inner (
        id,
        user_id,
        is_published,
        theme_settings,
        created_at,
        updated_at
      )
  `

  const selectWithoutColor = `
      username,
      display_name,
      bio,
      avatar_url,
      avatar_feather,
      avatar_size,
      show_avatar,
      show_title,
      title_size,
      show_logo,
      logo_url,
      logo_scale,
      profile_layout,
      show_social_icons,
      social_icons,
      header_text_color,
      pages!inner (
        id,
        user_id,
        is_published,
        theme_settings,
        created_at,
        updated_at
      )
  `

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select(selectWithColor)
    .eq('username', username.toLowerCase())
    .eq('pages.is_published', true)
    .single()

  if (profileError?.message?.includes('social_icon_color')) {
    // Column doesn't exist yet - retry without it
    const { data: fallback, error: fallbackError } = await supabase
      .from('profiles')
      .select(selectWithoutColor)
      .eq('username', username.toLowerCase())
      .eq('pages.is_published', true)
      .single()

    if (fallbackError || !fallback) return null
    profile = fallback as Record<string, unknown>
  } else if (profileError || !data) {
    return null
  } else {
    profile = data as Record<string, unknown>
  }

  // Extract page from nested structure
  const pagesRaw = profile.pages as Record<string, unknown>[] | Record<string, unknown> | null
  const pageData = Array.isArray(pagesRaw) ? pagesRaw[0] : pagesRaw
  if (!pageData) {
    return null
  }

  const page: Page = {
    id: pageData.id as string,
    user_id: pageData.user_id as string,
    is_published: pageData.is_published as boolean,
    theme_settings: pageData.theme_settings as Page['theme_settings'],
    created_at: pageData.created_at as string,
    updated_at: pageData.updated_at as string,
  }

  // Fetch cards separately (cleaner than nested select)
  // NOTE: We fetch without DB-level ordering and sort in JavaScript instead.
  // This ensures the same lexicographic string comparison as the preview,
  // avoiding collation mismatches between PostgreSQL locale sorting and JS.
  const { data: cardsData, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .eq('page_id', page.id)

  if (cardsError) {
    console.error('Error fetching cards:', cardsError)
    return null
  }

  // Map database rows to Card type
  const mappedCards: Card[] = (cardsData || []).map((row) => ({
    id: row.id,
    page_id: row.page_id,
    card_type: row.card_type as CardType,
    title: row.title,
    description: row.description,
    url: row.url,
    content: (row.content as Record<string, unknown>) || {},
    size: mapLegacySize(row.size),
    position: POSITION_REVERSE[(row.position_x as number) ?? 0] || 'left',
    sortKey: row.sort_key,
    is_visible: row.is_visible,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }))

  // Sort cards by sortKey using JavaScript's lexicographic comparison
  // This matches exactly how the preview sorts cards, avoiding collation issues
  const allCards = [...mappedCards].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  )

  // Filter cards by visibility and schedule
  const now = new Date().toISOString()
  const cards = allCards.filter(card => {
    // Must be visible
    if (!card.is_visible) return false

    const content = card.content as Record<string, unknown>
    const publishAt = content.publishAt as string | undefined
    const expireAt = content.expireAt as string | undefined

    // Check publish date - if set and in future, hide
    if (publishAt && publishAt > now) return false

    // Check expiry date - if set and in past, hide
    if (expireAt && expireAt < now) return false

    // Check release cards with hide action - if release date passed and action is 'hide', hide the card
    if (card.card_type === 'release') {
      const releaseDate = content.releaseDate as string | undefined
      const afterCountdownAction = content.afterCountdownAction as string | undefined
      if (releaseDate && afterCountdownAction === 'hide' && releaseDate <= now) {
        return false
      }
    }

    return true
  })

  return {
    profile: {
      username: profile.username as string,
      display_name: profile.display_name as string | null,
      bio: profile.bio as string | null,
      avatar_url: profile.avatar_url as string | null,
      avatar_feather: (profile.avatar_feather as number) ?? 0,
      avatar_size: (profile.avatar_size as number) ?? 80,
      show_avatar: (profile.show_avatar as boolean) ?? true,
      show_title: (profile.show_title as boolean) ?? true,
      title_size: profile.title_size as 'small' | 'large',
      show_logo: (profile.show_logo as boolean) ?? false,
      logo_url: profile.logo_url as string | null,
      logo_scale: (profile.logo_scale as number) ?? 100,
      profile_layout: profile.profile_layout as 'classic' | 'hero',
      show_social_icons: (profile.show_social_icons as boolean) ?? true,
      social_icons: typeof profile.social_icons === 'string'
        ? profile.social_icons
        : JSON.stringify(profile.social_icons || []),
      header_text_color: profile.header_text_color as string | null,
      social_icon_color: (profile.social_icon_color as string) ?? null,
    },
    page,
    cards,
  }
}
