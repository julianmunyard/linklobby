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
}

// Card types exempt from theming (per CONTEXT.md)
const EXEMPT_CARD_TYPES: CardType[] = ['game', 'gallery']

export function ThemedCardWrapper({ children, cardType, className }: ThemedCardWrapperProps) {
  const { themeId, style } = useThemeStore()

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
      return (
        <MacOSCard className={className}>
          {children}
        </MacOSCard>
      )

    case 'system-settings':
      return (
        <SystemSettingsCard className={className} cardType={cardType}>
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
            "bg-theme-card-bg border border-theme-border",
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
