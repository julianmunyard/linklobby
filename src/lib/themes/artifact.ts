// src/lib/themes/artifact.ts
//
// Color slot mapping for the artifact layout:
//   background → page bg / gap color (dark)
//   cardBg     → block color 1 + hero right panel
//   text       → block color 2 + social icons footer
//   border     → block color 3 + header block
//   link       → block color 4 + hero left panel (CD area)
//   accent     → block color 5 + marquee banner
//
// Each palette should have 5 visually distinct block colors that cycle.

import type { ThemeConfig } from '@/types/theme'

export const artifactTheme: ThemeConfig = {
  id: 'artifact',
  name: 'Artifact',
  description: 'Brutalist grid layout with noise overlay and cycling color blocks',
  isListLayout: true,

  defaultColors: {
    background: '#080808',
    cardBg: '#2F5233',      // green
    text: '#F2E8DC',        // cream
    accent: '#FF8C55',      // orange
    border: '#FFC0CB',      // pink
    link: '#4A6FA5',        // blue
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
    // --- DEFAULT ---
    {
      id: 'brutalist',
      name: 'Brutalist',
      colors: {
        background: '#080808',
        cardBg: '#2F5233',      // forest green
        text: '#F2E8DC',        // cream
        accent: '#FF8C55',      // orange
        border: '#FFC0CB',      // pink
        link: '#4A6FA5',        // steel blue
      },
    },

    // --- BLACK & WHITE ---
    {
      id: 'monochrome',
      name: 'Monochrome',
      colors: {
        background: '#080808',
        cardBg: '#1a1a1a',      // near black
        text: '#e8e8e8',        // near white
        accent: '#ffffff',      // white
        border: '#555555',      // mid grey
        link: '#333333',        // dark grey
      },
    },

    // --- MULTI-COLOR PASTELS ---
    {
      id: 'gelato',
      name: 'Gelato',
      colors: {
        background: '#0a0a0a',
        cardBg: '#E8A0B8',      // strawberry pink
        text: '#B8D8C8',        // mint green
        accent: '#F5D680',      // lemon yellow
        border: '#C8B8E8',      // lavender
        link: '#F0C8A8',        // peach
      },
    },
    {
      id: 'tropicana',
      name: 'Tropicana',
      colors: {
        background: '#080808',
        cardBg: '#E85830',      // red-orange
        text: '#F0D848',        // bright yellow
        accent: '#48B868',      // tropical green
        border: '#FF8CB0',      // hot pink
        link: '#3898D0',        // ocean blue
      },
    },
    {
      id: 'powder',
      name: 'Powder',
      colors: {
        background: '#0a0a0a',
        cardBg: '#7898C0',      // powder blue
        text: '#F2E8DC',        // cream
        accent: '#C89080',      // dusty rose
        border: '#A8B8A0',      // sage
        link: '#B8A0C0',        // soft lilac
      },
    },
    {
      id: 'sunset',
      name: 'Sunset',
      colors: {
        background: '#080808',
        cardBg: '#C83838',      // crimson
        text: '#F0C868',        // golden
        accent: '#E87830',      // tangerine
        border: '#F898A8',      // salmon pink
        link: '#6848A0',        // deep violet
      },
    },
    {
      id: 'earth',
      name: 'Earth',
      colors: {
        background: '#080808',
        cardBg: '#5A7850',      // olive green
        text: '#D8C8A8',        // sand
        accent: '#B86830',      // burnt sienna
        border: '#A09080',      // warm stone
        link: '#486068',        // slate teal
      },
    },
    {
      id: 'neon',
      name: 'Neon',
      colors: {
        background: '#080808',
        cardBg: '#00C878',      // electric green
        text: '#FF50A0',        // neon pink
        accent: '#FFD030',      // neon yellow
        border: '#30B0FF',      // electric blue
        link: '#C048FF',        // neon purple
      },
    },
    {
      id: 'coastal',
      name: 'Coastal',
      colors: {
        background: '#080808',
        cardBg: '#2868A0',      // deep ocean
        text: '#E8E0D0',        // driftwood
        accent: '#E0A868',      // sand gold
        border: '#88B8C8',      // sea foam
        link: '#486058',        // kelp green
      },
    },
    {
      id: 'berry',
      name: 'Berry',
      colors: {
        background: '#0a0808',
        cardBg: '#6B2848',      // blackberry
        text: '#E8C8D8',        // blush cream
        accent: '#D05888',      // raspberry
        border: '#A878B8',      // mulberry
        link: '#384068',        // blueberry
      },
    },
  ],
}
