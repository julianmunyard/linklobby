'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface MacWindowFieldsProps {
  macMode: string
  macBodyText: string
  macWindowStyle?: string
  macCheckerColor?: string
  macWindowBgColor?: string
  onChange: (updates: Record<string, unknown>) => void
}

export function MacWindowFields({ macMode, macBodyText, macWindowStyle, macCheckerColor, macWindowBgColor, onChange }: MacWindowFieldsProps) {
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

      {macWindowStyle === 'small-window' && (
        <>
          <div className="space-y-2">
            <Label>Checker Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={macCheckerColor || '#cfffcc'}
                onChange={(e) => onChange({ macCheckerColor: e.target.value })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#000000"
                value={macCheckerColor || ''}
                onChange={(e) => onChange({ macCheckerColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Window Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={macWindowBgColor || '#afb3ee'}
                onChange={(e) => onChange({ macWindowBgColor: e.target.value })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#ffffff"
                value={macWindowBgColor || ''}
                onChange={(e) => onChange({ macWindowBgColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
