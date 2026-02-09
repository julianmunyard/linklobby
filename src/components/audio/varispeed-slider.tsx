'use client'

import { useRef } from 'react'
import type { VarispeedMode } from '@/audio/engine/types'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu'

interface VarispeedSliderProps {
  speed: number                  // 0.5-1.5
  mode: VarispeedMode            // 'natural' | 'timestretch'
  onSpeedChange: (speed: number) => void
  onModeChange: (mode: VarispeedMode) => void
  foregroundColor?: string
  elementBgColor?: string
  themeVariant?: ThemeVariant
  hideModeToggle?: boolean       // Hide the NATURAL/TIMESTRETCH button (rendered externally)
  className?: string
}

export function VarispeedSlider({
  speed,
  mode,
  onSpeedChange,
  onModeChange,
  foregroundColor,
  elementBgColor,
  themeVariant,
  hideModeToggle = false,
  className = ''
}: VarispeedSliderProps) {
  const previousTick = useRef<number | null>(null)
  const isReceipt = themeVariant === 'receipt'
  const isVcr = themeVariant === 'vcr-menu'
  const isCompact = isReceipt || isVcr

  const activeColor = foregroundColor || 'var(--player-foreground, #3b82f6)'
  const bgColor = elementBgColor || 'var(--player-element-bg, #e5e7eb)'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value)
    onSpeedChange(raw)

    // Haptic feedback on tick marks (every 0.1)
    const rounded = Math.round(raw * 10)
    if (previousTick.current === null) {
      previousTick.current = rounded
      return
    }

    if (rounded !== previousTick.current) {
      previousTick.current = rounded
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(5)
      }
    }
  }

  const handleModeToggle = () => {
    const newMode = mode === 'timestretch' ? 'natural' : 'timestretch'
    onModeChange(newMode)
  }

  // Calculate position percentage for filled portion
  const filledPercent = ((speed - 0.5) / (1.5 - 0.5)) * 100

  return (
    <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-2'} ${className}`}>
      {/* Speed display and mode toggle */}
      <div className="flex items-center justify-between">
        <span className={`font-mono font-bold ${isCompact ? 'text-xs' : 'text-sm'}`} style={{ color: activeColor }}>
          {speed.toFixed(2)}x
        </span>
        {!hideModeToggle && (
          <button
            onClick={handleModeToggle}
            className={`px-2 py-0.5 font-mono border transition-colors ${isCompact ? 'text-[10px] rounded-none' : 'text-xs rounded'}`}
            style={{
              color: activeColor,
              borderColor: activeColor,
              backgroundColor: mode === 'natural' && !isCompact ? `${activeColor}20` : 'transparent'
            }}
          >
            {mode === 'timestretch' ? 'TIME-STRETCH' : 'NATURAL'}
          </button>
        )}
      </div>

      {/* Slider container with ticks */}
      <div className={`relative ${isCompact ? 'py-0' : 'py-2'}`}>
        {/* Tick marks at 0.5, 1.0, 1.5 */}
        <div className="absolute top-0 left-0 right-0 flex justify-between pointer-events-none">
          {[0.5, 1.0, 1.5].map((tick) => {
            const position = ((tick - 0.5) / (1.5 - 0.5)) * 100
            return (
              <div
                key={tick}
                className="flex flex-col items-center"
                style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <div className={`w-0.5 ${isCompact ? 'h-1.5' : 'h-2'}`} style={{ backgroundColor: activeColor }} />
                <span className="text-[10px] font-mono mt-0.5" style={{ color: activeColor }}>
                  {tick}x
                </span>
              </div>
            )
          })}
        </div>

        {/* Slider track */}
        <div className={`relative ${isCompact ? 'pt-6' : 'pt-8'}`}>
          {isCompact ? (
            /* Compact: bordered container so full range is visible */
            <div
              className="p-[3px]"
              style={{ border: `1px solid ${activeColor}` }}
            >
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={speed}
                onChange={handleChange}
                className="w-full h-1.5 appearance-none cursor-pointer rounded-none"
                style={{
                  background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${filledPercent}%, transparent ${filledPercent}%, transparent 100%)`,
                  WebkitAppearance: 'none',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.01"
              value={speed}
              onChange={handleChange}
              className="w-full h-2 appearance-none cursor-pointer rounded-full"
              style={{
                background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${filledPercent}%, ${bgColor} ${filledPercent}%, ${bgColor} 100%)`,
                WebkitAppearance: 'none',
                outline: 'none'
              }}
            />
          )}
        </div>
      </div>

      {/* Inline styles for slider thumb */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: ${isCompact ? '12px' : '18px'};
          height: ${isCompact ? '12px' : '18px'};
          border-radius: ${isCompact ? '0' : '50%'};
          background: ${activeColor};
          cursor: pointer;
          border: ${isCompact ? 'none' : '2px solid white'};
          box-shadow: ${isCompact ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
        }

        input[type='range']::-moz-range-thumb {
          width: ${isCompact ? '12px' : '18px'};
          height: ${isCompact ? '12px' : '18px'};
          border-radius: ${isCompact ? '0' : '50%'};
          background: ${activeColor};
          cursor: pointer;
          border: ${isCompact ? 'none' : '2px solid white'};
          box-shadow: ${isCompact ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
        }

        input[type='range']::-ms-thumb {
          width: ${isCompact ? '12px' : '18px'};
          height: ${isCompact ? '12px' : '18px'};
          border-radius: ${isCompact ? '0' : '50%'};
          background: ${activeColor};
          cursor: pointer;
          border: ${isCompact ? 'none' : '2px solid white'};
          box-shadow: ${isCompact ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.2)'};
        }
      `}</style>
    </div>
  )
}
