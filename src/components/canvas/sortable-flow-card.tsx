"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import type { Card } from "@/types/card"

interface SortableFlowCardProps {
  card: Card
  isInsideDropdown?: boolean
}

export function SortableFlowCard({ card, isInsideDropdown = false }: SortableFlowCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    // Use dnd-kit transition or fallback to smooth CSS transition
    transition: transition ?? 'transform 200ms ease',
  }

  // Inside dropdown: full width. On main canvas: respect size
  const widthClass = isInsideDropdown
    ? "w-full"
    : card.size === "big" ? "w-full" : "w-[calc(50%-0.5rem)]"

  // When inside dropdown, use drag handle pattern
  if (isInsideDropdown) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          widthClass,
          isDragging && "opacity-0",
          "group/child"  // For hover states
        )}
      >
        <div className="flex items-start">
          {/* Card content - takes most space, clickable */}
          <div className="flex-1 min-w-0">
            <CardRenderer card={card} isPreview />
          </div>

          {/* Drag handle - visible on hover, always on mobile */}
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className={cn(
              "p-2 cursor-grab active:cursor-grabbing touch-none",
              "flex items-center self-stretch",
              "opacity-0 group-hover/child:opacity-100 transition-opacity",
              // Always visible on touch devices
              "[@media(hover:none)]:opacity-100"
            )}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  // Not inside dropdown - original behavior (entire card is drag activator)
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
