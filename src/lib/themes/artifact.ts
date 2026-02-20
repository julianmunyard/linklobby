// src/lib/themes/artifact.ts
import type { ThemeConfig } from '@/types/theme'

export const artifactTheme: ThemeConfig = {
  id: 'artifact',
  name: 'Artifact',
  description: 'Brutalist grid layout with noise overlay and cycling color blocks',
  isListLayout: true,

  defaultColors: {
    background: '#080808',  // page bg / gap color
    cardBg: '#2F5233',      // primary card block color (green)
    text: '#F2E8DC',        // light text / cream
    accent: '#FF8C55',      // marquee / highlight (orange)
    border: '#FFC0CB',      // header block (pink)
    link: '#4A6FA5',        // hero right panel (blue)
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
        border: '#FFC0CB',
        link: '#4A6FA5',
      },
    },
    {
      id: 'monochrome',
      name: 'Monochrome',
      colors: {
        background: '#0a0a0a',
        cardBg: '#1a1a1a',
        text: '#e8e8e8',
        accent: '#ffffff',
        border: '#333333',
        link: '#2a2a2a',
      },
    },
    {
      id: 'blush',
      name: 'Blush',
      colors: {
        background: '#1a0a10',
        cardBg: '#8B4566',
        text: '#F2E8DC',
        accent: '#E8A0B8',
        border: '#FFC0CB',
        link: '#6B3050',
      },
    },
    {
      id: 'sage',
      name: 'Sage',
      colors: {
        background: '#0a100a',
        cardBg: '#3D5A3D',
        text: '#E8EDE4',
        accent: '#A8C8A0',
        border: '#C8D8C0',
        link: '#2A4030',
      },
    },
    {
      id: 'lavender',
      name: 'Lavender',
      colors: {
        background: '#0e0a14',
        cardBg: '#4A3868',
        text: '#E8E0F0',
        accent: '#B898D8',
        border: '#D8C8E8',
        link: '#352850',
      },
    },
    {
      id: 'terracotta',
      name: 'Terracotta',
      colors: {
        background: '#140a08',
        cardBg: '#8B4A30',
        text: '#F0E0D0',
        accent: '#D89870',
        border: '#E8C8A8',
        link: '#5A3020',
      },
    },
    {
      id: 'ocean',
      name: 'Ocean',
      colors: {
        background: '#080e14',
        cardBg: '#2A4A6A',
        text: '#D8E8F0',
        accent: '#80B8D8',
        border: '#A8D0E8',
        link: '#1A3050',
      },
    },
    {
      id: 'midnight',
      name: 'Midnight',
      colors: {
        background: '#0a0a14',
        cardBg: '#1a1a3a',
        text: '#c8c8e0',
        accent: '#6060b0',
        border: '#3a3a5a',
        link: '#282850',
      },
    },
  ],
}
