'use client'

import { AudioPlayer } from '@/components/audio/audio-player'
import { isAudioContent } from '@/types/card'
import type { Card } from '@/types/card'

interface AudioCardProps {
  card: Card
  isPreview?: boolean   // true in editor preview, false on public page
}

export function AudioCard({ card, isPreview = false }: AudioCardProps) {
  const content = card.content

  // Type guard check
  if (!isAudioContent(content)) {
    return (
      <div className="w-full p-6 text-center text-muted-foreground">
        <p className="text-sm">Invalid audio card configuration</p>
      </div>
    )
  }

  // Empty state - no tracks uploaded yet
  if (!content.tracks || content.tracks.length === 0) {
    return (
      <div className="w-full p-6 text-center text-muted-foreground">
        <p className="text-sm">No audio uploaded yet</p>
        {isPreview && (
          <p className="text-xs mt-1 opacity-75">
            Upload audio tracks in the editor to get started
          </p>
        )}
      </div>
    )
  }

  // Render AudioPlayer with all configured settings
  return (
    <AudioPlayer
      tracks={content.tracks}
      albumArtUrl={content.albumArtUrl}
      showWaveform={content.showWaveform ?? true}
      looping={content.looping ?? false}
      reverbConfig={content.reverbConfig}
      playerColors={content.playerColors}
      cardId={card.id}
      isEditing={isPreview}
    />
  )
}
