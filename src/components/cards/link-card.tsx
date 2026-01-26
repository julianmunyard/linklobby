// src/components/cards/link-card.tsx
import type { Card } from "@/types/card"
import { cn } from "@/lib/utils"

interface LinkCardProps {
  card: Card
  isPreview?: boolean
}

export function LinkCard({ card, isPreview = false }: LinkCardProps) {
  const content = card.content as { textAlign?: string; verticalAlign?: string }
  const textAlign = content.textAlign || "center"
  const verticalAlign = content.verticalAlign || "middle"

  const Wrapper = card.url && isPreview ? "a" : "div"
  const wrapperProps = card.url && isPreview
    ? { href: card.url, target: "_blank", rel: "noopener noreferrer" }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "w-full flex flex-col gap-1 px-4 py-3 rounded-lg transition-colors hover:bg-accent/30 border border-white/20",
        textAlign === "left" && "text-left items-start",
        textAlign === "center" && "text-center items-center",
        textAlign === "right" && "text-right items-end",
        verticalAlign === "top" && "justify-start",
        verticalAlign === "middle" && "justify-center",
        verticalAlign === "bottom" && "justify-end"
      )}
    >
      <p className="font-medium">
        {card.title || "Untitled Link"}
      </p>
      {card.description && (
        <p className="text-sm text-muted-foreground">
          {card.description}
        </p>
      )}
    </Wrapper>
  )
}
