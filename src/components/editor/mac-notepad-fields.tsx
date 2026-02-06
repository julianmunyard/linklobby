'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MacLink {
  title: string
  url: string
}

interface MacNotepadFieldsProps {
  macLinks: MacLink[]
  onChange: (updates: Record<string, unknown>) => void
}

export function MacNotepadFields({ macLinks, onChange }: MacNotepadFieldsProps) {
  const links = macLinks || []

  function addLink() {
    onChange({ macLinks: [...links, { title: '', url: '' }] })
  }

  function updateLink(index: number, field: 'title' | 'url', value: string) {
    const updated = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    )
    onChange({ macLinks: updated })
  }

  function removeLink(index: number) {
    onChange({ macLinks: links.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Note Pad Links</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLink} className="h-8">
          <Plus className="h-3 w-3 mr-1" />
          Add Link
        </Button>
      </div>

      {links.length === 0 && (
        <p className="text-xs text-muted-foreground">No links yet. Add links to show in the notepad.</p>
      )}

      {links.map((link, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Link title"
              value={link.title}
              onChange={(e) => updateLink(i, 'title', e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(i, 'url', e.target.value)}
              className="h-9"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeLink(i)}
            className="h-9 w-9 flex-shrink-0 mt-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
