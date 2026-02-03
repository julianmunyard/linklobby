'use client'

import { useEffect, useRef } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { Noise } from '@/components/ui/noise'

export function PageBackground() {
  const { background } = useThemeStore()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Intersection Observer for video performance
  useEffect(() => {
    const video = videoRef.current
    if (!video || background.type !== 'video') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay blocked, silently fail
          })
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [background.type])

  if (background.type === 'solid') {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: background.value }}
      />
    )
  }

  if (background.type === 'image' && background.value) {
    return (
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background.value})` }}
      />
    )
  }

  if (background.type === 'video' && background.value) {
    return (
      <video
        ref={videoRef}
        className="fixed inset-0 -z-10 w-full h-full object-cover"
        src={background.value}
        muted
        loop
        playsInline
        autoPlay
      />
    )
  }

  // Fallback to theme background color
  return (
    <div className="fixed inset-0 -z-10 bg-theme-background" />
  )
}

/**
 * Dim overlay for preview - darkens background so cards stand out
 */
export function DimOverlay() {
  const { background } = useThemeStore()

  if (!background.dimOverlay) return null

  const intensity = background.dimIntensity ?? 40

  return (
    <div
      className="fixed inset-0 -z-[5] pointer-events-none"
      style={{ backgroundColor: `rgba(0, 0, 0, ${intensity / 100})` }}
    />
  )
}

/**
 * Noise overlay for preview - uses theme store
 */
export function NoiseOverlay() {
  const { background } = useThemeStore()

  if (!background.noiseOverlay) return null

  return <Noise patternSize={460} patternAlpha={background.noiseIntensity ?? 15} />
}

/**
 * Frame overlay for preview - uses theme store
 */
export function FrameOverlay() {
  const { background } = useThemeStore()

  if (!background.frameOverlay) return null

  const zoom = background.frameZoom ?? 1
  const posX = background.framePositionX ?? 0
  const posY = background.framePositionY ?? 0

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={background.frameOverlay}
        alt=""
        className="w-full h-full object-fill"
        style={{
          minWidth: '100vw',
          minHeight: '100vh',
          transform: `scale(${zoom}) translate(${posX}%, ${posY}%)`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  )
}
