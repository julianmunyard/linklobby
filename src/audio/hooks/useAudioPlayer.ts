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
  const { cardId, trackUrl, looping = false, reverbConfig, onPlay, onPause, onEnded } = options

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

  // Initialize engine eagerly on mount — AudioContext is created here.
  // On desktop, context starts running. On mobile, browser auto-suspends it.
  // Either way, the processor is ready to receive messages.
  // play() will call context.resume() synchronously in the user gesture.
  useEffect(() => {
    const engine = engineRef.current

    if (!initPromiseRef.current) {
      initPromiseRef.current = engine.init().catch((error) => {
        console.error('Failed to initialize AudioEngine:', error)
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
      },
      onEnded: () => {
        setIsPlaying(false)
        setProgress(1)
        if (embedPlayback) {
          embedPlayback.clearActiveEmbed(cardId)
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

    // Clean up on unmount
    return () => {
      // Pause playback
      if (engine.isPlaying()) {
        engine.pause()
      }

      // Unregister from EmbedPlaybackProvider
      if (embedPlayback) {
        embedPlayback.unregisterEmbed(cardId)
      }
    }
  }, [cardId, embedPlayback])

  // Register with EmbedPlaybackProvider
  useEffect(() => {
    if (embedPlayback) {
      embedPlayback.registerEmbed(cardId, () => {
        // Pause callback for coordination
        const engine = engineRef.current
        if (engine.isPlaying()) {
          engine.pause()
          setIsPlaying(false)
        }
      })
    }

    return () => {
      if (embedPlayback) {
        embedPlayback.unregisterEmbed(cardId)
      }
    }
  }, [cardId, embedPlayback])

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
      // Store URL on engine even if loadTrack throws (for pendingPlayAfterLoad)
      engine.setPendingTrack(url)
      await engine.loadTrack(url)
    } catch (error) {
      console.error('Failed to load track:', error)
      setIsLoading(false)
    }
  }, [])

  // Play — calls engine.play() which is async (matches Munyard Mixer's playAll).
  // The hook fires it without await (fire-and-forget). The first call inside
  // engine.play() is always a media activation (audio.play on iOS, or
  // context.resume on Android) which IS in the user gesture callstack.
  const play = useCallback(() => {
    const engine = engineRef.current

    // Set active embed (pauses all others)
    if (embedPlayback) {
      embedPlayback.setActiveEmbed(cardId)
    }

    // Fire-and-forget — engine.play() handles iOS unlock + context resume + play.
    // Catch errors to reset playing state if something fails.
    engine.play().catch((error) => {
      console.error('Failed to play:', error)
      setIsPlaying(false)
    })
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
