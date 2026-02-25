import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generalApiRatelimit, checkRateLimit } from '@/lib/ratelimit'

/**
 * Analytics Stats API
 *
 * GET /api/analytics/stats?pageId=xxx&days=7
 *
 * Returns aggregated analytics data for a page:
 * - Unique visitors (COUNT DISTINCT visitor_hash)
 * - Total page views (COUNT)
 * - Per-card stats with CTR (click-through rate)
 * - Per-card interaction stats (game plays, gallery views)
 * - Time-series data for charting
 *
 * Authentication: Requires authenticated user who owns the page
 *
 * Query params:
 * - pageId: Page UUID (required)
 * - days: Time period (7, 30, or 0 for all time, default 7)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')
    const days = parseInt(searchParams.get('days') || '7')

    if (!pageId) {
      return NextResponse.json({ error: 'Missing pageId parameter' }, { status: 400 })
    }

    // Verify page ownership
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('id, user_id')
      .eq('id', pageId)
      .single()

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    if (page.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Calculate time range
    const startDate = days === 0
      ? new Date(0).toISOString() // All time
      : new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // ========================================================================
    // 1. Unique Visitors and Total Views
    // ========================================================================

    const { data: pageViewsData, error: viewsError } = await supabase
      .from('analytics_page_views')
      .select('visitor_hash, time')
      .eq('page_id', pageId)
      .gte('time', startDate)

    if (viewsError) {
      console.error('Error fetching page views:', viewsError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    const uniqueVisitors = new Set(pageViewsData?.map(v => v.visitor_hash)).size
    const totalViews = pageViewsData?.length || 0

    // ========================================================================
    // 2. Per-Card Stats (clicks, CTR, interactions)
    // ========================================================================

    // Fetch all cards for this page
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('id, title, card_type, page_id')
      .eq('page_id', pageId)

    if (cardsError) {
      console.error('Error fetching cards:', cardsError)
      return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
    }

    // Fetch card clicks
    const { data: clicksData, error: clicksError } = await supabase
      .from('analytics_card_clicks')
      .select('card_id, visitor_hash')
      .eq('page_id', pageId)
      .gte('time', startDate)

    if (clicksError) {
      console.error('Error fetching card clicks:', clicksError)
      return NextResponse.json({ error: 'Failed to fetch clicks' }, { status: 500 })
    }

    // Fetch interactions
    const { data: interactionsData, error: interactionsError } = await supabase
      .from('analytics_interactions')
      .select('card_id, interaction_type')
      .eq('page_id', pageId)
      .gte('time', startDate)

    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError)
      return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 })
    }

    // Build per-card stats
    const cardStats = (cardsData || []).map(card => {
      // Count unique clickers for this card
      const cardClicks = clicksData?.filter(c => c.card_id === card.id) || []
      const clicks = new Set(cardClicks.map(c => c.visitor_hash)).size

      // Calculate CTR = (unique clickers / unique visitors) * 100
      const ctr = uniqueVisitors > 0
        ? Number(((clicks / uniqueVisitors) * 100).toFixed(2))
        : 0

      // Count interactions for this card
      const cardInteractions = interactionsData?.filter(i => i.card_id === card.id) || []
      const gamePlays = cardInteractions.filter(i => i.interaction_type === 'game_play').length
      const galleryViews = cardInteractions.filter(i => i.interaction_type === 'gallery_view').length

      return {
        id: card.id,
        title: card.title,
        cardType: card.card_type,
        clicks,
        ctr,
        // Only include interaction stats if they exist
        ...(gamePlays > 0 && { gamePlays }),
        ...(galleryViews > 0 && { galleryViews })
      }
    })

    // Sort by clicks descending (leaderboard)
    cardStats.sort((a, b) => b.clicks - a.clicks)

    // ========================================================================
    // 3. Time-Series Data (for charting)
    // ========================================================================

    // Group page views by day
    const timeSeriesMap = new Map<string, { views: number; visitors: Set<string> }>()

    pageViewsData?.forEach(view => {
      // Extract date without time (YYYY-MM-DD)
      const date = view.time ? new Date(view.time).toISOString().split('T')[0] : ''

      if (!timeSeriesMap.has(date)) {
        timeSeriesMap.set(date, { views: 0, visitors: new Set() })
      }

      const entry = timeSeriesMap.get(date)!
      entry.views++
      entry.visitors.add(view.visitor_hash)
    })

    // Convert to array format for charts
    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([date, data]) => ({
        date,
        views: data.views,
        visitors: data.visitors.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // ========================================================================
    // Return Response
    // ========================================================================

    return NextResponse.json({
      uniqueVisitors,
      totalViews,
      cardStats,
      timeSeries
    })

  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
