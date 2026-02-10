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

  async init(): Promise<void> {
    if (this.started) return

    try {
      // Detect iOS
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

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
   * iOS silent audio unlock pattern from Munyard Mixer
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

  play(): void {
    if (!this.processorNode || !this.isLoadedFlag) {
      console.warn('Cannot play: not loaded')
      return
    }

    // iOS unlock
    if (this.isIOS) {
      this.ensureUnlocked()
    }

    // Resume AudioContext — this makes processAudio() run in the processor
    this.processorNode.context.resume()

    // Send play command (resets ended state in processor)
    this.processorNode.sendMessageToAudioScope({
      type: 'command',
      data: { command: 'play' }
    })

    this.isPlayingFlag = true
    console.log('AudioEngine: play')
  }

  pause(): void {
    if (!this.processorNode) return

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
