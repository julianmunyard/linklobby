// src/lib/themes/ipod-classic.ts
import type { ThemeConfig } from '@/types/theme'

export const ipodClassicTheme: ThemeConfig = {
  id: 'ipod-classic',
  name: 'iPod Classic',
  description: 'Classic iPod interface with click wheel navigation',
  isListLayout: true,

  defaultColors: {
    background: '#e8e0d0',           // Page background - subtle gradient effect via CSS
    cardBg: '#c8c8c8',               // LCD screen gray
    text: '#1a1a1a',                 // Dark text
    accent: '#2a6eff',               // Selection blue
    border: '#1a1a1a',               // Bezel black
    link: '#1a1a1a',                 // Dark links
  },

  defaultFonts: {
    heading: 'var(--font-chiq)',     // Classic Chicago-style font
    body: 'var(--font-chiq)',
    headingSize: 0.85,               // Smaller since Chiq is chunky
    bodySize: 0.8,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 24,                // iPod body radius
    shadowEnabled: true,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'classic-ipod',
      name: 'Classic iPod',
      colors: {
        background: '#e8e0d0',
        cardBg: '#c8c8c8',
        text: '#1a1a1a',
        accent: '#2a6eff',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
    {
      id: 'ipod-mini-pink',
      name: 'iPod Mini Pink',
      colors: {
        background: '#f5e0e8',
        cardBg: '#c8c8c8',
        text: '#1a1a1a',
        accent: '#ff4d6d',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
    {
      id: 'ipod-mini-blue',
      name: 'iPod Mini Blue',
      colors: {
        background: '#d0e8f0',
        cardBg: '#c8c8c8',
        text: '#1a1a1a',
        accent: '#0077b6',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
    {
      id: 'ipod-mini-green',
      name: 'iPod Mini Green',
      colors: {
        background: '#d8f0d0',
        cardBg: '#c8c8c8',
        text: '#1a1a1a',
        accent: '#38b000',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
  ],
}
