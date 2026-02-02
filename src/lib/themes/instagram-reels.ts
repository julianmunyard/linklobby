// src/lib/themes/instagram-reels.ts
import type { ThemeConfig } from '@/types/theme'

export const instagramReelsTheme: ThemeConfig = {
  id: 'instagram-reels',
  name: 'Instagram Reels',
  description: 'Bold, high contrast with spread text styling',
  hasSpreadText: true,

  defaultColors: {
    background: 'oklch(0 0 0)',           // Pure black background
    cardBg: 'oklch(1 0 0)',               // Pure white cards
    text: 'oklch(0 0 0)',                 // Black text on white cards
    accent: 'oklch(0.65 0.28 25)',        // Vibrant orange/red
    border: 'oklch(0.85 0 0)',            // Light border
    link: 'oklch(0.45 0.25 280)',         // Purple links (darker for white bg)
  },

  defaultFonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    headingSize: 1.1,         // Slightly larger headings
    bodySize: 1,
    headingWeight: 'bold',
  },

  defaultStyle: {
    borderRadius: 8,          // Subtle rounding
    shadowEnabled: false,     // Minimal shadows
    blurIntensity: 0,         // No blur
  },

  palettes: [
    {
      id: 'ig-dark',
      name: 'IG Dark',
      colors: {
        background: 'oklch(0 0 0)',
        cardBg: 'oklch(1 0 0)',
        text: 'oklch(0 0 0)',
        accent: 'oklch(0.65 0.28 25)',
        border: 'oklch(0.85 0 0)',
        link: 'oklch(0.45 0.25 280)',
      },
    },
    {
      id: 'creator-gradient',
      name: 'Creator Gradient',
      colors: {
        background: 'oklch(0 0 0)',
        cardBg: 'oklch(0.95 0.02 330)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.70 0.25 330)',
        border: 'oklch(0.85 0.02 330)',
        link: 'oklch(0.50 0.22 330)',
      },
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      colors: {
        background: 'oklch(0 0 0)',
        cardBg: 'oklch(0.95 0.03 200)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.70 0.30 140)',
        border: 'oklch(0.85 0.02 200)',
        link: 'oklch(0.50 0.28 200)',
      },
    },
  ],
}
