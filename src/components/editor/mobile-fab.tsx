"use client"

import { Plus, Paintbrush, Palette, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileFABProps {
  onOpenFeatured?: () => void
  onAddCard: () => void
  onOpenDesign: () => void
  onOpenPresets: () => void
}

/**
 * Floating Action Button stack for mobile.
 * Four vertically stacked buttons (bottom-right):
 *   Top:    Featured (template gallery)
 *   2nd:    Presets (theme selection)
 *   3rd:    Design (colors, background, style, header)
 *   Bottom: + (add card / links tab)
 * Hidden on desktop (md:hidden).
 */
export function MobileFAB({ onOpenFeatured, onAddCard, onOpenDesign, onOpenPresets }: MobileFABProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3",
        "md:hidden" // Only visible on mobile
      )}
    >
      {/* Featured FAB */}
      {onOpenFeatured && (
        <Button
          size="icon-lg"
          onClick={onOpenFeatured}
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            "touch-none"
          )}
          aria-label="Featured themes"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      )}

      {/* Presets FAB */}
      <Button
        size="icon-lg"
        onClick={onOpenPresets}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "touch-none"
        )}
        aria-label="Theme presets"
      >
        <Palette className="h-6 w-6" />
      </Button>

      {/* Design FAB */}
      <Button
        size="icon-lg"
        onClick={onOpenDesign}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "touch-none"
        )}
        aria-label="Design settings"
      >
        <Paintbrush className="h-6 w-6" />
      </Button>

      {/* Add card FAB */}
      <Button
        size="icon-lg"
        onClick={onAddCard}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg",
          "touch-none"
        )}
        aria-label="Add card"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
