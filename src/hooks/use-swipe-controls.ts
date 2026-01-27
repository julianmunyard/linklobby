"use client"

import { useRef, useCallback } from "react"

export type SwipeDirection = "up" | "down" | "left" | "right"

interface UseSwipeControlsOptions {
  onSwipe: (direction: SwipeDirection) => void
  minSwipeDistance?: number
}

export function useSwipeControls({
  onSwipe,
  minSwipeDistance = 50,
}: UseSwipeControlsOptions) {
  const touchStartRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y

      // Determine if swipe is primarily horizontal or vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          onSwipe(deltaX > 0 ? "right" : "left")
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          onSwipe(deltaY > 0 ? "down" : "up")
        }
      }
    },
    [onSwipe, minSwipeDistance]
  )

  return {
    handleTouchStart,
    handleTouchEnd,
  }
}
