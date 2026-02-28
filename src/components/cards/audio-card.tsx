'use client'

import { AudioPlayer } from '@/components/audio/audio-player'
import { isAudioContent } from '@/types/card'
import type { Card } from '@/types/card'
import { useThemeStore } from '@/stores/theme-store'

interface AudioCardProps {
  card: Card
  isPreview?: boolean   // true in editor preview, false on public page
  themeIdOverride?: string  // Pass from public page when Zustand store isn't available
}

export function AudioCard({ card, isPreview = false, themeIdOverride }: AudioCardProps) {
  const content = card.content
  const storeThemeId = useThemeStore((s) => s.themeId)
  const themeId = themeIdOverride || storeThemeId

  // Map ThemeId to ThemeVariant
  const themeVariantMap: Record<string, 'instagram-reels' | 'mac-os' | 'macintosh' | 'system-settings' | 'blinkies' | 'receipt' | 'ipod-classic' | 'vcr-menu' | 'classified'> = {
    'instagram-reels': 'instagram-reels',
    'mac-os': 'mac-os',
    'macintosh': 'macintosh',
    'system-settings': 'system-settings',
    'receipt': 'receipt',
    'ipod-classic': 'ipod-classic',
    'vcr-menu': 'vcr-menu',
    'blinkies': 'blinkies',
    'phone-home': 'blinkies',  // Phone home uses blinkies variant for audio widgets
    'artifact': 'blinkies',
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
  const hasNoTracks = !content.tracks || content.tracks.length === 0

  if (hasNoTracks && !isPreview) {
    return null
  }

  // In editor preview with no tracks, use a placeholder track so the card renders
  const placeholderTrack = {
    id: 'placeholder',
    title: 'TRACK TITLE',
    artist: 'ARTIST NAME',
    duration: 210,
    audioUrl: '',
    storagePath: '',
  }
  const displayTracks = hasNoTracks ? [placeholderTrack] : content.tracks

  // Render AudioPlayer with all configured settings + theme variant
  return (
    <AudioPlayer
      tracks={displayTracks}
      albumArtUrl={content.albumArtUrl}
      showWaveform={content.showWaveform ?? true}
      looping={content.looping ?? false}
      autoplay={content.autoplay ?? false}
      transparentBackground={content.transparentBackground ?? false}
      reverbConfig={content.reverbConfig}
      playerColors={content.playerColors}
      textColor={content.textColor}
      blinkieColors={content.blinkieColors}
      blinkieCardHasBgImage={!!(content.blinkieBoxBackgrounds?.cardBgUrl) && !(content.transparentBackground)}
      cardId={card.id}
      isEditing={isPreview}
      themeVariant={themeVariant}
      playerStyle={content.playerStyle}
      pageId={card.page_id}
    />
  )
}
