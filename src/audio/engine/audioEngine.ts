// src/audio/engine/audioEngine.ts
import type { AudioEngineCallbacks, VarispeedMode } from './types'
import type { ReverbConfig } from '@/types/audio'

/**
 * AudioEngine - Singleton audio playback engine
 * Ported from Munyard Mixer, simplified for single-track playback
 *
 * Uses Web Audio API fallback (Superpowered SDK not yet integrated)
 */
class AudioEngine {
  private audioContext: AudioContext | null = null
  private audioBuffer: AudioBuffer | null = null
  private sourceNode: AudioBufferSourceNode | null = null
  private gainNode: GainNode | null = null
  private isInitialized = false
  private isLoadedFlag = false
  private isPlayingFlag = false
  private currentUrl: string | null = null
  private startTime = 0
  private pauseTime = 0
  private playbackSpeed = 1.0
  private varispeedMode: VarispeedMode = 'natural'
  private reverbMix = 0
  private looping = false
  private callbacks: AudioEngineCallbacks = {}
  private progressInterval: number | null = null
  private silentAudioElement: HTMLAudioElement | null = null
  private isIOS = false
  private audioUnlocked = false

  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Detect iOS
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      // Create AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)

      this.isInitialized = true
      console.log('AudioEngine initialized (Web Audio fallback mode)')
      console.warn('Superpowered SDK not available, using basic Web Audio fallback')
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error)
      throw error
    }
  }

  /**
   * iOS silent audio unlock pattern from Munyard Mixer
   * Creates silent audio element that keeps media channel active
   */
  ensureUnlocked(): void {
    if (!this.isIOS || this.audioUnlocked) return

    if (!this.silentAudioElement) {
      // Create silent audio element (matching Munyard Mixer pattern)
      const audio = document.createElement('audio')
      audio.loop = true
      audio.volume = 0.001 // Very quiet, but not zero (iOS mutes zero)
      audio.preload = 'auto'
      audio.controls = false
      ;(audio as any).disableRemotePlayback = true
      audio.setAttribute('playsinline', 'true')
      audio.setAttribute('webkit-playsinline', 'true')
      ;(audio as any).playsInline = true
      audio.style.display = 'none'

      // High-quality MP3 silence from unmute.js
      const huffman = (count: number, repeatStr: string): string => {
        let e = repeatStr
        for (; count > 1; count--) e += repeatStr
        return e
      }
      const silence = "data:audio/mpeg;base64,//uQx" + huffman(23, "A") + "WGluZwAAAA8AAAACAAACcQCA" + huffman(16, "gICA") + huffman(66, "/") + "8AAABhTEFNRTMuMTAwA8MAAAAAAAAAABQgJAUHQQAB9AAAAnGMHkkI" + huffman(320, "A") + "//sQxAADgnABGiAAQBCqgCRMAAgEAH" + huffman(15, "/") + "7+n/9FTuQsQH//////2NG0jWUGlio5gLQTOtIoeR2WX////X4s9Atb/JRVCbBUpeRUq" + huffman(18, "/") + "9RUi0f2jn/+xDECgPCjAEQAABN4AAANIAAAAQVTEFNRTMuMTAw" + huffman(97, "V") + "Q=="
      audio.src = silence
      audio.load()

      document.body.appendChild(audio)
      this.silentAudioElement = audio

      // Start silent audio to unlock iOS media channel
      audio.play()
        .then(() => {
          this.audioUnlocked = true
          console.log('iOS media channel unlocked')
        })
        .catch((err) => {
          console.warn('Silent audio unlock failed:', err)
        })
    }
  }

  async loadTrack(url: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioEngine not initialized')
    }

    try {
      // Don't reload if same URL
      if (this.currentUrl === url && this.audioBuffer) {
        return
      }

      // Stop current playback
      if (this.isPlayingFlag) {
        this.pause()
      }

      // Fetch audio file
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()

      // Decode audio data
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.currentUrl = url
      this.isLoadedFlag = true

      if (this.callbacks.onLoaded) {
        this.callbacks.onLoaded(this.audioBuffer.duration)
      }

      console.log(`Loaded track: ${url} (${this.audioBuffer.duration.toFixed(2)}s)`)
    } catch (error) {
      console.error('Failed to load track:', error)
      if (this.callbacks.onError) {
        this.callbacks.onError(error instanceof Error ? error.message : String(error))
      }
      throw error
    }
  }

  play(): void {
    if (!this.audioContext || !this.audioBuffer) {
      console.warn('Cannot play: AudioContext or buffer not ready')
      return
    }

    // Unlock iOS audio if needed
    if (this.isIOS) {
      this.ensureUnlocked()
    }

    // Resume AudioContext if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    // Clean up existing source
    if (this.sourceNode) {
      this.sourceNode.stop()
      this.sourceNode.disconnect()
    }

    // Create new source node
    this.sourceNode = this.audioContext.createBufferSource()
    this.sourceNode.buffer = this.audioBuffer
    this.sourceNode.playbackRate.value = this.playbackSpeed
    this.sourceNode.loop = this.looping

    // Connect to gain node
    if (this.gainNode) {
      this.sourceNode.connect(this.gainNode)
    }

    // Set up ended callback
    this.sourceNode.onended = () => {
      if (!this.looping && this.isPlayingFlag) {
        this.isPlayingFlag = false
        this.pauseTime = 0
        if (this.callbacks.onEnded) {
          this.callbacks.onEnded()
        }
        this.stopProgressTracking()
      }
    }

    // Start playback from current position
    const offset = this.pauseTime
    this.sourceNode.start(0, offset)
    this.startTime = this.audioContext.currentTime - offset
    this.isPlayingFlag = true

    // Start progress tracking
    this.startProgressTracking()

    console.log(`Playing from ${offset.toFixed(2)}s`)
  }

  pause(): void {
    if (!this.audioContext || !this.isPlayingFlag) {
      return
    }

    // Calculate current position
    this.pauseTime = this.audioContext.currentTime - this.startTime

    // Stop source node
    if (this.sourceNode) {
      try {
        this.sourceNode.stop()
      } catch (e) {
        // Already stopped
      }
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    this.isPlayingFlag = false
    this.stopProgressTracking()

    console.log(`Paused at ${this.pauseTime.toFixed(2)}s`)
  }

  seek(position: number): void {
    if (!this.audioBuffer) {
      console.warn('Cannot seek: No audio loaded')
      return
    }

    // Clamp position to valid range
    const clampedPosition = Math.max(0, Math.min(position, this.audioBuffer.duration))

    const wasPlaying = this.isPlayingFlag

    if (wasPlaying) {
      this.pause()
    }

    this.pauseTime = clampedPosition

    if (wasPlaying) {
      this.play()
    }

    console.log(`Seeked to ${clampedPosition.toFixed(2)}s`)
  }

  setVarispeed(speed: number, mode: VarispeedMode): void {
    // Clamp speed to 0.5-1.5 range
    const clampedSpeed = Math.max(0.5, Math.min(1.5, speed))
    this.playbackSpeed = clampedSpeed
    this.varispeedMode = mode

    // Apply to current source if playing
    if (this.sourceNode && this.isPlayingFlag) {
      this.sourceNode.playbackRate.value = clampedSpeed
    }

    // Note: Web Audio fallback doesn't support time-stretch mode
    // Both modes use pitch-shifting (natural varispeed)
    if (mode === 'timestretch') {
      console.warn('TimeStretch mode not available in Web Audio fallback')
    }

    console.log(`Varispeed set to ${clampedSpeed.toFixed(2)}x (${mode} mode)`)
  }

  setReverbConfig(config: ReverbConfig): void {
    // Reverb not implemented in Web Audio fallback
    console.warn('Reverb not available in Web Audio fallback')
  }

  setReverbMix(mix: number): void {
    // Clamp mix to 0-1
    this.reverbMix = Math.max(0, Math.min(1, mix))

    // Reverb not implemented in Web Audio fallback
    console.warn('Reverb not available in Web Audio fallback')
  }

  setLooping(enabled: boolean): void {
    this.looping = enabled

    // Apply to current source if exists
    if (this.sourceNode) {
      this.sourceNode.loop = enabled
    }

    console.log(`Looping ${enabled ? 'enabled' : 'disabled'}`)
  }

  getCurrentTime(): number {
    if (!this.audioContext) return 0

    if (this.isPlayingFlag) {
      return Math.min(
        this.audioContext.currentTime - this.startTime,
        this.audioBuffer?.duration || 0
      )
    }

    return this.pauseTime
  }

  getDuration(): number {
    return this.audioBuffer?.duration || 0
  }

  isPlaying(): boolean {
    return this.isPlayingFlag
  }

  isLoaded(): boolean {
    return this.isLoadedFlag
  }

  setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  private startProgressTracking(): void {
    if (this.progressInterval) return

    this.progressInterval = window.setInterval(() => {
      if (this.isPlayingFlag && this.callbacks.onProgress && this.audioBuffer) {
        const currentTime = this.getCurrentTime()
        const duration = this.audioBuffer.duration
        this.callbacks.onProgress(currentTime, duration)
      }
    }, 100) // Update every 100ms
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }

  destroy(): void {
    // Stop playback
    if (this.isPlayingFlag) {
      this.pause()
    }

    // Clean up nodes
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    if (this.gainNode) {
      this.gainNode.disconnect()
      this.gainNode = null
    }

    // Close AudioContext
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    // Clean up silent audio
    if (this.silentAudioElement) {
      this.silentAudioElement.pause()
      this.silentAudioElement.src = ''
      if (this.silentAudioElement.parentNode) {
        this.silentAudioElement.parentNode.removeChild(this.silentAudioElement)
      }
      this.silentAudioElement = null
    }

    // Stop progress tracking
    this.stopProgressTracking()

    // Reset state
    this.isInitialized = false
    this.isLoadedFlag = false
    this.isPlayingFlag = false
    this.currentUrl = null
    this.audioBuffer = null
    this.audioUnlocked = false

    console.log('AudioEngine destroyed')
  }
}

// Singleton instance
let instance: AudioEngine | null = null

export function getAudioEngine(): AudioEngine {
  if (!instance) {
    instance = new AudioEngine()
  }
  return instance
}

export { AudioEngine }
