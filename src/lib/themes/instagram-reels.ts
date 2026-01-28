// src/lib/themes/instagram-reels.ts
import type { ThemeConfig } from '@/types/theme'

export const instagramReelsTheme: ThemeConfig = {
  id: 'instagram-reels',
  name: 'Instagram Reels',
  description: 'Bold, high contrast with spread text styling',
  hasSpreadText: true,

  defaultColors: {
    background: 'oklch(0.12 0 0)',        // Deep black background
    cardBg: 'oklch(0.18 0 0)',            // Very dark card bg
    text: 'oklch(0.98 0 0)',              // Pure white text
    accent: 'oklch(0.65 0.28 25)',        // Vibrant orange/red
    border: 'oklch(0.25 0 0)',            // Minimal border
    link: 'oklch(0.75 0.25 280)',         // Purple links
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
        background: 'oklch(0.12 0 0)',
        cardBg: 'oklch(0.18 0 0)',
        text: 'oklch(0.98 0 0)',
        accent: 'oklch(0.65 0.28 25)',
        border: 'oklch(0.25 0 0)',
        link: 'oklch(0.75 0.25 280)',
      },
    },
    {
      id: 'creator-gradient',
      name: 'Creator Gradient',
      colors: {
        background: 'oklch(0.15 0 0)',
        cardBg: 'oklch(0.22 0 0)',
        text: 'oklch(0.95 0 0)',
        accent: 'oklch(0.70 0.25 330)',
        border: 'oklch(0.70 0.25 330 / 0.5)',
        link: 'oklch(0.75 0.22 50)',
      },
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      colors: {
        background: 'oklch(0.10 0 0)',
        cardBg: 'oklch(0.16 0 0)',
        text: 'oklch(0.98 0 0)',
        accent: 'oklch(0.70 0.30 140)',
        border: 'oklch(0.30 0 0)',
        link: 'oklch(0.75 0.28 200)',
      },
    },
  ],
}
