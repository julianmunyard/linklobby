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

const defaultThemeId: ThemeId = 'sleek-modern'
const defaultDefaults = getThemeDefaults(defaultThemeId)

const initialState: ThemeState = {
  themeId: defaultThemeId,
  paletteId: 'frosted-glass',
  colors: defaultDefaults?.colors ?? {
    background: 'oklch(0.15 0 0)',
    cardBg: 'oklch(0.25 0 0 / 0.6)',
    text: 'oklch(0.95 0 0)',
    accent: 'oklch(0.75 0.20 180)',
    border: 'oklch(0.50 0 0 / 0.3)',
    link: 'oklch(0.80 0.18 200)',
  },
  fonts: defaultDefaults?.fonts ?? {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    headingSize: 1,
    bodySize: 1,
    headingWeight: 'normal',
  },
  style: defaultDefaults?.style ?? {
    borderRadius: 16,
    shadowEnabled: false,
    blurIntensity: 12,
  },
  background: {
    type: 'solid',
    value: 'oklch(0.15 0 0)', // Dark background by default
  },
  cardTypeFontSizes: {
    hero: 1,
    square: 1,
    horizontal: 1,
    link: 1,
    gallery: 1,
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

        set({
          themeId,
          paletteId: theme.palettes[0]?.id ?? null,
          colors: defaults.colors,
          fonts: defaults.fonts,
          style: defaults.style,
        })
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
        })
      },

      setColor: (key: keyof ColorPalette, value: string) => {
        set((state) => ({
          paletteId: null, // Custom color = no longer using preset
          colors: {
            ...state.colors,
            [key]: value,
          },
        }))
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
        set({ background })
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
        })
      },
    }),
    {
      name: 'linklobby-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
