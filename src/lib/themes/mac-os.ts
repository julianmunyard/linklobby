// src/lib/themes/mac-os.ts
import type { ThemeConfig } from '@/types/theme'

export const macOsTheme: ThemeConfig = {
  id: 'mac-os',
  name: 'Mac OS',
  description: 'Window-like depth with shadows and traffic lights',
  hasTrafficLights: true,

  defaultColors: {
    background: 'oklch(0.89 0.04 10)',    // Light pink background
    cardBg: 'oklch(0.95 0.02 70)',        // Warm cream card bg
    text: 'oklch(0 0 0)',                 // Black text
    accent: 'oklch(0.65 0.15 250)',       // Blue accent
    border: 'oklch(0.20 0 0)',            // Dark border
    link: 'oklch(0.35 0.12 250)',         // Dark blue links
    titleBarLine: 'oklch(0.20 0 0)',      // Line under traffic lights
  },

  defaultFonts: {
    heading: 'var(--font-chicago)',
    body: 'var(--font-chicago)',
    headingSize: 1,
    bodySize: 1,
    headingWeight: 'bold',
  },

  defaultStyle: {
    borderRadius: 10,         // Rounded but not pill-shaped
    shadowEnabled: true,      // Strong drop shadows
    blurIntensity: 0,         // No blur for Mac OS
  },

  palettes: [
    {
      id: 'mac-poolsuite-pink',
      name: 'Poolsuite Pink',
      colors: {
        background: 'oklch(0.89 0.04 10)',
        cardBg: 'oklch(0.95 0.02 70)',
        text: 'oklch(0 0 0)',
        accent: 'oklch(0.65 0.15 250)',
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.12 250)',
        titleBarLine: 'oklch(0.20 0 0)',
      },
    },
    {
      id: 'sonoma-light',
      name: 'Sonoma Light',
      colors: {
        background: 'oklch(0.95 0 0)',
        cardBg: 'oklch(0.98 0 0)',
        text: 'oklch(0.20 0 0)',
        accent: 'oklch(0.55 0.20 250)',
        border: 'oklch(0.85 0 0)',
        link: 'oklch(0.50 0.20 230)',
        titleBarLine: 'oklch(0.85 0 0)',
      },
    },
    {
      id: 'space-gray',
      name: 'Space Gray',
      colors: {
        background: 'oklch(0.15 0 0)',
        cardBg: 'oklch(0.22 0 0)',
        text: 'oklch(0.90 0 0)',
        accent: 'oklch(0.60 0.12 280)',
        border: 'oklch(0.30 0 0)',
        link: 'oklch(0.65 0.12 260)',
        titleBarLine: 'oklch(0.30 0 0)',
      },
    },
    {
      id: 'mac-classic-cream',
      name: 'Classic Cream',
      colors: {
        background: 'oklch(0.92 0.02 70)',
        cardBg: 'oklch(0.96 0.01 70)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.55 0.20 250)',
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.15 250)',
        titleBarLine: 'oklch(0.20 0 0)',
      },
    },
    {
      id: 'mac-platinum',
      name: 'Platinum',
      colors: {
        background: 'oklch(0.85 0 0)',
        cardBg: 'oklch(0.92 0 0)',
        text: 'oklch(0.10 0 0)',
        accent: 'oklch(0.55 0.20 250)',
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.15 250)',
        titleBarLine: 'oklch(0.20 0 0)',
      },
    },
    {
      id: 'mac-miami-vice',
      name: 'Miami Vice',
      colors: {
        background: 'oklch(0.75 0.12 200)',
        cardBg: 'oklch(0.92 0.04 180)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.55 0.20 250)',
        border: 'oklch(0.20 0.05 200)',
        link: 'oklch(0.55 0.20 330)',
        titleBarLine: 'oklch(0.20 0.05 200)',
      },
    },
    {
      id: 'mac-terminal',
      name: 'Terminal',
      transparent: true,
      colors: {
        background: '#133e09',
        cardBg: '#133e09',
        text: '#dada19',
        accent: '#133e09',
        border: '#dada19',
        link: '#dada19',
        titleBarLine: '#dada19',
      },
    },
    {
      id: 'mac-nautical',
      name: 'Nautical',
      transparent: true,
      colors: {
        background: '#122d81',
        cardBg: '#122d81',
        text: '#dedec7',
        accent: '#122d81',
        border: '#dedec7',
        link: '#dedec7',
        titleBarLine: '#dedec7',
      },
    },
    {
      id: 'mac-amber',
      name: 'Amber',
      transparent: true,
      colors: {
        background: '#cd8e0e',
        cardBg: '#cd8e0e',
        text: '#e8ead2',
        accent: '#cd8e0e',
        border: '#e8ead2',
        link: '#e8ead2',
        titleBarLine: '#e8ead2',
      },
    },
    {
      id: 'mac-cherry-wave',
      name: 'Cherry Wave',
      colors: {
        background: '#a70000',
        cardBg: '#9bdde0',
        text: '#ffffff',
        accent: '#9bdde0',
        border: '#ffffff',
        link: '#ffffff',
        titleBarLine: '#ffffff',
      },
    },
    {
      id: 'mac-red-label',
      name: 'Red Label',
      colors: {
        background: '#ffffff',
        cardBg: '#ac0000',
        text: '#ffffff',
        accent: '#a70000',
        border: '#ffffff',
        link: '#a70000',
        titleBarLine: '#ffffff',
      },
    },
  ],
}
