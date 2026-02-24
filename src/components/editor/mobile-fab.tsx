"use client"

import { useState, useRef } from "react"
import { Plus } from "lucide-react"
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
 * Three text pill buttons + one icon button (bottom-right).
 * Swipe right to dismiss, swipe left (or tap tab) to bring back.
 * Hidden on desktop (md:hidden).
 */
export function MobileFAB({ onOpenFeatured, onAddCard, onOpenDesign, onOpenPresets }: MobileFABProps) {
  const [collapsed, setCollapsed] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
    touchStartRef.current = null

    // Swipe right to collapse (horizontal > vertical, at least 40px)
    if (deltaX > 40 && deltaX > deltaY) {
      setCollapsed(true)
    }
    // Swipe left to expand
    if (deltaX < -40 && Math.abs(deltaX) > deltaY) {
      setCollapsed(false)
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3",
        "md:hidden",
        "transition-transform duration-200 ease-out",
        collapsed && "translate-x-[calc(100%+24px)]"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe-back tab — visible when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="fixed bottom-10 right-0 z-50 h-16 w-5 rounded-l-md bg-muted/80 backdrop-blur-sm border border-r-0 border-border"
          aria-label="Show quick actions"
        />
      )}

      {/* Themes FAB */}
      {onOpenFeatured && (
        <Button
          size="lg"
          onClick={onOpenFeatured}
          className="h-10 rounded-full shadow-lg px-5 touch-none"
          aria-label="Themes"
        >
          <span className="text-sm font-medium">Themes</span>
        </Button>
      )}

      {/* Presets FAB */}
      <Button
        size="lg"
        onClick={onOpenPresets}
        className="h-10 rounded-full shadow-lg px-5 touch-none"
        aria-label="Theme presets"
      >
        <span className="text-sm font-medium">Presets</span>
      </Button>

      {/* Colors FAB */}
      <Button
        size="lg"
        onClick={onOpenDesign}
        className="h-10 rounded-full shadow-lg px-5 touch-none"
        aria-label="Colors"
      >
        <span className="text-sm font-medium">Colors</span>
      </Button>

      {/* Add card FAB — icon only */}
      <Button
        size="icon-lg"
        onClick={onAddCard}
        className="h-14 w-14 rounded-full shadow-lg touch-none"
        aria-label="Add card"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
