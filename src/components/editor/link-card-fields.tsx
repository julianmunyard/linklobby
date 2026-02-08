// src/components/editor/link-card-fields.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { useThemeStore } from "@/stores/theme-store"
import type { LinkCardContent, CardType } from "@/types/card"
import type { CardTypeFontSizes } from "@/types/theme"

interface LinkCardFieldsProps {
  content: LinkCardContent
  onChange: (updates: Record<string, unknown>) => void
  cardType?: CardType
}

const FONT_SIZE_LABELS: Partial<Record<CardType, string>> = {
  link: 'Font Size (all link cards)',
  mini: 'Font Size (all link cards)',
  text: 'Font Size (all text cards)',
}

export function LinkCardFields({ content, onChange, cardType = 'link' }: LinkCardFieldsProps) {
  const themeTextColor = useThemeStore((state) => state.colors.text)
  // Text cards use the 'text' font size key, link/mini use 'link'
  const fontSizeKey: keyof CardTypeFontSizes = cardType === 'text' ? 'text' : 'link'
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes[fontSizeKey])
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

  return (
    <div className="space-y-4">
      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Label>{FONT_SIZE_LABELS[cardType] || 'Font Size'}</Label>
          <span className="text-muted-foreground">{Math.round(fontSize * 100)}%</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(v) => setCardTypeFontSize(fontSizeKey, v[0])}
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
