// src/lib/import/linktree-mapper.ts
import axios from 'axios'
import { generateLayoutPatternRandomized, type LayoutItem } from './layout-generator'
import type { LinktreeLink } from '@/types/linktree'
import type { CardType, CardSize, HorizontalPosition } from '@/types/card'

// Card data without the image blob
export interface MappedCardData {
  card_type: CardType
  title: string | null
  description: string | null
  url: string
  content: Record<string, unknown>
  size: CardSize
  position: HorizontalPosition
}

// Structured return: card data paired with its image blob
export interface MappedCardWithImage {
  card: MappedCardData
  imageBlob: Blob | null
}

// Result of full import
export interface ImportResult {
  mappedCards: MappedCardWithImage[]
  failures: Array<{ index: number; title: string; reason: string }>
}

// Download image from URL and return as Blob
async function downloadImage(imageUrl: string): Promise<Blob | null> {
  // Skip empty or invalid URLs
  if (!imageUrl || imageUrl.trim() === '') {
    return null
  }

  // Skip data URIs, SVGs, and other non-downloadable formats
  if (imageUrl.startsWith('data:') || imageUrl.endsWith('.svg') || imageUrl.includes('/svg')) {
    console.log('[ImageDownload] Skipping non-image URL:', imageUrl.substring(0, 50))
    return null
  }

  // Handle relative URLs (shouldn't happen but just in case)
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://linktr.ee${imageUrl}`

  console.log('[ImageDownload] Attempting:', fullUrl)

  try {
    const response = await axios.get(fullUrl, {
      responseType: 'arraybuffer',
      timeout: 15000, // Increased timeout to 15 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': 'https://linktr.ee/',
      },
      maxRedirects: 5,
    })

    const contentType = response.headers['content-type'] || 'image/jpeg'
    const dataSize = response.data.byteLength || 0

    console.log('[ImageDownload] Success:', fullUrl, `(${dataSize} bytes, ${contentType})`)

    // Skip very small images (likely broken or placeholder)
    if (dataSize < 100) {
      console.warn('[ImageDownload] Skipping tiny image:', fullUrl, `(${dataSize} bytes)`)
      return null
    }

    return new Blob([response.data], { type: contentType })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn('[ImageDownload] Failed:', fullUrl, error.response?.status || error.code || error.message)
    } else {
      console.warn('[ImageDownload] Failed:', fullUrl, error)
    }
    return null
  }
}

/**
 * Map Linktree links to LinkLobby cards.
 * Downloads thumbnails and returns them separately from card data.
 * Returns array of {card, imageBlob} objects for clean API handling.
 */
export async function mapLinktreeToCards(
  links: LinktreeLink[]
): Promise<ImportResult> {
  const layout = generateLayoutPatternRandomized(links.length)

  // Log what we're processing
  console.log('[LinktreeMapper] Processing', links.length, 'links')
  links.forEach((link, i) => {
    console.log(`[LinktreeMapper] Link ${i}: "${link.title}" thumbnail:`, link.thumbnail || '(none)')
  })

  // Process links in parallel with Promise.allSettled
  const settledResults = await Promise.allSettled(
    links.map(async (link, index) => {
      const layoutItem = layout[index]

      // Download thumbnail if available
      let imageBlob: Blob | null = null
      if (link.thumbnail) {
        imageBlob = await downloadImage(link.thumbnail)
        if (!imageBlob) {
          console.warn(`[LinktreeMapper] Failed to get image for "${link.title}"`)
        }
      }

      // Map to our card format - image blob is separate, not embedded in content
      const card: MappedCardData = {
        card_type: layoutItem.type,
        title: link.title || null,
        description: null, // Linktree doesn't have descriptions on links
        url: link.url,
        content: {}, // Clean content object - no embedded blobs
        size: layoutItem.size,
        position: 'left' as HorizontalPosition, // Will flow naturally in our layout
      }

      return { card, imageBlob, index }
    })
  )

  // Separate successes and failures
  const mappedCards: MappedCardWithImage[] = []
  const failures: Array<{ index: number; title: string; reason: string }> = []

  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      const { card, imageBlob } = result.value
      // Return structured object with card data and imageBlob separate
      mappedCards.push({ card, imageBlob })
    } else {
      const linkIndex = settledResults.indexOf(result)
      failures.push({
        index: linkIndex,
        title: links[linkIndex]?.title || 'Unknown',
        reason: result.reason?.message || 'Unknown error',
      })
    }
  }

  return { mappedCards, failures }
}
