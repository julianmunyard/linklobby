import { create } from 'zustand'
import type { Card, CardType, CardSize, HorizontalPosition } from '@/types/card'
import { generateAppendKey, generateMoveKey, sortCardsBySortKey } from '@/lib/ordering'

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
  reorderCards: (oldIndex: number, newIndex: number) => void
  updateCardPosition: (id: string, position: HorizontalPosition) => void
  selectCard: (id: string | null) => void
  setTheme: (theme: Theme) => void
  markSaved: () => void
  discardChanges: () => void

  // Computed
  getSortedCards: () => Card[]
  getSnapshot: () => { cards: Card[]; theme: Theme }
}

export const usePageStore = create<PageState>()((set, get) => ({
  cards: [],
  theme: defaultTheme,
  selectedCardId: null,
  hasChanges: false,
  lastSavedAt: null,

  setCards: (cards) => set({ cards, hasChanges: true }),

  addCard: (type, size = 'big') => set((state) => {
    const newCard: Card = {
      id: crypto.randomUUID(),
      page_id: '', // Set when saving to DB
      card_type: type,
      title: null,
      description: null,
      url: null,
      content: {},
      size,
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
    cards: state.cards.map((c) =>
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    ),
    hasChanges: true,
  })),

  removeCard: (id) => set((state) => ({
    cards: state.cards.filter((c) => c.id !== id),
    selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
    hasChanges: true,
  })),

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
    const { cards, theme } = get()
    return { cards: sortCardsBySortKey(cards), theme }
  },
}))
