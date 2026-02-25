'use client'

import { useEffect, useState } from 'react'
import CookieConsent from 'react-cookie-consent'

interface ThemeColors {
  background: string
  text: string
  accent: string
  border: string
}

interface CookieConsentBannerProps {
  themeColors?: ThemeColors
}

/**
 * CookieConsentBanner - GDPR-compliant cookie consent banner
 *
 * Features:
 * - Theme-aware styling (reads CSS custom properties from theme)
 * - Equal prominence accept/reject buttons
 * - Shows after user scrolls 100px
 * - Persists consent state in cookie
 * - Dispatches custom events for pixel components to listen to
 *
 * Custom events:
 * - 'consent-granted': User accepted all cookies
 * - 'consent-declined': User rejected all cookies
 */
export function CookieConsentBanner({ themeColors }: CookieConsentBannerProps) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [colors, setColors] = useState<ThemeColors>({
    background: '#1a1a1a',
    text: '#ffffff',
    accent: '#3b82f6',
    border: '#404040',
  })

  // Read theme CSS custom properties on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // If theme colors provided, use them
    if (themeColors) {
      setColors(themeColors)
      return
    }

    // Otherwise read from CSS custom properties
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    const background = computedStyle.getPropertyValue('--theme-background').trim()
    const text = computedStyle.getPropertyValue('--theme-text').trim()
    const accent = computedStyle.getPropertyValue('--theme-accent').trim()
    const border = computedStyle.getPropertyValue('--theme-border').trim()

    setColors({
      background: background || '#1a1a1a',
      text: text || '#ffffff',
      accent: accent || '#3b82f6',
      border: border || '#404040',
    })
  }, [themeColors])

  // Track scroll to show banner after 100px
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle consent granted
  const handleAccept = () => {
    if (typeof window === 'undefined') return

    // Dispatch custom event for pixel components
    const event = new CustomEvent('consent-granted', {
      detail: { timestamp: new Date().toISOString() },
    })
    window.dispatchEvent(event)
  }

  // Handle consent declined
  const handleDecline = () => {
    if (typeof window === 'undefined') return

    // Dispatch custom event
    const event = new CustomEvent('consent-declined', {
      detail: { timestamp: new Date().toISOString() },
    })
    window.dispatchEvent(event)
  }

  // Don't show banner until user has scrolled
  if (!hasScrolled) {
    return null
  }

  return (
    <CookieConsent
      location="none"
      cookieName="linklobby-consent"
      expires={365}
      enableDeclineButton
      onAccept={handleAccept}
      onDecline={handleDecline}
      buttonText="Accept All"
      declineButtonText="Reject All"
      // Custom styling to match theme
      containerClasses="cookie-consent-container"
      contentClasses="cookie-consent-content"
      buttonClasses="cookie-consent-accept-button"
      declineButtonClasses="cookie-consent-decline-button"
      style={{
        // Container styling - floating card in bottom-right
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        left: 'auto',
        width: 'auto',
        maxWidth: '380px',
        background: colors.background,
        color: colors.text,
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${colors.border}`,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
      buttonStyle={{
        // Accept button - primary style with accent color
        background: colors.accent,
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        flex: '1',
        minWidth: '120px',
      }}
      declineButtonStyle={{
        // Decline button - equal prominence with border
        background: 'transparent',
        color: colors.text,
        fontSize: '14px',
        fontWeight: '600',
        padding: '0.625rem 1.25rem',
        borderRadius: '8px',
        border: `1.5px solid ${colors.border}`,
        cursor: 'pointer',
        flex: '1',
        minWidth: '120px',
      }}
      buttonWrapperClasses="cookie-consent-button-wrapper"
    >
      <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
        We use cookies to help analyze page traffic. You can accept or reject all cookies.
      </div>
    </CookieConsent>
  )
}
