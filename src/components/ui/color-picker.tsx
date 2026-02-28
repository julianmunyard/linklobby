'use client'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'
import { useThemeStore } from '@/stores/theme-store'

const RECENT_COLORS_KEY = 'linklobby-recent-colors'
const MAX_RECENT_COLORS = 8

function getRecentColors(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_COLORS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addRecentColor(color: string) {
  if (typeof window === 'undefined') return
  try {
    const colors = getRecentColors()
    // Remove if already exists, add to front
    const filtered = colors.filter((c) => c.toLowerCase() !== color.toLowerCase())
    const updated = [color, ...filtered].slice(0, MAX_RECENT_COLORS)
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage errors
  }
}

// Convert CSS color values (oklch, rgb, hsl, hex, named) to hex for display
function toHex(cssColor: string): string | null {
  if (typeof document === 'undefined') return null
  if (!cssColor) return null
  // Already hex
  if (/^#[0-9a-f]{3,8}$/i.test(cssColor)) return cssColor
  try {
    const el = document.createElement('div')
    el.style.color = cssColor
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    document.body.removeChild(el)
    // computed is rgb(r, g, b) or rgba(r, g, b, a)
    const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) return null
    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  } catch {
    return null
  }
}

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
  className?: string
}

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
  // Local state for responsive UI while picking
  const [localColor, setLocalColor] = useState(color)
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Get current theme colors
  const themeColors = useThemeStore((state) => state.colors)

  // Build unique theme color swatches (deduplicated, converted to hex)
  const themeSwatches = useMemo(() => {
    const entries = [
      { key: 'background', value: themeColors.background },
      { key: 'cardBg', value: themeColors.cardBg },
      { key: 'text', value: themeColors.text },
      { key: 'accent', value: themeColors.accent },
      { key: 'border', value: themeColors.border },
      { key: 'link', value: themeColors.link },
    ]
    const seen = new Set<string>()
    const result: { key: string; hex: string }[] = []
    for (const entry of entries) {
      const hex = toHex(entry.value)
      if (hex && !seen.has(hex.toLowerCase())) {
        seen.add(hex.toLowerCase())
        result.push({ key: entry.key, hex })
      }
    }
    return result
  }, [themeColors])

  // Load recent colors on mount
  useEffect(() => {
    setRecentColors(getRecentColors())
  }, [])

  // Debounce store updates to avoid excessive re-renders
  const debouncedOnChange = useDebouncedCallback(onChange, 100)

  const handleColorChange = useCallback((newColor: string) => {
    setLocalColor(newColor)
    debouncedOnChange(newColor)
  }, [debouncedOnChange])

  // Save to recent when popover closes (color is committed)
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && localColor) {
      addRecentColor(localColor)
      setRecentColors(getRecentColors())
    }
  }, [localColor])

  const handleRecentClick = useCallback((recentColor: string) => {
    setLocalColor(recentColor)
    onChange(recentColor)
  }, [onChange])

  // Sync local state when prop changes (e.g., palette selection)
  if (color !== localColor && !document.activeElement?.closest('.color-picker-popover')) {
    setLocalColor(color)
  }

  // Labels for theme color swatches
  const themeColorLabels: Record<string, string> = {
    background: 'Background',
    cardBg: 'Card',
    text: 'Text',
    accent: 'Accent',
    border: 'Border',
    link: 'Link',
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Label className="text-sm min-w-[80px]">{label}</Label>
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-10 h-10 p-0 border-2 rounded-md"
            style={{ backgroundColor: localColor }}
          >
            <span className="sr-only">Pick color for {label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 color-picker-popover" align="start">
          {/* Theme colors */}
          {themeSwatches.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Theme</p>
              <div className="flex gap-1 flex-wrap">
                {themeSwatches.map((swatch) => (
                  <button
                    key={swatch.key}
                    onClick={() => handleRecentClick(swatch.hex)}
                    className={cn(
                      "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                      localColor.toLowerCase() === swatch.hex.toLowerCase()
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    )}
                    style={{ backgroundColor: swatch.hex }}
                    title={`${themeColorLabels[swatch.key] || swatch.key}: ${swatch.hex}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Recent</p>
              <div className="flex gap-1 flex-wrap">
                {recentColors.map((recentColor, i) => (
                  <button
                    key={`${recentColor}-${i}`}
                    onClick={() => handleRecentClick(recentColor)}
                    className={cn(
                      "w-6 h-6 rounded border-2 transition-transform hover:scale-110",
                      localColor.toLowerCase() === recentColor.toLowerCase()
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    )}
                    style={{ backgroundColor: recentColor }}
                    title={recentColor}
                  />
                ))}
              </div>
            </div>
          )}

          <HexColorPicker color={localColor} onChange={handleColorChange} />
          <HexColorInput
            color={localColor}
            onChange={handleColorChange}
            prefixed
            className="mt-2 w-full px-2 py-1 text-sm border rounded bg-background"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
