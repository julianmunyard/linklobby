"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Card } from "@/types/card"
import { CARD_SIZES } from "@/types/card"

interface SortableCardProps {
  card: Card
  isSelected?: boolean
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
}

export function SortableCard({ card, isSelected, onSelect, onDelete }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const sizeConfig = CARD_SIZES[card.size || "medium"]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-stretch gap-3 bg-card border rounded-lg overflow-hidden",
        sizeConfig.minHeight,
        isDragging && "opacity-50 shadow-lg z-50",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect?.(card.id)}
    >
      {/* Drag handle - touch-action: none for mobile scrolling */}
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "flex items-center justify-center px-2 bg-muted/50",
          "cursor-grab active:cursor-grabbing touch-none",
          "hover:bg-muted focus:bg-muted focus:outline-none"
        )}
        aria-label={`Drag to reorder ${card.title || "card"}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Card content area */}
      <div className="flex-1 p-3 min-w-0">
        <p className="font-medium truncate">
          {card.title || "Untitled"}
        </p>
        <p className="text-sm text-muted-foreground capitalize">
          {card.card_type.replace("_", " ")}
        </p>
        {card.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {card.description}
          </p>
        )}
      </div>

      {/* Delete button */}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="self-center mr-2 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(card.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete card</span>
        </Button>
      )}
    </div>
  )
}
