"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import type { Card } from "@/types/card"

interface PreviewSortableCardProps {
  card: Card
  isSelected?: boolean
  onClick?: () => void
}

// Card types that need full interactivity (touch/mouse events pass through)
const INTERACTIVE_CARD_TYPES = ['gallery', 'video', 'game']

/**
 * Preview-specific sortable card that intercepts link clicks and calls onClick instead.
 * Used in the preview iframe to enable click-to-select functionality.
 * Shows a white border highlight when selected.
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
  }

  const widthClass = card.size === "big"
    ? "w-full"
    : "w-[calc(50%-0.5rem)]"

  // Interactive cards (gallery, video, game) need full pointer/touch events
  const isInteractive = INTERACTIVE_CARD_TYPES.includes(card.card_type)

  // Handle click - intercept link clicks and call onClick instead
  function handleClick(e: React.MouseEvent) {
    // For interactive cards, only handle clicks on the card border/selection ring
    // Let internal interactions pass through
    if (isInteractive && e.target !== e.currentTarget) {
      return
    }
    // Prevent default link navigation
    e.preventDefault()
    e.stopPropagation()
    onClick?.()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        widthClass,
        isDragging && "opacity-0",
        "cursor-pointer",
        // Only use touch-none for non-interactive cards (needed for dnd-kit drag)
        // Interactive cards need touch events to pass through for their internal controls
        !isInteractive && "touch-none",
        // Selection highlight - white border with ring
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background rounded-xl"
      )}
      onClick={handleClick}
      {...(isInteractive ? {} : { ...attributes, ...listeners })}
    >
      {/* Wrapper that intercepts all link clicks for non-interactive cards */}
      {isInteractive ? (
        <div className="relative group/interactive">
          <CardRenderer card={card} isPreview />
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
                onClick?.()
              }}
              className="bg-black/70 hover:bg-black/90 text-white rounded-full p-2"
              aria-label="Edit card"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none">
          <div className="pointer-events-auto [&_a]:pointer-events-none">
            <CardRenderer card={card} isPreview />
          </div>
        </div>
      )}
    </div>
  )
}
