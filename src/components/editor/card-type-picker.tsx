// src/components/editor/card-type-picker.tsx
"use client"

import { RectangleHorizontal, Minus, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CardType } from "@/types/card"

// Only link card types that can be converted between each other
// Excludes: dropdown (container), video/gallery/game/audio (specialized)
const CONVERTIBLE_CARD_TYPES = [
  { type: "hero" as CardType, icon: RectangleHorizontal, label: "Hero" },
  { type: "horizontal" as CardType, icon: Minus, label: "Horizontal" },
  { type: "square" as CardType, icon: Square, label: "Square" },
] as const

interface CardTypePickerProps {
  currentType: CardType
  onChange: (type: CardType) => void
}

export function CardTypePicker({ currentType, onChange }: CardTypePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CONVERTIBLE_CARD_TYPES.map(({ type, icon: Icon, label }) => {
        const isSelected = currentType === type
        return (
          <Button
            key={type}
            type="button"
            variant="outline"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-3",
              isSelected && "border-primary bg-primary/10"
            )}
            onClick={() => onChange(type)}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{label}</span>
          </Button>
        )
      })}
    </div>
  )
}

// Export types for checking if a card type is convertible
export const CONVERTIBLE_TYPES: CardType[] = CONVERTIBLE_CARD_TYPES.map(c => c.type)

export function isConvertibleType(type: CardType): boolean {
  return CONVERTIBLE_TYPES.includes(type)
}
