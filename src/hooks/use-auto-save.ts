"use client"

import { useEffect, useRef } from "react"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { useCards } from "./use-cards"
import { toast } from "sonner"

export function useAutoSave(debounceMs = 500) {
  const cardHasChanges = usePageStore((state) => state.hasChanges)
  const profileHasChanges = useProfileStore((state) => state.hasChanges)
  const { saveCards, isLoading } = useCards()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)

  // Combined check for any changes
  const hasChanges = cardHasChanges || profileHasChanges

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
        // Save cards if changed
        if (usePageStore.getState().hasChanges) {
          await saveCards()
        }

        // Save profile if changed
        if (useProfileStore.getState().hasChanges) {
          const profile = useProfileStore.getState().getSnapshot()
          const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
          })
          if (!response.ok) throw new Error('Failed to save profile')
          useProfileStore.getState().markSaved()
        }
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
