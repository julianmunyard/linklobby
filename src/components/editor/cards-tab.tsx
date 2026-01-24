"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortableCardList } from "@/components/canvas/sortable-card-list"
import { CanvasContainer } from "@/components/canvas/canvas-container"
import { usePageStore } from "@/stores/page-store"
import type { CardType } from "@/types/card"

const CARD_TYPES: { type: CardType; label: string }[] = [
  { type: "horizontal", label: "Horizontal Link" },
  { type: "hero", label: "Hero Card" },
  { type: "square", label: "Square Card" },
  { type: "video", label: "Video Card" },
  { type: "gallery", label: "Photo Gallery" },
  { type: "dropdown", label: "Dropdown" },
]

export function CardsTab() {
  const cards = usePageStore((state) => state.getSortedCards())
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const addCard = usePageStore((state) => state.addCard)
  const reorderCards = usePageStore((state) => state.reorderCards)
  const selectCard = usePageStore((state) => state.selectCard)

  return (
    <div className="flex flex-col h-full">
      {/* Header with add button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-medium">Cards</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Card
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {CARD_TYPES.map(({ type, label }) => (
              <DropdownMenuItem
                key={type}
                onClick={() => addCard(type)}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto p-4">
        <CanvasContainer>
          <SortableCardList
            cards={cards}
            onReorder={reorderCards}
            selectedCardId={selectedCardId}
            onSelectCard={selectCard}
          />
        </CanvasContainer>
      </div>
    </div>
  )
}
