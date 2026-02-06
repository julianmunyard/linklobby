import type { Card } from '@/types/card'
import { generateAppendKey } from '@/lib/ordering'

interface MacLink {
  title: string
  url: string
}

/**
 * Migrate cards when switching TO the Macintosh theme.
 * - Collects URLs from visible non-mac cards into a notepad's macLinks
 * - Auto-creates calculator and map cards
 * - Hides original cards (tagged so they can be restored later)
 */
export function migrateToMacintosh(cards: Card[]): Card[] {
  const now = new Date().toISOString()
  const result = cards.map((c) => ({ ...c }))

  // Collect links and titles from visible non-mac cards
  const macLinks: MacLink[] = []
  for (let i = 0; i < result.length; i++) {
    const c = result[i]
    const hasMacStyle = !!(c.content as Record<string, unknown>)?.macWindowStyle
    if (c.is_visible && !hasMacStyle && (c.url || c.title)) {
      macLinks.push({ title: c.title || '', url: c.url || '' })
      // Hide and tag for later restoration
      result[i] = {
        ...c,
        is_visible: false,
        content: { ...c.content, _hiddenForMac: true },
        updated_at: now,
      }
    }
  }

  // Create notepad if we have links (or if no notepad exists yet)
  const hasNotepad = result.some(
    (c) => (c.content as Record<string, unknown>)?.macWindowStyle === 'notepad' && c.is_visible
  )
  if (macLinks.length > 0 || !hasNotepad) {
    // Check for a hidden notepad we can reuse
    const hiddenNotepadIdx = result.findIndex(
      (c) =>
        (c.content as Record<string, unknown>)?.macWindowStyle === 'notepad' && !c.is_visible
    )
    if (hiddenNotepadIdx >= 0) {
      const existing = result[hiddenNotepadIdx]
      const existingLinks =
        ((existing.content as Record<string, unknown>)?.macLinks as MacLink[]) || []
      result[hiddenNotepadIdx] = {
        ...existing,
        is_visible: true,
        content: {
          ...existing.content,
          macLinks: [...existingLinks, ...macLinks],
        },
        updated_at: now,
      }
    } else if (macLinks.length > 0) {
      result.push({
        id: crypto.randomUUID(),
        page_id: '',
        card_type: 'hero',
        title: null,
        description: null,
        url: null,
        content: { macWindowStyle: 'notepad', macLinks },
        size: 'big',
        position: 'left',
        sortKey: generateAppendKey(result),
        is_visible: true,
        created_at: now,
        updated_at: now,
      })
    }
  }

  // Auto-create calculator if not present
  const hasCalc = result.some(
    (c) => (c.content as Record<string, unknown>)?.macWindowStyle === 'calculator'
  )
  if (!hasCalc) {
    result.push({
      id: crypto.randomUUID(),
      page_id: '',
      card_type: 'hero',
      title: null,
      description: null,
      url: null,
      content: { macWindowStyle: 'calculator' },
      size: 'big',
      position: 'left',
      sortKey: generateAppendKey(result),
      is_visible: true,
      created_at: now,
      updated_at: now,
    })
  } else {
    // Unhide existing calculator
    for (let i = 0; i < result.length; i++) {
      if (
        (result[i].content as Record<string, unknown>)?.macWindowStyle === 'calculator' &&
        !result[i].is_visible
      ) {
        result[i] = { ...result[i], is_visible: true, updated_at: now }
      }
    }
  }

  // Auto-create map if not present
  const hasMap = result.some(
    (c) => (c.content as Record<string, unknown>)?.macWindowStyle === 'map'
  )
  if (!hasMap) {
    result.push({
      id: crypto.randomUUID(),
      page_id: '',
      card_type: 'hero',
      title: null,
      description: null,
      url: null,
      content: { macWindowStyle: 'map' },
      size: 'big',
      position: 'left',
      sortKey: generateAppendKey(result),
      is_visible: true,
      created_at: now,
      updated_at: now,
    })
  } else {
    // Unhide existing map
    for (let i = 0; i < result.length; i++) {
      if (
        (result[i].content as Record<string, unknown>)?.macWindowStyle === 'map' &&
        !result[i].is_visible
      ) {
        result[i] = { ...result[i], is_visible: true, updated_at: now }
      }
    }
  }

  // Unhide any other existing mac cards (small-window, large-window, title-link)
  for (let i = 0; i < result.length; i++) {
    const style = (result[i].content as Record<string, unknown>)?.macWindowStyle as
      | string
      | undefined
    if (style && !result[i].is_visible) {
      result[i] = { ...result[i], is_visible: true, updated_at: now }
    }
  }

  return result
}

/**
 * Migrate cards when switching FROM the Macintosh theme.
 * - Restores cards that were hidden when switching TO macintosh
 * - Extracts new links from notepad/windows into link cards
 * - Hides mac-specific cards
 */
export function migrateFromMacintosh(cards: Card[]): Card[] {
  const now = new Date().toISOString()
  const result = cards.map((c) => ({ ...c }))

  // 1. Restore hidden-for-mac cards and track their URLs
  const restoredUrls = new Set<string>()
  for (let i = 0; i < result.length; i++) {
    const c = result[i]
    if ((c.content as Record<string, unknown>)?._hiddenForMac) {
      const { _hiddenForMac, ...restContent } = c.content as Record<string, unknown>
      result[i] = {
        ...c,
        is_visible: true,
        content: restContent,
        updated_at: now,
      }
      if (c.url) restoredUrls.add(c.url)
    }
  }

  // 2. Collect new URLs from mac cards that don't match restored originals
  const newLinks: MacLink[] = []

  for (const c of result) {
    const style = (c.content as Record<string, unknown>)?.macWindowStyle as string | undefined
    if (!style) continue

    if (style === 'notepad') {
      const macLinks =
        ((c.content as Record<string, unknown>)?.macLinks as MacLink[]) || []
      for (const link of macLinks) {
        if (link.url && !restoredUrls.has(link.url)) {
          newLinks.push(link)
          restoredUrls.add(link.url)
        }
      }
    } else if (['small-window', 'large-window', 'title-link'].includes(style)) {
      if (c.url && !restoredUrls.has(c.url)) {
        newLinks.push({ title: c.title || '', url: c.url })
        restoredUrls.add(c.url)
      }
    }
  }

  // 3. Create link cards for genuinely new URLs
  for (const link of newLinks) {
    result.push({
      id: crypto.randomUUID(),
      page_id: '',
      card_type: 'link',
      title: link.title || null,
      description: null,
      url: link.url,
      content: { textAlign: 'center', verticalAlign: 'middle' },
      size: 'big',
      position: 'left',
      sortKey: generateAppendKey(result),
      is_visible: true,
      created_at: now,
      updated_at: now,
    })
  }

  // 4. Hide all mac-specific cards
  for (let i = 0; i < result.length; i++) {
    const style = (result[i].content as Record<string, unknown>)?.macWindowStyle as
      | string
      | undefined
    if (style && result[i].is_visible) {
      result[i] = { ...result[i], is_visible: false, updated_at: now }
    }
  }

  return result
}
