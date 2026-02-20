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
        background: '#ffe0f0',
        cardBg: '#2d0a1e',
        text: '#2d0a1e',
        accent: '#ff1493',
        border: '#2d0a1e',
        link: '#2d0a1e',
      },
    },
    {
      id: 'xerox-blue',
      name: 'Xerox Blue',
      colors: {
        background: '#d8e4ff',
        cardBg: '#0a1030',
        text: '#0a1030',
        accent: '#2b4fff',
        border: '#0a1030',
        link: '#0a1030',
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
    {
      id: 'inverted',
      name: 'Inverted',
      colors: {
        background: '#0a0a0a',
        cardBg: '#f4f4f0',
        text: '#f4f4f0',
        accent: '#ff3b3b',
        border: '#f4f4f0',
        link: '#f4f4f0',
      },
    },
    {
      id: 'neon-green',
      name: 'Neon Green',
      colors: {
        background: '#0d1a0d',
        cardBg: '#00ff41',
        text: '#00ff41',
        accent: '#ff0040',
        border: '#00ff41',
        link: '#00ff41',
      },
    },
    {
      id: 'sunset-zine',
      name: 'Sunset',
      colors: {
        background: '#fff5e6',
        cardBg: '#4a1a00',
        text: '#4a1a00',
        accent: '#ff6b2b',
        border: '#4a1a00',
        link: '#4a1a00',
      },
    },
    {
      id: 'bruise',
      name: 'Bruise',
      colors: {
        background: '#e8dff5',
        cardBg: '#1a0a2e',
        text: '#1a0a2e',
        accent: '#8b00ff',
        border: '#1a0a2e',
        link: '#1a0a2e',
      },
    },
  ],
}
