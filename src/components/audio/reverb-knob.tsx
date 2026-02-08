'use client'

import { useRef, useEffect, useState } from 'react'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu'

interface ReverbKnobProps {
  mix: number               // 0-1
  onMixChange: (mix: number) => void
  foregroundColor?: string
  elementBgColor?: string
  themeVariant?: ThemeVariant
  className?: string
}

export function ReverbKnob({
  mix,
  onMixChange,
  foregroundColor,
  elementBgColor,
  themeVariant,
  className = ''
}: ReverbKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number>(0)
  const dragStartValue = useRef<number>(0)

  const isReceipt = themeVariant === 'receipt'
  const activeColor = foregroundColor || 'var(--player-foreground, #3b82f6)'
  const bgColor = elementBgColor || 'var(--player-element-bg, #e5e7eb)'

  const handleStart = (clientY: number) => {
    setIsDragging(true)
    dragStartY.current = clientY
    dragStartValue.current = mix
  }

  const handleMove = (clientY: number) => {
    if (!isDragging) return

    // Calculate change (moving up increases, moving down decreases)
    const deltaY = dragStartY.current - clientY
    const sensitivity = 0.005 // Adjust sensitivity
    const newMix = Math.max(0, Math.min(1, dragStartValue.current + deltaY * sensitivity))

    onMixChange(newMix)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleMove(e.touches[0].clientY)
    }

    const handleMouseUp = () => handleEnd()
    const handleTouchEnd = () => handleEnd()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, mix])

  // Calculate rotation angle (270 degrees of rotation, -135 to +135)
  const minAngle = -135
  const maxAngle = 135
  const angle = minAngle + (maxAngle - minAngle) * mix

  // Receipt uses a smaller knob
  const knobSize = isReceipt ? 40 : 64
  const knobCenter = knobSize / 2
  const knobRadius = isReceipt ? 12 : 20
  const innerTickR = isReceipt ? 15 : 24
  const outerTickR = isReceipt ? 18 : 28
  const indicatorEnd = knobCenter - knobRadius + 2

  return (
    <div className={`flex flex-col items-center ${isReceipt ? 'gap-0.5' : 'gap-2'} ${className}`}>
      {/* Knob */}
      <div
        ref={knobRef}
        className="relative cursor-pointer select-none"
        style={{ width: knobSize, height: knobSize }}
        onMouseDown={(e) => handleStart(e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      >
        <svg width={knobSize} height={knobSize} viewBox={`0 0 ${knobSize} ${knobSize}`}>
          {/* Tick marks around circumference */}
          {Array.from({ length: isReceipt ? 7 : 11 }).map((_, i) => {
            const tickCount = isReceipt ? 6 : 10
            const tickAngle = minAngle + ((maxAngle - minAngle) / tickCount) * i
            const tickRad = ((tickAngle - 90) * Math.PI) / 180

            const x1 = knobCenter + innerTickR * Math.cos(tickRad)
            const y1 = knobCenter + innerTickR * Math.sin(tickRad)
            const x2 = knobCenter + outerTickR * Math.cos(tickRad)
            const y2 = knobCenter + outerTickR * Math.sin(tickRad)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={activeColor}
                strokeWidth={isReceipt ? '1' : '1.5'}
                strokeLinecap="round"
              />
            )
          })}

          {/* Knob circle background */}
          <circle
            cx={knobCenter}
            cy={knobCenter}
            r={knobRadius}
            fill={isReceipt ? 'transparent' : bgColor}
            stroke={activeColor}
            strokeWidth={isReceipt ? '1.5' : '2'}
          />

          {/* Indicator line (rotates with value) */}
          <line
            x1={knobCenter}
            y1={knobCenter}
            x2={knobCenter}
            y2={indicatorEnd}
            stroke={activeColor}
            strokeWidth={isReceipt ? '2' : '3'}
            strokeLinecap="round"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${angle}deg)`
            }}
          />
        </svg>
      </div>

      {/* Label and value */}
      <div className={`flex items-center ${isReceipt ? 'gap-1' : 'flex-col'}`}>
        <span className={`font-mono font-bold ${isReceipt ? 'text-[10px]' : 'text-xs'}`} style={{ color: activeColor }}>
          REVERB
        </span>
        <span className={`font-mono ${isReceipt ? 'text-[10px]' : 'text-xs'}`} style={{ color: activeColor }}>
          {Math.round(mix * 100)}%
        </span>
      </div>
    </div>
  )
}
