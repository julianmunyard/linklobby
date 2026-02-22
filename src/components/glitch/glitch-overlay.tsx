'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import type { BackgroundConfig } from '@/types/theme'

/**
 * Build glitchGL options from BackgroundConfig fields.
 * Shared between editor (store-based) and public (props-based) overlays.
 */
function buildGlitchOptions(background: BackgroundConfig) {
  const type = background.glitchType ?? 'crt'
  const intensity = (background.glitchIntensity ?? 50) / 100

  return {
    intensity,
    aspectCorrection: true,
    interaction: { enabled: false },
    effects: {
      crt: {
        enabled: type === 'crt',
        preset: 'consumer-tv',
        scanlineIntensity: ((background.glitchCrtScanlines ?? 70) / 100) * intensity,
        curvature: (background.glitchCrtCurvature ?? 8) * intensity,
        chromaticAberration: ((background.glitchCrtAberration ?? 40) / 100) * 0.01 * intensity,
      },
      pixelation: {
        enabled: type === 'pixelation',
        pixelSize: background.glitchPixelSize ?? 8,
        pixelShape: background.glitchPixelShape ?? 'square',
      },
      glitch: {
        enabled: type === 'glitch',
        rgbShift: ((background.glitchRgbShift ?? 0) / 100) * 0.05 * intensity,
        digitalNoise: ((background.glitchDigitalNoise ?? 10) / 100) * 0.5 * intensity,
        lineDisplacement: ((background.glitchLineDisplacement ?? 10) / 100) * 0.1 * intensity,
      },
    },
  }
}

/**
 * Builds inline styles for the glitch target div to mirror the current background.
 */
function buildBgStyle(background: BackgroundConfig): React.CSSProperties {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
  }

  if (background.type === 'solid') {
    style.backgroundColor = background.value
  } else if (background.type === 'image' && background.value) {
    style.backgroundImage = `url(${background.value})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = `${background.imagePositionX ?? 50}% ${background.imagePositionY ?? 50}%`
  } else {
    // Video or fallback: solid black
    style.backgroundColor = '#000'
  }

  return style
}

// Unique ID for the glitch target element (DOM-level, not React key)
const GLITCH_TARGET_ID = 'glitch-bg-source'

/**
 * Load Three.js and glitchGL scripts dynamically.
 * Resolves when both are available on window.
 */
async function loadGlitchScripts(): Promise<boolean> {
  try {
    // Load Three.js if not already loaded
    if (!(window as any).THREE) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = '/vendor/glitchgl/three.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Three.js'))
        document.head.appendChild(script)
      })
    }
    // Load glitchGL if not already loaded
    if (!(window as any).glitchGL) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = '/vendor/glitchgl/glitchGL.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load glitchGL'))
        document.head.appendChild(script)
      })
    }
    return true
  } catch (err) {
    console.error('Failed to load glitch scripts:', err)
    return false
  }
}

/**
 * GlitchOverlay - Editor preview version.
 * Reads from theme store (same pattern as NoiseOverlay/DimOverlay).
 */
export function GlitchOverlay() {
  const { background } = useThemeStore()
  const effectRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  // Load scripts on first enable
  useEffect(() => {
    if (!background.glitchEffect || loaded) return
    loadGlitchScripts().then(setLoaded).catch(() => setLoaded(false))
  }, [background.glitchEffect, loaded])

  // Initialize/update/cleanup effect
  useEffect(() => {
    if (!loaded || !background.glitchEffect) {
      // Cleanup if disabled
      if (effectRef.current) {
        try { effectRef.current.dispose() } catch {}
        effectRef.current = null
      }
      return
    }

    const glitchGL = (window as any).glitchGL
    if (!glitchGL) return

    const options = buildGlitchOptions(background)

    // If instance exists, update it; otherwise create new
    if (effectRef.current) {
      try {
        effectRef.current.updateOptions(options)
      } catch {
        // If update fails, recreate
        try { effectRef.current.dispose() } catch {}
        effectRef.current = glitchGL({ target: `#${GLITCH_TARGET_ID}`, ...options })
      }
    } else {
      // Small delay to let the target div render
      const timer = setTimeout(() => {
        const targetEl = document.getElementById(GLITCH_TARGET_ID)
        if (targetEl) {
          effectRef.current = glitchGL({ target: `#${GLITCH_TARGET_ID}`, ...options })
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
      id={GLITCH_TARGET_ID}
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={buildBgStyle(background)}
    />
  )
}

export { buildGlitchOptions, buildBgStyle, loadGlitchScripts, GLITCH_TARGET_ID }
