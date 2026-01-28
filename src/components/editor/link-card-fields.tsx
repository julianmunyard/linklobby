// src/components/editor/link-card-fields.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { useThemeStore } from "@/stores/theme-store"
import type { LinkCardContent } from "@/types/card"

interface LinkCardFieldsProps {
  content: LinkCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function LinkCardFields({ content, onChange }: LinkCardFieldsProps) {
  const themeTextColor = useThemeStore((state) => state.colors.text)
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.link)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

  return (
    <div className="space-y-4">
      {/* Font Size - applies to all link cards */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Label>Font Size (all link cards)</Label>
          <span className="text-muted-foreground">{Math.round(fontSize * 100)}%</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(v) => setCardTypeFontSize('link', v[0])}
          min={0.5}
          max={2}
          step={0.1}
        />
      </div>

      <ColorPicker
        label="Text Color"
        color={content.textColor || themeTextColor}
        onChange={(color) => onChange({ textColor: color })}
      />
    </div>
  )
}
