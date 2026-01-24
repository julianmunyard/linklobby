// src/components/cards/hero-card.tsx
"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Card, HeroCardContent } from "@/types/card"

interface HeroCardProps {
  card: Card
  isPreview?: boolean
}

export function HeroCard({ card, isPreview = false }: HeroCardProps) {
  const content = card.content as HeroCardContent

  return (
    <div className="relative w-full h-64 rounded-xl overflow-hidden bg-card border">
      {/* Background image or gradient placeholder */}
      {content.imageUrl ? (
        <Image
          src={content.imageUrl}
          alt={content.imageAlt || card.title || "Hero image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
          priority={isPreview}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {card.title && (
          <h2 className="text-2xl font-bold mb-1 drop-shadow-sm">
            {card.title}
          </h2>
        )}
        {card.description && (
          <p className="text-sm opacity-90 mb-4 line-clamp-2 drop-shadow-sm">
            {card.description}
          </p>
        )}
        {card.url && (
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

      {/* Full-card click area when no button text (stretched link pattern) */}
      {card.url && !content.buttonText && (
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
