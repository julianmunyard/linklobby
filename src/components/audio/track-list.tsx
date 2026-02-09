'use client'

import type { AudioTrack } from '@/types/audio'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

interface TrackListProps {
  tracks: AudioTrack[]
  currentTrackIndex: number
  onTrackSelect: (index: number) => void
  foregroundColor?: string
  elementBgColor?: string
  themeVariant?: ThemeVariant
  className?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TrackList({
  tracks,
  currentTrackIndex,
  onTrackSelect,
  foregroundColor,
  elementBgColor,
  themeVariant,
  className = ''
}: TrackListProps) {
  // Don't render if only one track
  if (tracks.length <= 1) return null

  const isVcr = themeVariant === 'vcr-menu'
  const activeColor = foregroundColor || 'var(--player-foreground, #3b82f6)'
  const bgColor = elementBgColor || 'var(--player-element-bg, #e5e7eb)'

  return (
    <div className={`space-y-1 ${className}`}>
      {tracks.map((track, index) => {
        const isCurrent = index === currentTrackIndex

        if (isVcr) {
          return (
            <button
              key={track.id}
              onClick={() => onTrackSelect(index)}
              className={`w-full px-3 py-2 rounded-none text-left transition-all hover:opacity-80 uppercase tracking-wider ${isCurrent ? 'vcr-blink' : ''}`}
              style={{
                backgroundColor: isCurrent ? activeColor : 'transparent',
                color: isCurrent ? bgColor || 'var(--theme-background)' : activeColor,
                border: `1px solid ${activeColor}`,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xs font-mono font-bold">
                    TR.{String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {track.title}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono">
                  {formatTime(track.duration)}
                </span>
              </div>
            </button>
          )
        }

        return (
          <button
            key={track.id}
            onClick={() => onTrackSelect(index)}
            className="w-full px-3 py-2 rounded-md text-left transition-all hover:opacity-80"
            style={{
              backgroundColor: isCurrent ? `${activeColor}20` : bgColor,
              borderLeft: isCurrent ? `3px solid ${activeColor}` : '3px solid transparent'
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="text-xs font-mono font-bold"
                  style={{ color: activeColor }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold truncate"
                    style={{ color: activeColor }}
                  >
                    {track.title}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: activeColor, opacity: 0.7 }}
                  >
                    {track.artist}
                  </div>
                </div>
              </div>
              <span
                className="text-xs font-mono"
                style={{ color: activeColor }}
              >
                {formatTime(track.duration)}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
