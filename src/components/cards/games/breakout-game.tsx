"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useGameLoop } from "@/hooks/use-game-loop"

interface Brick {
  x: number
  y: number
  width: number
  height: number
  color: string
  alive: boolean
}

interface BreakoutGameProps {
  width: number
  height: number
  isPlaying: boolean
  onGameOver: (score: number) => void
  onScoreChange: (score: number) => void
}

const PADDLE_WIDTH_RATIO = 0.2  // 20% of canvas width
const PADDLE_HEIGHT = 12
const BALL_RADIUS = 8
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_HEIGHT = 15
const BRICK_GAP = 4
const BALL_SPEED = 5

export function BreakoutGame({
  width,
  height,
  isPlaying,
  onGameOver,
  onScoreChange,
}: BreakoutGameProps) {
  const paddleWidth = width * PADDLE_WIDTH_RATIO

  // Game state
  const [paddleX, setPaddleX] = useState(width / 2 - paddleWidth / 2)
  const [ball, setBall] = useState({ x: width / 2, y: height - 50, vx: 3, vy: -4 })
  const [bricks, setBricks] = useState<Brick[]>([])
  const [score, setScore] = useState(0)

  // Refs for game loop
  const paddleXRef = useRef(paddleX)
  const ballRef = useRef(ball)

  useEffect(() => { paddleXRef.current = paddleX }, [paddleX])
  useEffect(() => { ballRef.current = ball }, [ball])

  // Initialize bricks
  const initBricks = useCallback(() => {
    const brickWidth = (width - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS
    const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#00ffff"]
    const newBricks: Brick[] = []

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: BRICK_GAP + col * (brickWidth + BRICK_GAP),
          y: 30 + row * (BRICK_HEIGHT + BRICK_GAP),
          width: brickWidth,
          height: BRICK_HEIGHT,
          color: colors[row % colors.length],
          alive: true,
        })
      }
    }
    setBricks(newBricks)
  }, [width])

  // Reset game
  useEffect(() => {
    if (isPlaying) {
      setPaddleX(width / 2 - paddleWidth / 2)
      setBall({
        x: width / 2,
        y: height - 50,
        vx: (Math.random() > 0.5 ? 1 : -1) * 3,
        vy: -4,
      })
      setScore(0)
      initBricks()
    }
  }, [isPlaying, width, height, paddleWidth, initBricks])

  // Game update
  const onUpdate = useCallback(
    (deltaTime: number) => {
      const speedMultiplier = deltaTime / 16  // Normalize to ~60fps

      setBall((prev) => {
        let { x, y, vx, vy } = prev
        const currentPaddleX = paddleXRef.current

        // Move ball
        x += vx * speedMultiplier
        y += vy * speedMultiplier

        // Wall collisions (left/right)
        if (x - BALL_RADIUS <= 0 || x + BALL_RADIUS >= width) {
          vx = -vx
          x = Math.max(BALL_RADIUS, Math.min(width - BALL_RADIUS, x))
        }

        // Top wall
        if (y - BALL_RADIUS <= 0) {
          vy = Math.abs(vy)
          y = BALL_RADIUS
        }

        // Bottom - game over
        if (y + BALL_RADIUS >= height) {
          onGameOver(score)
          return prev
        }

        // Paddle collision
        const paddleTop = height - 30
        if (
          y + BALL_RADIUS >= paddleTop &&
          y - BALL_RADIUS <= paddleTop + PADDLE_HEIGHT &&
          x >= currentPaddleX &&
          x <= currentPaddleX + paddleWidth
        ) {
          vy = -Math.abs(vy)
          // Add angle based on where ball hits paddle
          const hitPos = (x - currentPaddleX) / paddleWidth
          vx = (hitPos - 0.5) * 8
          y = paddleTop - BALL_RADIUS
        }

        // Brick collisions
        setBricks((prevBricks) => {
          let brickHit = false
          const newBricks = prevBricks.map((brick) => {
            if (!brick.alive) return brick
            if (
              x + BALL_RADIUS > brick.x &&
              x - BALL_RADIUS < brick.x + brick.width &&
              y + BALL_RADIUS > brick.y &&
              y - BALL_RADIUS < brick.y + brick.height
            ) {
              if (!brickHit) {
                brickHit = true
                vy = -vy
                const newScore = score + 10
                setScore(newScore)
                onScoreChange(newScore)
              }
              return { ...brick, alive: false }
            }
            return brick
          })
          return newBricks
        })

        return { x, y, vx, vy }
      })
    },
    [width, height, paddleWidth, score, onGameOver, onScoreChange]
  )

  // Render
  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      // Draw bricks
      bricks.forEach((brick) => {
        if (!brick.alive) return
        ctx.fillStyle = brick.color
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.fillRect(brick.x, brick.y, brick.width, 3)
      })

      // Draw paddle
      ctx.fillStyle = "#00ff00"
      ctx.fillRect(paddleX, height - 30, paddleWidth, PADDLE_HEIGHT)

      // Draw ball
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    },
    [bricks, paddleX, ball, width, height, paddleWidth]
  )

  const canvasRef = useGameLoop({ onUpdate, onDraw, isPlaying })

  // Mouse/touch control for paddle
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      setPaddleX(Math.max(0, Math.min(width - paddleWidth, x - paddleWidth / 2)))
    },
    [width, paddleWidth]
  )

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="touch-none cursor-none"
      onPointerMove={handlePointerMove}
    />
  )
}
