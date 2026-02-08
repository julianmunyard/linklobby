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
  const isInitializedRef = useRef(false)

  // CRITICAL: Store callbacks and context in refs to prevent effect re-runs.
  // Without refs, inline callbacks (onEnded) and context value changes (embedPlayback)
  // cause effect cleanup to run on every re-render, which calls engine.pause() →
  // audioContext.suspend(), immediately undoing the audioContext.resume() from play().
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)
  const onEndedRef = useRef(onEnded)
  const embedPlaybackRef = useRef(embedPlayback)

  // Keep refs current (synchronous assignment during render)
  onPlayRef.current = onPlay
  onPauseRef.current = onPause
  onEndedRef.current = onEnded
  embedPlaybackRef.current = embedPlayback

  // Initialize engine and set up callbacks — runs once per cardId
  useEffect(() => {
    const engine = engineRef.current

    if (!isInitializedRef.current) {
      engine.init().catch((error) => {
        console.error('Failed to initialize AudioEngine:', error)
      })
      isInitializedRef.current = true
    }

    // Set up callbacks (messages from AudioWorklet processor)
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
        embedPlaybackRef.current?.clearActiveEmbed(cardId)
        onEndedRef.current?.()
      },
      onError: (error) => {
        console.error('AudioEngine error:', error)
        setIsLoading(false)
      }
    })

    // Clean up on unmount (or cardId change)
    return () => {
      if (engine.isPlaying()) {
        engine.pause()
      }
      embedPlaybackRef.current?.unregisterEmbed(cardId)
    }
  }, [cardId])

  // Register with EmbedPlaybackProvider — runs once per cardId
  useEffect(() => {
    const ep = embedPlaybackRef.current
    if (ep) {
      ep.registerEmbed(cardId, () => {
        // Pause callback — called when another embed starts playing
        const engine = engineRef.current
        if (engine.isPlaying()) {
          engine.pause()
          setIsPlaying(false)
        }
      })
    }

    return () => {
      embedPlaybackRef.current?.unregisterEmbed(cardId)
    }
  }, [cardId])

  // Load track when URL changes
  useEffect(() => {
    if (trackUrl) {
      const engine = engineRef.current
      setIsLoading(true)
      setIsLoaded(false)
      engine.loadTrack(trackUrl).catch((error) => {
        console.error('Failed to load track:', error)
        setIsLoading(false)
      })
    }
  }, [trackUrl])

  // Apply looping setting
  useEffect(() => {
    engineRef.current.setLooping(looping)
  }, [looping])

  // Apply reverb config when it changes
  useEffect(() => {
    if (reverbConfig) {
      engineRef.current.setReverbConfig(reverbConfig)
    }
  }, [reverbConfig])

  // Play
  const play = useCallback(() => {
    const engine = engineRef.current
    if (!engine.isLoaded()) return

    // iOS unlock
    engine.ensureUnlocked()

    // Set active embed (pauses all others)
    embedPlaybackRef.current?.setActiveEmbed(cardId)

    engine.play()
    setIsPlaying(true)
    onPlayRef.current?.()
  }, [cardId])

  // Pause
  const pause = useCallback(() => {
    const engine = engineRef.current
    engine.pause()
    setIsPlaying(false)
    embedPlaybackRef.current?.clearActiveEmbed(cardId)
    onPauseRef.current?.()
  }, [cardId])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // Seek (0-1)
  const seek = useCallback((position: number) => {
    if (duration > 0) {
      engineRef.current.seek(position * duration)
    }
  }, [duration])

  // Set speed
  const setSpeed = useCallback((newSpeed: number) => {
    engineRef.current.setVarispeed(newSpeed, varispeedMode === 'natural')
    setSpeedState(newSpeed)
  }, [varispeedMode])

  // Set varispeed mode
  const setVarispeedMode = useCallback((mode: VarispeedMode) => {
    engineRef.current.setVarispeed(speed, mode === 'natural')
    setVarispeedModeState(mode)
  }, [speed])

  // Set reverb mix
  const setReverbMix = useCallback((mix: number) => {
    engineRef.current.setReverbMix(mix)
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
    loadTrack: useCallback((url: string) => {
      setIsLoading(true)
      setIsLoaded(false)
      engineRef.current.loadTrack(url).catch((error) => {
        console.error('Failed to load track:', error)
        setIsLoading(false)
      })
    }, [])
  }
}
