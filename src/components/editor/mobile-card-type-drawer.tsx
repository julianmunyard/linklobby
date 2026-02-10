"use client"

import { Pencil } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"
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
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      direction="top"
      noBodyStyles
    >
      <DrawerPrimitive.Portal>
        {/* No overlay - keep preview fully visible and tappable */}
        <DrawerPrimitive.Content
          className="bg-background fixed inset-x-0 top-0 z-50 flex h-auto flex-col rounded-b-xl border-b shadow-lg"
        >
          <div className="px-3 pt-3 pb-2 space-y-2">
            {/* Card type grid + size in one compact section */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Card Type</span>
              <button
                onClick={onOpenFullEditor}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Full Editor
              </button>
            </div>

            {/* Compact 3x2 grid of card types */}
            <div className="grid grid-cols-3 gap-1.5">
              {CONVERTIBLE_CARD_TYPES.map(({ type, icon: Icon, label }) => {
                const isSelected = card?.card_type === type
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{label}</span>
                  </button>
                )
              })}
            </div>

            {/* Inline size toggle - only for sizable types */}
            {supportsSizing && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleSizeChange('big')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    card?.size === 'big'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-muted/50 text-muted-foreground"
                  )}
                >
                  Big
                </button>
                <button
                  onClick={() => handleSizeChange('small')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    card?.size === 'small'
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-muted/50 text-muted-foreground"
                  )}
                >
                  Small
                </button>
              </div>
            )}
          </div>

          {/* Bottom drag handle - swipe up to dismiss */}
          <div className="flex justify-center pb-2 pt-0.5">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}
