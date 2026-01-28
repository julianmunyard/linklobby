// src/components/cards/hero-card.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"
import type { Card, HeroCardContent } from "@/types/card"

interface HeroCardProps {
  card: Card
  isPreview?: boolean
}

// Check if URL looks valid for an image
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false
  // Must start with http/https and not be obviously broken
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null')
}

export function HeroCard({ card, isPreview = false }: HeroCardProps) {
  const content = card.content as HeroCardContent & { textAlign?: string; verticalAlign?: string }
  const [imageError, setImageError] = useState(false)
  const hasValidImage = isValidImageUrl(content.imageUrl) && !imageError
  const textAlign = content.textAlign || "left"
  const verticalAlign = content.verticalAlign || "bottom"
  const showButton = content.showButton !== false  // Default to true
  const textColor = content.textColor || "#ffffff"
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.hero)

  return (
    <div className="relative w-full h-64">
      {/* Background image or gradient placeholder */}
      {hasValidImage ? (
        <Image
          src={content.imageUrl!}
          alt={content.imageAlt || card.title || "Hero image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
          priority={isPreview}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content with alignment */}
      <div
        className={cn(
          "absolute inset-0 p-6 flex flex-col",
          textAlign === "left" && "items-start text-left",
          textAlign === "center" && "items-center text-center",
          textAlign === "right" && "items-end text-right",
          verticalAlign === "top" && "justify-start",
          verticalAlign === "middle" && "justify-center",
          verticalAlign === "bottom" && "justify-end"
        )}
        style={{ color: textColor }}
      >
        {card.title && (
          <h2
            className="font-bold mb-1 drop-shadow-sm break-words w-full line-clamp-4"
            style={{ fontFamily: 'var(--font-theme-heading)', fontSize: `${1.5 * fontSize}rem` }}
          >
            {card.title}
          </h2>
        )}
        {card.description && (
          <p
            className="opacity-90 mb-4 break-words w-full line-clamp-3 drop-shadow-sm"
            style={{ fontFamily: 'var(--font-theme-body)', fontSize: `${0.875 * fontSize}rem` }}
          >
            {card.description}
          </p>
        )}
        {card.url && showButton && (
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
              content.buttonStyle === "secondary"
                ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                : content.buttonStyle === "outline"
                  ? "border border-white text-white hover:bg-white/10"
                  : "bg-white text-black hover:bg-white/90"
            )}
          >
            {content.buttonText || "Visit"}
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Full-card click area when button is hidden (stretched link pattern) */}
      {card.url && !showButton && (
        <a
          href={card.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          aria-label={`Visit ${card.title || "link"}`}
        />
      )}
    </div>
  )
}
