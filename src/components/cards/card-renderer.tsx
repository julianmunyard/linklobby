// src/components/cards/card-renderer.tsx
import { HeroCard } from "./hero-card"
import { HorizontalLink } from "./horizontal-link"
import { SquareCard } from "./square-card"
import { SocialIconsCard } from "./social-icons-card"
import { LinkCard } from "./link-card"
import type { Card } from "@/types/card"

interface CardRendererProps {
  card: Card
  isPreview?: boolean
}

export function CardRenderer({ card, isPreview = false }: CardRendererProps) {
  switch (card.card_type) {
    case "hero":
      return <HeroCard card={card} isPreview={isPreview} />
    case "horizontal":
      return <HorizontalLink card={card} isPreview={isPreview} />
    case "square":
      return <SquareCard card={card} isPreview={isPreview} />
    case "social-icons":
      return <SocialIconsCard card={card} isPreview={isPreview} />
    case "link":
      return <LinkCard card={card} isPreview={isPreview} />
    default:
      // Fallback for unimplemented card types (video, gallery, dropdown, game, audio)
      return (
        <div className="w-full p-4 rounded-lg border bg-card">
          <p className="font-medium">{card.title || "Untitled"}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {card.card_type} (coming soon)
          </p>
        </div>
      )
  }
}
