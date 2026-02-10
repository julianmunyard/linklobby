// src/audio/engine/audioEngine.ts
// Superpowered AudioWorklet engine for LinkLobby audio card
// Ported from Munyard Mixer's thomasAudioEngine.js pattern
//
// KEY PATTERN (from Munyard Mixer):
// - Play = AudioContext.resume() + send play command to processor
// - Pause = AudioContext.suspend()
// - The processor's processAudio() runs whenever AudioContext is running
// - Track loading is done via Superpowered.downloadAndDecode() inside the processor
//
import { SuperpoweredGlue, SuperpoweredWebAudio } from '@superpoweredsdk/web'
import type { AudioEngineCallbacks, VarispeedMode } from './types'
import type { ReverbConfig } from '@/types/audio'

const processorUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/processors/audioCardProcessor.js`
  : ''

class AudioEngine {
  private webaudioManager: any = null
  private superpowered: any = null
  private processorNode: any = null
  private started = false
  private isLoadedFlag = false
  private isPlayingFlag = false
  private currentUrl: string | null = null
  private durationSeconds = 0
  private currentTimeSeconds = 0
  private callbacks: AudioEngineCallbacks = {}
  private silentAudioElement: HTMLAudioElement | null = null
  private isIOS = false
  private audioUnlocked = false
  private pendingPlayAfterLoad = false

  async init(): Promise<void> {
    if (this.started) return

    try {
      // Detect iOS (including iPadOS which reports as Mac)
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      // Initialize Superpowered (same as Munyard Mixer thomasAudioEngine.js)
      // No WASM path — uses CDN default, matching Munyard Mixer exactly
      this.superpowered = await SuperpoweredGlue.Instantiate(
        'ExampleLicenseKey-WillExpire-OnNextUpdate'
      )
      this.webaudioManager = new SuperpoweredWebAudio(48000, this.superpowered)

      // Message handler for events from the AudioWorklet processor
      const onMessageFromProcessor = (message: any) => {
        if (message.event === 'ready') {
          console.log('AudioEngine: Superpowered processor ready')
        }

        if (message.event === 'loaded') {
          this.durationSeconds = message.data.duration
          this.isLoadedFlag = true
          console.log(`AudioEngine: Track loaded (${this.durationSeconds.toFixed(2)}s)`)
          if (this.callbacks.onLoaded) {
            this.callbacks.onLoaded(this.durationSeconds)
          }

          // Mobile: if user tapped play before track finished loading, play now
          if (this.pendingPlayAfterLoad) {
            this.pendingPlayAfterLoad = false
            this.processorNode.sendMessageToAudioScope({
              type: 'command',
              data: { command: 'play' }
            })
            console.log('AudioEngine: auto-play after pending load')
          }
        }

        if (message.event === 'progress') {
          this.currentTimeSeconds = message.data.currentTime
          this.durationSeconds = message.data.duration
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress(message.data.currentTime, message.data.duration)
          }
        }

        if (message.event === 'ended') {
          this.isPlayingFlag = false
          if (this.processorNode) this.processorNode.context.suspend()
          if (this.callbacks.onEnded) {
            this.callbacks.onEnded()
          }
        }

        if (message.event === 'error') {
          console.error('AudioEngine processor error:', message.data.message)
          if (this.callbacks.onError) {
            this.callbacks.onError(message.data.message)
          }
        }
      }

      // Create AudioWorklet node (same as Munyard Mixer)
      this.processorNode = await this.webaudioManager.createAudioNodeAsync(
        processorUrl,
        'AudioCardProcessor',
        onMessageFromProcessor
      )

      // Connect to audio output — use the node's own context to avoid mismatch
      this.processorNode.connect(this.processorNode.context.destination)

      // Suspend until play is called
      this.processorNode.context.suspend()

      this.started = true
      console.log('AudioEngine initialized (Superpowered)')
    } catch (error) {
      console.error('Failed to initialize AudioEngine:', error)
      throw error
    }
  }

  /**
   * iOS silent audio unlock — matches Munyard Mixer pattern exactly.
   * Must be called in a user gesture handler. Awaits audio.play() to ensure
   * the media channel is actually unlocked before context.resume() is called.
   */
  private ensureUnlockedElement(): void {
    if (this.silentAudioElement) return

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
  }

  /**
   * Unlock iOS media channel by awaiting silent audio.play().
   * Matches Munyard Mixer: await audio.play() + 20ms delay, then ctx.resume() works.
   */
  async ensureUnlocked(): Promise<void> {
    if (!this.isIOS || this.audioUnlocked) return

    this.ensureUnlockedElement()

    try {
      // audio.play() is called synchronously in the user gesture — this is the
      // media activation. Awaiting ensures it actually starts before we proceed.
      await this.silentAudioElement!.play()
      this.audioUnlocked = true
      // Small delay matching Munyard Mixer pattern
      await new Promise(resolve => setTimeout(resolve, 20))
      console.log('iOS media channel unlocked')
    } catch (err) {
      console.warn('Silent audio unlock failed:', err)
    }
  }

  async loadTrack(url: string): Promise<void> {
    if (!this.processorNode) {
      throw new Error('AudioEngine not initialized')
    }

    // Don't reload if same URL — but fire onLoaded so new listeners sync state
    if (this.currentUrl === url && this.isLoadedFlag) {
      if (this.callbacks.onLoaded) {
        this.callbacks.onLoaded(this.durationSeconds)
      }
      return
    }

    // Stop current playback
    if (this.isPlayingFlag) {
      this.pause()
    }

    this.isLoadedFlag = false
    this.currentUrl = url
    this.currentTimeSeconds = 0
    this.durationSeconds = 0

    // Send loadTrack command to processor
    // The processor calls Superpowered.downloadAndDecode() internally
    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'loadTrack', url }
    })
  }

  /**
   * Play — matches Munyard Mixer's playAll() pattern:
   * 1. iOS: await audio.play() to unlock media channel (first call in gesture)
   * 2. await ctx.resume() if suspended
   * 3. Send play command (or loadTrack + pendingPlayAfterLoad if track not loaded)
   *
   * This is async but the FIRST await is always a media activation (audio.play()
   * on iOS, or context.resume() on Android/desktop) which IS in the user gesture.
   * Unlike the previous broken attempt, there is NO long await (like init()) before
   * the media activation — init is eager and already complete by the time play runs.
   */
  async play(): Promise<void> {
    if (!this.processorNode) {
      console.warn('Cannot play: not initialized')
      return
    }

    // iOS: unlock media channel FIRST (audio.play() is the first call in the
    // gesture, matching Munyard Mixer). Must complete before ctx.resume().
    if (this.isIOS && !this.audioUnlocked) {
      await this.ensureUnlocked()
    }

    // Resume AudioContext — on iOS the media channel is now unlocked so this works.
    // On Android/desktop, context.resume() IS the first async call in the gesture.
    if (this.processorNode.context.state !== 'running') {
      await this.processorNode.context.resume()
    }

    // If track hasn't loaded yet (mobile: downloadAndDecode may have failed
    // while context was auto-suspended), re-send loadTrack now that context
    // is running, and auto-play when the track finishes loading.
    if (!this.isLoadedFlag) {
      if (this.currentUrl) {
        this.processorNode.sendMessageToAudioScope({
          type: 'command',
          data: { command: 'loadTrack', url: this.currentUrl }
        })
        this.pendingPlayAfterLoad = true
        this.isPlayingFlag = true
        console.log('AudioEngine: play pending (track loading after context resume)')
      } else {
        console.warn('Cannot play: no track URL')
      }
      return
    }

    // Track is loaded — send play command (resets ended state in processor)
    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'play' }
    })

    this.isPlayingFlag = true
    console.log('AudioEngine: play')
  }

  pause(): void {
    if (!this.processorNode) return

    this.pendingPlayAfterLoad = false

    // Suspend AudioContext — this stops processAudio() from being called
    this.processorNode.context.suspend()

    this.isPlayingFlag = false
    console.log('AudioEngine: pause')
  }

  seek(position: number): void {
    if (!this.processorNode || !this.isLoadedFlag) return

    // Clamp to valid range
    const clampedPosition = Math.max(0, Math.min(position, this.durationSeconds))
    const positionMs = clampedPosition * 1000

    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'seek', positionMs }
    })

    this.currentTimeSeconds = clampedPosition
    console.log(`AudioEngine: seek to ${clampedPosition.toFixed(2)}s`)
  }

  setVarispeed(speed: number, mode: VarispeedMode): void {
    if (!this.processorNode) return

    const clampedSpeed = Math.max(0.5, Math.min(1.5, speed))
    const isNatural = mode === 'natural'

    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'setVarispeed', speed: clampedSpeed, isNatural }
    })
  }

  setReverbConfig(config: ReverbConfig): void {
    if (!this.processorNode) return

    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: {
        command: 'setReverbConfig',
        config: {
          enabled: config.enabled,
          mix: config.mix,
          roomSize: config.roomSize,
          damp: config.damp,
          width: config.width,
          predelayMs: config.predelayMs,
        }
      }
    })
  }

  setReverbMix(mix: number): void {
    if (!this.processorNode) return

    const clampedMix = Math.max(0, Math.min(1, mix))

    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'setReverbMix', mix: clampedMix }
    })
  }

  setLooping(enabled: boolean): void {
    if (!this.processorNode) return

    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'setLooping', enabled }
    })

    console.log(`Looping ${enabled ? 'enabled' : 'disabled'}`)
  }

  getCurrentTime(): number {
    return this.currentTimeSeconds
  }

  getDuration(): number {
    return this.durationSeconds
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

  /**
   * Check if the engine has been initialized (AudioContext created).
   * Used by useAudioPlayer to decide whether to defer track loading.
   */
  isStarted(): boolean {
    return this.started
  }

  /**
   * Set a pending track URL without requiring engine initialization.
   * The URL will be loaded when play() is called and triggers init.
   */
  setPendingTrack(url: string): void {
    this.currentUrl = url
    this.isLoadedFlag = false
    this.currentTimeSeconds = 0
    this.durationSeconds = 0
  }

  destroy(): void {
    if (this.isPlayingFlag) {
      this.pause()
    }

    if (this.processorNode) {
      this.processorNode.disconnect()
      this.processorNode = null
    }

    if (this.processorNode) {
      this.processorNode.context.close()
    }

    this.webaudioManager = null

    if (this.silentAudioElement) {
      this.silentAudioElement.pause()
      this.silentAudioElement.src = ''
      if (this.silentAudioElement.parentNode) {
        this.silentAudioElement.parentNode.removeChild(this.silentAudioElement)
      }
      this.silentAudioElement = null
    }

    this.started = false
    this.isLoadedFlag = false
    this.isPlayingFlag = false
    this.pendingPlayAfterLoad = false
    this.currentUrl = null
    this.superpowered = null
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
