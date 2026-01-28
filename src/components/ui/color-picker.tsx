'use client'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState, useCallback, useEffect } from 'react'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

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
