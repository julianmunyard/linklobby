// src/lib/themes/sleek-modern.ts
import type { ThemeConfig } from '@/types/theme'

export const sleekModernTheme: ThemeConfig = {
  id: 'sleek-modern',
  name: 'Sleek Modern',
  description: 'Transparent glass texture with flat aesthetic',
  hasGlassEffect: true,

  defaultColors: {
    background: 'oklch(0.15 0 0)',        // Very dark background
    cardBg: 'oklch(0.25 0 0 / 0.6)',      // Semi-transparent card bg
    text: 'oklch(0.95 0 0)',              // Bright white text
    accent: 'oklch(0.75 0.20 180)',       // Cyan accent
    border: 'oklch(0.50 0 0 / 0.3)',      // Subtle transparent border
    link: 'oklch(0.80 0.18 200)',         // Light cyan links
  },

  defaultFonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    headingSize: 1,
    bodySize: 1,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 16,         // More rounded
    shadowEnabled: false,     // No shadows
    blurIntensity: 12,        // Glass blur enabled
  },

  palettes: [
    {
      id: 'frosted-glass',
      name: 'Frosted Glass',
      colors: {
        background: 'oklch(0.15 0 0)',
        cardBg: 'oklch(0.25 0 0 / 0.6)',
        text: 'oklch(0.95 0 0)',
        accent: 'oklch(0.75 0.20 180)',
        border: 'oklch(0.50 0 0 / 0.3)',
        link: 'oklch(0.80 0.18 200)',
      },
    },
    {
      id: 'neon-night',
      name: 'Neon Night',
      colors: {
        background: 'oklch(0.10 0 0)',
        cardBg: 'oklch(0.20 0 0 / 0.5)',
        text: 'oklch(0.95 0 0)',
        accent: 'oklch(0.70 0.25 330)',
        border: 'oklch(0.70 0.25 330 / 0.4)',
        link: 'oklch(0.75 0.25 300)',
      },
    },
    {
      id: 'minimal-white',
      name: 'Minimal White',
      colors: {
        background: 'oklch(0.98 0 0)',
        cardBg: 'oklch(1.00 0 0 / 0.7)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.45 0.15 250)',
        border: 'oklch(0.85 0 0 / 0.5)',
        link: 'oklch(0.40 0.15 230)',
      },
    },
  ],
}
