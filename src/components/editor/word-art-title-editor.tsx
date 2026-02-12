'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WordArtStylePicker } from './word-art-style-picker'
import { useThemeStore } from '@/stores/theme-store'

interface WordArtTitleEditorProps {
  onClose: () => void
}

export function WordArtTitleEditor({ onClose }: WordArtTitleEditorProps) {
  const wordArtTitleStyle = useThemeStore((s) => s.wordArtTitleStyle)
  const setWordArtTitleStyle = useThemeStore((s) => s.setWordArtTitleStyle)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold text-sm">Title Style</h2>
          <p className="text-xs text-muted-foreground">Word Art</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
        <WordArtStylePicker
          currentStyleId={wordArtTitleStyle}
          onChange={setWordArtTitleStyle}
        />
      </div>
    </div>
  )
}
