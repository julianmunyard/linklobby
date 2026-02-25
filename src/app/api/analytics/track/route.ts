import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createVisitorHash } from '@/lib/analytics/visitor-hash'
import { analyticsRatelimit, checkRateLimit, getClientIp } from '@/lib/ratelimit'

/**
 * Analytics Tracking API
 *
 * POST /api/analytics/track
 *
 * Accepts analytics events from public pages and stores them in the database.
 *
 * Event types:
 * - page_view: Visitor loads a public page
 * - card_click: Visitor clicks a card
 * - interaction: Visitor plays game or views gallery image
 *
 * Error handling: Always returns 200 even on errors to avoid breaking user experience.
 * Errors are logged but swallowed gracefully.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP — this is a public endpoint
    const ip = getClientIp(request)
    const rl = await checkRateLimit(analyticsRatelimit, ip)
    if (!rl.allowed) return rl.response!

    const body = await request.json()
    const { type } = body

    const supabase = await createClient()

    // Extract visitor information for hashing
    const userAgent = request.headers.get('user-agent') || null
    const visitorHash = createVisitorHash(ip !== '127.0.0.1' ? ip : null, userAgent)

    // Handle different event types
    if (type === 'page_view') {
      const { pageId, pathname } = body

      if (!pageId || !pathname) {
        console.error('Missing required fields for page_view:', body)
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
      }

      // Insert page view
      const { error } = await supabase
        .from('analytics_page_views')
        .insert({
          time: new Date().toISOString(),
          page_id: pageId,
          visitor_hash: visitorHash,
          pathname,
          referrer: request.headers.get('referer'),
          user_agent: userAgent
        })

      if (error) {
        console.error('Failed to insert page view:', error)
        // Return success anyway - tracking errors shouldn't break the page
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ success: true })
    }

    if (type === 'card_click') {
      const { cardId, pageId } = body

      if (!cardId || !pageId) {
        console.error('Missing required fields for card_click:', body)
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
      }

      // Insert card click
      const { error } = await supabase
        .from('analytics_card_clicks')
        .insert({
          time: new Date().toISOString(),
          card_id: cardId,
          page_id: pageId,
          visitor_hash: visitorHash
        })

      if (error) {
        console.error('Failed to insert card click:', error)
        // Return success anyway - tracking errors shouldn't break the page
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ success: true })
    }

    if (type === 'interaction') {
      const { cardId, pageId, interactionType } = body

      if (!cardId || !pageId || !interactionType) {
        console.error('Missing required fields for interaction:', body)
        return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
      }

      // Validate interaction type
      if (interactionType !== 'game_play' && interactionType !== 'gallery_view' && interactionType !== 'audio_play') {
        console.error('Invalid interaction type:', interactionType)
        return NextResponse.json({ success: false, error: 'Invalid interaction type' }, { status: 400 })
      }

      // Insert interaction
      const { error } = await supabase
        .from('analytics_interactions')
        .insert({
          time: new Date().toISOString(),
          card_id: cardId,
          page_id: pageId,
          visitor_hash: visitorHash,
          interaction_type: interactionType
        })

      if (error) {
        console.error('Failed to insert interaction:', error)
        // Return success anyway - tracking errors shouldn't break the page
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ success: true })
    }

    // Unknown event type
    console.error('Unknown event type:', type)
    return NextResponse.json({ success: false, error: 'Unknown event type' }, { status: 400 })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Always return success - tracking should never break user experience
    return NextResponse.json({ success: true })
  }
}
