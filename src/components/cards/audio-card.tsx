'use client'

import { AudioPlayer } from '@/components/audio/audio-player'
import { isAudioContent } from '@/types/card'
import type { Card } from '@/types/card'
import { useThemeStore } from '@/stores/theme-store'

interface AudioCardProps {
  card: Card
  isPreview?: boolean   // true in editor preview, false on public page
}

export function AudioCard({ card, isPreview = false }: AudioCardProps) {
  const content = card.content
  const themeId = useThemeStore((s) => s.themeId)

  // Map ThemeId to ThemeVariant
  const themeVariantMap: Record<string, 'instagram-reels' | 'mac-os' | 'system-settings' | 'receipt' | 'ipod-classic' | 'vcr-menu'> = {
    'instagram-reels': 'instagram-reels',
    'mac-os': 'mac-os',
    'macintosh': 'mac-os', // Legacy name
    'system-settings': 'system-settings',
    'receipt': 'receipt',
    'ipod-classic': 'ipod-classic',
    'vcr-menu': 'vcr-menu',
  }
  const themeVariant = themeVariantMap[themeId] || 'instagram-reels'

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

  // Render AudioPlayer with all configured settings + theme variant
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
      themeVariant={themeVariant}
      pageId={card.page_id}
    />
  )
}
