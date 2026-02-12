// src/lib/word-art-styles.ts
// 22 word art styles inspired by classic Microsoft WordArt, translated to React-compatible inline styles.
// Each style has: wrapperStyle (transforms), textStyle (main text appearance), shadowStyle (optional ::before layer).

import type { CSSProperties } from 'react'

export interface WordArtStyle {
  id: string
  name: string
  wrapperStyle: CSSProperties
  textStyle: CSSProperties
  shadowStyle?: CSSProperties // Rendered as an absolute-positioned layer behind the main text
}

export const WORD_ART_STYLES: WordArtStyle[] = [
  // 1. Bold white with black stroke, slightly stretched
  {
    id: 'style-one',
    name: 'Outline',
    wrapperStyle: { transform: 'scale(1, 1.2)' },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#ffffff',
      WebkitTextStroke: '0.03em #000000',
      letterSpacing: '-0.01em',
    },
  },
  // 2. Bold black, rotated & skewed
  {
    id: 'style-two',
    name: 'Slant',
    wrapperStyle: { transform: 'skew(-10deg, 0) scale(1, 1.3)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      fontWeight: 'bold',
      color: '#1a1a1a',
      letterSpacing: '0.02em',
    },
  },
  // 3. Italic white stroke with gray shadow
  {
    id: 'style-three',
    name: 'Italic Outline',
    wrapperStyle: { transform: 'scale(1, 1.3)' },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: '#ffffff',
      WebkitTextStroke: '0.01em #000000',
      textShadow: '0.03em 0.03em 0 #6D6D6D',
      letterSpacing: '-0.01em',
    },
  },
  // 4. Quicksand-style blue with gray shadow (Slate)
  {
    id: 'style-four',
    name: 'Slate',
    wrapperStyle: { transform: 'scale(1, 1.5)' },
    textStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      fontWeight: 'normal',
      color: '#2F5485',
      textShadow: '0.03em 0.03em 0px #B3B3B3',
    },
  },
  // 5. Gray with purple blend overlay (Purple)
  {
    id: 'style-five',
    name: 'Purple',
    wrapperStyle: { transform: 'skew(0, -10deg) scale(1, 1.5)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      letterSpacing: '-0.01em',
      backgroundImage: 'linear-gradient(to bottom, #4222be 0%, #a62cc1 73%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      WebkitTextStroke: '0.01em #B28FFD',
    },
  },
  // 6. Silver gradient with dark shadow (Graydient)
  {
    id: 'style-six',
    name: 'Silver',
    wrapperStyle: { transform: 'scaleY(1.3)' },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      letterSpacing: '0.08em',
      backgroundImage: 'linear-gradient(to bottom, #999999 0%, #ffffff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      letterSpacing: '0.08em',
      color: '#4a4a4a',
      transform: 'translate(0.03em, 0.03em)',
    },
  },
  // 7. Blue with red shadow (Blues)
  {
    id: 'style-seven',
    name: 'Blues',
    wrapperStyle: {},
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#24c0fd',
      WebkitTextStroke: '0.01em #0000aa',
      textShadow: '0.13em -0.13em 0px #0000aa',
      letterSpacing: '-0.05em',
    },
  },
  // 8. Radial yellow-orange gradient with gray shadow
  {
    id: 'style-eight',
    name: 'Radial',
    wrapperStyle: { transform: 'scale(1, 1.2)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      fontWeight: 'bold',
      backgroundImage: 'radial-gradient(ellipse at center, #fffa28 0%, #ec8a39 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      fontWeight: 'bold',
      color: '#888888',
      transform: 'translate(0.03em, 0.03em)',
    },
  },
  // 9. Purple gradient with stroke and blue shadow
  {
    id: 'style-nine',
    name: 'Amethyst',
    wrapperStyle: { transform: 'skew(0, -10deg) scale(1, 1.5)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      backgroundImage: 'linear-gradient(to bottom, #6B21A8 0%, #C084FC 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      WebkitTextStroke: '0.01em #9333EA',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#1e3a8a',
      transform: 'translate(0.04em, 0.04em)',
    },
  },
  // 10. Green with lighter green enlarged shadow
  {
    id: 'style-ten',
    name: 'Forest',
    wrapperStyle: { transform: 'scale(1, 1.2)' },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#166534',
      letterSpacing: '0.02em',
    },
    shadowStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#86efac',
      letterSpacing: '0.02em',
      transform: 'translate(0.04em, 0.04em) scale(1.03)',
    },
  },
  // 11. Rainbow gradient with 3D perspective shadow
  {
    id: 'style-eleven',
    name: 'Rainbow',
    wrapperStyle: { transform: 'scale(1, 1.5)' },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundImage: 'linear-gradient(to right, #b306a9, #ef2667, #f42e2c, #ffa509, #fdfc00, #55ac2f, #0b13fd, #a804af)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.01em',
    },
    shadowStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: 'rgba(50, 50, 50, 0.3)',
      letterSpacing: '-0.01em',
      transform: 'translate(0.03em, 0.06em) skewX(-5deg)',
    },
  },
  // 12. Teal-blue gradient with light shadow (Horizon)
  {
    id: 'style-twelve',
    name: 'Horizon',
    wrapperStyle: {},
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundImage: 'linear-gradient(to bottom, #7286a7 0%, #7286a7 13%, #ffffff 50%, #812f30 56%, #ffffff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#161616',
      transform: 'translate(0.02em, 0.02em)',
    },
  },
  // 13. Brown with extruded dark shadow
  {
    id: 'style-thirteen',
    name: 'Espresso',
    wrapperStyle: { transform: 'scale(1, 1.3)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#8B4513',
      letterSpacing: '0.03em',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      letterSpacing: '0.03em',
      color: '#3D1C02',
      textShadow: '0.01em 0.01em 0 #3D1C02, 0.02em 0.02em 0 #3D1C02, 0.03em 0.03em 0 #3D1C02, 0.04em 0.04em 0 #3D1C02, 0.05em 0.05em 0 #3D1C02',
    },
  },
  // 14. Pink-cream gradient with blue 3D extrusion (Sunset)
  {
    id: 'style-fourteen',
    name: 'Sunset',
    wrapperStyle: { transform: 'scale(1, 1.2)' },
    textStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      backgroundImage: 'linear-gradient(to bottom, #f5e6c8 0%, #d4848c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: "'Times New Roman', Times, serif",
      color: '#1a237e',
      textShadow: '0.01em 0.01em 0 #1a237e, 0.02em 0.02em 0 #1a237e, 0.03em 0.03em 0 #283593, 0.04em 0.04em 0 #283593',
    },
  },
  // 15. Brown-gold gradient, perspective tilt (Tilt)
  {
    id: 'style-fifteen',
    name: 'Tilt',
    wrapperStyle: {
      transform: 'scaleY(2) perspective(1em) rotateX(15deg)',
    },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      backgroundImage: 'linear-gradient(to bottom, #390c0b 0%, #f6bf28 73%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      letterSpacing: '-0.01em',
      WebkitTextStroke: '0.01em #A3A3A3',
    },
    shadowStyle: {
      fontFamily: 'Arial, sans-serif',
      letterSpacing: '-0.01em',
      color: '#6D4916',
      transform: 'perspective(1em) rotateX(65deg) scale(0.77)',
      transformOrigin: 'top center',
    },
  },
  // 16. Cyan with blue stroke and shadow
  {
    id: 'style-sixteen',
    name: 'Aqua',
    wrapperStyle: {},
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#00e5ff',
      WebkitTextStroke: '0.02em #0077b6',
      textShadow: '0.04em 0.04em 0 #023e8a',
      letterSpacing: '0.01em',
    },
  },
  // 17. Striped yellow pattern with black stroke
  {
    id: 'style-seventeen',
    name: 'Caution',
    wrapperStyle: { transform: 'scale(1, 1.3)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      backgroundImage: 'repeating-linear-gradient(45deg, #FFD700 0px, #FFD700 10px, #FF8C00 10px, #FF8C00 20px)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      WebkitTextStroke: '0.02em #000000',
    },
  },
  // 18. Chrome/silver multi-stop gradient with 3D extrusion
  {
    id: 'style-eighteen',
    name: 'Chrome',
    wrapperStyle: { transform: 'scaleY(1.4)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      backgroundImage: 'linear-gradient(to bottom, #e8e8e8 0%, #9e9e9e 25%, #ffffff 50%, #9e9e9e 75%, #e8e8e8 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#555555',
      textShadow: '0.01em 0.01em 0 #555, 0.02em 0.02em 0 #555, 0.03em 0.03em 0 #444, 0.04em 0.04em 0 #444, 0.05em 0.05em 0 #333',
    },
  },
  // 19. Dark green, perspective rotation with green extrusion
  {
    id: 'style-nineteen',
    name: 'Emerald',
    wrapperStyle: {
      transform: 'perspective(500px) rotateY(-15deg) scale(1, 1.2)',
    },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#064e3b',
      letterSpacing: '0.03em',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      letterSpacing: '0.03em',
      color: '#059669',
      textShadow: '0.01em 0.01em 0 #059669, 0.02em 0.02em 0 #059669, 0.03em 0.03em 0 #10b981, 0.04em 0.04em 0 #10b981',
    },
  },
  // 20. Silver gradient, perspective tilt with olive extrusion
  {
    id: 'style-twenty',
    name: 'Titanium',
    wrapperStyle: {
      transform: 'perspective(500px) rotateX(10deg) scaleY(1.3)',
    },
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      backgroundImage: 'linear-gradient(to bottom, #d4d4d4 0%, #a3a3a3 50%, #d4d4d4 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      color: '#6b7a2e',
      textShadow: '0.01em 0.01em 0 #6b7a2e, 0.02em 0.02em 0 #6b7a2e, 0.03em 0.03em 0 #556320, 0.04em 0.04em 0 #556320',
    },
  },
  // 21. Yellow-to-red fire gradient, skewed with orange extrusion (Superhero)
  {
    id: 'style-twentyone',
    name: 'Superhero',
    wrapperStyle: { transform: 'skew(0, -15deg) scale(1, 1.5)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      backgroundImage: 'linear-gradient(to bottom, #fdea00 0%, #fdcf00 44%, #fc2700 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#802700',
      textShadow: '0.01em 0.01em 0 #802700, 0.02em 0.02em 0 #c23d00, 0.03em 0.03em 0 #802700, 0.04em 0.04em 0 #c23d00, 0.05em 0.05em 0 #802700, 0.06em 0.06em 0 #c23d00, 0.07em 0.07em 0 #802700, 0.08em 0.08em 0 #c23d00',
    },
  },
  // 22. Blue-to-red split gradient with black/silver extrusion
  {
    id: 'style-twentytwo',
    name: 'Inferno',
    wrapperStyle: { transform: 'scale(1, 1.4)' },
    textStyle: {
      fontFamily: 'Impact, sans-serif',
      backgroundImage: 'linear-gradient(to right, #1e40af 0%, #7c3aed 50%, #dc2626 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    shadowStyle: {
      fontFamily: 'Impact, sans-serif',
      color: '#1a1a1a',
      textShadow: '0.01em 0.01em 0 #1a1a1a, 0.02em 0.02em 0 #333, 0.03em 0.03em 0 #1a1a1a, 0.04em 0.04em 0 #555, 0.05em 0.05em 0 #1a1a1a',
    },
  },
]

/** Returns a random word art style ID */
export function getRandomWordArtStyle(): string {
  const index = Math.floor(Math.random() * WORD_ART_STYLES.length)
  return WORD_ART_STYLES[index].id
}

/** Looks up a word art style by ID, returns first style as fallback */
export function getWordArtStyle(id: string): WordArtStyle {
  return WORD_ART_STYLES.find(s => s.id === id) ?? WORD_ART_STYLES[0]
}
