import { create } from 'zustand'
import { temporal } from 'zundo'
import throttle from 'lodash.throttle'
import type { Card, CardType, CardSize, HorizontalPosition, MusicCardContent } from '@/types/card'
import { DEFAULT_EMAIL_COLLECTION_CONTENT } from '@/types/fan-tools'
import { CARD_TYPE_SIZING } from '@/types/card'
import { generateKeyBetween } from 'fractional-indexing'
import { generateAppendKey, generateMoveKey, generateInsertKey, sortCardsBySortKey } from '@/lib/ordering'

interface Theme {
  id: string
  name: string
}

const defaultTheme: Theme = {
  id: 'sleek',
  name: 'Sleek Modern'
}

interface PageState {
  // Data
  cards: Card[]
  theme: Theme
  selectedCardId: string | null

  // Tracking
  hasChanges: boolean
  lastSavedAt: number | null

  // Actions
  setCards: (cards: Card[]) => void
  addCard: (type: CardType, size?: CardSize) => void
  updateCard: (id: string, updates: Partial<Card>) => void
  removeCard: (id: string) => void
  duplicateCard: (id: string) => void
  reorderCards: (oldIndex: number, newIndex: number) => void
  reorderMultipleCards: (cardIds: string[], targetIndex: number) => void
  updateCardPosition: (id: string, position: HorizontalPosition) => void
  selectCard: (id: string | null) => void
  setTheme: (theme: Theme) => void
  markSaved: () => void
  discardChanges: () => void
  clearCardColorOverrides: () => void
  setAllCardsTransparency: (transparent: boolean) => void

  // Computed
  getSortedCards: () => Card[]
  getSnapshot: () => { cards: Card[]; theme: Theme }
}

export const usePageStore = create<PageState>()(
  temporal(
    (set, get) => ({
  cards: [],
  theme: defaultTheme,
  selectedCardId: null,
  hasChanges: false,
  lastSavedAt: null,

  setCards: (cards) => set({ cards, hasChanges: true }),

  addCard: (type, size = 'big') => set((state) => {
    // Card types with null sizing (horizontal, audio) always use 'big'
    const effectiveSize = CARD_TYPE_SIZING[type] === null ? 'big' : size

    // Type-specific default content (text and vertical alignment)
    const defaultContent: Record<string, unknown> = (() => {
      switch (type) {
        case 'hero':
        case 'square':
        case 'horizontal':
        case 'link':
        case 'video':
          return { textAlign: 'center', verticalAlign: 'center' }
        case 'game':
          return { gameType: 'snake' }
        case 'music':
          return {
            platform: undefined,
            embedUrl: undefined,
          } satisfies MusicCardContent
        case 'email-collection':
          return { ...DEFAULT_EMAIL_COLLECTION_CONTENT }
        default:
          return {}
      }
    })()

    const newCard: Card = {
      id: crypto.randomUUID(),
      page_id: '', // Set when saving to DB
      card_type: type,
      title: null,
      description: null,
      url: null,
      content: defaultContent,
      size: effectiveSize,
      position: 'left',  // default position for small cards
      sortKey: generateAppendKey(state.cards),
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return {
      cards: [...state.cards, newCard],
      selectedCardId: newCard.id,
      hasChanges: true
    }
  }),

  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map((c) => {
      if (c.id !== id) return c

      let effectiveUpdates = { ...updates }

      // Determine the effective card type (new type if changing, otherwise current)
      const effectiveCardType = updates.card_type ?? c.card_type

      // Force size to 'big' for card types that don't support sizing
      if (CARD_TYPE_SIZING[effectiveCardType] === null) {
        effectiveUpdates.size = 'big'
      }

      return { ...c, ...effectiveUpdates, updated_at: new Date().toISOString() }
    }),
    hasChanges: true,
  })),

  removeCard: (id) => set((state) => ({
    cards: state.cards.filter((c) => c.id !== id),
    selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
    hasChanges: true,
  })),

  duplicateCard: (id) => set((state) => {
    const cardToDuplicate = state.cards.find((c) => c.id === id)
    if (!cardToDuplicate) return state

    // Find the index of the original card in sorted order
    const sorted = sortCardsBySortKey(state.cards)
    const originalIndex = sorted.findIndex((c) => c.id === id)

    // Generate a sort key that positions the duplicate AFTER the original
    const newSortKey = generateInsertKey(state.cards, originalIndex + 1)

    const newCard: Card = {
      ...cardToDuplicate,
      id: crypto.randomUUID(),
      sortKey: newSortKey,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return {
      cards: [...state.cards, newCard],
      selectedCardId: newCard.id,
      hasChanges: true,
    }
  }),

  reorderCards: (oldIndex, newIndex) => set((state) => {
    const sorted = sortCardsBySortKey(state.cards)
    const movedCard = sorted[oldIndex]
    if (!movedCard) return state

    // Generate new sort key for the moved card
    const newSortKey = generateMoveKey(state.cards, movedCard.id, newIndex)

    return {
      cards: state.cards.map((c) =>
        c.id === movedCard.id
          ? { ...c, sortKey: newSortKey, updated_at: new Date().toISOString() }
          : c
      ),
      hasChanges: true,
    }
  }),

  reorderMultipleCards: (cardIds, targetIndex) => set((state) => {
    if (cardIds.length === 0) return state

    const sorted = sortCardsBySortKey(state.cards)
    const cardIdSet = new Set(cardIds)

    // Filter out the cards being moved
    const remainingCards = sorted.filter(c => !cardIdSet.has(c.id))

    // Get the moved cards in their current order
    const movedCards = sorted.filter(c => cardIdSet.has(c.id))

    // Calculate target position (clamped to valid range)
    const clampedTarget = Math.max(0, Math.min(targetIndex, remainingCards.length))

    // Find bounds at target position
    const aboveKey = clampedTarget > 0 ? remainingCards[clampedTarget - 1]?.sortKey ?? null : null
    const belowKey = remainingCards[clampedTarget]?.sortKey ?? null

    // Generate consecutive sort keys for all moved cards
    const now = new Date().toISOString()
    const newSortKeys = new Map<string, string>()

    // Generate keys one by one, each between the previous and the below key
    let prevKey = aboveKey
    for (const card of movedCards) {
      const newKey = generateKeyBetween(prevKey, belowKey)
      newSortKeys.set(card.id, newKey)
      prevKey = newKey
    }

    // Update only the moved cards with their new sort keys
    const updatedCards = state.cards.map(card => {
      const newSortKey = newSortKeys.get(card.id)
      if (!newSortKey) return card

      return {
        ...card,
        sortKey: newSortKey,
        updated_at: now,
      }
    })

    return {
      cards: updatedCards,
      hasChanges: true,
    }
  }),

  updateCardPosition: (id, position) => set((state) => ({
    cards: state.cards.map((c) =>
      c.id === id
        ? { ...c, position, updated_at: new Date().toISOString() }
        : c
    ),
    hasChanges: true,
  })),

  selectCard: (id) => set({ selectedCardId: id }),

  setTheme: (theme) => set({ theme, hasChanges: true }),

  markSaved: () => set({ hasChanges: false, lastSavedAt: Date.now() }),

  discardChanges: () => {
    // In future: reset to last saved state from DB
    set({ hasChanges: false })
  },

  clearCardColorOverrides: () => set((state) => ({
    cards: state.cards.map((card) => {
      const content = { ...card.content }
      // Remove textColor override from card content
      delete content.textColor
      // Also remove captionColor for gallery cards
      delete content.captionColor
      return {
        ...card,
        content,
        updated_at: new Date().toISOString(),
      }
    }),
    hasChanges: true,
  })),

  setAllCardsTransparency: (transparent) => set((state) => ({
    cards: state.cards.map((card) => ({
      ...card,
      content: {
        ...card.content,
        transparentBackground: transparent,
      },
      updated_at: new Date().toISOString(),
    })),
    hasChanges: true,
  })),

  getSortedCards: () => {
    return sortCardsBySortKey(get().cards)
  },

  getSnapshot: () => {
    const { cards, theme, selectedCardId } = get()
    return { cards: sortCardsBySortKey(cards), theme, selectedCardId }
  },
    }),
    {
      // Only track cards array in history (not UI state like selectedCardId, hasChanges)
      partialize: (state) => ({ cards: state.cards }),
      // Throttle history updates to batch rapid field edits (500ms delay)
      handleSet: (handleSet) =>
        throttle<typeof handleSet>(handleSet, 500, {
          leading: false,
          trailing: true,
        }),
      // Limit history depth to 50 entries
      limit: 50,
    }
  )
)
