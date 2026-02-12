// src/components/cards/blinkie-link.tsx
'use client'

import { useRef, useEffect } from 'react'
import type { Card, LinkCardContent } from '@/types/card'

interface BlinkieLinkProps {
  card: Card
  isPreview?: boolean
}

// Real blinkie style definitions from blinkies.cafe repo
// Each style matches the original blinkieData.js format
export interface BlinkieStyleDef {
  name: string
  bgID: string           // Background PNG prefix (may differ from style key)
  frames: number         // Number of animation frames
  delay: number          // Frame delay in centiseconds (10 = 100ms)
  colour: string[]       // Text color per frame
  font: string           // Font family
  fontsize: number       // Font size in px
  fontweight?: string    // 'bold' | 'normal'
  x: number              // Text X offset from center
  y: number              // Text Y offset from center
  outline?: string[]     // Outline color per frame (optional)
  shadow?: string[]      // Shadow color per frame (optional)
  shadowx?: number       // Shadow X offset
  shadowy?: number       // Shadow Y offset
  tags: string[]         // Category tags
}

// Helper to expand single value to per-frame array
function eachFrame<T>(val: T | T[], frames: number): T[] {
  if (Array.isArray(val)) return val
  return Array(frames).fill(val)
}

// 25 curated styles from the real blinkies.cafe data
export const BLINKIE_STYLES: Record<string, BlinkieStyleDef> = {
  '0006-purple': {
    name: 'Simple Purple', bgID: '0006-purple', frames: 2, delay: 10,
    colour: ['#000000', '#000000'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['plain'],
  },
  '0008-pink': {
    name: 'Simple Pink', bgID: '0008-pink', frames: 2, delay: 10,
    colour: ['#ff40ff', '#ff40ff'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['plain', 'pink'],
  },
  '0017-love': {
    name: 'Love', bgID: '0017-love', frames: 8, delay: 10,
    colour: ['#d61a49', '#e33a8e', '#ea4aad', '#e33a8e', '#d61a49', '#cf0c1f', '#c80000', '#cf0c1f'],
    shadow: ['#d61a49', '#e33a8e', '#ea4aad', '#e33a8e', '#d61a49', '#cf0c1f', '#c80000', '#cf0c1f'],
    font: 'rainyhearts', fontsize: 16, x: 0, y: 0,
    tags: ['love'],
  },
  '0018-glitter': {
    name: 'Glitter', bgID: '0018-glitter', frames: 3, delay: 10,
    colour: ['#000000', '#000000', '#000000'],
    font: 'dogica', fontweight: 'bold', fontsize: 12, x: 0, y: 1,
    tags: ['sparkle'],
  },
  '0029-pinksparkle': {
    name: 'Pink Sparkle', bgID: '0029-pinksparkle', frames: 2, delay: 15,
    colour: ['#ffb3ed', '#ffb3ed'],
    shadow: ['#563c46', '#563c46'],
    font: 'rainyhearts', fontsize: 16, x: 0, y: 0,
    tags: ['pink', 'sparkle'],
  },
  '0005-citystars': {
    name: 'City Stars', bgID: '0005-citystars', frames: 2, delay: 25,
    colour: ['#ffffff', '#ffffff'], font: '04b03', fontsize: 8, x: 6, y: 0,
    tags: ['plain'],
  },
  '0025-birthdaycake': {
    name: 'Birthday Cake', bgID: '0025-birthdaycake', frames: 4, delay: 10,
    colour: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
    font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['food', 'occasion'],
  },
  '0001-saucer': {
    name: 'UFO Saucer', bgID: '0001-saucer', frames: 2, delay: 10,
    colour: ['#ff0000', '#ff4e4e'],
    font: 'Perfect DOS VGA 437', fontsize: 16, x: -14, y: -1,
    tags: ['spooky'],
  },
  '0003-ghost': {
    name: 'Ghost', bgID: '0003-ghost', frames: 2, delay: 10,
    colour: ['#e79400', '#e77400'],
    font: 'infernalda', fontsize: 16, x: -13, y: -1,
    tags: ['spooky'],
  },
  '0021-vampirefangs': {
    name: 'Vampire', bgID: '0021-vampirefangs', frames: 8, delay: 10,
    colour: ['#d00000', '#d00000', '#ff0000', '#d00000', '#d00000', '#ff0000', '#ff0000', '#ff0000'],
    font: 'alagard', fontsize: 16, x: 10, y: -1,
    tags: ['spooky'],
  },
  '0011-frog': {
    name: 'Frog', bgID: '0011-frog', frames: 2, delay: 10,
    colour: ['#000000', '#000000'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['nature'],
  },
  '0030-catpaw': {
    name: 'Cat Paw', bgID: '0030-catpaw', frames: 2, delay: 10,
    colour: ['#000000', '#000000'],
    shadow: ['#888888', '#888888'],
    font: 'moonaco', fontsize: 16, x: -8, y: 0,
    tags: ['nature'],
  },
  '0002-mushroom': {
    name: 'Mushroom', bgID: '0002-mushroom', frames: 2, delay: 10,
    colour: ['#8c2000', '#8c2000'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['nature', 'food'],
  },
  '0004-peachy': {
    name: 'Peachy', bgID: '0004-peachy', frames: 2, delay: 10,
    colour: ['black', 'black'], font: 'moonaco', fontsize: 16, x: 7, y: 0,
    tags: ['food'],
  },
  '0007-chocolate': {
    name: 'Chocolate', bgID: '0007-chocolate', frames: 2, delay: 10,
    colour: ['#000000', '#000000'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['food'],
  },
  '0019-candy': {
    name: 'Candy', bgID: '0019-candy', frames: 2, delay: 25,
    colour: ['#ffcee7', '#ffcee7'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['food'],
  },
  '0014-pride': {
    name: 'Pride', bgID: '0014-pride', frames: 4, delay: 10,
    colour: ['#ffffff', '#ffffff', '#ffffff', '#ffffff'],
    outline: ['#000000', '#000000', '#000000', '#000000'],
    font: 'pixeloid sans', fontweight: 'bold', fontsize: 9, x: 0, y: 0,
    tags: ['lgbtq'],
  },
  '0023-trans-pride': {
    name: 'Trans Pride', bgID: '0023-trans-pride', frames: 5, delay: 10,
    colour: ['#000000', '#000000', '#000000', '#000000', '#000000'],
    font: 'pixeloid sans', fontweight: 'bold', fontsize: 9, x: 0, y: 0,
    tags: ['lgbtq'],
  },
  '0015-exit-button': {
    name: 'Exit Button', bgID: '0015-exit-button', frames: 2, delay: 10,
    colour: ['#ffffff', '#ffffff'], font: 'moonaco', fontsize: 16, x: 12, y: 0,
    tags: ['computer'],
  },
  '0028-computer': {
    name: 'Computer', bgID: '0028-computer', frames: 2, delay: 25,
    colour: ['#ffffff', '#ffffff'], font: 'moonaco', fontsize: 16, x: 7, y: 0,
    tags: ['computer'],
  },
  '0012-kiss': {
    name: 'Kiss', bgID: '0012-kiss', frames: 2, delay: 10,
    colour: ['#feaaaa', '#feaaaa'], font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['love'],
  },
  '0013-starryeyes': {
    name: 'Starry Eyes', bgID: '0013-starryeyes', frames: 3, delay: 10,
    colour: ['#002984', '#002984', '#002984'],
    font: 'rainyhearts', fontsize: 16, x: -4, y: 0,
    tags: ['pink', 'nature'],
  },
  '0016-valentine': {
    name: 'Valentine', bgID: '0016-valentine', frames: 2, delay: 10,
    colour: ['#ad2121', '#ad2121'], font: 'moonaco', fontsize: 16, x: -12, y: 0,
    tags: ['love', 'occasion'],
  },
  '0027-sakura': {
    name: 'Sakura', bgID: '0027-sakura', frames: 4, delay: 10,
    colour: ['#cc557f', '#cc557f', '#cc557f', '#cc557f'],
    font: 'moonaco', fontsize: 16, x: -1, y: -1,
    tags: ['pink', 'nature'],
  },
  '0055-rainbowswirl': {
    name: 'Rainbow Swirl', bgID: '0055-rainbowswirl', frames: 10, delay: 10,
    colour: ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'],
    font: 'moonaco', fontsize: 16, x: 0, y: 0,
    tags: ['rainbow'],
  },
}

export type BlinkieStyleId = keyof typeof BLINKIE_STYLES

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

      const cx = (w / 2) + (style.x * SCALE)
      const targetCy = (h / 2) + (style.y * SCALE)

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

      // Shadow
      if (style.shadow) {
        const shadows = eachFrame(style.shadow, style.frames)
        const sx = (style.shadowx ?? -1) * SCALE
        const sy = (style.shadowy ?? 0) * SCALE
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
