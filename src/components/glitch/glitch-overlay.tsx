'use client'

import { useEffect, useRef, useState } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import type { BackgroundConfig } from '@/types/theme'

/**
 * Build glitchGL options from BackgroundConfig fields.
 * Shared between editor (store-based) and public (props-based) overlays.
 */
export function buildGlitchOptions(background: BackgroundConfig) {
  const type = background.glitchType ?? 'crt'
  const intensity = (background.glitchIntensity ?? 50) / 100

  return {
    intensity,
    aspectCorrection: true,
    interaction: { enabled: false },
    effects: {
      crt: {
        enabled: type === 'crt',
        preset: 'consumer-tv' as const,
        scanlineIntensity: ((background.glitchCrtScanlines ?? 70) / 100) * intensity,
        curvature: (background.glitchCrtCurvature ?? 8) * intensity,
        chromaticAberration: ((background.glitchCrtAberration ?? 40) / 100) * 0.01 * intensity,
      },
      pixelation: {
        enabled: type === 'pixelation',
        pixelSize: background.glitchPixelSize ?? 8,
        pixelShape: (background.glitchPixelShape ?? 'square') as 'square' | 'circle',
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
 * Load Three.js and glitchGL scripts dynamically.
 * Resolves when both are available on window.
 */
export async function loadGlitchScripts(): Promise<boolean> {
  try {
    if (!(window as any).THREE) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = '/vendor/glitchgl/three.min.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Three.js'))
        document.head.appendChild(script)
      })
    }
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
 * Generate a 1x1 solid-color image data URL for use as an <img> src.
 * glitchGL works best with <img> elements — it reads naturalWidth/naturalHeight.
 */
function solidColorDataUrl(color: string): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 64, 64)
  }
  return canvas.toDataURL('image/png')
}

/**
 * Get the image source for glitchGL based on background config.
 * Returns an image URL that glitchGL can process as a texture.
 */
function getGlitchImgSrc(background: BackgroundConfig): string {
  if (background.type === 'image' && background.value) {
    return background.value
  }
  // For solid colors and video fallback, generate a colored image
  const color = background.type === 'solid' ? (background.value || '#000') : '#000'
  return solidColorDataUrl(color)
}

// Unique IDs
const GLITCH_WRAPPER_ID = 'glitch-bg-wrapper'
const GLITCH_TARGET_ID = 'glitch-bg-source'

/**
 * GlitchOverlay - Editor preview version.
 * Reads from theme store (same pattern as NoiseOverlay/DimOverlay).
 *
 * Architecture: A fixed-position wrapper div contains an <img> target.
 * glitchGL replaces the <img> with a canvas as a sibling, but both stay
 * inside the wrapper so the canvas inherits the fixed positioning context.
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
        return
      } catch {
        try { effectRef.current.dispose() } catch {}
        effectRef.current = null
      }
    }

    // Wait for the img to render and load, then init glitchGL
    const timer = setTimeout(() => {
      const targetEl = document.getElementById(GLITCH_TARGET_ID)
      if (!targetEl) return

      try {
        effectRef.current = glitchGL({ target: `#${GLITCH_TARGET_ID}`, ...options })

        // glitchGL inserts a canvas sibling — ensure it fills the wrapper
        const wrapper = document.getElementById(GLITCH_WRAPPER_ID)
        if (wrapper) {
          const canvas = wrapper.querySelector('canvas')
          if (canvas) {
            canvas.style.width = '100%'
            canvas.style.height = '100%'
            canvas.style.position = 'absolute'
            canvas.style.inset = '0'
          }
        }
      } catch (err) {
        console.error('glitchGL init failed:', err)
      }
    }, 100)

    return () => clearTimeout(timer)
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

  const imgSrc = getGlitchImgSrc(background)

  return (
    <div
      id={GLITCH_WRAPPER_ID}
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={{ overflow: 'hidden', position: 'fixed' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        id={GLITCH_TARGET_ID}
        src={imgSrc}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  )
}
