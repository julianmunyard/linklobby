// src/stores/theme-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ThemeId,
  ColorPalette,
  FontConfig,
  StyleConfig,
  BackgroundConfig,
  CardTypeFontSizes,
  ThemeState
} from '@/types/theme'
import type { CardType } from '@/types/card'
import { getTheme, getThemeDefaults } from '@/lib/themes'

interface ThemeStore extends ThemeState {
  // Actions
  setTheme: (themeId: ThemeId) => void
  setPalette: (paletteId: string) => void
  setColor: (key: keyof ColorPalette, value: string) => void
  setFont: (key: keyof FontConfig, value: string | number) => void
  setStyle: (key: keyof StyleConfig, value: number | boolean) => void
  setBackground: (background: BackgroundConfig) => void
  setCardTypeFontSize: (cardType: keyof CardTypeFontSizes, size: number) => void
  resetToThemeDefaults: () => void
}

const defaultThemeId: ThemeId = 'instagram-reels'
const defaultDefaults = getThemeDefaults(defaultThemeId)

const initialState: ThemeState = {
  themeId: defaultThemeId,
  paletteId: 'ig-dark',
  colors: defaultDefaults?.colors ?? {
    background: 'oklch(0 0 0)',             // Pure black background
    cardBg: 'oklch(1 0 0)',                 // Pure white cards
    text: 'oklch(0 0 0)',                   // Black text on white cards
    accent: 'oklch(0.65 0.28 25)',          // Vibrant orange/red
    border: 'oklch(0.85 0 0)',              // Light border
    link: 'oklch(0.45 0.25 280)',           // Purple links (darker for white bg)
  },
  fonts: defaultDefaults?.fonts ?? {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    headingSize: 1.1,
    bodySize: 1,
    headingWeight: 'bold',
  },
  style: defaultDefaults?.style ?? {
    borderRadius: 8,
    shadowEnabled: false,
    blurIntensity: 0,
  },
  background: {
    type: 'solid',
    value: 'oklch(0 0 0)', // Pure black background by default
  },
  cardTypeFontSizes: {
    hero: 1,
    square: 1,
    horizontal: 1,
    link: 1,
    gallery: 1,
    video: 1,
  },
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTheme: (themeId: ThemeId) => {
        const theme = getTheme(themeId)
        if (!theme) return

        const defaults = getThemeDefaults(themeId)
        if (!defaults) return

        set((state) => ({
          themeId,
          paletteId: theme.palettes[0]?.id ?? null,
          colors: defaults.colors,
          fonts: defaults.fonts,
          style: defaults.style,
          // Sync background if solid
          background: state.background.type === 'solid'
            ? { ...state.background, value: defaults.colors.background }
            : state.background,
        }))
      },

      setPalette: (paletteId: string) => {
        const state = get()
        const theme = getTheme(state.themeId)
        if (!theme) return

        const palette = theme.palettes.find((p) => p.id === paletteId)
        if (!palette) return

        set({
          paletteId,
          colors: palette.colors,
          // Sync background if solid
          background: state.background.type === 'solid'
            ? { ...state.background, value: palette.colors.background }
            : state.background,
        })
      },

      setColor: (key: keyof ColorPalette, value: string) => {
        set((state) => {
          const newState: Partial<ThemeState> = {
            paletteId: null, // Custom color = no longer using preset
            colors: {
              ...state.colors,
              [key]: value,
            },
          }
          // Sync background color with background.value when type is solid
          if (key === 'background' && state.background.type === 'solid') {
            newState.background = { ...state.background, value }
          }
          return newState
        })
      },

      setFont: (key: keyof FontConfig, value: string | number) => {
        set((state) => ({
          fonts: {
            ...state.fonts,
            [key]: value,
          },
        }))
      },

      setStyle: (key: keyof StyleConfig, value: number | boolean) => {
        set((state) => ({
          style: {
            ...state.style,
            [key]: value,
          },
        }))
      },

      setBackground: (background: BackgroundConfig) => {
        set((state) => {
          const newState: Partial<ThemeState> = { background }
          // Sync solid background color with colors.background
          if (background.type === 'solid') {
            newState.colors = { ...state.colors, background: background.value }
          }
          return newState
        })
      },

      setCardTypeFontSize: (cardType: keyof CardTypeFontSizes, size: number) => {
        set((state) => ({
          cardTypeFontSizes: {
            ...state.cardTypeFontSizes,
            [cardType]: size,
          },
        }))
      },

      resetToThemeDefaults: () => {
        const state = get()
        const defaults = getThemeDefaults(state.themeId)
        if (!defaults) return

        const theme = getTheme(state.themeId)
        set({
          paletteId: theme?.palettes[0]?.id ?? null,
          colors: defaults.colors,
          fonts: defaults.fonts,
          style: defaults.style,
          // Sync background if solid
          background: state.background.type === 'solid'
            ? { ...state.background, value: defaults.colors.background }
            : state.background,
        })
      },
    }),
    {
      name: 'linklobby-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
