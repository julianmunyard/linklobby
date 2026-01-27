// src/components/editor/dropdown-card-fields.tsx
"use client"

import { useState } from "react"
import { Plus, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePageStore } from "@/stores/page-store"
import type { DropdownCardContent, CardType } from "@/types/card"
import { cn } from "@/lib/utils"

// Card types that CANNOT be added to dropdowns
const DROPDOWN_EXCLUDED_TYPES: CardType[] = ["dropdown"]

interface DropdownCardFieldsProps {
  content: DropdownCardContent
  dropdownId: string
  onChange: (updates: Record<string, unknown>) => void
}

export function DropdownCardFields({ content, dropdownId, onChange }: DropdownCardFieldsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set())

  const cards = usePageStore((state) => state.cards)
  const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
  const removeCardFromDropdown = usePageStore((state) => state.removeCardFromDropdown)

  const childCount = content.childCardIds?.length ?? 0

  // Get cards currently inside this dropdown
  const childCards = cards.filter((c) => c.parentDropdownId === dropdownId)

  // Get cards available to add (not in any dropdown, not a dropdown itself)
  const availableCards = cards.filter(
    (c) =>
      !c.parentDropdownId &&
      !DROPDOWN_EXCLUDED_TYPES.includes(c.card_type) &&
      c.id !== dropdownId
  )

  const toggleCard = (cardId: string) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }

  const handleAddSelected = () => {
    selectedCardIds.forEach((cardId) => {
      moveCardToDropdown(cardId, dropdownId)
    })
    setSelectedCardIds(new Set())
    setIsOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Child count info and add button */}
      <div className="p-3 bg-muted/50 rounded-lg space-y-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{childCount}</span> {childCount === 1 ? "card" : "cards"} inside this dropdown
        </p>

        {availableCards.length > 0 ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full h-10">
                <Plus className="h-4 w-4 mr-2" />
                Add Existing Cards
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">Select cards to add</p>
                <p className="text-xs text-muted-foreground">
                  {selectedCardIds.size} selected
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {availableCards.map((card) => (
                  <div
                    key={card.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleCard(card.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleCard(card.id)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors cursor-pointer",
                      "hover:bg-accent",
                      selectedCardIds.has(card.id) && "bg-accent"
                    )}
                  >
                    <Checkbox
                      checked={selectedCardIds.has(card.id)}
                      onCheckedChange={() => toggleCard(card.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {card.title || `Untitled ${card.card_type}`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {card.card_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button
                  size="sm"
                  className="w-full"
                  disabled={selectedCardIds.size === 0}
                  onClick={handleAddSelected}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add {selectedCardIds.size} Card{selectedCardIds.size !== 1 ? "s" : ""}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <p className="text-xs text-muted-foreground">
            No cards available to add. Create cards on your page first.
          </p>
        )}
      </div>

      {/* Cards inside dropdown */}
      {childCards.length > 0 && (
        <div className="space-y-2">
          <Label>Cards in Dropdown</Label>
          <div className="space-y-1">
            {childCards.map((card) => (
              <div key={card.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{card.title || `Untitled ${card.card_type}`}</p>
                  <p className="text-xs text-muted-foreground capitalize">{card.card_type}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCardFromDropdown(card.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header text */}
      <div className="space-y-2">
        <Label htmlFor="headerText">Header Text</Label>
        <Input
          id="headerText"
          placeholder="Dropdown"
          value={content.headerText ?? ""}
          onChange={(e) => onChange({ headerText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Shown at the top of the dropdown (falls back to card title)
        </p>
      </div>

      {/* Expand text */}
      <div className="space-y-2">
        <Label htmlFor="expandText">Expand Text</Label>
        <Input
          id="expandText"
          placeholder="Show more"
          value={content.expandText ?? ""}
          onChange={(e) => onChange({ expandText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Text shown when dropdown is closed
        </p>
      </div>

      {/* Collapse text */}
      <div className="space-y-2">
        <Label htmlFor="collapseText">Collapse Text</Label>
        <Input
          id="collapseText"
          placeholder="Show less"
          value={content.collapseText ?? ""}
          onChange={(e) => onChange({ collapseText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Text shown when dropdown is open
        </p>
      </div>
    </div>
  )
}
