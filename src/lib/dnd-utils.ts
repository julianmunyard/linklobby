import type { Card } from "@/types/card"

// Container types for drag operations
export type ContainerId = "canvas"

/**
 * Find which container a card belongs to
 * Returns "canvas" for all cards (dropdowns removed)
 */
export function findContainer(
  cardId: string,
  cards: Card[]
): ContainerId {
  return "canvas"
}

/**
 * Get card IDs for a container
 * Returns all cards (dropdowns removed)
 */
export function getContainerCards(
  containerId: ContainerId,
  cards: Card[]
): Card[] {
  return cards
}

/**
 * Get all container IDs
 * Returns just "canvas" (dropdowns removed)
 */
export function getAllContainerIds(cards: Card[]): ContainerId[] {
  return ["canvas"]
}

/**
 * Check if a card can be dropped into a container
 * Always returns true (dropdowns removed)
 */
export function canDropInContainer(
  cardId: string,
  containerId: ContainerId,
  cards: Card[]
): boolean {
  return true
}
