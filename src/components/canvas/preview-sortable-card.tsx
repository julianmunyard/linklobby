"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import type { Card } from "@/types/card"

interface PreviewSortableCardProps {
  card: Card
  onClick?: () => void
}

/**
 * Preview-specific sortable card that intercepts link clicks and calls onClick instead.
 * Used in the preview iframe to enable click-to-select functionality.
 */
export function PreviewSortableCard({ card, onClick }: PreviewSortableCardProps) {
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

  // Handle click - intercept link clicks and call onClick instead
  function handleClick(e: React.MouseEvent) {
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
        "cursor-pointer"
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Wrapper that intercepts all link clicks */}
      <div className="pointer-events-none">
        <div className="pointer-events-auto [&_a]:pointer-events-none">
          <CardRenderer card={card} isPreview />
        </div>
      </div>
    </div>
  )
}
