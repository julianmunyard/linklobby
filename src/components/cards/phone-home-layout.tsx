'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import type { Card, PhoneHomeLayout } from '@/types/card'
import type { AudioCardContent, GalleryCardContent } from '@/types/card'
import { isAudioContent, isGalleryContent } from '@/types/card'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
// usePageStore not used directly — layout updates are sent via postMessage to parent editor
import { AudioCard } from '@/components/cards/audio-card'
import { AudioPlayer } from '@/components/audio/audio-player'
import { SystemSettingsCard } from '@/components/cards/system-settings-card'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import { Globe, Mail, Music } from 'lucide-react'
import { InlineEditable } from '@/components/preview/inline-editable'
import type { ComponentType } from 'react'
import type { SocialPlatform, SocialIcon } from '@/types/profile'
import { SOCIAL_PLATFORMS } from '@/types/profile'

type IconComponent = ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>

const PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
  instagram: SiInstagram, tiktok: SiTiktok, youtube: SiYoutube, spotify: SiSpotify,
  twitter: SiX, soundcloud: SiSoundcloud, applemusic: SiApplemusic, bandcamp: SiBandcamp,
  deezer: Music, amazonmusic: SiAmazonmusic, facebook: SiFacebook, threads: SiThreads,
  bluesky: SiBluesky, snapchat: SiSnapchat, pinterest: SiPinterest, linkedin: SiLinkedin,
  whatsapp: SiWhatsapp, twitch: SiTwitch, kick: SiKick, discord: SiDiscord,
  website: Globe, email: Mail, patreon: SiPatreon, venmo: SiVenmo, cashapp: SiCashapp, paypal: SiPaypal,
}

// 4-column grid constants
const GRID_COLS = 4
const MAX_ROWS_PER_PAGE = 8

// Fallback icons
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

function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-semibold text-theme-text"
    >
      <span className="w-16 text-left">9:41</span>
      <div className="w-16 flex items-center justify-end gap-1">
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" opacity={0.9}>
          <rect x="0" y="9" width="3" height="3" rx="0.5" />
          <rect x="4" y="6" width="3" height="6" rx="0.5" />
          <rect x="8" y="3" width="3" height="9" rx="0.5" />
          <rect x="12" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor" opacity={0.9}>
          <path d="M7 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" transform="translate(0,-2)" />
          <path d="M3.5 8.5a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M1 5.5a9 9 0 0112 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
// App Icon
// ---------------------------------------------------------------------------

function AppIcon({
  card,
  isSelected,
  onTap,
  size = 'normal',
  is8Bit = false,
  isWin95 = false,
  isEditable = false,
  onInlineCommit,
  onInlineEditStart,
  onInlineEditEnd,
}: {
  card: Card
  isSelected?: boolean
  onTap: (cardId: string) => void
  size?: 'normal' | 'dock'
  is8Bit?: boolean
  isWin95?: boolean
  isEditable?: boolean
  onInlineCommit?: (cardId: string, text: string) => void
  onInlineEditStart?: (cardId: string) => void
  onInlineEditEnd?: () => void
}) {
  const content = card.content as Record<string, unknown>
  const appIconUrl = content.appIconUrl as string | undefined
  const appIconColor = content.appIconColor as string | undefined
  const imageUrl = content.imageUrl as string | undefined
  const fallback = FALLBACK_ICONS[card.card_type] ?? FALLBACK_ICONS.link
  const iconSrc = appIconUrl || imageUrl
  const fallbackIcon = fallback.icon // e.g. CD image for audio cards
  const displaySrc = iconSrc || fallbackIcon
  const label = card.title || card.card_type
  const isDock = size === 'dock'
  const iconRadius = isWin95 ? 'rounded-[2px]' : is8Bit ? (isDock ? 'rounded-[6px]' : 'rounded-[8px]') : (isDock ? 'rounded-[12px]' : 'rounded-[14px]')

  return (
    <button
      className={cn(
        'flex flex-col items-center gap-[5px] w-full group transition-all',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent rounded-[16px]',
      )}
      onClick={() => onTap(card.id)}
    >
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center',
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
          <img src={displaySrc} alt={label} className="w-full h-full object-contain" draggable={false} style={is8Bit ? { imageRendering: 'pixelated' as const } : undefined} />
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
          {isEditable ? (
            <InlineEditable
              value={card.title || ''}
              onCommit={(text) => onInlineCommit?.(card.id, text)}
              multiline={false}
              placeholder="Name"
              onEditStart={() => onInlineEditStart?.(card.id)}
              onEditEnd={onInlineEditEnd}
              className="outline-none min-w-[3ch] inline-block max-w-[70px]"
            />
          ) : (
            label
          )}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Social App Icon — renders individual social platform as an app icon
// ---------------------------------------------------------------------------

function SocialAppIcon({
  socialIcon,
  parentCard,
  isSelected,
  onTap,
  size = 'normal',
  is8Bit = false,
  isWin95 = false,
}: {
  socialIcon: SocialIcon
  parentCard: Card
  isSelected?: boolean
  onTap: (cardId: string) => void
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
    <button
      className={cn(
        'flex flex-col items-center gap-[5px] w-full group transition-all',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent rounded-[16px]',
      )}
      onClick={() => onTap(parentCard.id)}
    >
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center',
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
    </button>
  )
}

// ---------------------------------------------------------------------------
// Photo Widget
// ---------------------------------------------------------------------------

function PhotoWidget({ card, is8Bit = false, isWin95 = false }: { card: Card; is8Bit?: boolean; isWin95?: boolean }) {
  const content = card.content as unknown as GalleryCardContent
  const images = content.images ?? []
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setIdx((p) => (p + 1) % images.length), 3000)
    return () => clearInterval(id)
  }, [images.length])

  const borderRadius = isWin95 ? 'rounded-[8px]' : is8Bit ? 'rounded-[8px]' : 'rounded-[16px]'

  if (images.length === 0) {
    return (
      <div className={cn('w-full h-full flex items-center justify-center', borderRadius)} style={{ background: FALLBACK_ICONS.gallery.bg }}>
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
          style={{ opacity: i === idx ? 1 : 0, ...(is8Bit ? { imageRendering: 'pixelated' as const } : {}) }}
          draggable={false}
        />
      ))}
      {images.length > 1 && !is8Bit && !isWin95 && (
        <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-medium">
          {idx + 1}/{images.length}
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
 */
function adjustBandcampSize(url: string, wantLarge: boolean): string {
  if (!url.includes('bandcamp.com/EmbeddedPlayer')) return url
  if (url.includes('/size=')) {
    return url.replace(/\/size=(small|large)/, `/size=${wantLarge ? 'large' : 'small'}`)
  }
  const separator = url.endsWith('/') ? '' : '/'
  return `${url}${separator}size=${wantLarge ? 'large' : 'small'}/`
}

function MusicWidget({ card, layout, onClick }: { card: Card; layout: PhoneHomeLayout; onClick?: (id: string) => void }) {
  const content = card.content as Record<string, unknown>
  const platform = (content.platform as string) || 'generic-music'
  const embedUrl = content.embedUrl as string | undefined
  const embedIframeUrl = content.embedIframeUrl as string | undefined
  const embeddable = content.embeddable as boolean | undefined
  // Layout height determines embed variant: <=2 rows = compact, >2 = full
  const isSlim = layout.height <= 2

  // If no embed URL or not embeddable, fall back to a tappable icon
  if ((!embedUrl && !embedIframeUrl) || embeddable === false) {
    const fallback = FALLBACK_ICONS.music
    return (
      <button
        className="w-full h-full rounded-[16px] overflow-hidden flex items-center justify-center"
        style={{ background: fallback.bg }}
        onClick={() => onClick?.(card.id)}
      >
        <span className="text-3xl">🎧</span>
      </button>
    )
  }

  let iframeUrl = embedIframeUrl || (embedUrl ? getEmbedUrl(embedUrl, platform as EmbedPlatform) : '')

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
      <div className={cn('w-full relative', onClick && 'cursor-pointer')}>
        <iframe
          src={iframeUrl}
          width="100%"
          height={bcHeight}
          frameBorder="0"
          seamless
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={card.title || 'Bandcamp embed'}
          style={{ border: 0, background: 'transparent', display: 'block', pointerEvents: onClick ? 'none' : undefined }}
        />
        {onClick && (
          <div className="absolute inset-0 z-10" onClick={() => onClick(card.id)} />
        )}
      </div>
    )
  }

  // Non-Bandcamp: slot-based heights with rounded widget style
  const embedHeight = isSlim
    ? (SLIM_EMBED_HEIGHTS[platform] || 152)
    : (SQUARE_EMBED_HEIGHTS[platform] || 352)

  return (
    <div
      className={cn('w-full relative overflow-hidden', onClick && 'cursor-pointer')}
      style={{ height: embedHeight, borderRadius: 12 }}
    >
      <iframe
        src={iframeUrl}
        width="100%"
        height={embedHeight}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={card.title || 'Music embed'}
        style={{ borderRadius: 12, border: 0, pointerEvents: onClick ? 'none' : undefined }}
      />
      {onClick && (
        <div className="absolute inset-0 z-10" onClick={() => onClick(card.id)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dock
// ---------------------------------------------------------------------------

function Dock({
  dockCards,
  selectedCardId,
  onCardClick,
  is8Bit = false,
  isWin95 = false,
  translucent = true,
}: {
  dockCards: Card[]
  selectedCardId?: string | null
  onCardClick: (cardId: string) => void
  is8Bit?: boolean
  isWin95?: boolean
  translucent?: boolean
}) {
  if (dockCards.length === 0) return null

  if (isWin95) {
    return (
      <div
        className={cn("mb-0 px-3 py-[6px] flex items-center", dockCards.length >= 4 ? "justify-center gap-[3px]" : "justify-evenly")}
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
            <AppIcon card={card} onTap={onCardClick} isSelected={selectedCardId === card.id} size="dock" isWin95 />
          </div>
        ))}
      </div>
    )
  }

  if (is8Bit) {
    return (
      <div
        className="mb-0 px-5 py-2.5 flex items-center justify-center gap-5"
        style={{
          backgroundColor: 'var(--theme-card-bg, rgba(30,30,30,0.85))',
        }}
      >
        {dockCards.map((card) => (
          <AppIcon key={card.id} card={card} onTap={onCardClick} isSelected={selectedCardId === card.id} size="dock" is8Bit />
        ))}
      </div>
    )
  }

  return (
    <div
      className="mx-3 mb-2 rounded-[22px] px-5 py-2.5 flex items-center justify-center gap-5"
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
        <AppIcon key={card.id} card={card} onTap={onCardClick} isSelected={selectedCardId === card.id} size="dock" />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DnD: Draggable wrapper for grid items (editor preview only)
// ---------------------------------------------------------------------------

type DragItemData = { card: Card; layout: PhoneHomeLayout; socialIcon?: SocialIcon }

function DraggableGridItem({
  id,
  data,
  children,
  style,
  className,
}: {
  id: string
  data: DragItemData
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-no-swipe
      className={className}
      style={{
        ...style,
        opacity: isDragging ? 0.3 : 1,
        transition: 'opacity 150ms ease',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DnD: Droppable cell target (shows during drag)
// ---------------------------------------------------------------------------

function DroppableCell({ id, data }: { id: string; data: { page: number; row: number; col: number } }) {
  const { setNodeRef, isOver } = useDroppable({ id, data })

  return (
    <div
      ref={setNodeRef}
      className="rounded-[14px] transition-all duration-150"
      style={{
        backgroundColor: isOver ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.05)',
        border: isOver ? '2px solid rgba(59,130,246,0.5)' : '2px dashed rgba(255,255,255,0.1)',
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// Auto-layout
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

interface PhoneHomeLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  isEditable?: boolean
  onCardClick?: (cardId: string) => void
  onMoveCards?: (moves: Array<{ cardId: string; content: Record<string, unknown> }>) => void
  selectedCardId?: string | null
}

export function PhoneHomeLayout({
  title,
  cards,
  isPreview = false,
  isEditable = false,
  onCardClick,
  onMoveCards,
  selectedCardId,
}: PhoneHomeLayoutProps) {
  const [currentPage, setCurrentPage] = useState(0)

  const handleInlineCommit = useCallback((cardId: string, text: string) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'UPDATE_CARD', payload: { cardId, title: text } },
        window.location.origin
      )
    }
  }, [])

  const handleInlineEditStart = useCallback((cardId: string) => {
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SELECT_CARD', payload: { cardId } },
        window.location.origin
      )
      window.parent.postMessage({ type: 'INLINE_EDIT_ACTIVE' }, window.location.origin)
    }
  }, [])

  const handleInlineEditEnd = useCallback(() => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'INLINE_EDIT_DONE' }, window.location.origin)
    }
  }, [])

  const phoneHomeDock = useThemeStore((s) => s.phoneHomeDock)
  const phoneHomeShowDock = useThemeStore((s) => s.phoneHomeShowDock)
  const phoneHomeDockTranslucent = useThemeStore((s) => s.phoneHomeDockTranslucent ?? true)
  const phoneHomeVariant = useThemeStore((s) => s.phoneHomeVariant ?? 'default')
  const is8Bit = phoneHomeVariant === '8-bit'
  const isWin95 = phoneHomeVariant === 'windows-95'

  const sortedCards = useMemo(() => sortCardsBySortKey(cards), [cards])

  const dockCards = useMemo(
    () => phoneHomeDock.map((id) => sortedCards.find((c) => c.id === id)).filter((c): c is Card => !!c && c.is_visible),
    [phoneHomeDock, sortedCards],
  )

  const socialIconsRaw = useProfileStore((s) => s.socialIcons)
  const socialIcons = useMemo(() => [...socialIconsRaw].sort((a, b) => a.sortKey.localeCompare(b.sortKey)), [socialIconsRaw])

  const { pages } = useMemo(
    () => autoLayoutCards(sortedCards, phoneHomeDock, phoneHomeVariant, socialIcons),
    [sortedCards, phoneHomeDock, phoneHomeVariant, socialIcons],
  )

  const pageCount = pages.length

  useEffect(() => {
    if (currentPage >= pageCount) setCurrentPage(Math.max(0, pageCount - 1))
  }, [currentPage, pageCount])

  const handleIconTap = useCallback((cardId: string) => {
    const card = sortedCards.find((c) => c.id === cardId)
    if (!card) return

    // In editor preview, always select the card so user can edit it
    if (isPreview && onCardClick) {
      onCardClick(cardId)
    }

    // Audio cards render inline — no modal needed
  }, [sortedCards, isPreview, onCardClick])

  // ---------------------------------------------------------------------------
  // DnD state & handlers (editor preview only)
  // ---------------------------------------------------------------------------

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [activeDragData, setActiveDragData] = useState<DragItemData | null>(null)
  const edgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gridContainerRef = useRef<HTMLDivElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 300, tolerance: 5 },
    }),
  )

  // Measuring config: continuously re-measure droppables during drag
  // (needed because page transitions add/remove droppable cells)
  const measuringConfig = useMemo(() => ({
    droppable: { strategy: MeasuringStrategy.WhileDragging },
  }), [])

  // Track current page in a ref so the pointermove listener always has latest
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage
  const pageCountRef = useRef(pageCount)
  pageCountRef.current = pageCount

  const handleDndDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
    setActiveDragData(event.active.data.current as DragItemData)

    // Attach a pointermove listener for edge-based page navigation
    const onPointerMove = (e: PointerEvent) => {
      const container = gridContainerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const edgeZone = 44 // px from each edge
      const nearLeft = e.clientX < rect.left + edgeZone
      const nearRight = e.clientX > rect.right - edgeZone

      if (nearLeft || nearRight) {
        if (!edgeTimerRef.current) {
          edgeTimerRef.current = setTimeout(() => {
            edgeTimerRef.current = null
            if (nearLeft && currentPageRef.current > 0) {
              const newPage = currentPageRef.current - 1
              setCurrentPage(newPage)
              gridContainerRef.current?.scrollTo({ left: newPage * (gridContainerRef.current?.offsetWidth || 375), behavior: 'smooth' })
            } else if (nearRight && currentPageRef.current < pageCountRef.current) {
              const newPage = currentPageRef.current + 1
              setCurrentPage(newPage)
              gridContainerRef.current?.scrollTo({ left: newPage * (gridContainerRef.current?.offsetWidth || 375), behavior: 'smooth' })
            }
          }, 400)
        }
      } else {
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current)
          edgeTimerRef.current = null
        }
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    // Store cleanup in a ref so dragEnd/dragCancel can remove it
    pointerMoveCleanupRef.current = () => {
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [])

  const pointerMoveCleanupRef = useRef<(() => void) | null>(null)

  const handleDndDragEnd = useCallback((event: DragEndEvent) => {
    // Clean up edge detection
    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current)
      edgeTimerRef.current = null
    }
    pointerMoveCleanupRef.current?.()
    pointerMoveCleanupRef.current = null

    setActiveDragId(null)
    setActiveDragData(null)

    const { active, over } = event
    if (!over) return

    const dragData = active.data.current as DragItemData
    const dropData = over.data.current as { page: number; row: number; col: number } | undefined
    if (!dragData || !dropData) return
    if (!onMoveCards) return

    const { card: dragCard, layout: dragLayout, socialIcon: dragSocialIcon } = dragData
    const dragW = dragLayout.width
    const dragH = dragLayout.height

    // Snap target position so widget fits within grid bounds
    const targetPage = dropData.page
    const targetCol = Math.min(dropData.col, GRID_COLS - dragW)
    const targetRow = Math.min(dropData.row, MAX_ROWS_PER_PAGE - dragH)

    // Build a unique ID for each grid item
    const dragId = dragSocialIcon
      ? `${dragCard.id}:${dragSocialIcon.platform}`
      : dragCard.id

    // Collect all items across all pages
    type ReflowItem = { id: string; card: Card; layout: PhoneHomeLayout; socialIcon?: SocialIcon }
    const allItems: ReflowItem[] = []
    for (const pageItems of pages) {
      for (const item of pageItems) {
        const itemId = item.socialIcon
          ? `${item.card.id}:${item.socialIcon.platform}`
          : item.card.id
        allItems.push({ id: itemId, card: item.card, layout: { ...item.layout }, socialIcon: item.socialIcon })
      }
    }

    // --- Reflow algorithm ---
    // 1. Remove the dragged item from the list
    // 2. Place the dragged item at the target position
    // 3. For remaining items (in reading order), try their current position
    //    If blocked, find the next free slot (cascading to later pages)

    const others = allItems.filter((it) => it.id !== dragId)
    // Sort others in reading order (page, row, col)
    others.sort((a, b) => {
      if (a.layout.page !== b.layout.page) return a.layout.page - b.layout.page
      if (a.layout.row !== b.layout.row) return a.layout.row - b.layout.row
      return a.layout.col - b.layout.col
    })

    // Occupied grid tracker
    const maxPages = Math.max(targetPage + 1, pages.length) + 2
    const occ = new Map<number, Set<string>>()
    for (let p = 0; p < maxPages; p++) occ.set(p, new Set())

    function markCells(page: number, row: number, col: number, w: number, h: number) {
      let s = occ.get(page)
      if (!s) { s = new Set(); occ.set(page, s) }
      for (let r = row; r < row + h; r++)
        for (let c = col; c < col + w; c++)
          s.add(`${r},${c}`)
    }

    function areaFree(page: number, row: number, col: number, w: number, h: number): boolean {
      const s = occ.get(page) ?? new Set()
      for (let r = row; r < row + h; r++) {
        for (let c = col; c < col + w; c++) {
          if (c >= GRID_COLS || r >= MAX_ROWS_PER_PAGE) return false
          if (s.has(`${r},${c}`)) return false
        }
      }
      return true
    }

    function findFreeSlot(startPage: number, w: number, h: number): { page: number; row: number; col: number } | null {
      for (let p = startPage; p < maxPages + 5; p++) {
        if (!occ.has(p)) occ.set(p, new Set())
        for (let r = 0; r <= MAX_ROWS_PER_PAGE - h; r++) {
          for (let c = 0; c <= GRID_COLS - w; c++) {
            if (areaFree(p, r, c, w, h)) return { page: p, row: r, col: c }
          }
        }
      }
      return null
    }

    // Place the dragged item first
    markCells(targetPage, targetRow, targetCol, dragW, dragH)

    // Place remaining items — try current position first, otherwise find next free
    const finalPositions: Array<{ item: ReflowItem; newLayout: PhoneHomeLayout }> = []

    for (const item of others) {
      const { layout } = item
      if (areaFree(layout.page, layout.row, layout.col, layout.width, layout.height)) {
        // Current position still free — keep it
        markCells(layout.page, layout.row, layout.col, layout.width, layout.height)
        finalPositions.push({ item, newLayout: layout })
      } else {
        // Displaced — find next available slot starting from the drop position's page
        // (not the item's original page, which could be earlier and cause backwards placement)
        const searchFrom = Math.max(layout.page, targetPage)
        const slot = findFreeSlot(searchFrom, layout.width, layout.height)
        if (slot) {
          markCells(slot.page, slot.row, slot.col, layout.width, layout.height)
          const newLayout: PhoneHomeLayout = {
            page: slot.page, row: slot.row, col: slot.col,
            width: layout.width, height: layout.height,
          }
          finalPositions.push({ item, newLayout })
        }
        // If no slot found (very unlikely), item stays where it was
      }
    }

    // --- Build update batch ---
    const moves: Array<{ cardId: string; content: Record<string, unknown> }> = []

    // Dragged item
    const dragContent = dragCard.content as Record<string, unknown>
    if (dragSocialIcon) {
      const existingLayouts = (dragContent.socialIconLayouts ?? {}) as Record<string, { page: number; row: number; col: number }>
      moves.push({
        cardId: dragCard.id,
        content: {
          ...dragContent,
          socialIconLayouts: {
            ...existingLayouts,
            [dragSocialIcon.platform]: { page: targetPage, row: targetRow, col: targetCol },
          },
        },
      })
    } else {
      const existingLayout = (dragContent.phoneHomeLayout ?? {}) as Partial<PhoneHomeLayout>
      moves.push({
        cardId: dragCard.id,
        content: {
          ...dragContent,
          phoneHomeLayout: { ...existingLayout, page: targetPage, row: targetRow, col: targetCol, width: dragW, height: dragH },
        },
      })
    }

    // Displaced items that moved
    for (const { item, newLayout } of finalPositions) {
      const orig = item.layout
      if (orig.page === newLayout.page && orig.row === newLayout.row && orig.col === newLayout.col) continue
      // Position changed — need to persist
      const itemContent = item.card.content as Record<string, unknown>
      if (item.socialIcon) {
        // Check if this card's socialIconLayouts update is already in the batch
        const existing = moves.find((m) => m.cardId === item.card.id)
        if (existing) {
          // Merge into existing batch entry
          const layouts = (existing.content.socialIconLayouts ?? {}) as Record<string, { page: number; row: number; col: number }>
          layouts[item.socialIcon.platform] = { page: newLayout.page, row: newLayout.row, col: newLayout.col }
          existing.content = { ...existing.content, socialIconLayouts: layouts }
        } else {
          const existingLayouts = (itemContent.socialIconLayouts ?? {}) as Record<string, { page: number; row: number; col: number }>
          moves.push({
            cardId: item.card.id,
            content: {
              ...itemContent,
              socialIconLayouts: {
                ...existingLayouts,
                [item.socialIcon.platform]: { page: newLayout.page, row: newLayout.row, col: newLayout.col },
              },
            },
          })
        }
      } else {
        const existingLayout = (itemContent.phoneHomeLayout ?? {}) as Partial<PhoneHomeLayout>
        moves.push({
          cardId: item.card.id,
          content: {
            ...itemContent,
            phoneHomeLayout: { ...existingLayout, page: newLayout.page, row: newLayout.row, col: newLayout.col, width: newLayout.width, height: newLayout.height },
          },
        })
      }
    }

    onMoveCards(moves)
  }, [pages, onMoveCards])

  const handleDndDragCancel = useCallback(() => {
    if (edgeTimerRef.current) {
      clearTimeout(edgeTimerRef.current)
      edgeTimerRef.current = null
    }
    pointerMoveCleanupRef.current?.()
    pointerMoveCleanupRef.current = null
    setActiveDragId(null)
    setActiveDragData(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Scroll-snap page navigation (native browser physics)
  // ---------------------------------------------------------------------------

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
    const el = gridContainerRef.current
    if (!el) return
    el.scrollTo({ left: page * el.offsetWidth, behavior: 'smooth' })
  }, [])

  // Update currentPage only after scroll settles to avoid re-renders mid-swipe
  // (matches public page behaviour in static-phone-home-layout.tsx)
  useEffect(() => {
    const el = gridContainerRef.current
    if (!el) return

    let timer: ReturnType<typeof setTimeout> | null = null

    const updatePage = () => {
      if (activeDragId) return
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
  }, [activeDragId])


  // ---------------------------------------------------------------------------
  // Grid item renderer (shared between DnD and non-DnD modes)
  // ---------------------------------------------------------------------------

  const renderGridItem = useCallback((
    card: Card,
    layout: PhoneHomeLayout,
    socialIcon: SocialIcon | undefined,
    pageIdx: number,
  ) => {
    const gridStyle: React.CSSProperties = {
      gridColumn: `${layout.col + 1} / span ${layout.width}`,
      gridRow: `${layout.row + 1} / span ${layout.height}`,
    }

    // Social icon
    if (socialIcon) {
      const dragId = `${card.id}:${socialIcon.platform}`
      const content = (
        <div className="flex items-center justify-center w-full h-full">
          <SocialAppIcon
            socialIcon={socialIcon}
            parentCard={card}
            onTap={handleIconTap}
            isSelected={selectedCardId === card.id}
            is8Bit={is8Bit}
            isWin95={isWin95}
          />
        </div>
      )

      if (isPreview) {
        return (
          <DraggableGridItem
            key={dragId}
            id={dragId}
            data={{ card, layout, socialIcon }}
            style={gridStyle}
            className="flex items-center justify-center"
          >
            {content}
          </DraggableGridItem>
        )
      }
      return <div key={dragId} className="flex items-center justify-center" style={gridStyle}>{content}</div>
    }

    // Gallery widgets
    if (card.card_type === 'gallery') {
      const isFullWidth = layout.width === 4
      const galleryStyle: React.CSSProperties = {
        gridColumn: isFullWidth ? '1 / -1' : `${layout.col + 1} / span ${layout.width}`,
        gridRow: `${layout.row + 1} / span ${layout.height}`,
      }
      const inner = (
        <div
          className={cn(isFullWidth && 'w-full', selectedCardId === card.id && `ring-2 ring-blue-500 ${isWin95 ? 'rounded-[2px]' : is8Bit ? 'rounded-[8px]' : 'rounded-[16px]'}`)}
          style={{ aspectRatio: isFullWidth ? `${layout.width} / ${layout.height}` : '1 / 1', cursor: 'pointer', width: '100%', height: '100%' }}
          onClick={() => handleIconTap(card.id)}
        >
          <PhotoWidget card={card} is8Bit={is8Bit} isWin95={isWin95} />
        </div>
      )
      if (isPreview) {
        return (
          <DraggableGridItem key={card.id} id={card.id} data={{ card, layout }} style={galleryStyle}>
            {inner}
          </DraggableGridItem>
        )
      }
      return <div key={card.id} style={galleryStyle}>{inner}</div>
    }

    // Music widgets
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
      const musicGridStyle: React.CSSProperties = {
        ...gridStyle,
        gridRow: `${layout.row + 1} / span ${rowSpan}`,
      }
      const inner = (
        <div
          className={cn('w-full', selectedCardId === card.id && 'ring-2 ring-blue-500 rounded-[16px]')}
          style={{ cursor: 'pointer' }}
        >
          <MusicWidget card={card} layout={layout} onClick={handleIconTap} />
        </div>
      )
      if (isPreview) {
        return (
          <DraggableGridItem key={card.id} id={card.id} data={{ card, layout }} style={musicGridStyle}>
            {inner}
          </DraggableGridItem>
        )
      }
      return <div key={card.id} style={musicGridStyle}>{inner}</div>
    }

    // Audio cards — render AudioPlayer directly (same as public static-phone-home-layout)
    if (card.card_type === 'audio' && isAudioContent(card.content)) {
      const ac = card.content as unknown as AudioCardContent
      const isTransparent = ac.transparentBackground ?? false
      const isCdPlayer = ac.playerStyle === 'cd-player'
      const fullWidthStyle: React.CSSProperties = {
        gridColumn: '1 / -1',
        gridRow: `${layout.row + 1} / span ${layout.height}`,
        // Let content determine actual height instead of being constrained by 76px row tracks
        height: 'fit-content',
      }

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

      const inner = (
        <div
          className={cn('w-full', selectedCardId === card.id && 'ring-2 ring-blue-500 rounded-[8px]')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleIconTap(card.id)}
        >
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
        </div>
      )
      if (isPreview) {
        return (
          <DraggableGridItem key={card.id} id={card.id} data={{ card, layout }} style={fullWidthStyle}>
            {inner}
          </DraggableGridItem>
        )
      }
      return <div key={card.id} style={fullWidthStyle}>{inner}</div>
    }

    // Default 1x1 icon
    const inner = (
      <div className="flex items-center justify-center w-full h-full">
        <AppIcon card={card} onTap={handleIconTap} isSelected={selectedCardId === card.id} is8Bit={is8Bit} isWin95={isWin95} isEditable={isEditable} onInlineCommit={handleInlineCommit} onInlineEditStart={handleInlineEditStart} onInlineEditEnd={handleInlineEditEnd} />
      </div>
    )
    if (isPreview) {
      return (
        <DraggableGridItem
          key={card.id}
          id={card.id}
          data={{ card, layout }}
          style={gridStyle}
          className="flex items-center justify-center"
        >
          {inner}
        </DraggableGridItem>
      )
    }
    return <div key={card.id} className="flex items-center justify-center" style={gridStyle}>{inner}</div>
  }, [handleIconTap, selectedCardId, is8Bit, isWin95, isPreview])

  // ---------------------------------------------------------------------------
  // DragOverlay content
  // ---------------------------------------------------------------------------

  const dragOverlayContent = useMemo(() => {
    if (!activeDragData) return null
    const { card, layout, socialIcon } = activeDragData

    if (socialIcon) {
      return (
        <div className="pointer-events-none" style={{ transform: 'scale(0.9)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
          <SocialAppIcon socialIcon={socialIcon} parentCard={card} onTap={() => {}} is8Bit={is8Bit} isWin95={isWin95} />
        </div>
      )
    }

    // For widgets, render a simplified rectangle
    if (layout.width > 1 || layout.height > 1) {
      const fallback = FALLBACK_ICONS[card.card_type] ?? FALLBACK_ICONS.link
      return (
        <div
          className="rounded-[14px] flex items-center justify-center pointer-events-none"
          style={{
            width: layout.width * 70,
            height: layout.height * 76,
            background: fallback.bg,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
            opacity: 0.85,
          }}
        >
          <span className="text-2xl">{fallback.emoji}</span>
        </div>
      )
    }

    return (
      <div className="pointer-events-none" style={{ transform: 'scale(0.9)', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
        <AppIcon card={card} onTap={() => {}} is8Bit={is8Bit} isWin95={isWin95} />
      </div>
    )
  }, [activeDragData, is8Bit, isWin95])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const gridArea = (
    <div
      className="flex-1 min-h-0 flex overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
      ref={gridContainerRef}
      style={{
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        overscrollBehaviorX: 'contain',
      } as React.CSSProperties}
    >
      {pages.map((pageItems, pageIdx) => (
        <div key={pageIdx} className="w-full h-full min-w-full max-w-full shrink-0 px-5 pt-3 pb-4 overflow-hidden flex flex-col md:justify-center md:items-center" style={{ scrollSnapAlign: 'start' } as React.CSSProperties}>
            <div className="relative h-full w-full">
              <div className="grid gap-y-5 gap-x-3 w-full h-full max-w-[430px] mx-auto" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: `repeat(${MAX_ROWS_PER_PAGE}, minmax(0, 76px))` }}>
                {pageItems.map(({ card, layout, socialIcon }) =>
                  renderGridItem(card, layout, socialIcon, pageIdx),
                )}
              </div>

              {/* Droppable targets overlay — matches the items grid exactly */}
              {isPreview && activeDragId && pageIdx === currentPage && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  <div
                    className="grid gap-y-5 gap-x-3 w-full h-full max-w-[430px] mx-auto pointer-events-auto"
                    style={{
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gridTemplateRows: `repeat(${MAX_ROWS_PER_PAGE}, minmax(0, 76px))`,
                    }}
                  >
                    {(() => {
                      const cells: React.ReactNode[] = []
                      for (let r = 0; r < MAX_ROWS_PER_PAGE; r++) {
                        for (let c = 0; c < GRID_COLS; c++) {
                          cells.push(
                            <DroppableCell
                              key={`drop-${pageIdx}-${r}-${c}`}
                              id={`drop-${pageIdx}-${r}-${c}`}
                              data={{ page: pageIdx, row: r, col: c }}
                            />,
                          )
                        }
                      }
                      return cells
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Extra blank page for DnD drops */}
        {isPreview && activeDragId && (
          <div key="dnd-new-page" className="min-w-full shrink-0 px-5 pt-3 pb-20" style={{ scrollSnapAlign: 'start' }}>
            <div className="relative">
              <div className="grid gap-y-5 gap-x-3 w-full h-full max-w-[430px] mx-auto" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: `repeat(${MAX_ROWS_PER_PAGE}, minmax(0, 76px))` }}>
              </div>
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                <div className="grid gap-y-5 gap-x-3 w-full h-full max-w-[430px] mx-auto pointer-events-auto" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: `repeat(${MAX_ROWS_PER_PAGE}, minmax(0, 76px))` }}>
                  {Array.from({ length: MAX_ROWS_PER_PAGE * GRID_COLS }).map((_, i) => {
                    const r = Math.floor(i / GRID_COLS)
                    const c = i % GRID_COLS
                    return (
                      <DroppableCell key={`drop-new-${r}-${c}`} id={`drop-${pages.length}-${r}-${c}`} data={{ page: pages.length, row: r, col: c }} />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edge indicators during drag — show the user they can drag to edges */}
      {isPreview && activeDragId && (
        <>
          {currentPage > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-8 z-20 flex items-center justify-center pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.15), transparent)' }}>
              <span className="text-white/40 text-sm font-bold">&lsaquo;</span>
            </div>
          )}
          <div className="absolute right-0 top-0 bottom-0 w-8 z-20 flex items-center justify-center pointer-events-none"
            style={{ background: 'linear-gradient(to left, rgba(59,130,246,0.15), transparent)' }}>
            <span className="text-white/40 text-sm font-bold">&rsaquo;</span>
          </div>
        </>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden text-theme-text select-none" style={{ WebkitTouchCallout: 'none' } as React.CSSProperties}>
      {/* Status bar */}
      <StatusBar />

      {/* Grid area — wrapped in DndContext when in editor preview */}
      {isPreview ? (
        <DndContext
          sensors={sensors}
          measuring={measuringConfig}
          autoScroll={false}
          onDragStart={handleDndDragStart}
          onDragEnd={handleDndDragEnd}
          onDragCancel={handleDndDragCancel}
        >
          {gridArea}
          <DragOverlay dropAnimation={null}>
            {dragOverlayContent}
          </DragOverlay>
        </DndContext>
      ) : (
        gridArea
      )}

      {/* Pagination dots */}
      {pageCount > 1 && <PaginationDots count={pageCount} active={currentPage} onPageChange={goToPage} />}

      {/* Dock */}
      {phoneHomeShowDock && (
        <Dock dockCards={dockCards} selectedCardId={selectedCardId} onCardClick={handleIconTap} is8Bit={is8Bit} isWin95={isWin95} translucent={phoneHomeDockTranslucent} />
      )}

    </div>
  )
}
