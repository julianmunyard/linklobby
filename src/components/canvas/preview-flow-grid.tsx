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
import { useMultiSelectContext } from "@/contexts/multi-select-context"
import type { Card } from "@/types/card"

interface PreviewFlowGridProps {
  cards: Card[]
  selectedCardId?: string | null
  onReorder: (activeId: string, overId: string) => void
  onCardClick?: (cardId: string) => void
}

/**
 * Preview-specific FlowGrid that doesn't use useHistory (which requires page store context).
 * Supports click-to-select functionality via onCardClick callback.
 */
export function PreviewFlowGrid({ cards, selectedCardId, onReorder, onCardClick }: PreviewFlowGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [mounted, setMounted] = useState(false)
  const isDraggingRef = useRef(false)
  const { isSelectMode, toggleSelect } = useMultiSelectContext()

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
      onReorder(active.id as string, over.id as string)
    }
  }

  // Handle card click (not drag)
  function handleCardClick(cardId: string) {
    // Don't trigger click if we just finished dragging
    if (isDraggingRef.current) return

    // In select mode, toggle selection instead of opening editor
    if (isSelectMode) {
      toggleSelect(cardId)
    } else {
      onCardClick?.(cardId)
    }
  }

  // Show loading placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex flex-wrap gap-4 w-full">
        {cards.map((card) => (
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
        {/* Cards in flow layout - small cards 50% width, big cards 100% width */}
        <div className="flex flex-wrap gap-4 w-full">
          {cards.map((card) => (
            <PreviewSortableCard
              key={card.id}
              card={card}
              isSelected={card.id === selectedCardId}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay - visual feedback following cursor */}
      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div className={cn(
            "shadow-xl pointer-events-none",
            activeCard.size !== "small" ? "w-80" : "w-40",
          )}>
            <CardRenderer card={activeCard} isPreview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
