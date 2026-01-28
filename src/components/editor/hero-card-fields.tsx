// src/components/editor/hero-card-fields.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ColorPicker } from "@/components/ui/color-picker"
import { useThemeStore } from "@/stores/theme-store"
import type { HeroCardContent } from "@/types/card"

interface HeroCardFieldsProps {
  content: HeroCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function HeroCardFields({ content, onChange }: HeroCardFieldsProps) {
  const showButton = content.showButton !== false  // Default to true
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.hero)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

  return (
    <div className="space-y-4">
      {/* Font Size - applies to all hero cards */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <Label>Font Size (all hero cards)</Label>
          <span className="text-muted-foreground">{Math.round(fontSize * 100)}%</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(v) => setCardTypeFontSize('hero', v[0])}
          min={0.5}
          max={2}
          step={0.1}
        />
      </div>

      {/* Text Color */}
      <ColorPicker
        label="Text Color"
        color={content.textColor || "#ffffff"}
        onChange={(color) => onChange({ textColor: color })}
      />

      <div className="flex items-center justify-between">
        <Label htmlFor="showButton">Show Button</Label>
        <Switch
          id="showButton"
          checked={showButton}
          onCheckedChange={(checked) => onChange({ showButton: checked })}
        />
      </div>

      {showButton && (
        <>
          <div className="space-y-2">
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              placeholder="Visit"
              value={content.buttonText ?? ""}
              onChange={(e) => onChange({ buttonText: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonStyle">Button Style</Label>
            <Select
              value={content.buttonStyle ?? "primary"}
              onValueChange={(value) => onChange({ buttonStyle: value })}
            >
              <SelectTrigger id="buttonStyle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  )
}
