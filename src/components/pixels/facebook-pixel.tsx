'use client'

import { useEffect } from 'react'

// TypeScript declarations for Facebook Pixel
declare global {
  interface Window {
    fbq: (
      command: 'init' | 'track' | 'trackCustom',
      eventNameOrPixelId: string,
      params?: Record<string, unknown>
    ) => void
    _fbq: typeof window.fbq
  }
}

interface FacebookPixelProps {
  pixelId: string
}

/**
 * FacebookPixel - Client-side Facebook Pixel integration
 *
 * Features:
 * - Injects Facebook Pixel base code on mount
 * - Tracks PageView event automatically
 * - Exports trackFbEvent for custom event tracking
 * - Sends dual tracking: browser pixel + server-side CAPI
 * - Event ID deduplication prevents double-counting
 *
 * Usage:
 * ```tsx
 * <FacebookPixel pixelId="123456789" />
 * ```
 *
 * Custom events:
 * ```tsx
 * import { trackFbEvent } from '@/components/pixels/facebook-pixel'
 * trackFbEvent('ViewContent', { content_ids: ['123'] }, 'unique-event-id')
 * ```
 */
export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  useEffect(() => {
    if (!pixelId || typeof window === 'undefined') return

    // Inject Facebook Pixel base code
    // Standard fbq initialization pattern from Facebook docs
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `
    document.head.appendChild(script)

    // Initialize pixel with ID
    window.fbq('init', pixelId)

    // Track initial PageView
    window.fbq('track', 'PageView')

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script)
    }
  }, [pixelId])

  // Component renders nothing - script injection only
  return null
}

/**
 * trackFbEvent - Track custom Facebook Pixel event
 *
 * Sends event to both:
 * 1. Browser pixel (fbq) - client-side tracking
 * 2. Conversions API (CAPI) - server-side tracking
 *
 * Event ID ensures deduplication when both events arrive
 *
 * @param eventName - Facebook event name (e.g., 'ViewContent', 'AddToCart')
 * @param params - Event parameters (content_ids, value, currency, etc.)
 * @param eventId - Unique event ID for deduplication
 * @param pixelId - Artist's Facebook Pixel ID
 */
export async function trackFbEvent(
  eventName: string,
  params: Record<string, unknown>,
  eventId: string,
  pixelId: string
): Promise<void> {
  // Track client-side via fbq
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params)
  }

  // Track server-side via CAPI
  try {
    // Get Facebook Click ID (fbc) and Browser ID (fbp) from cookies if present
    const fbc = getCookie('_fbc')
    const fbp = getCookie('_fbp')

    await fetch('/api/pixels/facebook-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pixel_id: pixelId,
        event_name: eventName,
        event_id: eventId,
        custom_data: params,
        user_data: {
          client_user_agent: navigator.userAgent,
          fbc: fbc || undefined,
          fbp: fbp || undefined,
        },
      }),
    })
  } catch (error) {
    // Silently fail - tracking errors shouldn't break user experience
    console.error('Facebook CAPI error:', error)
  }
}

/**
 * getCookie - Extract cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }

  return null
}
