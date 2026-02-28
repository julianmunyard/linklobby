// src/components/editor/square-card-fields.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { useThemeStore } from "@/stores/theme-store"
import type { SquareCardContent } from "@/types/card"

interface SquareCardFieldsProps {
  content: SquareCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function SquareCardFields({ content, onChange }: SquareCardFieldsProps) {
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.square)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="showTitle">Show Title Overlay</Label>
        <Switch
          id="showTitle"
          checked={content.showTitle !== false}
          onCheckedChange={(checked) => onChange({ showTitle: checked })}
        />
      </div>

      {/* Font Size and Text Color - only shown when title overlay is enabled */}
      {content.showTitle !== false && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Font Size (all square cards)</Label>
              <span className="text-muted-foreground">{Math.round(fontSize * 100)}%</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(v) => setCardTypeFontSize('square', v[0])}
              min={0.5}
              max={2}
              step={0.1}
            />
          </div>

          <ColorPicker
            label="Text Color"
            color={content.textColor || "#ffffff"}
            onChange={(color) => onChange({ textColor: color })}
          />

        </>
      )}
    </div>
  )
}
