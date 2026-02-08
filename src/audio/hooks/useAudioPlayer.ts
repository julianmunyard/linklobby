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

  // Initialize engine
  useEffect(() => {
    const engine = engineRef.current

    if (!isInitializedRef.current) {
      engine.init().catch((error) => {
        console.error('Failed to initialize AudioEngine:', error)
      })
      isInitializedRef.current = true
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
        if (onEnded) {
          onEnded()
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
  }, [cardId, embedPlayback, onEnded])

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

  // Load track function
  const loadTrack = useCallback((url: string) => {
    const engine = engineRef.current
    setIsLoading(true)
    setIsLoaded(false)
    engine.loadTrack(url).catch((error) => {
      console.error('Failed to load track:', error)
      setIsLoading(false)
    })
  }, [])

  // Play function
  const play = useCallback(() => {
    const engine = engineRef.current

    if (!engine.isLoaded()) {
      console.warn('Cannot play: No track loaded')
      return
    }

    // Unlock iOS audio on first play
    engine.ensureUnlocked()

    // Set active embed (pauses all others)
    if (embedPlayback) {
      embedPlayback.setActiveEmbed(cardId)
    }

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
