// src/components/cards/card-renderer.tsx
'use client'

import { HeroCard } from "./hero-card"
import { HorizontalLink } from "./horizontal-link"
import { SquareCard } from "./square-card"
import { SocialIconsCard } from "./social-icons-card"
import { LinkCard } from "./link-card"
import { BlinkieLink } from "./blinkie-link"
import { TextCard } from "./text-card"
import { VideoCard } from "./video-card"
import { GalleryCard } from "./gallery-card"
import { GameCard } from "./game-card"
import { AudioCard } from "./audio-card"
import { MusicCard } from "./music-card"
import { EmailCollectionCard } from "./email-collection-card"
import { ReleaseCard } from "./release-card"
import { ThemedCardWrapper } from "./themed-card-wrapper"
import { useThemeStore } from "@/stores/theme-store"
import { usePlanTier } from "@/contexts/plan-tier-context"
import { PRO_CARD_TYPES } from "@/lib/stripe/plans"
import { Lock } from "lucide-react"
import type { Card } from "@/types/card"

interface CardRendererProps {
  card: Card
  isPreview?: boolean
  themeId?: string  // Pass through for public pages where Zustand store isn't available
}

export function CardRenderer({ card, isPreview = false, themeId }: CardRendererProps) {
  // Get theme from store for editor preview, or use themeId prop for public pages
  const storeThemeId = useThemeStore((s) => s.themeId)
  const effectiveThemeId = themeId || storeThemeId
  const { planTier, openUpgradeModal } = usePlanTier()
  const isProCard = isPreview && planTier === 'free' && PRO_CARD_TYPES.includes(card.card_type)

  // Render card content
  let cardContent: React.ReactNode

  switch (card.card_type) {
    case "hero":
      cardContent = <HeroCard card={card} isPreview={isPreview} />
      break
    case "horizontal":
      cardContent = <HorizontalLink card={card} isPreview={isPreview} />
      break
    case "square":
      cardContent = <SquareCard card={card} isPreview={isPreview} />
      break
    case "social-icons":
      // Social icons don't need themed wrapper - they're just icons
      return <SocialIconsCard card={card} isPreview={isPreview} />
    case "text":
      // Text cards are plain text without any card wrapper
      return <TextCard card={card} isPreview={isPreview} />
    case "link":
    case "mini": {
      // Blinkies theme: link/mini cards ARE the blinky badge — no ThemedCardWrapper
      if (effectiveThemeId === 'blinkies') {
        return <BlinkieLink card={card} isPreview={isPreview} />
      }
      cardContent = <LinkCard card={card} isPreview={isPreview} />
      break
    }
    case "video":
      cardContent = <VideoCard card={card} isPreview={isPreview} />
      break
    case "gallery":
      cardContent = <GalleryCard card={card} isPreview={isPreview} />
      break
    case "game":
      cardContent = <GameCard card={card} isPreview={isPreview} />
      break
    case "audio":
      cardContent = <AudioCard card={card} isPreview={isPreview} themeIdOverride={themeId} />
      break
    case "music":
      cardContent = <MusicCard card={card} isPreview={isPreview} />
      break
    case "email-collection":
      // Email collection needs pageId for form submission
      cardContent = (
        <EmailCollectionCard
          card={card}
          pageId={card.page_id}
          isEditing={isPreview}
        />
      )
      break
    case "release":
      // Release card with countdown - conversion handled client-side in editor only
      cardContent = (
        <ReleaseCard
          card={card}
          isEditing={isPreview}
        />
      )
      break
    default:
      // Fallback for unimplemented card types
      cardContent = (
        <div className="w-full p-4 rounded-lg border bg-card">
          <p className="font-medium">{card.title || "Untitled"}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {card.card_type} (coming soon)
          </p>
        </div>
      )
  }

  // Wrap with themed wrapper
  return (
    <div className={isProCard ? 'relative' : undefined}>
      <ThemedCardWrapper cardType={card.card_type} content={card.content} themeIdOverride={themeId}>
        {cardContent}
      </ThemedCardWrapper>
      {isProCard && (
        <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none pb-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              openUpgradeModal(card.card_type === 'audio' ? 'Audio Player' : card.card_type === 'release' ? 'Release Card' : 'Email Collection')
            }}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-amber-400/30 cursor-pointer hover:bg-black/80 transition-colors"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-medium text-amber-400">Pro</span>
            <span className="text-[11px] text-white/70">— won&apos;t show on public page</span>
          </button>
        </div>
      )}
    </div>
  )
}
