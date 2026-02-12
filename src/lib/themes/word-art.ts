// src/lib/themes/word-art.ts
import type { ThemeConfig } from '@/types/theme'

export const wordArtTheme: ThemeConfig = {
  id: 'word-art',
  name: 'Word Art',
  description: 'Classic WordArt-inspired text effects for every link',
  isListLayout: true,

  defaultColors: {
    background: '#ffffff',
    cardBg: '#ffffff',
    text: '#1a1a1a',
    accent: '#ffffff',
    border: '#ffffff',
    link: '#1a1a1a',
  },

  defaultFonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    headingSize: 2.5,
    bodySize: 2.0,
    headingWeight: 'bold',
  },

  defaultStyle: {
    borderRadius: 0,
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'classic-white',
      name: 'Classic White',
      colors: {
        background: '#ffffff',
        cardBg: '#ffffff',
        text: '#1a1a1a',
        accent: '#ffffff',
        border: '#ffffff',
        link: '#1a1a1a',
      },
    },
    {
      id: 'dark-canvas',
      name: 'Dark Canvas',
      colors: {
        background: '#1a1a2e',
        cardBg: '#1a1a2e',
        text: '#e0e0e0',
        accent: '#1a1a2e',
        border: '#1a1a2e',
        link: '#e0e0e0',
      },
    },
    {
      id: 'colored-paper',
      name: 'Colored Paper',
      colors: {
        background: '#fef3c7',
        cardBg: '#fef3c7',
        text: '#451a03',
        accent: '#fef3c7',
        border: '#fef3c7',
        link: '#451a03',
      },
    },
  ],
}
