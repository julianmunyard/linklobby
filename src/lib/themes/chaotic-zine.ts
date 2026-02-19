// src/lib/themes/chaotic-zine.ts
import type { ThemeConfig } from '@/types/theme'

export const chaoticZineTheme: ThemeConfig = {
  id: 'chaotic-zine',
  name: 'Chaotic Zine',
  description: 'Cut-and-paste zine aesthetic with ransom-note lettering and torn paper',
  isListLayout: true,

  defaultColors: {
    background: '#f4f4f0',  // paper
    cardBg: '#050505',      // ink (dark cards)
    text: '#050505',        // ink
    accent: '#ff3b3b',      // red accent for badges/highlights
    border: '#050505',      // ink borders
    link: '#050505',        // ink links
  },

  defaultFonts: {
    heading: 'var(--font-permanent-marker)',
    body: 'var(--font-special-elite)',
    headingSize: 1.4,
    bodySize: 1.0,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'classic-zine',
      name: 'Classic Zine',
      colors: {
        background: '#f4f4f0',
        cardBg: '#050505',
        text: '#050505',
        accent: '#ff3b3b',
        border: '#050505',
        link: '#050505',
      },
    },
    {
      id: 'punk-pink',
      name: 'Punk Pink',
      colors: {
        background: '#f0e4e8',
        cardBg: '#1a0a10',
        text: '#1a0a10',
        accent: '#ff1493',
        border: '#1a0a10',
        link: '#1a0a10',
      },
    },
    {
      id: 'xerox-blue',
      name: 'Xerox Blue',
      colors: {
        background: '#e8ecf4',
        cardBg: '#0a0a1a',
        text: '#0a0a1a',
        accent: '#2b4fff',
        border: '#0a0a1a',
        link: '#0a0a1a',
      },
    },
    {
      id: 'newsprint',
      name: 'Newsprint',
      colors: {
        background: '#e8e4d8',
        cardBg: '#2a2418',
        text: '#2a2418',
        accent: '#8b4513',
        border: '#2a2418',
        link: '#2a2418',
      },
    },
  ],
}
