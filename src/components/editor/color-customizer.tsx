'use client'

import { useThemeStore } from '@/stores/theme-store'
import { THEMES, getTheme } from '@/lib/themes'
import { ColorPicker } from '@/components/ui/color-picker'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, RotateCcw } from 'lucide-react'
import type { ColorPalette } from '@/types/theme'

const COLOR_LABELS: Record<keyof ColorPalette, string> = {
  background: 'Background',
  cardBg: 'Card',
  text: 'Text',
  accent: 'Accent',
  border: 'Border',
  link: 'Link',
}

export function ColorCustomizer() {
  const { themeId, paletteId, colors, setColor, setPalette, resetToThemeDefaults } = useThemeStore()
  const theme = getTheme(themeId)

  if (!theme) return null

  return (
    <div className="space-y-4">
      {/* Palette Presets */}
      <div>
        <h5 className="text-xs font-medium text-muted-foreground mb-2">Palettes</h5>
        <div className="flex flex-wrap gap-2">
          {theme.palettes.map((palette) => {
            const isSelected = paletteId === palette.id

            return (
              <button
                key={palette.id}
                onClick={() => setPalette(palette.id)}
                className={cn(
                  "relative flex gap-0.5 h-7 rounded overflow-hidden border-2 transition-all",
                  isSelected ? "border-accent" : "border-transparent hover:border-muted"
                )}
                title={palette.name}
              >
                {/* Mini color swatches */}
                {Object.values(palette.colors).slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            )
          })}

          {/* Custom indicator */}
          {paletteId === null && (
            <div className="flex items-center text-xs text-muted-foreground px-2">
              Custom
            </div>
          )}
        </div>
      </div>

      {/* Individual Color Pickers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-xs font-medium text-muted-foreground">Colors</h5>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={resetToThemeDefaults}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
        <div className="space-y-3">
          {(Object.keys(COLOR_LABELS) as Array<keyof ColorPalette>).map((key) => (
            <ColorPicker
              key={key}
              label={COLOR_LABELS[key]}
              color={colors[key]}
              onChange={(value) => setColor(key, value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
