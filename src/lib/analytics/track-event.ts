/**
 * Client-side analytics tracking helpers
 *
 * These functions POST to the server-side tracking API from the browser.
 * Used by ClickTracker component to record page views, card clicks, and interactions.
 */

export interface TrackPageViewPayload {
  pageId: string
  pathname: string
}

export interface TrackCardClickPayload {
  cardId: string
  pageId: string
}

export interface TrackInteractionPayload {
  cardId: string
  pageId: string
  interactionType: 'game_play' | 'gallery_view' | 'audio_play'
}

export interface TrackAudioPlayPayload {
  cardId: string
  pageId: string
  trackTitle?: string
  duration?: number
}

/**
 * Track a page view event
 *
 * @param payload - Page view data
 */
export async function trackPageView(payload: TrackPageViewPayload): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'page_view',
        ...payload
      })
    })
  } catch (error) {
    // Swallow errors - tracking should never break user experience
    console.debug('Failed to track page view:', error)
  }
}

/**
 * Track a card click event
 *
 * @param payload - Card click data
 */
export async function trackCardClick(payload: TrackCardClickPayload): Promise<void> {
  try {
    // Use sendBeacon if available (more reliable for navigation away)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({
        type: 'card_click',
        ...payload
      })], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/track', blob)
    } else {
      // Fallback to fetch
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'card_click',
          ...payload
        })
      })
    }
  } catch (error) {
    // Swallow errors - tracking should never break user experience
    console.debug('Failed to track card click:', error)
  }
}

/**
 * Track a specialized interaction (game play, gallery view, or audio play)
 *
 * @param payload - Interaction data
 */
export async function trackInteraction(payload: TrackInteractionPayload): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'interaction',
        ...payload
      })
    })
  } catch (error) {
    // Swallow errors - tracking should never break user experience
    console.debug('Failed to track interaction:', error)
  }
}

/**
 * Track an audio play event
 *
 * @param payload - Audio play data
 */
export async function trackAudioPlay(payload: TrackAudioPlayPayload): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'interaction',
        interactionType: 'audio_play',
        ...payload
      })
    })
  } catch (error) {
    // Swallow errors - tracking should never break user experience
    console.debug('Failed to track audio play:', error)
  }
}
