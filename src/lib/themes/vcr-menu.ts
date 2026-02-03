// src/lib/themes/vcr-menu.ts
import type { ThemeConfig } from '@/types/theme'

export const vcrMenuTheme: ThemeConfig = {
  id: 'vcr-menu',
  name: 'VCR Menu',
  description: 'Retro VCR on-screen display style with simple text list',
  isListLayout: true,

  defaultColors: {
    background: '#000562',                 // Deep VCR blue
    cardBg: '#000562',                     // Same as background (no visible cards)
    text: '#d8daba',                       // Cream/off-white text
    accent: '#000562',                     // Blue accent (for hover bg swap)
    border: '#000562',                     // No visible borders
    link: '#d8daba',                       // Cream links
  },

  defaultFonts: {
    heading: 'var(--font-pixter-granular)',
    body: 'var(--font-pixter-granular)',
    headingSize: 1.8,
    bodySize: 1.5,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,          // No rounded corners
    shadowEnabled: false,     // No shadows
    blurIntensity: 0,         // No blur
  },

  palettes: [
    {
      id: 'classic-vcr',
      name: 'Classic VCR',
      colors: {
        background: '#000562',
        cardBg: '#000562',
        text: '#d8daba',
        accent: '#000562',
        border: '#000562',
        link: '#d8daba',
      },
    },
    {
      id: 'green-terminal',
      name: 'Green Terminal',
      colors: {
        background: 'oklch(0.15 0 0)',
        cardBg: 'oklch(0.15 0 0)',
        text: 'oklch(0.75 0.2 140)',
        accent: 'oklch(0.15 0 0)',
        border: 'oklch(0.15 0 0)',
        link: 'oklch(0.75 0.2 140)',
      },
    },
    {
      id: 'amber-crt',
      name: 'Amber CRT',
      colors: {
        background: 'oklch(0.15 0 0)',
        cardBg: 'oklch(0.15 0 0)',
        text: 'oklch(0.80 0.15 80)',
        accent: 'oklch(0.15 0 0)',
        border: 'oklch(0.15 0 0)',
        link: 'oklch(0.80 0.15 80)',
      },
    },
  ],
}
