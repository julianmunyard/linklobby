import {
  // System/Classic fonts
  Inter,
  // Boutique Sans-Serif
  Plus_Jakarta_Sans,
  Sora,
  Space_Grotesk,
  DM_Sans,
  Outfit,
  Manrope,
  Josefin_Sans,
  // Boutique Serif
  Playfair_Display,
  Cormorant_Garamond,
  Instrument_Serif,
  Fraunces,
  // Display / Distinctive
  Bebas_Neue,
  Archivo_Black,
  Syne,
  Krona_One,
} from 'next/font/google'
import localFont from 'next/font/local'

// System/Classic fonts
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Boutique Sans-Serif fonts
export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
})

// Boutique Serif fonts
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-instrument',
  display: 'swap',
})

export const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

// Display / Distinctive fonts
export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
  display: 'swap',
})

export const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-archivo-black',
  display: 'swap',
})

export const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

export const kronaOne = Krona_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-krona',
  display: 'swap',
})

// Local custom fonts (retro/pixel style)
export const autoMission = localFont({
  src: '../../public/fonts/auto-mission.otf',
  variable: '--font-auto-mission',
  display: 'swap',
})

export const newYork = localFont({
  src: '../../public/fonts/new-york.ttf',
  variable: '--font-new-york',
  display: 'swap',
})

export const pixChicago = localFont({
  src: '../../public/fonts/pix-chicago.ttf',
  variable: '--font-pix-chicago',
  display: 'swap',
})

export const village = localFont({
  src: '../../public/fonts/village.ttf',
  variable: '--font-village',
  display: 'swap',
})

// Poolsuite-inspired fonts
export const chiKareGo = localFont({
  src: '../../public/fonts/ChiKareGo2.ttf',
  variable: '--font-chikarego',
  display: 'swap',
})

export const ishmeria = localFont({
  src: '../../public/fonts/Ishmeria.otf',
  variable: '--font-ishmeria',
  display: 'swap',
})

export const pixolde = localFont({
  src: '../../public/fonts/Pixolde.ttf',
  variable: '--font-pixolde',
  display: 'swap',
})

export const pixterGranular = localFont({
  src: '../../public/fonts/pixter-granular.ttf',
  variable: '--font-pixter-granular',
  display: 'swap',
})

// iPod Classic font
export const chiqReducedBold = localFont({
  src: '../../public/fonts/chiq-reduced-bold.ttf',
  variable: '--font-chiq',
  display: 'swap',
})

// Receipt theme fonts
export const ticketDeCaisse = localFont({
  src: '../../public/fonts/ticket-de-caisse.ttf',
  variable: '--font-ticket-de-caisse',
  display: 'swap',
})

export const hypermarket = localFont({
  src: '../../public/fonts/hypermarket.woff2',
  variable: '--font-hypermarket',
  display: 'swap',
})

// Combine all font variables for layout className
export const fontVariables = [
  // System/Classic
  inter.variable,
  // Sans-Serif
  plusJakartaSans.variable,
  sora.variable,
  spaceGrotesk.variable,
  dmSans.variable,
  outfit.variable,
  manrope.variable,
  josefinSans.variable,
  // Serif
  playfairDisplay.variable,
  cormorantGaramond.variable,
  instrumentSerif.variable,
  fraunces.variable,
  // Display
  bebasNeue.variable,
  archivoBlack.variable,
  syne.variable,
  kronaOne.variable,
  // Local retro fonts
  autoMission.variable,
  newYork.variable,
  pixChicago.variable,
  village.variable,
  // Poolsuite-inspired fonts
  chiKareGo.variable,
  ishmeria.variable,
  pixolde.variable,
  // VCR/VHS fonts
  pixterGranular.variable,
  // iPod fonts
  chiqReducedBold.variable,
  // Receipt fonts
  ticketDeCaisse.variable,
  hypermarket.variable,
].join(' ')

// Font registry for UI font picker
export const CURATED_FONTS = [
  // System/Classic fonts
  { id: 'inter', name: 'Inter', variable: 'var(--font-inter)', category: 'sans' as const },
  // Boutique Sans-Serif
  { id: 'jakarta', name: 'Plus Jakarta Sans', variable: 'var(--font-jakarta)', category: 'sans' as const },
  { id: 'sora', name: 'Sora', variable: 'var(--font-sora)', category: 'sans' as const },
  { id: 'space-grotesk', name: 'Space Grotesk', variable: 'var(--font-space-grotesk)', category: 'sans' as const },
  { id: 'dm-sans', name: 'DM Sans', variable: 'var(--font-dm-sans)', category: 'sans' as const },
  { id: 'outfit', name: 'Outfit', variable: 'var(--font-outfit)', category: 'sans' as const },
  { id: 'manrope', name: 'Manrope', variable: 'var(--font-manrope)', category: 'sans' as const },
  { id: 'josefin', name: 'Josefin Sans', variable: 'var(--font-josefin)', category: 'sans' as const },
  // Boutique Serif
  { id: 'playfair', name: 'Playfair Display', variable: 'var(--font-playfair)', category: 'serif' as const },
  { id: 'cormorant', name: 'Cormorant Garamond', variable: 'var(--font-cormorant)', category: 'serif' as const },
  { id: 'instrument', name: 'Instrument Serif', variable: 'var(--font-instrument)', category: 'serif' as const },
  { id: 'fraunces', name: 'Fraunces', variable: 'var(--font-fraunces)', category: 'serif' as const },
  // Display / Distinctive
  { id: 'bebas-neue', name: 'Bebas Neue', variable: 'var(--font-bebas-neue)', category: 'display' as const },
  { id: 'archivo-black', name: 'Archivo Black', variable: 'var(--font-archivo-black)', category: 'display' as const },
  { id: 'syne', name: 'Syne', variable: 'var(--font-syne)', category: 'display' as const },
  { id: 'krona', name: 'Krona One', variable: 'var(--font-krona)', category: 'display' as const },
  // Retro/Pixel fonts
  { id: 'auto-mission', name: 'Auto Mission', variable: 'var(--font-auto-mission)', category: 'retro' as const },
  { id: 'new-york', name: 'New York', variable: 'var(--font-new-york)', category: 'retro' as const },
  { id: 'pix-chicago', name: 'Pix Chicago', variable: 'var(--font-pix-chicago)', category: 'retro' as const },
  { id: 'village', name: 'Village', variable: 'var(--font-village)', category: 'retro' as const },
  { id: 'chikarego', name: 'ChiKareGo', variable: 'var(--font-chikarego)', category: 'retro' as const },
  { id: 'ishmeria', name: 'Ishmeria', variable: 'var(--font-ishmeria)', category: 'retro' as const },
  { id: 'pixolde', name: 'Pixolde', variable: 'var(--font-pixolde)', category: 'retro' as const },
  { id: 'pixter-granular', name: 'Pixter Granular', variable: 'var(--font-pixter-granular)', category: 'retro' as const },
  { id: 'chiq', name: 'Chiq', variable: 'var(--font-chiq)', category: 'retro' as const },
  { id: 'ticket-de-caisse', name: 'Ticket De Caisse', variable: 'var(--font-ticket-de-caisse)', category: 'retro' as const },
  { id: 'hypermarket', name: 'Hypermarket', variable: 'var(--font-hypermarket)', category: 'retro' as const },
] as const

export type FontId = typeof CURATED_FONTS[number]['id']
export type FontCategory = 'sans' | 'serif' | 'display' | 'retro'
