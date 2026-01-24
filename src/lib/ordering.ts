// src/lib/ordering.ts
import { generateKeyBetween } from 'fractional-indexing'
import type { Card } from '@/types/card'

/**
 * Sort cards by their sort key using string comparison
 */
export function sortCardsBySortKey(cards: Card[]): Card[] {
  return [...cards].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  )
}

/**
 * Generate a sort key for a new card at the end of the list
 */
export function generateAppendKey(cards: Card[]): string {
  if (cards.length === 0) {
    return generateKeyBetween(null, null)
  }
  const sorted = sortCardsBySortKey(cards)
  const lastKey = sorted[sorted.length - 1].sortKey
  return generateKeyBetween(lastKey, null)
}

/**
 * Generate a sort key for inserting at a specific index
 */
export function generateInsertKey(cards: Card[], targetIndex: number): string {
  const sorted = sortCardsBySortKey(cards)
  const above = targetIndex > 0 ? sorted[targetIndex - 1].sortKey : null
  const below = targetIndex < sorted.length ? sorted[targetIndex].sortKey : null
  return generateKeyBetween(above, below)
}

/**
 * Generate a new sort key after moving a card to a new position
 * @param cards All cards (including the one being moved)
 * @param movedCardId The ID of the card being moved
 * @param newIndex The target index in the sorted list
 */
export function generateMoveKey(
  cards: Card[],
  movedCardId: string,
  newIndex: number
): string {
  // Filter out the moved card, then find neighbors at new position
  const otherCards = cards.filter((c) => c.id !== movedCardId)
  const sorted = sortCardsBySortKey(otherCards)

  const above = newIndex > 0 ? sorted[newIndex - 1]?.sortKey ?? null : null
  const below = sorted[newIndex]?.sortKey ?? null

  return generateKeyBetween(above, below)
}
