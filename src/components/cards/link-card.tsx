// src/components/cards/link-card.tsx
"use client"

import { useCallback } from "react"
import type { Card, LinkCardContent } from "@/types/card"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"
import { renderWithLineBreaks } from "@/lib/render-utils"
import { InlineEditable } from "@/components/preview/inline-editable"

interface LinkCardProps {
  card: Card
  isPreview?: boolean
  isEditable?: boolean
}

export function LinkCard({ card, isPreview = false, isEditable = false }: LinkCardProps) {
  const content = card.content as LinkCardContent & { textAlign?: string; verticalAlign?: string }
  const textAlign = content.textAlign || "center"
  const verticalAlign = content.verticalAlign || "middle"
  const textColor = content.textColor
  const fontFamily = (content as Record<string, unknown>).fontFamily as string | undefined
  const cardTypeFontSizes = useThemeStore((state) => state.cardTypeFontSizes)
  const fontFamilyScales = useThemeStore((state) => state.fontFamilyScales)
  const fonts = useThemeStore((state) => state.fonts)
  // Use mini font size for mini cards, link font size otherwise
  const baseSize = card.card_type === 'mini' ? cardTypeFontSizes.mini : cardTypeFontSizes.link
  // Apply per-font-family scale if card has a custom font
  const fontScale = fontFamily ? (fontFamilyScales?.[fontFamily] ?? 1) : 1
  const fontSize = baseSize * fontScale
  const descriptionFontFamily = (content as Record<string, unknown>).descriptionFontFamily as string | undefined
  const headingFont = fontFamily || 'var(--font-theme-heading)'
  const bodyFont = descriptionFontFamily || fontFamily || 'var(--font-theme-body)'

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

  // Render embed iframe when embed code was pasted
  if (content.embedIframeUrl) {
    return (
      <div className="w-full overflow-hidden" style={{ borderRadius: '12px' }}>
        <iframe
          src={content.embedIframeUrl}
          width="100%"
          height={content.embedHeight || 352}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={card.title || 'Embed'}
          style={{ display: 'block', border: 0 }}
        />
      </div>
    )
  }

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
        className={cn("font-medium break-words w-full", !textColor && "text-theme-text")}
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
      </p>
      {card.description && (
        <p
          className={cn("break-words w-full", !textColor && "text-theme-text/70")}
          style={{ fontFamily: bodyFont, fontSize: `${fonts.bodySize * 0.875 * fontSize}rem`, ...(textColor && { color: textColor, opacity: 0.7 }) }}
        >
          {renderWithLineBreaks(card.description)}
        </p>
      )}
    </Wrapper>
  )
}
