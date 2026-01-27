"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useGameLoop } from "@/hooks/use-game-loop"
import { useSwipeControls, SwipeDirection } from "@/hooks/use-swipe-controls"

type Direction = "up" | "down" | "left" | "right"
type Position = { x: number; y: number }

interface SnakeGameProps {
  width: number
  height: number
  isPlaying: boolean
  onGameOver: (score: number) => void
  onScoreChange: (score: number) => void
}

const GRID_SIZE = 20  // Size of each cell
const GAME_SPEED = 100  // ms per move

export function SnakeGame({
  width,
  height,
  isPlaying,
  onGameOver,
  onScoreChange,
}: SnakeGameProps) {
  // Calculate grid dimensions based on canvas size
  const gridWidth = Math.floor(width / GRID_SIZE)
  const gridHeight = Math.floor(height / GRID_SIZE)

  // Game state
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }])
  const [food, setFood] = useState<Position>({ x: 10, y: 10 })
  const [direction, setDirection] = useState<Direction>("right")
  const [score, setScore] = useState(0)

  // Refs for game loop
  const directionRef = useRef(direction)
  const lastMoveTimeRef = useRef(0)

  // Update ref when direction changes
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  // Reset game when starting
  useEffect(() => {
    if (isPlaying) {
      const startX = Math.floor(gridWidth / 4)
      const startY = Math.floor(gridHeight / 2)
      setSnake([{ x: startX, y: startY }])
      setDirection("right")
      setScore(0)
      spawnFood()
      lastMoveTimeRef.current = 0
    }
  }, [isPlaying, gridWidth, gridHeight])

  const spawnFood = useCallback(() => {
    const newFood: Position = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    }
    setFood(newFood)
  }, [gridWidth, gridHeight])

  // Game update logic
  const onUpdate = useCallback(
    (deltaTime: number) => {
      lastMoveTimeRef.current += deltaTime

      if (lastMoveTimeRef.current < GAME_SPEED) return
      lastMoveTimeRef.current = 0

      setSnake((prevSnake) => {
        const head = prevSnake[0]
        const dir = directionRef.current

        // Calculate new head position
        const newHead: Position = { ...head }
        switch (dir) {
          case "up": newHead.y -= 1; break
          case "down": newHead.y += 1; break
          case "left": newHead.x -= 1; break
          case "right": newHead.x += 1; break
        }

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= gridWidth ||
          newHead.y < 0 ||
          newHead.y >= gridHeight
        ) {
          onGameOver(score)
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
          onGameOver(score)
          return prevSnake
        }

        // Check food collision
        const newSnake = [newHead, ...prevSnake]
        if (newHead.x === food.x && newHead.y === food.y) {
          // Grow snake (don't remove tail)
          const newScore = score + 10
          setScore(newScore)
          onScoreChange(newScore)
          spawnFood()
        } else {
          // Remove tail
          newSnake.pop()
        }

        return newSnake
      })
    },
    [food, score, gridWidth, gridHeight, onGameOver, onScoreChange, spawnFood]
  )

  // Render game
  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, width, height)

      // Draw grid (subtle)
      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Draw snake
      snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? "#00ff00" : "#00cc00"
        ctx.fillRect(
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        )
      })

      // Draw food
      ctx.fillStyle = "#ff0000"
      ctx.beginPath()
      ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
      )
      ctx.fill()
    },
    [snake, food, width, height]
  )

  // Use game loop hook
  const canvasRef = useGameLoop({ onUpdate, onDraw, isPlaying })

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyDirections: Record<string, Direction> = {
        ArrowUp: "up", KeyW: "up",
        ArrowDown: "down", KeyS: "down",
        ArrowLeft: "left", KeyA: "left",
        ArrowRight: "right", KeyD: "right",
      }

      const newDir = keyDirections[e.code]
      if (!newDir) return

      // Prevent reversing
      const opposites: Record<Direction, Direction> = {
        up: "down", down: "up", left: "right", right: "left"
      }
      if (opposites[newDir] !== directionRef.current) {
        setDirection(newDir)
      }

      e.preventDefault()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying])

  // Swipe controls
  const handleSwipe = useCallback(
    (swipeDir: SwipeDirection) => {
      const swipeToDirection: Record<SwipeDirection, Direction> = {
        up: "up", down: "down", left: "left", right: "right"
      }
      const newDir = swipeToDirection[swipeDir]

      const opposites: Record<Direction, Direction> = {
        up: "down", down: "up", left: "right", right: "left"
      }
      if (opposites[newDir] !== directionRef.current) {
        setDirection(newDir)
      }
    },
    []
  )

  const { handleTouchStart, handleTouchEnd } = useSwipeControls({
    onSwipe: handleSwipe,
    minSwipeDistance: 30,
  })

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  )
}
