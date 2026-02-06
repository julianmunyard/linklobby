'use client'

import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface MacWindowFieldsProps {
  macMode: string
  onChange: (updates: Record<string, unknown>) => void
}

export function MacWindowFields({ macMode, onChange }: MacWindowFieldsProps) {
  return (
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
      <p className="text-xs text-muted-foreground">
        {macMode === 'video'
          ? 'Paste a video URL to embed in this window.'
          : 'Set a title and URL for this link window.'}
      </p>
    </div>
  )
}
