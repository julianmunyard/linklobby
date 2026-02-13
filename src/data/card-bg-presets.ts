export interface CardBgPreset {
  id: string
  name: string
  url: string       // public path
  thumbnail?: string // optional smaller thumbnail (falls back to url)
}

export const CARD_BG_PRESETS: CardBgPreset[] = [
  { id: 'cd-holographic', name: 'CD Holographic', url: '/card-backgrounds/cd-holographic.gif' },
  { id: 'grid-earth', name: 'Grid Earth', url: '/card-backgrounds/grid-earth.gif' },
  { id: 'green-orbits', name: 'Green Orbits', url: '/card-backgrounds/green-orbits.gif' },
  { id: 'demodulate', name: 'Demodulate', url: '/card-backgrounds/demodulate.gif' },
  { id: 'star-grid', name: 'Star Grid', url: '/card-backgrounds/star-grid.gif' },
  { id: 'retro-broadcast', name: 'Retro Broadcast', url: '/card-backgrounds/retro-broadcast.gif' },
]
