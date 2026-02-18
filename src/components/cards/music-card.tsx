// src/components/cards/music-card.tsx
'use client'

import { useState } from 'react'
import { Music, GripVertical, ExternalLink } from 'lucide-react'
import { SiSpotify, SiApplemusic, SiSoundcloud, SiBandcamp, SiAudiomack } from 'react-icons/si'
import { useThemeStore } from '@/stores/theme-store'
import { getEmbedUrl } from '@/lib/platform-embed'
import type { EmbedPlatform } from '@/lib/platform-embed'
import type { Card, MusicCardContent, MusicPlatform } from '@/types/card'
import { isMusicContent } from '@/types/card'

// Platform icon mapping
const PLATFORM_ICONS: Record<MusicPlatform, React.ComponentType<{ className?: string }>> = {
  spotify: SiSpotify,
  'apple-music': SiApplemusic,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  audiomack: SiAudiomack,
  'generic-music': Music,
}

// Platform colors for accents
const PLATFORM_COLORS: Record<MusicPlatform, string> = {
  spotify: '#1DB954',
  'apple-music': '#FA243C',
  soundcloud: '#FF5500',
  bandcamp: '#629AA9',
  audiomack: '#FFA500',
  'generic-music': '#8B5CF6',
}

// Platform display names
const PLATFORM_NAMES: Record<MusicPlatform, string> = {
  spotify: 'Spotify',
  'apple-music': 'Apple Music',
  soundcloud: 'SoundCloud',
  bandcamp: 'Bandcamp',
  audiomack: 'Audiomack',
  'generic-music': 'Music Link',
}

// Embed heights per platform
const EMBED_HEIGHTS: Record<MusicPlatform, number> = {
  spotify: 352,
  'apple-music': 352,
  soundcloud: 166,
  bandcamp: 470,
  audiomack: 252,
  'generic-music': 152,
}

interface MusicCardProps {
  card: Card
  isPreview?: boolean
}

// Beautiful platform-colored link fallback for non-embeddable URLs
interface MusicLinkFallbackProps {
  platform: MusicPlatform
  embedUrl: string
  title?: string
}

function MusicLinkFallback({ platform, embedUrl, title }: MusicLinkFallbackProps) {
  const PlatformIcon = PLATFORM_ICONS[platform] ?? Music
  const platformColor = PLATFORM_COLORS[platform] ?? '#8B5CF6'
  const platformName = PLATFORM_NAMES[platform] ?? 'Music'

  const displayTitle = title || `Listen on ${platformName}`
  const buttonLabel = platform === 'generic-music' ? 'Open Link' : `Open on ${platformName}`

  return (
    <a
      href={embedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full no-underline"
    >
      <div
        className="w-full min-h-[120px] flex flex-col items-start justify-center gap-3 px-5 py-5 rounded-lg bg-black/40"
        style={{ borderLeft: `4px solid ${platformColor}` }}
      >
        {/* Platform icon */}
        <span style={{ color: platformColor }}>
          <PlatformIcon className="h-8 w-8" />
        </span>

        {/* Title */}
        <p className="text-sm font-medium text-white leading-snug">
          {displayTitle}
        </p>

        {/* Open link button */}
        <span
          className="inline-flex items-center gap-1 text-xs font-medium"
          style={{ color: platformColor }}
        >
          {buttonLabel}
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>
    </a>
  )
}

export function MusicCard({ card, isPreview = false }: MusicCardProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const [loadError, setLoadError] = useState(false)

  // Type guard for content
  if (!isMusicContent(card.content)) {
    return <MusicCardPlaceholder />
  }

  const content = card.content as MusicCardContent
  const { platform, embedUrl, embedIframeUrl, thumbnailUrl, title, embeddable } = content

  // No platform/URL configured yet
  if (!platform || !embedUrl) {
    return <MusicCardPlaceholder />
  }

  // Non-embeddable URL or generic-music — show link fallback
  if (embeddable === false || platform === 'generic-music') {
    return (
      <MusicLinkFallback
        platform={platform}
        embedUrl={embedUrl}
        title={title}
      />
    )
  }

  const PlatformIcon = PLATFORM_ICONS[platform] ?? Music
  const platformColor = PLATFORM_COLORS[platform] ?? '#8B5CF6'
  const platformName = PLATFORM_NAMES[platform] ?? 'Music'

  // Use custom height from embed code if available, otherwise use default
  const embedHeight = (content.embedHeight as number) || EMBED_HEIGHTS[platform]

  const iframeUrl = embedIframeUrl || getEmbedUrl(embedUrl, platform as EmbedPlatform)

  // Error state — graceful fallback to link card
  if (loadError) {
    return (
      <MusicLinkFallback
        platform={platform}
        embedUrl={embedUrl}
        title={title}
      />
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
        title={title || `${platformName} embed`}
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
