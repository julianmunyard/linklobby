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
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { CardRenderer } from "@/components/cards/card-renderer"
import { SortableFlowCard } from "./sortable-flow-card"
import type { Card } from "@/types/card"

interface FlowGridProps {
  cards: Card[]
  onReorder: (oldIndex: number, newIndex: number) => void
}

export function FlowGrid({ cards, onReorder }: FlowGridProps) {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [mounted, setMounted] = useState(false)

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
    const card = cards.find((c) => c.id === event.active.id)
    setActiveCard(card || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

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
        {/* Cards in flow layout - small cards 50% width, big cards 100% width */}
        <div className="flex flex-wrap gap-4">
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
            activeCard.size === "big" ? "w-80" : "w-40",
          )}>
            <CardRenderer card={activeCard} isPreview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
