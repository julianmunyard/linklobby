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
    text: '#6B5B95',            // Faded purple-blue typewriter/mimeograph ink
    accent: '#C4605A',          // Faded red ink for stamps and headers
    border: '#6B5B95',          // Faded purple-blue borders
    link: '#6B5B95',            // Faded purple-blue links
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
        text: '#6B5B95',        // Faded purple-blue ink
        accent: '#C4605A',      // Faded red ink
        border: '#6B5B95',
        link: '#6B5B95',
      },
    },
    {
      id: 'top-secret',
      name: 'Top Secret',
      colors: {
        background: '#1a1a1a',
        cardBg: '#d4a088',      // Warmer aged pink
        text: '#7B6A8E',        // Lighter muted purple
        accent: '#B8706A',      // Softer warm red
        border: '#7B6A8E',
        link: '#7B6A8E',
      },
    },
    {
      id: 'intelligence-bureau',
      name: 'Intelligence Bureau',
      colors: {
        background: '#1c2333',  // Dark navy
        cardBg: '#c4b8c8',      // Lavender-grey paper
        text: '#60688A',        // Lighter navy-purple
        accent: '#A85858',      // Softer muted red
        border: '#60688A',
        link: '#60688A',
      },
    },
    {
      id: 'field-report',
      name: 'Field Report',
      colors: {
        background: '#1a1e14',  // Dark olive
        cardBg: '#c8c0a0',      // Khaki/green-tinted paper
        text: '#5A6248',        // Lighter olive text
        accent: '#A8604A',      // Softer burnt red
        border: '#5A6248',
        link: '#5A6248',
      },
    },
  ],
}
