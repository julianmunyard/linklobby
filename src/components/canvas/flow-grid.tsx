"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
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
import { SortableFlowCard } from "./sortable-flow-card"
import { DropdownSortable } from "./dropdown-sortable"
import { useHistory } from "@/hooks/use-history"
import { usePageStore } from "@/stores/page-store"
import { findContainer, getContainerCards, canDropInContainer } from "@/lib/dnd-utils"
import type { Card } from "@/types/card"

interface FlowGridProps {
  cards: Card[]
  onReorder: (oldIndex: number, newIndex: number) => void
}

export function FlowGrid({ cards, onReorder }: FlowGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [mounted, setMounted] = useState(false)
  const { pause, resume } = useHistory()
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    // Pause history during drag to prevent intermediate states from polluting history
    pause()
    const card = cards.find((c) => c.id === event.active.id)
    setActiveCard(card || null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeCard = cards.find((c) => c.id === active.id)
    if (!activeCard) return

    const activeContainer = findContainer(active.id as string, cards)
    const overContainer = over.data.current?.type === "dropdown"
      ? over.id as string
      : findContainer(over.id as string, cards)

    // If moving to different container, update parentDropdownId
    if (activeContainer !== overContainer) {
      if (!canDropInContainer(active.id as string, overContainer, cards)) {
        return // Can't drop dropdown into dropdown
      }
      // Update will happen in onDragEnd
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

    if (!over) {
      // Resume history even if drop was cancelled
      resume()
      return
    }

    const activeCard = cards.find((c) => c.id === active.id)
    if (!activeCard) {
      resume()
      return
    }

    const activeContainer = findContainer(active.id as string, cards)
    const overContainer = over.data.current?.type === "dropdown"
      ? over.id as string
      : findContainer(over.id as string, cards)

    // Cross-container move
    if (activeContainer !== overContainer) {
      if (!canDropInContainer(active.id as string, overContainer, cards)) {
        resume()
        return
      }

      if (overContainer === "canvas") {
        removeCardFromDropdown(active.id as string)
      } else {
        moveCardToDropdown(active.id as string, overContainer)
      }
    } else {
      // Same container reorder (existing logic)
      if (active.id !== over.id) {
        const containerCards = getContainerCards(activeContainer, cards)
        const oldIndex = containerCards.findIndex((c) => c.id === active.id)
        const newIndex = containerCards.findIndex((c) => c.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          onReorder(oldIndex, newIndex)
        }
      }
    }

    // Resume history after reorder is complete
    resume()
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

  // Split cards into main canvas and dropdown children
  const mainCanvasCards = cards.filter((c) => !c.parentDropdownId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={mainCanvasCards.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        {/* Cards in flow layout - small cards 50% width, big cards 100% width */}
        <div className="flex flex-wrap gap-4">
          {mainCanvasCards.map((card) => (
            card.card_type === "dropdown" ? (
              <DropdownSortable
                key={card.id}
                dropdown={card}
                childCards={cards.filter((c) => c.parentDropdownId === card.id)}
              />
            ) : (
              <SortableFlowCard
                key={card.id}
                card={card}
              />
            )
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay - visual feedback following cursor */}
      {/* dropAnimation={null} prevents jump: overlay disappears instantly on drop, card appears at new position */}
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
