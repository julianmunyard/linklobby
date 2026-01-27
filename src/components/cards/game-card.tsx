"use client"

import { useState, useEffect, useRef } from "react"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Card, GameType } from "@/types/card"
import { isGameContent, GAME_TYPE_INFO } from "@/types/card"
import { BreakoutGame } from "./games/breakout-game"
import { FlappyGame } from "./games/flappy-game"
import { SnakeGame } from "./games/snake-game"

// Placeholder for game components - will be implemented in subsequent plans
function GamePlaceholder({ gameType }: { gameType: GameType }) {
  return (
    <div className="flex items-center justify-center h-full text-white/50">
      {GAME_TYPE_INFO[gameType]?.label || gameType} (Coming Soon)
    </div>
  )
}

type GameState = "idle" | "playing"

interface GameCardProps {
  card: Card
  isPreview?: boolean
  isEditing?: boolean  // True when in editor (show static preview only)
}

export function GameCard({ card, isPreview = false, isEditing = false }: GameCardProps) {
  const [gameState, setGameState] = useState<GameState>("idle")
  const [score, setScore] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })
  const containerRef = useRef<HTMLDivElement>(null)

  const content = isGameContent(card.content)
    ? card.content
    : { gameType: "snake" as GameType }

  const gameType = content.gameType || "snake"
  const gameInfo = GAME_TYPE_INFO[gameType]

  // Measure container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }
  }, [card.size])

  // Reset game state when card changes
  useEffect(() => {
    setGameState("idle")
    setScore(0)
  }, [card.id, gameType])

  const handleStartGame = () => {
    if (isEditing) return // Don't allow gameplay in editor
    setGameState("playing")
    setScore(0)
  }

  // Fixed retro arcade aesthetic (doesn't adapt to theme)
  const arcadeStyle = cn(
    "relative w-full overflow-hidden rounded-lg",
    "bg-black border-2 border-[#00ff00]/30",
    // Aspect ratio based on card size
    card.size === "small" ? "aspect-square" : "aspect-video"
  )

  // In editor: always show static preview
  if (isEditing) {
    return (
      <div className={arcadeStyle}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Animated demo preview - placeholder for now */}
          <div className="text-[#00ff00] font-mono text-center">
            <p className="text-lg font-bold">{gameInfo?.label}</p>
            <p className="text-xs text-[#00ff00]/60 mt-1">Preview Mode</p>
          </div>
          {/* Scanline effect */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#00ff00]/5 to-transparent animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={arcadeStyle}>
      {/* Idle state - show demo with play button */}
      {gameState === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Animated demo preview */}
          <div className="absolute inset-0 opacity-30">
            <GamePlaceholder gameType={gameType} />
          </div>
          {/* Play button overlay */}
          <Button
            onClick={handleStartGame}
            className="z-10 bg-[#00ff00]/20 hover:bg-[#00ff00]/40 text-[#00ff00] border border-[#00ff00]/50"
            size={card.size === "small" ? "sm" : "default"}
          >
            <Play className="h-4 w-4 mr-2" />
            Play {gameInfo?.label}
          </Button>
        </div>
      )}

      {/* Playing state - render actual game */}
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
          <div className="absolute top-2 left-2 text-[#00ff00] font-mono text-xs z-10">
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
