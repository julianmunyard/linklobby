// src/components/cards/horizontal-link.tsx
"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronRight, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"
import type { Card, HorizontalLinkContent } from "@/types/card"
import { renderWithLineBreaks } from "@/lib/render-utils"
import { InlineEditable } from "@/components/preview/inline-editable"

interface HorizontalLinkProps {
  card: Card
  isPreview?: boolean
  isEditable?: boolean
}

// Check if URL looks valid for an image
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null')
}

export function HorizontalLink({ card, isPreview = false, isEditable = false }: HorizontalLinkProps) {
  const content = card.content as HorizontalLinkContent & { textAlign?: string; verticalAlign?: string }
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
  const hasLink = Boolean(card.url)
  const hasValidImage = isValidImageUrl(content.imageUrl) && !imageError
  const textAlign = content.textAlign || "left"
  const verticalAlign = content.verticalAlign || "middle"
  const textColor = content.textColor
  const fontFamily = (content as Record<string, unknown>).fontFamily as string | undefined
  const baseFontSize = useThemeStore((state) => state.cardTypeFontSizes.horizontal)
  const fontFamilyScales = useThemeStore((state) => state.fontFamilyScales)
  const fonts = useThemeStore((state) => state.fonts)
  const fontScale = fontFamily ? (fontFamilyScales?.[fontFamily] ?? 1) : 1
  const fontSize = baseFontSize * fontScale
  const descriptionFontFamily = (content as Record<string, unknown>).descriptionFontFamily as string | undefined
  const headingFont = fontFamily || 'var(--font-theme-heading)'
  const bodyFont = descriptionFontFamily || fontFamily || 'var(--font-theme-body)'

  const useLink = hasLink && !isEditable
  const Wrapper = useLink ? "a" : "div"
  const wrapperProps = useLink
    ? {
        href: card.url!,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "relative flex gap-4 w-full p-4",
        "transition-colors duration-150",
        hasLink && "hover:opacity-80 cursor-pointer",
        !hasLink && "cursor-default",
        verticalAlign === "top" && "items-start",
        verticalAlign === "middle" && "items-center",
        verticalAlign === "bottom" && "items-end"
      )}
    >
      {/* Thumbnail or icon placeholder */}
      {hasValidImage ? (
        <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={content.imageUrl!}
            alt={content.imageAlt || ""}
            fill
            className="object-cover"
            sizes="48px"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Link2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Text content */}
      <div
        className={cn(
          "flex-1 min-w-0",
          textAlign === "left" && "text-left",
          textAlign === "center" && "text-center",
          textAlign === "right" && "text-right"
        )}
      >
        <h3
          className={cn("font-medium break-words ", !textColor && "text-theme-text")}
          style={{ fontFamily: headingFont, fontSize: `${fonts.headingSize * fontSize}rem`, ...(textColor && { color: textColor }) }}
        >
          {isEditable ? (
            <InlineEditable
              value={card.title || ''}
              onCommit={handleTitleCommit}
              multiline={false}
              placeholder="Tap to type"
              onEditStart={handleEditStart}
              onEditEnd={handleEditEnd}
              className="outline-none min-w-[1ch] inline-block w-full"
            />
          ) : (
            card.title || "Untitled Link"
          )}
        </h3>
        {card.description && (
          <p
            className={cn("break-words ", !textColor && "text-theme-text/70")}
            style={{ fontFamily: bodyFont, fontSize: `${fonts.bodySize * 0.875 * fontSize}rem`, ...(textColor && { color: textColor, opacity: 0.7 }) }}
          >
            {renderWithLineBreaks(card.description)}
          </p>
        )}
      </div>

      {/* Chevron indicator for links */}
      {hasLink && (
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      )}
    </Wrapper>
  )
}
