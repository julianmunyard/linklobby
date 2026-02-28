// src/components/cards/square-card.tsx
"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"
import type { Card, SquareCardContent } from "@/types/card"
import { renderWithLineBreaks } from "@/lib/render-utils"
import { InlineEditable } from "@/components/preview/inline-editable"

interface SquareCardProps {
  card: Card
  isPreview?: boolean
  isEditable?: boolean
}

// Check if URL looks valid for an image
function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false
  return url.startsWith('http') && !url.includes('undefined') && !url.includes('null')
}

export function SquareCard({ card, isPreview = false, isEditable = false }: SquareCardProps) {
  const content = card.content as SquareCardContent & { textAlign?: string; verticalAlign?: string }
  const [imageError, setImageError] = useState(false)
  const hasLink = Boolean(card.url)
  const showTitle = content.showTitle !== false && (Boolean(card.title) || isEditable)

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
  const textColor = content.textColor || "#ffffff"
  const fontFamily = (content as Record<string, unknown>).fontFamily as string | undefined
  const baseFontSize = useThemeStore((state) => state.cardTypeFontSizes.square)
  const fontFamilyScales = useThemeStore((state) => state.fontFamilyScales)
  const fonts = useThemeStore((state) => state.fonts)
  const fontScale = fontFamily ? (fontFamilyScales?.[fontFamily] ?? 1) : 1
  const fontSize = baseFontSize * fontScale
  const headingFont = fontFamily || 'var(--font-theme-heading)'

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
        "relative block aspect-square w-full",
        "transition-colors duration-150",
        hasLink && "hover:opacity-90 cursor-pointer",
        !hasLink && "cursor-default"
      )}
    >
      {/* Image or placeholder */}
      {hasValidImage ? (
        <Image
          src={content.imageUrl!}
          alt={content.imageAlt || card.title || "Card image"}
          fill
          className="object-cover"
          sizes="(max-width: 400px) 50vw, 200px"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      {/* Title overlay */}
      {showTitle && (
        <>
          {content.showTextGlow === true && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, color-mix(in srgb, ${textColor} 60%, transparent) 0%, transparent 100%)`,
              }}
            />
          )}
          <div
            className={cn(
              "absolute inset-0 p-3 flex",
              textAlign === "left" && "justify-start",
              textAlign === "center" && "justify-center",
              textAlign === "right" && "justify-end",
              verticalAlign === "top" && "items-start",
              verticalAlign === "middle" && "items-center",
              verticalAlign === "bottom" && "items-end"
            )}
          >
            <h3
              className={cn(
                "font-medium drop-shadow-sm break-words w-full line-clamp-4",
                textAlign === "center" && "text-center",
                textAlign === "right" && "text-right"
              )}
              style={{ fontFamily: headingFont, color: textColor, fontSize: `${fonts.headingSize * 0.875 * fontSize}rem` }}
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
                renderWithLineBreaks(card.title || "")
              )}
            </h3>
          </div>
        </>
      )}
    </Wrapper>
  )
}
