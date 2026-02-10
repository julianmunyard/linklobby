"use client"

import { Pencil } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { usePageStore } from "@/stores/page-store"
import { CONVERTIBLE_CARD_TYPES } from "./card-type-picker"
import { cn } from "@/lib/utils"
import type { Card, CardType, CardSize } from "@/types/card"
import { CARD_TYPE_SIZING } from "@/types/card"

interface MobileCardTypeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card | null
  onOpenFullEditor: () => void
}

export function MobileCardTypeDrawer({
  open,
  onOpenChange,
  card,
  onOpenFullEditor,
}: MobileCardTypeDrawerProps) {
  const updateCard = usePageStore((state) => state.updateCard)

  const handleTypeChange = (newType: CardType) => {
    if (!card) return
    updateCard(card.id, { card_type: newType })
  }

  const handleSizeChange = (newSize: CardSize) => {
    if (!card) return
    updateCard(card.id, { size: newSize })
  }

  // Check if the current card type supports sizing
  const supportsSizing = card ? CARD_TYPE_SIZING[card.card_type] : null

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false} direction="top">
      <DrawerContent className="h-auto max-h-[45dvh] flex flex-col">
        <DrawerHeader className="border-b px-4 py-3">
          <DrawerTitle>Card Type</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto touch-pan-y p-4 space-y-4">
          {/* 3x2 grid of card type buttons */}
          <div className="grid grid-cols-3 gap-3">
            {CONVERTIBLE_CARD_TYPES.map(({ type, icon: Icon, label }) => {
              const isSelected = card?.card_type === type
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 h-auto py-4 px-2 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/50 text-muted-foreground"
                  )}
                >
                  <Icon className="h-7 w-7" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              )
            })}
          </div>

          {/* Size toggle - only show for card types that support sizing */}
          {supportsSizing && (
            <div className="flex gap-3">
              <button
                onClick={() => handleSizeChange('big')}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-3 rounded-xl border-2 transition-all",
                  card?.size === 'big'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-muted/50 text-muted-foreground"
                )}
              >
                <span className="text-sm font-medium">Big</span>
                <span className="text-xs opacity-60">Full Width</span>
              </button>
              <button
                onClick={() => handleSizeChange('small')}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-3 rounded-xl border-2 transition-all",
                  card?.size === 'small'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-muted/50 text-muted-foreground"
                )}
              >
                <span className="text-sm font-medium">Small</span>
                <span className="text-xs opacity-60">Half Width</span>
              </button>
            </div>
          )}

          {/* Full Editor button */}
          <Button
            variant="outline"
            onClick={onOpenFullEditor}
            className="w-full h-11 flex items-center justify-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Full Editor
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
