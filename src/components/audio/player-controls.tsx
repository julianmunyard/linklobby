'use client'

import { Play, Pause, Loader2 } from 'lucide-react'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'macintosh' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

interface PlayerControlsProps {
  isPlaying: boolean
  isLoaded: boolean
  isLoading: boolean
  onTogglePlay: () => void
  foregroundColor?: string    // Icon color (from PlayerColors)
  elementBgColor?: string     // Button background (from PlayerColors)
  themeVariant?: ThemeVariant
  className?: string
}

export function PlayerControls({
  isPlaying,
  isLoaded,
  isLoading,
  onTogglePlay,
  foregroundColor,
  elementBgColor,
  themeVariant,
  className = ''
}: PlayerControlsProps) {
  const isReceipt = themeVariant === 'receipt'
  const isVcr = themeVariant === 'vcr-menu'
  const isClassified = themeVariant === 'classified'
  const isCompact = isReceipt || isVcr || isClassified
  const iconColor = foregroundColor || 'var(--player-foreground, currentColor)'
  const bgColor = elementBgColor || 'var(--player-element-bg, rgba(0, 0, 0, 0.1))'

  return (
    <button
      onClick={onTogglePlay}
      disabled={!isLoaded && !isLoading}
      className={`flex items-center justify-center transition-all relative z-10 ${isCompact ? 'h-8 w-8 rounded-none' : 'h-11 w-11 rounded-full'} ${className}`}
      style={{
        backgroundColor: bgColor,
        opacity: !isLoaded && !isLoading ? 0.5 : 1,
        cursor: !isLoaded && !isLoading ? 'not-allowed' : 'pointer'
      }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isLoading ? (
        <Loader2 className={isCompact ? "h-4 w-4 animate-spin" : "h-5 w-5 animate-spin"} style={{ color: (isReceipt || isClassified) ? '#ffffff' : iconColor }} />
      ) : isPlaying ? (
        <Pause className={isCompact ? "h-4 w-4" : "h-5 w-5"} style={{ color: (isReceipt || isClassified) ? '#ffffff' : iconColor }} />
      ) : (
        <Play className={isCompact ? "h-4 w-4 ml-0.5" : "h-5 w-5 ml-0.5"} style={{ color: (isReceipt || isClassified) ? '#ffffff' : iconColor }} />
      )}
    </button>
  )
}
