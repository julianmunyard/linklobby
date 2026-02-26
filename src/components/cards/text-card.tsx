// src/components/cards/text-card.tsx
"use client"

import { useCallback } from "react"
import type { Card, LinkCardContent } from "@/types/card"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/theme-store"
import { renderWithLineBreaks } from "@/lib/render-utils"
import { InlineEditable } from "@/components/preview/inline-editable"

interface TextCardProps {
  card: Card
  isPreview?: boolean
  isEditable?: boolean
}

export function TextCard({ card, isPreview = false, isEditable = false }: TextCardProps) {
  const content = card.content as LinkCardContent & { textAlign?: string; verticalAlign?: string; showBorder?: boolean; showFill?: boolean }
  const textAlign = content.textAlign || "center"
  const textColor = content.textColor
  const showBorder = !!content.showBorder
  const showFill = !!content.showFill
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.text)
  const shadowEnabled = useThemeStore((state) => state.style.shadowEnabled)

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
      // Select the card so settings panel opens alongside inline editing
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

  const Wrapper = card.url && !isPreview ? "a" : "div"
  const wrapperProps = card.url && !isPreview
    ? { href: card.url, target: "_blank", rel: "noopener noreferrer" }
    : {}

  const hasCardStyle = showBorder || showFill

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "w-full flex flex-col gap-1 transition-colors hover:opacity-80",
        hasCardStyle ? "px-4 py-3" : "py-2",
        hasCardStyle && showBorder && "border border-theme-border",
        hasCardStyle && showFill && "bg-theme-card-bg",
        hasCardStyle && shadowEnabled && "shadow-theme-card",
        textAlign === "left" && "text-left items-start",
        textAlign === "center" && "text-center items-center",
        textAlign === "right" && "text-right items-end"
      )}
      style={hasCardStyle ? { borderRadius: 'var(--theme-border-radius)' } : undefined}
    >
      <p
        className={cn("font-medium break-words w-full", !textColor && "text-theme-text")}
        style={{ fontFamily: 'var(--font-theme-heading)', fontSize: `${1 * fontSize}rem`, ...(textColor && { color: textColor }) }}
        onClick={isEditable ? (e) => e.stopPropagation() : undefined}
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
          renderWithLineBreaks(card.title || "Text")
        )}
      </p>
      {card.description && (
        <p
          className={cn("break-words w-full", !textColor && "text-theme-text/70")}
          style={{ fontFamily: 'var(--font-theme-body)', fontSize: `${0.875 * fontSize}rem`, ...(textColor && { color: textColor, opacity: 0.7 }) }}
        >
          {renderWithLineBreaks(card.description)}
        </p>
      )}
    </Wrapper>
  )
}
