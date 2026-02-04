// src/lib/themes/receipt.ts
import type { ThemeConfig } from '@/types/theme'

export const receiptTheme: ThemeConfig = {
  id: 'receipt',
  name: 'Receipt',
  description: 'Thermal printer receipt aesthetic with dot-matrix styling',
  isListLayout: true,
  hasReceiptPhoto: true,

  defaultColors: {
    background: '#f5f2eb',           // Off-white thermal paper
    cardBg: '#f5f2eb',               // Same as background
    text: '#1a1a1a',                 // Dark print
    accent: '#f5f2eb',               // Paper color for hover states
    border: '#1a1a1a',               // Dotted borders
    link: '#1a1a1a',                 // Dark links
  },

  defaultFonts: {
    heading: 'var(--font-hypermarket)',
    body: 'var(--font-ticket-de-caisse)',
    headingSize: 2.0,
    bodySize: 1.2,
    headingWeight: 'normal',
  },

  defaultStyle: {
    borderRadius: 0,          // No rounded corners (paper edges)
    shadowEnabled: false,     // No shadows
    blurIntensity: 0,         // No blur
  },

  palettes: [
    {
      id: 'thermal-classic',
      name: 'Thermal Classic',
      colors: {
        background: '#f5f2eb',
        cardBg: '#f5f2eb',
        text: '#1a1a1a',
        accent: '#f5f2eb',
        border: '#1a1a1a',
        link: '#1a1a1a',
      },
    },
    {
      id: 'aged-receipt',
      name: 'Aged Receipt',
      colors: {
        background: '#e8e0d0',
        cardBg: '#e8e0d0',
        text: '#3d3632',
        accent: '#e8e0d0',
        border: '#3d3632',
        link: '#3d3632',
      },
    },
    {
      id: 'blue-carbon',
      name: 'Blue Carbon',
      colors: {
        background: '#e8eef5',
        cardBg: '#e8eef5',
        text: '#1a2a4a',
        accent: '#e8eef5',
        border: '#1a2a4a',
        link: '#1a2a4a',
      },
    },
    {
      id: 'pink-duplicate',
      name: 'Pink Duplicate',
      colors: {
        background: '#f5e8ec',
        cardBg: '#f5e8ec',
        text: '#4a1a2a',
        accent: '#f5e8ec',
        border: '#4a1a2a',
        link: '#4a1a2a',
      },
    },
  ],
}
