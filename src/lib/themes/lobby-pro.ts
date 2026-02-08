// src/lib/themes/lobby-pro.ts
import type { ThemeConfig } from '@/types/theme'

export const lobbyProTheme: ThemeConfig = {
  id: 'lobby-pro',
  name: 'Lobby Pro',
  description: 'Modern animated list with glassmorphism and scroll animations',
  isListLayout: true,
  hasGlassEffect: true,

  defaultColors: {
    background: '#0a0a1a',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    accent: '#3b82f6',
    border: 'rgba(255, 255, 255, 0.12)',
    link: '#60a5fa',
  },

  defaultFonts: {
    heading: 'var(--font-dm-sans)',
    body: 'var(--font-dm-sans)',
    headingSize: 1.3,
    bodySize: 1,
    headingWeight: 'bold',
  },

  defaultStyle: {
    borderRadius: 16,
    shadowEnabled: false,
    blurIntensity: 12,
  },

  palettes: [
    {
      id: 'midnight',
      name: 'Midnight',
      transparent: true,
      colors: {
        background: '#0a0a1a',
        cardBg: 'rgba(255, 255, 255, 0.08)',
        text: '#ffffff',
        accent: '#3b82f6',
        border: 'rgba(255, 255, 255, 0.12)',
        link: '#60a5fa',
      },
    },
    {
      id: 'frost',
      name: 'Frost',
      transparent: true,
      colors: {
        background: '#f0f4f8',
        cardBg: 'rgba(0, 0, 0, 0.04)',
        text: '#1a1a2e',
        accent: '#0ea5e9',
        border: 'rgba(0, 0, 0, 0.08)',
        link: '#0284c7',
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      transparent: true,
      colors: {
        background: '#0a0a0a',
        cardBg: 'rgba(34, 211, 238, 0.06)',
        text: '#ffffff',
        accent: '#22d3ee',
        border: 'rgba(34, 211, 238, 0.15)',
        link: '#67e8f9',
      },
    },
    {
      id: 'sunset',
      name: 'Sunset',
      transparent: true,
      colors: {
        background: '#1a0a0a',
        cardBg: 'rgba(249, 115, 22, 0.06)',
        text: '#fff5f0',
        accent: '#f97316',
        border: 'rgba(249, 115, 22, 0.12)',
        link: '#fb923c',
      },
    },
    {
      id: 'monochrome',
      name: 'Monochrome',
      transparent: true,
      colors: {
        background: '#000000',
        cardBg: 'rgba(255, 255, 255, 0.06)',
        text: '#ffffff',
        accent: '#ffffff',
        border: 'rgba(255, 255, 255, 0.10)',
        link: '#d4d4d4',
      },
    },
  ],
}
