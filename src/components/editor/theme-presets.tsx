'use client'

import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { THEMES, getThemeDefaults } from '@/lib/themes'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function ThemePresets() {
  const { themeId, setTheme } = useThemeStore()
  const clearCardColorOverrides = usePageStore((state) => state.clearCardColorOverrides)

  const handleThemeSelect = (themeId: Parameters<typeof setTheme>[0]) => {
    setTheme(themeId)
    clearCardColorOverrides()
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {THEMES.map((theme) => {
        const isSelected = themeId === theme.id
        const defaults = getThemeDefaults(theme.id)

        return (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={cn(
              "relative p-4 rounded-lg border-2 text-left transition-all",
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
        )
      })}
    </div>
  )
}
