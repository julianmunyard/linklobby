// src/components/cards/text-card.tsx
"use client"

import type { Card, LinkCardContent } from "@/types/card"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"

interface TextCardProps {
  card: Card
  isPreview?: boolean
}

export function TextCard({ card, isPreview = false }: TextCardProps) {
  const content = card.content as LinkCardContent & { textAlign?: string; verticalAlign?: string }
  const textAlign = content.textAlign || "center"
  const textColor = content.textColor
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.text)

  const Wrapper = card.url && !isPreview ? "a" : "div"
  const wrapperProps = card.url && !isPreview
    ? { href: card.url, target: "_blank", rel: "noopener noreferrer" }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "w-full flex flex-col gap-1 py-2 transition-colors hover:opacity-80",
        textAlign === "left" && "text-left items-start",
        textAlign === "center" && "text-center items-center",
        textAlign === "right" && "text-right items-end"
      )}
    >
      <p
        className={cn("font-medium break-words w-full", !textColor && "text-theme-text")}
        style={{ fontFamily: 'var(--font-theme-heading)', fontSize: `${1 * fontSize}rem`, ...(textColor && { color: textColor }) }}
      >
        {card.title || "Text"}
      </p>
      {card.description && (
        <p
          className={cn("break-words w-full", !textColor && "text-theme-text/70")}
          style={{ fontFamily: 'var(--font-theme-body)', fontSize: `${0.875 * fontSize}rem`, ...(textColor && { color: textColor, opacity: 0.7 }) }}
        >
          {card.description}
        </p>
      )}
    </Wrapper>
  )
}
