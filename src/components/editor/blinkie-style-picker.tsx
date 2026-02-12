// src/components/editor/blinkie-style-picker.tsx
'use client'

import { useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { BLINKIE_STYLES, type BlinkieStyleDef } from '@/components/cards/blinkie-link'
import { cn } from '@/lib/utils'

interface BlinkieStylePickerProps {
  currentStyle: string
  onStyleChange: (style: string) => void
}

// Mini blinkie preview rendered on canvas
function BlinkiePreview({ styleDef, label }: { styleDef: BlinkieStyleDef; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 150
    const H = 20
    let frameIndex = 0
    let loadedCount = 0

    const images: HTMLImageElement[] = Array(styleDef.frames)
    for (let i = 0; i < styleDef.frames; i++) {
      const img = new Image()
      img.onload = () => {
        loadedCount++
        if (loadedCount === styleDef.frames) {
          // Draw first frame
          drawFrame(0)
          // Animate
          if (styleDef.frames > 1) {
            timerRef.current = setInterval(() => {
              frameIndex = (frameIndex + 1) % styleDef.frames
              drawFrame(frameIndex)
            }, styleDef.delay * 10)
          }
        }
      }
      img.onerror = () => { loadedCount++ }
      img.src = `/blinkies/${styleDef.bgID}-${i}.png`
      images[i] = img
    }

    function drawFrame(fi: number) {
      const img = images[fi]
      if (!img || !ctx) return
      ctx.clearRect(0, 0, W, H)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, W, H)

      // Draw label text
      const colours = Array.isArray(styleDef.colour) ? styleDef.colour : Array(styleDef.frames).fill(styleDef.colour)
      const fontSize = Math.min(styleDef.fontsize, 14)
      ctx.font = `${styleDef.fontweight || 'normal'} ${fontSize}px "${styleDef.font}", moonaco, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = colours[fi]
      ctx.fillText(label, W / 2, H / 2)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [styleDef, label])

  return (
    <canvas
      ref={canvasRef}
      width={150}
      height={20}
      style={{ width: '100%', height: 'auto', imageRendering: 'pixelated' }}
    />
  )
}

export function BlinkieStylePicker({ currentStyle, onStyleChange }: BlinkieStylePickerProps) {
  const styles = Object.entries(BLINKIE_STYLES)

  return (
    <div className="space-y-3">
      <Label>Blinky Style</Label>
      <div className="grid grid-cols-2 gap-2">
        {styles.map(([styleId, styleDef]) => (
          <button
            key={styleId}
            type="button"
            onClick={() => onStyleChange(styleId)}
            className={cn(
              'relative overflow-hidden transition-all',
              currentStyle === styleId
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'hover:ring-1 hover:ring-muted-foreground/30'
            )}
          >
            <BlinkiePreview styleDef={styleDef} label={styleDef.name} />
          </button>
        ))}
      </div>
    </div>
  )
}
