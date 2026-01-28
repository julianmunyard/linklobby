import {
  Inter,
  Poppins,
  Playfair_Display,
  Montserrat,
  Roboto,
  Open_Sans,
  Bebas_Neue,
  Oswald,
  Archivo_Black,
  Space_Grotesk,
  DM_Sans,
  Outfit,
  Plus_Jakarta_Sans,
  Sora,
  Urbanist,
} from 'next/font/google'

// Variable fonts (single file, all weights)
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
  display: 'swap',
})

export const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

export const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-archivo-black',
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

export const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
  display: 'swap',
})

// Combine all font variables for layout className
export const fontVariables = [
  inter.variable,
  poppins.variable,
  playfairDisplay.variable,
  montserrat.variable,
  roboto.variable,
  openSans.variable,
  bebasNeue.variable,
  oswald.variable,
  archivoBlack.variable,
  spaceGrotesk.variable,
  dmSans.variable,
  outfit.variable,
  plusJakartaSans.variable,
  sora.variable,
  urbanist.variable,
].join(' ')

// Font registry for UI font picker
export const CURATED_FONTS = [
  { id: 'inter', name: 'Inter', variable: 'var(--font-inter)', category: 'sans' as const },
  { id: 'poppins', name: 'Poppins', variable: 'var(--font-poppins)', category: 'sans' as const },
  { id: 'playfair', name: 'Playfair Display', variable: 'var(--font-playfair)', category: 'serif' as const },
  { id: 'montserrat', name: 'Montserrat', variable: 'var(--font-montserrat)', category: 'sans' as const },
  { id: 'roboto', name: 'Roboto', variable: 'var(--font-roboto)', category: 'sans' as const },
  { id: 'open-sans', name: 'Open Sans', variable: 'var(--font-open-sans)', category: 'sans' as const },
  { id: 'bebas-neue', name: 'Bebas Neue', variable: 'var(--font-bebas-neue)', category: 'display' as const },
  { id: 'oswald', name: 'Oswald', variable: 'var(--font-oswald)', category: 'display' as const },
  { id: 'archivo-black', name: 'Archivo Black', variable: 'var(--font-archivo-black)', category: 'display' as const },
  { id: 'space-grotesk', name: 'Space Grotesk', variable: 'var(--font-space-grotesk)', category: 'sans' as const },
  { id: 'dm-sans', name: 'DM Sans', variable: 'var(--font-dm-sans)', category: 'sans' as const },
  { id: 'outfit', name: 'Outfit', variable: 'var(--font-outfit)', category: 'sans' as const },
  { id: 'jakarta', name: 'Plus Jakarta Sans', variable: 'var(--font-jakarta)', category: 'sans' as const },
  { id: 'sora', name: 'Sora', variable: 'var(--font-sora)', category: 'sans' as const },
  { id: 'urbanist', name: 'Urbanist', variable: 'var(--font-urbanist)', category: 'sans' as const },
] as const

export type FontId = typeof CURATED_FONTS[number]['id']
export type FontCategory = 'sans' | 'serif' | 'display'
