// src/components/editor/horizontal-link-fields.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { HorizontalLinkContent } from "@/types/card"

interface HorizontalLinkFieldsProps {
  content: HorizontalLinkContent
  onChange: (updates: Partial<HorizontalLinkContent>) => void
}

export function HorizontalLinkFields({ content, onChange }: HorizontalLinkFieldsProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium">Link Settings</h3>

      {/* Image alt text */}
      <div className="space-y-2">
        <Label htmlFor="imageAlt">Thumbnail Alt Text</Label>
        <Input
          id="imageAlt"
          placeholder="Describe the thumbnail..."
          value={content.imageAlt ?? ""}
          onChange={(e) => onChange({ imageAlt: e.target.value || undefined })}
        />
      </div>

      {/* Note about icon - future feature */}
      <p className="text-xs text-muted-foreground">
        Icon selection coming soon. Upload a thumbnail image for now.
      </p>
    </div>
  )
}
