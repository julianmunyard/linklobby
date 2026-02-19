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
  { id: 'neon-wine', name: 'Neon Wine', url: '/card-backgrounds/neon-wine.gif' },
  { id: 'red-clock', name: 'Red Clock', url: '/card-backgrounds/red-clock.gif' },
  { id: 'blue-martini', name: 'Blue Martini', url: '/card-backgrounds/blue-martini.gif' },
  { id: 'city-lights', name: 'City Lights', url: '/card-backgrounds/city-lights.gif' },
  { id: 'moonlit-towers', name: 'Moonlit Towers', url: '/card-backgrounds/moonlit-towers.gif' },
  { id: 'night-highway', name: 'Night Highway', url: '/card-backgrounds/night-highway.gif' },
  { id: 'disco-vision', name: 'Disco Vision', url: '/card-backgrounds/toothmarket.gif' },
  { id: 'vhs-computer', name: 'VHS Computer', url: '/card-backgrounds/vhs-computer.gif' },
  { id: 'glow-figure', name: 'Glow Figure', url: '/card-backgrounds/glow-figure.gif' },
  { id: 'divine-touch', name: 'Divine Touch', url: '/card-backgrounds/divine-touch.gif' },
  { id: 'cloud-walker', name: 'Cloud Walker', url: '/card-backgrounds/cloud-walker.gif' },
  { id: 'red-lips', name: 'Red Lips', url: '/card-backgrounds/red-lips.gif' },
  { id: 'neon-star', name: 'Neon Star', url: '/card-backgrounds/neon-star.gif' },
  { id: 'retro-cocktail', name: 'Retro Cocktail', url: '/card-backgrounds/retro-cocktail.gif' },
]
