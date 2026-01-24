// src/lib/import/layout-generator.ts
import type { CardType, CardSize } from '@/types/card'

export interface LayoutItem {
  type: CardType
  size: CardSize
}

// Define rhythm patterns - creates visual variety
// Each pattern is designed for visual balance and "this is different" feeling
const LAYOUT_PATTERNS: LayoutItem[][] = [
  // Pattern A: Hero + 2 small squares (dramatic opener)
  [
    { type: 'hero', size: 'big' },
    { type: 'square', size: 'small' },
    { type: 'square', size: 'small' },
  ],
  // Pattern B: Horizontal + big square (balanced)
  [
    { type: 'horizontal', size: 'big' },
    { type: 'square', size: 'big' },
  ],
  // Pattern C: 2 small squares + horizontal (rhythm change)
  [
    { type: 'square', size: 'small' },
    { type: 'square', size: 'small' },
    { type: 'horizontal', size: 'big' },
  ],
  // Pattern D: Hero small + square small + horizontal (variety)
  [
    { type: 'hero', size: 'small' },
    { type: 'square', size: 'small' },
    { type: 'horizontal', size: 'big' },
  ],
  // Pattern E: Big square + 2 small squares (grid feel)
  [
    { type: 'square', size: 'big' },
    { type: 'square', size: 'small' },
    { type: 'square', size: 'small' },
  ],
]

/**
 * Generate a layout pattern for N links.
 * Cycles through patterns to create visual rhythm.
 * Returns array of LayoutItems matching the link count.
 */
export function generateLayoutPattern(linkCount: number): LayoutItem[] {
  if (linkCount === 0) return []

  const result: LayoutItem[] = []
  let patternIndex = 0

  while (result.length < linkCount) {
    const pattern = LAYOUT_PATTERNS[patternIndex % LAYOUT_PATTERNS.length]

    // Add items from current pattern until we have enough
    for (const item of pattern) {
      if (result.length >= linkCount) break
      result.push({ ...item }) // Clone to avoid mutation
    }

    patternIndex++
  }

  return result.slice(0, linkCount)
}

/**
 * Generate layout with slight randomization to avoid predictability.
 * Shuffles the starting pattern index based on link count.
 */
export function generateLayoutPatternRandomized(linkCount: number): LayoutItem[] {
  if (linkCount === 0) return []

  // Use a deterministic "random" start based on link count
  // This ensures same count = same layout (predictable for testing)
  // but different counts get different feels
  const startIndex = linkCount % LAYOUT_PATTERNS.length

  const result: LayoutItem[] = []
  let patternIndex = startIndex

  while (result.length < linkCount) {
    const pattern = LAYOUT_PATTERNS[patternIndex % LAYOUT_PATTERNS.length]

    for (const item of pattern) {
      if (result.length >= linkCount) break
      result.push({ ...item })
    }

    patternIndex++
  }

  return result.slice(0, linkCount)
}
