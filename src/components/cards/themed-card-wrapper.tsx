'use client'

import { useThemeStore } from '@/stores/theme-store'
import { MacOSCard } from './mac-os-card'
import { GlassCard } from './glass-card'
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

  // Exempt cards get standard wrapper
  if (EXEMPT_CARD_TYPES.includes(cardType)) {
    return (
      <div className={cn("overflow-hidden", className)}>
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

    case 'sleek-modern':
      return (
        <GlassCard className={className}>
          {children}
        </GlassCard>
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
