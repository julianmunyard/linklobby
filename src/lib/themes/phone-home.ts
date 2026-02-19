// src/lib/themes/phone-home.ts
import type { ThemeConfig } from '@/types/theme'

export const phoneHomeTheme: ThemeConfig = {
  id: 'phone-home',
  name: 'Phone Home',
  description: 'iOS home screen with app icons and dock',
  isPhoneHomeLayout: true,

  defaultColors: {
    background: 'oklch(0.13 0 0)',        // Near-black background (wallpaper shows through)
    cardBg: 'oklch(0.25 0 0 / 0.6)',     // Semi-transparent dark card bg
    text: 'oklch(1 0 0)',                 // White text
    accent: 'oklch(0.62 0.22 250)',       // iOS blue accent
    border: 'oklch(0.40 0 0 / 0.3)',     // Subtle border
    link: 'oklch(0.62 0.22 250)',         // Blue links
  },

  defaultFonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    headingSize: 1,
    bodySize: 0.85,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 16,          // iOS icon radius
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'phone-dark',
      name: 'Dark',
      colors: {
        background: 'oklch(0.13 0 0)',
        cardBg: 'oklch(0.25 0 0 / 0.6)',
        text: 'oklch(1 0 0)',
        accent: 'oklch(0.62 0.22 250)',
        border: 'oklch(0.40 0 0 / 0.3)',
        link: 'oklch(0.62 0.22 250)',
      },
    },
    {
      id: 'phone-light',
      name: 'Light',
      colors: {
        background: 'oklch(0.95 0 0)',
        cardBg: 'oklch(1 0 0 / 0.7)',
        text: 'oklch(0.13 0 0)',
        accent: 'oklch(0.55 0.22 250)',
        border: 'oklch(0.80 0 0 / 0.4)',
        link: 'oklch(0.55 0.22 250)',
      },
    },
    {
      id: 'phone-midnight',
      name: 'Midnight',
      colors: {
        background: 'oklch(0.10 0.03 270)',
        cardBg: 'oklch(0.18 0.03 270 / 0.6)',
        text: 'oklch(0.95 0 0)',
        accent: 'oklch(0.55 0.18 280)',
        border: 'oklch(0.30 0.02 270 / 0.3)',
        link: 'oklch(0.65 0.18 280)',
      },
    },
    {
      id: 'phone-sierra-blue',
      name: 'Sierra Blue',
      colors: {
        background: 'oklch(0.55 0.10 230)',
        cardBg: 'oklch(0.40 0.08 230 / 0.6)',
        text: 'oklch(1 0 0)',
        accent: 'oklch(0.75 0.12 230)',
        border: 'oklch(0.60 0.06 230 / 0.3)',
        link: 'oklch(0.80 0.10 230)',
      },
    },
  ],
}
