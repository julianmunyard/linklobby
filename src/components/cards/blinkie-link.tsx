// src/components/cards/blinkie-link.tsx
'use client'

import { useRef, useEffect } from 'react'
import type { Card, LinkCardContent } from '@/types/card'
import { BLINKIE_STYLES, type BlinkieStyleDef } from '@/data/blinkie-styles'

// Re-export for consumers that imported from here
export { BLINKIE_STYLES, type BlinkieStyleDef, type BlinkieStyleId } from '@/data/blinkie-styles'

interface BlinkieLinkProps {
  card: Card
  isPreview?: boolean
}

// Helper to expand single value to per-frame array
function eachFrame<T>(val: T | T[], frames: number): T[] {
  if (Array.isArray(val)) return val
  return Array(frames).fill(val)
}

// Blinkie dimensions (native)
const BLINKIE_W = 150
const BLINKIE_H = 20

// Scale factor for crisp rendering
const SCALE = 3

// Collect all unique blinkie font names for preloading
const BLINKIE_FONTS = [...new Set(Object.values(BLINKIE_STYLES).map(s => s.font))]

// Wait for all blinkie fonts to be loaded by the browser
function waitForFonts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  // Ask the browser to load each font face we need
  const loads = BLINKIE_FONTS.map(f => document.fonts.load(`16px "${f}"`).catch(() => {}))
  return Promise.all(loads).then(() => {})
}

export function BlinkieLink({ card, isPreview = false }: BlinkieLinkProps) {
  const content = card.content as LinkCardContent
  const blinkieStyle = content.blinkieStyle || '0008-pink'
  const styleDef = BLINKIE_STYLES[blinkieStyle] || BLINKIE_STYLES['0008-pink']

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Store mutable values in refs so the animation loop always reads fresh
  // values without causing the effect to re-run
  const textRef = useRef(card.title || 'Untitled')
  textRef.current = card.title || 'Untitled'

  const styleRef = useRef(styleDef)
  styleRef.current = styleDef

  // The only value that should restart the animation is the style ID itself
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    // Draw a single frame
    function drawFrame(
      images: HTMLImageElement[],
      frameIndex: number,
      style: BlinkieStyleDef,
      text: string,
    ) {
      const img = images[frameIndex]
      if (!img || !ctx) return

      const w = BLINKIE_W * SCALE
      const h = BLINKIE_H * SCALE

      ctx.clearRect(0, 0, w, h)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, w, h)

      // Font — only use the blinkie's own font, no project font fallbacks
      const fontSize = style.fontsize * SCALE
      const fontWeight = style.fontweight || 'normal'
      ctx.font = `${fontWeight} ${fontSize}px "${style.font}"`
      ctx.textAlign = 'center'
      // Use alphabetic baseline + measureText to match ImageMagick's
      // -gravity Center, which centers on actual glyph bounds rather
      // than the em-box middle (pixel fonts have unusual metrics)
      ctx.textBaseline = 'alphabetic'

      // x/y can be per-frame arrays or single values
      const xVals = eachFrame(style.x, style.frames)
      const yVals = eachFrame(style.y, style.frames)

      // ImageMagick's -page +X+Y offsets the IMAGE on the canvas, so
      // text at canvas-center appears at (center - offset) in image coords.
      // We must NEGATE the x/y to match.
      const cx = (w / 2) - (xVals[frameIndex] * SCALE)
      const targetCy = (h / 2) - (yVals[frameIndex] * SCALE)

      // Compute true visual center Y from actual glyph bounding box
      const metrics = ctx.measureText(text)
      const cy = targetCy + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2

      // Outline (4 offset copies in cardinal directions)
      if (style.outline) {
        const outlines = eachFrame(style.outline, style.frames)
        ctx.fillStyle = outlines[frameIndex]
        const off = SCALE
        ctx.fillText(text, cx + off, cy)
        ctx.fillText(text, cx - off, cy)
        ctx.fillText(text, cx, cy + off)
        ctx.fillText(text, cx, cy - off)
      }

      // Shadow (shadowx/shadowy can also be per-frame arrays)
      if (style.shadow) {
        const shadows = eachFrame(style.shadow, style.frames)
        const sxVals = eachFrame(style.shadowx ?? -1, style.frames)
        const syVals = eachFrame(style.shadowy ?? 0, style.frames)
        const sx = -(sxVals[frameIndex] * SCALE)
        const sy = -(syVals[frameIndex] * SCALE)
        ctx.fillStyle = shadows[frameIndex]
        ctx.fillText(text, cx + sx, cy + sy)
      }

      // Main text
      const colours = eachFrame(style.colour, style.frames)
      ctx.fillStyle = colours[frameIndex]
      ctx.fillText(text, cx, cy)
    }

    async function init() {
      // Wait for blinkie fonts to load before any drawing
      await waitForFonts()
      if (cancelled) return

      const style = styleRef.current
      const bgID = style.bgID
      const frameCount = style.frames

      // Load all background frame images
      const images = await new Promise<HTMLImageElement[]>((resolve) => {
        const imgs: HTMLImageElement[] = Array(frameCount)
        let loaded = 0
        for (let i = 0; i < frameCount; i++) {
          const img = new Image()
          img.onload = img.onerror = () => {
            loaded++
            if (loaded === frameCount) resolve(imgs)
          }
          img.src = `/blinkies/${bgID}-${i}.png`
          imgs[i] = img
        }
      })

      if (cancelled) return

      let frameIndex = 0

      // Draw first frame
      drawFrame(images, 0, styleRef.current, textRef.current)

      // Animate: cycle frames at the style's delay rate
      if (frameCount > 1) {
        intervalId = setInterval(() => {
          frameIndex = (frameIndex + 1) % frameCount
          // Always read current refs for fresh text/style
          drawFrame(images, frameIndex, styleRef.current, textRef.current)
        }, style.delay * 10) // centiseconds → ms
        timerRef.current = intervalId
      }
    }

    init()

    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  // Only restart animation when the actual style ID changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blinkieStyle])

  const Wrapper = card.url && !isPreview ? 'a' : 'div'
  const wrapperProps = card.url && !isPreview
    ? { href: card.url, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrapper {...wrapperProps} className="blinkie-card">
      <canvas
        ref={canvasRef}
        width={BLINKIE_W * SCALE}
        height={BLINKIE_H * SCALE}
        style={{
          width: '100%',
          height: 'auto',
          imageRendering: 'pixelated',
        }}
      />
    </Wrapper>
  )
}
