// src/lib/themes/system-settings.ts
import type { ThemeConfig } from '@/types/theme'

export const systemSettingsTheme: ThemeConfig = {
  id: 'system-settings',
  name: 'System Settings',
  description: 'Classic Macintosh System 7 aesthetic',
  hasWindowChrome: true,

  defaultColors: {
    background: 'oklch(0.85 0.04 20)',        // Muted pink background
    cardBg: 'oklch(0.95 0.02 80)',            // Warm cream card background
    text: 'oklch(0.15 0 0)',                  // Near-black text
    accent: 'oklch(0.70 0.02 80)',            // Warm gray accent
    border: 'oklch(0 0 0)',                   // Pure black borders
    link: 'oklch(0.35 0.15 250)',             // Classic Mac dark blue links
  },

  defaultFonts: {
    heading: 'var(--font-pix-chicago)',       // Pixel font for retro feel
    body: 'var(--font-dm-sans)',              // Clean readable body text
    headingSize: 0.9,                         // Pixel fonts render better slightly smaller
    bodySize: 1,
    headingWeight: 'normal',                  // Pixel fonts don't need bold
  },

  defaultStyle: {
    borderRadius: 4,                          // Subtle rounded corners (not too round)
    shadowEnabled: false,                     // No drop shadows in System 7
    blurIntensity: 0,                         // No blur effects
  },

  palettes: [
    {
      id: 'classic-cream',
      name: 'Classic Cream',
      colors: {
        background: 'oklch(0.85 0.04 20)',
        cardBg: 'oklch(0.95 0.02 80)',
        text: 'oklch(0.15 0 0)',
        accent: 'oklch(0.70 0.02 80)',
        border: 'oklch(0 0 0)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'platinum',
      name: 'Platinum',
      colors: {
        background: 'oklch(0.80 0 0)',        // Lighter gray System 7 Platinum
        cardBg: 'oklch(0.92 0 0)',            // Very light gray
        text: 'oklch(0.10 0 0)',
        accent: 'oklch(0.65 0 0)',
        border: 'oklch(0 0 0)',
        link: 'oklch(0.35 0.15 250)',
      },
    },
    {
      id: 'compact-pro',
      name: 'Compact Pro',
      colors: {
        background: 'oklch(0.35 0 0)',        // Darker "Compact Macintosh" style
        cardBg: 'oklch(0.45 0 0)',            // Dark gray
        text: 'oklch(0.95 0 0)',              // Light text on dark
        accent: 'oklch(0.60 0 0)',
        border: 'oklch(0.70 0 0)',            // Lighter border for dark theme
        link: 'oklch(0.65 0.15 250)',         // Lighter blue for dark background
      },
    },
  ],
}
