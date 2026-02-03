"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePageStore } from "@/stores/page-store"
import { useProfileStore } from "@/stores/profile-store"
import { useThemeStore } from "@/stores/theme-store"
import { useCards } from "./use-cards"
import { toast } from "sonner"

// Shared save function that can be called from anywhere
async function performSave(saveCards: () => Promise<void>) {
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save profile')
      }
      useProfileStore.getState().markSaved()
    }

    // Save theme if changed
    if (useThemeStore.getState().hasChanges) {
      const theme = useThemeStore.getState().getSnapshot()
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save theme')
      }
      useThemeStore.getState().markSaved()
    }
    return true
  } catch (error) {
    console.error("Auto-save error:", error)
    toast.error("Auto-save failed")
    return false
  }
}

export function useAutoSave(debounceMs = 1000) {
  const cardHasChanges = usePageStore((state) => state.hasChanges)
  const profileHasChanges = useProfileStore((state) => state.hasChanges)
  const themeHasChanges = useThemeStore((state) => state.hasChanges)
  const { saveCards, isLoading } = useCards()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)
  const pendingChangesRef = useRef(false)

  // Combined check for any changes
  const hasChanges = cardHasChanges || profileHasChanges || themeHasChanges

  // Track if there are pending changes
  useEffect(() => {
    if (hasChanges) {
      pendingChangesRef.current = true
    }
  }, [hasChanges])

  // Immediate save function (for blur events)
  const flushSave = useCallback(async () => {
    if (!pendingChangesRef.current || isSavingRef.current || isLoading) return

    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    isSavingRef.current = true
    const success = await performSave(saveCards)
    isSavingRef.current = false

    if (success) {
      pendingChangesRef.current = false
    }
  }, [saveCards, isLoading])

  // Debounced auto-save
  useEffect(() => {
    // Don't auto-save if still loading initial data or already saving
    if (isLoading || isSavingRef.current) return
    if (!hasChanges) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return

      isSavingRef.current = true
      const success = await performSave(saveCards)
      isSavingRef.current = false

      if (success) {
        pendingChangesRef.current = false
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hasChanges, cardHasChanges, profileHasChanges, themeHasChanges, saveCards, debounceMs, isLoading])

  // Add global blur listener to save when user clicks away from inputs
  useEffect(() => {
    function handleFocusOut(e: FocusEvent) {
      // Check if focus is leaving an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Small delay to allow form state to update
        setTimeout(() => {
          if (pendingChangesRef.current && !isSavingRef.current) {
            flushSave()
          }
        }, 100)
      }
    }

    document.addEventListener('focusout', handleFocusOut)
    return () => document.removeEventListener('focusout', handleFocusOut)
  }, [flushSave])

  // Add beforeunload handler to try saving before page refresh/close
  useEffect(() => {
    function handleBeforeUnload() {
      const cardChanges = usePageStore.getState().hasChanges
      const profileChanges = useProfileStore.getState().hasChanges
      const themeChanges = useThemeStore.getState().hasChanges

      // Try to save using sendBeacon (no dialog, just best-effort save)
      if (cardChanges) {
        const cards = usePageStore.getState().cards
        navigator.sendBeacon('/api/cards', JSON.stringify({ cards }))
      }

      if (profileChanges) {
        const profile = useProfileStore.getState().getSnapshot()
        navigator.sendBeacon('/api/profile', JSON.stringify(profile))
      }

      if (themeChanges) {
        const theme = useThemeStore.getState().getSnapshot()
        navigator.sendBeacon('/api/theme', JSON.stringify({ theme }))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return { flushSave }
}
