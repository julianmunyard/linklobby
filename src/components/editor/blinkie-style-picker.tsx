// src/components/editor/blinkie-style-picker.tsx
'use client'

import { useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { BLINKIE_STYLES, type BlinkieStyleDef } from '@/data/blinkie-styles'
import { cn } from '@/lib/utils'

interface BlinkieStylePickerProps {
  currentStyle: string
  onStyleChange: (style: string) => void
}

// Collect all unique blinkie font names for preloading
const BLINKIE_FONTS = [...new Set(Object.values(BLINKIE_STYLES).map(s => s.font))]

// Wait for all blinkie fonts to be loaded by the browser
function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  const loads = BLINKIE_FONTS.map(f => document.fonts.load(`16px "${f}"`).catch(() => {}))
  return Promise.all(loads).then(() => {})
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

    let cancelled = false

    const W = 150
    const H = 20

    function drawFrame(fi: number, images: HTMLImageElement[]) {
      const img = images[fi]
      if (!img || !ctx) return
      ctx.clearRect(0, 0, W, H)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, W, H)

      // Draw label text — only use the blinkie's own font, no fallbacks
      const colours = Array.isArray(styleDef.colour) ? styleDef.colour : Array(styleDef.frames).fill(styleDef.colour)
      const fontSize = Math.min(styleDef.fontsize, 14)
      ctx.font = `${styleDef.fontweight || 'normal'} ${fontSize}px "${styleDef.font}"`
      ctx.textAlign = 'center'
      // Use alphabetic baseline + measureText to match ImageMagick's
      // -gravity Center centering (pixel fonts have unusual em-box metrics)
      ctx.textBaseline = 'alphabetic'
      const metrics = ctx.measureText(label)
      const cy = (H / 2) + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2
      ctx.fillStyle = colours[fi]
      ctx.fillText(label, W / 2, cy)
    }

    async function init() {
      // Wait for blinkie fonts to load before any drawing
      await waitForFonts()
      if (cancelled) return

      // Load all background frame images
      const images = await new Promise<HTMLImageElement[]>((resolve) => {
        const imgs: HTMLImageElement[] = Array(styleDef.frames)
        let loaded = 0
        for (let i = 0; i < styleDef.frames; i++) {
          const img = new Image()
          img.onload = img.onerror = () => {
            loaded++
            if (loaded === styleDef.frames) resolve(imgs)
          }
          img.src = `/blinkies/${styleDef.bgID}-${i}.png`
          imgs[i] = img
        }
      })

      if (cancelled) return

      let frameIndex = 0

      // Draw first frame
      drawFrame(0, images)

      // Animate
      if (styleDef.frames > 1) {
        timerRef.current = setInterval(() => {
          frameIndex = (frameIndex + 1) % styleDef.frames
          drawFrame(frameIndex, images)
        }, styleDef.delay * 10)
      }
    }

    init()

    return () => {
      cancelled = true
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
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
