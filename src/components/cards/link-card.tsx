// src/components/cards/link-card.tsx
import type { Card, LinkCardContent } from "@/types/card"
import { cn } from "@/lib/utils"

interface LinkCardProps {
  card: Card
  isPreview?: boolean
}

export function LinkCard({ card, isPreview = false }: LinkCardProps) {
  const content = card.content as LinkCardContent & { textAlign?: string; verticalAlign?: string }
  const textAlign = content.textAlign || "center"
  const verticalAlign = content.verticalAlign || "middle"
  const textColor = content.textColor

  const Wrapper = card.url && isPreview ? "a" : "div"
  const wrapperProps = card.url && isPreview
    ? { href: card.url, target: "_blank", rel: "noopener noreferrer" }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "w-full flex flex-col gap-1 px-4 py-3 transition-colors hover:opacity-80",
        textAlign === "left" && "text-left items-start",
        textAlign === "center" && "text-center items-center",
        textAlign === "right" && "text-right items-end",
        verticalAlign === "top" && "justify-start",
        verticalAlign === "middle" && "justify-center",
        verticalAlign === "bottom" && "justify-end"
      )}
    >
      <p
        className={cn("font-medium break-words w-full line-clamp-2", !textColor && "text-theme-text")}
        style={{ fontFamily: 'var(--font-theme-heading)', ...(textColor && { color: textColor }) }}
      >
        {card.title || "Untitled Link"}
      </p>
      {card.description && (
        <p
          className={cn("text-sm break-words w-full line-clamp-3", !textColor && "text-theme-text/70")}
          style={{ fontFamily: 'var(--font-theme-body)', ...(textColor && { color: textColor, opacity: 0.7 }) }}
        >
          {card.description}
        </p>
      )}
    </Wrapper>
  )
}
