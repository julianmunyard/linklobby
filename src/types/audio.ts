// src/types/audio.ts
export interface AudioTrack {
  id: string              // crypto.randomUUID()
  title: string
  artist: string
  duration: number        // seconds
  audioUrl: string        // Supabase Storage public URL (MP3)
  storagePath: string     // For deletion
  waveformData?: number[] // Pre-computed waveform peaks (128 data points)
}

export interface ReverbConfig {
  mix: number          // Wet/dry mix (0-1), default 0.3
  width: number        // Stereo width (0-1), default 0.8
  damp: number         // High frequency damping (0-1), default 0.5
  roomSize: number     // Reverb decay time (0-1), default 0.5
  predelayMs: number   // Pre-delay in ms (0-200), default 20
  enabled: boolean     // Whether reverb is active, default false
}

export interface PlayerColors {
  borderColor?: string         // Card border/outline color
  elementBgColor?: string      // Button fills, slider track backgrounds
  foregroundColor?: string     // Play icon, knob ticks, text, active highlights
}

export interface AudioCardContent {
  tracks: AudioTrack[]
  albumArtUrl?: string           // Square album art (shared for all tracks)
  albumArtStoragePath?: string   // For deletion
  currentTrackIndex?: number     // Default 0
  showWaveform?: boolean         // true = waveform, false = progress bar (default true)
  looping?: boolean              // Artist-set loop toggle (default false)
  autoplay?: boolean             // Auto-play on page load (default false)
  reverbConfig?: ReverbConfig    // Artist-configured reverb parameters
  playerColors?: PlayerColors    // 3 color customization fields
  transparentBackground?: boolean
  textColor?: string
  blinkieColors?: {
    outerBox?: string    // SystemSettingsCard outer frame background
    innerBox?: string    // SystemSettingsCard inner content area background
    text?: string        // Text and border color throughout
    playerBox?: string   // Player container + inner boxes (progress, varispeed, reverb) background
    buttons?: string     // Transport buttons and varispeed bar fill
  }
  blinkieBoxBackgrounds?: {
    cardOuter?: string  // System 7 window chrome (outermost frame)
    cardOuterDim?: number // 0–100 intensity (100 = full, 0 = hidden)
    cardBgUrl?: string         // Uploaded background image URL
    cardBgStoragePath?: string // For deletion
    cardBgScale?: number       // Zoom level (1 = cover, >1 = zoomed in)
    cardBgPosX?: number        // Translate X % (0 = centered)
    cardBgPosY?: number        // Translate Y % (0 = centered)
  }
}

export const DEFAULT_REVERB_CONFIG: ReverbConfig = {
  mix: 0.3,
  width: 0.8,
  damp: 0.5,
  roomSize: 0.5,
  predelayMs: 20,
  enabled: false
}

export const DEFAULT_AUDIO_CONTENT: AudioCardContent = {
  tracks: [],
  showWaveform: true,
  looping: false,
  reverbConfig: DEFAULT_REVERB_CONFIG,
}
