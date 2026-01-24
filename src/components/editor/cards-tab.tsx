"use client"

import { Loader2, Plus } from "lucide-react"
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
import { useCards } from "@/hooks/use-cards"
import { generateAppendKey } from "@/lib/ordering"
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
  const reorderCards = usePageStore((state) => state.reorderCards)
  const selectCard = usePageStore((state) => state.selectCard)

  const { isLoading, error, createCard } = useCards()

  // Create card in DB first, then add to store with DB-generated id
  const handleAddCard = async (type: CardType) => {
    try {
      const sortKey = generateAppendKey(cards)
      const newCard = await createCard({
        card_type: type,
        title: null,
        description: null,
        url: null,
        content: {},
        size: "medium",
        sortKey,
        is_visible: true,
      })
      // Add to store with DB-generated id
      usePageStore.getState().setCards([...cards, newCard])
      usePageStore.getState().selectCard(newCard.id)
    } catch (err) {
      // Error already tracked in hook
      console.error("Failed to add card:", err)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Failed to load cards: {error}</p>
      </div>
    )
  }

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
                onClick={() => handleAddCard(type)}
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
