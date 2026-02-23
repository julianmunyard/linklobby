'use client'

import { useRef, useEffect } from 'react'

interface NoiseProps {
  patternSize?: number
  patternScaleX?: number
  patternScaleY?: number
  patternRefreshInterval?: number
  patternAlpha?: number
}

export function Noise({
  patternSize = 460,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
}: NoiseProps) {
  const grainRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = grainRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const canvasSize = 512
    let intervalId: ReturnType<typeof setInterval> | undefined

    const resize = () => {
      if (!canvas) return
      canvas.width = canvasSize
      canvas.height = canvasSize

      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
    }

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = patternAlpha
      }

      ctx.putImageData(imageData, 0, 0)
    }

    window.addEventListener('resize', resize)
    resize()
    drawGrain()

    // Refresh at ~5fps using setInterval instead of rAF to avoid
    // blocking the main thread during scroll/touch interactions
    intervalId = setInterval(drawGrain, 200)

    return () => {
      window.removeEventListener('resize', resize)
      clearInterval(intervalId)
    }
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha])

  return (
    <canvas
      ref={grainRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        imageRendering: 'pixelated',
        zIndex: 40,
      }}
    />
  )
}
