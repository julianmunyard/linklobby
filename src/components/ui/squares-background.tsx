'use client'

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SquaresProps {
  direction?: 'right' | 'left' | 'up' | 'down' | 'diagonal'
  speed?: number
  borderColor?: string
  squareSize?: number
  hoverFillColor?: string
  className?: string
}

export function Squares({
  direction = 'diagonal',
  speed = 0.5,
  borderColor = '#333',
  squareSize = 40,
  hoverFillColor = '#222',
  className,
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>(0)
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null)

  const getDirectionOffset = useCallback(() => {
    switch (direction) {
      case 'right':
        return { x: speed, y: 0 }
      case 'left':
        return { x: -speed, y: 0 }
      case 'up':
        return { x: 0, y: -speed }
      case 'down':
        return { x: 0, y: speed }
      case 'diagonal':
        return { x: speed, y: speed }
      default:
        return { x: speed, y: speed }
    }
  }, [direction, speed])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const gridX = Math.floor(
        (mouseX + ((offsetRef.current.x % squareSize) + squareSize) % squareSize) / squareSize
      )
      const gridY = Math.floor(
        (mouseY + ((offsetRef.current.y % squareSize) + squareSize) % squareSize) / squareSize
      )

      hoveredSquare.current = { x: gridX, y: gridY }
    }

    const handleMouseLeave = () => {
      hoveredSquare.current = null
    }

    const drawGrid = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      const dirOffset = getDirectionOffset()
      offsetRef.current.x += dirOffset.x
      offsetRef.current.y += dirOffset.y

      const offsetX = ((offsetRef.current.x % squareSize) + squareSize) % squareSize
      const offsetY = ((offsetRef.current.y % squareSize) + squareSize) % squareSize

      const cols = Math.ceil(width / squareSize) + 1
      const rows = Math.ceil(height / squareSize) + 1

      // Draw hovered square fill
      if (hoveredSquare.current) {
        const hx = hoveredSquare.current.x * squareSize - offsetX
        const hy = hoveredSquare.current.y * squareSize - offsetY
        ctx.fillStyle = hoverFillColor
        ctx.fillRect(hx, hy, squareSize, squareSize)
      }

      // Draw grid lines
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.5

      for (let i = 0; i <= cols; i++) {
        const x = i * squareSize - offsetX
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      for (let j = 0; j <= rows; j++) {
        const y = j * squareSize - offsetY
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Radial gradient vignette overlay
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      )
      gradient.addColorStop(0, 'transparent')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      requestRef.current = requestAnimationFrame(drawGrid)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    requestRef.current = requestAnimationFrame(drawGrid)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(requestRef.current)
    }
  }, [squareSize, borderColor, hoverFillColor, getDirectionOffset])

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full h-full block', className)}
    />
  )
}
