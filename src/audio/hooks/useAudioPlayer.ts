// src/audio/hooks/useAudioPlayer.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { getAudioEngine } from '../engine/audioEngine'
import type { VarispeedMode } from '../engine/types'
import type { ReverbConfig } from '@/types/audio'
import { useOptionalEmbedPlayback } from '@/components/providers/embed-provider'

interface UseAudioPlayerOptions {
  cardId: string
  trackUrl?: string
  looping?: boolean
  autoplay?: boolean
  reverbConfig?: ReverbConfig
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
}

interface UseAudioPlayerReturn {
  isPlaying: boolean
  isLoaded: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  progress: number          // 0-1
  speed: number             // current varispeed
  varispeedMode: VarispeedMode
  reverbMix: number         // visitor-controlled mix

  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (position: number) => void       // 0-1
  setSpeed: (speed: number) => void      // 0.5-1.5
  setVarispeedMode: (mode: VarispeedMode) => void
  setReverbMix: (mix: number) => void    // 0-1
  loadTrack: (url: string) => void
}

export function useAudioPlayer(options: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const { cardId, trackUrl, looping = false, autoplay = false, reverbConfig, onPlay, onPause, onEnded } = options

  // EmbedPlaybackProvider integration for one-at-a-time playback
  const embedPlayback = useOptionalEmbedPlayback()

  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeedState] = useState(1.0)
  const [varispeedMode, setVarispeedModeState] = useState<VarispeedMode>('natural')
  const [reverbMix, setReverbMixState] = useState(0)

  // Refs
  const engineRef = useRef(getAudioEngine())
  const initPromiseRef = useRef<Promise<void> | null>(null)
  // Stable ref for onEnded to avoid re-running effect on every render
  const onEndedRef = useRef(onEnded)
  onEndedRef.current = onEnded
  // Stable ref for embedPlayback — avoids re-triggering the init effect when
  // the provider context value changes (which happens on every setActiveEmbed
  // call because activeEmbedId state creates a new context object).
  const embedPlaybackRef = useRef(embedPlayback)
  embedPlaybackRef.current = embedPlayback
  // Stable ref for autoplay — avoids re-triggering effects when prop changes
  const autoplayRef = useRef(autoplay)
  autoplayRef.current = autoplay
  // Cleanup function for autoplay interaction listeners
  const autoplayCleanupRef = useRef<(() => void) | null>(null)

  // Initialize engine eagerly on mount — AudioContext is created here.
  // On desktop, context starts running. On mobile, browser auto-suspends it.
  // Either way, the processor is ready to receive messages.
  // play() will call context.resume() synchronously in the user gesture.
  useEffect(() => {
    const engine = engineRef.current

    if (!initPromiseRef.current) {
      initPromiseRef.current = engine.init().then(() => {
        // If init didn't set started (WASM fetch failed), clear the ref so
        // the next mount can retry.
        if (!engine.isInitialized()) {
          initPromiseRef.current = null
        }
      })
    }

    // Set up callbacks
    engine.setCallbacks({
      onProgress: (time, dur) => {
        setCurrentTime(time)
        setDuration(dur)
        setProgress(dur > 0 ? time / dur : 0)
      },
      onLoaded: (dur) => {
        setDuration(dur)
        setIsLoaded(true)
        setIsLoading(false)
        // Autoplay: trigger play after track loads.
        // Browser autoplay policy blocks AudioContext.resume() without a user gesture.
        // Try immediately (works in editor where user already interacted), then
        // register a one-shot interaction listener as fallback for public pages.
        if (autoplayRef.current && !engine.isPlaying()) {
          const tryAutoplay = () => {
            if (engine.isPlaying()) return
            engine.play()
            setIsPlaying(true)
            if (embedPlaybackRef.current) {
              embedPlaybackRef.current.setActiveEmbed(cardId)
            }
          }

          tryAutoplay()

          // If context is still suspended after play(), wait for first user interaction
          if (engine.getContextState() !== 'running') {
            const onInteraction = () => {
              tryAutoplay()
              document.removeEventListener('click', onInteraction, true)
              document.removeEventListener('touchstart', onInteraction, true)
              document.removeEventListener('keydown', onInteraction, true)
            }
            document.addEventListener('click', onInteraction, true)
            document.addEventListener('touchstart', onInteraction, true)
            document.addEventListener('keydown', onInteraction, true)

            // Store cleanup ref so unmount can remove listeners
            autoplayCleanupRef.current = () => {
              document.removeEventListener('click', onInteraction, true)
              document.removeEventListener('touchstart', onInteraction, true)
              document.removeEventListener('keydown', onInteraction, true)
            }
          }
        }
      },
      onEnded: () => {
        setIsPlaying(false)
        setProgress(1)
        if (embedPlaybackRef.current) {
          embedPlaybackRef.current.clearActiveEmbed(cardId)
        }
        if (onEndedRef.current) {
          onEndedRef.current()
        }
      },
      onError: (error) => {
        console.error('AudioEngine error:', error)
        setIsLoading(false)
      }
    })

    // Clean up on unmount only (not on dependency changes)
    return () => {
      // Pause playback
      if (engine.isPlaying()) {
        engine.pause()
      }

      // Clean up autoplay interaction listeners
      if (autoplayCleanupRef.current) {
        autoplayCleanupRef.current()
        autoplayCleanupRef.current = null
      }

      // Unregister from EmbedPlaybackProvider
      if (embedPlaybackRef.current) {
        embedPlaybackRef.current.unregisterEmbed(cardId)
      }
    }
  }, [cardId])

  // Register with EmbedPlaybackProvider (uses ref to avoid re-triggering on context changes)
  useEffect(() => {
    if (embedPlaybackRef.current) {
      embedPlaybackRef.current.registerEmbed(cardId, () => {
        // Pause callback for coordination
        const engine = engineRef.current
        if (engine.isPlaying()) {
          engine.pause()
          setIsPlaying(false)
        }
      })
    }

    return () => {
      if (embedPlaybackRef.current) {
        embedPlaybackRef.current.unregisterEmbed(cardId)
      }
    }
  }, [cardId])

  // Load track when URL changes
  useEffect(() => {
    if (trackUrl) {
      loadTrack(trackUrl)
    }
  }, [trackUrl])

  // Apply looping setting
  useEffect(() => {
    const engine = engineRef.current
    engine.setLooping(looping)
  }, [looping])

  // Listen for iPod wheel varispeed changes to sync display state
  useEffect(() => {
    const handleIpodVarispeed = (e: Event) => {
      const speed = (e as CustomEvent).detail?.speed
      if (typeof speed === 'number') {
        setSpeedState(speed)
      }
    }
    window.addEventListener('ipod-varispeed', handleIpodVarispeed)
    return () => window.removeEventListener('ipod-varispeed', handleIpodVarispeed)
  }, [])

  // Apply reverb config when it changes
  useEffect(() => {
    if (reverbConfig) {
      const engine = engineRef.current
      engine.setReverbConfig(reverbConfig)
    }
  }, [reverbConfig])

  // Load track function — waits for engine init before sending load command.
  // On desktop, init completes quickly and track pre-loads before user clicks play.
  // On mobile, if context is auto-suspended, downloadAndDecode may fail silently —
  // play() handles this with the pendingPlayAfterLoad fallback.
  const loadTrack = useCallback(async (url: string) => {
    const engine = engineRef.current
    setIsLoading(true)
    setIsLoaded(false)
    try {
      // Wait for Superpowered to finish initializing
      if (initPromiseRef.current) {
        await initPromiseRef.current
      }
      // engine.loadTrack() handles currentUrl + isLoadedFlag internally.
      // DO NOT call engine.setPendingTrack() here — it resets isLoadedFlag,
      // which defeats the short-circuit in loadTrack() and forces a redundant
      // re-download on every React Strict Mode re-mount.
      await engine.loadTrack(url)
    } catch (error) {
      console.error('Failed to load track:', error)
      setIsLoading(false)
    }
  }, [])

  // Play — MUST be synchronous. engine.play() calls context.resume()
  // synchronously in the user gesture callstack. Making this async or
  // adding awaits before play() breaks mobile browser gesture detection.
  const play = useCallback(() => {
    const engine = engineRef.current

    // Set active embed (pauses all others)
    if (embedPlayback) {
      embedPlayback.setActiveEmbed(cardId)
    }

    // Synchronous — context.resume() must be in user gesture callstack
    engine.play()
    setIsPlaying(true)

    if (onPlay) {
      onPlay()
    }
  }, [cardId, embedPlayback, onPlay])

  // Pause function
  const pause = useCallback(() => {
    const engine = engineRef.current
    engine.pause()
    setIsPlaying(false)

    // Clear active embed
    if (embedPlayback) {
      embedPlayback.clearActiveEmbed(cardId)
    }

    if (onPause) {
      onPause()
    }
  }, [cardId, embedPlayback, onPause])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // Seek function (0-1)
  const seek = useCallback((position: number) => {
    const engine = engineRef.current
    const dur = engine.getDuration()
    if (dur > 0) {
      const timeInSeconds = position * dur
      engine.seek(timeInSeconds)
    }
  }, [])

  // Set speed function
  const setSpeed = useCallback((newSpeed: number) => {
    const engine = engineRef.current
    engine.setVarispeed(newSpeed, varispeedMode)
    setSpeedState(newSpeed)
  }, [varispeedMode])

  // Set varispeed mode function
  const setVarispeedMode = useCallback((mode: VarispeedMode) => {
    const engine = engineRef.current
    engine.setVarispeed(speed, mode)
    setVarispeedModeState(mode)
  }, [speed])

  // Set reverb mix function
  const setReverbMix = useCallback((mix: number) => {
    const engine = engineRef.current
    engine.setReverbMix(mix)
    setReverbMixState(mix)
  }, [])

  return {
    isPlaying,
    isLoaded,
    isLoading,
    currentTime,
    duration,
    progress,
    speed,
    varispeedMode,
    reverbMix,
    play,
    pause,
    togglePlay,
    seek,
    setSpeed,
    setVarispeedMode,
    setReverbMix,
    loadTrack
  }
}
