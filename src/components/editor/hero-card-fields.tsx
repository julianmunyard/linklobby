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
  onChange: (updates: Record<string, unknown>) => void
}

export function HeroCardFields({ content, onChange }: HeroCardFieldsProps) {
  return (
    <div className="space-y-4">
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
    </div>
  )
}
