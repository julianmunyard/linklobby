// src/components/editor/square-card-fields.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "@/components/ui/color-picker"
import type { SquareCardContent } from "@/types/card"

interface SquareCardFieldsProps {
  content: SquareCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function SquareCardFields({ content, onChange }: SquareCardFieldsProps) {
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

      {/* Text Color - only shown when title overlay is enabled */}
      {content.showTitle !== false && (
        <ColorPicker
          label="Text Color"
          color={content.textColor || "#ffffff"}
          onChange={(color) => onChange({ textColor: color })}
        />
      )}
    </div>
  )
}
