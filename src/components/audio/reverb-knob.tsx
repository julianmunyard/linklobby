'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'

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
  const isVcr = themeVariant === 'vcr-menu'
  const isClassified = themeVariant === 'classified'
  const isCompact = isReceipt || isVcr || isClassified
  const activeColor = foregroundColor || 'var(--player-foreground, #3b82f6)'
  const bgColor = elementBgColor || 'var(--player-element-bg, #e5e7eb)'

  const onMixChangeRef = useRef(onMixChange)
  onMixChangeRef.current = onMixChange

  const handleStart = (clientY: number) => {
    setIsDragging(true)
    dragStartY.current = clientY
    dragStartValue.current = mix
  }

  const handleMove = useCallback((clientY: number) => {
    const deltaY = dragStartY.current - clientY
    const sensitivity = 0.005
    const newMix = Math.max(0, Math.min(1, dragStartValue.current + deltaY * sensitivity))
    onMixChangeRef.current(newMix)
  }, [])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

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
  }, [isDragging, handleMove, handleEnd])

  // Calculate rotation angle (270 degrees of rotation, -135 to +135)
  const minAngle = -135
  const maxAngle = 135
  const angle = minAngle + (maxAngle - minAngle) * mix

  // Compact themes use a smaller knob
  const knobSize = isCompact ? 40 : 64
  const knobCenter = knobSize / 2
  const knobRadius = isCompact ? 12 : 20
  const innerTickR = isCompact ? 15 : 24
  const outerTickR = isCompact ? 18 : 28
  const indicatorEnd = knobCenter - knobRadius + 2

  return (
    <div data-no-drag className={`flex flex-col items-center ${isCompact ? 'gap-0.5' : 'gap-2'} ${className}`}>
      {/* Knob */}
      <div
        ref={knobRef}
        className="relative cursor-pointer select-none"
        style={{ width: knobSize, height: knobSize, touchAction: 'none' }}
        onMouseDown={(e) => handleStart(e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      >
        <svg width={knobSize} height={knobSize} viewBox={`0 0 ${knobSize} ${knobSize}`}>
          {/* Tick marks around circumference */}
          {Array.from({ length: isCompact ? 7 : 11 }).map((_, i) => {
            const tickCount = isCompact ? 6 : 10
            const tickAngle = minAngle + ((maxAngle - minAngle) / tickCount) * i
            const tickRad = ((tickAngle - 90) * Math.PI) / 180

            const x1 = Math.round((knobCenter + innerTickR * Math.cos(tickRad)) * 100) / 100
            const y1 = Math.round((knobCenter + innerTickR * Math.sin(tickRad)) * 100) / 100
            const x2 = Math.round((knobCenter + outerTickR * Math.cos(tickRad)) * 100) / 100
            const y2 = Math.round((knobCenter + outerTickR * Math.sin(tickRad)) * 100) / 100

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={activeColor}
                strokeWidth={isCompact ? '1' : '1.5'}
                strokeLinecap="round"
              />
            )
          })}

          {/* Knob circle background */}
          <circle
            cx={knobCenter}
            cy={knobCenter}
            r={knobRadius}
            fill={(isReceipt || isClassified) ? 'transparent' : bgColor}
            stroke={activeColor}
            strokeWidth={isCompact ? '1.5' : '2'}
          />

          {/* Indicator line (rotates with value) */}
          <line
            x1={knobCenter}
            y1={knobCenter}
            x2={knobCenter}
            y2={indicatorEnd}
            stroke={activeColor}
            strokeWidth={isCompact ? '2' : '3'}
            strokeLinecap="round"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${angle}deg)`
            }}
          />
        </svg>
      </div>

      {/* Label and value */}
      <div className={`flex items-center ${isCompact ? 'gap-1' : 'flex-col'}`}>
        <span className={`font-mono font-bold ${isCompact ? 'text-[10px]' : 'text-xs'}`} style={{ color: activeColor }}>
          REVERB
        </span>
        <span className={`font-mono ${isCompact ? 'text-[10px]' : 'text-xs'}`} style={{ color: activeColor }}>
          {Math.round(mix * 100)}%
        </span>
      </div>
    </div>
  )
}
