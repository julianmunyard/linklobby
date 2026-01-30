// src/lib/themes/system-settings.ts
import type { ThemeConfig } from '@/types/theme'

export const systemSettingsTheme: ThemeConfig = {
  id: 'system-settings',
  name: 'System Settings',
  description: 'Poolsuite-inspired retro Mac aesthetic',
  hasWindowChrome: true,

  defaultColors: {
    background: 'oklch(0.82 0.06 15)',        // Muted pink page background
    cardBg: 'oklch(0.94 0.02 75)',            // Warm cream card background
    text: 'oklch(0.20 0 0)',                  // Near-black text
    accent: 'oklch(0.82 0.06 15)',            // Pink accent (matches frame)
    border: 'oklch(0.60 0.02 75)',            // Warm gray border
    link: 'oklch(0.35 0.12 250)',             // Classic Mac dark blue links
  },

  defaultFonts: {
    heading: 'var(--font-chikarego)',         // Poolsuite pixel font
    body: 'var(--font-dm-sans)',              // Clean readable body text
    headingSize: 1,
    bodySize: 1,
    headingWeight: 'normal',                  // Pixel fonts don't need bold
  },

  defaultStyle: {
    borderRadius: 14,                         // Rounded corners like Poolsuite
    shadowEnabled: false,                     // No drop shadows
    blurIntensity: 0,                         // No blur effects
  },

  palettes: [
    {
      id: 'poolsuite-pink',
      name: 'Poolsuite Pink',
      colors: {
        background: 'oklch(0.82 0.06 15)',    // Muted pink
        cardBg: 'oklch(0.94 0.02 75)',        // Warm cream
        text: 'oklch(0.20 0 0)',
        accent: 'oklch(0.82 0.06 15)',
        border: 'oklch(0.60 0.02 75)',
        link: 'oklch(0.35 0.12 250)',
      },
    },
    {
      id: 'classic-cream',
      name: 'Classic Cream',
      colors: {
        background: 'oklch(0.88 0.03 80)',    // Warmer cream background
        cardBg: 'oklch(0.95 0.02 80)',        // Bright cream
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.70 0.02 80)',
        border: 'oklch(0.55 0.02 80)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'platinum',
      name: 'Platinum',
      colors: {
        background: 'oklch(0.80 0 0)',        // System 7 Platinum gray
        cardBg: 'oklch(0.92 0 0)',
        text: 'oklch(0.10 0 0)',
        accent: 'oklch(0.65 0 0)',
        border: 'oklch(0.50 0 0)',
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
        accent: 'oklch(0.75 0.15 330)',       // Pink accent
        border: 'oklch(0.50 0.08 200)',
        link: 'oklch(0.55 0.20 330)',         // Hot pink links
      },
    },
  ],
}
