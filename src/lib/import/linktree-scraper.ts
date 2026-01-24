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

    // Parse HTML and extract __NEXT_DATA__
    const $ = cheerio.load(response.data)
    const nextDataScript = $('#__NEXT_DATA__').html()

    if (!nextDataScript) {
      throw new LinktreeNotFoundError(username)
    }

    // Parse and validate JSON
    const rawData = JSON.parse(nextDataScript)
    const validated = LinktreeDataSchema.safeParse(rawData)

    if (!validated.success) {
      console.error('Linktree data validation failed:', validated.error.issues)
      throw new LinktreeFetchError('Unable to parse Linktree page. The page structure may have changed.')
    }

    const pageProps = validated.data.props.pageProps

    // Filter to only clickable links (exclude headers, etc.)
    const clickableLinks = pageProps.links.filter(link =>
      link.url &&
      !link.locked &&
      link.type !== 'HEADER'
    )

    if (clickableLinks.length === 0) {
      throw new LinktreeEmptyError()
    }

    return {
      ...pageProps,
      links: clickableLinks,
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
