// src/components/editor/game-card-fields.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { GameCardContent, GameType } from "@/types/card"
import { GAME_TYPE_INFO } from "@/types/card"

// Preset colors for quick selection
const ACCENT_PRESETS = [
  { color: "#ffffff", label: "White" },
  { color: "#00ff00", label: "Green" },
  { color: "#00ffff", label: "Cyan" },
  { color: "#ff00ff", label: "Magenta" },
  { color: "#ffff00", label: "Yellow" },
  { color: "#ff6b00", label: "Orange" },
]

interface GameCardFieldsProps {
  content: Partial<GameCardContent>
  onChange: (updates: Record<string, unknown>) => void
}

export function GameCardFields({ content, onChange }: GameCardFieldsProps) {
  const gameType = content.gameType || "snake"
  const accentColor = content.accentColor || "#ffffff"
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

      {/* Accent Color */}
      <div className="space-y-2">
        <Label>Accent Color</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Border color and {gameType === "snake" ? "snake/grid color" : "UI accents"}
        </p>
        <div className="flex items-center gap-2">
          {/* Color presets */}
          <div className="flex gap-1">
            {ACCENT_PRESETS.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange({ accentColor: color })}
                className={`w-7 h-7 rounded border-2 transition-all ${
                  accentColor.toLowerCase() === color.toLowerCase()
                    ? "border-foreground scale-110"
                    : "border-muted hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: color }}
                title={label}
              />
            ))}
          </div>
          {/* Custom color input */}
          <Input
            type="color"
            value={accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
            className="w-10 h-7 p-0 border-0 cursor-pointer"
          />
        </div>
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
      <div className="rounded-lg border bg-muted/30 p-3" style={{ borderColor: `${accentColor}33` }}>
        <p className="text-xs text-muted-foreground">
          <strong style={{ color: accentColor }}>Retro Arcade Style:</strong> Game cards use a black background with your chosen accent color for borders and game elements.
        </p>
      </div>
    </div>
  )
}
