// src/components/editor/card-type-picker.tsx
"use client"

import { useMemo } from "react"
import { RectangleHorizontal, Minus, Square, Type, Tag, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CardType } from "@/types/card"
import type { ThemeId } from "@/types/theme"

// Only link card types that can be converted between each other
// Excludes: dropdown (container), video/gallery/game/audio (specialized)
export const CONVERTIBLE_CARD_TYPES = [
  { type: "hero" as CardType, icon: RectangleHorizontal, label: "Hero" },
  { type: "horizontal" as CardType, icon: Minus, label: "Horizontal" },
  { type: "square" as CardType, icon: Square, label: "Square" },
  { type: "link" as CardType, icon: Type, label: "Link" },
  { type: "mini" as CardType, icon: Tag, label: "Mini" },
  { type: "text" as CardType, icon: AlignLeft, label: "Text" },
] as const

interface CardTypePickerProps {
  currentType: CardType
  onChange: (type: CardType) => void
  themeId?: ThemeId
  hiddenTypes?: CardType[]
}

export function CardTypePicker({ currentType, onChange, themeId, hiddenTypes }: CardTypePickerProps) {
  const visibleTypes = useMemo(() => {
    let types = CONVERTIBLE_CARD_TYPES.filter(t => !hiddenTypes?.includes(t.type))
    return types
  }, [hiddenTypes])

  return (
    <div className={cn("grid gap-2", visibleTypes.length <= 4 ? "grid-cols-4" : "grid-cols-6")}>
      {visibleTypes.map(({ type, icon: Icon, label }) => {
        const isSelected = currentType === type
        const displayLabel = type === 'link' && themeId === 'blinkies' ? 'Link / Blinky' : label
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
            <span className="text-xs">{displayLabel}</span>
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
