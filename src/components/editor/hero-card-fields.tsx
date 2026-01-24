// src/components/editor/hero-card-fields.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { HeroCardContent } from "@/types/card"

interface HeroCardFieldsProps {
  content: HeroCardContent
  onChange: (updates: Partial<HeroCardContent>) => void
}

export function HeroCardFields({ content, onChange }: HeroCardFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium">Hero Settings</h3>

      {/* Button text */}
      <div className="space-y-2">
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          placeholder="Visit (default)"
          value={content.buttonText ?? ""}
          onChange={(e) => onChange({ buttonText: e.target.value || undefined })}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty for stretched link (entire card clickable)
        </p>
      </div>

      {/* Button style */}
      <div className="space-y-2">
        <Label htmlFor="buttonStyle">Button Style</Label>
        <Select
          value={content.buttonStyle ?? "primary"}
          onValueChange={(value) =>
            onChange({ buttonStyle: value as HeroCardContent["buttonStyle"] })
          }
        >
          <SelectTrigger id="buttonStyle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary (White)</SelectItem>
            <SelectItem value="secondary">Secondary (Transparent)</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Image alt text */}
      <div className="space-y-2">
        <Label htmlFor="imageAlt">Image Alt Text</Label>
        <Input
          id="imageAlt"
          placeholder="Describe the image..."
          value={content.imageAlt ?? ""}
          onChange={(e) => onChange({ imageAlt: e.target.value || undefined })}
        />
      </div>
    </div>
  )
}
