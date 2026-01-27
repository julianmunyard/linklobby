// src/components/editor/dropdown-card-fields.tsx
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DropdownCardContent } from "@/types/card"

interface DropdownCardFieldsProps {
  content: DropdownCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function DropdownCardFields({ content, onChange }: DropdownCardFieldsProps) {
  const childCount = content.childCardIds?.length ?? 0

  return (
    <div className="space-y-4">
      {/* Child count info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{childCount}</span> {childCount === 1 ? "card" : "cards"} inside this dropdown
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag cards into the dropdown to organize them
        </p>
      </div>

      {/* Header text */}
      <div className="space-y-2">
        <Label htmlFor="headerText">Header Text</Label>
        <Input
          id="headerText"
          placeholder="Dropdown"
          value={content.headerText ?? ""}
          onChange={(e) => onChange({ headerText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Shown at the top of the dropdown (falls back to card title)
        </p>
      </div>

      {/* Expand text */}
      <div className="space-y-2">
        <Label htmlFor="expandText">Expand Text</Label>
        <Input
          id="expandText"
          placeholder="Show more"
          value={content.expandText ?? ""}
          onChange={(e) => onChange({ expandText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Text shown when dropdown is closed
        </p>
      </div>

      {/* Collapse text */}
      <div className="space-y-2">
        <Label htmlFor="collapseText">Collapse Text</Label>
        <Input
          id="collapseText"
          placeholder="Show less"
          value={content.collapseText ?? ""}
          onChange={(e) => onChange({ collapseText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Text shown when dropdown is open
        </p>
      </div>
    </div>
  )
}
