// src/components/editor/blinkie-style-picker.tsx
'use client'

import { Label } from '@/components/ui/label'
import { BLINKIE_STYLES, type BlinkieStyleId } from '@/components/cards/blinkie-link'
import { cn } from '@/lib/utils'

interface BlinkieStylePickerProps {
  currentStyle: string
  onStyleChange: (style: string) => void
}

export function BlinkieStylePicker({ currentStyle, onStyleChange }: BlinkieStylePickerProps) {
  const styles = Object.entries(BLINKIE_STYLES) as [BlinkieStyleId, typeof BLINKIE_STYLES[BlinkieStyleId]][]

  return (
    <div className="space-y-3">
      <Label>Blinky Style</Label>
      <div className="grid grid-cols-2 gap-2">
        {styles.map(([styleId, styleConfig]) => (
          <button
            key={styleId}
            type="button"
            onClick={() => onStyleChange(styleId)}
            className={cn(
              'relative overflow-hidden transition-all rounded-sm',
              currentStyle === styleId && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {/* Mini blinky preview - override badge sizing for picker */}
            <div
              className={cn('blinkie-badge', styleConfig.className)}
              style={{ minHeight: '28px', padding: '6px 8px' }}
            >
              <span className="blinkie-text" style={{ fontSize: '9px' }}>
                {styleConfig.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
