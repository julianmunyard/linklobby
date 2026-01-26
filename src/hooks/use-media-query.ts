import { useEffect, useState } from 'react'

/**
 * Generic media query hook using window.matchMedia
 * @param query CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Handle SSR - matchMedia not available
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create listener for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * Detects mobile layout based on width AND orientation
 * @returns true if width < 768px OR (tablet-sized AND portrait orientation)
 *
 * This ensures tablets in landscape get desktop layout,
 * while tablets in portrait get mobile layout.
 */
export function useIsMobileLayout(): boolean {
  const isNarrowWidth = useMediaQuery('(max-width: 767px)')
  const isPortrait = useMediaQuery('(orientation: portrait)')
  const isTabletWidth = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')

  // Mobile layout if:
  // 1. Width is below mobile breakpoint (< 768px), OR
  // 2. Tablet-sized device in portrait orientation
  return isNarrowWidth || (isTabletWidth && isPortrait)
}
