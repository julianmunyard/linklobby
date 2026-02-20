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
  // Retro/Pixel
  VT323,
  Courier_Prime,
  // Classified theme
  Special_Elite,
  // Artifact theme
  Space_Mono,
  // Chaotic Zine theme
  Permanent_Marker,
  Abril_Fatface,
  Bangers,
  Rock_Salt,
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

// Macintosh theme fonts (Google Fonts)
export const vt323 = VT323({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vt323',
  display: 'swap',
})

export const courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier-prime',
  display: 'swap',
})

// Classified theme font
export const specialElite = Special_Elite({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-special-elite',
  display: 'swap',
})

// Chaotic Zine theme fonts
export const permanentMarker = Permanent_Marker({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-permanent-marker',
  display: 'swap',
})

export const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-abril-fatface',
  display: 'swap',
})

export const bangers = Bangers({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bangers',
  display: 'swap',
})

export const rockSalt = Rock_Salt({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rock-salt',
  display: 'swap',
})

// Artifact theme font
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

// Departures Board theme font
export const auxMono = localFont({
  src: '../../public/fonts/AuxMono-Regular.ttf',
  variable: '--font-aux-mono',
  display: 'swap',
})

// LED Board theme font
export const ledDotMatrix = localFont({
  src: '../../public/fonts/led-dot-matrix.ttf',
  variable: '--font-led-dot-matrix',
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

// Chicago font for iPod
export const chicago = localFont({
  src: '../../public/fonts/chicago.ttf',
  variable: '--font-chicago',
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
  chicago.variable,
  // Receipt fonts
  ticketDeCaisse.variable,
  hypermarket.variable,
  // Macintosh fonts
  vt323.variable,
  courierPrime.variable,
  // Classified font
  specialElite.variable,
  // Departures Board fonts
  auxMono.variable,
  ledDotMatrix.variable,
  // Artifact theme font
  spaceMono.variable,
  // Chaotic Zine fonts
  permanentMarker.variable,
  abrilFatface.variable,
  bangers.variable,
  rockSalt.variable,
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
  { id: 'chicago', name: 'Chicago', variable: 'var(--font-chicago)', category: 'retro' as const },
  { id: 'ticket-de-caisse', name: 'Ticket De Caisse', variable: 'var(--font-ticket-de-caisse)', category: 'retro' as const },
  { id: 'hypermarket', name: 'Hypermarket', variable: 'var(--font-hypermarket)', category: 'retro' as const },
  { id: 'vt323', name: 'VT323', variable: 'var(--font-vt323)', category: 'retro' as const },
  { id: 'courier-prime', name: 'Courier Prime', variable: 'var(--font-courier-prime)', category: 'retro' as const },
  { id: 'special-elite', name: 'Special Elite', variable: 'var(--font-special-elite)', category: 'retro' as const },
  { id: 'aux-mono', name: 'Aux Mono', variable: 'var(--font-aux-mono)', category: 'retro' as const },
  { id: 'led-dot-matrix', name: 'LED Dot Matrix', variable: 'var(--font-led-dot-matrix)', category: 'retro' as const },
  // Artifact theme font
  { id: 'space-mono', name: 'Space Mono', variable: 'var(--font-space-mono)', category: 'retro' as const },
  // Chaotic Zine fonts
  { id: 'permanent-marker', name: 'Permanent Marker', variable: 'var(--font-permanent-marker)', category: 'display' as const },
  { id: 'abril-fatface', name: 'Abril Fatface', variable: 'var(--font-abril-fatface)', category: 'display' as const },
  { id: 'bangers', name: 'Bangers', variable: 'var(--font-bangers)', category: 'display' as const },
  { id: 'rock-salt', name: 'Rock Salt', variable: 'var(--font-rock-salt)', category: 'display' as const },
] as const

export type FontId = typeof CURATED_FONTS[number]['id']
export type FontCategory = 'sans' | 'serif' | 'display' | 'retro'

/**
 * Server-side font resolver: maps CSS variable references to actual font-family values.
 * Used by ThemeInjector to inline resolved fonts so public pages don't need
 * client-side resolution (no double-indirection through CSS variables).
 */
export const FONT_FAMILY_MAP: Record<string, string> = {
  'var(--font-geist-sans)': inter.style.fontFamily,
  'var(--font-inter)': inter.style.fontFamily,
  'var(--font-jakarta)': plusJakartaSans.style.fontFamily,
  'var(--font-sora)': sora.style.fontFamily,
  'var(--font-space-grotesk)': spaceGrotesk.style.fontFamily,
  'var(--font-dm-sans)': dmSans.style.fontFamily,
  'var(--font-outfit)': outfit.style.fontFamily,
  'var(--font-manrope)': manrope.style.fontFamily,
  'var(--font-josefin)': josefinSans.style.fontFamily,
  'var(--font-playfair)': playfairDisplay.style.fontFamily,
  'var(--font-cormorant)': cormorantGaramond.style.fontFamily,
  'var(--font-instrument)': instrumentSerif.style.fontFamily,
  'var(--font-fraunces)': fraunces.style.fontFamily,
  'var(--font-bebas-neue)': bebasNeue.style.fontFamily,
  'var(--font-archivo-black)': archivoBlack.style.fontFamily,
  'var(--font-syne)': syne.style.fontFamily,
  'var(--font-krona)': kronaOne.style.fontFamily,
  'var(--font-auto-mission)': autoMission.style.fontFamily,
  'var(--font-new-york)': newYork.style.fontFamily,
  'var(--font-pix-chicago)': pixChicago.style.fontFamily,
  'var(--font-village)': village.style.fontFamily,
  'var(--font-chikarego)': chiKareGo.style.fontFamily,
  'var(--font-ishmeria)': ishmeria.style.fontFamily,
  'var(--font-pixolde)': pixolde.style.fontFamily,
  'var(--font-pixter-granular)': pixterGranular.style.fontFamily,
  'var(--font-chiq)': chiqReducedBold.style.fontFamily,
  'var(--font-chicago)': chicago.style.fontFamily,
  'var(--font-ticket-de-caisse)': ticketDeCaisse.style.fontFamily,
  'var(--font-hypermarket)': hypermarket.style.fontFamily,
  'var(--font-vt323)': vt323.style.fontFamily,
  'var(--font-courier-prime)': courierPrime.style.fontFamily,
  'var(--font-special-elite)': specialElite.style.fontFamily,
  'var(--font-aux-mono)': auxMono.style.fontFamily,
  'var(--font-led-dot-matrix)': ledDotMatrix.style.fontFamily,
  'var(--font-space-mono)': spaceMono.style.fontFamily,
  'var(--font-permanent-marker)': permanentMarker.style.fontFamily,
  'var(--font-abril-fatface)': abrilFatface.style.fontFamily,
  'var(--font-bangers)': bangers.style.fontFamily,
  'var(--font-rock-salt)': rockSalt.style.fontFamily,
}

/** Resolve a font variable reference to its actual font-family value */
export function resolveFontFamily(varRef: string): string {
  return FONT_FAMILY_MAP[varRef] ?? varRef
}
