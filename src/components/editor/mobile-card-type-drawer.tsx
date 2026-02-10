"use client"

import { useState, useEffect } from "react"
import { Pencil, ChevronDown } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { CONVERTIBLE_CARD_TYPES } from "./card-type-picker"
import { cn } from "@/lib/utils"
import type { Card, CardType, CardSize } from "@/types/card"
import { CARD_TYPE_SIZING } from "@/types/card"
import type { CardTypeFontSizes } from "@/types/theme"

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
  const [expanded, setExpanded] = useState(false)
  const updateCard = usePageStore((state) => state.updateCard)
  const cardTypeFontSizes = useThemeStore((state) => state.cardTypeFontSizes)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

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

  // Font size control
  const fontSizeKey = card?.card_type as keyof CardTypeFontSizes | undefined
  const hasFontSize = fontSizeKey && fontSizeKey in cardTypeFontSizes
  const currentFontSize = hasFontSize ? cardTypeFontSizes[fontSizeKey] : 1

  // Text color control
  const TEXT_COLOR_TYPES = new Set(['hero', 'horizontal', 'link', 'square', 'video', 'music', 'release'])
  const hasTextColor = card ? TEXT_COLOR_TYPES.has(card.card_type) : false
  const currentTextColor = (card?.content as Record<string, unknown>)?.textColor as string || '#ffffff'

  // Reset expanded when card changes
  useEffect(() => {
    setExpanded(false)
  }, [card?.id])

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
          <DrawerPrimitive.Title className="sr-only">Card Type</DrawerPrimitive.Title>
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

          {/* Expandable "More" section */}
          {card && (hasFontSize || hasTextColor) && (
            <div className="border-t border-border/50">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{expanded ? 'Less' : 'More'}</span>
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  expanded && "rotate-180"
                )} />
              </button>

              {expanded && (
                <div className="px-3 pb-2 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  {/* Font Size Slider */}
                  {hasFontSize && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Font Size</span>
                        <span className="text-muted-foreground">{Math.round(currentFontSize * 100)}%</span>
                      </div>
                      <Slider
                        value={[currentFontSize]}
                        onValueChange={(v) => setCardTypeFontSize(fontSizeKey!, v[0])}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="h-6"
                      />
                    </div>
                  )}

                  {/* Text Color Picker */}
                  {hasTextColor && (
                    <ColorPicker
                      label="Text Color"
                      color={currentTextColor}
                      onChange={(color) => {
                        if (!card) return
                        updateCard(card.id, {
                          content: { ...card.content, textColor: color }
                        })
                      }}
                      className="text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom drag handle - swipe up to dismiss */}
          <div className="flex justify-center pb-2 pt-0.5">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}
