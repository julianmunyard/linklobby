import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/pixels/test-event
 *
 * Test endpoint for verifying pixel configuration
 *
 * Supports:
 * - Facebook Pixel: Sends test PageView via CAPI
 * - Google Analytics: Returns instructions to check Realtime report
 *
 * Usage:
 * ```ts
 * fetch('/api/pixels/test-event', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     pixelType: 'facebook',
 *     pixelId: '123456789'
 *   })
 * })
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pixelType, pixelId } = body

    if (!pixelType || !pixelId) {
      return NextResponse.json(
        { error: 'Missing required fields: pixelType, pixelId' },
        { status: 400 }
      )
    }

    if (pixelType === 'facebook') {
      // Send test PageView event via CAPI
      const accessToken = process.env.FACEBOOK_CAPI_TOKEN

      if (!accessToken) {
        return NextResponse.json({
          success: false,
          message: 'FACEBOOK_CAPI_TOKEN not configured. Server-side tracking unavailable.',
        })
      }

      // Generate unique test event ID
      const testEventId = `test_${Date.now()}`

      // Construct test event payload
      const testPayload = {
        data: [
          {
            event_name: 'PageView',
            event_time: Math.floor(Date.now() / 1000),
            event_id: testEventId,
            action_source: 'website',
            user_data: {
              client_ip_address: '0.0.0.0', // Test event
              client_user_agent: 'LinkLobby-Test-Agent',
            },
          },
        ],
        test_event_code: 'TEST12345', // Facebook test event code
      }

      // Send to Facebook Graph API
      const fbResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testPayload),
        }
      )

      const fbData = await fbResponse.json()

      if (!fbResponse.ok) {
        console.error('Facebook test event error:', fbData)
        return NextResponse.json({
          success: false,
          message: `Facebook API error: ${fbData.error?.message || 'Unknown error'}`,
        })
      }

      return NextResponse.json({
        success: true,
        message:
          'Test event sent! Check Facebook Events Manager → Test Events tab to verify.',
        facebook_response: fbData,
      })
    }

    if (pixelType === 'google') {
      // Google Analytics doesn't support programmatic test verification
      // Return instructions for manual verification
      return NextResponse.json({
        success: true,
        message: `Test event ready! Visit your GA4 property and check:\n\n1. Go to Reports → Realtime\n2. Look for active users in the last 30 minutes\n3. Check event count for page_view events\n\nMeasurement ID: ${pixelId}`,
      })
    }

    return NextResponse.json(
      { error: `Unknown pixel type: ${pixelType}` },
      { status: 400 }
    )
  } catch (error) {
    console.error('Test event endpoint error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
