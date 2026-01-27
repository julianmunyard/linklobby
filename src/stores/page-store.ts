import { create } from 'zustand'
import { temporal } from 'zundo'
import throttle from 'lodash.throttle'
import type { Card, CardType, CardSize, HorizontalPosition, DropdownCardContent } from '@/types/card'
import { CARD_TYPE_SIZING, isDropdownContent } from '@/types/card'
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
  updateCardPosition: (id: string, position: HorizontalPosition) => void
  selectCard: (id: string | null) => void
  setTheme: (theme: Theme) => void
  markSaved: () => void
  discardChanges: () => void

  // Dropdown actions
  moveCardToDropdown: (cardId: string, dropdownId: string) => void
  removeCardFromDropdown: (cardId: string) => void
  addCardToDropdown: (dropdownId: string, type: CardType, size?: CardSize) => string

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
    // Card types with null sizing (horizontal, dropdown, audio) always use 'big'
    const effectiveSize = CARD_TYPE_SIZING[type] === null ? 'big' : size

    // Type-specific default content (text and vertical alignment)
    const defaultContent: Record<string, unknown> = (() => {
      switch (type) {
        case 'hero':
        case 'square':
          return { textAlign: 'center', verticalAlign: 'bottom' }
        case 'horizontal':
          return { textAlign: 'left', verticalAlign: 'middle' }
        case 'link':
          return { textAlign: 'center', verticalAlign: 'middle' }
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

  getSortedCards: () => {
    return sortCardsBySortKey(get().cards)
  },

  getSnapshot: () => {
    const { cards, theme, selectedCardId } = get()
    return { cards: sortCardsBySortKey(cards), theme, selectedCardId }
  },

  // Dropdown management actions
  moveCardToDropdown: (cardId, dropdownId) => set((state) => {
    const card = state.cards.find((c) => c.id === cardId)
    const dropdown = state.cards.find((c) => c.id === dropdownId)

    if (!card || !dropdown || !isDropdownContent(dropdown.content)) {
      return state
    }

    const dropdownContent = dropdown.content as DropdownCardContent

    // Get dropdown's child cards for sorting context
    const dropdownChildren = state.cards.filter((c) =>
      dropdownContent.childCardIds?.includes(c.id)
    )

    return {
      cards: state.cards.map((c) => {
        // Update the card being moved
        if (c.id === cardId) {
          return {
            ...c,
            parentDropdownId: dropdownId,
            sortKey: generateAppendKey(dropdownChildren),
            updated_at: new Date().toISOString(),
          }
        }

        // Remove card from its previous dropdown's childCardIds if it had one
        if (c.id === card.parentDropdownId && isDropdownContent(c.content)) {
          const prevContent = c.content as DropdownCardContent
          const updatedChildIds = prevContent.childCardIds.filter(id => id !== cardId)
          return {
            ...c,
            content: { ...c.content, childCardIds: updatedChildIds },
            updated_at: new Date().toISOString(),
          }
        }

        // Add card to new dropdown's childCardIds
        if (c.id === dropdownId) {
          const updatedChildIds = [...dropdownContent.childCardIds, cardId]
          return {
            ...c,
            content: { ...c.content, childCardIds: updatedChildIds },
            updated_at: new Date().toISOString(),
          }
        }

        return c
      }),
      hasChanges: true,
    }
  }),

  removeCardFromDropdown: (cardId) => set((state) => {
    const card = state.cards.find((c) => c.id === cardId)

    if (!card || !card.parentDropdownId) {
      return state
    }

    const parentDropdown = state.cards.find((c) => c.id === card.parentDropdownId)

    if (!parentDropdown || !isDropdownContent(parentDropdown.content)) {
      return state
    }

    // Get main canvas cards for sorting context
    const mainCanvasCards = state.cards.filter((c) => !c.parentDropdownId)

    return {
      cards: state.cards.map((c) => {
        // Update the card being removed from dropdown
        if (c.id === cardId) {
          return {
            ...c,
            parentDropdownId: null,
            sortKey: generateAppendKey(mainCanvasCards),
            updated_at: new Date().toISOString(),
          }
        }

        // Remove card from dropdown's childCardIds
        if (c.id === card.parentDropdownId && isDropdownContent(c.content)) {
          const dropContent = c.content as DropdownCardContent
          const updatedChildIds = dropContent.childCardIds.filter(id => id !== cardId)
          return {
            ...c,
            content: { ...c.content, childCardIds: updatedChildIds },
            updated_at: new Date().toISOString(),
          }
        }

        return c
      }),
      hasChanges: true,
    }
  }),

  addCardToDropdown: (dropdownId, type, size = 'big') => {
    const state = get()
    const dropdown = state.cards.find((c) => c.id === dropdownId)

    if (!dropdown || !isDropdownContent(dropdown.content)) {
      return ''
    }

    const dropdownContent = dropdown.content as DropdownCardContent

    // Card types with null sizing always use 'big'
    const effectiveSize = CARD_TYPE_SIZING[type] === null ? 'big' : size

    // Type-specific default content
    const defaultContent: Record<string, unknown> = (() => {
      switch (type) {
        case 'hero':
        case 'square':
          return { textAlign: 'center', verticalAlign: 'bottom' }
        case 'horizontal':
          return { textAlign: 'left', verticalAlign: 'middle' }
        case 'link':
          return { textAlign: 'center', verticalAlign: 'middle' }
        default:
          return {}
      }
    })()

    // Get dropdown's child cards for sorting context
    const dropdownChildren = state.cards.filter((c) =>
      dropdownContent.childCardIds?.includes(c.id)
    )

    const newCard: Card = {
      id: crypto.randomUUID(),
      page_id: '',
      card_type: type,
      title: null,
      description: null,
      url: null,
      content: defaultContent,
      size: effectiveSize,
      position: 'left',
      sortKey: generateAppendKey(dropdownChildren),
      parentDropdownId: dropdownId,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    set({
      cards: [
        ...state.cards.map((c) => {
          // Add new card ID to dropdown's childCardIds
          if (c.id === dropdownId && isDropdownContent(c.content)) {
            const content = c.content as DropdownCardContent
            return {
              ...c,
              content: { ...c.content, childCardIds: [...content.childCardIds, newCard.id] },
              updated_at: new Date().toISOString(),
            }
          }
          return c
        }),
        newCard,
      ],
      selectedCardId: newCard.id,
      hasChanges: true,
    })

    return newCard.id
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
