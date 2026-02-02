'use client'

import { useThemeStore } from '@/stores/theme-store'
import { MacOSCard } from './mac-os-card'
import { SystemSettingsCard } from './system-settings-card'
import { cn } from '@/lib/utils'
import type { CardType } from '@/types/card'

interface ThemedCardWrapperProps {
  children: React.ReactNode
  cardType: CardType
  className?: string
  content?: Record<string, unknown>
}

// Card types fully exempt from theming (no wrapper styling)
const EXEMPT_CARD_TYPES: CardType[] = ['game', 'gallery']

// Card types that skip Mac OS traffic lights but still get other theme styling
const SKIP_MACOS_CHROME: CardType[] = []

export function ThemedCardWrapper({ children, cardType, className, content }: ThemedCardWrapperProps) {
  const { themeId, style } = useThemeStore()
  const isTransparent = content?.transparentBackground === true

  // Exempt cards get minimal wrapper
  if (EXEMPT_CARD_TYPES.includes(cardType)) {
    // Gallery needs overflow visible for full-bleed effect
    const allowOverflow = cardType === 'gallery'
    return (
      <div className={cn(allowOverflow ? "overflow-visible" : "overflow-hidden", className)}>
        {children}
      </div>
    )
  }

  // Theme-specific wrappers
  switch (themeId) {
    case 'mac-os':
      // Mini cards skip Mac OS traffic lights, get simple bordered look
      if (SKIP_MACOS_CHROME.includes(cardType)) {
        return (
          <div
            className={cn(
              "overflow-hidden",
              !isTransparent && "bg-theme-card-bg",
              "border border-theme-border",
              style.shadowEnabled && "shadow-theme-card",
              className
            )}
            style={{ borderRadius: 'var(--theme-border-radius)' }}
          >
            {children}
          </div>
        )
      }
      return (
        <MacOSCard className={className} transparentBackground={isTransparent}>
          {children}
        </MacOSCard>
      )

    case 'system-settings':
      return (
        <SystemSettingsCard className={className} cardType={cardType} transparentBackground={isTransparent}>
          {children}
        </SystemSettingsCard>
      )

    case 'instagram-reels':
    default:
      // Standard themed card
      return (
        <div
          className={cn(
            "overflow-hidden",
            !isTransparent && "bg-theme-card-bg",
            "border border-theme-border",
            style.shadowEnabled && "shadow-theme-card",
            className
          )}
          style={{ borderRadius: 'var(--theme-border-radius)' }}
        >
          {children}
        </div>
      )
  }
}
