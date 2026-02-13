'use client'

import { useRef, useEffect } from 'react'

interface BlinkieTileBackgroundProps {
  bgID: string
  frames: number
  delay: number // centiseconds (10 = 100ms)
  className?: string
  opacity?: number
  /** When true (default), tiles at 150x20. When false, stretches to fill the container. */
  tile?: boolean
}

/**
 * Renders an animated tiling blinky background using the actual PNG frames.
 * Uses direct DOM manipulation to avoid React re-renders.
 *
 * Must be placed inside a `position: relative` container.
 * Renders as absolute-positioned, pointer-events-none, behind content.
 */
export function BlinkieTileBackground({
  bgID,
  frames,
  delay,
  className = '',
  opacity = 1,
  tile = true,
}: BlinkieTileBackgroundProps) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = divRef.current
    if (!el) return

    const urls = Array.from({ length: frames }, (_, i) => `/blinkies/${bgID}-${i}.png`)

    // Preload all frames (use document.createElement to avoid Next.js Image conflicts)
    urls.forEach(url => {
      const img = document.createElement('img')
      img.src = url
    })

    // Set initial frame
    el.style.backgroundImage = `url('${urls[0]}')`

    if (frames <= 1) return

    let frameIndex = 0
    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames
      if (el) {
        el.style.backgroundImage = `url('${urls[frameIndex]}')`
      }
    }, delay * 10) // centiseconds → ms

    return () => clearInterval(interval)
  }, [bgID, frames, delay])

  return (
    <div
      ref={divRef}
      className={`absolute inset-0 -z-[1] pointer-events-none ${className}`}
      style={{
        backgroundRepeat: 'repeat',
        backgroundSize: tile ? '150px 20px' : '100% auto',
        imageRendering: 'pixelated',
        opacity,
      }}
    />
  )
}
