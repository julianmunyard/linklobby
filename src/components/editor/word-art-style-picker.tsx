'use client'

import { cn } from '@/lib/utils'
import { WORD_ART_STYLES, getRandomWordArtStyle, getWordArtStyle } from '@/lib/word-art-styles'
import type { WordArtStyle } from '@/lib/word-art-styles'
import { Button } from '@/components/ui/button'
import { Shuffle } from 'lucide-react'

interface WordArtStylePickerProps {
  currentStyleId: string
  onChange: (styleId: string) => void
}

/** Mini preview of a word art style */
function StylePreview({ style, isSelected }: { style: WordArtStyle; isSelected: boolean }) {
  return (
    <div
      className={cn(
        'relative inline-block overflow-hidden',
      )}
      style={{ ...style.wrapperStyle, fontSize: '0.75rem', transform: `${style.wrapperStyle.transform || ''} scale(0.8)`.trim() }}
    >
      {style.shadowStyle && (
        <span
          className="absolute inset-0"
          style={{ ...style.textStyle, ...style.shadowStyle, fontSize: '0.75rem' }}
          aria-hidden="true"
        >
          {style.name}
        </span>
      )}
      <span style={{ ...style.textStyle, fontSize: '0.75rem' }}>{style.name}</span>
    </div>
  )
}

export function WordArtStylePicker({ currentStyleId, onChange }: WordArtStylePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Word Art Style</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(getRandomWordArtStyle())}
          className="h-8 gap-1"
        >
          <Shuffle className="h-3 w-3" />
          Random
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {WORD_ART_STYLES.map((style) => {
          const isSelected = style.id === currentStyleId
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={cn(
                'flex items-center justify-center p-3 rounded-md border-2 transition-all min-h-[48px] overflow-hidden',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              )}
            >
              <StylePreview style={style} isSelected={isSelected} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
