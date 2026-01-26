import { useEffect, useState } from 'react'

/**
 * Detects online/offline network state
 * @returns boolean indicating if the browser is online
 *
 * Features:
 * - Monitors navigator.onLine and online/offline events
 * - Debounces offline state by 500ms to prevent flickering on unstable connections
 * - Does NOT debounce going online (users want immediate feedback)
 * - Handles SSR gracefully (assumes online initially)
 */
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Handle SSR
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    let offlineTimer: NodeJS.Timeout | null = null

    const handleOnline = () => {
      // Clear any pending offline timer
      if (offlineTimer) {
        clearTimeout(offlineTimer)
        offlineTimer = null
      }
      // Go online immediately
      setIsOnline(true)
    }

    const handleOffline = () => {
      // Debounce going offline to prevent flickering
      offlineTimer = setTimeout(() => {
        setIsOnline(false)
      }, 500)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (offlineTimer) {
        clearTimeout(offlineTimer)
      }
    }
  }, [])

  return isOnline
}
