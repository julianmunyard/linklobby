"use client"

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { SortableFlowCard } from "./sortable-flow-card"
import { DropdownCard } from "@/components/cards/dropdown-card"
import type { Card } from "@/types/card"
import { cn } from "@/lib/utils"

interface DropdownSortableProps {
  dropdown: Card
  childCards: Card[]
}

export function DropdownSortable({ dropdown, childCards }: DropdownSortableProps) {
  // Make the dropdown a droppable area for receiving cards
  const { setNodeRef, isOver } = useDroppable({
    id: dropdown.id,
    data: {
      type: "dropdown",
      dropdownId: dropdown.id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-full transition-colors",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <DropdownCard card={dropdown}>
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
  )
}
