'use client'

import { useEffect } from 'react'
import Script from 'next/script'

// TypeScript declarations for Google Analytics
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

/**
 * GoogleAnalytics - Client-side GA4 integration
 *
 * Features:
 * - Injects Google Analytics gtag.js script
 * - Initializes GA4 with measurement ID
 * - Tracks page_view automatically
 * - Exports trackGaEvent for custom event tracking
 *
 * Usage:
 * ```tsx
 * <GoogleAnalytics measurementId="G-XXXXXXXXXX" />
 * ```
 *
 * Custom events:
 * ```tsx
 * import { trackGaEvent } from '@/components/pixels/google-analytics'
 * trackGaEvent('card_click', { card_id: '123' })
 * ```
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []

    // Define gtag function
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }

    window.gtag = gtag

    // Initialize GA4
    gtag('js', new Date())
    gtag('config', measurementId)
  }, [measurementId])

  if (!measurementId) return null

  return (
    <>
      {/* Load gtag.js script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
    </>
  )
}

/**
 * trackGaEvent - Track custom Google Analytics event
 *
 * @param eventName - GA4 event name (e.g., 'card_click', 'purchase')
 * @param params - Event parameters
 */
export function trackGaEvent(
  eventName: string,
  params: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}
