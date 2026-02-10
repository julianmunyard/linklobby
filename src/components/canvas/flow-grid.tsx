"use client"

import { useState, useEffect } from "react"
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
import { SortableFlowCard } from "./sortable-flow-card"
import { useHistory } from "@/hooks/use-history"
import type { Card } from "@/types/card"

interface FlowGridProps {
  cards: Card[]
  onReorder: (activeId: string, overId: string) => void
}

export function FlowGrid({ cards, onReorder }: FlowGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [mounted, setMounted] = useState(false)
  const { pause, resume } = useHistory()

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
        tolerance: 3, // Very tight: finger must stay within 3px for 300ms to activate drag
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

    if (!over) {
      // Resume history even if drop was cancelled
      resume()
      return
    }

    // Reorder cards
    if (active.id !== over.id) {
      onReorder(active.id as string, over.id as string)
    }

    // Resume history after reorder is complete
    resume()
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
            <SortableFlowCard
              key={card.id}
              card={card}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay - visual feedback following cursor */}
      {/* dropAnimation={null} prevents jump: overlay disappears instantly on drop, card appears at new position */}
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
