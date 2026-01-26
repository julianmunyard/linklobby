"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileFABProps {
  onClick: () => void
}

/**
 * Floating Action Button for mobile.
 * Fixed at bottom-right corner for adding cards.
 * Hidden on desktop (md:hidden).
 */
export function MobileFAB({ onClick }: MobileFABProps) {
  return (
    <Button
      size="icon-lg"
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "h-14 w-14 rounded-full shadow-lg",
        "md:hidden", // Only visible on mobile
        "touch-none" // Prevent scroll conflicts
      )}
      aria-label="Add card"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
