'use client'

import { useCallback } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { THEMES, getTheme } from '@/lib/themes'
import { ColorPicker } from '@/components/ui/color-picker'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check, RotateCcw, Pipette } from 'lucide-react'
import type { ColorPalette } from '@/types/theme'

// Required color keys (always shown in editor)
const REQUIRED_COLOR_KEYS = ['background', 'cardBg', 'text', 'accent', 'border', 'link'] as const
type RequiredColorKey = typeof REQUIRED_COLOR_KEYS[number]

const COLOR_LABELS: Record<RequiredColorKey, string> = {
  background: 'Background',
  cardBg: 'Card',
  text: 'Text',
  accent: 'Accent',
  border: 'Border',
  link: 'Link',
}

// System Settings (Poolsuite) theme: custom labels and subset of colors
const SYSTEM_SETTINGS_COLOR_KEYS = ['background', 'cardBg', 'accent', 'text', 'border'] as const
const SYSTEM_SETTINGS_COLOR_LABELS: Record<string, string> = {
  background: 'Background',
  cardBg: 'Outer Box',
  accent: 'Inner Box Fill',
  text: 'Text & Border',
  border: 'Border',
}

// iPod theme only shows LCD screen color
const IPOD_COLOR_KEYS = ['cardBg'] as const
const IPOD_COLOR_LABELS: Record<string, string> = {
  cardBg: 'LCD Screen',
}

// Phone Home theme: dock color (cardBg) + text color
const PHONE_HOME_COLOR_KEYS = ['background', 'cardBg', 'text'] as const
const PHONE_HOME_COLOR_LABELS: Record<string, string> = {
  background: 'Background',
  cardBg: 'Dock Color',
  text: 'Text Color',
}

// Chaotic Zine theme: background + link color (text drives link appearance)
const ZINE_COLOR_KEYS = ['background', 'text', 'cardBg'] as const
const ZINE_COLOR_LABELS: Record<string, string> = {
  background: 'Background',
  text: 'Link Color',
  cardBg: 'Icon Background',
}

export function ColorCustomizer() {
  const { themeId, paletteId, colors, setColor, setPalette, resetToThemeDefaults, background, setBackground } = useThemeStore()
  const clearCardColorOverrides = usePageStore((state) => state.clearCardColorOverrides)
  const setAllCardsTransparency = usePageStore((state) => state.setAllCardsTransparency)
  const cards = usePageStore((state) => state.cards)
  const theme = getTheme(themeId)

  const hasMediaBackground = background.type === 'image' || background.type === 'video'

  // Check if all non-audio cards have transparent backgrounds
  const nonAudioCards = cards.filter((c) => c.card_type !== 'audio')
  const allTransparent = nonAudioCards.length > 0 && nonAudioCards.every((c) => !!(c.content as Record<string, unknown>)?.transparentBackground)

  const handlePaletteSelect = (paletteId: string) => {
    setPalette(paletteId)
    clearCardColorOverrides()
  }

  const handleReset = () => {
    resetToThemeDefaults()
    clearCardColorOverrides()
  }

  const handleEyedropper = useCallback(async () => {
    if ('EyeDropper' in window) {
      try {
        const dropper = new (window as any).EyeDropper()
        const result = await dropper.open()
        setBackground({ ...background, topBarColor: result.sRGBHex })
      } catch {
        // User cancelled
      }
      return
    }
    const input = document.createElement('input')
    input.type = 'color'
    input.value = background.topBarColor || '#000000'
    input.addEventListener('input', (e) => {
      setBackground({ ...background, topBarColor: (e.target as HTMLInputElement).value })
    })
    input.click()
  }, [background, setBackground])

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
                onClick={() => handlePaletteSelect(palette.id)}
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
            onClick={handleReset}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>

        {/* Transparent toggle — accessible from Colors section for themes with card backgrounds */}
        {(themeId === 'system-settings' || themeId === 'instagram-reels' || themeId === 'mac-os' || themeId === 'blinkies') && (
          <div className="flex items-center gap-2 mb-1">
            <Switch
              checked={allTransparent}
              onCheckedChange={(checked) => setAllCardsTransparency(checked)}
            />
            <Label className="cursor-pointer text-sm" onClick={() => setAllCardsTransparency(!allTransparent)}>
              Transparent Cards
            </Label>
          </div>
        )}

        <div className="space-y-3">
          {themeId === 'ipod-classic' ? (
            // iPod theme: only show LCD screen color
            IPOD_COLOR_KEYS.map((key) => (
              <ColorPicker
                key={key}
                label={IPOD_COLOR_LABELS[key]}
                color={colors[key]}
                onChange={(value) => setColor(key, value)}
              />
            ))
          ) : themeId === 'phone-home' ? (
            // Phone Home theme: background + dock color + text color
            PHONE_HOME_COLOR_KEYS.filter((key) => !(hasMediaBackground && key === 'background')).map((key) => (
              <ColorPicker
                key={key}
                label={PHONE_HOME_COLOR_LABELS[key]}
                color={colors[key]}
                onChange={(value) => {
                  setColor(key, value)
                  // Sync dock color to Safari status bar
                  if (key === 'cardBg') {
                    setBackground({ ...background, topBarColor: value })
                  }
                }}
              />
            ))
          ) : themeId === 'system-settings' ? (
            // System Settings (Poolsuite): custom labels, no link/title bar line
            SYSTEM_SETTINGS_COLOR_KEYS.filter((key) => {
              if (hasMediaBackground && key === 'background') return false
              // Hide card fill colors when all cards are transparent
              if (allTransparent && (key === 'cardBg' || key === 'accent' || key === 'border')) return false
              return true
            }).map((key) => (
              <ColorPicker
                key={key}
                label={SYSTEM_SETTINGS_COLOR_LABELS[key]}
                color={colors[key]}
                onChange={(value) => setColor(key, value)}
              />
            ))
          ) : themeId === 'chaotic-zine' ? (
            // Chaotic Zine theme: background + link color
            ZINE_COLOR_KEYS.filter((key) => !(hasMediaBackground && key === 'background')).map((key) => (
              <ColorPicker
                key={key}
                label={ZINE_COLOR_LABELS[key]}
                color={colors[key]}
                onChange={(value) => setColor(key, value)}
              />
            ))
          ) : (
            // All other themes: show all colors + theme-specific extras
            <>
              {REQUIRED_COLOR_KEYS.filter((key) => {
                if (hasMediaBackground && key === 'background') return false
                // Hide card fill color when all cards are transparent
                if (allTransparent && key === 'cardBg') return false
                return true
              }).map((key) => (
                <ColorPicker
                  key={key}
                  label={COLOR_LABELS[key]}
                  color={colors[key]}
                  onChange={(value) => setColor(key, value)}
                />
              ))}
              {/* Title bar line color for Mac OS */}
              {themeId === 'mac-os' && (
                <ColorPicker
                  label="Title Bar Line"
                  color={colors.titleBarLine || '#000000'}
                  onChange={(value) => setColor('titleBarLine', value)}
                />
              )}
            </>
          )}

          {/* Status Bar Color — shown when background is image/video so it can match (hidden for phone-home, uses dock color) */}
          {hasMediaBackground && themeId !== 'phone-home' && (
            <div className="space-y-2">
              {/* Explainer with iPhone top SVG */}
              <div className="flex items-start gap-2.5 rounded-md bg-muted/50 p-2.5">
                <svg width="48" height="28" viewBox="0 0 48 28" className="shrink-0 mt-0.5" aria-hidden="true">
                  {/* Phone outline */}
                  <rect x="1" y="1" width="46" height="26" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50" />
                  {/* Status bar area - highlighted */}
                  <rect x="2" y="2" width="44" height="10" rx="5" className="text-muted-foreground/15" fill="currentColor" />
                  {/* Dynamic Island / camera notch */}
                  <rect x="16" y="4" width="16" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/60" />
                  {/* Arrow pointing at status bar */}
                  <line x1="42" y1="7" x2="35" y2="7" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
                </svg>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  The area around the camera and clock on mobile. Match this to your background image for a seamless look.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <ColorPicker
                    label="Status Bar"
                    color={background.topBarColor || '#000000'}
                    onChange={(color) => setBackground({ ...background, topBarColor: color })}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 mt-5"
                  onClick={handleEyedropper}
                  title="Pick color from screen"
                >
                  <Pipette className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
