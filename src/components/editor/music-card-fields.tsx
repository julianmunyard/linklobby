// src/components/editor/music-card-fields.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { SiSpotify, SiApplemusic, SiSoundcloud, SiBandcamp, SiAudiomack } from 'react-icons/si'
import { detectPlatform, fetchPlatformEmbed, isMusicPlatform } from '@/lib/platform-embed'
import type { MusicCardContent, MusicPlatform } from '@/types/card'

// Platform display info
const PLATFORM_INFO: Record<MusicPlatform, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
  spotify: { name: 'Spotify', icon: SiSpotify },
  'apple-music': { name: 'Apple Music', icon: SiApplemusic },
  soundcloud: { name: 'SoundCloud', icon: SiSoundcloud },
  bandcamp: { name: 'Bandcamp', icon: SiBandcamp },
  audiomack: { name: 'Audiomack', icon: SiAudiomack },
}

interface MusicCardFieldsProps {
  content: MusicCardContent
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
}

export function MusicCardFields({ content, onChange, cardId }: MusicCardFieldsProps) {
  const [urlInput, setUrlInput] = useState(content.embedUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle URL input blur - detect platform and fetch metadata
  async function handleUrlBlur() {
    const url = urlInput.trim()

    // Clear if empty
    if (!url) {
      onChange({
        platform: undefined,
        embedUrl: undefined,
        embedIframeUrl: undefined,
        thumbnailUrl: undefined,
        title: undefined,
      })
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Detect platform from URL
      const detected = detectPlatform(url)

      if (!detected) {
        setError('URL not recognized. Supported: Spotify, Apple Music, SoundCloud, Bandcamp, Audiomack')
        return
      }

      const { platform } = detected

      // Check if it's a music platform
      if (!isMusicPlatform(platform)) {
        setError(`${platform} is not a music platform. Use Video card for videos.`)
        return
      }

      // Fetch metadata via oEmbed (if available)
      const embedInfo = await fetchPlatformEmbed(url, platform)

      onChange({
        platform,
        embedUrl: url,
        embedIframeUrl: embedInfo.embedUrl,
        thumbnailUrl: embedInfo.thumbnailUrl,
        title: embedInfo.title,
      })

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load music'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Current platform info for display
  const currentPlatform = content.platform ? PLATFORM_INFO[content.platform] : null
  const PlatformIcon = currentPlatform?.icon

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="musicUrl">Music URL</Label>
        <div className="relative">
          <Input
            id="musicUrl"
            type="url"
            placeholder="Paste Spotify, Apple Music, SoundCloud, Bandcamp, or Audiomack URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlBlur()}
            disabled={isLoading}
            className="pr-10"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a link to a track, album, or playlist
        </p>
      </div>

      {/* Platform Detection Result */}
      {content.platform && currentPlatform && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {PlatformIcon && <PlatformIcon className="h-5 w-5" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{currentPlatform.name}</p>
            {content.title && (
              <p className="text-xs text-muted-foreground truncate">{content.title}</p>
            )}
          </div>
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
        </div>
      )}

      {/* Bandcamp Note */}
      {content.platform === 'bandcamp' && !content.bandcampAlbumId && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Bandcamp embeds require additional processing. The embed may take a moment to load.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Supported Platforms Help */}
      {!content.platform && !error && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Supported platforms:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PLATFORM_INFO).map(([key, { name, icon: Icon }]) => (
              <span key={key} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
