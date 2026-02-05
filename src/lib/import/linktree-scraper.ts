// src/lib/import/linktree-scraper.ts
import axios from 'axios'
import * as cheerio from 'cheerio'
import { LinktreeDataSchema, type LinktreePageProps } from '@/types/linktree'

// Normalize user input to username
export function normalizeLinktreeInput(input: string): string {
  const cleaned = input.trim()

  // If it's a URL, extract username
  if (cleaned.includes('linktr.ee/') || cleaned.includes('linktree.com/')) {
    const match = cleaned.match(/linktr\.ee\/([^/?#]+)|linktree\.com\/([^/?#]+)/)
    if (match) return match[1] || match[2]
  }

  // Remove @ prefix if present, return as username
  return cleaned.replace(/^@/, '')
}

// Custom error types for clear user feedback
export class LinktreeNotFoundError extends Error {
  constructor(username: string) {
    super(`This Linktree page is private or doesn't exist. Check the username: "${username}"`)
    this.name = 'LinktreeNotFoundError'
  }
}

export class LinktreeEmptyError extends Error {
  constructor() {
    super('No links found on this Linktree. Add some links manually instead.')
    this.name = 'LinktreeEmptyError'
  }
}

export class LinktreeFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LinktreeFetchError'
  }
}

// Scrape Linktree profile and return parsed data
export async function scrapeLinktreeProfile(input: string): Promise<LinktreePageProps> {
  const username = normalizeLinktreeInput(input)
  const url = `https://linktr.ee/${username}`

  console.log('[LinktreeScraper] Normalized username:', username)
  console.log('[LinktreeScraper] Fetching URL:', url)

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500, // Don't throw on 4xx
    })

    // Check for 404/redirect to home (profile not found)
    if (response.status === 404 || response.request?.responseURL === 'https://linktr.ee/') {
      throw new LinktreeNotFoundError(username)
    }

    console.log('[LinktreeScraper] Response status:', response.status)

    // Parse HTML and extract __NEXT_DATA__
    const $ = cheerio.load(response.data)
    const nextDataScript = $('#__NEXT_DATA__').html()

    if (!nextDataScript) {
      console.error('[LinktreeScraper] No __NEXT_DATA__ found in page')
      throw new LinktreeNotFoundError(username)
    }

    console.log('[LinktreeScraper] Found __NEXT_DATA__, parsing...')

    // Parse and validate JSON
    const rawData = JSON.parse(nextDataScript)
    console.log('[LinktreeScraper] Raw data keys:', Object.keys(rawData))
    console.log('[LinktreeScraper] pageProps keys:', rawData?.props?.pageProps ? Object.keys(rawData.props.pageProps) : 'none')

    const validated = LinktreeDataSchema.safeParse(rawData)

    if (!validated.success) {
      console.error('[LinktreeScraper] Validation failed:', JSON.stringify(validated.error.issues, null, 2))
      throw new LinktreeFetchError('Unable to parse Linktree page. The page structure may have changed.')
    }

    console.log('[LinktreeScraper] Validation passed, links count:', validated.data.props.pageProps.links?.length)

    const pageProps = validated.data.props.pageProps

    // Sort links by position field (Linktree's display order)
    const sortByPosition = (links: typeof pageProps.links): typeof pageProps.links => {
      return [...links].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    }

    // Flatten links, keeping headers/groups as section dividers
    const flattenLinks = (links: typeof pageProps.links): typeof pageProps.links => {
      // Sort by position first to ensure correct display order
      const sortedLinks = sortByPosition(links)
      const result: typeof pageProps.links = []

      for (const link of sortedLinks) {
        // Keep HEADER and GROUP links as section dividers (they become text cards)
        // Linktree uses both 'HEADER' and 'GROUP' for section dividers
        if ((link.type === 'HEADER' || link.type === 'GROUP') && link.title) {
          console.log(`[LinktreeScraper] Found header/group: "${link.title}" (type: ${link.type})`)
          result.push({
            ...link,
            type: 'HEADER', // Normalize to HEADER for our mapper
            url: '', // Headers don't have URLs
          })
          continue
        }

        // If this link has nested links, extract them recursively
        if (link.links && Array.isArray(link.links) && link.links.length > 0) {
          console.log(`[LinktreeScraper] Found nested group "${link.title}" with ${link.links.length} nested links`)
          // Add the group title as a header if it has a title
          if (link.title) {
            result.push({
              ...link,
              type: 'HEADER',
              url: '',
              links: undefined,
            })
          }
          // Recursively flatten nested links
          result.push(...flattenLinks(link.links))
          continue
        }

        // Add clickable links (has URL, not locked)
        if (link.url && !link.locked) {
          result.push(link)
        }
      }

      return result
    }

    const allLinks = flattenLinks(pageProps.links)
    const clickableLinks = allLinks.filter(l => l.url && l.type !== 'HEADER')
    const headerCount = allLinks.filter(l => l.type === 'HEADER').length
    console.log(`[LinktreeScraper] Total links: ${allLinks.length} (${clickableLinks.length} clickable, ${headerCount} headers)`)

    if (clickableLinks.length === 0) {
      throw new LinktreeEmptyError()
    }

    return {
      ...pageProps,
      links: allLinks, // Include headers as well as clickable links
    }
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof LinktreeNotFoundError ||
        error instanceof LinktreeEmptyError ||
        error instanceof LinktreeFetchError) {
      throw error
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new LinktreeFetchError('Request timed out. Please try again.')
      }
      if (error.response?.status === 429) {
        throw new LinktreeFetchError('Too many requests. Please wait a moment and try again.')
      }
      throw new LinktreeFetchError('Failed to fetch Linktree page. Please check your connection.')
    }

    // Unknown error
    console.error('Unexpected error scraping Linktree:', error)
    throw new LinktreeFetchError('An unexpected error occurred. Please try again.')
  }
}
