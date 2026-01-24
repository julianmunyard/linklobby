"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import type { Card } from "@/types/card"

interface SortableFlowCardProps {
  card: Card
  isDragging?: boolean
}

export function SortableFlowCard({ card, isDragging }: SortableFlowCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Width classes based on size
  // Big = full width, Small = half width (minus gap)
  const widthClass = card.size === "big"
    ? "w-full"
    : "w-[calc(50%-0.5rem)]"

  // Position classes for small cards
  const positionClass = card.size === "small" && card.position === "center"
    ? "mx-auto"
    : card.size === "small" && card.position === "right"
    ? "ml-auto"
    : ""

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        widthClass,
        positionClass,
        isDragging && "opacity-30",
        "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      <CardRenderer card={card} isPreview />
    </div>
  )
}
