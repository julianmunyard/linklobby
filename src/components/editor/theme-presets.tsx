'use client'

import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { THEMES, getThemeDefaults } from '@/lib/themes'
import { migrateToMacintosh, migrateFromMacintosh } from '@/lib/card-migration'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function ThemePresets() {
  const { themeId, setTheme, paletteId, setPalette } = useThemeStore()
  const clearCardColorOverrides = usePageStore((state) => state.clearCardColorOverrides)
  const setAllCardsTransparency = usePageStore((state) => state.setAllCardsTransparency)

  const handleThemeSelect = (newThemeId: Parameters<typeof setTheme>[0]) => {
    const currentThemeId = themeId
    const cards = usePageStore.getState().cards

    // Migrate cards between macintosh and other themes
    if (newThemeId === 'macintosh' && currentThemeId !== 'macintosh') {
      usePageStore.getState().setCards(migrateToMacintosh(cards))
    } else if (newThemeId !== 'macintosh' && currentThemeId === 'macintosh') {
      usePageStore.getState().setCards(migrateFromMacintosh(cards))
    }

    setTheme(newThemeId)
    clearCardColorOverrides()
  }

  const handleColorwaySelect = (palette: { id: string; transparent?: boolean }) => {
    setPalette(palette.id)
    clearCardColorOverrides()
    // Apply transparency based on colorway flag
    setAllCardsTransparency(palette.transparent === true)
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {THEMES.map((theme) => {
        const isSelected = themeId === theme.id
        const defaults = getThemeDefaults(theme.id)

        return (
          <div key={theme.id}>
            <button
              onClick={() => handleThemeSelect(theme.id)}
              className={cn(
                "relative w-full p-4 rounded-lg border-2 text-left transition-all",
                "hover:border-accent",
                isSelected ? "border-accent bg-accent/10" : "border-border bg-card"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-accent-foreground" />
                </div>
              )}

              {/* Theme name and description */}
              <div className="mb-3">
                <h4 className="font-medium text-sm">{theme.name}</h4>
                <p className="text-xs text-muted-foreground">{theme.description}</p>
              </div>

              {/* Abstract color swatch */}
              <div className="flex gap-1 h-8 rounded overflow-hidden">
                <div
                  className="flex-1"
                  style={{ backgroundColor: defaults?.colors.background }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: defaults?.colors.cardBg }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: defaults?.colors.accent }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: defaults?.colors.text }}
                />
              </div>

              {/* Font sample */}
              <div
                className="mt-2 text-xs truncate"
                style={{ fontFamily: defaults?.fonts.heading }}
              >
                Aa Bb Cc 123
              </div>
            </button>

            {/* Colorway swatches - shown for any selected theme with palettes */}
            {isSelected && theme.palettes.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Colorways</p>
                <div className="flex flex-wrap gap-1.5">
                  {theme.palettes.map((palette) => {
                    const isActivePalette = paletteId === palette.id
                    return (
                      <button
                        key={palette.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleColorwaySelect(palette)
                        }}
                        className={cn(
                          "relative flex gap-0.5 h-6 rounded overflow-hidden border-2 transition-all",
                          isActivePalette ? "border-accent ring-1 ring-accent" : "border-transparent hover:border-muted"
                        )}
                        title={palette.name}
                      >
                        {/* Show 3 key colors as mini swatches: background, card, text */}
                        <div className="w-4 h-full" style={{ backgroundColor: palette.colors.background }} />
                        <div className="w-4 h-full" style={{ backgroundColor: palette.colors.cardBg }} />
                        <div className="w-4 h-full" style={{ backgroundColor: palette.colors.text }} />
                        {isActivePalette && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Check className="w-2.5 h-2.5 text-white drop-shadow-sm" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
