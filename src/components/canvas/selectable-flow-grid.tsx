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
import { useSelectionContainer } from "@air/react-drag-to-select"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { PreviewSortableCard } from "./preview-sortable-card"
import { useMultiSelect } from "@/hooks/use-multi-select"
import { boxesIntersect } from "@air/react-drag-to-select"
import type { Card } from "@/types/card"

interface SelectableFlowGridProps {
  cards: Card[]
  selectedCardId?: string | null
  onReorder: (oldIndex: number, newIndex: number) => void
  onCardClick?: (cardId: string) => void
}

/**
 * SelectableFlowGrid adds box selection to PreviewFlowGrid.
 * Features:
 * - Drag to draw selection box
 * - Shift+click for individual selection
 * - Detects intersecting cards via boxesIntersect
 */
export function SelectableFlowGrid({ cards, selectedCardId, onReorder, onCardClick }: SelectableFlowGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [mounted, setMounted] = useState(false)
  const isDraggingRef = useRef(false)

  // Multi-select state
  const orderedIds = cards.map(c => c.id)
  const multiSelect = useMultiSelect({ orderedIds })

  // Hydration guard: dnd-kit generates different IDs on server vs client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Box selection container
  const { DragSelection } = useSelectionContainer({
    shouldStartSelecting: (target) => {
      // Don't start box selection on drag handles, buttons, or interactive elements
      if (target instanceof HTMLElement) {
        // Exclude dnd-kit drag handles
        if (target.closest('[data-dnd-kit-drag-handle]')) return false
        // Exclude buttons and links
        if (target.closest('button') || target.closest('a')) return false
        // Exclude interactive cards' internal controls
        if (target.closest('[data-interactive-card]')) return false
      }
      return true
    },
    onSelectionChange: (box) => {
      // Find all cards that intersect with selection box
      const selectedElements = document.querySelectorAll('[data-selectable-id]')
      const newSelection = new Set<string>()

      selectedElements.forEach((element) => {
        const id = element.getAttribute('data-selectable-id')
        if (!id) return

        const rect = element.getBoundingClientRect()
        const elementBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }

        if (boxesIntersect(box, elementBox)) {
          newSelection.add(id)
        }
      })

      multiSelect.setSelected(newSelection)
    },
    onSelectionEnd: () => {
      // Selection box finished
    },
    selectionProps: {
      style: {
        border: '2px solid rgb(59, 130, 246)',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '4px',
      },
    },
  })

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
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

    // Small delay to prevent click firing after drag
    setTimeout(() => {
      isDraggingRef.current = false
    }, 50)

    if (!over) return

    // Reorder drop
    if (active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id)
      const newIndex = cards.findIndex((c) => c.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex)
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
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        {/* Box selection wrapper */}
        <DragSelection>
          {/* Cards in flow layout - small cards 50% width, big cards 100% width */}
          <div className="flex flex-wrap gap-4">
            {cards.map((card) => (
              <PreviewSortableCard
                key={card.id}
                card={card}
                isSelected={card.id === selectedCardId || multiSelect.isSelected(card.id)}
                onClick={(e) => handleCardClick(card.id, e)}
              />
            ))}
          </div>
        </DragSelection>
      </SortableContext>

      {/* Drag overlay - visual feedback following cursor */}
      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div className={cn(
            "shadow-xl pointer-events-none",
            activeCard.size === "big" ? "w-80" : "w-40",
          )}>
            <CardRenderer card={activeCard} isPreview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
