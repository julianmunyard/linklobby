# Phase 9: Platform Integrations - Research

**Researched:** 2026-02-03
**Domain:** Platform embeds (music, video, social) and URL detection
**Confidence:** HIGH

## Summary

This phase adds embed support for music platforms (Spotify, Apple Music, SoundCloud, Audiomack, Bandcamp), video platforms (YouTube, Vimeo, TikTok), and social platforms (Instagram, TikTok profiles). The existing video card already handles YouTube/Vimeo/TikTok embeds via `get-video-id` and oEmbed. The approach extends this pattern to music platforms using their respective oEmbed APIs.

Key technical decisions: Music embeds use oEmbed for metadata and simple iframe embeds. Video embeds continue using the existing pattern. Playback coordination (one-at-a-time) requires a global context to track active embeds and postMessage/Widget APIs to pause them. Vertical 9:16 content (TikTok, Reels) needs a dedicated tall card variant with different aspect ratio CSS.

**Primary recommendation:** Create a unified `platform-embed.ts` module that handles URL detection across all platforms, fetches oEmbed metadata, and provides standardized embed info. Use a React context for playback coordination.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| get-video-id | 4.1.7 | Parse YouTube/Vimeo/TikTok URLs | Already installed, handles edge cases well |
| react-icons | 5.5.0 | Platform brand icons (Si* prefix) | Already installed with 25+ platform icons |
| Spotify oEmbed | N/A | Fetch Spotify embed metadata | Official API, no auth required |
| SoundCloud oEmbed | N/A | Fetch SoundCloud embed metadata | Official API, customizable params |
| Audiomack oEmbed | N/A | Fetch Audiomack embed metadata | Official API endpoint |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Spotify iFrame API | N/A | Playback control | When implementing one-at-a-time playback |
| SoundCloud Widget API | N/A | Playback control | When implementing one-at-a-time playback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom URL parsing | media-url-parser npm | Less flexible, adds dependency for what regex handles |
| Individual oEmbed calls | Iframely API | Adds paid service dependency, unnecessary abstraction |

**Installation:**
```bash
# No new packages needed - get-video-id and react-icons already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── video-embed.ts         # Existing - extend or keep separate
│   ├── platform-embed.ts      # NEW: Unified URL detection + oEmbed
│   └── embed-playback.ts      # NEW: Playback coordination utilities
├── components/
│   ├── cards/
│   │   ├── video-card.tsx     # Existing - extend for TikTok embeds
│   │   ├── music-card.tsx     # NEW: Spotify/Apple/SoundCloud/Bandcamp/Audiomack
│   │   └── embed-card.tsx     # NEW: Generic embed wrapper with platform detection
│   └── providers/
│       └── embed-provider.tsx # NEW: Playback coordination context
└── types/
    └── card.ts                # Extend with MusicCardContent, EmbedPlatform types
```

### Pattern 1: Platform URL Detection with Regex
**What:** Unified URL parser that identifies platform from URL patterns
**When to use:** When user pastes any URL to auto-detect platform
**Example:**
```typescript
// Source: Custom implementation based on platform URL structures

export type EmbedPlatform =
  | 'spotify' | 'apple-music' | 'soundcloud' | 'bandcamp' | 'audiomack'  // Music
  | 'youtube' | 'vimeo' | 'tiktok'  // Video
  | 'instagram'  // Social

interface PlatformPattern {
  platform: EmbedPlatform
  regex: RegExp
  extractId?: (url: string, match: RegExpMatchArray) => string
}

const PLATFORM_PATTERNS: PlatformPattern[] = [
  // Spotify: open.spotify.com/track|album|playlist|artist/ID
  {
    platform: 'spotify',
    regex: /^https?:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/,
    extractId: (_, match) => match[2]
  },
  // Apple Music: embed.music.apple.com/COUNTRY/album|playlist/NAME/ID or music.apple.com/...
  {
    platform: 'apple-music',
    regex: /^https?:\/\/(embed\.)?music\.apple\.com\/([a-z]{2})\/(album|playlist|artist)\/[^/]+\/([a-zA-Z0-9]+)/,
    extractId: (_, match) => match[4]
  },
  // SoundCloud: soundcloud.com/USER/TRACK or /sets/PLAYLIST
  {
    platform: 'soundcloud',
    regex: /^https?:\/\/soundcloud\.com\/([^/]+)\/(sets\/)?([^/?]+)/,
  },
  // Bandcamp: ARTIST.bandcamp.com/album|track/SLUG
  {
    platform: 'bandcamp',
    regex: /^https?:\/\/([a-z0-9-]+)\.bandcamp\.com\/(album|track)\/([a-z0-9-]+)/,
  },
  // Audiomack: audiomack.com/song|album/ARTIST/TITLE
  {
    platform: 'audiomack',
    regex: /^https?:\/\/audiomack\.com\/(song|album)\/([^/]+)\/([^/?]+)/,
  },
  // Instagram: instagram.com/p/ID or /reel/ID
  {
    platform: 'instagram',
    regex: /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/([a-zA-Z0-9_-]+)/,
    extractId: (_, match) => match[3]
  },
  // TikTok: tiktok.com/@USER/video/ID
  {
    platform: 'tiktok',
    regex: /^https?:\/\/(www\.)?tiktok\.com\/@([^/]+)\/video\/(\d+)/,
    extractId: (_, match) => match[3]
  },
  // YouTube/Vimeo handled by get-video-id
]

export function detectPlatform(url: string): { platform: EmbedPlatform; match: RegExpMatchArray } | null {
  for (const pattern of PLATFORM_PATTERNS) {
    const match = url.match(pattern.regex)
    if (match) {
      return { platform: pattern.platform, match }
    }
  }
  return null
}
```

### Pattern 2: oEmbed Fetcher per Platform
**What:** Platform-specific oEmbed API calls with fallbacks
**When to use:** When fetching embed metadata (thumbnail, title, embed HTML)
**Example:**
```typescript
// Source: Official platform oEmbed documentation

interface EmbedInfo {
  platform: EmbedPlatform
  embedUrl: string
  thumbnailUrl?: string
  title?: string
  width?: number
  height?: number
  aspectRatio?: '16:9' | '9:16' | '1:1'  // For tall content
}

const OEMBED_ENDPOINTS: Record<string, string> = {
  spotify: 'https://open.spotify.com/oembed',
  soundcloud: 'https://soundcloud.com/oembed',
  audiomack: 'https://audiomack.com/oembed',
  tiktok: 'https://www.tiktok.com/oembed',
}

async function fetchSpotifyEmbed(url: string): Promise<EmbedInfo> {
  const response = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  )
  const data = await response.json()
  return {
    platform: 'spotify',
    embedUrl: url,  // Spotify embeds use: open.spotify.com/embed/track/ID
    thumbnailUrl: data.thumbnail_url,
    title: data.title,
    aspectRatio: '16:9',
  }
}

async function fetchSoundCloudEmbed(url: string): Promise<EmbedInfo> {
  const response = await fetch(
    `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
  )
  const data = await response.json()
  return {
    platform: 'soundcloud',
    embedUrl: url,
    thumbnailUrl: data.thumbnail_url,
    title: data.title,
    aspectRatio: '16:9',
  }
}
```

### Pattern 3: Embed iframe URL Construction
**What:** Convert content URLs to embeddable iframe URLs
**When to use:** When rendering the actual embed iframe
**Example:**
```typescript
// Source: Official platform embed documentation

function getSpotifyEmbedUrl(url: string): string {
  // open.spotify.com/track/ID -> open.spotify.com/embed/track/ID
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
}

function getAppleMusicEmbedUrl(url: string): string {
  // music.apple.com/us/album/NAME/ID -> embed.music.apple.com/us/album/NAME/ID
  return url.replace('music.apple.com/', 'embed.music.apple.com/')
}

function getSoundCloudEmbedUrl(url: string): string {
  // Construct widget URL
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
}

function getBandcampEmbedUrl(albumId: string, trackId?: string): string {
  // Requires album ID extracted from page meta tag
  return `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/`
}

function getAudiomackEmbedUrl(type: string, artist: string, title: string): string {
  return `https://audiomack.com/embed/${type}/${artist}/${title}`
}
```

### Pattern 4: Playback Coordination Context
**What:** React context to ensure only one embed plays at a time
**When to use:** When managing multiple embeds on a page
**Example:**
```typescript
// Source: Spotify iFrame API, SoundCloud Widget API docs

interface EmbedPlaybackContext {
  activeEmbedId: string | null
  registerEmbed: (id: string, pauseFn: () => void) => void
  unregisterEmbed: (id: string) => void
  setActiveEmbed: (id: string) => void
}

const EmbedPlaybackContext = createContext<EmbedPlaybackContext | null>(null)

export function EmbedPlaybackProvider({ children }: { children: ReactNode }) {
  const [activeEmbedId, setActiveEmbedId] = useState<string | null>(null)
  const embedsRef = useRef<Map<string, () => void>>(new Map())

  const registerEmbed = useCallback((id: string, pauseFn: () => void) => {
    embedsRef.current.set(id, pauseFn)
  }, [])

  const unregisterEmbed = useCallback((id: string) => {
    embedsRef.current.delete(id)
  }, [])

  const setActiveEmbed = useCallback((id: string) => {
    // Pause all other embeds
    embedsRef.current.forEach((pauseFn, embedId) => {
      if (embedId !== id) pauseFn()
    })
    setActiveEmbedId(id)
  }, [])

  return (
    <EmbedPlaybackContext.Provider value={{
      activeEmbedId,
      registerEmbed,
      unregisterEmbed,
      setActiveEmbed
    }}>
      {children}
    </EmbedPlaybackContext.Provider>
  )
}
```

### Pattern 5: 9:16 Vertical Embed Container
**What:** CSS wrapper for tall content (TikTok, Instagram Reels)
**When to use:** When displaying vertical video embeds
**Example:**
```typescript
// Source: CSS aspect ratio techniques

function VerticalEmbedContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full max-w-[325px] mx-auto">
      {/* 9:16 aspect ratio: 16/9 * 100 = 177.78% */}
      <div className="relative w-full pb-[177.78%]">
        <div className="absolute inset-0">
          {children}
        </div>
      </div>
    </div>
  )
}

// TikTok has a max embed width of 325px
// Instagram embeds work at various widths but 325-400px is optimal for mobile
```

### Anti-Patterns to Avoid
- **Loading heavy iframes immediately:** Always use click-to-load with thumbnail preview
- **No error handling for oEmbed failures:** Always have fallback (platform icon + URL link)
- **Ignoring aspect ratios:** 9:16 content looks terrible in 16:9 containers
- **No playback coordination:** Multiple audio/video playing simultaneously is bad UX

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YouTube/Vimeo URL parsing | Custom regex | get-video-id | Handles 50+ URL patterns, edge cases |
| Platform icons | Custom SVGs | react-icons (Si* prefix) | Already installed, brand-accurate |
| Spotify oEmbed | Custom scraping | Spotify oEmbed API | Official, reliable, no auth needed |
| SoundCloud oEmbed | Widget scraping | SoundCloud oEmbed API | Official, supports customization params |

**Key insight:** oEmbed is the standard for embed metadata. Most platforms support it. Don't scrape pages when oEmbed exists.

## Common Pitfalls

### Pitfall 1: Instagram oEmbed Requires Access Token
**What goes wrong:** Instagram oEmbed calls fail with 401 errors
**Why it happens:** Meta deprecated unauthenticated oEmbed in October 2020. Now requires Facebook developer app + access token
**How to avoid:** For Instagram embeds, use the blockquote-style embed code or skip oEmbed and use direct embed URLs
**Warning signs:** Any "unauthorized" errors from graph.facebook.com or instagram.com/oembed

### Pitfall 2: TikTok oEmbed Returns Blockquote HTML
**What goes wrong:** Embedding TikTok oEmbed html field directly shows raw blockquote
**Why it happens:** TikTok's oEmbed returns a blockquote + script tag, not an iframe
**How to avoid:** Either use the blockquote HTML and include the TikTok embed.js script, or construct iframe URL directly: `https://www.tiktok.com/embed/v2/{videoId}`
**Warning signs:** Blockquote visible instead of video player

### Pitfall 3: Bandcamp Requires Album/Track ID
**What goes wrong:** Cannot construct Bandcamp embed URL from public URL alone
**Why it happens:** Bandcamp's embed URL uses numeric album/track IDs, not slug names
**How to avoid:** Fetch the Bandcamp page HTML and extract ID from meta tag `<meta name="bc-page-properties">` which contains `item_id`
**Warning signs:** 404 errors when using slugs in embed URL

### Pitfall 4: Apple Music Embeds Don't Support Playback Control
**What goes wrong:** Cannot programmatically pause Apple Music embeds
**Why it happens:** Apple Music iframe embeds don't expose postMessage API; only MusicKit JS has playback control
**How to avoid:** Accept that Apple Music embeds are self-contained; users must manually pause
**Warning signs:** postMessage calls having no effect

### Pitfall 5: Spotify iFrame API Requires Setup Script
**What goes wrong:** `window.onSpotifyIframeApiReady` never fires
**Why it happens:** Must include Spotify's iframe-api script: `https://open.spotify.com/embed/iframe-api/v1`
**How to avoid:** Load the script dynamically when a Spotify embed is added, define callback before script loads
**Warning signs:** EmbedController methods throw errors or don't exist

### Pitfall 6: Cross-Origin postMessage Security
**What goes wrong:** postMessage calls don't reach iframe or are blocked
**Why it happens:** Wrong targetOrigin or iframe hasn't loaded yet
**How to avoid:** Use `'*'` cautiously or match exact origin; wait for iframe onload before sending messages
**Warning signs:** No response from iframe, console security warnings

## Code Examples

Verified patterns from official sources:

### Spotify Embed iframe
```typescript
// Source: Spotify oEmbed + embed documentation
function SpotifyEmbed({ url, onPlay }: { url: string; onPlay: () => void }) {
  const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/')

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="352"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  )
}
```

### SoundCloud Widget with Play Control
```typescript
// Source: SoundCloud Widget API documentation
import { useEffect, useRef } from 'react'

function SoundCloudEmbed({ url, id }: { url: string; id: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<any>(null)

  useEffect(() => {
    // Load SoundCloud Widget API script
    const script = document.createElement('script')
    script.src = 'https://w.soundcloud.com/player/api.js'
    script.onload = () => {
      if (iframeRef.current && window.SC) {
        widgetRef.current = window.SC.Widget(iframeRef.current)
        widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
          // Notify context that this embed started playing
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false`

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      width="100%"
      height="166"
      scrolling="no"
      frameBorder="no"
      allow="autoplay"
    />
  )
}
```

### TikTok Embed (Direct iframe)
```typescript
// Source: TikTok embed documentation
function TikTokEmbed({ videoId }: { videoId: string }) {
  // TikTok embeds are 9:16 aspect ratio, max width 325px
  return (
    <div className="relative w-full max-w-[325px] mx-auto pb-[177.78%]">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        allowFullScreen
        scrolling="no"
        allow="encrypted-media"
      />
    </div>
  )
}
```

### Bandcamp Embed
```typescript
// Source: Bandcamp embed documentation
function BandcampEmbed({ albumId, size = 'large' }: { albumId: string; size?: 'large' | 'small' }) {
  const height = size === 'large' ? 470 : 120
  const embedUrl = `https://bandcamp.com/EmbeddedPlayer/album=${albumId}/size=${size}/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/`

  return (
    <iframe
      src={embedUrl}
      style={{ border: 0, width: '100%', height }}
      seamless
    />
  )
}
```

### Apple Music Embed
```typescript
// Source: Apple Music embed code structure
function AppleMusicEmbed({ url }: { url: string }) {
  // Convert music.apple.com to embed.music.apple.com
  const embedUrl = url.replace('music.apple.com/', 'embed.music.apple.com/')

  return (
    <iframe
      allow="autoplay *; encrypted-media *; fullscreen *"
      frameBorder="0"
      height="450"
      style={{ width: '100%', maxWidth: 660, overflow: 'hidden', background: 'transparent' }}
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
      src={embedUrl}
    />
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flash embeds | HTML5 iframes | 2017+ | Universal browser support |
| Unauthenticated Instagram oEmbed | Meta oEmbed with access token | Oct 2020 | Must use Facebook developer app |
| YouTube enablejsapi=0 | enablejsapi=1 default | 2022+ | postMessage control available by default |
| Spotify simple iframe | Spotify iFrame API | 2022 | Programmatic control available |

**Deprecated/outdated:**
- Flash-based embeds: All platforms now use HTML5
- Instagram unauthenticated oEmbed: Requires access token since Oct 2020
- Vine: Service shut down 2017 (get-video-id still parses for legacy)

## Open Questions

Things that couldn't be fully resolved:

1. **Bandcamp Album ID Extraction**
   - What we know: IDs are in page meta tags, not in URL
   - What's unclear: Best approach - server-side fetch or client-side? Rate limits?
   - Recommendation: Try oEmbed first (if exists), fallback to page fetch

2. **Audiomack oEmbed Reliability**
   - What we know: oEmbed endpoint exists at audiomack.com/oembed
   - What's unclear: Current reliability, response format consistency
   - Recommendation: Test during implementation, have fallback to direct embed

3. **Instagram Embed Without Access Token**
   - What we know: Official oEmbed requires Facebook developer setup
   - What's unclear: Whether blockquote embeds work without it
   - Recommendation: Use blockquote + embed.js script, or mark Instagram embeds as link cards

4. **One-at-a-time Playback Across All Platforms**
   - What we know: Spotify, SoundCloud, YouTube have APIs; Apple Music doesn't
   - What's unclear: How to handle platforms without pause API
   - Recommendation: Best effort - pause what we can, accept some limitations

## Sources

### Primary (HIGH confidence)
- [Spotify oEmbed API](https://developer.spotify.com/documentation/embeds/reference/oembed) - oEmbed endpoint, response format
- [Spotify iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api) - Playback control
- [SoundCloud oEmbed](https://developers.soundcloud.com/docs/oembed) - oEmbed endpoint, parameters
- [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget) - Play/pause control
- [TikTok Embed Docs](https://developers.tiktok.com/doc/embed-videos/) - oEmbed endpoint
- [get-video-id npm](https://github.com/radiovisual/get-video-id) - Supported platforms, URL patterns

### Secondary (MEDIUM confidence)
- [Apple Music embed format](https://discussions.apple.com/thread/252671168) - Community-documented embed URL structure
- [YouTube postMessage control](https://developers.google.com/youtube/iframe_api_reference) - Official but not specifically about postMessage
- [Bandcamp embed format](https://iframely.com/domains/bandcamp) - Third-party documentation of embed URL structure

### Tertiary (LOW confidence)
- [Audiomack oEmbed](https://iframely.com/domains/audiomack) - Third-party documentation only
- [Instagram oEmbed requirements](https://www.bluehost.com/blog/meta-oembed-read-explained/) - Blog post about Meta changes

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation for all major platforms
- Architecture: HIGH - Established patterns (oEmbed, iframes, React context)
- Pitfalls: MEDIUM - Based on official docs + community reports
- Playback coordination: MEDIUM - Platform APIs documented, cross-platform integration untested

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - platform APIs generally stable)
