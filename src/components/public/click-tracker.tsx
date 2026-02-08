'use client'

import { useEffect } from 'react'
import { trackPageView, trackCardClick, trackInteraction } from '@/lib/analytics/track-event'

interface ClickTrackerProps {
  pageId: string
  cards: Array<{ id: string }>
}

/**
 * ClickTracker - Client component for tracking page views and card clicks
 *
 * Features:
 * - Tracks page view on mount (once per page load)
 * - Tracks card clicks via data-card-id attribute (bubbling event listener)
 * - Tracks specialized interactions via data-game-play and data-gallery-view attributes
 * - Non-blocking: Uses try/catch and sendBeacon fallback
 * - Renders nothing visible (return null)
 *
 * Usage:
 * Place inside PublicPageRenderer with pageId and minimal cards array.
 * Add data-card-id={card.id} to card wrapper elements.
 */
export function ClickTracker({ pageId, cards }: ClickTrackerProps) {
  useEffect(() => {
    // Track page view on mount
    trackPageView({
      pageId,
      pathname: window.location.pathname
    })

    // Click event listener for card clicks and interactions
    const handleClick = (event: MouseEvent) => {
      // Walk up the DOM tree to find tracking attributes (max 5 levels)
      let element = event.target as HTMLElement | null
      let depth = 0

      while (element && depth < 5) {
        // Check for card click tracking
        const cardId = element.getAttribute('data-card-id')
        if (cardId) {
          trackCardClick({ cardId, pageId })
          break
        }

        // Check for game play tracking
        const gamePlayId = element.getAttribute('data-game-play')
        if (gamePlayId) {
          trackInteraction({
            cardId: gamePlayId,
            pageId,
            interactionType: 'game_play'
          })
          break
        }

        // Check for gallery view tracking
        const galleryViewId = element.getAttribute('data-gallery-view')
        if (galleryViewId) {
          trackInteraction({
            cardId: galleryViewId,
            pageId,
            interactionType: 'gallery_view'
          })
          break
        }

        // Check for audio play tracking
        const audioPlayId = element.getAttribute('data-audio-play')
        if (audioPlayId) {
          trackInteraction({
            cardId: audioPlayId,
            pageId,
            interactionType: 'audio_play'
          })
          break
        }

        // Move up to parent element
        element = element.parentElement
        depth++
      }
    }

    // Attach click listener to document
    document.addEventListener('click', handleClick)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [pageId, cards])

  // Render nothing visible
  return null
}
