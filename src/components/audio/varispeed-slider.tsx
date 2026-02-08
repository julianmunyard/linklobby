'use client'

import { useRef } from 'react'
import type { VarispeedMode } from '@/audio/engine/types'

interface VarispeedSliderProps {
  speed: number                  // 0.5-1.5
  mode: VarispeedMode            // 'natural' | 'timestretch'
  onSpeedChange: (speed: number) => void
  onModeChange: (mode: VarispeedMode) => void
  foregroundColor?: string
  elementBgColor?: string
  className?: string
}

export function VarispeedSlider({
  speed,
  mode,
  onSpeedChange,
  onModeChange,
  foregroundColor,
  elementBgColor,
  className = ''
}: VarispeedSliderProps) {
  const previousTick = useRef<number | null>(null)

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
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Speed display and mode toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono font-bold" style={{ color: activeColor }}>
          {speed.toFixed(2)}x
        </span>
        <button
          onClick={handleModeToggle}
          className="px-2 py-1 text-xs font-mono rounded border transition-colors"
          style={{
            color: activeColor,
            borderColor: activeColor,
            backgroundColor: mode === 'natural' ? `${activeColor}20` : 'transparent'
          }}
        >
          {mode === 'timestretch' ? 'TIME-STRETCH' : 'NATURAL'}
        </button>
      </div>

      {/* Slider container with ticks */}
      <div className="relative py-2">
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
                <div className="h-2 w-0.5" style={{ backgroundColor: activeColor }} />
                <span className="text-[10px] font-mono mt-1" style={{ color: activeColor }}>
                  {tick}x
                </span>
              </div>
            )
          })}
        </div>

        {/* Slider track */}
        <div className="relative pt-8">
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
        </div>
      </div>

      {/* Inline styles for slider thumb */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${activeColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${activeColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-ms-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${activeColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
