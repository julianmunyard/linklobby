"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableCard } from "./sortable-card"
import type { Card } from "@/types/card"

interface SortableCardListProps {
  cards: Card[]
  onReorder: (activeId: string, overId: string) => void
  selectedCardId?: string | null
  onSelectCard?: (id: string) => void
  onDeleteCard?: (id: string) => void
  onToggleVisibility?: (id: string) => void
}

export function SortableCardList({
  cards,
  onReorder,
  selectedCardId,
  onSelectCard,
  onDeleteCard,
  onToggleVisibility,
}: SortableCardListProps) {
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string)
    }
  }

  // Show loading placeholder during SSR
  if (!mounted) {
    return (
      <div className="space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="h-24 bg-muted rounded-lg animate-pulse"
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
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              isSelected={card.id === selectedCardId}
              onSelect={onSelectCard}
              onDelete={onDeleteCard}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
