"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import type { Card, GameType } from "@/types/card"
import { isGameContent, GAME_TYPE_INFO } from "@/types/card"
import { BreakoutGame } from "./games/breakout-game"
import { FlappyGame } from "./games/flappy-game"
import { SnakeGame } from "./games/snake-game"

type GameState = "playing"

interface GameCardProps {
  card: Card
  isPreview?: boolean
  isEditing?: boolean  // True when in editor (show static preview only)
}

export function GameCard({ card, isPreview = false, isEditing = false }: GameCardProps) {
  const [gameState, setGameState] = useState<GameState>("playing")
  const [score, setScore] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })
  const containerRef = useRef<HTMLDivElement>(null)

  const content = isGameContent(card.content)
    ? card.content
    : { gameType: "snake" as GameType }

  const gameType = content.gameType || "snake"
  const accentColor = content.accentColor || "#ffffff"
  const gameInfo = GAME_TYPE_INFO[gameType]

  // Measure container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [card.size])

  // Reset score when card/game type changes (keep playing)
  useEffect(() => {
    setScore(0)
  }, [card.id, gameType])


  // Fixed retro arcade aesthetic (doesn't adapt to theme)
  // Border color is configurable via accentColor
  const arcadeStyle = cn(
    "relative w-full overflow-hidden rounded-lg",
    "bg-black border-2",
    // Aspect ratio based on card size
    card.size === "small" ? "aspect-square" : "aspect-video"
  )

  // In editor: always show static preview
  if (isEditing) {
    return (
      <div className={arcadeStyle} style={{ borderColor: `${accentColor}4D` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Animated demo preview - placeholder for now */}
          <div className="font-mono text-center" style={{ color: accentColor }}>
            <p className="text-lg font-bold">{gameInfo?.label}</p>
            <p className="text-xs opacity-60 mt-1">Preview Mode</p>
          </div>
          {/* Scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-transparent animate-pulse"
            style={{ background: `linear-gradient(to bottom, transparent, ${accentColor}0D, transparent)` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={arcadeStyle} style={{ borderColor: `${accentColor}4D` }}>
      {/* Game auto-starts - render actual game */}
      {gameState === "playing" && (
        <div className="absolute inset-0">
          {/* Game components conditionally rendered based on gameType */}
          {gameType === "breakout" && (
            <BreakoutGame
              width={dimensions.width}
              height={dimensions.height}
              isPlaying={true}
              onScoreChange={setScore}
            />
          )}
          {gameType === "snake" && (
            <SnakeGame
              width={dimensions.width}
              height={dimensions.height}
              isPlaying={true}
              onScoreChange={setScore}
              accentColor={accentColor}
            />
          )}
          {gameType === "flappy" && (
            <FlappyGame
              width={dimensions.width}
              height={dimensions.height}
              isPlaying={true}
              onScoreChange={setScore}
            />
          )}
          {/* Score display */}
          <div className="absolute top-2 left-2 font-mono text-xs z-10" style={{ color: accentColor }}>
            Score: {score}
          </div>
        </div>
      )}

      {/* CRT scanline effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)",
        }}
      />
    </div>
  )
}
