// src/components/cards/hero-card.tsx
"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"
import type { Card, HeroCardContent } from "@/types/card"
import { renderWithLineBreaks } from "@/lib/render-utils"
import { InlineEditable } from "@/components/preview/inline-editable"

interface HeroCardProps {
  card: Card
  isPreview?: boolean
  isEditable?: boolean
}

// Check if URL looks valid for an image
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false
  // Must start with http/https and not be obviously broken
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null')
}

export function HeroCard({ card, isPreview = false, isEditable = false }: HeroCardProps) {
  const content = card.content as HeroCardContent & { textAlign?: string; verticalAlign?: string }
  const [imageError, setImageError] = useState(false)

  const handleTitleCommit = useCallback((text: string) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'UPDATE_CARD', payload: { cardId: card.id, title: text } },
        window.location.origin
      )
    }
  }, [card.id])

  const handleEditStart = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SELECT_CARD', payload: { cardId: card.id } },
        window.location.origin
      )
      window.parent.postMessage({ type: 'INLINE_EDIT_ACTIVE' }, window.location.origin)
    }
  }, [card.id])

  const handleEditEnd = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'INLINE_EDIT_DONE' }, window.location.origin)
    }
  }, [])
  const hasValidImage = isValidImageUrl(content.imageUrl) && !imageError
  const textAlign = content.textAlign || "left"
  const verticalAlign = content.verticalAlign || "bottom"
  const showTitle = content.showTitle !== false && (Boolean(card.title) || isEditable)
  const showButton = content.showButton !== false  // Default to true
  const textColor = content.textColor || "#ffffff"
  const fontFamily = (content as Record<string, unknown>).fontFamily as string | undefined
  const baseFontSize = useThemeStore((state) => state.cardTypeFontSizes.hero)
  const fontFamilyScales = useThemeStore((state) => state.fontFamilyScales)
  const fonts = useThemeStore((state) => state.fonts)
  const fontScale = fontFamily ? (fontFamilyScales?.[fontFamily] ?? 1) : 1
  const fontSize = baseFontSize * fontScale
  const descriptionFontFamily = (content as Record<string, unknown>).descriptionFontFamily as string | undefined
  const headingFont = fontFamily || 'var(--font-theme-heading)'
  const bodyFont = descriptionFontFamily || fontFamily || 'var(--font-theme-body)'

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
      {content.showTextGlow === true && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, color-mix(in srgb, ${textColor} 70%, transparent) 0%, color-mix(in srgb, ${textColor} 20%, transparent) 50%, transparent 100%)`,
          }}
        />
      )}

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
        {showTitle && (
          <h2
            className="font-bold mb-1 drop-shadow-sm break-words w-full line-clamp-4"
            style={{ fontFamily: headingFont, fontSize: `${fonts.headingSize * 1.5 * fontSize}rem` }}
          >
            {isEditable ? (
              <InlineEditable
                value={card.title || ''}
                onCommit={handleTitleCommit}
                multiline={true}
                placeholder="Tap to type"
                onEditStart={handleEditStart}
                onEditEnd={handleEditEnd}
                className="outline-none min-w-[1ch] inline-block w-full"
              />
            ) : (
              renderWithLineBreaks(card.title!)
            )}
          </h2>
        )}
        {card.description && (
          <p
            className="opacity-90 mb-4 break-words w-full line-clamp-3 drop-shadow-sm"
            style={{ fontFamily: bodyFont, fontSize: `${fonts.bodySize * 0.875 * fontSize}rem` }}
          >
            {renderWithLineBreaks(card.description)}
          </p>
        )}
        {card.url && showButton && (
          <a
            href={isEditable ? undefined : card.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={isEditable ? (e: React.MouseEvent) => e.preventDefault() : undefined}
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
      {card.url && !showButton && !isEditable && (
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
