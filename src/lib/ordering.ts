// src/lib/ordering.ts
import { generateKeyBetween } from 'fractional-indexing'
import type { Card } from '@/types/card'

/**
 * Sort cards by their sort key using string comparison
 */
export function sortCardsBySortKey(cards: Card[]): Card[] {
  // Debug: check for missing sortKeys
  const missingKeys = cards.filter(c => !c.sortKey)
  if (missingKeys.length > 0) {
    console.warn('[sortCardsBySortKey] Cards missing sortKey:', missingKeys.map(c => c.title))
  }

  return [...cards].sort((a, b) => {
    // Handle missing sortKeys - put them at the end
    if (!a.sortKey && !b.sortKey) return 0
    if (!a.sortKey) return 1
    if (!b.sortKey) return -1
    return a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  })
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
 * Generate a sort key for a new card at the beginning of the list
 */
export function generatePrependKey(cards: Card[]): string {
  if (cards.length === 0) {
    return generateKeyBetween(null, null)
  }
  const sorted = sortCardsBySortKey(cards)
  const firstKey = sorted[0].sortKey
  return generateKeyBetween(null, firstKey)
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
 * Check if any sorted cards have duplicate sort keys
 */
export function hasDuplicateSortKeys(cards: Card[]): boolean {
  const sorted = sortCardsBySortKey(cards)
  return sorted.some(
    (c, i) => i > 0 && c.sortKey === sorted[i - 1].sortKey
  )
}

/**
 * Re-generate all sort keys with even spacing, preserving current order.
 * Returns a map of cardId -> newSortKey.
 */
export function normalizeSortKeys(cards: Card[]): Map<string, string> {
  const sorted = sortCardsBySortKey(cards)
  const keyMap = new Map<string, string>()
  let key = generateKeyBetween(null, null)
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0) key = generateKeyBetween(key, null)
    keyMap.set(sorted[i].id, key)
  }
  return keyMap
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
  let sorted = sortCardsBySortKey(otherCards)

  // Fix duplicate sort keys before computing position
  if (hasDuplicateSortKeys(otherCards)) {
    const keyMap = normalizeSortKeys(otherCards)
    sorted = sorted.map((c) => ({ ...c, sortKey: keyMap.get(c.id)! }))
  }

  // Handle empty list
  if (sorted.length === 0) {
    return generateKeyBetween(null, null)
  }

  // Special case: moving to position 0 (top)
  if (newIndex === 0) {
    const firstKey = sorted[0].sortKey
    return generateKeyBetween(null, firstKey)
  }

  // Special case: moving to end
  if (newIndex >= sorted.length) {
    const lastKey = sorted[sorted.length - 1].sortKey
    return generateKeyBetween(lastKey, null)
  }

  // Normal case: insert between two cards
  const above = sorted[newIndex - 1].sortKey
  const below = sorted[newIndex].sortKey

  return generateKeyBetween(above, below)
}
