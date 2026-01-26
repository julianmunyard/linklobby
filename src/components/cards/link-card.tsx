// src/components/cards/link-card.tsx
import { ExternalLink } from "lucide-react"
import type { Card } from "@/types/card"

interface LinkCardProps {
  card: Card
  isPreview?: boolean
}

export function LinkCard({ card, isPreview = false }: LinkCardProps) {
  const Wrapper = card.url && isPreview ? "a" : "div"
  const wrapperProps = card.url && isPreview
    ? { href: card.url, target: "_blank", rel: "noopener noreferrer" }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {card.title || "Untitled Link"}
        </p>
        {card.description && (
          <p className="text-sm text-muted-foreground truncate">
            {card.description}
          </p>
        )}
      </div>
      {card.url && (
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
    </Wrapper>
  )
}
