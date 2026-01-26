"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus, Download } from "lucide-react"
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
import { generateAppendKey, sortCardsBySortKey } from "@/lib/ordering"
import type { CardType } from "@/types/card"
import { CARD_TYPE_SIZING } from "@/types/card"
import { LinktreeImportDialog } from "./linktree-import-dialog"

const CARD_TYPES: { type: CardType; label: string; singleton?: boolean }[] = [
  { type: "link", label: "Link" },
  { type: "horizontal", label: "Horizontal Link" },
  { type: "hero", label: "Hero Card" },
  { type: "square", label: "Square Card" },
  { type: "video", label: "Video Card" },
  { type: "gallery", label: "Photo Gallery" },
  { type: "dropdown", label: "Dropdown" },
  { type: "social-icons", label: "Social Icons", singleton: true },
]

export function CardsTab() {
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // Select raw cards array (stable reference)
  const rawCards = usePageStore((state) => state.cards)
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const reorderCards = usePageStore((state) => state.reorderCards)
  const selectCard = usePageStore((state) => state.selectCard)

  // Sort cards in useMemo to avoid infinite loop
  const cards = useMemo(() => sortCardsBySortKey(rawCards), [rawCards])

  const removeCardFromStore = usePageStore((state) => state.removeCard)

  const { isLoading, error, createCard, removeCard: removeCardFromDb } = useCards()

  // Delete card from store and DB
  const handleDeleteCard = async (id: string) => {
    try {
      // Remove from store first (optimistic)
      removeCardFromStore(id)
      // Then remove from database
      await removeCardFromDb(id)
    } catch (err) {
      console.error("Failed to delete card:", err)
      // TODO: Could restore card to store on failure
    }
  }

  // Create card in DB first, then add to store with DB-generated id
  const handleAddCard = async (type: CardType) => {
    try {
      const sortKey = generateAppendKey(cards)
      // Card types with null sizing (horizontal, dropdown, audio) always use 'big'
      const size = CARD_TYPE_SIZING[type] === null ? "big" : "big"

      // Type-specific default content (text and vertical alignment)
      const defaultContent: Record<string, unknown> = (() => {
        switch (type) {
          case "hero":
          case "square":
            return { textAlign: "center", verticalAlign: "bottom" }
          case "horizontal":
            return { textAlign: "left", verticalAlign: "middle" }
          case "link":
            return { textAlign: "center", verticalAlign: "middle" }
          default:
            return {}
        }
      })()

      const newCard = await createCard({
        card_type: type,
        title: null,
        description: null,
        url: null,
        content: defaultContent,
        size,
        position: "left",
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
      {/* Header with add and import buttons */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-medium">Cards</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Download className="h-4 w-4 mr-1" />
            Import
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Card
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {CARD_TYPES.map(({ type, label, singleton }) => {
                const alreadyExists = singleton && cards.some(c => c.card_type === type)
                return (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => handleAddCard(type)}
                    disabled={alreadyExists}
                  >
                    {label}
                    {alreadyExists && " (added)"}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Scrollable card list */}
      <div className="flex-1 overflow-y-auto p-4">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-muted-foreground mb-4">No cards yet. Get started by importing from Linktree or creating your first card.</p>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                onClick={() => setImportDialogOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Import from Linktree
              </Button>
            </div>
          </div>
        ) : (
          <CanvasContainer>
            <SortableCardList
              cards={cards}
              onReorder={reorderCards}
              selectedCardId={selectedCardId}
              onSelectCard={selectCard}
              onDeleteCard={handleDeleteCard}
            />
          </CanvasContainer>
        )}
      </div>

      {/* Import dialog */}
      <LinktreeImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  )
}
