import type { UniqueIdentifier } from "@dnd-kit/core"
import type { Card } from "@/types/card"

// Container types for drag operations
export type ContainerId = "canvas" | string  // "canvas" or dropdown card ID

/**
 * Find which container a card belongs to
 * Returns "canvas" for main canvas cards, or dropdown ID for nested cards
 */
export function findContainer(
  cardId: string,
  cards: Card[]
): ContainerId {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return "canvas"
  return card.parentDropdownId || "canvas"
}

/**
 * Get card IDs for a container
 * For "canvas": cards without parentDropdownId
 * For dropdown ID: cards with that parentDropdownId
 */
export function getContainerCards(
  containerId: ContainerId,
  cards: Card[]
): Card[] {
  if (containerId === "canvas") {
    return cards.filter((c) => !c.parentDropdownId && c.card_type !== "dropdown")
  }
  // Return cards inside this dropdown
  return cards.filter((c) => c.parentDropdownId === containerId)
}

/**
 * Get all container IDs (canvas + all dropdown IDs)
 */
export function getAllContainerIds(cards: Card[]): ContainerId[] {
  const dropdownIds = cards
    .filter((c) => c.card_type === "dropdown")
    .map((c) => c.id)
  return ["canvas", ...dropdownIds]
}

/**
 * Check if a card can be dropped into a container
 * Dropdowns cannot be put inside dropdowns (no nesting)
 */
export function canDropInContainer(
  cardId: string,
  containerId: ContainerId,
  cards: Card[]
): boolean {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return false

  // Dropdowns cannot be nested
  if (card.card_type === "dropdown" && containerId !== "canvas") {
    return false
  }

  return true
}
