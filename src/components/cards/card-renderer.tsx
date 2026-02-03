// src/components/cards/card-renderer.tsx
import { HeroCard } from "./hero-card"
import { HorizontalLink } from "./horizontal-link"
import { SquareCard } from "./square-card"
import { SocialIconsCard } from "./social-icons-card"
import { LinkCard } from "./link-card"
import { TextCard } from "./text-card"
import { VideoCard } from "./video-card"
import { GalleryCard } from "./gallery-card"
import { GameCard } from "./game-card"
import { ThemedCardWrapper } from "./themed-card-wrapper"
import type { Card } from "@/types/card"

interface CardRendererProps {
  card: Card
  isPreview?: boolean
}

export function CardRenderer({ card, isPreview = false }: CardRendererProps) {
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
    case "mini":
      cardContent = <LinkCard card={card} isPreview={isPreview} />
      break
    case "video":
      cardContent = <VideoCard card={card} isPreview={isPreview} />
      break
    case "gallery":
      cardContent = <GalleryCard card={card} isPreview={isPreview} />
      break
    case "game":
      cardContent = <GameCard card={card} isPreview={isPreview} />
      break
    default:
      // Fallback for unimplemented card types (audio)
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
    <ThemedCardWrapper cardType={card.card_type} content={card.content}>
      {cardContent}
    </ThemedCardWrapper>
  )
}
