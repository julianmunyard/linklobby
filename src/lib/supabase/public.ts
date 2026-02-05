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
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      username,
      display_name,
      bio,
      avatar_url,
      avatar_feather,
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
    `)
    .eq('username', username.toLowerCase())
    .eq('pages.is_published', true)
    .single()

  // Return null for 404 cases (user not found, no page, or unpublished)
  if (profileError || !profile) {
    return null
  }

  // Extract page from nested structure
  const pageData = Array.isArray(profile.pages) ? profile.pages[0] : profile.pages
  if (!pageData) {
    return null
  }

  const page: Page = {
    id: pageData.id,
    user_id: pageData.user_id,
    is_published: pageData.is_published,
    theme_settings: pageData.theme_settings,
    created_at: pageData.created_at,
    updated_at: pageData.updated_at,
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
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      avatar_feather: profile.avatar_feather ?? 0,
      show_avatar: profile.show_avatar ?? true,
      show_title: profile.show_title ?? true,
      title_size: profile.title_size as 'small' | 'large',
      show_logo: profile.show_logo ?? false,
      logo_url: profile.logo_url,
      logo_scale: profile.logo_scale ?? 100,
      profile_layout: profile.profile_layout as 'classic' | 'hero',
      show_social_icons: profile.show_social_icons ?? true,
      social_icons: typeof profile.social_icons === 'string'
        ? profile.social_icons
        : JSON.stringify(profile.social_icons || []),
      header_text_color: profile.header_text_color,
    },
    page,
    cards,
  }
}
