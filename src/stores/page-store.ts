import { create } from 'zustand'

// Placeholder types - will be refined when cards are implemented
interface Card {
  id: string
  type: string
  position: { x: number; y: number }
  content: Record<string, unknown>
}

interface Theme {
  id: string
  name: string
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default'
}

interface PageState {
  // Data
  cards: Card[]
  theme: Theme

  // Tracking
  hasChanges: boolean
  lastSavedAt: number | null

  // Actions
  setCards: (cards: Card[]) => void
  addCard: (card: Card) => void
  updateCard: (id: string, updates: Partial<Card>) => void
  removeCard: (id: string) => void
  setTheme: (theme: Theme) => void
  markSaved: () => void
  discardChanges: () => void

  // For preview sync
  getSnapshot: () => { cards: Card[]; theme: Theme }
}

export const usePageStore = create<PageState>()((set, get) => ({
  cards: [],
  theme: defaultTheme,
  hasChanges: false,
  lastSavedAt: null,

  setCards: (cards) => set({ cards, hasChanges: true }),

  addCard: (card) => set((state) => ({
    cards: [...state.cards, card],
    hasChanges: true
  })),

  updateCard: (id, updates) => set((state) => ({
    cards: state.cards.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
    hasChanges: true,
  })),

  removeCard: (id) => set((state) => ({
    cards: state.cards.filter((c) => c.id !== id),
    hasChanges: true,
  })),

  setTheme: (theme) => set({ theme, hasChanges: true }),

  markSaved: () => set({ hasChanges: false, lastSavedAt: Date.now() }),

  discardChanges: () => {
    // In future: reset to last saved state from DB
    // For now: just clear the flag
    set({ hasChanges: false })
  },

  getSnapshot: () => {
    const { cards, theme } = get()
    return { cards, theme }
  },
}))
