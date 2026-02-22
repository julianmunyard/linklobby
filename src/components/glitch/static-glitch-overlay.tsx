'use client'

import { useEffect, useState } from 'react'
import type { BackgroundConfig } from '@/types/theme'
import { loadGlitchScripts, useGlitchEffect } from './glitch-overlay'

const STATIC_GLITCH_WRAPPER_ID = 'static-glitch-bg-wrapper'
const STATIC_GLITCH_TARGET_ID = 'static-glitch-bg-source'

interface StaticGlitchOverlayProps {
  background: BackgroundConfig
}

/**
 * Generate a solid-color image data URL for glitchGL target.
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
 * StaticGlitchOverlay - Public page version.
 * Takes BackgroundConfig as props instead of reading from store.
 */
export function StaticGlitchOverlay({ background }: StaticGlitchOverlayProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!background.glitchEffect || loaded) return
    loadGlitchScripts().then(setLoaded).catch(() => setLoaded(false))
  }, [background.glitchEffect, loaded])

  useGlitchEffect(background, loaded, STATIC_GLITCH_WRAPPER_ID, STATIC_GLITCH_TARGET_ID)

  if (!background.glitchEffect) return null

  const imgSrc = getGlitchImgSrc(background)

  return (
    <div
      id={STATIC_GLITCH_WRAPPER_ID}
      className="fixed inset-0 -z-[4] pointer-events-none"
      style={{ overflow: 'hidden', position: 'fixed' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        id={STATIC_GLITCH_TARGET_ID}
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
