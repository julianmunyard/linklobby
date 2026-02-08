// src/lib/themes/instagram-reels.ts
import type { ThemeConfig } from '@/types/theme'

export const instagramReelsTheme: ThemeConfig = {
  id: 'instagram-reels',
  name: 'Instagram Reels',
  description: 'Bold, high contrast with spread text styling',
  hasSpreadText: true,

  defaultColors: {
    background: 'oklch(0 0 0)',           // Pure black background
    cardBg: 'oklch(0 0 0)',              // Same as bg (transparent cards)
    text: 'oklch(0.95 0 0)',             // Off-white text
    accent: 'oklch(0.65 0.28 25)',        // Vibrant orange/red
    border: 'oklch(0.95 0 0)',            // Light border
    link: 'oklch(0.95 0 0)',              // Off-white links
  },

  defaultFonts: {
    heading: 'var(--font-chikarego)',
    body: 'var(--font-chikarego)',
    headingSize: 1.1,         // Slightly larger headings
    bodySize: 1,
    headingWeight: 'bold',
  },

  defaultStyle: {
    borderRadius: 0,          // Square corners
    shadowEnabled: false,     // Minimal shadows
    blurIntensity: 0,         // No blur
  },

  palettes: [
    {
      id: 'ig-dark',
      name: 'IG Dark',
      transparent: true,
      colors: {
        background: 'oklch(0 0 0)',
        cardBg: 'oklch(0 0 0)',
        text: 'oklch(0.95 0 0)',
        accent: 'oklch(0.65 0.28 25)',
        border: 'oklch(0.95 0 0)',
        link: 'oklch(0.95 0 0)',
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
    {
      id: 'ig-poolsuite-pink',
      name: 'Poolsuite Pink',
      colors: {
        background: 'oklch(0.89 0.04 10)',
        cardBg: 'oklch(0.95 0.02 70)',
        text: 'oklch(0 0 0)',
        accent: 'oklch(0.65 0.28 25)',
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.12 250)',
      },
    },
    {
      id: 'ig-classic-cream',
      name: 'Classic Cream',
      colors: {
        background: 'oklch(0.92 0.02 70)',
        cardBg: 'oklch(0.96 0.01 70)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.65 0.28 25)',
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'ig-platinum',
      name: 'Platinum',
      colors: {
        background: 'oklch(0.85 0 0)',
        cardBg: 'oklch(0.92 0 0)',
        text: 'oklch(0.10 0 0)',
        accent: 'oklch(0.65 0.28 25)',
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'ig-miami-vice',
      name: 'Miami Vice',
      colors: {
        background: 'oklch(0.75 0.12 200)',
        cardBg: 'oklch(0.92 0.04 180)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.70 0.25 330)',
        border: 'oklch(0.20 0.05 200)',
        link: 'oklch(0.55 0.20 330)',
      },
    },
    {
      id: 'ig-terminal',
      name: 'Terminal',
      transparent: true,
      colors: {
        background: '#133e09',
        cardBg: '#133e09',
        text: '#dada19',
        accent: '#133e09',
        border: '#dada19',
        link: '#dada19',
      },
    },
    {
      id: 'ig-nautical',
      name: 'Nautical',
      transparent: true,
      colors: {
        background: '#122d81',
        cardBg: '#122d81',
        text: '#dedec7',
        accent: '#122d81',
        border: '#dedec7',
        link: '#dedec7',
      },
    },
    {
      id: 'ig-amber',
      name: 'Amber',
      transparent: true,
      colors: {
        background: '#cd8e0e',
        cardBg: '#cd8e0e',
        text: '#e8ead2',
        accent: '#cd8e0e',
        border: '#e8ead2',
        link: '#e8ead2',
      },
    },
    {
      id: 'ig-cherry-wave',
      name: 'Cherry Wave',
      colors: {
        background: '#a70000',
        cardBg: '#9bdde0',
        text: '#ffffff',
        accent: '#9bdde0',
        border: '#ffffff',
        link: '#ffffff',
      },
    },
    {
      id: 'ig-red-label',
      name: 'Red Label',
      colors: {
        background: '#ffffff',
        cardBg: '#ac0000',
        text: '#ffffff',
        accent: '#a70000',
        border: '#ffffff',
        link: '#a70000',
      },
    },
  ],
}
