"use client"

import { cn } from "@/lib/utils"

interface CanvasContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * Mobile-first container for the card stack.
 * - max-w-md (448px) matches typical link-in-bio width
 * - Centered with auto margins
 * - Padding for breathing room
 * - space-y-4 gap between cards
 */
export function CanvasContainer({ children, className }: CanvasContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto px-4 py-6",
        className
      )}
    >
      {children}
    </div>
  )
}
