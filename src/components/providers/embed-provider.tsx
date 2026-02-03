'use client'

import { createContext, useContext, useCallback, useRef, useState, type ReactNode } from 'react'

interface EmbedPlaybackContextValue {
  // Currently playing embed ID (null if nothing playing)
  activeEmbedId: string | null

  // Register an embed with its pause function
  // Called when embed mounts
  registerEmbed: (id: string, pauseFn: () => void) => void

  // Unregister an embed
  // Called when embed unmounts
  unregisterEmbed: (id: string) => void

  // Set this embed as active, pausing all others
  // Called when embed starts playing
  setActiveEmbed: (id: string) => void

  // Clear active state (when user pauses manually)
  clearActiveEmbed: (id: string) => void
}

const EmbedPlaybackContext = createContext<EmbedPlaybackContextValue | null>(null)

export function EmbedPlaybackProvider({ children }: { children: ReactNode }) {
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null)

  // Map of embed ID -> pause function
  // Use ref to avoid re-renders when registering/unregistering
  const embedsRef = useRef<Map<string, () => void>>(new Map())

  const registerEmbed = useCallback((id: string, pauseFn: () => void) => {
    embedsRef.current.set(id, pauseFn)
  }, [])

  const unregisterEmbed = useCallback((id: string) => {
    embedsRef.current.delete(id)
    // If this was the active embed, clear active state
    setActiveEmbedId(prev => prev === id ? null : prev)
  }, [])

  const setActiveEmbed = useCallback((id: string) => {
    // Pause all other embeds
    embedsRef.current.forEach((pauseFn, embedId) => {
      if (embedId !== id) {
        pauseFn()
      }
    })
    setActiveEmbedId(id)
  }, [])

  const clearActiveEmbed = useCallback((id: string) => {
    setActiveEmbedId(prev => prev === id ? null : prev)
  }, [])

  return (
    <EmbedPlaybackContext.Provider value={{
      activeEmbedId,
      registerEmbed,
      unregisterEmbed,
      setActiveEmbed,
      clearActiveEmbed,
    }}>
      {children}
    </EmbedPlaybackContext.Provider>
  )
}

export function useEmbedPlayback() {
  const context = useContext(EmbedPlaybackContext)
  if (!context) {
    throw new Error('useEmbedPlayback must be used within EmbedPlaybackProvider')
  }
  return context
}

// Optional hook for embeds that may not be in a provider context
// (e.g., public pages where coordination isn't critical)
export function useOptionalEmbedPlayback() {
  return useContext(EmbedPlaybackContext)
}
