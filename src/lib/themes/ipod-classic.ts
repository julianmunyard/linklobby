// src/lib/themes/ipod-classic.ts
import type { ThemeConfig } from '@/types/theme'

export const ipodClassicTheme: ThemeConfig = {
  id: 'ipod-classic',
  name: 'iPod Classic',
  description: 'Classic iPod interface with click wheel navigation',
  isListLayout: true,

  defaultColors: {
    background: '#e8e0d0',           // Page background
    cardBg: '#C2C1BA',               // LCD screen gray (classic iPod color)
    text: '#3d3c39',                 // Dark text on LCD
    accent: '#3d3c39',               // Selection/highlight color
    border: '#3d3c39',               // LCD text/border
    link: '#3d3c39',                 // Links
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
      id: 'classic-grey',
      name: 'Classic Grey',
      colors: {
        background: '#e8e0d0',
        cardBg: '#C2C1BA',            // Classic iPod LCD grey
        text: '#3d3c39',
        accent: '#3d3c39',
        border: '#3d3c39',
        link: '#3d3c39',
      },
    },
    {
      id: 'green-backlight',
      name: 'Green Backlight',
      colors: {
        background: '#e8e0d0',
        cardBg: '#a8d4a0',            // Green LCD
        text: '#2d4a2d',
        accent: '#2d4a2d',
        border: '#2d4a2d',
        link: '#2d4a2d',
      },
    },
    {
      id: 'amber-backlight',
      name: 'Amber',
      colors: {
        background: '#e8e0d0',
        cardBg: '#e8c87a',            // Amber LCD
        text: '#4a3d1a',
        accent: '#4a3d1a',
        border: '#4a3d1a',
        link: '#4a3d1a',
      },
    },
    {
      id: 'blue-backlight',
      name: 'Blue',
      colors: {
        background: '#e8e0d0',
        cardBg: '#a0c4d4',            // Blue LCD
        text: '#2d3d4a',
        accent: '#2d3d4a',
        border: '#2d3d4a',
        link: '#2d3d4a',
      },
    },
  ],
}
