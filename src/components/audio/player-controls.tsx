'use client'

import { Play, Pause, Loader2 } from 'lucide-react'

interface PlayerControlsProps {
  isPlaying: boolean
  isLoaded: boolean
  isLoading: boolean
  onTogglePlay: () => void
  foregroundColor?: string    // Icon color (from PlayerColors)
  elementBgColor?: string     // Button background (from PlayerColors)
  className?: string
}

export function PlayerControls({
  isPlaying,
  isLoaded,
  isLoading,
  onTogglePlay,
  foregroundColor,
  elementBgColor,
  className = ''
}: PlayerControlsProps) {
  const iconColor = foregroundColor || 'var(--player-foreground, currentColor)'
  const bgColor = elementBgColor || 'var(--player-element-bg, rgba(0, 0, 0, 0.1))'

  return (
    <button
      onClick={onTogglePlay}
      disabled={!isLoaded && !isLoading}
      className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${className}`}
      style={{
        backgroundColor: bgColor,
        opacity: !isLoaded && !isLoading ? 0.5 : 1,
        cursor: !isLoaded && !isLoading ? 'not-allowed' : 'pointer'
      }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: iconColor }} />
      ) : isPlaying ? (
        <Pause className="h-5 w-5" style={{ color: iconColor }} />
      ) : (
        <Play className="h-5 w-5 ml-0.5" style={{ color: iconColor }} />
      )}
    </button>
  )
}
