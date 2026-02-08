// public/worklet/audioProcessor.js
// AudioWorklet processor for Superpowered SDK
// Currently unused - Web Audio fallback mode is active
//
// This processor will be used when Superpowered SDK is integrated.
// Ported from Munyard Mixer's timelineProcessor.js, simplified for single-track playback.

/**
 * NOTE: This processor is not currently loaded.
 * The AudioEngine uses standard Web Audio API (AudioBufferSourceNode) as a fallback.
 *
 * When Superpowered SDK is integrated:
 * 1. Import SuperpoweredWebAudio from @superpoweredsdk/web
 * 2. Extend SuperpoweredWebAudio.AudioWorkletProcessor
 * 3. Handle messages: loadTrack, play, pause, seek, setVarispeed, setReverbConfig, setReverbMix, setLooping
 * 4. Use Superpowered's AdvancedAudioPlayer for varispeed
 * 5. Use Superpowered's Reverb for reverb effect
 * 6. Chain: AdvancedAudioPlayer -> Reverb -> output
 *
 * Expected message types (from audioEngine.ts):
 * - { type: 'command', data: { command: 'play' } }
 * - { type: 'command', data: { command: 'pause' } }
 * - { type: 'command', data: { command: 'seek', position: number } }
 * - { type: 'command', data: { command: 'setVarispeed', speed: number, isNatural: boolean } }
 * - { type: 'command', data: { command: 'setReverbMix', mix: number } }
 * - { type: 'command', data: { command: 'setReverbConfig', config: {...} } }
 * - { type: 'command', data: { command: 'loadTrack', url: string } }
 * - { type: 'command', data: { command: 'setLooping', enabled: boolean } }
 *
 * Expected outgoing messages:
 * - { event: 'ready' }
 * - { event: 'loaded', data: { duration: number } }
 * - { event: 'progress', data: { currentTime: number, duration: number } }
 * - { event: 'ended' }
 * - { event: 'error', data: { message: string } }
 */

// Placeholder for future Superpowered integration
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    console.log('AudioProcessor created (placeholder - not used in fallback mode)')
  }

  process(inputs, outputs, parameters) {
    // Passthrough
    return true
  }
}

// Register processor (required for AudioWorklet)
if (typeof registerProcessor !== 'undefined') {
  registerProcessor('AudioProcessor', AudioProcessor)
}
