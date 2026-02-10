"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import type { Card } from "@/types/card"

interface SortableFlowCardProps {
  card: Card
}

export function SortableFlowCard({ card }: SortableFlowCardProps) {
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
    // Use dnd-kit transition or fallback to smooth CSS transition
    transition: transition ?? 'transform 200ms ease',
    // Prevent sub-pixel rendering artifacts (white lines)
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  }

  const widthClass = card.size !== "small" ? "w-full" : "w-[calc(50%-0.5rem)]"

  // Gallery cards need overflow visible for full-bleed effect
  const allowOverflow = card.card_type === 'gallery'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        widthClass,
        // Hide original card during drag - only DragOverlay should be visible
        isDragging && "opacity-0",
        "cursor-grab active:cursor-grabbing touch-manipulation",
        allowOverflow && "overflow-visible"
      )}
      {...attributes}
      {...listeners}
    >
      <CardRenderer card={card} isPreview />
    </div>
  )
}
