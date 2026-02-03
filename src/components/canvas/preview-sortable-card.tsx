"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { MobileSelectCheckbox } from "@/components/editor/mobile-select-mode"
import type { Card } from "@/types/card"

interface PreviewSortableCardProps {
  card: Card
  isSelected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

// Card types that need full interactivity (touch/mouse events pass through)
const INTERACTIVE_CARD_TYPES = ['gallery', 'video', 'game']

/**
 * Preview-specific sortable card that intercepts link clicks and calls onClick instead.
 * Used in the preview iframe to enable click-to-select functionality.
 * Shows a white border highlight when selected.
 * Includes data-selectable-id for box selection integration.
 */
export function PreviewSortableCard({ card, isSelected, onClick }: PreviewSortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 200ms ease',
    // Prevent sub-pixel rendering artifacts (white lines)
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  }

  // Mini cards use w-fit with margin positioning
  // left: normal flow, center: mx-auto (own row), right: ml-auto (pushes to right)
  const isPositionableCard = card.card_type === "mini"

  // Link cards are full width like horizontal cards
  const widthClass = isPositionableCard
    ? "w-fit" // Compact width, positioned via margins
    : card.card_type === "link" || card.card_type === "horizontal"
      ? "w-full"
      : card.size === "big"
        ? "w-full"
        : "w-[calc(50%-0.5rem)]"

  // Position class for mini/text cards using margins
  // - left: no margin (flows to left naturally)
  // - center: mx-auto (centers, takes own row)
  // - right: ml-auto (pushes to right edge of remaining space)
  const positionClass = isPositionableCard
    ? card.position === "right"
      ? "ml-auto"
      : card.position === "center"
        ? "mx-auto"
        : "" // left = normal flow
    : ""

  // Interactive cards (gallery, video, game) need full pointer/touch events
  const isInteractive = INTERACTIVE_CARD_TYPES.includes(card.card_type)

  // Handle click - select the card
  function handleClick(e: React.MouseEvent) {
    // Prevent default link navigation
    e.preventDefault()
    e.stopPropagation()
    onClick?.(e)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-selectable-id={card.id}
      className={cn(
        "relative",
        widthClass,
        isDragging && "opacity-0",
        "cursor-pointer",
        // Positionable cards use margin classes for positioning
        positionClass,
        // Only use touch-none for non-interactive cards (needed for dnd-kit drag)
        // Interactive cards need touch events to pass through for their internal controls
        !isInteractive && "touch-none",
        // Gallery needs overflow visible for full-bleed effect
        card.card_type === 'gallery' && "overflow-visible",
        // Selection highlight - white border with tight ring
        isSelected && "ring-2 ring-white ring-offset-1 ring-offset-background rounded-lg"
      )}
      onClick={handleClick}
      {...(isInteractive ? {} : { ...attributes, ...listeners })}
    >
      {/* Hidden card overlay */}
      {!card.is_visible && (
        <div className="absolute inset-0 z-20 bg-black/50 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 rounded-full p-2">
            <EyeOff className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      {/* Wrapper that intercepts all link clicks for non-interactive cards */}
      {isInteractive ? (
        <div className={cn("relative group/interactive", !card.is_visible && "opacity-50")}>
          {/* Mobile select checkbox overlay */}
          <MobileSelectCheckbox cardId={card.id} />
          <CardRenderer card={card} isPreview />
          {/* Transparent click overlay for selection - only shows when NOT selected */}
          {/* Skip for gallery cards so Stack can receive pointer events */}
          {!isSelected && card.card_type !== 'gallery' && (
            <div
              className="absolute inset-0 z-[5] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.(e)
              }}
            />
          )}
          {/* Control buttons for interactive cards - appear on hover */}
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover/interactive:opacity-100 transition-opacity">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2 cursor-grab active:cursor-grabbing touch-none"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            {/* Edit button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick?.(e)
              }}
              className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2"
              aria-label="Edit card"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className={cn("relative pointer-events-none", !card.is_visible && "opacity-50")}>
          {/* Mobile select checkbox overlay */}
          <MobileSelectCheckbox cardId={card.id} />
          <div className="pointer-events-auto [&_a]:pointer-events-none">
            <CardRenderer card={card} isPreview />
          </div>
        </div>
      )}
    </div>
  )
}
