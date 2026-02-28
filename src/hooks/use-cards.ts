// src/hooks/use-cards.ts
"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { sortCardsBySortKey } from "@/lib/ordering"
import { migrateToMacintosh } from "@/lib/card-migration"
import type { Card } from "@/types/card"

/**
 * Retry an async operation with exponential backoff
 * @param operation Function to retry
 * @param maxRetries Maximum retry attempts (default 3)
 * @returns Promise that resolves with operation result or rejects after all retries exhausted
 */
async function saveWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      }
    }
  }
  throw lastError
}

export function useCards() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setCards = usePageStore((state) => state.setCards)
  const rawCards = usePageStore((state) => state.cards)
  const hasChanges = usePageStore((state) => state.hasChanges)
  const markSaved = usePageStore((state) => state.markSaved)

  // Sort cards in useMemo to avoid infinite loop
  const cards = useMemo(() => sortCardsBySortKey(rawCards), [rawCards])

  // Load cards on mount
  useEffect(() => {
    async function loadCards() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/cards")
        if (!response.ok) {
          throw new Error("Failed to fetch cards")
        }

        const { cards: fetchedCards } = await response.json()

        // If already on macintosh, migrate any non-mac cards into notepad
        const currentTheme = useThemeStore.getState().themeId
        if (currentTheme === 'macintosh') {
          const hasUnmigrated = fetchedCards.some(
            (c: Card) => c.is_visible && (c.url || c.title) && !(c.content as Record<string, unknown>)?.macWindowStyle
          )
          if (hasUnmigrated) {
            setCards(migrateToMacintosh(fetchedCards))
          } else {
            setCards(fetchedCards)
          }
        } else {
          setCards(fetchedCards)
        }
        // Mark as saved since we just loaded from DB
        markSaved()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    loadCards()
  }, [setCards, markSaved])

  // Save all cards to database with retry logic
  const saveCards = useCallback(async () => {
    try {
      setError(null)

      // Snapshot cards reference before save — used to detect concurrent changes
      const cardsSnapshot = usePageStore.getState().cards

      // For each card, upsert in database with retry (handles both new and existing cards)
      const promises = cardsSnapshot.map((card) =>
        saveWithRetry(() =>
          fetch(`/api/cards/${card.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              card_type: card.card_type,
              title: card.title,
              description: card.description,
              url: card.url,
              content: card.content,
              size: card.size,
              position: card.position,
              sortKey: card.sortKey,
              is_visible: card.is_visible,
            }),
          }).then(async response => {
            if (!response.ok) {
              const body = await response.text().catch(() => '')
              // Try to extract JSON error message
              let errorMsg = `${response.status}`
              try {
                const json = JSON.parse(body)
                if (json.error) errorMsg = json.error
              } catch {
                if (body.length < 200) errorMsg = body || errorMsg
              }
              throw new Error(`Card save failed (${response.status}): ${errorMsg}`)
            }
            return response
          })
        )
      )

      await Promise.all(promises)

      // Only mark as saved if no new changes came in during the async save.
      // If cards changed (e.g. scatter position update during save), hasChanges
      // stays true so auto-save will re-trigger and capture the new state.
      if (usePageStore.getState().cards === cardsSnapshot) {
        markSaved()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save"
      setError(message)
      toast.error(`Save failed: ${message}`)
      throw err
    }
  }, [markSaved])

  // Create a new card
  const createCard = useCallback(
    async (card: Omit<Card, "id" | "page_id" | "created_at" | "updated_at">) => {
      try {
        const response = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(card),
        })

        if (!response.ok) {
          throw new Error("Failed to create card")
        }

        const { card: newCard } = await response.json()
        return newCard as Card
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create")
        throw err
      }
    },
    []
  )

  // Delete a card
  const removeCard = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete card")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
      throw err
    }
  }, [])

  return {
    cards,
    isLoading,
    error,
    hasChanges,
    saveCards,
    createCard,
    removeCard,
  }
}
