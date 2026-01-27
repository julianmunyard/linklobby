"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useGameLoop } from "@/hooks/use-game-loop"

interface Pipe {
  x: number
  gapY: number  // Center of gap
  passed: boolean
}

interface FlappyGameProps {
  width: number
  height: number
  isPlaying: boolean
  onScoreChange: (score: number) => void
}

const BIRD_SIZE = 20
const PIPE_WIDTH = 40
const PIPE_GAP = 120  // Gap between top and bottom pipes
const PIPE_SPEED = 3
const GRAVITY = 0.5
const FLAP_VELOCITY = -8
const PIPE_INTERVAL = 150  // Pixels between pipes

export function FlappyGame({
  width,
  height,
  isPlaying,
  onScoreChange,
}: FlappyGameProps) {
  // Game state
  const [birdY, setBirdY] = useState(height / 2)
  const [birdVelocity, setBirdVelocity] = useState(0)
  const [pipes, setPipes] = useState<Pipe[]>([])
  const [score, setScore] = useState(0)
  const [distanceTraveled, setDistanceTraveled] = useState(0)

  // Refs for game loop
  const birdYRef = useRef(birdY)
  const birdVelocityRef = useRef(birdVelocity)
  const distanceRef = useRef(distanceTraveled)

  // Refs for deferred callbacks (avoid setState during render)
  const pendingScoreRef = useRef<number | null>(null)
  const pendingRespawnRef = useRef<boolean>(false)

  useEffect(() => { birdYRef.current = birdY }, [birdY])
  useEffect(() => { birdVelocityRef.current = birdVelocity }, [birdVelocity])
  useEffect(() => { distanceRef.current = distanceTraveled }, [distanceTraveled])

  // Process deferred callbacks
  useEffect(() => {
    if (pendingScoreRef.current !== null) {
      const newScore = pendingScoreRef.current
      pendingScoreRef.current = null
      onScoreChange(newScore)
    }
  })

  // Handle respawn after collision
  useEffect(() => {
    if (pendingRespawnRef.current) {
      pendingRespawnRef.current = false
      setBirdY(height / 2)
      setBirdVelocity(0)
    }
  })

  // Reset game
  useEffect(() => {
    if (isPlaying) {
      setBirdY(height / 2)
      setBirdVelocity(0)
      setPipes([{
        x: width,
        gapY: height / 2 + (Math.random() - 0.5) * (height - PIPE_GAP - 60),
        passed: false,
      }])
      setScore(0)
      setDistanceTraveled(0)
    }
  }, [isPlaying, width, height])

  // Flap handler
  const handleFlap = useCallback(() => {
    setBirdVelocity(FLAP_VELOCITY)
  }, [])

  // Game update
  const onUpdate = useCallback(
    (deltaTime: number) => {
      const speedMultiplier = deltaTime / 16

      // Update bird
      setBirdVelocity((v) => v + GRAVITY * speedMultiplier)
      setBirdY((y) => {
        const newY = y + birdVelocityRef.current * speedMultiplier

        // Ground collision - respawn bird
        if (newY + BIRD_SIZE / 2 >= height) {
          pendingRespawnRef.current = true
          return y
        }

        // Ceiling
        if (newY - BIRD_SIZE / 2 <= 0) {
          return BIRD_SIZE / 2
        }

        return newY
      })

      // Update distance and generate pipes
      setDistanceTraveled((d) => {
        const newDistance = d + PIPE_SPEED * speedMultiplier
        return newDistance
      })

      // Update pipes
      setPipes((prevPipes) => {
        const currentBirdY = birdYRef.current

        // Move pipes
        let newPipes = prevPipes.map((pipe) => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED * speedMultiplier,
        }))

        // Remove off-screen pipes
        newPipes = newPipes.filter((pipe) => pipe.x + PIPE_WIDTH > 0)

        // Add new pipes
        const lastPipe = newPipes[newPipes.length - 1]
        if (!lastPipe || lastPipe.x < width - PIPE_INTERVAL) {
          const minGapY = PIPE_GAP / 2 + 20
          const maxGapY = height - PIPE_GAP / 2 - 20
          newPipes.push({
            x: width,
            gapY: minGapY + Math.random() * (maxGapY - minGapY),
            passed: false,
          })
        }

        // Check collisions and scoring
        let gameOver = false
        newPipes = newPipes.map((pipe) => {
          // Bird x position (constant, 30% from left)
          const birdX = width * 0.3

          // Check if bird passed pipe
          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
            const newScore = score + 1
            setScore(newScore)
            pendingScoreRef.current = newScore
            return { ...pipe, passed: true }
          }

          // Check collision
          if (
            birdX + BIRD_SIZE / 2 > pipe.x &&
            birdX - BIRD_SIZE / 2 < pipe.x + PIPE_WIDTH
          ) {
            const gapTop = pipe.gapY - PIPE_GAP / 2
            const gapBottom = pipe.gapY + PIPE_GAP / 2

            if (
              currentBirdY - BIRD_SIZE / 2 < gapTop ||
              currentBirdY + BIRD_SIZE / 2 > gapBottom
            ) {
              gameOver = true
            }
          }

          return pipe
        })

        if (gameOver) {
          pendingRespawnRef.current = true
        }

        return newPipes
      })
    },
    [width, height, score]
  )

  // Render
  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Sky background
      ctx.fillStyle = "#001122"
      ctx.fillRect(0, 0, width, height)

      // Ground
      ctx.fillStyle = "#003300"
      ctx.fillRect(0, height - 20, width, 20)

      // Pipes
      pipes.forEach((pipe) => {
        const gapTop = pipe.gapY - PIPE_GAP / 2
        const gapBottom = pipe.gapY + PIPE_GAP / 2

        // Top pipe
        ctx.fillStyle = "#00ff00"
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, gapTop)
        // Pipe cap
        ctx.fillRect(pipe.x - 3, gapTop - 15, PIPE_WIDTH + 6, 15)

        // Bottom pipe
        ctx.fillRect(pipe.x, gapBottom, PIPE_WIDTH, height - gapBottom - 20)
        // Pipe cap
        ctx.fillRect(pipe.x - 3, gapBottom, PIPE_WIDTH + 6, 15)
      })

      // Bird (simple square for retro feel)
      const birdX = width * 0.3
      ctx.fillStyle = "#ffff00"
      ctx.fillRect(
        birdX - BIRD_SIZE / 2,
        birdY - BIRD_SIZE / 2,
        BIRD_SIZE,
        BIRD_SIZE
      )

      // Bird eye
      ctx.fillStyle = "#000000"
      ctx.fillRect(birdX + 2, birdY - 4, 4, 4)
    },
    [pipes, birdY, width, height]
  )

  const canvasRef = useGameLoop({ onUpdate, onDraw, isPlaying })

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="touch-none cursor-pointer"
      onClick={handleFlap}
      onTouchStart={(e) => {
        e.preventDefault()
        handleFlap()
      }}
    />
  )
}
