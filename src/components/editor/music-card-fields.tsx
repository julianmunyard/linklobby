// src/components/editor/music-card-fields.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, AlertCircle, CheckCircle2, Music } from 'lucide-react'
import { SiSpotify, SiApplemusic, SiSoundcloud, SiBandcamp, SiAudiomack } from 'react-icons/si'
import { detectPlatform, detectPlatformLoose, fetchPlatformEmbed, isMusicPlatform } from '@/lib/platform-embed'
import type { EmbedPlatform } from '@/lib/platform-embed'
import type { MusicCardContent, MusicPlatform } from '@/types/card'

// Platform display info
const PLATFORM_INFO: Record<MusicPlatform, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
  spotify: { name: 'Spotify', icon: SiSpotify },
  'apple-music': { name: 'Apple Music', icon: SiApplemusic },
  soundcloud: { name: 'SoundCloud', icon: SiSoundcloud },
  bandcamp: { name: 'Bandcamp', icon: SiBandcamp },
  audiomack: { name: 'Audiomack', icon: SiAudiomack },
  'generic-music': { name: 'Music', icon: Music },
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

  // Extract Bandcamp embed URL and height from iframe code or direct URL
  function extractBandcampEmbed(input: string): { embedUrl: string; originalUrl?: string; height?: number } | null {
    // Check for iframe embed code
    const iframeSrcMatch = input.match(/src=["']([^"']*bandcamp\.com\/EmbeddedPlayer[^"']*)["']/i)
    if (iframeSrcMatch) {
      // Try to extract height from style attribute
      const heightMatch = input.match(/height:\s*(\d+)px/i)
      // Also try to extract the original URL from the <a> tag
      const linkMatch = input.match(/href=["']([^"']*bandcamp\.com[^"']*)["']/i)
      return {
        embedUrl: iframeSrcMatch[1],
        originalUrl: linkMatch?.[1],
        height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
      }
    }

    // Check for direct EmbeddedPlayer URL
    if (input.includes('bandcamp.com/EmbeddedPlayer/')) {
      // Detect size from URL: size=small (~120px) vs size=large (~470px)
      const isSmall = input.includes('/size=small')
      return {
        embedUrl: input,
        height: isSmall ? 120 : 470,
      }
    }

    return null
  }

  // Handle URL input blur - detect platform and fetch metadata
  async function handleUrlBlur() {
    const input = urlInput.trim()

    // Clear if empty
    if (!input) {
      onChange({
        platform: undefined,
        embedUrl: undefined,
        embedIframeUrl: undefined,
        thumbnailUrl: undefined,
        title: undefined,
        embeddable: undefined,
      })
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Special handling for Bandcamp embed code or EmbeddedPlayer URL
      const bandcampEmbed = extractBandcampEmbed(input)
      if (bandcampEmbed) {
        onChange({
          platform: 'bandcamp' as MusicPlatform,
          embedUrl: bandcampEmbed.originalUrl || bandcampEmbed.embedUrl,
          embedIframeUrl: bandcampEmbed.embedUrl,
          embedHeight: bandcampEmbed.height,
          thumbnailUrl: undefined,
          title: undefined,
          embeddable: true,
        })
        return
      }

      // Detect platform from URL using strict regex matching
      const detected = detectPlatform(input)

      if (detected) {
        const { platform } = detected

        // Check if it's a video platform — redirect user to Video card
        if (!isMusicPlatform(platform)) {
          setError(`${platform} is not a music platform. Use the Video card for videos.`)
          return
        }

        // Platforms whose iframes are blocked (refused to connect)
        const nonIframePlatforms: MusicPlatform[] = ['apple-music']

        // Strict match: fetch metadata via oEmbed (if available)
        // platform here comes from detectPlatform which returns EmbedPlatform values only
        const embedInfo = await fetchPlatformEmbed(input, platform as EmbedPlatform)

        onChange({
          platform,
          embedUrl: input,
          embedIframeUrl: nonIframePlatforms.includes(platform as MusicPlatform) ? undefined : embedInfo.embedUrl,
          thumbnailUrl: embedInfo.thumbnailUrl,
          title: embedInfo.title,
          embeddable: !nonIframePlatforms.includes(platform as MusicPlatform),
        })
        return
      }

      // Strict detection returned null — try loose domain-based fallback
      const loosePlatform = detectPlatformLoose(input)

      if (loosePlatform === null) {
        // Not even a URL — show error
        setError('Please enter a valid URL. Supported: Spotify, Apple Music, SoundCloud, Bandcamp, Audiomack, or any music link.')
        return
      }

      // Known or unknown music domain — save as non-embeddable link fallback
      onChange({
        platform: loosePlatform,
        embedUrl: input,
        embedIframeUrl: undefined,
        thumbnailUrl: undefined,
        title: undefined,
        embeddable: false,
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
            type="text"
            placeholder="Paste music URL or Bandcamp embed code"
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
          Paste a link to a track, album, or playlist. For Bandcamp, you can also paste the embed code from &quot;Share/Embed&quot;.
        </p>
      </div>

      {/* Platform Detection Result */}
      {content.platform && currentPlatform && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {PlatformIcon && <PlatformIcon className="h-5 w-5" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {currentPlatform.name}
              {content.embeddable === false && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">(link card)</span>
              )}
            </p>
            {content.title && (
              <p className="text-xs text-muted-foreground truncate">{content.title}</p>
            )}
          </div>
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
        </div>
      )}

      {/* No Border Option */}
      {content.platform && (
        <div className="flex items-center justify-between">
          <Label htmlFor="noBorder" className="text-sm">Remove card border</Label>
          <Switch
            id="noBorder"
            checked={content.noBorder ?? false}
            onCheckedChange={(checked) => onChange({ noBorder: checked })}
          />
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
            {Object.entries(PLATFORM_INFO)
              .filter(([key]) => key !== 'generic-music')
              .map(([key, { name, icon: Icon }]) => (
                <span key={key} className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {name}
                </span>
              ))}
          </div>
          <p>Any music URL also works — shown as a link card.</p>
        </div>
      )}
    </div>
  )
}
