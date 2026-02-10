'use client'

import { useRef, useEffect, useState } from 'react'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

interface WaveformDisplayProps {
  showWaveform: boolean       // true = waveform, false = progress bar
  waveformData?: number[]     // Array of 0-1 peak values
  progress: number            // 0-1 current playback position
  currentTime: number         // seconds
  duration: number            // seconds
  onSeek: (position: number) => void  // 0-1
  foregroundColor?: string    // Active/played color
  elementBgColor?: string     // Inactive/unplayed color
  themeVariant?: ThemeVariant
  isPlaying?: boolean         // For VCR status display
  className?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatVcrTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function WaveformDisplay({
  showWaveform,
  waveformData,
  progress,
  currentTime,
  duration,
  onSeek,
  foregroundColor,
  elementBgColor,
  themeVariant,
  isPlaying,
  className = ''
}: WaveformDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const isReceipt = themeVariant === 'receipt'
  const isVcr = themeVariant === 'vcr-menu'
  const isClassified = themeVariant === 'classified'
  const isMacOs = themeVariant === 'mac-os'
  const isCompact = isReceipt || isVcr || isClassified || isMacOs
  const activeColor = foregroundColor || 'var(--player-foreground, #3b82f6)'
  const inactiveColor = elementBgColor || 'var(--player-element-bg, #e5e7eb)'

  const handleSeek = (clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const position = Math.max(0, Math.min(1, x / rect.width))
    onSeek(position)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleSeek(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    handleSeek(e.touches[0].clientX)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleSeek(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleSeek(e.touches[0].clientX)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging])

  return (
    <div className={`${isCompact ? 'space-y-1' : 'space-y-2'} ${className}`}>
      {/* Waveform or Progress Bar */}
      <div
        ref={containerRef}
        className={`relative cursor-pointer select-none ${(isVcr || isClassified || isMacOs) ? 'h-6' : isReceipt ? 'h-8' : 'h-16'}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none' }}
      >
        {showWaveform && waveformData && waveformData.length > 0 ? (
          // Waveform Mode
          <div className="flex items-center justify-between h-full gap-[1px]">
            {waveformData.map((peak, index) => {
              const barProgress = index / waveformData.length
              const isPlayed = barProgress <= progress
              const height = Math.max(4, peak * 100) // Min 4% height

              return (
                <div
                  key={index}
                  className="flex-1 flex items-center justify-center"
                >
                  <div
                    className={`w-full ${isCompact ? 'rounded-none' : 'rounded-sm'}`}
                    style={{
                      height: `${height}%`,
                      backgroundColor: isPlayed ? activeColor : inactiveColor
                    }}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          // Progress Bar Mode
          <div className="h-full flex items-center">
            {isMacOs ? (
              /* Macintosh: bordered bar with checkerboard fill */
              <div
                className="relative w-full p-[3px]"
                style={{ border: `3px solid ${activeColor}` }}
              >
                <div className="relative w-full h-2">
                  {/* Checkerboard filled portion */}
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: `${progress * 100}%`,
                      background: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px',
                    }}
                  />
                </div>
              </div>
            ) : (isVcr || isClassified) ? (
              /* VCR/Classified: rectangular bordered bar */
              <div
                className="relative w-full p-[3px]"
                style={{ border: `1px solid ${activeColor}` }}
              >
                <div className="relative w-full h-1">
                  <div
                    className="absolute top-0 left-0 h-full rounded-none"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: activeColor
                    }}
                  />
                </div>
              </div>
            ) : isReceipt ? (
              /* Receipt: clean bordered rectangle, no handle — drag anywhere on the bar */
              <div
                className="relative w-full p-[3px]"
                style={{ border: `1px solid ${activeColor}` }}
              >
                <div className="relative w-full h-1.5">
                  <div
                    className="absolute top-0 left-0 h-full rounded-none"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: activeColor
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-2 rounded-full" style={{ backgroundColor: inactiveColor }}>
                {/* Filled portion */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: activeColor
                  }}
                />
                {/* Scrub handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md"
                  style={{
                    left: `${progress * 100}%`,
                    transform: `translate(-50%, -50%)`,
                    backgroundColor: activeColor
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time Display */}
      {isMacOs ? (
        <div className="flex justify-between font-mono text-[10px]" style={{ color: activeColor }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      ) : isVcr ? (
        <div className="flex justify-between font-mono text-[10px]" style={{ color: activeColor }}>
          <span>{isPlaying ? '▶' : '❚❚'} {formatVcrTime(currentTime)}</span>
          <span>{formatVcrTime(duration)}</span>
        </div>
      ) : isClassified ? (
        <div className="flex justify-between font-mono text-[10px]" style={{ color: activeColor }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      ) : (
        <div className={`flex justify-between font-mono ${isReceipt ? 'text-[10px]' : 'text-xs'}`} style={{ color: activeColor }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  )
}
