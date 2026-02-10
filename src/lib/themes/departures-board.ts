// src/lib/themes/departures-board.ts
import type { ThemeConfig } from '@/types/theme'

export const departuresBoardTheme: ThemeConfig = {
  id: 'departures-board',
  name: 'Departures Board',
  description: 'Airport flight information display with tabular monospace layout',
  isListLayout: true,

  defaultColors: {
    background: '#000000',        // Pure black
    cardBg: '#0a0f1a',            // Very dark navy for row backgrounds
    text: '#c0c8d0',              // Silver/light grey monospace text
    accent: '#4a90d9',            // Blue accent (for status highlights, like "ON TIME")
    border: '#1a2236',            // Dark navy border/ruled lines
    link: '#c0c8d0',              // Same silver for links
  },

  defaultFonts: {
    heading: 'var(--font-aux-mono)',
    body: 'var(--font-aux-mono)',
    headingSize: 1.6,
    bodySize: 1.0,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,          // Sharp edges - industrial display
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'terminal-classic',
      name: 'Terminal Classic',
      colors: {
        background: '#000000',
        cardBg: '#0a0f1a',
        text: '#c0c8d0',
        accent: '#4a90d9',
        border: '#1a2236',
        link: '#c0c8d0',
      },
    },
    {
      id: 'amber-display',
      name: 'Amber Display',
      colors: {
        background: '#0a0800',
        cardBg: '#141008',
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
        background: '#000a00',
        cardBg: '#081408',
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
        background: '#001028',
        cardBg: '#0a1a38',
        text: '#e0e8f0',
        accent: '#60b0ff',
        border: '#1a2a48',
        link: '#e0e8f0',
      },
    },
  ],
}
