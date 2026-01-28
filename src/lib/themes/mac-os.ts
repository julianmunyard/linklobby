// src/lib/themes/mac-os.ts
import type { ThemeConfig } from '@/types/theme'

export const macOsTheme: ThemeConfig = {
  id: 'mac-os',
  name: 'Mac OS',
  description: 'Window-like depth with shadows and traffic lights',
  hasTrafficLights: true,

  defaultColors: {
    background: 'oklch(0.20 0 0)',        // Dark gray background
    cardBg: 'oklch(0.28 0 0)',            // Slightly lighter card bg
    text: 'oklch(0.95 0 0)',              // Off-white text
    accent: 'oklch(0.65 0.15 250)',       // Blue accent
    border: 'oklch(0.35 0 0)',            // Subtle gray border
    link: 'oklch(0.70 0.15 230)',         // Light blue links
  },

  defaultFonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
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
      id: 'monterey-dark',
      name: 'Monterey Dark',
      colors: {
        background: 'oklch(0.20 0 0)',
        cardBg: 'oklch(0.28 0 0)',
        text: 'oklch(0.95 0 0)',
        accent: 'oklch(0.65 0.15 250)',
        border: 'oklch(0.35 0 0)',
        link: 'oklch(0.70 0.15 230)',
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
      },
    },
  ],
}
