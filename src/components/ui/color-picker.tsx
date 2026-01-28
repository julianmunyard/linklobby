'use client'

import { HexColorPicker, HexColorInput } from 'react-colorful'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import { useDebouncedCallback } from '@/hooks/use-debounced-callback'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
  className?: string
}

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
  // Local state for responsive UI while picking
  const [localColor, setLocalColor] = useState(color)

  // Debounce store updates to avoid excessive re-renders
  const debouncedOnChange = useDebouncedCallback(onChange, 100)

  const handleColorChange = useCallback((newColor: string) => {
    setLocalColor(newColor)
    debouncedOnChange(newColor)
  }, [debouncedOnChange])

  // Sync local state when prop changes (e.g., palette selection)
  if (color !== localColor && !document.activeElement?.closest('.color-picker-popover')) {
    setLocalColor(color)
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Label className="text-sm min-w-[80px]">{label}</Label>
      <Popover>
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
          <HexColorPicker color={localColor} onChange={handleColorChange} />
          <HexColorInput
            color={localColor}
            onChange={handleColorChange}
            prefixed
            className="mt-2 w-full px-2 py-1 text-sm border rounded bg-background"
          />
        </PopoverContent>
      </Popover>
      <span className="text-xs text-muted-foreground font-mono">{localColor}</span>
    </div>
  )
}
