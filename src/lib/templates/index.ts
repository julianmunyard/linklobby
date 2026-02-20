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

const ALL_TEMPLATES: TemplateDefinition[] = [
  phoneHomeMclovinsIphone,
  chaoticZineOG,
  instagramReelsCards,
  instagramReelsYellowBrown,
  instagramReelsRedAndBlueHero,
  instagramReelsCdeez,
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
