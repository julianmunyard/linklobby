'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'

// Helper to resolve a CSS variable reference to its computed value
function resolveFontVariable(varRef: string): string {
  if (!varRef.startsWith('var(')) {
    return varRef // Already a plain value
  }

  // Extract variable name from var(--font-xyz)
  const match = varRef.match(/var\((--[^)]+)\)/)
  if (!match) return varRef

  const varName = match[1]

  // Get computed value from body (where font classes are applied)
  const computed = getComputedStyle(document.body).getPropertyValue(varName).trim()
  return computed || varRef // Fallback to original if not found
}

export function ThemeApplicator({ children }: { children: React.ReactNode }) {
  const { themeId, colors, fonts, style, background } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement

    // Set theme attribute for CSS theme variants
    root.setAttribute('data-theme', themeId)

    // Apply color overrides as CSS variables
    root.style.setProperty('--theme-background', colors.background)
    root.style.setProperty('--theme-card-bg', colors.cardBg)
    root.style.setProperty('--theme-text', colors.text)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-border', colors.border)
    root.style.setProperty('--theme-link', colors.link)

    // Apply font overrides - resolve var() references to actual font-family values
    // fonts.heading is like 'var(--font-inter)', we need the actual font family
    const resolvedHeading = resolveFontVariable(fonts.heading)
    const resolvedBody = resolveFontVariable(fonts.body)

    root.style.setProperty('--theme-font-heading', resolvedHeading)
    root.style.setProperty('--theme-font-body', resolvedBody)
    root.style.setProperty('--font-theme-heading', resolvedHeading)
    root.style.setProperty('--font-theme-body', resolvedBody)
    root.style.setProperty('--theme-heading-size', `${fonts.headingSize}rem`)
    root.style.setProperty('--theme-body-size', `${fonts.bodySize}rem`)
    root.style.setProperty('--theme-heading-weight', fonts.headingWeight === 'bold' ? '700' : '400')

    // Apply style overrides
    root.style.setProperty('--theme-border-radius', `${style.borderRadius}px`)
    root.style.setProperty('--theme-shadow-enabled', style.shadowEnabled ? '1' : '0')
    root.style.setProperty('--theme-blur-intensity', `${style.blurIntensity}px`)

    // System 7 frame color (uses accent for the outer frame)
    root.style.setProperty('--system7-frame', colors.accent)

    // Apply background
    root.style.setProperty('--theme-bg-type', background.type)
    if (background.type === 'solid') {
      root.style.setProperty('--theme-bg-value', background.value)
    }
  }, [themeId, colors, fonts, style, background])

  return <>{children}</>
}
