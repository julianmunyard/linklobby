// src/hooks/use-cards.ts
"use client"

import { useEffect, useState, useCallback } from "react"
import { usePageStore } from "@/stores/page-store"
import type { Card } from "@/types/card"

export function useCards() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setCards = usePageStore((state) => state.setCards)
  const cards = usePageStore((state) => state.getSortedCards())
  const hasChanges = usePageStore((state) => state.hasChanges)
  const markSaved = usePageStore((state) => state.markSaved)

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
        setCards(fetchedCards)
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

  // Save all cards to database
  const saveCards = useCallback(async () => {
    try {
      setError(null)

      // Get cards from store (they may have been modified)
      const currentCards = usePageStore.getState().cards

      // For each card, update in database
      const promises = currentCards.map((card) =>
        fetch(`/api/cards/${card.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: card.title,
            description: card.description,
            url: card.url,
            content: card.content,
            size: card.size,
            sortKey: card.sortKey,
            is_visible: card.is_visible,
          }),
        })
      )

      await Promise.all(promises)
      markSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
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
