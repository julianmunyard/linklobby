'use client'

import { useRef, useEffect, useState } from 'react'

interface ReverbKnobProps {
  mix: number               // 0-1
  onMixChange: (mix: number) => void
  foregroundColor?: string
  elementBgColor?: string
  className?: string
}

export function ReverbKnob({
  mix,
  onMixChange,
  foregroundColor,
  elementBgColor,
  className = ''
}: ReverbKnobProps) {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number>(0)
  const dragStartValue = useRef<number>(0)

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

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Knob */}
      <div
        ref={knobRef}
        className="relative cursor-pointer select-none"
        style={{ width: 64, height: 64 }}
        onMouseDown={(e) => handleStart(e.clientY)}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      >
        {/* SVG for tick marks and knob */}
        <svg width="64" height="64" viewBox="0 0 64 64">
          {/* Tick marks around circumference */}
          {Array.from({ length: 11 }).map((_, i) => {
            const tickAngle = minAngle + ((maxAngle - minAngle) / 10) * i
            const tickRad = (tickAngle * Math.PI) / 180
            const cx = 32
            const cy = 32
            const innerRadius = 24
            const outerRadius = 28

            const x1 = cx + innerRadius * Math.cos(tickRad)
            const y1 = cy + innerRadius * Math.sin(tickRad)
            const x2 = cx + outerRadius * Math.cos(tickRad)
            const y2 = cy + outerRadius * Math.sin(tickRad)

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={activeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )
          })}

          {/* Knob circle background */}
          <circle
            cx="32"
            cy="32"
            r="20"
            fill={bgColor}
            stroke={activeColor}
            strokeWidth="2"
          />

          {/* Indicator line (rotates with value) */}
          <line
            x1="32"
            y1="32"
            x2="32"
            y2="18"
            stroke={activeColor}
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transformOrigin: 'center',
              transform: `rotate(${angle}deg)`
            }}
          />
        </svg>
      </div>

      {/* Label and value */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-mono font-bold" style={{ color: activeColor }}>
          REVERB
        </span>
        <span className="text-xs font-mono" style={{ color: activeColor }}>
          {Math.round(mix * 100)}%
        </span>
      </div>
    </div>
  )
}
