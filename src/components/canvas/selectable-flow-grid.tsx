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
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { PreviewSortableCard } from "./preview-sortable-card"
import { useMultiSelect } from "@/hooks/use-multi-select"
import type { Card } from "@/types/card"

interface SelectableFlowGridProps {
  cards: Card[]
  selectedCardId?: string | null
  onReorder: (activeId: string, overId: string) => void
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

  // Filter out hidden cards from preview
  const visibleCards = cards.filter(c => c.is_visible)

  // Multi-select state (use all cards for selection state tracking)
  const orderedIds = cards.map(c => c.id)
  const multiSelect = useMultiSelect({ orderedIds })

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
        delay: 300, // Long press before drag starts — allows normal scrolling
        tolerance: 15, // Generous tolerance so scrolling cancels drag activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    isDraggingRef.current = true
    const card = visibleCards.find((c) => c.id === event.active.id)
    setActiveCard(card || null)

    // Check if dragging a selected card - if so, drag all selected cards
    const activeId = event.active.id as string
    if (multiSelect.isSelected(activeId) && multiSelect.selectedCount > 1) {
      // Get all selected card IDs in their current order
      const selectedInOrder = visibleCards
        .filter(c => multiSelect.isSelected(c.id))
        .map(c => c.id)
      setDraggedCardIds(selectedInOrder)
    } else {
      setDraggedCardIds([activeId])
    }
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

    // Early exit: if same position (no actual movement), do nothing
    if (active.id === over.id) return

    // Reordering on main canvas
    if (active.id !== over.id) {
      // Multi-drag: move all selected cards
      if (cardIdsToDrag.length > 1 && onReorderMultiple) {
        // Multi-drag uses the over card's index in visible cards for targetIndex
        const targetIndex = visibleCards.findIndex((c) => c.id === over.id)
        if (targetIndex !== -1) {
          onReorderMultiple(cardIdsToDrag, targetIndex)
        }
        multiSelect.clearSelection()
      } else {
        // Single drag - pass IDs
        onReorder(active.id as string, over.id as string)
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
      <div className="flex flex-wrap gap-4 w-full">
        {visibleCards.map((card) => (
          <div
            key={card.id}
            className={cn(
              "h-24 bg-muted rounded-lg animate-pulse",
              card.size !== "small" ? "w-full" : "w-[calc(50%-0.5rem)]"
            )}
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (visibleCards.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
        <p>{cards.length === 0 ? "No cards yet. Add your first card above." : "No visible cards. Unhide cards to see them here."}</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleCards.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        {/* Cards in flow layout - small cards 50% width, big cards 100% width */}
        {/* Click on empty space clears selection */}
        <div
          className={cn("flex flex-wrap gap-4 min-h-[100px] w-full", activeCard && "touch-none")}
          onClick={(e) => {
            // Only clear if clicking the container itself, not a card
            if (e.target === e.currentTarget) {
              multiSelect.clearSelection()
            }
          }}
        >
          {visibleCards.map((card) => (
            <PreviewSortableCard
              key={card.id}
              card={card}
              isSelected={card.id === selectedCardId || multiSelect.isSelected(card.id)}
              isDimmed={activeCard !== null && activeCard.id !== card.id}
              onClick={(e) => handleCardClick(card.id, e)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay - visual feedback following cursor */}
      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div className="relative">
            <div className={cn(
              "shadow-xl pointer-events-none",
              activeCard.size !== "small" ? "w-80" : "w-40",
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
