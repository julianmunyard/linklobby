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
  ThemeState,
  ReceiptSticker
} from '@/types/theme'
import type { CardType } from '@/types/card'
import { getTheme, getThemeDefaults } from '@/lib/themes'
import { useProfileStore } from '@/stores/profile-store'

// Themes where text color auto-syncs to header title and social icon color
const SYNC_TEXT_COLOR_THEMES: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings', 'blinkies']

function syncHeaderColors(themeId: ThemeId, textColor: string) {
  if (!SYNC_TEXT_COLOR_THEMES.includes(themeId)) return
  const profileStore = useProfileStore.getState()
  profileStore.setHeaderTextColor(textColor)
  profileStore.setSocialIconColor(textColor)
}

interface ThemeStore extends ThemeState {
  // Additional state (not in ThemeState type)
  socialIconSize: number  // Icon size in pixels (16-48), default 24
  centerCards: boolean  // Basic themes: vertically center cards on screen
  vcrCenterContent: boolean  // VCR theme: center content vertically
  receiptPrice: string  // Receipt theme: custom price text
  receiptStickers: ReceiptSticker[]  // Receipt theme: draggable stickers
  receiptFloatAnimation: boolean  // Receipt theme: floating animation enabled
  receiptPaperTexture: boolean  // Receipt theme: paper texture overlay enabled
  ipodStickers: ReceiptSticker[]  // iPod theme: draggable stickers
  ipodTexture: string  // iPod theme: texture overlay path
  ipodFont: string  // iPod theme: font choice ('system' or 'pix-chicago')
  macPattern: string  // Macintosh theme: pattern image path ('' = default CSS checkerboard)
  macPatternColor: string  // Macintosh theme: background color behind pattern
  wordArtTitleStyle: string  // Word Art theme: style ID for title text
  lanyardActiveView: number  // Lanyard theme: active card view index (0-4)
  classifiedStampText: string       // Classified theme: stamp text
  classifiedDeptText: string        // Classified theme: department line
  classifiedCenterText: string      // Classified theme: center line
  classifiedMessageText: string     // Classified theme: message line
  phoneHomeDock: string[]    // Phone Home theme: card IDs pinned to dock (max 3)
  phoneHomeShowDock: boolean // Phone Home theme: show dock bar
  phoneHomeVariant: 'default' | '8-bit' // Phone Home theme: visual variant
  zineBadgeText: string        // Chaotic Zine theme: badge text on first card
  zineTitleSize: number        // Chaotic Zine theme: title character size multiplier (0.5-2.0)
  zineShowDoodles: boolean     // Chaotic Zine theme: show decorative doodles/scribbles
  scatterMode: boolean       // Whether scatter (freeform) positioning is enabled
  visitorDrag: boolean       // Whether visitors can drag cards on public page
  hasChanges: boolean     // Track if theme has unsaved changes

  // Actions
  setTheme: (themeId: ThemeId) => void
  setPalette: (paletteId: string) => void
  setColor: (key: keyof ColorPalette, value: string) => void
  setFont: (key: keyof FontConfig, value: string | number | boolean) => void
  setStyle: (key: keyof StyleConfig, value: number | boolean) => void
  setBackground: (background: BackgroundConfig) => void
  setCardTypeFontSize: (cardType: keyof CardTypeFontSizes, size: number) => void
  setSocialIconSize: (size: number) => void
  setCenterCards: (center: boolean) => void
  setVcrCenterContent: (center: boolean) => void
  setReceiptPrice: (price: string) => void
  addReceiptSticker: (sticker: ReceiptSticker) => void
  updateReceiptSticker: (id: string, updates: Partial<ReceiptSticker>) => void
  removeReceiptSticker: (id: string) => void
  setReceiptFloatAnimation: (enabled: boolean) => void
  setReceiptPaperTexture: (enabled: boolean) => void
  addIpodSticker: (sticker: ReceiptSticker) => void
  updateIpodSticker: (id: string, updates: Partial<ReceiptSticker>) => void
  removeIpodSticker: (id: string) => void
  setIpodTexture: (texture: string) => void
  setIpodFont: (font: string) => void
  setMacPattern: (pattern: string) => void
  setMacPatternColor: (color: string) => void
  setWordArtTitleStyle: (style: string) => void
  setLanyardActiveView: (view: number) => void
  setClassifiedStampText: (text: string) => void
  setClassifiedDeptText: (text: string) => void
  setClassifiedCenterText: (text: string) => void
  setClassifiedMessageText: (text: string) => void
  addToDock: (cardId: string) => void
  removeFromDock: (cardId: string) => void
  setPhoneHomeShowDock: (show: boolean) => void
  setPhoneHomeVariant: (variant: 'default' | '8-bit') => void
  setZineBadgeText: (text: string) => void
  setZineTitleSize: (size: number) => void
  setZineShowDoodles: (show: boolean) => void
  setScatterMode: (enabled: boolean) => void
  setVisitorDrag: (enabled: boolean) => void
  resetToThemeDefaults: () => void

  // Database sync
  markSaved: () => void
  loadFromDatabase: (theme: ThemeState | null) => void
  getSnapshot: () => ThemeState
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
    fuzzyEnabled: false,
    fuzzyIntensity: 0.19,
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
    mini: 1,
    text: 1,
    gallery: 1,
    video: 1,
  },
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      socialIconSize: 24,
      centerCards: false,
      vcrCenterContent: false,
      receiptPrice: 'PRICELESS',
      receiptStickers: [],
      receiptFloatAnimation: true,
      receiptPaperTexture: false,
      ipodStickers: [],
      ipodTexture: '/images/metal-texture.jpeg',
      ipodFont: 'system',
      macPattern: '',
      macPatternColor: '#c0c0c0',
      wordArtTitleStyle: 'style-eleven',
      lanyardActiveView: 0,
      classifiedStampText: 'SECRET',
      classifiedDeptText: 'War Department',
      classifiedCenterText: 'Classified Message Center',
      classifiedMessageText: 'Incoming Message',
      phoneHomeDock: [],
      phoneHomeShowDock: true,
      phoneHomeVariant: 'default',
      zineBadgeText: 'NEW!',
      zineTitleSize: 1.0,
      zineShowDoodles: true,
      scatterMode: false,
      visitorDrag: false,
      hasChanges: false,

      setTheme: (themeId: ThemeId) => {
        const theme = getTheme(themeId)
        if (!theme) return

        const defaults = getThemeDefaults(themeId)
        if (!defaults) return

        // Set default background based on theme
        let newBackground: BackgroundConfig
        if (themeId === 'receipt') {
          // Receipt theme defaults to sky/clouds image
          newBackground = {
            type: 'image',
            value: '/images/receipt-bg-default.jpeg',
          }
        } else {
          // Always reset to solid background with theme's default color
          newBackground = {
            type: 'solid',
            value: defaults.colors.background,
          }
        }

        // Basic themes default to centered cards
        const basicThemes: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings']
        const shouldCenter = basicThemes.includes(themeId)

        set({
          themeId,
          paletteId: theme.palettes[0]?.id ?? null,
          colors: defaults.colors,
          fonts: defaults.fonts,
          style: defaults.style,
          background: newBackground,
          centerCards: shouldCenter,
          hasChanges: true,
        })
        // Sync default text color to header title and social icon color
        syncHeaderColors(themeId, defaults.colors.text)
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
          // Always sync background to palette color (reset to solid)
          background: {
            type: 'solid',
            value: palette.colors.background,
          },
          hasChanges: true,
        })
        // Sync palette text color to header title and social icon color
        syncHeaderColors(state.themeId, palette.colors.text)
      },

      setColor: (key: keyof ColorPalette, value: string) => {
        set((state) => {
          const newState: Partial<ThemeStore> = {
            paletteId: null, // Custom color = no longer using preset
            colors: {
              ...state.colors,
              [key]: value,
            },
            hasChanges: true,
          }
          // Sync background color with background.value when type is solid
          if (key === 'background' && state.background.type === 'solid') {
            newState.background = { ...state.background, value }
          }
          // Sync text color to header title and social icon color
          if (key === 'text') {
            syncHeaderColors(state.themeId, value)
          }
          return newState
        })
      },

      setFont: (key: keyof FontConfig, value: string | number | boolean) => {
        set((state) => ({
          fonts: {
            ...state.fonts,
            [key]: value,
          },
          hasChanges: true,
        }))
      },

      setStyle: (key: keyof StyleConfig, value: number | boolean) => {
        set((state) => ({
          style: {
            ...state.style,
            [key]: value,
          },
          hasChanges: true,
        }))
      },

      setBackground: (background: BackgroundConfig) => {
        set((state) => {
          const newState: Partial<ThemeStore> = { background, hasChanges: true }
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
          hasChanges: true,
        }))
      },

      setSocialIconSize: (size: number) => {
        set({ socialIconSize: size, hasChanges: true })
      },

      setCenterCards: (center: boolean) => {
        set({ centerCards: center, hasChanges: true })
      },

      setVcrCenterContent: (center: boolean) => {
        set({ vcrCenterContent: center, hasChanges: true })
      },

      setReceiptPrice: (price: string) => {
        set({ receiptPrice: price, hasChanges: true })
      },

      addReceiptSticker: (sticker: ReceiptSticker) => {
        set((state) => ({
          receiptStickers: [...state.receiptStickers, sticker],
          hasChanges: true,
        }))
      },

      updateReceiptSticker: (id: string, updates: Partial<ReceiptSticker>) => {
        set((state) => ({
          receiptStickers: state.receiptStickers.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          hasChanges: true,
        }))
      },

      removeReceiptSticker: (id: string) => {
        set((state) => ({
          receiptStickers: state.receiptStickers.filter((s) => s.id !== id),
          hasChanges: true,
        }))
      },

      setReceiptFloatAnimation: (enabled: boolean) => {
        set({ receiptFloatAnimation: enabled, hasChanges: true })
      },

      setReceiptPaperTexture: (enabled: boolean) => {
        set({ receiptPaperTexture: enabled, hasChanges: true })
      },

      addIpodSticker: (sticker: ReceiptSticker) => {
        set((state) => ({
          ipodStickers: [...state.ipodStickers, sticker],
          hasChanges: true,
        }))
      },

      updateIpodSticker: (id: string, updates: Partial<ReceiptSticker>) => {
        set((state) => ({
          ipodStickers: state.ipodStickers.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          hasChanges: true,
        }))
      },

      removeIpodSticker: (id: string) => {
        set((state) => ({
          ipodStickers: state.ipodStickers.filter((s) => s.id !== id),
          hasChanges: true,
        }))
      },

      setIpodTexture: (texture: string) => {
        set({ ipodTexture: texture, hasChanges: true })
      },

      setIpodFont: (font: string) => {
        set({ ipodFont: font, hasChanges: true })
      },

      setMacPattern: (pattern: string) => {
        set({ macPattern: pattern, hasChanges: true })
      },

      setMacPatternColor: (color: string) => {
        set({ macPatternColor: color, hasChanges: true })
      },

      setWordArtTitleStyle: (style: string) => {
        set({ wordArtTitleStyle: style, hasChanges: true })
      },

      setLanyardActiveView: (view: number) => {
        set({ lanyardActiveView: view, hasChanges: true })
      },

      setClassifiedStampText: (text: string) => {
        set({ classifiedStampText: text, hasChanges: true })
      },

      setClassifiedDeptText: (text: string) => {
        set({ classifiedDeptText: text, hasChanges: true })
      },

      setClassifiedCenterText: (text: string) => {
        set({ classifiedCenterText: text, hasChanges: true })
      },

      setClassifiedMessageText: (text: string) => {
        set({ classifiedMessageText: text, hasChanges: true })
      },

      addToDock: (cardId: string) => {
        set((state) => {
          if (state.phoneHomeDock.includes(cardId) || state.phoneHomeDock.length >= 3) return state
          return { phoneHomeDock: [...state.phoneHomeDock, cardId], hasChanges: true }
        })
      },

      removeFromDock: (cardId: string) => {
        set((state) => ({
          phoneHomeDock: state.phoneHomeDock.filter((id) => id !== cardId),
          hasChanges: true,
        }))
      },

      setPhoneHomeShowDock: (show: boolean) => {
        set({ phoneHomeShowDock: show, hasChanges: true })
      },

      setPhoneHomeVariant: (variant: 'default' | '8-bit') => {
        set({ phoneHomeVariant: variant, hasChanges: true })
      },

      setZineBadgeText: (text: string) => {
        set({ zineBadgeText: text, hasChanges: true })
      },

      setZineTitleSize: (size: number) => {
        set({ zineTitleSize: size, hasChanges: true })
      },

      setZineShowDoodles: (show: boolean) => {
        set({ zineShowDoodles: show, hasChanges: true })
      },

      setScatterMode: (enabled: boolean) => {
        set((state) => ({
          scatterMode: enabled,
          // When disabling scatter mode, also disable visitor drag
          visitorDrag: enabled ? state.visitorDrag : false,
          hasChanges: true,
        }))
      },

      setVisitorDrag: (enabled: boolean) => {
        set({ visitorDrag: enabled, hasChanges: true })
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
          // Always reset background to solid with default color
          background: {
            type: 'solid',
            value: defaults.colors.background,
          },
          hasChanges: true,
        })
        // Sync default text color to header title and social icon color
        syncHeaderColors(state.themeId, defaults.colors.text)
      },

      // Database sync methods
      markSaved: () => {
        set({ hasChanges: false })
      },

      loadFromDatabase: (theme: ThemeState | null) => {
        if (!theme) return
        // Load theme from database, don't mark as changed
        set({
          themeId: theme.themeId,
          paletteId: theme.paletteId,
          colors: theme.colors,
          fonts: theme.fonts,
          style: theme.style,
          background: theme.background,
          cardTypeFontSizes: { ...initialState.cardTypeFontSizes, ...theme.cardTypeFontSizes },
          centerCards: theme.centerCards ?? false,
          vcrCenterContent: theme.vcrCenterContent ?? false,
          receiptPrice: theme.receiptPrice ?? 'PRICELESS',
          receiptStickers: theme.receiptStickers ?? [],
          receiptFloatAnimation: theme.receiptFloatAnimation ?? true,
          receiptPaperTexture: theme.receiptPaperTexture ?? false,
          ipodStickers: theme.ipodStickers ?? [],
          ipodTexture: theme.ipodTexture ?? '/images/metal-texture.jpeg',
          ipodFont: theme.ipodFont ?? 'system',
          macPattern: theme.macPattern ?? '',
          macPatternColor: theme.macPatternColor ?? '#c0c0c0',
          wordArtTitleStyle: theme.wordArtTitleStyle ?? 'style-eleven',
          lanyardActiveView: theme.lanyardActiveView ?? 0,
          classifiedStampText: theme.classifiedStampText ?? 'SECRET',
          classifiedDeptText: theme.classifiedDeptText ?? 'War Department',
          classifiedCenterText: theme.classifiedCenterText ?? 'Classified Message Center',
          classifiedMessageText: theme.classifiedMessageText ?? 'Incoming Message',
          phoneHomeDock: theme.phoneHomeDock ?? [],
          phoneHomeShowDock: theme.phoneHomeShowDock ?? true,
          phoneHomeVariant: theme.phoneHomeVariant ?? 'default',
          zineBadgeText: theme.zineBadgeText ?? 'NEW!',
          zineTitleSize: theme.zineTitleSize ?? 1.0,
          zineShowDoodles: theme.zineShowDoodles ?? true,
          scatterMode: theme.scatterMode ?? false,
          visitorDrag: theme.visitorDrag ?? false,
          hasChanges: false,
        })
      },

      getSnapshot: (): ThemeState => {
        const state = get()
        return {
          themeId: state.themeId,
          paletteId: state.paletteId,
          colors: state.colors,
          fonts: state.fonts,
          style: state.style,
          background: state.background,
          cardTypeFontSizes: state.cardTypeFontSizes,
          centerCards: state.centerCards,
          vcrCenterContent: state.vcrCenterContent,
          receiptPrice: state.receiptPrice,
          receiptStickers: state.receiptStickers,
          receiptFloatAnimation: state.receiptFloatAnimation,
          receiptPaperTexture: state.receiptPaperTexture,
          ipodStickers: state.ipodStickers,
          ipodTexture: state.ipodTexture,
          ipodFont: state.ipodFont,
          macPattern: state.macPattern,
          macPatternColor: state.macPatternColor,
          wordArtTitleStyle: state.wordArtTitleStyle,
          lanyardActiveView: state.lanyardActiveView,
          classifiedStampText: state.classifiedStampText,
          classifiedDeptText: state.classifiedDeptText,
          classifiedCenterText: state.classifiedCenterText,
          classifiedMessageText: state.classifiedMessageText,
          phoneHomeDock: state.phoneHomeDock,
          phoneHomeShowDock: state.phoneHomeShowDock,
          phoneHomeVariant: state.phoneHomeVariant,
          zineBadgeText: state.zineBadgeText,
          zineTitleSize: state.zineTitleSize,
          zineShowDoodles: state.zineShowDoodles,
          scatterMode: state.scatterMode,
          visitorDrag: state.visitorDrag,
        }
      },
    }),
    {
      name: 'linklobby-theme',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
