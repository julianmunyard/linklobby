// src/components/editor/square-card-fields.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { SquareCardContent } from "@/types/card"

interface SquareCardFieldsProps {
  content: SquareCardContent
  onChange: (updates: Partial<SquareCardContent>) => void
}

export function SquareCardFields({ content, onChange }: SquareCardFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium">Tile Settings</h3>

      {/* Show title toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="showTitle">Show Title Overlay</Label>
          <p className="text-xs text-muted-foreground">
            Display title on the image
          </p>
        </div>
        <Switch
          id="showTitle"
          checked={content.showTitle !== false}
          onCheckedChange={(checked) => onChange({ showTitle: checked })}
        />
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
