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
import type { MusicCardContent, MusicPlatform, PhoneHomeLayout } from '@/types/card'
import { detectBandcampHeight, rowsForHeight } from '@/components/editor/phone-home-card-controls'

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
      // Detect size from URL params — match all Bandcamp embed variants
      const isSmall = input.includes('/size=small')
      const isMinimal = input.includes('/minimal=true')
      const isArtworkSmall = input.includes('/artwork=small')
      const hasTracklist = !input.includes('/tracklist=false')
      let height = 470 // default: large with tracklist
      if (isSmall) height = 42
      else if (isArtworkSmall && !hasTracklist) height = 120
      else if (isMinimal) height = 350
      else if (!hasTracklist) height = 470
      return {
        embedUrl: input,
        height,
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
        // Auto-detect the correct widget height from the Bandcamp URL
        const bcPixelHeight = detectBandcampHeight(bandcampEmbed.embedUrl)
        const bcRows = rowsForHeight(bcPixelHeight)
        const existingLayout = (content as Record<string, unknown>)?.phoneHomeLayout as PhoneHomeLayout | undefined
        onChange({
          platform: 'bandcamp' as MusicPlatform,
          embedUrl: bandcampEmbed.originalUrl || bandcampEmbed.embedUrl,
          embedIframeUrl: bandcampEmbed.embedUrl,
          embedHeight: bandcampEmbed.height,
          thumbnailUrl: undefined,
          title: undefined,
          embeddable: true,
          phoneHomeLayout: {
            page: existingLayout?.page ?? 0,
            row: existingLayout?.row ?? 0,
            col: existingLayout?.col ?? 0,
            width: 4,
            height: bcRows,
          },
        })
        return
      }

      // Generic iframe embed code detection (Spotify, Apple Music, etc.)
      if (input.includes('<iframe')) {
        const srcMatch = input.match(/src=["']([^"']+)["']/)
        if (srcMatch) {
          const iframeSrc = srcMatch[1]
          const heightMatch = input.match(/height[:=]["']?\s*(\d+)/)
          const embedHeight = heightMatch ? parseInt(heightMatch[1], 10) : 352

          // Detect platform from iframe src URL
          let detectedPlatform: MusicPlatform = 'generic-music'
          if (iframeSrc.includes('spotify.com')) detectedPlatform = 'spotify'
          else if (iframeSrc.includes('music.apple.com')) detectedPlatform = 'apple-music'
          else if (iframeSrc.includes('soundcloud.com')) detectedPlatform = 'soundcloud'
          else if (iframeSrc.includes('audiomack.com')) detectedPlatform = 'audiomack'
          else if (iframeSrc.includes('bandcamp.com')) detectedPlatform = 'bandcamp'

          onChange({
            platform: detectedPlatform,
            embedUrl: iframeSrc,
            embedIframeUrl: iframeSrc,
            embedHeight,
            thumbnailUrl: undefined,
            title: undefined,
            embeddable: true,
          })
          return
        }
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

        // Strict match: fetch metadata via oEmbed (if available)
        const embedInfo = await fetchPlatformEmbed(input, platform as EmbedPlatform)

        // For Bandcamp: check if oEmbed returned a real EmbeddedPlayer URL
        // If it just returned the original URL back, mark as non-embeddable
        const isBandcamp = platform === 'bandcamp'
        const hasRealEmbed = isBandcamp
          ? embedInfo.embedUrl.includes('bandcamp.com/EmbeddedPlayer')
          : true

        onChange({
          platform,
          embedUrl: input,
          embedIframeUrl: hasRealEmbed ? embedInfo.embedUrl : undefined,
          embedHeight: undefined, // Clear stale Bandcamp heights
          thumbnailUrl: embedInfo.thumbnailUrl,
          title: embedInfo.title,
          embeddable: hasRealEmbed,
          phoneHomeWidgetSize: isBandcamp ? undefined : 'wide',
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
        embedHeight: undefined,
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
            placeholder="Paste music URL or embed code"
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
          Paste a link or embed code from Spotify, Apple Music, SoundCloud, Bandcamp, or Audiomack.
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

      {/* Autoplay Option */}
      {content.platform && content.embeddable !== false && (
        <div className="flex items-center justify-between">
          <Label htmlFor="autoplay" className="text-sm">Autoplay</Label>
          <Switch
            id="autoplay"
            checked={content.autoplay ?? false}
            onCheckedChange={(checked) => onChange({ autoplay: checked })}
          />
        </div>
      )}

      {/* Phone Home Widget Size Picker — removed, auto-set by platform detection */}

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
