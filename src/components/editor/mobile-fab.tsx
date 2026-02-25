"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, ChevronLeft } from "lucide-react"
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
 * Swipe right to dismiss, swipe left (or tap pull tab) to bring back.
 * Hidden on desktop (md:hidden).
 */
export function MobileFAB({ onOpenFeatured, onAddCard, onOpenDesign, onOpenPresets }: MobileFABProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showPulse, setShowPulse] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const pullTabTouchRef = useRef<{ x: number; y: number } | null>(null)

  // Pulse the pull tab briefly after collapsing to hint it's there
  useEffect(() => {
    if (collapsed) {
      setShowPulse(true)
      const timer = setTimeout(() => setShowPulse(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [collapsed])

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

    if (deltaX > 40 && deltaX > deltaY) {
      setCollapsed(true)
    }
    if (deltaX < -40 && Math.abs(deltaX) > deltaY) {
      setCollapsed(false)
    }
  }

  // Pull tab swipe handler (separate so it works independently)
  const handlePullTabTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    pullTabTouchRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handlePullTabTouchEnd = (e: React.TouchEvent) => {
    if (!pullTabTouchRef.current) return
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - pullTabTouchRef.current.x
    const deltaY = Math.abs(touch.clientY - pullTabTouchRef.current.y)
    pullTabTouchRef.current = null

    // Swipe left on pull tab to expand
    if (deltaX < -30 && Math.abs(deltaX) > deltaY) {
      setCollapsed(false)
    }
  }

  return (
    <>
      {/* Pull tab — always rendered outside the sliding container */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          onTouchStart={handlePullTabTouchStart}
          onTouchEnd={handlePullTabTouchEnd}
          className={cn(
            "fixed bottom-12 right-0 z-50 md:hidden",
            "flex items-center justify-center",
            "h-12 w-8 rounded-l-lg",
            "bg-primary text-primary-foreground shadow-lg",
            "border border-r-0 border-primary/20",
            "transition-all duration-300",
            showPulse && "animate-bounce-x"
          )}
          aria-label="Show quick actions"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* FAB stack */}
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

      {/* Keyframe for horizontal bounce hint */}
      <style jsx global>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(0); }
          75% { transform: translateX(-4px); }
        }
        .animate-bounce-x {
          animation: bounce-x 0.6s ease-in-out 2;
        }
      `}</style>
    </>
  )
}
