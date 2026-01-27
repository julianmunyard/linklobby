"use client"

import { useState, useEffect } from "react"
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { MoveRight, GripVertical } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { SortableFlowCard } from "./sortable-flow-card"
import { DropdownCard } from "@/components/cards/dropdown-card"
import { CardRenderer } from "@/components/cards/card-renderer"
import { useMultiSelectContextOptional } from "@/contexts/multi-select-context"
import { usePageStore } from "@/stores/page-store"
import type { Card } from "@/types/card"
import { cn } from "@/lib/utils"

interface DropdownSortableProps {
  dropdown: Card
  childCards: Card[]
}

export function DropdownSortable({ dropdown, childCards }: DropdownSortableProps) {
  const [isOpen, setIsOpen] = useState(false)

  const multiSelect = useMultiSelectContextOptional()
  const selectedIds = multiSelect?.selectedIds ?? new Set<string>()
  const selectedCount = multiSelect?.selectedCount ?? 0
  const clearSelection = multiSelect?.clearSelection ?? (() => {})

  const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
  const cards = usePageStore((state) => state.cards)

  // Sortable for drag-to-reorder on main canvas
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    setActivatorNodeRef,  // KEY: For drag handle
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dropdown.id })

  // Droppable for receiving cards (keep existing)
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: dropdown.id,
    data: {
      type: "dropdown",
      dropdownId: dropdown.id,
    },
  })

  // Combine refs
  const setNodeRef = (node: HTMLDivElement | null) => {
    setSortableRef(node)
    setDroppableRef(node)
  }

  // Auto-collapse when drag starts (per CONTEXT.md)
  useEffect(() => {
    if (isDragging && isOpen) {
      setIsOpen(false)
    }
  }, [isDragging, isOpen])

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition ?? 'transform 200ms ease',
  }

  // Handle "Move Selected Here"
  const handleMoveSelectedHere = () => {
    if (selectedCount === 0) return

    selectedIds.forEach((cardId) => {
      const card = cards.find((c) => c.id === cardId)
      // Don't move dropdowns into dropdowns, don't move if already in this dropdown
      if (card && card.card_type !== "dropdown" && card.parentDropdownId !== dropdown.id) {
        moveCardToDropdown(cardId, dropdown.id)
      }
    })
    clearSelection()
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={cn(
            "w-full",
            isDragging && "opacity-50",
            isOver && "ring-2 ring-primary ring-offset-2"
          )}
        >
          {/* Wrapper with drag handle on the right */}
          <div className="flex items-start">
            {/* DropdownCard takes most of the space */}
            <div className="flex-1">
              <DropdownCard
                card={dropdown}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
              >
                {/* Simple render without nested SortableContext - testing collapse */}
                <div className="space-y-2">
                  {childCards.map((card) => (
                    <div key={card.id} className="w-full">
                      <CardRenderer card={card} isPreview />
                    </div>
                  ))}
                </div>
              </DropdownCard>
            </div>

            {/* Drag handle - ONLY this receives drag listeners */}
            <div
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              className="p-3 cursor-grab active:cursor-grabbing touch-none hover:bg-accent/30 rounded-r-lg self-stretch flex items-center"
              aria-label="Drag to reorder dropdown"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      {/* Only show context menu if there are selected cards to move */}
      {selectedCount > 0 && (
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleMoveSelectedHere}>
            <MoveRight className="mr-2 h-4 w-4" />
            Move {selectedCount} card{selectedCount > 1 ? "s" : ""} here
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  )
}
