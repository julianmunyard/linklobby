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

  // With masonry layout, cards fill their column width
  // Big cards use column-span to span both columns (when supported)
  // break-inside-avoid prevents cards from breaking across columns
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        // Big cards span all columns
        ...(card.size === "big" ? { columnSpan: "all" } : {}),
      }}
      className={cn(
        "w-full break-inside-avoid",
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
