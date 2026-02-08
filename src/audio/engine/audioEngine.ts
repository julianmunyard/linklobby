// src/audio/engine/audioEngine.ts
// Web Audio API Audio Engine for LinkLobby
// Replaces Superpowered SDK with standard browser Audio API
//
// KEY PATTERN:
// - play() = audioContext.resume() + create AudioBufferSourceNode + start playback
// - pause() = stop source node, calculate and store current position
// - Uses fetch + decodeAudioData + AudioBufferSourceNode for playback

import type { AudioEngineCallbacks } from './types'
import type { ReverbConfig } from '@/types/audio'

class AudioEngine {
  // Web Audio API instances
  private audioContext: AudioContext | null = null
  private audioBuffer: AudioBuffer | null = null
  private sourceNode: AudioBufferSourceNode | null = null

  // State
  private started = false
  private initPromise: Promise<void> | null = null
  private isLoadedFlag = false
  private isPlayingFlag = false
  private currentUrl: string | null = null
  private duration = 0

  // Playback tracking
  private playbackSpeed = 1.0
  private isNaturalVarispeed = true
  private startOffset = 0 // Current position in the track (seconds)
  private startedAtContextTime = 0 // AudioContext.currentTime when playback started
  private intentionalStop = false // Flag to suppress onEnded callback during pause/seek
  private progressInterval: number | null = null

  // Settings
  private reverbMixValue = 0
  private reverbConfigValue: ReverbConfig | null = null
  private looping = false
  private callbacks: AudioEngineCallbacks = {}

  // iOS unlock
  private silentAudioElement: HTMLAudioElement | null = null
  private isIOS = false
  private audioUnlocked = false

  async init(): Promise<void> {
    if (this.started) return
    if (this.initPromise) return this.initPromise

    this.initPromise = this._doInit()
    return this.initPromise
  }

  private async _doInit(): Promise<void> {
    try {
      // Detect iOS
      if (typeof navigator !== 'undefined') {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      }

      // Create AudioContext (browser auto-suspends until user gesture)
      this.audioContext = new AudioContext({ sampleRate: 48000 })

      this.started = true
      console.log('AudioEngine initialized (Web Audio API)')
    } catch (error) {
      this.started = false
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
      const audio = document.createElement('audio')
      audio.loop = true
      audio.volume = 0.001
      audio.preload = 'auto'
      audio.controls = false
      ;(audio as any).disableRemotePlayback = true
      audio.setAttribute('playsinline', 'true')
      audio.setAttribute('webkit-playsinline', 'true')
      ;(audio as any).playsInline = true
      audio.style.display = 'none'

      // High-quality MP3 silence from unmute.js (same as Munyard Mixer)
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
    // Wait for init to complete if still in progress
    if (this.initPromise) {
      await this.initPromise
    }
    if (!this.started || !this.audioContext) {
      throw new Error('AudioEngine not initialized')
    }

    // Don't reload if same URL
    if (this.currentUrl === url && this.isLoadedFlag) {
      return
    }

    // Stop current playback
    if (this.isPlayingFlag) {
      this.pause()
    }

    this.isLoadedFlag = false
    this.currentUrl = url
    this.startOffset = 0

    try {
      // Fetch and decode audio
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.duration = this.audioBuffer.duration
      this.isLoadedFlag = true

      console.log(`AudioEngine: Track loaded, duration = ${this.duration}s`)
      this.callbacks.onLoaded?.(this.duration)
    } catch (error) {
      console.error('Failed to load track:', error)
      this.callbacks.onError?.(`Failed to load track: ${error}`)
      throw error
    }
  }

  /**
   * Play audio - SYNCHRONOUS method
   * Resume AudioContext if suspended, create AudioBufferSourceNode, start playback
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext
  }

  play(): void {
    console.log('AudioEngine: play() called — started:', this.started, 'isLoadedFlag:', this.isLoadedFlag)

    if (!this.started || !this.isLoadedFlag || !this.audioBuffer || !this.audioContext) {
      console.warn('AudioEngine: Cannot play — not ready or no track loaded')
      return
    }

    // If already playing, no-op
    if (this.isPlayingFlag) {
      console.log('AudioEngine: Already playing, no-op')
      return
    }

    // Resume AudioContext (fire-and-forget, same pattern as Superpowered version)
    const ctx = this.audioContext
    console.log('AudioEngine: play() — audioContext.state BEFORE resume:', ctx.state)
    ctx.resume().then(() => {
      console.log('AudioEngine: play() — audioContext.state AFTER resume:', ctx.state)
    }).catch((err: unknown) => {
      console.error('AudioEngine: play() — resume() REJECTED:', err)
    })

    // Create new AudioBufferSourceNode (Web Audio pattern: source nodes are one-shot)
    this.sourceNode = this.audioContext.createBufferSource()
    this.sourceNode.buffer = this.audioBuffer
    this.sourceNode.playbackRate.value = this.playbackSpeed
    this.sourceNode.loop = this.looping
    this.sourceNode.connect(this.audioContext.destination)

    // Handle playback end
    this.sourceNode.onended = () => {
      if (!this.intentionalStop) {
        // Natural end of track
        console.log('AudioEngine: Track ended naturally')
        this.isPlayingFlag = false
        this.startOffset = 0
        this.stopProgressTracking()
        this.callbacks.onEnded?.()
      } else {
        // Intentional stop (pause/seek) - don't fire onEnded
        this.intentionalStop = false
      }
    }

    // Start playback from current position
    this.sourceNode.start(0, this.startOffset)
    this.startedAtContextTime = this.audioContext.currentTime
    this.isPlayingFlag = true

    // Start progress tracking
    this.startProgressTracking()

    console.log('AudioEngine: Playback started from', this.startOffset, 'seconds')
  }

  /**
   * Diagnostic: Play a test tone directly on the AudioContext
   * to verify audio output works. Call from browser console:
   * window.__audioEngineDiag()
   */
  diagTestTone(): void {
    const ctx = this.audioContext
    if (!ctx) {
      console.error('DIAG: No AudioContext')
      return
    }
    console.log('DIAG: AudioContext state:', ctx.state, '— attempting resume + oscillator')
    ctx.resume().then(() => {
      console.log('DIAG: AudioContext state after resume:', ctx.state)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0.1
      osc.frequency.value = 440
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      setTimeout(() => { osc.stop(); osc.disconnect(); gain.disconnect(); console.log('DIAG: Tone stopped') }, 500)
      console.log('DIAG: 440Hz tone playing for 0.5s')
    }).catch((err: unknown) => {
      console.error('DIAG: resume failed:', err)
    })
  }

  /**
   * Pause audio - stop the source node and record current position
   */
  pause(): void {
    if (!this.started || !this.isPlayingFlag) return

    // Calculate current position
    if (this.audioContext) {
      const elapsed = (this.audioContext.currentTime - this.startedAtContextTime) * this.playbackSpeed
      this.startOffset = Math.min(this.startOffset + elapsed, this.duration)
      console.log('AudioEngine: Paused at', this.startOffset, 'seconds')
    }

    // Stop source node
    if (this.sourceNode) {
      this.intentionalStop = true
      try {
        this.sourceNode.stop()
      } catch (err) {
        // sourceNode.stop() can throw if already stopped
        console.warn('AudioEngine: stop() failed:', err)
      }
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    this.isPlayingFlag = false
    this.stopProgressTracking()
  }

  seek(positionSeconds: number): void {
    if (!this.started || !this.audioBuffer) return

    // Clamp to valid range
    const clampedPosition = Math.max(0, Math.min(positionSeconds, this.duration))
    this.startOffset = clampedPosition

    console.log('AudioEngine: Seek to', clampedPosition, 'seconds')

    // If playing, restart from new position
    if (this.isPlayingFlag) {
      // Stop current playback
      if (this.sourceNode) {
        this.intentionalStop = true
        try {
          this.sourceNode.stop()
        } catch (err) {
          console.warn('AudioEngine: stop() during seek failed:', err)
        }
        this.sourceNode.disconnect()
        this.sourceNode = null
      }

      // Start new playback from new position
      this.isPlayingFlag = false // Reset flag so play() works
      this.play()
    } else {
      // Just update position and fire callback
      this.callbacks.onProgress?.(clampedPosition, this.duration)
    }
  }

  setVarispeed(speed: number, isNatural: boolean): void {
    const clampedSpeed = Math.max(0.5, Math.min(1.5, speed))
    this.playbackSpeed = clampedSpeed
    this.isNaturalVarispeed = isNatural

    // Apply to current source node if playing
    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = clampedSpeed
    }

    console.log('AudioEngine: Varispeed set to', clampedSpeed, '(mode:', isNatural ? 'natural' : 'timestretch', ')')
  }

  setReverbConfig(config: ReverbConfig): void {
    // Store config for future use (reverb processing not implemented yet)
    this.reverbConfigValue = config
    console.log('AudioEngine: Reverb config stored (processing not implemented)')
  }

  setReverbMix(mix: number): void {
    const clampedMix = Math.max(0, Math.min(1, mix))
    this.reverbMixValue = clampedMix
    console.log('AudioEngine: Reverb mix set to', clampedMix, '(processing not implemented)')
  }

  setLooping(enabled: boolean): void {
    this.looping = enabled

    // Apply to current source node if playing
    if (this.sourceNode) {
      this.sourceNode.loop = enabled
    }

    console.log('AudioEngine: Looping', enabled ? 'enabled' : 'disabled')
  }

  isPlaying(): boolean {
    return this.isPlayingFlag
  }

  isLoaded(): boolean {
    return this.isLoadedFlag
  }

  getDuration(): number {
    return this.duration
  }

  getCurrentTime(): number {
    if (!this.isPlayingFlag || !this.audioContext) {
      return this.startOffset
    }

    const elapsed = (this.audioContext.currentTime - this.startedAtContextTime) * this.playbackSpeed
    return Math.min(this.startOffset + elapsed, this.duration)
  }

  setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  /**
   * Start progress tracking interval (250ms updates)
   */
  private startProgressTracking(): void {
    this.stopProgressTracking()

    this.progressInterval = window.setInterval(() => {
      if (this.isPlayingFlag && this.audioContext) {
        const currentTime = this.getCurrentTime()
        this.callbacks.onProgress?.(currentTime, this.duration)
      }
    }, 250)
  }

  /**
   * Stop progress tracking interval
   */
  private stopProgressTracking(): void {
    if (this.progressInterval !== null) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }
  }

  destroy(): void {
    if (this.isPlayingFlag) {
      this.pause()
    }

    this.stopProgressTracking()

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect()
      } catch (err) {
        // Already disconnected
      }
      this.sourceNode = null
    }

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

    this.audioBuffer = null
    this.started = false
    this.isLoadedFlag = false
    this.isPlayingFlag = false
    this.currentUrl = null
    this.audioUnlocked = false
    this.startOffset = 0
    this.duration = 0

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
