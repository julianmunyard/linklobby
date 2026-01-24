"use client"

import { Plus, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePageStore } from "@/stores/page-store"
import type { CardType } from "@/types/card"
import { cn } from "@/lib/utils"

const CARD_TYPES: { type: CardType; label: string }[] = [
  { type: "horizontal", label: "Horizontal Link" },
  { type: "hero", label: "Hero Card" },
  { type: "square", label: "Square Card" },
  { type: "video", label: "Video Card" },
  { type: "gallery", label: "Photo Gallery" },
  { type: "dropdown", label: "Dropdown" },
]

// Card type display labels for the list
const CARD_TYPE_LABELS: Record<CardType, string> = {
  horizontal: "Link",
  hero: "Hero",
  square: "Square",
  video: "Video",
  gallery: "Gallery",
  dropdown: "Dropdown",
  game: "Game",
  audio: "Audio",
}

export function CardsTab() {
  const cards = usePageStore((state) => state.getSortedCards())
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const addCard = usePageStore((state) => state.addCard)
  const selectCard = usePageStore((state) => state.selectCard)
  const removeCard = usePageStore((state) => state.removeCard)

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
        {cards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="text-muted-foreground text-sm">
              No cards yet. Click &quot;Add Card&quot; to get started.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => selectCard(card.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  selectedCardId === card.id && "bg-accent border-primary"
                )}
              >
                {/* Drag handle placeholder - will be functional after 03-03 */}
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                {/* Card info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {card.title || `Untitled ${CARD_TYPE_LABELS[card.card_type]}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {CARD_TYPE_LABELS[card.card_type]} &middot; {card.size}
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCard(card.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
