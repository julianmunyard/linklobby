// src/components/cards/music-card.tsx
'use client'

import { useState } from 'react'
import { Music, GripVertical } from 'lucide-react'
import { SiSpotify, SiApplemusic, SiSoundcloud, SiBandcamp, SiAudiomack } from 'react-icons/si'
import { useThemeStore } from '@/stores/theme-store'
import { getEmbedUrl } from '@/lib/platform-embed'
import type { Card, MusicCardContent, MusicPlatform } from '@/types/card'
import { isMusicContent } from '@/types/card'

// Platform icon mapping
const PLATFORM_ICONS: Record<MusicPlatform, React.ComponentType<{ className?: string }>> = {
  spotify: SiSpotify,
  'apple-music': SiApplemusic,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  audiomack: SiAudiomack,
}

// Platform colors for accents
const PLATFORM_COLORS: Record<MusicPlatform, string> = {
  spotify: '#1DB954',
  'apple-music': '#FA243C',
  soundcloud: '#FF5500',
  bandcamp: '#629AA9',
  audiomack: '#FFA500',
}

// Embed heights per platform
const EMBED_HEIGHTS: Record<MusicPlatform, number> = {
  spotify: 352,
  'apple-music': 352,
  soundcloud: 166,
  bandcamp: 470,
  audiomack: 252,
}

interface MusicCardProps {
  card: Card
  isPreview?: boolean
}

export function MusicCard({ card, isPreview = false }: MusicCardProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const [loadError, setLoadError] = useState(false)

  // Type guard for content
  if (!isMusicContent(card.content)) {
    return <MusicCardPlaceholder />
  }

  const content = card.content as MusicCardContent
  const { platform, embedUrl, embedIframeUrl, thumbnailUrl, title } = content

  // No platform/URL configured yet
  if (!platform || !embedUrl) {
    return <MusicCardPlaceholder />
  }

  const PlatformIcon = PLATFORM_ICONS[platform]
  const platformColor = PLATFORM_COLORS[platform]

  // Use custom height from embed code if available, otherwise use default
  const embedHeight = (content.embedHeight as number) || EMBED_HEIGHTS[platform]

  // Get iframe URL
  const iframeUrl = embedIframeUrl || getEmbedUrl(embedUrl, platform)

  // Error state - fallback link to platform
  if (loadError) {
    return (
      <div className="relative w-full overflow-hidden bg-muted flex flex-col items-center justify-center p-6 text-center"
           style={{ minHeight: embedHeight }}>
        <span style={{ color: platformColor }}>
          <PlatformIcon className="h-10 w-10 mb-3" />
        </span>
        <p className="text-sm text-muted-foreground mb-2">Content unavailable</p>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Open on {platform.replace('-', ' ')}
        </a>
      </div>
    )
  }

  // Show embed directly (no click-to-load)
  // Transparent background so page bg shows through embed gaps
  return (
    <div className="relative w-full group">
      <iframe
        src={iframeUrl}
        width="100%"
        height={embedHeight}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        onError={() => setLoadError(true)}
        title={title || `${platform} embed`}
        style={{ background: 'transparent' }}
      />
      {/* Drag handle overlay - appears on hover, sits above iframe */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded p-1.5 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  )
}

// Placeholder when no music configured
function MusicCardPlaceholder() {
  return (
    <div className="relative w-full aspect-video overflow-hidden bg-muted flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <Music className="h-12 w-12 mx-auto mb-2" />
        <p>Add music URL</p>
        <p className="text-xs mt-1">Spotify, Apple Music, SoundCloud, Bandcamp, Audiomack</p>
      </div>
    </div>
  )
}
