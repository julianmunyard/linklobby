"use client"

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus, MoveRight } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { SortableFlowCard } from "./sortable-flow-card"
import { DropdownCard } from "@/components/cards/dropdown-card"
import { useMultiSelectContextOptional } from "@/contexts/multi-select-context"
import { usePageStore } from "@/stores/page-store"
import type { Card, CardType } from "@/types/card"
import { cn } from "@/lib/utils"

// Card types that can be added to dropdowns (exclude dropdown itself, game, gallery, video)
const DROPDOWN_ALLOWED_TYPES: CardType[] = ["link", "horizontal", "hero", "square"]

interface DropdownSortableProps {
  dropdown: Card
  childCards: Card[]
}

export function DropdownSortable({ dropdown, childCards }: DropdownSortableProps) {
  const multiSelect = useMultiSelectContextOptional()
  const selectedIds = multiSelect?.selectedIds ?? new Set<string>()
  const selectedCount = multiSelect?.selectedCount ?? 0
  const clearSelection = multiSelect?.clearSelection ?? (() => {})

  const addCardToDropdown = usePageStore((state) => state.addCardToDropdown)
  const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
  const cards = usePageStore((state) => state.cards)

  // Make the dropdown a droppable area for receiving cards
  const { setNodeRef, isOver } = useDroppable({
    id: dropdown.id,
    data: {
      type: "dropdown",
      dropdownId: dropdown.id,
    },
  })

  // Handle "Add Card" submenu
  const handleAddCard = (type: CardType) => {
    addCardToDropdown(dropdown.id, type)
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
          className={cn(
            "w-full transition-colors",
            isOver && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <DropdownCard card={dropdown} onAddCard={handleAddCard}>
            <SortableContext
              items={childCards.map((c) => c.id)}
              strategy={rectSortingStrategy}
            >
              <div className="space-y-2">
                {childCards.map((card) => (
                  <SortableFlowCard
                    key={card.id}
                    card={card}
                    isInsideDropdown
                  />
                ))}
              </div>
            </SortableContext>
          </DropdownCard>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {/* Add Card submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuItem onClick={() => handleAddCard("link")}>
              Link
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAddCard("horizontal")}>
              Horizontal Link
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAddCard("hero")}>
              Hero Card
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAddCard("square")}>
              Square Card
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Move Selected Here - only show if there are selected cards */}
        {selectedCount > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleMoveSelectedHere}>
              <MoveRight className="mr-2 h-4 w-4" />
              Move {selectedCount} card{selectedCount > 1 ? "s" : ""} here
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
