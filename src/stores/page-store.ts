import { create } from 'zustand'
import { temporal } from 'zundo'
import throttle from 'lodash.throttle'
import type { Card, CardType, CardSize, HorizontalPosition, MusicCardContent, ReleaseCardContent } from '@/types/card'
import { DEFAULT_EMAIL_COLLECTION_CONTENT } from '@/types/fan-tools'
import { DEFAULT_AUDIO_CONTENT } from '@/types/audio'
import { CARD_TYPE_SIZING } from '@/types/card'
import type { ScatterPosition, ScatterLayouts } from '@/types/scatter'
import type { ThemeId } from '@/types/theme'
import { generateKeyBetween } from 'fractional-indexing'
import { generateAppendKey, generateMoveKey, generateInsertKey, sortCardsBySortKey, hasDuplicateSortKeys, normalizeSortKeys } from '@/lib/ordering'
import { getRandomWordArtStyle } from '@/lib/word-art-styles'
import { useThemeStore } from '@/stores/theme-store'
import { generateId } from '@/lib/utils'

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
  reorderCards: (activeId: string, overId: string) => void
  reorderMultipleCards: (cardIds: string[], targetIndex: number) => void
  updateCardPosition: (id: string, position: HorizontalPosition) => void
  selectCard: (id: string | null) => void
  setTheme: (theme: Theme) => void
  markSaved: () => void
  discardChanges: () => void
  clearCardColorOverrides: () => void
  setAllCardsTransparency: (transparent: boolean) => void
  updateCardScatterPosition: (cardId: string, themeId: string, position: Partial<ScatterPosition>) => void
  initializeScatterLayout: (themeId: string) => void
  copyScatterPositions: (fromThemeId: string, toThemeId: string) => void

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
        case 'audio':
          return { ...DEFAULT_AUDIO_CONTENT }
        case 'music':
          return {
            platform: undefined,
            embedUrl: undefined,
          } satisfies MusicCardContent
        case 'email-collection':
          return { ...DEFAULT_EMAIL_COLLECTION_CONTENT }
        case 'release':
          return {
            showCountdown: true,
            preSaveButtonText: 'Pre-save',
          } satisfies Partial<ReleaseCardContent>
        default:
          return {}
      }
    })()

    // When word-art theme is active, assign a random word art style to the card
    const currentThemeId = useThemeStore.getState().themeId
    if (currentThemeId === 'word-art') {
      defaultContent.wordArtStyle = getRandomWordArtStyle()
    }

    const newCard: Card = {
      id: generateId(),
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
      id: generateId(),
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

  reorderCards: (activeId, overId) => set((state) => {
    if (activeId === overId) return state

    // Sort cards to find positions
    let cards = state.cards
    if (hasDuplicateSortKeys(cards)) {
      const keyMap = normalizeSortKeys(cards)
      cards = cards.map((c) => ({ ...c, sortKey: keyMap.get(c.id)! }))
    }

    const sorted = sortCardsBySortKey(cards)
    const movedCard = sorted.find((c) => c.id === activeId)
    if (!movedCard) return state

    // Find the target index: where overId currently sits in the sorted list
    const newIndex = sorted.findIndex((c) => c.id === overId)
    if (newIndex === -1) return state

    // Generate new sort key for the moved card at the target position
    const newSortKey = generateMoveKey(cards, activeId, newIndex)

    return {
      cards: cards.map((c) =>
        c.id === activeId
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

  updateCardScatterPosition: (cardId, themeId, position) => set((state) => ({
    cards: state.cards.map(card => {
      if (card.id !== cardId) return card
      const currentLayouts = (card.content as Record<string, unknown>).scatterLayouts as ScatterLayouts || {}
      const currentPosition = currentLayouts[themeId as ThemeId]
      return {
        ...card,
        content: {
          ...card.content,
          scatterLayouts: {
            ...currentLayouts,
            [themeId]: {
              ...currentPosition,
              ...position,
            }
          }
        }
      }
    }),
    hasChanges: true,
  })),

  initializeScatterLayout: (themeId) => set((state) => {
    const cardCount = state.cards.length
    if (cardCount === 0) return state

    // Simulate flex-wrap flow grid layout so scatter positions match the ordered view.
    // The flow grid uses flex-wrap with gap-4 (16px ≈ 4.66% of ~343px editor canvas).
    const GAP_PCT = 4.66
    const SMALL_WIDTH = (100 - GAP_PCT) / 2 // ≈ 47.67% — matches calc(50% - 0.5rem)

    // Width mapping to match flow grid sizing
    function getFlowWidth(card: Card): number {
      // Fit-content cards in scatter mode use width as scale factor
      if (card.card_type === 'text' || card.card_type === 'social-icons') return 100
      if (card.card_type === 'mini') return 20
      // Full-width types
      if (card.card_type === 'link' || card.card_type === 'horizontal') return 100
      if (CARD_TYPE_SIZING[card.card_type] === null) return 100
      // Size-based: big = full width, small = half row
      return card.size !== 'small' ? 100 : SMALL_WIDTH
    }

    // Estimated card heights as % of viewport (for row stacking)
    function getEstimatedHeight(card: Card): number {
      const isSmall = card.size === 'small'
      switch (card.card_type) {
        case 'hero': return isSmall ? 25 : 38
        case 'square': return isSmall ? 30 : 60
        case 'horizontal': return 13
        case 'link': return 11
        case 'text': return 8
        case 'mini': return 6
        case 'video': return isSmall ? 25 : 38
        case 'gallery': return isSmall ? 38 : 60
        case 'game': return isSmall ? 30 : 50
        case 'audio': return 30
        case 'music': return 12
        case 'release': return isSmall ? 30 : 50
        case 'email-collection': return 22
        case 'social-icons': return 8
        default: return 15
      }
    }

    // Sort cards to match flow grid order and simulate flex-wrap
    const sorted = sortCardsBySortKey(state.cards)
    const visible = sorted.filter(c => c.is_visible)
    const positions = new Map<string, ScatterPosition>()

    let currentX = 0
    let currentY = 0
    let rowMaxHeight = 0

    visible.forEach((card, index) => {
      const width = getFlowWidth(card)
      const height = getEstimatedHeight(card)

      // Check if card fits in remaining row space
      if (currentX > 0 && currentX + width > 100 + 0.5) {
        // Start new row
        currentY += rowMaxHeight + GAP_PCT
        currentX = 0
        rowMaxHeight = 0
      }

      positions.set(card.id, {
        x: currentX,
        y: currentY,
        width,
        height: 10,
        zIndex: index,
      })

      rowMaxHeight = Math.max(rowMaxHeight, height)

      if (width >= 100) {
        // Full-width card: advance to next row
        currentY += height + GAP_PCT
        currentX = 0
        rowMaxHeight = 0
      } else {
        currentX += width + GAP_PCT
      }
    })

    // Apply positions to cards that don't already have scatter positions
    return {
      cards: state.cards.map(card => {
        const currentLayouts = (card.content as Record<string, unknown>).scatterLayouts as ScatterLayouts || {}
        if (currentLayouts[themeId as ThemeId]) {
          return card // Already initialized, skip
        }

        const pos = positions.get(card.id)
        if (!pos) return card // Hidden card, skip

        return {
          ...card,
          content: {
            ...card.content,
            scatterLayouts: {
              ...currentLayouts,
              [themeId]: pos,
            }
          },
          updated_at: new Date().toISOString(),
        }
      }),
      hasChanges: true,
    }
  }),

  copyScatterPositions: (fromThemeId, toThemeId) => set((state) => {
    let changed = false
    const updatedCards = state.cards.map((card) => {
      const currentLayouts = (card.content as Record<string, unknown>).scatterLayouts as ScatterLayouts || {}
      const sourcePos = currentLayouts[fromThemeId as ThemeId]
      if (sourcePos) {
        changed = true
        return {
          ...card,
          content: {
            ...card.content,
            scatterLayouts: {
              ...currentLayouts,
              [toThemeId]: { ...sourcePos },
            }
          },
          updated_at: new Date().toISOString(),
        }
      }
      return card
    })
    if (!changed) return state
    return { cards: updatedCards, hasChanges: true }
  }),

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
