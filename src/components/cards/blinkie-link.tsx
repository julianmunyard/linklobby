// src/components/cards/blinkie-link.tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'
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

export function BlinkieLink({ card, isPreview = false }: BlinkieLinkProps) {
  const content = card.content as LinkCardContent
  const blinkieStyle = content.blinkieStyle || '0008-pink'
  const styleDef = BLINKIE_STYLES[blinkieStyle] || BLINKIE_STYLES['0008-pink']

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const loadedRef = useRef(false)

  const text = card.title || 'Untitled'

  // Draw a single frame onto the canvas
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, frameIndex: number) => {
    const img = imagesRef.current[frameIndex]
    if (!img) return

    const w = BLINKIE_W * SCALE
    const h = BLINKIE_H * SCALE

    // Clear and draw background frame
    ctx.clearRect(0, 0, w, h)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 0, 0, w, h)

    // Text settings
    const colours = eachFrame(styleDef.colour, styleDef.frames)
    const fontSize = styleDef.fontsize * SCALE
    const fontWeight = styleDef.fontweight || 'normal'
    ctx.font = `${fontWeight} ${fontSize}px "${styleDef.font}", moonaco, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const cx = (w / 2) + (styleDef.x * SCALE)
    const cy = (h / 2) + (styleDef.y * SCALE)

    // Outline (4 offset copies in cardinal directions)
    if (styleDef.outline) {
      const outlines = eachFrame(styleDef.outline, styleDef.frames)
      ctx.fillStyle = outlines[frameIndex]
      const off = SCALE
      ctx.fillText(text, cx + off, cy)
      ctx.fillText(text, cx - off, cy)
      ctx.fillText(text, cx, cy + off)
      ctx.fillText(text, cx, cy - off)
    }

    // Shadow
    if (styleDef.shadow) {
      const shadows = eachFrame(styleDef.shadow, styleDef.frames)
      const sx = (styleDef.shadowx ?? -1) * SCALE
      const sy = (styleDef.shadowy ?? 0) * SCALE
      ctx.fillStyle = shadows[frameIndex]
      ctx.fillText(text, cx + sx, cy + sy)
    }

    // Main text
    ctx.fillStyle = colours[frameIndex]
    ctx.fillText(text, cx, cy)
  }, [text, styleDef])

  // Load background frame images and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset state
    loadedRef.current = false
    frameRef.current = 0
    if (timerRef.current) clearInterval(timerRef.current)
    imagesRef.current = []

    const bgID = styleDef.bgID
    const frameCount = styleDef.frames
    let loadedCount = 0

    // Pre-load all frame images
    const images: HTMLImageElement[] = Array(frameCount)
    for (let i = 0; i < frameCount; i++) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          imagesRef.current = images
          loadedRef.current = true
          // Draw first frame immediately
          drawFrame(ctx, 0)
          // Start animation loop
          if (frameCount > 1) {
            timerRef.current = setInterval(() => {
              frameRef.current = (frameRef.current + 1) % frameCount
              drawFrame(ctx, frameRef.current)
            }, styleDef.delay * 10) // delay is in centiseconds → ms
          }
        }
      }
      img.onerror = () => {
        // If image fails, still count it as loaded to not block others
        loadedCount++
      }
      img.src = `/blinkies/${bgID}-${i}.png`
      images[i] = img
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [styleDef, drawFrame])

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
