"use client"

import type { BackgroundConfig } from "@/types/theme"
import { Noise } from "@/components/ui/noise"

interface StaticBackgroundProps {
  background: BackgroundConfig
}

/**
 * Static background for public pages
 * Extends beyond viewport to cover overscroll/elastic band area
 */
export function StaticBackground({ background }: StaticBackgroundProps) {
  const dimIntensity = background.dimIntensity ?? 40
  const topBarColor = background.topBarColor || '#000000'

  // Solid color background
  if (background.type === 'solid' || !background.type) {
    return (
      <div
        className="fixed -z-10"
        style={{
          top: '-50vh',
          left: '-50vw',
          right: '-50vw',
          bottom: '-50vh',
          backgroundColor: background.value || '#000000',
        }}
      />
    )
  }

  // Image background
  if (background.type === 'image' && background.value) {
    const imgZoom = background.imageZoom ?? 1
    const imgPosX = background.imagePositionX ?? 50
    const imgPosY = background.imagePositionY ?? 50
    return (
      <>
        <div
          className="fixed -z-10 overflow-hidden"
          style={{
            top: '-50vh',
            left: '-50vw',
            right: '-50vw',
            bottom: '-50vh',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${background.value})`,
              backgroundSize: '100vw 100vh',
              backgroundPosition: `calc(50vw + ${(imgPosX - 50) * 0.5}vw) calc(50vh + ${(imgPosY - 50) * 0.5}vh)`,
              backgroundRepeat: 'no-repeat',
              transform: `scale(${imgZoom})`,
              transformOrigin: `calc(50vw + ${(imgPosX - 50) * 0.5}vw) calc(50vh + ${(imgPosY - 50) * 0.5}vh)`,
            }}
          />
        </div>
        {background.dimOverlay && (
          <div
            className="fixed inset-0 -z-[9] pointer-events-none"
            style={{ backgroundColor: `rgba(0, 0, 0, ${dimIntensity / 100})` }}
          />
        )}
        {background.fadeToTopBar && (
          <div
            className="fixed inset-x-0 top-0 -z-[8] h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${topBarColor} 0%, ${topBarColor}80 40%, transparent 100%)`,
            }}
          />
        )}
      </>
    )
  }

  // Video background
  if (background.type === 'video' && background.value) {
    const zoom = background.videoZoom ?? 1
    const posX = background.videoPositionX ?? 50
    const posY = background.videoPositionY ?? 50

    return (
      <>
        {/* Solid color behind video for overscroll area */}
        <div
          className="fixed -z-10"
          style={{
            top: '-50vh',
            left: '-50vw',
            right: '-50vw',
            bottom: '-50vh',
            backgroundColor: '#000000',
          }}
        />
        <video
          className="fixed -z-[9] object-cover"
          style={{
            // Position at viewport (not extended area) to match preview
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            transform: `scale(${zoom})`,
            objectPosition: `${posX}% ${posY}%`,
          }}
          src={background.value}
          muted
          loop
          playsInline
          autoPlay
        />
        {background.dimOverlay && (
          <div
            className="fixed inset-0 -z-[8] pointer-events-none"
            style={{ backgroundColor: `rgba(0, 0, 0, ${dimIntensity / 100})` }}
          />
        )}
        {background.fadeToTopBar && (
          <div
            className="fixed inset-x-0 top-0 -z-[7] h-32 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${topBarColor} 0%, ${topBarColor}80 40%, transparent 100%)`,
            }}
          />
        )}
      </>
    )
  }

  // Fallback
  return (
    <div
      className="fixed -z-10"
      style={{
        top: '-50vh',
        left: '-50vw',
        right: '-50vw',
        bottom: '-50vh',
        backgroundColor: '#000000',
      }}
    />
  )
}

interface StaticDimOverlayProps {
  background: BackgroundConfig
}

/**
 * Static dim overlay for public pages
 * Darkens background so cards stand out more
 */
export function StaticDimOverlay({ background }: StaticDimOverlayProps) {
  if (!background.dimOverlay) return null

  const intensity = background.dimIntensity ?? 40

  return (
    <div
      className="fixed inset-0 -z-[5] pointer-events-none"
      style={{ backgroundColor: `rgba(0, 0, 0, ${intensity / 100})` }}
    />
  )
}

interface StaticNoiseOverlayProps {
  background: BackgroundConfig
}

/**
 * Static noise overlay for public pages
 * Accepts background config as props instead of using store
 */
export function StaticNoiseOverlay({ background }: StaticNoiseOverlayProps) {
  if (!background.noiseOverlay) return null

  return <Noise patternSize={460} patternAlpha={background.noiseIntensity ?? 15} />
}

interface StaticFrameOverlayProps {
  background: BackgroundConfig
  theme?: string
}

/**
 * Static frame overlay for public pages
 * Accepts background config as props instead of using store
 * Disabled for receipt theme
 */
export function StaticFrameOverlay({ background, theme }: StaticFrameOverlayProps) {
  // Disable frame overlay for receipt theme
  if (theme === 'receipt') return null
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
          // Ensure image covers the full viewport
          minWidth: '100vw',
          minHeight: '100vh',
          // Apply zoom and position transforms
          transform: `scale(${zoom}) translate(${posX}%, ${posY}%)`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  )
}

