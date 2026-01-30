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
  ],
}
