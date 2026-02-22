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
        brightness: 1.0 + (intensity * 0.2),
        phosphorGlow: 0.3 * intensity,
      },
      pixelation: {
        enabled: type === 'pixelation',
        pixelSize: background.glitchPixelSize ?? 8,
        pixelShape: (background.glitchPixelShape ?? 'square') as 'square' | 'circle',
        bitDepth: 'none' as const,
        dithering: 'none' as const,
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
 * Generate a solid-color image data URL for use as an <img> src.
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

function getGlitchImgSrc(background: BackgroundConfig): string {
  if (background.type === 'image' && background.value) {
    return background.value
  }
  const color = background.type === 'solid' ? (background.value || '#000') : '#000'
  return solidColorDataUrl(color)
}

/**
 * Build a stable config key from all glitch-relevant background fields.
 * When this key changes, React unmounts and remounts the GlitchInstance,
 * giving glitchGL a completely fresh DOM element every time.
 */
function configKey(bg: BackgroundConfig): string {
  return [
    bg.glitchType ?? 'crt',
    bg.glitchIntensity ?? 50,
    bg.glitchCrtScanlines ?? 70,
    bg.glitchCrtCurvature ?? 8,
    bg.glitchCrtAberration ?? 40,
    bg.glitchPixelSize ?? 8,
    bg.glitchPixelShape ?? 'square',
    bg.glitchRgbShift ?? 0,
    bg.glitchDigitalNoise ?? 10,
    bg.glitchLineDisplacement ?? 10,
    bg.type,
    bg.value ?? '',
  ].join('|')
}

/**
 * Inner component that mounts once per config key.
 * On mount: waits for img load → inits glitchGL.
 * On unmount: disposes glitchGL. React cleans up all DOM.
 */
function GlitchInstance({
  background,
  wrapperId,
  targetId,
  imgSrc,
}: {
  background: BackgroundConfig
  wrapperId: string
  targetId: string
  imgSrc: string
}) {
  const effectRef = useRef<any>(null)

  useEffect(() => {
    const glitchGL = (window as any).glitchGL
    if (!glitchGL) return

    const options = buildGlitchOptions(background)
    const img = document.getElementById(targetId) as HTMLImageElement | null
    if (!img) return

    const init = () => {
      try {
        effectRef.current = glitchGL({ target: `#${targetId}`, ...options })

        // Ensure the canvas glitchGL creates fills the wrapper
        requestAnimationFrame(() => {
          const wrapper = document.getElementById(wrapperId)
          if (wrapper) {
            const canvas = wrapper.querySelector('canvas')
            if (canvas) {
              canvas.style.width = '100%'
              canvas.style.height = '100%'
              canvas.style.position = 'absolute'
              canvas.style.inset = '0'
            }
          }
        })
      } catch (err) {
        console.error('glitchGL init failed:', err)
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(init)
    } else {
      img.onload = () => requestAnimationFrame(init)
    }

    return () => {
      if (effectRef.current) {
        try { effectRef.current.dispose() } catch {}
        effectRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Mount-only: config changes cause remount via key

  return (
    <div
      id={wrapperId}
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={{ overflow: 'hidden', position: 'fixed' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        id={targetId}
        src={imgSrc}
        alt=""
        crossOrigin="anonymous"
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

/**
 * GlitchOverlay - Editor preview version.
 * Reads from theme store. Uses key-based remounting so glitchGL
 * always gets a fresh DOM element — no stale render loop issues.
 */
export function GlitchOverlay() {
  const { background } = useThemeStore()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!background.glitchEffect || loaded) return
    loadGlitchScripts().then(setLoaded).catch(() => setLoaded(false))
  }, [background.glitchEffect, loaded])

  if (!background.glitchEffect || !loaded) return null

  return (
    <GlitchInstance
      key={configKey(background)}
      background={background}
      wrapperId="glitch-bg-wrapper"
      targetId="glitch-bg-source"
      imgSrc={getGlitchImgSrc(background)}
    />
  )
}
