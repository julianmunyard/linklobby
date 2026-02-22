'use client'

import { useEffect, useRef, useState } from 'react'
import type { BackgroundConfig } from '@/types/theme'
import { buildGlitchOptions, loadGlitchScripts } from './glitch-overlay'

interface StaticGlitchOverlayProps {
  background: BackgroundConfig
}

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
 * StaticGlitchOverlay - Public page version.
 * Takes BackgroundConfig as props. Initializes once on mount (public pages
 * don't have live config changes).
 */
export function StaticGlitchOverlay({ background }: StaticGlitchOverlayProps) {
  const effectRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Only render on client — solidColorDataUrl needs document.createElement('canvas')
  // which returns '' on server, causing hydration mismatch
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !background.glitchEffect || loaded) return
    loadGlitchScripts().then(setLoaded).catch(() => setLoaded(false))
  }, [mounted, background.glitchEffect, loaded])

  useEffect(() => {
    if (!loaded || !background.glitchEffect) return

    const glitchGL = (window as any).glitchGL
    if (!glitchGL) return

    const options = buildGlitchOptions(background)
    const img = document.getElementById('static-glitch-bg-source') as HTMLImageElement | null
    if (!img) return

    const init = () => {
      try {
        effectRef.current = glitchGL({ target: '#static-glitch-bg-source', ...options })

        requestAnimationFrame(() => {
          const wrapper = document.getElementById('static-glitch-bg-wrapper')
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
  }, [loaded, background])

  // Render nothing on server and during hydration — avoids src mismatch
  if (!mounted || !background.glitchEffect) return null

  const imgSrc = getGlitchImgSrc(background)

  return (
    <div
      id="static-glitch-bg-wrapper"
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={{ overflow: 'hidden', position: 'fixed' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        id="static-glitch-bg-source"
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
