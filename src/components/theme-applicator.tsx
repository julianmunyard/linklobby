'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'

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

    // Apply font overrides - set both the theme variable and the direct font-family
    // The fonts.heading value is like 'var(--font-inter)', but we need to set the actual font
    root.style.setProperty('--theme-font-heading', fonts.heading)
    root.style.setProperty('--theme-font-body', fonts.body)
    // Also set the Tailwind-bridged variables directly for components using inline styles
    root.style.setProperty('--font-theme-heading', fonts.heading)
    root.style.setProperty('--font-theme-body', fonts.body)
    root.style.setProperty('--theme-heading-size', `${fonts.headingSize}rem`)
    root.style.setProperty('--theme-body-size', `${fonts.bodySize}rem`)
    root.style.setProperty('--theme-heading-weight', fonts.headingWeight === 'bold' ? '700' : '400')

    // Apply style overrides
    root.style.setProperty('--theme-border-radius', `${style.borderRadius}px`)
    root.style.setProperty('--theme-shadow-enabled', style.shadowEnabled ? '1' : '0')
    root.style.setProperty('--theme-blur-intensity', `${style.blurIntensity}px`)

    // Apply background
    root.style.setProperty('--theme-bg-type', background.type)
    if (background.type === 'solid') {
      root.style.setProperty('--theme-bg-value', background.value)
    }
  }, [themeId, colors, fonts, style, background])

  return <>{children}</>
}
