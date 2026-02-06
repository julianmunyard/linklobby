'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface MacWindowFieldsProps {
  macMode: string
  macBodyText: string
  onChange: (updates: Record<string, unknown>) => void
}

export function MacWindowFields({ macMode, macBodyText, onChange }: MacWindowFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Window Mode</Label>
        <ToggleGroup
          type="single"
          value={macMode || 'link'}
          onValueChange={(value) => {
            if (value) onChange({ macMode: value })
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="link" className="h-9 px-4">
            Link
          </ToggleGroupItem>
          <ToggleGroupItem value="video" className="h-9 px-4">
            Video
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Window Body Text</Label>
        <Input
          placeholder="Text shown inside the window"
          value={macBodyText}
          onChange={(e) => onChange({ macBodyText: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Separate from the title bar. Leave empty to use the card title.
        </p>
      </div>
    </div>
  )
}
