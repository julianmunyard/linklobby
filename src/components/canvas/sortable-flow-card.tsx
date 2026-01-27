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
  }

  // Width classes based on size
  // Big = full width, Small = half width (minus gap)
  // Cards flow left-to-right based on order - two small cards fill a row, then wrap
  // Exception: Small video cards are full-width but with max-width constraint (so they stack vertically)
  const isSmallVideo = card.size === "small" && card.card_type === "video"
  const widthClass = card.size === "big" || isSmallVideo
    ? "w-full"
    : "w-[calc(50%-0.5rem)]"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        widthClass,
        // Hide original card during drag - only DragOverlay should be visible
        isDragging && "opacity-0",
        "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      <CardRenderer card={card} isPreview />
    </div>
  )
}
