// src/components/cards/link-card.tsx
"use client"

import type { Card, LinkCardContent } from "@/types/card"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"

interface LinkCardProps {
  card: Card
  isPreview?: boolean
}

export function LinkCard({ card, isPreview = false }: LinkCardProps) {
  const content = card.content as LinkCardContent & { textAlign?: string; verticalAlign?: string }
  const textAlign = content.textAlign || "center"
  const verticalAlign = content.verticalAlign || "middle"
  const textColor = content.textColor
  const cardTypeFontSizes = useThemeStore((state) => state.cardTypeFontSizes)
  // Use mini font size for mini cards, link font size otherwise
  const fontSize = card.card_type === 'mini' ? cardTypeFontSizes.mini : cardTypeFontSizes.link

  const Wrapper = card.url && !isPreview ? "a" : "div"
  const wrapperProps = card.url && !isPreview
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
        style={{ fontFamily: 'var(--font-theme-heading)', fontSize: `${1 * fontSize}rem`, ...(textColor && { color: textColor }) }}
      >
        {card.title || "Untitled Link"}
      </p>
      {card.description && (
        <p
          className={cn("break-words w-full line-clamp-3", !textColor && "text-theme-text/70")}
          style={{ fontFamily: 'var(--font-theme-body)', fontSize: `${0.875 * fontSize}rem`, ...(textColor && { color: textColor, opacity: 0.7 }) }}
        >
          {card.description}
        </p>
      )}
    </Wrapper>
  )
}
