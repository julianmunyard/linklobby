'use client'

import { useState, useEffect } from 'react'
import { FacebookPixel, trackFbEvent } from './facebook-pixel'
import { GoogleAnalytics, trackGaEvent } from './google-analytics'

interface PixelLoaderProps {
  facebookPixelId?: string
  gaMeasurementId?: string
  pageId: string
  cards: Array<{ id: string }>
}

/**
 * PixelLoader - Conditional pixel loading with cookie consent gating
 *
 * Features:
 * - Checks for consent on mount (linklobby-consent cookie)
 * - Listens for consent-granted event from CookieConsentBanner
 * - NEVER renders pixels before consent (GDPR compliant)
 * - Wires card click tracking to both Facebook and GA4
 *
 * Flow:
 * 1. User scrolls 100px → CookieConsentBanner appears
 * 2. User accepts cookies → consent-granted event fires
 * 3. PixelLoader sets hasConsent = true
 * 4. Pixels load and start tracking
 *
 * Usage:
 * ```tsx
 * <PixelLoader
 *   facebookPixelId="123456789"
 *   gaMeasurementId="G-XXXXXXXXXX"
 *   pageId={page.id}
 *   cards={cards}
 * />
 * ```
 */
export function PixelLoader({
  facebookPixelId,
  gaMeasurementId,
  pageId,
  cards,
}: PixelLoaderProps) {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Check if consent already given (cookie exists)
    const checkConsent = () => {
      if (typeof document === 'undefined') return false

      // Check for linklobby-consent cookie
      const cookies = document.cookie.split(';')
      const consentCookie = cookies.find((c) =>
        c.trim().startsWith('linklobby-consent=')
      )

      if (consentCookie) {
        const value = consentCookie.split('=')[1]
        return value === 'true'
      }

      return false
    }

    // Check on mount
    if (checkConsent()) {
      setHasConsent(true)
    }

    // Listen for consent-granted event
    const handleConsentGranted = () => {
      setHasConsent(true)
    }

    window.addEventListener('consent-granted', handleConsentGranted)

    return () => {
      window.removeEventListener('consent-granted', handleConsentGranted)
    }
  }, [])

  // Wire card click tracking
  useEffect(() => {
    if (!hasConsent) return

    const handleCardClick = (event: Event) => {
      const target = event.target as HTMLElement
      const cardElement = target.closest('[data-card-id]')

      if (cardElement) {
        const cardId = cardElement.getAttribute('data-card-id')

        if (cardId) {
          const eventId = `click_${cardId}_${Date.now()}`

          // Track on Facebook Pixel
          if (facebookPixelId) {
            trackFbEvent(
              'ViewContent',
              {
                content_ids: [cardId],
                content_type: 'card',
              },
              eventId,
              facebookPixelId
            )
          }

          // Track on Google Analytics
          if (gaMeasurementId) {
            trackGaEvent('card_click', {
              card_id: cardId,
              page_id: pageId,
            })
          }
        }
      }
    }

    // Add click listener to document
    document.addEventListener('click', handleCardClick)

    return () => {
      document.removeEventListener('click', handleCardClick)
    }
  }, [hasConsent, facebookPixelId, gaMeasurementId, pageId])

  // CRITICAL: Never render pixels before consent
  if (!hasConsent) {
    return null
  }

  return (
    <>
      {facebookPixelId && <FacebookPixel pixelId={facebookPixelId} />}
      {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
    </>
  )
}
