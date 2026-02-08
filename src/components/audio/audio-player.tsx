'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Settings } from 'lucide-react'
import type { AudioTrack, AudioCardContent, ReverbConfig } from '@/types/audio'
import { useAudioPlayer } from '@/audio/hooks/useAudioPlayer'
import { PlayerControls } from './player-controls'
import { WaveformDisplay } from './waveform-display'
import { VarispeedSlider } from './varispeed-slider'
import { ReverbKnob } from './reverb-knob'
import { ReverbConfigModal } from './reverb-config-modal'
import { TrackList } from './track-list'
import { cn } from '@/lib/utils'
import { trackAudioPlay } from '@/lib/analytics/track-event'

type ThemeVariant = 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu'

interface AudioPlayerProps {
  tracks: AudioTrack[]
  albumArtUrl?: string
  showWaveform?: boolean
  looping?: boolean
  reverbConfig?: ReverbConfig
  playerColors?: AudioCardContent['playerColors']
  cardId: string
  pageId: string
  isEditing?: boolean         // In editor = show reverb config button
  onContentChange?: (updates: Record<string, unknown>) => void  // For editor updates
  themeVariant?: ThemeVariant
  className?: string
}

export function AudioPlayer({
  tracks,
  albumArtUrl,
  showWaveform = true,
  looping = false,
  reverbConfig,
  playerColors,
  cardId,
  pageId,
  isEditing = false,
  onContentChange,
  themeVariant = 'instagram-reels',
  className = ''
}: AudioPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  if (tracks.length === 0) {
    return (
      <div className="w-full p-6 text-center text-muted-foreground">
        <p className="text-sm">No audio uploaded yet</p>
        {isEditing && <p className="text-xs mt-1">Upload a track to get started</p>}
      </div>
    )
  }

  const currentTrack = tracks[currentTrackIndex]
  const currentTrackUrl = currentTrack?.audioUrl

  // Use the audio player hook
  const player = useAudioPlayer({
    cardId,
    trackUrl: currentTrackUrl,
    looping,
    reverbConfig,
    onEnded: () => {
      // Auto-advance to next track if multi-track and not looping
      if (!looping && tracks.length > 1) {
        const nextIndex = (currentTrackIndex + 1) % tracks.length
        setCurrentTrackIndex(nextIndex)
      }
    }
  })

  // Handle track switching
  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index)
  }

  // Handle reverb config changes in editor
  const handleReverbConfigChange = (newConfig: ReverbConfig) => {
    if (onContentChange) {
      onContentChange({ reverbConfig: newConfig })
    }
  }

  // Handle play with analytics tracking
  const handlePlay = () => {
    // Track audio play on public pages only (not in editor)
    if (!isEditing && !player.isPlaying && pageId) {
      trackAudioPlay({
        cardId,
        pageId,
        trackTitle: currentTrack?.title,
        duration: currentTrack?.duration
      })
    }
    // Toggle playback
    player.togglePlay()
  }

  // Get waveform data from current track
  const waveformData = currentTrack?.waveformData

  // Receipt theme: force black colors so all sub-components render in monochrome
  const isReceipt = themeVariant === 'receipt'
  const effectiveForegroundColor = isReceipt ? '#1a1a1a' : playerColors?.foregroundColor
  const effectiveElementBgColor = isReceipt ? 'transparent' : playerColors?.elementBgColor

  // Theme-specific class names and styling
  const themeClasses = cn(
    'flex flex-col',
    isReceipt ? 'gap-2' : 'gap-4',
    {
      // Macintosh: Pix Chicago font, pixel-art style
      'audio-player-macintosh': themeVariant === 'mac-os',
      // Receipt: Monospace black-on-white
      'audio-player-receipt': themeVariant === 'receipt',
      // VCR: LED counter style
      'audio-player-vcr': themeVariant === 'vcr-menu',
      // System Settings: Poolsuite fonts
      'audio-player-system-settings': themeVariant === 'system-settings',
      // iPod Classic: Compact LCD screen layout
      'audio-player-ipod': themeVariant === 'ipod-classic',
    },
    className
  )

  const themeStyle: React.CSSProperties = {}

  // Apply theme-specific fonts
  if (themeVariant === 'mac-os') {
    themeStyle.fontFamily = "var(--font-pix-chicago), 'Chicago', monospace"
  } else if (themeVariant === 'system-settings') {
    themeStyle.fontFamily = 'var(--font-chikarego), var(--font-ishmeria), monospace'
  } else if (themeVariant === 'receipt') {
    themeStyle.fontFamily = 'var(--font-ticket-de-caisse), monospace'
    themeStyle.color = '#000'
  } else if (themeVariant === 'vcr-menu') {
    themeStyle.fontFamily = 'var(--font-pixter-granular), monospace'
  } else if (themeVariant === 'ipod-classic') {
    themeStyle.fontFamily = "var(--font-chicago), system-ui"
    themeStyle.fontSize = '0.875rem' // Smaller for iPod LCD
  }

  return (
    <>
      {/* Receipt theme: Section header and divider */}
      {themeVariant === 'receipt' && (
        <>
          <div className="receipt-divider">{'-'.repeat(60)}</div>
          <div className="text-center py-2 font-bold text-sm">
            ** NOW PLAYING **
          </div>
          <div className="receipt-divider">{'-'.repeat(60)}</div>
        </>
      )}

      <div className={themeClasses} style={themeStyle}>
        {/* Top row: Album art, Play/Pause, Track info */}
        <div className={cn("flex items-start", isReceipt ? "gap-2 items-center" : "gap-3")}>
        {/* Album Art — receipt: shown behind play button; other themes: separate */}
        {albumArtUrl && !isReceipt && (
          <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            <Image
              src={albumArtUrl}
              alt="Album art"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Play/Pause Control — receipt: album art as background */}
        <div className="flex-shrink-0 relative">
          {isReceipt && albumArtUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={albumArtUrl}
                alt=""
                fill
                className="object-cover"
                style={{ filter: 'grayscale(100%) contrast(1.2)' }}
              />
            </div>
          )}
          <PlayerControls
            isPlaying={player.isPlaying}
            isLoaded={player.isLoaded}
            isLoading={player.isLoading}
            onTogglePlay={handlePlay}
            foregroundColor={effectiveForegroundColor}
            elementBgColor={isReceipt ? (albumArtUrl ? 'rgba(0,0,0,0.5)' : '#1a1a1a') : effectiveElementBgColor}
            themeVariant={themeVariant}
          />
        </div>

        {/* Track Info */}
        {currentTrack && (
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3
              className={cn("font-semibold truncate", isReceipt ? "text-sm" : "text-base")}
              style={{ color: effectiveForegroundColor || 'inherit' }}
            >
              {currentTrack.title}
            </h3>
            {!isReceipt && (
              <p
                className="text-sm truncate"
                style={{ color: effectiveForegroundColor || 'inherit', opacity: 0.7 }}
              >
                {currentTrack.artist}
              </p>
            )}
            <p
              className="text-xs font-mono"
              style={{ color: effectiveForegroundColor || 'inherit', opacity: 0.5 }}
            >
              {currentTrack.artist && isReceipt ? `${currentTrack.artist} · ` : ''}
              {Math.floor(currentTrack.duration / 60)}:{String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}
            </p>
          </div>
        )}
      </div>

      {/* Waveform/Progress Bar with time display */}
      <WaveformDisplay
        showWaveform={showWaveform}
        waveformData={waveformData}
        progress={player.progress}
        currentTime={player.currentTime}
        duration={player.duration}
        onSeek={player.seek}
        foregroundColor={effectiveForegroundColor}
        elementBgColor={effectiveElementBgColor}
        themeVariant={themeVariant}
      />

      {isReceipt ? (
        /* Receipt: Varispeed + Reverb side by side in a compact row */
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <VarispeedSlider
              speed={player.speed}
              mode={player.varispeedMode}
              onSpeedChange={player.setSpeed}
              onModeChange={player.setVarispeedMode}
              foregroundColor={effectiveForegroundColor}
              elementBgColor={effectiveElementBgColor}
              themeVariant={themeVariant}
            />
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={effectiveForegroundColor}
              elementBgColor={effectiveElementBgColor}
              themeVariant={themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-1 rounded-none transition-colors"
                    style={{
                      backgroundColor: effectiveElementBgColor || 'rgba(0, 0, 0, 0.1)',
                      color: effectiveForegroundColor || 'currentColor'
                    }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-3 h-3" />
                  </button>
                }
              />
            )}
          </div>
        </div>
      ) : (
        /* Default layout: Varispeed full width, then Reverb below */
        <>
          <VarispeedSlider
            speed={player.speed}
            mode={player.varispeedMode}
            onSpeedChange={player.setSpeed}
            onModeChange={player.setVarispeedMode}
            foregroundColor={effectiveForegroundColor}
            elementBgColor={effectiveElementBgColor}
            themeVariant={themeVariant}
          />

          <div className="flex items-center justify-center gap-2">
            <ReverbKnob
              mix={player.reverbMix}
              onMixChange={player.setReverbMix}
              foregroundColor={effectiveForegroundColor}
              elementBgColor={effectiveElementBgColor}
              themeVariant={themeVariant}
            />
            {isEditing && reverbConfig && (
              <ReverbConfigModal
                config={reverbConfig}
                onSave={handleReverbConfigChange}
                trigger={
                  <button
                    className="p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: effectiveElementBgColor || 'rgba(0, 0, 0, 0.1)',
                      color: effectiveForegroundColor || 'currentColor'
                    }}
                    aria-label="Configure reverb"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                }
              />
            )}
          </div>
        </>
      )}

      {/* Track List (multi-track only) */}
      <TrackList
        tracks={tracks}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackSelect}
        foregroundColor={effectiveForegroundColor}
        elementBgColor={effectiveElementBgColor}
      />
    </div>

      {/* Receipt theme: Closing divider */}
      {themeVariant === 'receipt' && (
        <div className="receipt-divider">{'-'.repeat(60)}</div>
      )}
    </>
  )
}
