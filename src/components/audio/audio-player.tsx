'use client'

import { PlayerControls } from './player-controls'
import { WaveformDisplay } from './waveform-display'
import type { AudioTrack, ReverbConfig, PlayerColors } from '@/types/audio'
import { useAudioPlayer } from '@/audio/hooks/useAudioPlayer'
import Image from 'next/image'

interface AudioPlayerProps {
  tracks: AudioTrack[]
  albumArtUrl?: string
  showWaveform?: boolean          // Default true
  looping?: boolean               // Default false
  reverbConfig?: ReverbConfig
  playerColors?: PlayerColors
  cardId: string
  isEditing?: boolean             // Show editor-only controls
}

export function AudioPlayer({
  tracks,
  albumArtUrl,
  showWaveform = true,
  looping = false,
  reverbConfig,
  playerColors,
  cardId,
  isEditing = false
}: AudioPlayerProps) {
  const {
    isPlaying,
    isLoaded,
    isLoading,
    currentTime,
    duration,
    progress,
    togglePlay,
    seek
  } = useAudioPlayer({
    trackUrl: tracks[0]?.audioUrl || '',
    looping,
    reverbConfig,
    cardId
  })

  if (tracks.length === 0) {
    return (
      <div className="w-full p-6 text-center text-muted-foreground">
        <p className="text-sm">No audio uploaded yet</p>
        {isEditing && <p className="text-xs mt-1">Upload a track to get started</p>}
      </div>
    )
  }

  const currentTrack = tracks[0] // For now, single track support

  return (
    <div
      className="w-full p-4 space-y-4"
      style={{
        borderColor: playerColors?.borderColor,
        color: playerColors?.foregroundColor
      }}
    >
      {/* Album Art */}
      {albumArtUrl && (
        <div className="flex justify-center">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden">
            <Image
              src={albumArtUrl}
              alt={currentTrack.title || 'Album art'}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Track Info */}
      <div className="text-center">
        <h3 className="font-semibold">{currentTrack.title || 'Untitled'}</h3>
        {currentTrack.artist && (
          <p className="text-sm opacity-80">{currentTrack.artist}</p>
        )}
      </div>

      {/* Waveform/Progress Display */}
      <WaveformDisplay
        showWaveform={showWaveform}
        waveformData={currentTrack.waveformData}
        progress={progress}
        currentTime={currentTime}
        duration={duration}
        onSeek={seek}
        foregroundColor={playerColors?.foregroundColor}
        elementBgColor={playerColors?.elementBgColor}
      />

      {/* Player Controls */}
      <div className="flex justify-center">
        <PlayerControls
          isPlaying={isPlaying}
          isLoaded={isLoaded}
          isLoading={isLoading}
          onTogglePlay={togglePlay}
          foregroundColor={playerColors?.foregroundColor}
          elementBgColor={playerColors?.elementBgColor}
        />
      </div>
    </div>
  )
}
