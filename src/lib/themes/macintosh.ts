// src/lib/themes/macintosh.ts
import type { ThemeConfig } from '@/types/theme'

export const macintoshTheme: ThemeConfig = {
  id: 'macintosh',
  name: 'Macintosh',
  description: 'Classic 1984 Mac with pixel fonts and window chrome',
  isListLayout: true,
  hasWindowChrome: true,

  defaultColors: {
    background: '#cccccc',                       // Gray checkerboard base
    cardBg: '#ffffff',                           // White window background
    text: '#000000',                             // Black text
    accent: '#ffffff',                           // White inner content area
    border: '#000000',                           // Black borders (3px)
    link: '#0000ff',                             // Classic blue hyperlinks
  },

  defaultFonts: {
    heading: 'var(--font-vt323)',                // VT323 pixel font for titles
    body: 'var(--font-courier-prime)',           // Courier Prime for body text
    headingSize: 1.2,                            // Slightly larger for pixel font readability
    bodySize: 1,
    headingWeight: 'normal',                     // Pixel fonts don't need bold
  },

  defaultStyle: {
    borderRadius: 0,                             // Sharp corners - no rounding
    shadowEnabled: true,                         // Pixel-art 3D depth effect
    blurIntensity: 0,                            // No blur effects
  },

  palettes: [
    {
      id: 'classic-gray',
      name: 'Classic Gray',
      colors: {
        background: '#cccccc',
        cardBg: '#ffffff',
        text: '#000000',
        accent: '#ffffff',
        border: '#000000',
        link: '#0000ff',
      },
    },
    {
      id: 'calculator-orange',
      name: 'Calculator Orange',
      colors: {
        background: '#999999',
        cardBg: '#FFB672',
        text: '#000000',
        accent: '#ffffff',
        border: '#000000',
        link: '#000000',
      },
    },
    {
      id: 'notepad-yellow',
      name: 'Notepad Yellow',
      colors: {
        background: '#aaaaaa',
        cardBg: '#F2FFA4',
        text: '#000000',
        accent: '#F2FFA4',
        border: '#000000',
        link: '#000000',
      },
    },
    {
      id: 'platinum',
      name: 'Platinum',
      colors: {
        background: '#d0d0d0',
        cardBg: '#ffffff',
        text: '#000000',
        accent: '#f0f0f0',
        border: '#000000',
        link: '#0000ff',
      },
    },
  ],
}
