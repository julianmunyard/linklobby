// src/lib/templates/index.ts
// Template registry — lookup helpers for all template definitions.

import type { TemplateDefinition } from './types'
import type { ThemeId } from '@/types/theme'
import { phoneHomeMclovinsIphone } from './data/phone-home/mclovins-iphone'

import { chaoticZineOG } from './data/chaotic-zine/o-g'

import { instagramReelsCards } from './data/instagram-reels/cards'

import { instagramReelsYellowBrown } from './data/instagram-reels/yellow-brown'

import { instagramReelsRedAndBlueHero } from './data/instagram-reels/red-and-blue-hero'

import { instagramReelsCdeez } from './data/instagram-reels/cdeez'

import { macOsMyMac } from './data/mac-os/my-mac'

import { systemSettingsMakeItRed } from './data/system-settings/make-it-red'

import { systemSettingsLinksOnAPage } from './data/system-settings/links-on-a-page'

import { systemSettingsQuiteBeskoke } from './data/system-settings/quite-beskoke'

import { systemSettingsSpreadThemOut } from './data/system-settings/spread-them-out'

import { blinkiesBlinkies } from './data/blinkies/blinkies'

import { blinkiesMakeItRed } from './data/blinkies/make-it-red'

import { blinkiesBlinkOnce } from './data/blinkies/blink-once'

import { vcrMenuHomeVideo } from './data/vcr-menu/home-video'

import { ipodClassicYourIpod } from './data/ipod-classic/your-ipod'

import { macintosh84Tosh } from './data/macintosh/84-tosh'

import { macintosh84Macintosh } from './data/macintosh/84-macintosh'

import { wordArtJustWordArt } from './data/word-art/just-word-art'

import { phoneHomeWindowsPhone } from './data/phone-home/windows-phone'

import { chaoticZineSimpleNew } from './data/chaotic-zine/simple-new'

import { artifactBrutal } from './data/artifact/brutal'

import { phoneHomeBurple } from './data/phone-home/burple'

const ALL_TEMPLATES: TemplateDefinition[] = [
  phoneHomeMclovinsIphone,
  chaoticZineOG,
  instagramReelsCards,
  instagramReelsYellowBrown,
  instagramReelsRedAndBlueHero,
  instagramReelsCdeez,
  macOsMyMac,
  systemSettingsMakeItRed,
  systemSettingsLinksOnAPage,
  systemSettingsQuiteBeskoke,
  systemSettingsSpreadThemOut,
  blinkiesBlinkies,
  blinkiesMakeItRed,
  blinkiesBlinkOnce,
  vcrMenuHomeVideo,
  ipodClassicYourIpod,
  macintosh84Tosh,
  macintosh84Macintosh,
  wordArtJustWordArt,
  phoneHomeWindowsPhone,
  chaoticZineSimpleNew,
  artifactBrutal,
  phoneHomeBurple,
]

/**
 * Returns all registered templates.
 */
export function getAllTemplates(): TemplateDefinition[] {
  return ALL_TEMPLATES
}

/**
 * Returns all templates for a given theme ID.
 * Used to populate the template picker when a user is on a specific theme.
 */
export function getTemplatesByTheme(themeId: ThemeId): TemplateDefinition[] {
  return ALL_TEMPLATES.filter(t => t.themeId === themeId)
}

/**
 * Returns a single template by its unique ID, or undefined if not found.
 */
export function getTemplate(id: string): TemplateDefinition | undefined {
  return ALL_TEMPLATES.find(t => t.id === id)
}

// Re-export types for convenience
export type { TemplateDefinition, TemplateCard, TemplateTheme, TemplateProfile } from './types'
