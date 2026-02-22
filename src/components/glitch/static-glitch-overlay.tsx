'use client'

import { useEffect, useRef, useState } from 'react'
import type { BackgroundConfig } from '@/types/theme'
import { buildGlitchOptions, buildBgStyle, loadGlitchScripts } from './glitch-overlay'

const STATIC_GLITCH_TARGET_ID = 'static-glitch-bg-source'

interface StaticGlitchOverlayProps {
  background: BackgroundConfig
}

/**
 * StaticGlitchOverlay - Public page version.
 * Takes BackgroundConfig as props instead of reading from store.
 * Same pattern as StaticNoiseOverlay.
 */
export function StaticGlitchOverlay({ background }: StaticGlitchOverlayProps) {
  const effectRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  // Load scripts on first enable
  useEffect(() => {
    if (!background.glitchEffect || loaded) return
    loadGlitchScripts().then(setLoaded).catch(() => setLoaded(false))
  }, [background.glitchEffect, loaded])

  // Initialize effect
  useEffect(() => {
    if (!loaded || !background.glitchEffect) {
      if (effectRef.current) {
        try { effectRef.current.dispose() } catch {}
        effectRef.current = null
      }
      return
    }

    const glitchGL = (window as any).glitchGL
    if (!glitchGL) return

    const options = buildGlitchOptions(background)

    if (effectRef.current) {
      try {
        effectRef.current.updateOptions(options)
      } catch {
        try { effectRef.current.dispose() } catch {}
        effectRef.current = glitchGL({ target: `#${STATIC_GLITCH_TARGET_ID}`, ...options })
      }
    } else {
      const timer = setTimeout(() => {
        const targetEl = document.getElementById(STATIC_GLITCH_TARGET_ID)
        if (targetEl) {
          effectRef.current = glitchGL({ target: `#${STATIC_GLITCH_TARGET_ID}`, ...options })
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [
    loaded,
    background.glitchEffect,
    background.glitchType,
    background.glitchIntensity,
    background.glitchCrtScanlines,
    background.glitchCrtCurvature,
    background.glitchCrtAberration,
    background.glitchPixelSize,
    background.glitchPixelShape,
    background.glitchRgbShift,
    background.glitchDigitalNoise,
    background.glitchLineDisplacement,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (effectRef.current) {
        try { effectRef.current.dispose() } catch {}
        effectRef.current = null
      }
    }
  }, [])

  if (!background.glitchEffect) return null

  return (
    <div
      id={STATIC_GLITCH_TARGET_ID}
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={buildBgStyle(background)}
    />
  )
}
