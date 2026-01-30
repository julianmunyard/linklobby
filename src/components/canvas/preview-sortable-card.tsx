"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil } from "lucide-react"
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

  const widthClass = card.size === "big"
    ? "w-full"
    : "w-[calc(50%-0.5rem)]"

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
        widthClass,
        isDragging && "opacity-0",
        "cursor-pointer",
        // Only use touch-none for non-interactive cards (needed for dnd-kit drag)
        // Interactive cards need touch events to pass through for their internal controls
        !isInteractive && "touch-none",
        // Gallery needs overflow visible for full-bleed effect
        card.card_type === 'gallery' && "overflow-visible",
        // Selection highlight - white border with ring
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background rounded-xl"
      )}
      onClick={handleClick}
      {...(isInteractive ? {} : { ...attributes, ...listeners })}
    >
      {/* Wrapper that intercepts all link clicks for non-interactive cards */}
      {isInteractive ? (
        <div className="relative group/interactive">
          {/* Mobile select checkbox overlay */}
          <MobileSelectCheckbox cardId={card.id} />
          <CardRenderer card={card} isPreview />
          {/* Transparent click overlay for selection - only shows when NOT selected */}
          {!isSelected && (
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
        <div className="relative pointer-events-none">
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
