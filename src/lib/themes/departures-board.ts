// src/lib/themes/departures-board.ts
import type { ThemeConfig } from '@/types/theme'

export const departuresBoardTheme: ThemeConfig = {
  id: 'departures-board',
  name: 'Departures Board',
  description: 'Airport flight information display with monospace rows',
  isListLayout: true,

  defaultColors: {
    background: '#000000',
    cardBg: '#1a1a1a',
    text: '#ffffff',
    accent: '#ffffff',
    border: '#2a2a2a',
    link: '#ffffff',
  },

  defaultFonts: {
    heading: 'var(--font-aux-mono)',
    body: 'var(--font-aux-mono)',
    headingSize: 1.0,
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
      id: 'terminal-classic',
      name: 'Terminal Classic',
      colors: {
        background: '#000000',
        cardBg: '#1a1a1a',
        text: '#ffffff',
        accent: '#ffffff',
        border: '#2a2a2a',
        link: '#ffffff',
      },
    },
    {
      id: 'amber-display',
      name: 'Amber Display',
      colors: {
        background: '#000000',
        cardBg: '#1a1508',
        text: '#d4a030',
        accent: '#f0c040',
        border: '#2a2010',
        link: '#d4a030',
      },
    },
    {
      id: 'green-screen',
      name: 'Green Screen',
      colors: {
        background: '#000000',
        cardBg: '#0a1a0a',
        text: '#40c060',
        accent: '#60e080',
        border: '#102a10',
        link: '#40c060',
      },
    },
    {
      id: 'heathrow-blue',
      name: 'Heathrow Blue',
      colors: {
        background: '#000000',
        cardBg: '#0a1a2a',
        text: '#e0e8f0',
        accent: '#60b0ff',
        border: '#1a2a3a',
        link: '#e0e8f0',
      },
    },
  ],
}
