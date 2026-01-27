// src/components/editor/game-card-fields.tsx
"use client"

import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { GameCardContent, GameType } from "@/types/card"
import { GAME_TYPE_INFO } from "@/types/card"

interface GameCardFieldsProps {
  content: GameCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function GameCardFields({ content, onChange }: GameCardFieldsProps) {
  const gameType = content.gameType || "snake"
  const gameInfo = GAME_TYPE_INFO[gameType]

  return (
    <div className="space-y-4">
      {/* Game Type Selector */}
      <div className="space-y-2">
        <Label>Game Type</Label>
        <ToggleGroup
          type="single"
          value={gameType}
          onValueChange={(value) => {
            if (value) onChange({ gameType: value as GameType })
          }}
          className="grid grid-cols-3 w-full"
        >
          <ToggleGroupItem
            value="snake"
            aria-label="Snake game"
            className="flex-col gap-1 h-auto py-3 px-2"
          >
            <span className="text-2xl">🐍</span>
            <span className="text-xs">Snake</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="breakout"
            aria-label="Breakout game"
            className="flex-col gap-1 h-auto py-3 px-2"
          >
            <span className="text-2xl">🧱</span>
            <span className="text-xs">Breakout</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value="flappy"
            aria-label="Flappy game"
            className="flex-col gap-1 h-auto py-3 px-2"
          >
            <span className="text-2xl">🐦</span>
            <span className="text-xs">Flappy</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Game Description */}
      <div className="space-y-2">
        <Label>About This Game</Label>
        <p className="text-sm text-muted-foreground">
          {gameInfo?.description || "Classic arcade game"}
        </p>
      </div>

      {/* Controls Info */}
      <div className="space-y-2">
        <Label>Controls</Label>
        <div className="text-sm text-muted-foreground space-y-1">
          {gameType === "snake" && (
            <>
              <p>• Arrow keys or WASD to move</p>
              <p>• Swipe on touch devices</p>
              <p>• Eat food to grow longer</p>
            </>
          )}
          {gameType === "breakout" && (
            <>
              <p>• Mouse or touch to move paddle</p>
              <p>• Break all bricks to win</p>
              <p>• Don't let the ball fall</p>
            </>
          )}
          {gameType === "flappy" && (
            <>
              <p>• Click or tap to flap</p>
              <p>• Avoid the pipes</p>
              <p>• Keep flying as long as you can</p>
            </>
          )}
        </div>
      </div>

      {/* Aesthetic Note */}
      <div className="rounded-lg border border-[#00ff00]/20 bg-black/5 p-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-[#00ff00]">Retro Arcade Style:</strong> Game cards use a fixed retro aesthetic with green CRT scanlines and black background, regardless of your theme settings.
        </p>
      </div>
    </div>
  )
}
