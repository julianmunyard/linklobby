// src/audio/engine/types.ts
export type VarispeedMode = 'natural' | 'timestretch'

export interface AudioEngineState {
  isPlaying: boolean
  isLoaded: boolean
  currentTime: number      // seconds
  duration: number         // seconds
  progress: number         // 0-1
  speed: number            // 0.5-1.5
  varispeedMode: VarispeedMode
  reverbMix: number        // 0-1 (visitor-controlled wet/dry)
}

export interface AudioEngineCallbacks {
  onProgress?: (time: number, duration: number) => void
  onEnded?: () => void
  onLoaded?: (duration: number) => void
  onError?: (error: string) => void
}

// Messages sent from main thread to AudioWorklet processor
export type AudioEngineMessage =
  | { type: 'command'; data: { command: 'play' } }
  | { type: 'command'; data: { command: 'pause' } }
  | { type: 'command'; data: { command: 'seek'; positionMs: number } }
  | { type: 'command'; data: { command: 'setVarispeed'; speed: number; isNatural: boolean } }
  | { type: 'command'; data: { command: 'setReverbMix'; mix: number } }
  | { type: 'command'; data: { command: 'setReverbEnabled'; enabled: boolean } }
  | { type: 'command'; data: { command: 'setReverbConfig'; config: Record<string, number | boolean> } }
  | { type: 'command'; data: { command: 'loadTrack'; url: string } }
  | { type: 'command'; data: { command: 'setLooping'; enabled: boolean } }

// Messages sent from AudioWorklet processor to main thread
export type ProcessorEvent =
  | { event: 'ready' }
  | { event: 'loaded'; data: { duration: number } }
  | { event: 'progress'; data: { currentTime: number; duration: number } }
  | { event: 'ended' }
  | { event: 'error'; data: { message: string } }
