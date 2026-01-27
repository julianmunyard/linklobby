"use client"

import { useState, useEffect, useRef } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { PreviewSortableCard } from "./preview-sortable-card"
import { DropdownSortable } from "./dropdown-sortable"
import { useMultiSelect } from "@/hooks/use-multi-select"
import { usePageStore } from "@/stores/page-store"
import { canDropInContainer } from "@/lib/dnd-utils"
import type { Card } from "@/types/card"

interface SelectableFlowGridProps {
  cards: Card[]
  selectedCardId?: string | null
  onReorder: (oldIndex: number, newIndex: number) => void
  onReorderMultiple?: (cardIds: string[], targetIndex: number) => void
  onCardClick?: (cardId: string) => void
}

/**
 * SelectableFlowGrid with multi-select support.
 * Features:
 * - Shift+click for individual selection
 * - Multi-drag: drag one selected card to move all selected
 * - Click empty space to clear selection
 */
export function SelectableFlowGrid({ cards, selectedCardId, onReorder, onReorderMultiple, onCardClick }: SelectableFlowGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [draggedCardIds, setDraggedCardIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const isDraggingRef = useRef(false)

  // Multi-select state
  const orderedIds = cards.map(c => c.id)
  const multiSelect = useMultiSelect({ orderedIds })

  // Store actions for cross-container drag
  const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
  const removeCardFromDropdown = usePageStore((state) => state.removeCardFromDropdown)

  // Hydration guard: dnd-kit generates different IDs on server vs client
  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // Short delay before drag starts
        tolerance: 8, // Allow small movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    isDraggingRef.current = true
    const card = cards.find((c) => c.id === event.active.id)
    setActiveCard(card || null)

    // Check if dragging a selected card - if so, drag all selected cards
    const activeId = event.active.id as string
    if (multiSelect.isSelected(activeId) && multiSelect.selectedCount > 1) {
      // Get all selected card IDs in their current order
      const selectedInOrder = cards
        .filter(c => multiSelect.isSelected(c.id))
        .map(c => c.id)
      setDraggedCardIds(selectedInOrder)
    } else {
      setDraggedCardIds([activeId])
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    // Visual feedback for hovering over dropdown is handled by dropdown-sortable's isOver state
    // No additional logic needed here
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    const cardIdsToDrag = [...draggedCardIds]
    setDraggedCardIds([])

    // Small delay to prevent click firing after drag
    setTimeout(() => {
      isDraggingRef.current = false
    }, 50)

    if (!over) return

    const activeId = active.id as string
    const activeCard = cards.find((c) => c.id === activeId)
    if (!activeCard) return

    // Check if dropping on a dropdown
    const overDropdown = over.data.current?.type === "dropdown"
    const overId = over.id as string

    if (overDropdown) {
      // Move card(s) into dropdown
      if (!canDropInContainer(activeId, overId, cards)) return

      // Move all dragged cards to the dropdown
      cardIdsToDrag.forEach((cardId) => {
        const card = cards.find((c) => c.id === cardId)
        if (card && card.card_type !== "dropdown") {
          moveCardToDropdown(cardId, overId)
        }
      })
      multiSelect.clearSelection()
      return
    }

    // Check if card is being moved OUT of a dropdown to main canvas
    if (activeCard.parentDropdownId && !overDropdown) {
      // Remove from dropdown first
      cardIdsToDrag.forEach((cardId) => {
        removeCardFromDropdown(cardId)
      })
      multiSelect.clearSelection()
      // Continue with reorder on main canvas
    }

    // Main canvas cards (filter out cards inside dropdowns)
    const mainCanvasCards = cards.filter(c => !c.parentDropdownId)

    // Reorder drop
    if (active.id !== over.id) {
      const newIndex = mainCanvasCards.findIndex((c) => c.id === over.id)

      if (newIndex !== -1) {
        // Multi-drag: move all selected cards
        if (cardIdsToDrag.length > 1 && onReorderMultiple) {
          onReorderMultiple(cardIdsToDrag, newIndex)
          multiSelect.clearSelection()
        } else {
          // Single drag
          const oldIndex = mainCanvasCards.findIndex((c) => c.id === active.id)
          if (oldIndex !== -1) {
            onReorder(oldIndex, newIndex)
          }
        }
      }
    }
  }

  // Handle card click (not drag)
  function handleCardClick(cardId: string, event: React.MouseEvent) {
    // Don't trigger click if we just finished dragging
    if (isDraggingRef.current) return

    if (event.shiftKey) {
      // Shift+click: toggle selection via multiSelect
      multiSelect.handleClick(cardId, event)
    } else {
      // Normal click: select card in editor
      multiSelect.clearSelection()
      onCardClick?.(cardId)
    }
  }

  // Show loading placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex flex-wrap gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "h-24 bg-muted rounded-lg animate-pulse",
              card.size === "big" ? "w-full" : "w-[calc(50%-0.5rem)]"
            )}
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
        <p>No cards yet. Add your first card above.</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.filter(c => !c.parentDropdownId).map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        {/* Cards in flow layout - small cards 50% width, big cards 100% width */}
        {/* Click on empty space clears selection */}
        <div
          className="flex flex-wrap gap-4 min-h-[100px]"
          onClick={(e) => {
            // Only clear if clicking the container itself, not a card
            if (e.target === e.currentTarget) {
              multiSelect.clearSelection()
            }
          }}
        >
          {cards.filter(c => !c.parentDropdownId).map((card) => (
            card.card_type === "dropdown" ? (
              <DropdownSortable
                key={card.id}
                dropdown={card}
                childCards={cards.filter((c) => c.parentDropdownId === card.id)}
              />
            ) : (
              <PreviewSortableCard
                key={card.id}
                card={card}
                isSelected={card.id === selectedCardId || multiSelect.isSelected(card.id)}
                onClick={(e) => handleCardClick(card.id, e)}
              />
            )
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay - visual feedback following cursor */}
      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div className="relative">
            <div className={cn(
              "shadow-xl pointer-events-none",
              activeCard.size === "big" ? "w-80" : "w-40",
            )}>
              <CardRenderer card={activeCard} isPreview />
            </div>
            {/* Badge showing count when multi-dragging */}
            {draggedCardIds.length > 1 && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                {draggedCardIds.length}
              </div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
