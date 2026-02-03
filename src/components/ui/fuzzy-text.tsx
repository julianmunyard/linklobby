// src/components/ui/fuzzy-text.tsx
// Uses SVG displacement filter for fuzzy effect while preserving text layout
"use client"

import { useEffect, useRef, useId } from "react"

interface FuzzyTextProps {
  children: React.ReactNode
  className?: string
  intensity?: number // 0-1 range, default 0.19
  speed?: number     // FPS, default 12
}

/**
 * FuzzyText applies a distress/displacement effect using SVG filters.
 * The effect is applied to regular DOM text, so layout stays exactly the same.
 */
export function FuzzyText({
  children,
  className = "",
  intensity = 0.19,
  speed = 12,
}: FuzzyTextProps) {
  const filterId = useId().replace(/:/g, "")
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const turbulence = turbulenceRef.current
    if (!turbulence) return

    const frameInterval = 1000 / speed
    let lastFrameTime = 0
    let seed = 0

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrameTime = timestamp

      // Change the seed to animate the noise pattern
      seed = (seed + 1) % 1000
      turbulence.setAttribute("seed", String(seed))

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [speed])

  // Scale intensity to displacement amount
  // intensity 0.19 = ~6px displacement, 0.5 = ~16px
  const displacement = intensity * 32

  return (
    <>
      {/* SVG filter - horizontal displacement like ReactBits fuzzy effect */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-15%" y="-5%" width="130%" height="110%">
            {/* Low horizontal freq, high vertical freq = horizontal "scanline" displacement */}
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.005 0.8"
              numOctaves="1"
              seed="0"
              result="noise"
            />
            {/* Only displace horizontally (X), not vertically */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacement}
              xChannelSelector="R"
              yChannelSelector="R"
            />
          </filter>
        </defs>
      </svg>
      {/* Apply filter to children - layout unchanged */}
      <span
        className={className}
        style={{ filter: `url(#${filterId})` }}
      >
        {children}
      </span>
    </>
  )
}
