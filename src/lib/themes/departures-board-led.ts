import type { ThemeConfig } from '@/types/theme'

export const departuresBoardLedTheme: ThemeConfig = {
  id: 'departures-board-led',
  name: 'LED Board',
  description: 'LED dot-matrix flight display with glowing pixel text',
  isListLayout: true,

  defaultColors: {
    background: '#000000',
    cardBg: '#0a0a0a',
    text: '#d4a030',
    accent: '#d4a030',
    border: '#111111',
    link: '#d4a030',
  },

  defaultFonts: {
    heading: 'var(--font-led-dot-matrix)',
    body: 'var(--font-led-dot-matrix)',
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
      id: 'led-amber',
      name: 'Amber LED',
      colors: {
        background: '#000000',
        cardBg: '#0a0a0a',
        text: '#d4a030',
        accent: '#d4a030',
        border: '#111111',
        link: '#d4a030',
      },
    },
    {
      id: 'led-blue',
      name: 'Blue LED',
      colors: {
        background: '#000000',
        cardBg: '#0a0a0a',
        text: '#4a90d9',
        accent: '#4a90d9',
        border: '#111111',
        link: '#4a90d9',
      },
    },
    {
      id: 'led-red',
      name: 'Red LED',
      colors: {
        background: '#000000',
        cardBg: '#0a0a0a',
        text: '#d94a4a',
        accent: '#d94a4a',
        border: '#111111',
        link: '#d94a4a',
      },
    },
    {
      id: 'led-green',
      name: 'Green LED',
      colors: {
        background: '#000000',
        cardBg: '#0a0a0a',
        text: '#40c060',
        accent: '#40c060',
        border: '#111111',
        link: '#40c060',
      },
    },
  ],
}
