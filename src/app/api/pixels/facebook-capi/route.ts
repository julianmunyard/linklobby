import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/pixels/facebook-capi
 *
 * Facebook Conversions API (CAPI) endpoint for server-side event tracking
 *
 * Benefits:
 * - iOS 14+ tracking accuracy (bypasses ATT restrictions)
 * - Server-side backup when client-side pixel is blocked
 * - Event deduplication via event_id
 *
 * Flow:
 * 1. Client sends event via trackFbEvent()
 * 2. Server forwards to Facebook Graph API
 * 3. Facebook deduplicates with client-side pixel events
 *
 * Required env var: FACEBOOK_CAPI_TOKEN
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pixel_id, event_name, event_id, custom_data, user_data } = body

    // Validate required fields
    if (!pixel_id || !event_name || !event_id) {
      return NextResponse.json(
        { error: 'Missing required fields: pixel_id, event_name, event_id' },
        { status: 400 }
      )
    }

    // Check for CAPI access token
    const accessToken = process.env.FACEBOOK_CAPI_TOKEN

    if (!accessToken) {
      // No token configured - skip CAPI (client-side pixel will still track)
      return NextResponse.json({
        success: false,
        skipped: true,
        message: 'FACEBOOK_CAPI_TOKEN not configured',
      })
    }

    // Get real client IP from x-forwarded-for header
    const forwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '0.0.0.0'

    // Get user agent
    const userAgent = request.headers.get('user-agent') || ''

    // Get referer for event_source_url
    const referer = request.headers.get('referer') || ''

    // Construct CAPI payload
    const capiPayload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000), // Unix timestamp
          event_id,
          event_source_url: referer,
          action_source: 'website',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: userAgent,
            ...(user_data?.fbc && { fbc: user_data.fbc }),
            ...(user_data?.fbp && { fbp: user_data.fbp }),
          },
          custom_data: custom_data || {},
        },
      ],
    }

    // Send to Facebook Graph API
    const fbResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(capiPayload),
      }
    )

    const fbData = await fbResponse.json()

    if (!fbResponse.ok) {
      console.error('Facebook CAPI error:', fbData)
      return NextResponse.json(
        {
          success: false,
          error: fbData.error?.message || 'Facebook API error',
        },
        { status: fbResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      facebook_response: fbData,
    })
  } catch (error) {
    console.error('CAPI endpoint error:', error)

    // Return 200 with error flag - tracking errors shouldn't break user experience
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
