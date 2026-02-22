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
        preset: background.glitchCrtPreset ?? 'consumer-tv',
        scanlineIntensity: ((background.glitchCrtScanlines ?? 70) / 100),
        scanlineThickness: ((background.glitchCrtScanlineThickness ?? 80) / 100),
        scanlineCount: 0, // 0 = auto-detect from resolution
        curvature: background.glitchCrtCurvature ?? 8,
        chromaticAberration: ((background.glitchCrtAberration ?? 40) / 100) * 0.01,
        brightness: (background.glitchCrtBrightness ?? 120) / 100,
        phosphorGlow: (background.glitchCrtPhosphorGlow ?? 40) / 100,
        flicker: background.glitchCrtFlicker ?? false,
        flickerIntensity: (background.glitchCrtFlickerIntensity ?? 50) / 100,
        lineMovement: background.glitchCrtLineMovement ?? false,
        lineSpeed: ((background.glitchCrtLineSpeed ?? 50) / 100) * 3,
        lineDirection: background.glitchCrtLineDirection ?? 'up',
      },
      pixelation: {
        enabled: type === 'pixelation',
        pixelSize: background.glitchPixelSize ?? 8,
        pixelShape: background.glitchPixelShape ?? 'square',
        bitDepth: background.glitchPixelBitDepth ?? 'none',
        dithering: background.glitchPixelDithering ?? 'none',
        pixelDirection: background.glitchPixelDirection ?? 'square',
      },
      glitch: {
        enabled: type === 'glitch',
        rgbShift: ((background.glitchRgbShift ?? 0) / 100) * 0.05,
        digitalNoise: ((background.glitchDigitalNoise ?? 10) / 100) * 0.5,
        lineDisplacement: ((background.glitchLineDisplacement ?? 10) / 100) * 0.1,
        signalDropoutFreq: ((background.glitchSignalDropout ?? 5) / 100) * 0.2,
        signalDropoutSize: ((background.glitchSignalDropout ?? 5) / 100) * 0.3,
        syncErrorFreq: ((background.glitchSyncError ?? 5) / 100) * 0.1,
        syncErrorAmount: ((background.glitchSyncError ?? 5) / 100) * 0.15,
        interferenceSpeed: 1.0,
        interferenceIntensity: (background.glitchInterference ?? 20) / 100,
        frameGhostAmount: (background.glitchFrameGhost ?? 30) / 100,
        stutterFreq: (background.glitchStutter ?? 10) / 100,
        datamoshStrength: (background.glitchDatamosh ?? 50) / 100,
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
    // CRT
    bg.glitchCrtPreset ?? 'consumer-tv',
    bg.glitchCrtScanlines ?? 70,
    bg.glitchCrtScanlineThickness ?? 80,
    bg.glitchCrtCurvature ?? 8,
    bg.glitchCrtAberration ?? 40,
    bg.glitchCrtBrightness ?? 120,
    bg.glitchCrtPhosphorGlow ?? 40,
    bg.glitchCrtFlicker ?? false,
    bg.glitchCrtFlickerIntensity ?? 50,
    bg.glitchCrtLineMovement ?? false,
    bg.glitchCrtLineSpeed ?? 50,
    bg.glitchCrtLineDirection ?? 'up',
    // Pixelation
    bg.glitchPixelSize ?? 8,
    bg.glitchPixelShape ?? 'square',
    bg.glitchPixelBitDepth ?? 'none',
    bg.glitchPixelDithering ?? 'none',
    bg.glitchPixelDirection ?? 'square',
    // Glitch
    bg.glitchRgbShift ?? 0,
    bg.glitchDigitalNoise ?? 10,
    bg.glitchLineDisplacement ?? 10,
    bg.glitchSignalDropout ?? 5,
    bg.glitchSyncError ?? 5,
    bg.glitchInterference ?? 20,
    bg.glitchFrameGhost ?? 30,
    bg.glitchStutter ?? 10,
    bg.glitchDatamosh ?? 50,
    bg.glitchFullPage ?? false,
    // Background source
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
  fullPage,
}: {
  background: BackgroundConfig
  wrapperId: string
  targetId: string
  imgSrc: string
  fullPage: boolean
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
      className="fixed inset-0 pointer-events-none"
      style={{
        overflow: 'hidden',
        position: 'fixed',
        zIndex: fullPage ? 30 : -4,
        mixBlendMode: fullPage ? 'overlay' : 'normal',
      }}
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
      fullPage={background.glitchFullPage ?? false}
    />
  )
}
