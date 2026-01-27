"use client"

import { useEffect, useRef } from "react"

interface UseGameLoopOptions {
  onUpdate: (deltaTime: number) => void
  onDraw: (ctx: CanvasRenderingContext2D) => void
  isPlaying: boolean
}

export function useGameLoop({ onUpdate, onDraw, isPlaying }: UseGameLoopOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameIdRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Cap deltaTime to prevent huge jumps after tab switch (max 100ms = 10fps minimum)
      const cappedDelta = Math.min(deltaTime, 100)

      onUpdate(cappedDelta)
      onDraw(ctx)

      frameIdRef.current = requestAnimationFrame(gameLoop)
    }

    // Reset lastTime on start
    lastTimeRef.current = performance.now()
    frameIdRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [isPlaying, onUpdate, onDraw])

  return canvasRef
}
