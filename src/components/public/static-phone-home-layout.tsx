'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Card } from '@/types/card'
import type { PhoneHomeLayout } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import type { GalleryCardContent, GalleryImage } from '@/types/card'
import type { SocialIcon, SocialPlatform } from '@/types/profile'
import { SOCIAL_PLATFORMS } from '@/types/profile'
import { isAudioContent, isGalleryContent } from '@/types/card'
import { sortCardsBySortKey } from '@/lib/ordering'
import { AudioPlayer } from '@/components/audio/audio-player'
import { cn } from '@/lib/utils'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import { Globe, Mail, Music } from 'lucide-react'
import { SystemSettingsCard } from '@/components/cards/system-settings-card'
import type { ComponentType } from 'react'

type IconComponent = ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>

const PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  spotify: SiSpotify,
  twitter: SiX,
  soundcloud: SiSoundcloud,
  applemusic: SiApplemusic,
  bandcamp: SiBandcamp,
  deezer: Music,
  amazonmusic: SiAmazonmusic,
  facebook: SiFacebook,
  threads: SiThreads,
  bluesky: SiBluesky,
  snapchat: SiSnapchat,
  pinterest: SiPinterest,
  linkedin: SiLinkedin,
  whatsapp: SiWhatsapp,
  twitch: SiTwitch,
  kick: SiKick,
  discord: SiDiscord,
  website: Globe,
  email: Mail,
  patreon: SiPatreon,
  venmo: SiVenmo,
  cashapp: SiCashapp,
  paypal: SiPaypal,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StaticPhoneHomeLayoutProps {
  username: string
  cards: Card[]
  phoneHomeDock?: string[]
  phoneHomeShowDock?: boolean
  phoneHomeDockTranslucent?: boolean
  phoneHomeVariant?: 'default' | '8-bit' | 'windows-95'
  socialIconsJson?: string | null
  socialIconColor?: string | null
  statusBarColor?: string | null
}

// 4-column grid, rows of icons per page
const GRID_COLS = 4
const MAX_ROWS_PER_PAGE = 8

// ---------------------------------------------------------------------------
// Fallback icon colors + emoji per card type
// ---------------------------------------------------------------------------

const FALLBACK_ICONS: Record<string, { emoji: string; bg: string; icon?: string }> = {
  hero:               { emoji: '🖼', bg: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' },
  horizontal:         { emoji: '🔗', bg: 'linear-gradient(135deg, #4ECDC4, #2ECC71)' },
  square:             { emoji: '📷', bg: 'linear-gradient(135deg, #A29BFE, #6C5CE7)' },
  video:              { emoji: '▶️', bg: 'linear-gradient(135deg, #FF4757, #C44569)' },
  gallery:            { emoji: '🏞', bg: 'linear-gradient(135deg, #FFA502, #FF6348)' },
  game:               { emoji: '🎮', bg: 'linear-gradient(135deg, #7BED9F, #2ED573)' },
  audio:              { emoji: '🎵', bg: 'linear-gradient(135deg, #FC5C7D, #6A82FB)', icon: '/icons/music-cd.gif' },
  music:              { emoji: '🎧', bg: 'linear-gradient(135deg, #E91E63, #9C27B0)' },
  'social-icons':     { emoji: '👤', bg: 'linear-gradient(135deg, #00B4DB, #0083B0)' },
  link:               { emoji: '🌐', bg: 'linear-gradient(135deg, #667EEA, #764BA2)' },
  mini:               { emoji: '📌', bg: 'linear-gradient(135deg, #F7971E, #FFD200)' },
  text:               { emoji: '📝', bg: 'linear-gradient(135deg, #89F7FE, #66A6FF)' },
  'email-collection': { emoji: '✉️', bg: 'linear-gradient(135deg, #F093FB, #F5576C)' },
  release:            { emoji: '💿', bg: 'linear-gradient(135deg, #4FACFE, #00F2FE)' },
}

// ---------------------------------------------------------------------------
// Status Bar (decorative)
// ---------------------------------------------------------------------------

function PhoneHomeStatusBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="flex items-center justify-between px-6 pt-[max(env(safe-area-inset-top),12px)] pb-1 text-[13px] font-semibold text-theme-text"
    >
      <span className="w-16 text-left">{time}</span>

      <div className="w-16 flex items-center justify-end gap-1">
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" opacity={0.9}>
          <rect x="0" y="9" width="3" height="3" rx="0.5" />
          <rect x="4" y="6" width="3" height="6" rx="0.5" />
          <rect x="8" y="3" width="3" height="9" rx="0.5" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor" opacity={0.9}>
          <path d="M7 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" transform="translate(0,-2)" />
          <path d="M3.5 8.5a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 5.5a9 9 0 0112 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {/* Battery */}
        <svg width="24" height="12" viewBox="0 0 24 12" fill="currentColor" opacity={0.9}>
          <rect x="0" y="1" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="21" y="3.5" width="2" height="5" rx="1" opacity={0.4} />
          <rect x="1.5" y="2.5" width="17" height="7" rx="1" />
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagination Dots
// ---------------------------------------------------------------------------

function PaginationDots({ count, active, onPageChange }: { count: number; active: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-center gap-[6px] py-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === active ? 8 : 6,
            height: i === active ? 8 : 6,
            backgroundColor: 'var(--theme-text)',
            opacity: i === active ? 0.9 : 0.3,
          }}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// App Icon — rounded square with label
// ---------------------------------------------------------------------------

function AppIcon({
  card,
  onTap,
  size = 'normal',
  is8Bit = false,
  isWin95 = false,
}: {
  card: Card
  onTap: (card: Card) => void
  size?: 'normal' | 'dock'
  is8Bit?: boolean
  isWin95?: boolean
}) {
  const content = card.content as Record<string, unknown>
  const appIconUrl = content.appIconUrl as string | undefined
  const appIconColor = content.appIconColor as string | undefined
  const imageUrl = content.imageUrl as string | undefined
  const fallback = FALLBACK_ICONS[card.card_type] ?? FALLBACK_ICONS.link

  const iconSrc = appIconUrl || imageUrl
  const fallbackIcon = fallback.icon
  const displaySrc = iconSrc || fallbackIcon
  const label = card.title || card.card_type
  const isDock = size === 'dock'
  const iconRadius = isWin95 ? 'rounded-[2px]' : is8Bit ? (isDock ? 'rounded-[6px]' : 'rounded-[8px]') : (isDock ? 'rounded-[12px]' : 'rounded-[14px]')

  return (
    <button
      className="flex flex-col items-center gap-[5px] w-full group"
      onClick={() => onTap(card)}
    >
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center transition-transform active:scale-90',
          isDock ? 'w-[52px] h-[52px]' : 'w-[60px] h-[60px]',
          iconRadius,
        )}
        style={displaySrc ? undefined : { background: fallback.bg }}
      >
        {displaySrc && appIconColor ? (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: appIconColor,
              WebkitMaskImage: `url('${displaySrc}')`,
              maskImage: `url('${displaySrc}')`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              imageRendering: is8Bit ? 'pixelated' : undefined,
            } as React.CSSProperties}
          />
        ) : displaySrc ? (
          <img
            src={displaySrc}
            alt={label}
            className="w-full h-full object-contain"
            draggable={false}
            style={is8Bit ? { imageRendering: 'pixelated' as const } : undefined}
          />
        ) : (
          <span className={cn('select-none', isDock ? 'text-[22px]' : 'text-[26px]')}>
            {fallback.emoji}
          </span>
        )}
      </div>
      {!isDock && (
        <span
          className="text-[11px] leading-tight text-center truncate max-w-[70px] text-theme-text"
          style={isWin95 ? undefined : { textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {label}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Social App Icon — individual social platform as an app icon
// ---------------------------------------------------------------------------

function SocialAppIcon({
  socialIcon,
  parentCard,
  size = 'normal',
  is8Bit = false,
  isWin95 = false,
}: {
  socialIcon: SocialIcon
  parentCard: Card
  size?: 'normal' | 'dock'
  is8Bit?: boolean
  isWin95?: boolean
}) {
  const content = parentCard.content as Record<string, unknown>
  const socialAppIcons = content.socialAppIcons as Record<string, { appIconUrl?: string; appIconColor?: string }> | undefined
  const override = socialAppIcons?.[socialIcon.platform]
  const customIconUrl = override?.appIconUrl
  const customIconColor = override?.appIconColor

  const platformMeta = SOCIAL_PLATFORMS[socialIcon.platform]
  const PlatformIcon = PLATFORM_ICONS[socialIcon.platform]
  const label = platformMeta?.label || socialIcon.platform
  const isDock = size === 'dock'
  const iconRadius = isWin95 ? 'rounded-[2px]' : is8Bit ? (isDock ? 'rounded-[6px]' : 'rounded-[8px]') : (isDock ? 'rounded-[12px]' : 'rounded-[14px]')

  return (
    <a
      href={socialIcon.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-[5px] w-full group"
    >
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center transition-transform active:scale-90',
          isDock ? 'w-[52px] h-[52px]' : 'w-[60px] h-[60px]',
          iconRadius,
        )}
        style={customIconUrl ? undefined : { background: 'rgba(255,255,255,0.1)' }}
      >
        {customIconUrl && customIconColor ? (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: customIconColor,
              WebkitMaskImage: `url('${customIconUrl}')`,
              maskImage: `url('${customIconUrl}')`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              imageRendering: is8Bit ? 'pixelated' : undefined,
            } as React.CSSProperties}
          />
        ) : customIconUrl ? (
          <img src={customIconUrl} alt={label} className="w-full h-full object-contain" draggable={false} style={is8Bit ? { imageRendering: 'pixelated' as const } : undefined} />
        ) : PlatformIcon ? (
          <PlatformIcon size={isDock ? 24 : 28} style={{ color: 'var(--theme-text)' }} />
        ) : (
          <span className={cn('select-none', isDock ? 'text-[22px]' : 'text-[26px]')}>🔗</span>
        )}
      </div>
      {!isDock && (
        <span
          className="text-[11px] leading-tight text-center truncate max-w-[70px] text-theme-text"
          style={isWin95 ? undefined : { textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
        >
          {label}
        </span>
      )}
    </a>
  )
}

// ---------------------------------------------------------------------------
// Photo Widget — 2x2 or 4x2 gallery auto-scroll
// ---------------------------------------------------------------------------

function PhotoWidget({
  card,
  layout,
  is8Bit = false,
  isWin95 = false,
}: {
  card: Card
  layout: PhoneHomeLayout
  is8Bit?: boolean
  isWin95?: boolean
}) {
  const content = card.content as unknown as GalleryCardContent
  const images = content.images ?? []
  const [currentIdx, setCurrentIdx] = useState(0)
  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length)
    }, 3000)
    return () => clearInterval(id)
  }, [images.length])

  const borderRadius = isWin95 ? 'rounded-[8px]' : is8Bit ? 'rounded-[8px]' : 'rounded-[16px]'

  if (images.length === 0) {
    return (
      <div
        className={cn('w-full h-full flex items-center justify-center', borderRadius)}
        style={{ background: FALLBACK_ICONS.gallery.bg }}
      >
        <span className="text-3xl">🏞</span>
      </div>
    )
  }

  return (
    <div className={cn('relative w-full h-full overflow-hidden', borderRadius)}>
      {images.map((img, i) => (
        <img
          key={img.id}
          src={img.url}
          alt={img.alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === currentIdx ? 1 : 0, ...(is8Bit ? { imageRendering: 'pixelated' as const } : {}) }}
          draggable={false}
        />
      ))}
      {images.length > 1 && !is8Bit && !isWin95 && (
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-medium">
          {currentIdx + 1}/{images.length}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ScaleToFit — shrinks content via CSS zoom so it fits exactly in its container
// ---------------------------------------------------------------------------

function ScaleToFit({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const apply = () => {
      const cellH = outer.clientHeight
      // scrollHeight gives natural content height regardless of transform
      const contentH = inner.scrollHeight

      if (cellH > 0 && contentH > cellH) {
        const s = cellH / contentH
        inner.style.transform = `scale(${s})`
        inner.style.transformOrigin = 'top left'
        inner.style.width = `${100 / s}%`
      } else {
        inner.style.transform = ''
        inner.style.transformOrigin = ''
        inner.style.width = ''
      }
    }

    // ResizeObserver fires whenever the player finishes rendering / resizes
    const ro = new ResizeObserver(() => apply())
    ro.observe(inner)
    ro.observe(outer)

    return () => ro.disconnect()
  }, [])

  return (
    <div ref={outerRef} className="w-full h-full overflow-hidden">
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Music Widget — renders real platform iframe embeds (Spotify, Apple Music, etc.)
// ---------------------------------------------------------------------------

import { getEmbedUrl } from '@/lib/platform-embed'
import type { EmbedPlatform } from '@/lib/platform-embed'

// Compact embed heights for slim (4x1) widgets
const SLIM_EMBED_HEIGHTS: Record<string, number> = {
  spotify: 152,
  'apple-music': 175,
  soundcloud: 166,
  bandcamp: 120,
  audiomack: 152,
  'generic-music': 152,
}

// Full embed heights for square (2x2) widgets
const SQUARE_EMBED_HEIGHTS: Record<string, number> = {
  spotify: 352,
  'apple-music': 450,
  soundcloud: 300,
  bandcamp: 470,
  audiomack: 252,
  'generic-music': 152,
}

/**
 * Adjust Bandcamp EmbeddedPlayer URL to the correct size variant.
 * size=large gives full artwork + tracklist, size=small gives compact player.
 */
function adjustBandcampSize(url: string, wantLarge: boolean): string {
  if (!url.includes('bandcamp.com/EmbeddedPlayer')) return url
  // Replace existing size param or add one
  if (url.includes('/size=')) {
    return url.replace(/\/size=(small|large)/, `/size=${wantLarge ? 'large' : 'small'}`)
  }
  // Append size param before trailing slash or at end
  const separator = url.endsWith('/') ? '' : '/'
  return `${url}${separator}size=${wantLarge ? 'large' : 'small'}/`
}

function MusicWidget({
  card,
  layout,
  onTap,
}: {
  card: Card
  layout: PhoneHomeLayout
  onTap: (card: Card) => void
}) {
  const content = card.content as Record<string, unknown>
  const platform = (content.platform as string) || 'generic-music'
  const embedUrl = content.embedUrl as string | undefined
  const embedIframeUrl = content.embedIframeUrl as string | undefined
  const embeddable = content.embeddable as boolean | undefined
  const autoplay = content.autoplay as boolean | undefined
  // Layout height determines embed variant: <=2 rows = compact, >2 = full
  const isSlim = layout.height <= 2

  // If no embed URL or not embeddable, fall back to a tappable icon
  if ((!embedUrl && !embedIframeUrl) || embeddable === false) {
    const fallback = FALLBACK_ICONS.music
    return (
      <button
        className="w-full h-full rounded-[16px] overflow-hidden flex items-center justify-center"
        style={{ background: fallback.bg }}
        onClick={() => onTap(card)}
      >
        <span className="text-3xl">🎧</span>
      </button>
    )
  }

  let iframeUrl = embedIframeUrl || (embedUrl ? getEmbedUrl(embedUrl, platform as EmbedPlatform) : '')

  // Append autoplay param per platform (not for Bandcamp — use embed as-is)
  if (autoplay && iframeUrl) {
    const sep = iframeUrl.includes('?') ? '&' : '?'
    if (platform === 'soundcloud') {
      iframeUrl += `${sep}auto_play=true`
    } else {
      // Spotify, Apple Music, Audiomack all use autoplay=1
      iframeUrl += `${sep}autoplay=1`
    }
  }

  const customHeight = content.embedHeight as number | undefined
  const isBandcamp = platform === 'bandcamp'

  // Bandcamp: use exact native height from URL params
  if (isBandcamp) {
    const url = iframeUrl
    let bcHeight = 470
    if (url.includes('/size=small')) bcHeight = 42
    else if (url.includes('/artwork=small') && url.includes('/tracklist=false')) bcHeight = 120
    else if (url.includes('/minimal=true')) bcHeight = 350
    return (
      <div className="w-full">
        <iframe
          src={iframeUrl}
          width="100%"
          height={bcHeight}
          frameBorder="0"
          seamless
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={card.title || 'Bandcamp embed'}
          style={{ border: 0, background: 'transparent', display: 'block' }}
        />
      </div>
    )
  }

  // Non-Bandcamp: slot-based heights with rounded widget style
  const embedHeight = isSlim
    ? (SLIM_EMBED_HEIGHTS[platform] || 152)
    : (SQUARE_EMBED_HEIGHTS[platform] || 352)

  return (
    <div className="w-full overflow-hidden" style={{ height: embedHeight, borderRadius: 12 }}>
      <iframe
        src={iframeUrl}
        width="100%"
        height={embedHeight}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={card.title || 'Music embed'}
        style={{ borderRadius: 12, border: 0 }}
      />
    </div>
  )
}


// ---------------------------------------------------------------------------
// Dock Bar
// ---------------------------------------------------------------------------

function PhoneHomeDock({
  dockCards,
  onTap,
  is8Bit = false,
  isWin95 = false,
  translucent = true,
}: {
  dockCards: Card[]
  onTap: (card: Card) => void
  is8Bit?: boolean
  isWin95?: boolean
  translucent?: boolean
}) {
  if (dockCards.length === 0) return null

  if (isWin95) {
    return (
      <div
        className={cn("mb-[max(env(safe-area-inset-bottom),0px)] px-3 py-[6px] flex items-center", dockCards.length >= 4 ? "justify-center gap-[3px]" : "justify-evenly")}
        style={{
          background: 'var(--theme-card-bg, #c0c0c0)',
          boxShadow: 'inset 0 1px 0 #dfdfdf, inset 0 -1px 0 #808080, inset 0 2px 0 #ffffff, inset 0 -2px 0 #404040',
        }}
      >
        {dockCards.map((card) => (
          <div
            key={card.id}
            className="p-[3px]"
            style={{
              background: 'var(--theme-card-bg, #c0c0c0)',
              boxShadow: 'inset -2px -2px 0 #404040, inset 2px 2px 0 #ffffff, inset -3px -3px 0 #808080, inset 3px 3px 0 #dfdfdf',
            }}
          >
            <AppIcon card={card} onTap={onTap} size="dock" isWin95 />
          </div>
        ))}
      </div>
    )
  }

  if (is8Bit) {
    return (
      <div
        className="mb-[max(env(safe-area-inset-bottom),0px)] px-5 py-2.5 flex items-center justify-center gap-5"
        style={{
          backgroundColor: 'var(--theme-card-bg, rgba(30,30,30,0.85))',
        }}
      >
        {dockCards.map((card) => (
          <AppIcon key={card.id} card={card} onTap={onTap} size="dock" is8Bit />
        ))}
      </div>
    )
  }

  return (
    <div
      className="mx-3 mb-[max(env(safe-area-inset-bottom),8px)] rounded-[22px] px-5 py-2.5 flex items-center justify-center gap-5"
      style={translucent ? {
        backgroundColor: 'rgba(30,30,30,0.35)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.12)',
      } : {
        backgroundColor: 'var(--theme-card-bg, rgba(30,30,30,0.85))',
      }}
    >
      {dockCards.map((card) => (
        <AppIcon key={card.id} card={card} onTap={onTap} size="dock" />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Auto-layout: pack cards into grid pages
// ---------------------------------------------------------------------------

type GridItem = { card: Card; layout: PhoneHomeLayout; socialIcon?: SocialIcon }

function autoLayoutCards(
  cards: Card[],
  dockIds: string[],
  variant: 'default' | '8-bit' | 'windows-95' = 'default',
  socialIcons: SocialIcon[] = [],
): { pages: Array<Array<GridItem>> } {
  const gridCards = cards.filter((c) => c.is_visible && !dockIds.includes(c.id))

  const pages: Array<Array<GridItem>> = [[]]
  const occupied: Map<number, Set<string>> = new Map()
  occupied.set(0, new Set())

  function isSlotFree(pageIdx: number, row: number, col: number, w: number, h: number): boolean {
    const occ = occupied.get(pageIdx) ?? new Set()
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        if (c >= GRID_COLS || r >= MAX_ROWS_PER_PAGE) return false
        if (occ.has(`${r},${c}`)) return false
      }
    }
    return true
  }

  function markSlot(pageIdx: number, row: number, col: number, w: number, h: number) {
    let occ = occupied.get(pageIdx)
    if (!occ) { occ = new Set(); occupied.set(pageIdx, occ) }
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        occ.add(`${r},${c}`)
      }
    }
  }

  // Build list of items to place (expand social-icons into individual entries)
  type PlaceItem = { card: Card; w: number; h: number; explicit?: PhoneHomeLayout; socialIcon?: SocialIcon }
  const itemsToPlace: PlaceItem[] = []

  for (const card of gridCards) {
    const content = card.content as Record<string, unknown>
    const explicit = content.phoneHomeLayout as PhoneHomeLayout | undefined

    // Social-icons card: expand into one 1x1 entry per social icon
    if (card.card_type === 'social-icons' && socialIcons.length > 0) {
      const socialIconLayouts = content.socialIconLayouts as Record<string, { page: number; row: number; col: number }> | undefined
      for (const si of socialIcons) {
        const siLayout = socialIconLayouts?.[si.platform]
        const siExplicit = siLayout ? { page: siLayout.page, row: siLayout.row, col: siLayout.col, width: 1 as const, height: 1 as const } : undefined
        itemsToPlace.push({ card, w: 1, h: 1, explicit: siExplicit, socialIcon: si })
      }
      continue
    }

    let w = 1, h = 1
    // Music cards: always derive size from platform, ignore explicit layout
    if (card.card_type === 'music') {
      if ((content.platform as string) === 'bandcamp') {
        w = 4
        // Detect height from URL params (reliable), fall back to embedHeight
        const iframeUrl = (content.embedIframeUrl || content.embedUrl || '') as string
        let bcPx = 470
        if (iframeUrl.includes('/size=small')) bcPx = 42
        else if (iframeUrl.includes('/artwork=small') && iframeUrl.includes('/tracklist=false')) bcPx = 120
        else if (iframeUrl.includes('/minimal=true')) bcPx = 350
        const embedH = content.embedHeight as number | undefined
        if (embedH) bcPx = embedH // override with explicit if available
        h = bcPx <= 76 ? 1 : Math.ceil((bcPx + 20) / 96)
      } else {
        w = 4; h = 2
      }
    }
    else if (explicit) { w = explicit.width; h = explicit.height }
    else if (card.card_type === 'gallery') {
      if (variant === '8-bit') { w = 4; h = 2 } else { w = 4; h = 2 }
    }

    // Audio cards always render full-width and need 3 rows for full player
    if (card.card_type === 'audio') {
      w = 4; h = 3
    }

    itemsToPlace.push({ card, w, h, explicit })
  }

  for (const item of itemsToPlace) {
    const { card, w, h, explicit, socialIcon } = item

    if (explicit) {
      const pageIdx = explicit.page
      // Use computed w/h (may differ from explicit for music cards)
      const resolvedLayout: PhoneHomeLayout = { ...explicit, width: w as 1 | 2 | 4, height: h as PhoneHomeLayout['height'] }
      while (pages.length <= pageIdx) { pages.push([]); occupied.set(pages.length - 1, new Set()) }
      if (isSlotFree(pageIdx, explicit.row, explicit.col, w, h)) {
        markSlot(pageIdx, explicit.row, explicit.col, w, h)
        pages[pageIdx].push({ card, layout: resolvedLayout, socialIcon })
        continue
      }
      let placedOnPage = false
      for (let r = 0; r < MAX_ROWS_PER_PAGE && !placedOnPage; r++) {
        for (let c = 0; c <= GRID_COLS - w && !placedOnPage; c++) {
          if (isSlotFree(pageIdx, r, c, w, h)) {
            markSlot(pageIdx, r, c, w, h)
            pages[pageIdx].push({ card, layout: { page: pageIdx, row: r, col: c, width: w as 1 | 2 | 4, height: h as PhoneHomeLayout['height'] }, socialIcon })
            placedOnPage = true
          }
        }
      }
      if (placedOnPage) continue
    }

    const startPage = explicit ? explicit.page : 0
    let placed = false
    for (let p = startPage; p < pages.length && !placed; p++) {
      for (let r = 0; r < MAX_ROWS_PER_PAGE && !placed; r++) {
        for (let c = 0; c <= GRID_COLS - w && !placed; c++) {
          if (isSlotFree(p, r, c, w, h)) {
            markSlot(p, r, c, w, h)
            pages[p].push({ card, layout: { page: p, row: r, col: c, width: w as 1 | 2 | 4, height: h as PhoneHomeLayout['height'] }, socialIcon })
            placed = true
          }
        }
      }
    }

    if (!placed) {
      const newPageIdx = pages.length
      pages.push([]); occupied.set(newPageIdx, new Set())
      markSlot(newPageIdx, 0, 0, w, h)
      pages[newPageIdx].push({ card, layout: { page: newPageIdx, row: 0, col: 0, width: w as 1 | 2 | 4, height: h as PhoneHomeLayout['height'] }, socialIcon })
    }
  }

  while (pages.length > 1 && pages[pages.length - 1].length === 0) pages.pop()
  return { pages }
}

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------

export function StaticPhoneHomeLayout({
  username,
  cards,
  phoneHomeDock = [],
  phoneHomeShowDock = true,
  phoneHomeDockTranslucent = true,
  phoneHomeVariant = 'default',
  socialIconsJson,
  socialIconColor,
  statusBarColor,
}: StaticPhoneHomeLayoutProps) {
  const is8Bit = phoneHomeVariant === '8-bit'
  const isWin95 = phoneHomeVariant === 'windows-95'
  const [currentPage, setCurrentPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)


  const socialIcons: SocialIcon[] = useMemo(
    () => (socialIconsJson ? JSON.parse(socialIconsJson) : []),
    [socialIconsJson],
  )

  const sortedCards = useMemo(() => sortCardsBySortKey(cards), [cards])

  const dockCards = useMemo(
    () => phoneHomeDock.map((id) => sortedCards.find((c) => c.id === id)).filter((c): c is Card => !!c && c.is_visible),
    [phoneHomeDock, sortedCards],
  )

  const { pages } = useMemo(
    () => autoLayoutCards(sortedCards, phoneHomeDock, phoneHomeVariant, socialIcons),
    [sortedCards, phoneHomeDock, phoneHomeVariant, socialIcons],
  )

  const pageCount = pages.length
  const hasDock = phoneHomeShowDock && dockCards.length > 0

  // Clamp currentPage
  useEffect(() => {
    if (currentPage >= pageCount) setCurrentPage(Math.max(0, pageCount - 1))
  }, [currentPage, pageCount])



  // Handle card taps
  const handleTap = useCallback(
    (card: Card) => {
      // Audio cards render inline — no modal needed
      if (card.card_type === 'audio') return
      if (card.card_type === 'music') {
        // Music cards with embed URLs open externally
        const url = (card.content as Record<string, unknown>).embedUrl as string | undefined
        if (url) {
          window.open(url, '_blank', 'noopener')
          return
        }
      }
      // Default: open card URL
      if (card.url) {
        window.open(card.url, '_blank', 'noopener')
      }
    },
    [],
  )

  // Scroll-snap page navigation (native browser physics)
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: page * el.offsetWidth, behavior: 'smooth' })
  }, [])

  // Update currentPage only after scroll settles to avoid re-renders mid-swipe
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const updatePage = () => {
      const w = el.offsetWidth
      if (w === 0) return
      setCurrentPage(Math.round(el.scrollLeft / w))
    }

    const onScroll = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(updatePage, 300)
    }

    const onScrollEnd = () => {
      if (timer) clearTimeout(timer)
      updatePage()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('scrollend', onScrollEnd, { passive: true })
    return () => {
      if (timer) clearTimeout(timer)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('scrollend', onScrollEnd)
    }
  }, [])


  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden text-theme-text select-none" style={{ height: '100dvh', WebkitTouchCallout: 'none' } as React.CSSProperties}>
      {/* Status bar */}
      <PhoneHomeStatusBar />

      <div className="relative flex-1 min-h-0">
        <div
          ref={containerRef}
          className="absolute inset-0 flex overflow-x-auto [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            overscrollBehaviorX: 'contain',
          } as React.CSSProperties}
        >
        {pages.map((pageItems, pageIdx) => (
          <div
            key={pageIdx}
            className="w-full h-full min-w-full max-w-full shrink-0 px-5 pt-3 pb-12 flex flex-col items-center overflow-hidden"
            style={{ scrollSnapAlign: 'start' }}
          >
              {/* Grid: 8 rows without dock, 7 rows with dock (dock = bottom row) */}
              <div
                className="grid gap-y-5 gap-x-3 w-full h-full max-w-[430px] mx-auto"
                style={{
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gridTemplateRows: `repeat(${hasDock ? MAX_ROWS_PER_PAGE - 1 : MAX_ROWS_PER_PAGE}, minmax(0, 76px))`,
                }}
              >
                {pageItems.map(({ card, layout, socialIcon }) => {
                  // Social icon (expanded from social-icons card)
                  if (socialIcon) {
                    return (
                      <div
                        key={`${card.id}-${socialIcon.platform}`}
                        className="flex items-center justify-center"
                        style={{
                          gridColumn: `${layout.col + 1} / span ${layout.width}`,
                          gridRow: `${layout.row + 1} / span ${layout.height}`,
                        }}
                      >
                        <SocialAppIcon
                          socialIcon={socialIcon}
                          parentCard={card}
                          is8Bit={is8Bit}
                          isWin95={isWin95}
                        />
                      </div>
                    )
                  }

                  // Gallery widgets span multiple cells
                  if (card.card_type === 'gallery') {
                    const isFullWidth = layout.width === 4
                    return (
                      <div
                        key={card.id}
                        className="w-full h-full overflow-hidden"
                        style={{
                          gridColumn: isFullWidth ? '1 / -1' : `${layout.col + 1} / span ${layout.width}`,
                          gridRow: `${layout.row + 1} / span ${layout.height}`,
                        }}
                      >
                        <PhotoWidget card={card} layout={layout} is8Bit={is8Bit} isWin95={isWin95} />
                      </div>
                    )
                  }

                  // Music widgets (4x2 slim or larger)
                  if (card.card_type === 'music' && (layout.width > 1 || layout.height > 1)) {
                    // For Bandcamp, ensure row span fits the native embed height
                    const mc = card.content as Record<string, unknown>
                    const mUrl = (mc.embedIframeUrl || mc.embedUrl || '') as string
                    let rowSpan: number = layout.height
                    if ((mc.platform as string) === 'bandcamp' && mUrl) {
                      let bcPx = 470
                      if (mUrl.includes('/size=small')) bcPx = 42
                      else if (mUrl.includes('/artwork=small') && mUrl.includes('/tracklist=false')) bcPx = 120
                      else if (mUrl.includes('/minimal=true')) bcPx = 350
                      const needed = bcPx <= 76 ? 1 : Math.ceil((bcPx + 20) / 96)
                      rowSpan = Math.max(layout.height, needed)
                    }
                    return (
                      <div
                        key={card.id}
                        className="w-full"
                        style={{
                          gridColumn: `${layout.col + 1} / span ${layout.width}`,
                          gridRow: `${layout.row + 1} / span ${rowSpan}`,
                          height: 'fit-content',
                        }}
                      >
                        <MusicWidget card={card} layout={layout} onTap={handleTap} />
                      </div>
                    )
                  }

                  // Audio cards — always render inline (any size)
                  // Per CLAUDE.md rule #2: render AudioPlayer directly on public page
                  if (card.card_type === 'audio' && isAudioContent(card.content)) {
                    const ac = card.content as unknown as AudioCardContent
                    const isTransparent = ac.transparentBackground ?? false
                    const isCdPlayer = ac.playerStyle === 'cd-player'

                    const audioPlayerEl = (
                      <AudioPlayer
                        tracks={ac.tracks || []}
                        albumArtUrl={ac.albumArtUrl}
                        showWaveform={ac.showWaveform ?? true}
                        looping={ac.looping ?? false}
                        autoplay={ac.autoplay ?? false}
                        transparentBackground={isTransparent}
                        reverbConfig={ac.reverbConfig}
                        playerColors={ac.playerColors}
                        blinkieColors={ac.blinkieColors}
                        blinkieCardHasBgImage={!!(ac.blinkieBoxBackgrounds?.cardBgUrl) && !isTransparent}
                        cardId={card.id}
                        pageId={card.page_id}
                        themeVariant="blinkies"
                        playerStyle={ac.playerStyle}
                      />
                    )

                    return (
                      <div
                        key={card.id}
                        className="w-full h-full"
                        style={{
                          gridColumn: '1 / -1',
                          gridRow: `${layout.row + 1} / span ${layout.height}`,
                        }}
                      >
                        <ScaleToFit>
                          {isCdPlayer ? audioPlayerEl : (
                            <SystemSettingsCard
                              cardType="audio"
                              transparentBackground={isTransparent}
                              titleBarStyle="system-settings"
                              blinkieBg
                              blinkieCardOuter={ac.blinkieBoxBackgrounds?.cardOuter}
                              blinkieCardOuterDim={ac.blinkieBoxBackgrounds?.cardOuterDim}
                              blinkieOuterBoxColor={ac.blinkieColors?.outerBox}
                              blinkieInnerBoxColor={ac.blinkieColors?.innerBox}
                              blinkieCardBgUrl={ac.blinkieBoxBackgrounds?.cardBgUrl}
                              blinkieCardBgScale={ac.blinkieBoxBackgrounds?.cardBgScale}
                              blinkieCardBgPosX={ac.blinkieBoxBackgrounds?.cardBgPosX}
                              blinkieCardBgPosY={ac.blinkieBoxBackgrounds?.cardBgPosY}
                              blinkieCardBgNone={ac.blinkieBoxBackgrounds?.cardBgNone}
                              blinkieTextColor={ac.blinkieColors?.text}
                            >
                              {audioPlayerEl}
                            </SystemSettingsCard>
                          )}
                        </ScaleToFit>
                      </div>
                    )
                  }

                  // Standard 1x1 app icon
                  return (
                    <div
                      key={card.id}
                      className="flex items-center justify-center"
                      style={{
                        gridColumn: `${layout.col + 1} / span ${layout.width}`,
                        gridRow: `${layout.row + 1} / span ${layout.height}`,
                      }}
                    >
                      <AppIcon card={card} onTap={handleTap} is8Bit={is8Bit} isWin95={isWin95} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots — overlaid so they don't steal grid height */}
        {pageCount > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <PaginationDots count={pageCount} active={currentPage} onPageChange={goToPage} />
            </div>
          </div>
        )}
      </div>

      {/* Dock */}
      {phoneHomeShowDock && (
        <div>
          <PhoneHomeDock dockCards={dockCards} onTap={handleTap} is8Bit={is8Bit} isWin95={isWin95} translucent={phoneHomeDockTranslucent} />
        </div>
      )}

    </div>
  )
}
