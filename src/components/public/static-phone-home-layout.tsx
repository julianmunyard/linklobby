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
  phoneHomeVariant?: 'default' | '8-bit'
  socialIconsJson?: string | null
  socialIconColor?: string | null
}

// 4-column grid, rows of icons per page
const GRID_COLS = 4
const MAX_ROWS_PER_PAGE = 6

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
    <div className="flex items-center justify-between px-6 pt-[max(env(safe-area-inset-top),12px)] pb-1 text-[13px] font-semibold text-theme-text">
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
}: {
  card: Card
  onTap: (card: Card) => void
  size?: 'normal' | 'dock'
  is8Bit?: boolean
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
  const iconRadius = is8Bit ? (isDock ? 'rounded-[6px]' : 'rounded-[8px]') : (isDock ? 'rounded-[12px]' : 'rounded-[14px]')

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
        style={
          displaySrc
            ? undefined
            : { background: fallback.bg }
        }
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
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
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
}: {
  socialIcon: SocialIcon
  parentCard: Card
  size?: 'normal' | 'dock'
  is8Bit?: boolean
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
  const iconRadius = is8Bit ? (isDock ? 'rounded-[6px]' : 'rounded-[8px]') : (isDock ? 'rounded-[12px]' : 'rounded-[14px]')

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
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
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
}: {
  card: Card
  layout: PhoneHomeLayout
  is8Bit?: boolean
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

  const borderRadius = is8Bit ? 'rounded-[8px]' : 'rounded-[16px]'

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
      {images.length > 1 && !is8Bit && (
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-medium">
          {currentIdx + 1}/{images.length}
        </div>
      )}
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
  const customHeight = content.embedHeight as number | undefined
  const isSlim = layout.width === 4 && layout.height === 1

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

  // Bandcamp: only adjust size if user didn't paste a specific embed code
  if (platform === 'bandcamp' && !embedIframeUrl) {
    iframeUrl = adjustBandcampSize(iframeUrl, !isSlim)
  }

  // Use custom height from embed code if available (e.g. Bandcamp variants),
  // otherwise use platform defaults
  const embedHeight = customHeight
    || (isSlim ? (SLIM_EMBED_HEIGHTS[platform] || 80) : (SQUARE_EMBED_HEIGHTS[platform] || 152))

  // Apple Music needs scrollable container for album/playlist embeds
  const needsScroll = platform === 'apple-music' && !isSlim
  // Apple Music: make iframe taller than container so container scrolls
  const iframeHeight = needsScroll ? 800 : embedHeight

  return (
    <div
      className="w-full rounded-[16px]"
      style={{
        height: embedHeight,
        overflow: needsScroll ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <iframe
        src={iframeUrl}
        width="100%"
        height={iframeHeight}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={card.title || 'Music embed'}
        style={{ background: 'transparent', borderRadius: '16px', border: 0 }}
        scrolling={needsScroll ? 'yes' : 'no'}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Audio Player Modal
// ---------------------------------------------------------------------------

function PhoneHomePlayerModal({
  card,
  onClose,
}: {
  card: Card
  onClose: () => void
}) {
  const audioContent = card.content as unknown as AudioCardContent

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div
        className="relative w-full max-w-[430px] mx-auto rounded-t-[20px] p-5 pb-[max(env(safe-area-inset-bottom),24px)] animate-in slide-in-from-bottom duration-300"
        style={{ backgroundColor: 'var(--theme-card-bg, rgba(20,20,20,0.95))', backdropFilter: 'blur(24px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
        {card.title && (
          <h3 className="text-theme-text text-sm font-semibold mb-3 text-center truncate">
            {card.title}
          </h3>
        )}
        {/* AudioPlayer rendered directly per CLAUDE.md rule 2, wrapped in SystemSettingsCard for blinkies chrome */}
        <SystemSettingsCard
          cardType="audio"
          transparentBackground={audioContent.transparentBackground ?? false}
          titleBarStyle="system-settings"
          blinkieBg
          blinkieCardOuter={audioContent.blinkieBoxBackgrounds?.cardOuter}
          blinkieCardOuterDim={audioContent.blinkieBoxBackgrounds?.cardOuterDim}
          blinkieOuterBoxColor={audioContent.blinkieColors?.outerBox}
          blinkieInnerBoxColor={audioContent.blinkieColors?.innerBox}
          blinkieCardBgUrl={audioContent.blinkieBoxBackgrounds?.cardBgUrl}
          blinkieCardBgScale={audioContent.blinkieBoxBackgrounds?.cardBgScale}
          blinkieCardBgPosX={audioContent.blinkieBoxBackgrounds?.cardBgPosX}
          blinkieCardBgPosY={audioContent.blinkieBoxBackgrounds?.cardBgPosY}
          blinkieCardBgNone={audioContent.blinkieBoxBackgrounds?.cardBgNone}
          blinkieTextColor={audioContent.blinkieColors?.text}
        >
          <AudioPlayer
            tracks={audioContent.tracks || []}
            albumArtUrl={audioContent.albumArtUrl}
            showWaveform={audioContent.showWaveform ?? true}
            looping={audioContent.looping ?? false}
            autoplay={false}
            transparentBackground={audioContent.transparentBackground ?? false}
            reverbConfig={audioContent.reverbConfig}
            playerColors={audioContent.playerColors}
            blinkieColors={audioContent.blinkieColors}
            blinkieCardHasBgImage={!!(audioContent.blinkieBoxBackgrounds?.cardBgUrl) && !(audioContent.transparentBackground)}
            cardId={card.id}
            pageId={card.page_id}
            themeVariant="blinkies"
          />
        </SystemSettingsCard>
      </div>
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
}: {
  dockCards: Card[]
  onTap: (card: Card) => void
  is8Bit?: boolean
}) {
  if (dockCards.length === 0) return null

  if (is8Bit) {
    return (
      <div
        className="mb-0 pb-[max(env(safe-area-inset-bottom),0px)] px-5 py-2.5 flex items-center justify-center gap-5"
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
      style={{
        backgroundColor: 'var(--theme-card-bg, rgba(30,30,30,0.5))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
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
  variant: 'default' | '8-bit' = 'default',
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
      for (const si of socialIcons) {
        itemsToPlace.push({ card, w: 1, h: 1, socialIcon: si })
      }
      continue
    }

    let w = 1, h = 1
    if (explicit) { w = explicit.width; h = explicit.height }
    else if (card.card_type === 'gallery' && isGalleryContent(card.content)) {
      if (variant === '8-bit') { w = 4; h = 2 } else { w = 4; h = 2 }
    } else if (card.card_type === 'music') {
      w = 4
      const embedH = content.embedHeight as number | undefined
      h = (embedH && embedH > 200) ? 2 : 1
    } else if (card.card_type === 'audio' && content.phoneHomeWidgetMode) {
      w = 4; h = 1
    }

    itemsToPlace.push({ card, w, h, explicit })
  }

  for (const item of itemsToPlace) {
    const { card, w, h, explicit, socialIcon } = item

    if (explicit) {
      const pageIdx = explicit.page
      while (pages.length <= pageIdx) { pages.push([]); occupied.set(pages.length - 1, new Set()) }
      if (isSlotFree(pageIdx, explicit.row, explicit.col, w, h)) {
        markSlot(pageIdx, explicit.row, explicit.col, w, h)
        pages[pageIdx].push({ card, layout: explicit, socialIcon })
        continue
      }
      let placedOnPage = false
      for (let r = 0; r < MAX_ROWS_PER_PAGE && !placedOnPage; r++) {
        for (let c = 0; c <= GRID_COLS - w && !placedOnPage; c++) {
          if (isSlotFree(pageIdx, r, c, w, h)) {
            markSlot(pageIdx, r, c, w, h)
            pages[pageIdx].push({ card, layout: { page: pageIdx, row: r, col: c, width: w as 1 | 2 | 4, height: h as 1 | 2 | 3 }, socialIcon })
            placedOnPage = true
          }
        }
      }
      if (placedOnPage) continue
    }

    let placed = false
    for (let p = 0; p < pages.length && !placed; p++) {
      for (let r = 0; r < MAX_ROWS_PER_PAGE && !placed; r++) {
        for (let c = 0; c <= GRID_COLS - w && !placed; c++) {
          if (isSlotFree(p, r, c, w, h)) {
            markSlot(p, r, c, w, h)
            pages[p].push({ card, layout: { page: p, row: r, col: c, width: w as 1 | 2 | 4, height: h as 1 | 2 | 3 }, socialIcon })
            placed = true
          }
        }
      }
    }

    if (!placed) {
      const newPageIdx = pages.length
      pages.push([]); occupied.set(newPageIdx, new Set())
      markSlot(newPageIdx, 0, 0, w, h)
      pages[newPageIdx].push({ card, layout: { page: newPageIdx, row: 0, col: 0, width: w as 1 | 2 | 4, height: h as 1 | 2 | 3 }, socialIcon })
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
  phoneHomeVariant = 'default',
  socialIconsJson,
  socialIconColor,
}: StaticPhoneHomeLayoutProps) {
  const is8Bit = phoneHomeVariant === '8-bit'
  const [currentPage, setCurrentPage] = useState(0)
  const [playerCard, setPlayerCard] = useState<Card | null>(null)
  const touchRef = useRef<{ startX: number; startY: number; startTime: number } | null>(null)
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

  // Clamp currentPage
  useEffect(() => {
    if (currentPage >= pageCount) setCurrentPage(Math.max(0, pageCount - 1))
  }, [currentPage, pageCount])

  // Handle card taps
  const handleTap = useCallback(
    (card: Card) => {
      if (card.card_type === 'audio' && isAudioContent(card.content)) {
        // Only open modal for icon mode (1x1), not widget mode
        const audioContent = card.content as Record<string, unknown>
        const audioLayout = audioContent.phoneHomeLayout as PhoneHomeLayout | undefined
        const isWidget = audioLayout && (audioLayout.width > 1 || audioLayout.height > 1)
        if (!isWidget) setPlayerCard(card)
        return
      }
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

  // Continuous swipe: follows finger/mouse in real-time, snaps on release
  const pagesContainerRef = useRef<HTMLDivElement>(null)
  const swipeAnimating = useRef(false)
  const swipeDragOffset = useRef(0)

  const updateSwipeTransform = useCallback((offset: number, animate: boolean) => {
    const el = pagesContainerRef.current
    if (!el) return
    const baseTranslate = -(currentPage * 100)
    const containerWidth = containerRef.current?.offsetWidth || 375
    const pxToPercent = (offset / containerWidth) * 100
    el.style.transition = animate ? 'transform 300ms ease-out' : 'none'
    el.style.transform = `translateX(${baseTranslate + pxToPercent}%)`
  }, [currentPage])

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (swipeAnimating.current) return
    touchRef.current = { startX: clientX, startY: clientY, startTime: Date.now() }
    swipeDragOffset.current = 0
  }, [])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!touchRef.current) return
    const deltaX = clientX - touchRef.current.startX
    const deltaY = clientY - touchRef.current.startY
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 10) return
    let offset = deltaX
    if ((currentPage === 0 && deltaX > 0) || (currentPage >= pageCount - 1 && deltaX < 0)) {
      offset = deltaX * 0.3
    }
    swipeDragOffset.current = offset
    updateSwipeTransform(offset, false)
  }, [currentPage, pageCount, updateSwipeTransform])

  const handleDragEnd = useCallback((clientX: number, clientY: number) => {
    if (!touchRef.current) return
    const deltaX = clientX - touchRef.current.startX
    const elapsed = Date.now() - touchRef.current.startTime
    touchRef.current = null
    const velocity = Math.abs(deltaX) / Math.max(elapsed, 1)
    const containerWidth = containerRef.current?.offsetWidth || 375
    const threshold = containerWidth * 0.25
    let targetPage = currentPage
    if (deltaX < -threshold || (deltaX < -30 && velocity > 0.3)) {
      targetPage = Math.min(currentPage + 1, pageCount - 1)
    } else if (deltaX > threshold || (deltaX > 30 && velocity > 0.3)) {
      targetPage = Math.max(currentPage - 1, 0)
    }
    swipeDragOffset.current = 0
    swipeAnimating.current = true
    setCurrentPage(targetPage)
    requestAnimationFrame(() => {
      const el = pagesContainerRef.current
      if (el) {
        el.style.transition = 'transform 300ms ease-out'
        el.style.transform = `translateX(-${targetPage * 100}%)`
      }
      setTimeout(() => { swipeAnimating.current = false }, 320)
    })
  }, [currentPage, pageCount])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
  }, [handleDragStart])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
  }, [handleDragMove])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    handleDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
  }, [handleDragEnd])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY)
  }, [handleDragStart])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }, [handleDragMove])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    handleDragEnd(e.clientX, e.clientY)
  }, [handleDragEnd])

  // Two-finger trackpad scroll for page swiping on desktop
  const wheelAccum = useRef(0)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navLock = useRef(false)

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
    navLock.current = true
    setTimeout(() => { navLock.current = false }, 500)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (navLock.current) return
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return

    wheelAccum.current += e.deltaX
    if (wheelTimer.current) clearTimeout(wheelTimer.current)
    wheelTimer.current = setTimeout(() => { wheelAccum.current = 0 }, 200)

    const threshold = 80
    if (Math.abs(wheelAccum.current) >= threshold) {
      const direction = wheelAccum.current > 0 ? 1 : -1
      wheelAccum.current = 0
      setCurrentPage((p) => {
        const next = p + direction
        if (next < 0 || next >= pageCount) return p
        return next
      })
      navLock.current = true
      setTimeout(() => { navLock.current = false }, 500)
    }
  }, [pageCount])

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden text-theme-text select-none">
      {/* Status bar */}
      <PhoneHomeStatusBar />

      {/* Swipeable grid area */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={pagesContainerRef}
          className="flex h-full"
          style={{ transform: `translateX(-${currentPage * 100}%)`, transition: 'transform 300ms ease-out' }}
        >
          {pages.map((pageItems, pageIdx) => (
            <div
              key={pageIdx}
              className="w-full shrink-0 px-5 pt-3 pb-20"
            >
              {/* Grid container */}
              <div
                className="grid gap-y-5 gap-x-3 w-full"
                style={{
                  gridTemplateColumns: 'repeat(4, 1fr)',
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
                        />
                      </div>
                    )
                  }

                  // Gallery widgets span multiple cells
                  if (card.card_type === 'gallery' && isGalleryContent(card.content) && (layout.width > 1 || layout.height > 1)) {
                    return (
                      <div
                        key={card.id}
                        style={{
                          gridColumn: `${layout.col + 1} / span ${layout.width}`,
                          gridRow: `${layout.row + 1} / span ${layout.height}`,
                          aspectRatio: `${layout.width} / ${layout.height}`,
                        }}
                      >
                        <PhotoWidget card={card} layout={layout} is8Bit={is8Bit} />
                      </div>
                    )
                  }

                  // Music widgets (4x1 wide or 2x2)
                  if (card.card_type === 'music' && (layout.width > 1 || layout.height > 1)) {
                    return (
                      <div
                        key={card.id}
                        style={{
                          gridColumn: `${layout.col + 1} / span ${layout.width}`,
                          gridRow: `${layout.row + 1} / span ${layout.height}`,
                        }}
                      >
                        <MusicWidget card={card} layout={layout} onTap={handleTap} />
                      </div>
                    )
                  }

                  // Audio widgets (4x1 slim or 2x2 square — widget mode)
                  // Per CLAUDE.md rule #2: render AudioPlayer directly on public page
                  if (card.card_type === 'audio' && (layout.width > 1 || layout.height > 1) && isAudioContent(card.content)) {
                    const ac = card.content as unknown as AudioCardContent
                    const isTransparent = ac.transparentBackground ?? false
                    return (
                      <div
                        key={card.id}
                        style={{
                          gridColumn: `${layout.col + 1} / span ${layout.width}`,
                          gridRow: `${layout.row + 1} / span ${layout.height}`,
                        }}
                      >
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
                          <AudioPlayer
                            tracks={ac.tracks || []}
                            albumArtUrl={ac.albumArtUrl}
                            showWaveform={ac.showWaveform ?? true}
                            looping={ac.looping ?? false}
                            autoplay={false}
                            transparentBackground={isTransparent}
                            reverbConfig={ac.reverbConfig}
                            playerColors={ac.playerColors}
                            blinkieColors={ac.blinkieColors}
                            blinkieCardHasBgImage={!!(ac.blinkieBoxBackgrounds?.cardBgUrl) && !isTransparent}
                            cardId={card.id}
                            pageId={card.page_id}
                            themeVariant="blinkies"
                          />
                        </SystemSettingsCard>
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
                      <AppIcon card={card} onTap={handleTap} is8Bit={is8Bit} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      {pageCount > 1 && (
        <PaginationDots count={pageCount} active={currentPage} onPageChange={goToPage} />
      )}

      {/* Dock */}
      {phoneHomeShowDock && <PhoneHomeDock dockCards={dockCards} onTap={handleTap} is8Bit={is8Bit} />}

      {/* Audio Player Modal */}
      {playerCard && (
        <PhoneHomePlayerModal
          card={playerCard}
          onClose={() => setPlayerCard(null)}
        />
      )}

    </div>
  )
}
