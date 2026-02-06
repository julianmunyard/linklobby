// src/lib/themes/system-settings.ts
import type { ThemeConfig } from '@/types/theme'

export const systemSettingsTheme: ThemeConfig = {
  id: 'system-settings',
  name: 'System Settings',
  description: 'Poolsuite-inspired retro Mac aesthetic',
  hasWindowChrome: true,

  defaultColors: {
    background: 'oklch(0.89 0.04 10)',        // #F6D5D5 light pink page background
    cardBg: 'oklch(0.95 0.02 70)',            // #F9F0E9 warm cream card background
    text: 'oklch(0 0 0)',                     // Black text
    accent: 'oklch(1 0 0)',                   // White inner box
    border: 'oklch(0.20 0 0)',                // Dark border
    link: 'oklch(0.35 0.12 250)',             // Classic Mac dark blue links
  },

  defaultFonts: {
    heading: 'var(--font-ishmeria)',          // Ishmeria font
    body: 'var(--font-dm-sans)',              // Clean readable body text
    headingSize: 1,
    bodySize: 1,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 6,                          // Subtle rounded corners
    shadowEnabled: false,                     // No drop shadows
    blurIntensity: 0,                         // No blur effects
  },

  palettes: [
    {
      id: 'poolsuite-pink',
      name: 'Poolsuite Pink',
      colors: {
        background: 'oklch(0.89 0.04 10)',    // #F6D5D5 light pink
        cardBg: 'oklch(0.95 0.02 70)',        // #F9F0E9 warm cream
        text: 'oklch(0 0 0)',                 // Black text
        accent: 'oklch(1 0 0)',               // White inner box
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.12 250)',
      },
    },
    {
      id: 'classic-cream',
      name: 'Classic Cream',
      colors: {
        background: 'oklch(0.92 0.02 70)',    // Warm cream background
        cardBg: 'oklch(0.96 0.01 70)',        // Lighter cream card
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(1 0 0)',               // White inner box
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'platinum',
      name: 'Platinum',
      colors: {
        background: 'oklch(0.85 0 0)',        // System 7 Platinum gray
        cardBg: 'oklch(0.92 0 0)',
        text: 'oklch(0.10 0 0)',
        accent: 'oklch(1 0 0)',               // White inner box
        border: 'oklch(0.20 0 0)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'miami-vice',
      name: 'Miami Vice',
      colors: {
        background: 'oklch(0.75 0.12 200)',   // Teal/cyan
        cardBg: 'oklch(0.92 0.04 180)',       // Light teal tint
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.95 0.02 180)',       // Light cyan inner box
        border: 'oklch(0.20 0.05 200)',
        link: 'oklch(0.55 0.20 330)',
      },
    },
    {
      id: 'terminal',
      name: 'Terminal',
      transparent: true,
      colors: {
        background: '#133e09',
        cardBg: '#133e09',        // Same as bg (transparent cards)
        text: '#dada19',
        accent: '#133e09',
        border: '#dada19',
        link: '#dada19',
        titleBarLine: '#dada19',
      },
    },
    {
      id: 'nautical',
      name: 'Nautical',
      transparent: true,
      colors: {
        background: '#122d81',
        cardBg: '#122d81',        // Same as bg (transparent cards)
        text: '#dedec7',
        accent: '#122d81',
        border: '#dedec7',
        link: '#dedec7',
        titleBarLine: '#dedec7',
      },
    },
    {
      id: 'amber',
      name: 'Amber',
      transparent: true,
      colors: {
        background: '#cd8e0e',
        cardBg: '#cd8e0e',        // Same as bg (transparent cards)
        text: '#e8ead2',
        accent: '#cd8e0e',
        border: '#e8ead2',
        link: '#e8ead2',
        titleBarLine: '#e8ead2',
      },
    },
    {
      id: 'cherry-wave',
      name: 'Cherry Wave',
      transparent: false,
      colors: {
        background: '#a70000',
        cardBg: '#9bdde0',
        text: '#ffffff',
        accent: '#9bdde0',        // Inner box same as card
        border: '#ffffff',
        link: '#ffffff',
        titleBarLine: '#ffffff',
      },
    },
    {
      id: 'red-label',
      name: 'Red Label',
      transparent: false,
      colors: {
        background: '#ffffff',
        cardBg: '#ac0000',
        text: '#ffffff',
        accent: '#a70000',        // Slightly different red for inner box
        border: '#ffffff',
        link: '#a70000',
        titleBarLine: '#ffffff',
      },
    },
  ],
}
