// src/lib/themes/classified.ts
import type { ThemeConfig } from '@/types/theme'

export const classifiedTheme: ThemeConfig = {
  id: 'classified',
  name: 'Classified',
  description: 'WWII classified military document with typewriter text and rubber stamps',
  isListLayout: true,

  defaultColors: {
    background: '#2a2a2a',     // Dark desk background behind the paper
    cardBg: '#E8A0A0',          // Pink/salmon paper color
    text: '#3B2F7E',            // Purple-blue typewriter/mimeograph ink
    accent: '#CC0000',          // Red for stamps and headers
    border: '#3B2F7E',          // Purple-blue borders
    link: '#3B2F7E',            // Purple-blue links
  },

  defaultFonts: {
    heading: 'var(--font-special-elite)',
    body: 'var(--font-special-elite)',
    headingSize: 1.6,
    bodySize: 1.1,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,       // Clean A4 edges
    shadowEnabled: false,  // No shadows
    blurIntensity: 0,      // No blur
  },

  palettes: [
    {
      id: 'war-department',
      name: 'War Department',
      colors: {
        background: '#2a2a2a',
        cardBg: '#E8A0A0',
        text: '#3B2F7E',
        accent: '#CC0000',
        border: '#3B2F7E',
        link: '#3B2F7E',
      },
    },
    {
      id: 'top-secret',
      name: 'Top Secret',
      colors: {
        background: '#1a1a1a',
        cardBg: '#d4a088',      // Warmer aged pink
        text: '#2a1f5e',        // Darker purple
        accent: '#990000',      // Darker red
        border: '#2a1f5e',
        link: '#2a1f5e',
      },
    },
    {
      id: 'intelligence-bureau',
      name: 'Intelligence Bureau',
      colors: {
        background: '#1c2333',  // Dark navy
        cardBg: '#c4b8c8',      // Lavender-grey paper
        text: '#2b2d5e',        // Navy-purple
        accent: '#8b0000',      // Dark red
        border: '#2b2d5e',
        link: '#2b2d5e',
      },
    },
    {
      id: 'field-report',
      name: 'Field Report',
      colors: {
        background: '#1a1e14',  // Dark olive
        cardBg: '#c8c0a0',      // Khaki/green-tinted paper
        text: '#2a3020',        // Dark olive text
        accent: '#8b2500',      // Burnt red
        border: '#2a3020',
        link: '#2a3020',
      },
    },
  ],
}
