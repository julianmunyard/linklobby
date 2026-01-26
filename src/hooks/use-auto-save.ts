"use client"

import { useEffect, useRef } from "react"
import { usePageStore } from "@/stores/page-store"
import { useCards } from "./use-cards"
import { toast } from "sonner"

export function useAutoSave(debounceMs = 500) {
  const hasChanges = usePageStore((state) => state.hasChanges)
  const { saveCards, isLoading } = useCards()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    // Don't auto-save if no changes, still loading initial data, or already saving
    if (!hasChanges || isLoading || isSavingRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return

      isSavingRef.current = true
      try {
        await saveCards()
        // No toast on success - subtle auto-save
      } catch {
        toast.error("Auto-save failed")
      } finally {
        isSavingRef.current = false
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hasChanges, saveCards, debounceMs, isLoading])
}
