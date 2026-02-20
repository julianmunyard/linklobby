// src/lib/themes/artifact.ts
import type { ThemeConfig } from '@/types/theme'

export const artifactTheme: ThemeConfig = {
  id: 'artifact',
  name: 'Artifact',
  description: 'Brutalist grid layout with noise overlay and cycling color blocks',
  isListLayout: true,

  defaultColors: {
    background: '#080808',  // black
    cardBg: '#2F5233',      // green
    text: '#F2E8DC',        // cream
    accent: '#FF8C55',      // orange
    border: '#080808',      // black
    link: '#F2E8DC',        // cream
  },

  defaultFonts: {
    heading: 'var(--font-archivo-black)',
    body: 'var(--font-space-mono)',
    headingSize: 1.6,
    bodySize: 0.9,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'brutalist',
      name: 'Brutalist',
      colors: {
        background: '#080808',
        cardBg: '#2F5233',
        text: '#F2E8DC',
        accent: '#FF8C55',
        border: '#080808',
        link: '#F2E8DC',
      },
    },
    {
      id: 'neon-terminal',
      name: 'Neon Terminal',
      colors: {
        background: '#0a1a0a',
        cardBg: '#0d0d0d',
        text: '#00ff41',
        accent: '#ff0040',
        border: '#00ff41',
        link: '#00ff41',
      },
    },
    {
      id: 'concrete',
      name: 'Concrete',
      colors: {
        background: '#A6A6A6',
        cardBg: '#F2E8DC',
        text: '#080808',
        accent: '#FF8C55',
        border: '#080808',
        link: '#080808',
      },
    },
    {
      id: 'inverted',
      name: 'Inverted',
      colors: {
        background: '#F2E8DC',
        cardBg: '#FFC0CB',
        text: '#080808',
        accent: '#4A6FA5',
        border: '#080808',
        link: '#080808',
      },
    },
    {
      id: 'midnight',
      name: 'Midnight',
      colors: {
        background: '#0a1428',
        cardBg: '#1a2a4a',
        text: '#e8e8e8',
        accent: '#4A6FA5',
        border: '#0a1428',
        link: '#e8e8e8',
      },
    },
  ],
}
