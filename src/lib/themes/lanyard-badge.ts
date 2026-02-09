// src/lib/themes/lanyard-badge.ts
import type { ThemeConfig } from '@/types/theme'

export const lanyardBadgeTheme: ThemeConfig = {
  id: 'lanyard-badge',
  name: 'Lanyard Badge',
  description: '3D physics-based conference badge on a lanyard with swipeable card views',
  isListLayout: true,

  defaultColors: {
    background: '#1a1a2e',      // Dark navy/indigo background (event hall feel)
    cardBg: '#f5f2eb',          // Off-white paper (receipt paper color)
    text: '#1a1a1a',            // Dark print on card
    accent: '#e94560',          // Vibrant red accent (lanyard color)
    border: '#1a1a1a',          // Dark borders
    link: '#1a1a1a',            // Dark links on card
  },

  defaultFonts: {
    heading: 'var(--font-hypermarket)',   // Reuse receipt heading font
    body: 'var(--font-ticket-de-caisse)', // Reuse receipt body font
    headingSize: 1.4,
    bodySize: 1.0,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 8,
    shadowEnabled: false,
    blurIntensity: 0,
  },

  palettes: [
    {
      id: 'conference-dark',
      name: 'Conference Dark',
      colors: {
        background: '#1a1a2e',
        cardBg: '#f5f2eb',
        text: '#1a1a1a',
        accent: '#e94560',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
    {
      id: 'backstage-pass',
      name: 'Backstage Pass',
      colors: {
        background: '#0f0f0f',
        cardBg: '#f5f2eb',
        text: '#1a1a1a',
        accent: '#ff6b35',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
    {
      id: 'vip-gold',
      name: 'VIP Gold',
      colors: {
        background: '#1a1a1a',
        cardBg: '#faf8f0',
        text: '#2d2517',
        accent: '#d4a43a',
        border: '#2d2517',
        link: '#2d2517',
      },
    },
    {
      id: 'all-access',
      name: 'All Access',
      colors: {
        background: '#16213e',
        cardBg: '#e8eef5',
        text: '#1a2a4a',
        accent: '#0f3460',
        border: '#1a2a4a',
        link: '#1a2a4a',
      },
    },
  ],
}
