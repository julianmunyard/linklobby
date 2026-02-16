'use client'

import { useThemeStore } from '@/stores/theme-store'
import { SystemSettingsCard } from './system-settings-card'
import { cn } from '@/lib/utils'
import type { CardType } from '@/types/card'

interface ThemedCardWrapperProps {
  children: React.ReactNode
  cardType: CardType
  className?: string
  content?: Record<string, unknown>
  themeIdOverride?: string
}

// Card types fully exempt from theming (no wrapper styling)
const EXEMPT_CARD_TYPES: CardType[] = ['game']


export function ThemedCardWrapper({ children, cardType, className, content, themeIdOverride }: ThemedCardWrapperProps) {
  const { themeId: storeThemeId, style } = useThemeStore()
  const themeId = themeIdOverride || storeThemeId
  const isTransparent = content?.transparentBackground === true
  const noBorder = content?.noBorder === true

  // Cards with noBorder option get no styling wrapper
  if (noBorder) {
    return (
      <div className={cn("overflow-hidden", className)}>
        {children}
      </div>
    )
  }

  // Exempt cards get minimal wrapper
  if (EXEMPT_CARD_TYPES.includes(cardType)) {
    return (
      <div className={cn("overflow-hidden", className)}>
        {children}
      </div>
    )
  }

  // Extract blinkie customization props (shared by all poolsuite themes)
  const boxBgs = (content?.blinkieBoxBackgrounds as Record<string, string | number> | undefined)
  const blinkieColors = (content?.blinkieColors as Record<string, string> | undefined)

  // Theme-specific wrappers
  switch (themeId) {
    case 'mac-os':
    case 'instagram-reels':
    case 'system-settings':
    case 'blinkies': {
      return (
        <SystemSettingsCard className={className} cardType={cardType} transparentBackground={isTransparent} blinkieBg={themeId === 'blinkies'} blinkieCardOuter={boxBgs?.cardOuter as string | undefined} blinkieCardOuterDim={boxBgs?.cardOuterDim as number | undefined} blinkieOuterBoxColor={blinkieColors?.outerBox} blinkieInnerBoxColor={blinkieColors?.innerBox} blinkieCardBgUrl={boxBgs?.cardBgUrl as string | undefined} blinkieCardBgScale={boxBgs?.cardBgScale as number | undefined} blinkieCardBgPosX={boxBgs?.cardBgPosX as number | undefined} blinkieCardBgPosY={boxBgs?.cardBgPosY as number | undefined} blinkieCardBgNone={boxBgs?.cardBgNone as boolean | undefined} blinkieTextColor={blinkieColors?.text}>
          {children}
        </SystemSettingsCard>
      )
    }

    default:
      // Standard themed card (receipt, departures-board, etc.)
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
