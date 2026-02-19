'use client'

import { useState } from 'react'
import type { Card, ReleaseCardContent } from '@/types/card'
import { isReleaseContent, isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import type { SocialPlatform } from '@/types/profile'
import { AudioPlayer } from '@/components/audio/audio-player'
import { cn } from '@/lib/utils'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import { useProfileStore } from '@/stores/profile-store'
import { Globe, Mail, Music } from 'lucide-react'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import type { ComponentType } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'

type IconComponent = ComponentType<{ className?: string }>

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

// 6 zine fonts for ransom-note cycling
const ZINE_FONTS = [
  'var(--font-permanent-marker)',  // marker
  'var(--font-special-elite)',     // typewriter
  'var(--font-abril-fatface)',     // fat display
  'var(--font-bangers)',           // loud
  'var(--font-rock-salt)',         // scratchy
  'var(--font-courier-prime)',     // mono
]

// Card clip-path classes (cycle through 4)
const CLIP_CLASSES = ['zine-clip-1', 'zine-clip-2', 'zine-clip-3', 'zine-clip-4']

/**
 * Get character style based on nth-child cycling from the original design.
 * Faithfully reproduces the CSS nth-child rules from the user's HTML/CSS.
 */
function getCharStyle(index: number): React.CSSProperties {
  const n = index + 1 // 1-based for nth-child matching

  // Apply in reverse priority order (later rules override)
  let style: React.CSSProperties = {
    fontFamily: 'var(--font-permanent-marker)',
    fontSize: '3rem',
    transform: 'rotate(-2deg) translateY(5px)',
    display: 'inline-block',
    padding: '2px 6px',
    margin: '0 2px',
    lineHeight: 1.1,
  }

  // nth-child(2n) - even characters
  if (n % 2 === 0) {
    style = {
      ...style,
      fontFamily: 'var(--font-abril-fatface)',
      background: 'var(--theme-text)',
      color: 'var(--theme-background)',
      transform: 'rotate(3deg)',
    }
  }

  // nth-child(2n+1) - odd characters (already default)
  if (n % 2 === 1) {
    style = {
      ...style,
      fontFamily: 'var(--font-permanent-marker)',
      fontSize: '3rem',
      transform: 'rotate(-2deg) translateY(5px)',
    }
  }

  // nth-child(3n) - every 3rd (overrides above)
  if (n % 3 === 0) {
    style = {
      ...style,
      fontFamily: 'var(--font-bangers)',
      fontSize: '3.5rem',
      border: '3px solid var(--theme-text)',
      background: 'transparent',
      color: 'var(--theme-text)',
      transform: 'rotate(5deg)',
    }
  }

  // nth-child(4n) - every 4th (overrides above)
  if (n % 4 === 0) {
    style = {
      ...style,
      fontFamily: 'var(--font-special-elite)',
      background: 'var(--theme-text)',
      color: 'var(--theme-background)',
      clipPath: 'polygon(0 0, 100% 5%, 95% 100%, 5% 95%)',
      transform: 'rotate(-5deg)',
      border: 'none',
    }
  }

  // nth-child(5n) - every 5th (overrides above)
  if (n % 5 === 0) {
    style = {
      ...style,
      fontFamily: 'var(--font-rock-salt)',
      borderBottom: '4px solid var(--theme-text)',
      background: 'transparent',
      color: 'var(--theme-text)',
      fontSize: '2rem',
      transform: 'rotate(0deg)',
      clipPath: undefined,
      border: 'none',
    }
  }

  return style
}

interface ChaoticZineLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

/**
 * Chaotic Zine Layout - Ransom-note/cut-and-paste zine aesthetic
 *
 * Features:
 * - Ransom-note title with per-character font/bg/rotation cycling
 * - Grayscale profile photo with tape overlay and irregular clip-path
 * - Torn-paper clip-path cards alternating dark/light
 * - SVG scribble decorations
 * - Large faded typography decorations
 * - Organic blob border-radius social icons with spin hover
 * - "NEW!" badge on first card
 */
export function ChaoticZineLayout({
  title,
  cards,
  isPreview = false,
  onCardClick,
  selectedCardId,
}: ChaoticZineLayoutProps) {
  const [completedReleases, setCompletedReleases] = useState<Set<string>>(new Set())
  const headingSize = useThemeStore((s) => s.fonts.headingSize)
  const bodySize = useThemeStore((s) => s.fonts.bodySize)

  // Profile data
  const displayName = useProfileStore((s) => s.displayName)
  const bio = useProfileStore((s) => s.bio)
  const avatarUrl = useProfileStore((s) => s.avatarUrl)
  const showAvatar = useProfileStore((s) => s.showAvatar)
  const socialIcons = useProfileStore((s) => s.socialIcons)
  const showSocialIcons = useProfileStore((s) => s.showSocialIcons)

  const titleText = displayName || title || 'ZINE'

  // Filter release cards separately
  const releaseCards = cards.filter(c => {
    if (c.is_visible === false || c.card_type !== 'release' || !isReleaseContent(c.content)) return false
    const content = c.content as ReleaseCardContent
    if (completedReleases.has(c.id)) return false
    if (content.releaseDate && content.afterCountdownAction === 'hide') {
      const isReleased = new Date(content.releaseDate) <= new Date()
      if (isReleased) return false
    }
    return true
  })

  // Filter to only visible cards, exclude social-icons and release cards
  const visibleCards = sortCardsBySortKey(
    cards.filter(c =>
      c.is_visible !== false &&
      c.card_type !== 'social-icons' &&
      c.card_type !== 'release'
    )
  )

  const handleCardClick = (card: Card) => {
    if (card.url && !isPreview) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    } else if (onCardClick) {
      onCardClick(card.id)
    }
  }

  // Countdown renderer for release cards
  const zineCountdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed) return null
    return (
      <div className="text-sm tabular-nums tracking-wider" style={{ fontFamily: 'var(--font-courier-prime)' }}>
        {days > 0 ? `${days}D ` : ''}{String(hours).padStart(2, '0')}H {String(minutes).padStart(2, '0')}M {String(seconds).padStart(2, '0')}S
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full z-10 overflow-x-hidden overflow-y-auto" style={{ background: 'var(--theme-background)' }}>
      {/* Large faded typography decorations */}
      <div
        className="zine-decoration"
        style={{
          fontFamily: 'var(--font-rock-salt)',
          fontSize: '4rem',
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          opacity: 0.1,
          transform: 'rotate(-30deg)',
        }}
      >
        &amp;
      </div>
      <div
        className="zine-decoration"
        style={{
          fontFamily: 'var(--font-bangers)',
          fontSize: '5rem',
          position: 'absolute',
          top: '100px',
          left: '-10px',
          opacity: 0.1,
          transform: 'rotate(10deg)',
        }}
      >
        ?!
      </div>
      <div
        className="zine-decoration"
        style={{
          fontFamily: 'var(--font-courier-prime)',
          fontSize: '2rem',
          position: 'absolute',
          top: '50%',
          right: '5px',
          opacity: 0.04,
          transform: 'rotate(90deg)',
          letterSpacing: '0.3em',
        }}
      >
        CUT HERE
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-8">

        {/* Profile Section */}
        <div className="text-center mb-8">
          {/* Ransom-note title */}
          <div className="flex flex-wrap justify-center items-baseline gap-1 mb-6">
            {titleText.split('').map((char, index) => {
              if (char === ' ') {
                return <span key={index} className="w-3" />
              }
              return (
                <span
                  key={index}
                  style={getCharStyle(index)}
                >
                  {char}
                </span>
              )
            })}
          </div>

          {/* Profile photo with grayscale + tape */}
          {showAvatar && avatarUrl && (
            <div className="relative inline-block mb-6">
              <img
                src={avatarUrl}
                alt={titleText}
                className="w-[120px] h-[120px] object-cover"
                style={{
                  clipPath: 'polygon(5% 5%, 95% 0%, 100% 90%, 85% 100%, 5% 95%, 0% 50%)',
                  filter: 'grayscale(100%) contrast(120%)',
                }}
              />
              {/* Tape overlay */}
              <div
                className="zine-tape absolute"
                style={{
                  top: '-8px',
                  left: '10%',
                  right: '10%',
                  height: '24px',
                }}
              />
            </div>
          )}

          {/* Bio text */}
          {bio && (
            <div className="zine-bio inline-block px-4 py-2 mx-auto max-w-sm" style={{ fontFamily: 'var(--font-special-elite)', fontSize: `${bodySize || 1}rem` }}>
              {bio}
            </div>
          )}
        </div>

        {/* SVG Scribble decorations */}
        <div className="relative">
          <svg className="zine-scribble absolute -top-4 -left-8 w-16 h-16" viewBox="0 0 100 100">
            <path d="M10,10 Q50,50 90,90 M90,90 L70,50 M90,90 L50,80" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--theme-text)' }} />
          </svg>
          <svg className="zine-scribble absolute -top-2 -right-6 w-12 h-12" viewBox="0 0 100 100">
            <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--theme-text)' }} />
            <path d="M15,60 Q35,20 55,60 T95,60" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--theme-text)' }} />
          </svg>
        </div>

        {/* Cards Section */}
        <div className="space-y-4 relative">
          {visibleCards.map((card, index) => {
            const clipClass = CLIP_CLASSES[index % 4]
            const isDark = index % 2 === 0
            const isSelected = selectedCardId === card.id
            const displayText = card.title || card.card_type

            // Text cards render as section markers
            if (card.card_type === 'text') {
              return (
                <div
                  key={card.id}
                  className={cn(
                    'text-center py-3 px-4 cursor-pointer',
                    clipClass,
                    isDark ? 'zine-card-dark' : 'zine-card-light',
                    isSelected && 'outline outline-2 outline-offset-2'
                  )}
                  style={{
                    fontFamily: 'var(--font-special-elite)',
                    fontSize: `${bodySize || 1}rem`,
                    outlineColor: 'var(--theme-accent)',
                  }}
                  onClick={() => onCardClick?.(card.id)}
                >
                  {displayText}
                </div>
              )
            }

            // Audio cards render the full player inline
            if (card.card_type === 'audio' && isAudioContent(card.content)) {
              const audioContent = card.content as AudioCardContent
              return (
                <div
                  key={card.id}
                  className={cn(clipClass, isDark ? 'zine-card-dark' : 'zine-card-light', 'p-3')}
                  onClick={() => onCardClick?.(card.id)}
                >
                  <AudioPlayer
                    tracks={audioContent.tracks || []}
                    albumArtUrl={audioContent.albumArtUrl}
                    showWaveform={audioContent.showWaveform ?? true}
                    looping={audioContent.looping ?? false}
                    reverbConfig={audioContent.reverbConfig}
                    playerColors={audioContent.playerColors}
                    cardId={card.id}
                    pageId={card.page_id}
                    isEditing={isPreview}
                    themeVariant="classified"
                  />
                </div>
              )
            }

            return (
              <div
                key={card.id}
                className={cn(
                  'relative p-4 cursor-pointer transition-all',
                  clipClass,
                  isDark ? 'zine-card-dark' : 'zine-card-light',
                  isSelected && 'outline outline-2 outline-offset-2'
                )}
                style={{
                  fontFamily: 'var(--font-permanent-marker)',
                  fontSize: `${(bodySize || 1) * 1.1}rem`,
                  outlineColor: 'var(--theme-accent)',
                }}
                onClick={() => handleCardClick(card)}
              >
                {/* NEW! badge on first card */}
                {index === 0 && (
                  <span
                    className="zine-badge absolute -top-2 -right-2 px-2 py-1 text-xs z-10"
                  >
                    NEW!
                  </span>
                )}
                <span>{displayText}</span>
              </div>
            )
          })}
        </div>

        {/* Release cards */}
        {releaseCards.map((card) => {
          if (!isReleaseContent(card.content)) return null
          const content = card.content as ReleaseCardContent
          const {
            releaseTitle,
            artistName,
            releaseDate,
            preSaveUrl,
            preSaveButtonText = 'PRE-SAVE',
            afterCountdownAction = 'custom',
            afterCountdownText = 'OUT NOW',
            afterCountdownUrl,
          } = content
          const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false

          return (
            <div key={card.id} className="zine-card-dark zine-clip-2 p-4 my-4 text-center" style={{ fontFamily: 'var(--font-special-elite)' }}>
              {isReleased && afterCountdownAction === 'custom' ? (
                <div className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--theme-accent)' }}>
                  NEW RELEASE
                </div>
              ) : (
                <div className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--theme-accent)' }}>
                  UPCOMING
                </div>
              )}
              {!isReleased && releaseTitle && <div className="text-xs uppercase">{releaseTitle}</div>}
              {!isReleased && artistName && <div className="text-xs uppercase">{artistName}</div>}
              {!isReleased && releaseDate && (
                <div className="my-2">
                  <Countdown
                    date={new Date(releaseDate)}
                    renderer={zineCountdownRenderer}
                    onComplete={() => {
                      if (afterCountdownAction === 'hide') {
                        setCompletedReleases(prev => new Set(prev).add(card.id))
                      }
                    }}
                  />
                </div>
              )}
              {!isReleased && preSaveUrl && (
                <button
                  className="text-sm mt-2 underline uppercase tracking-wide"
                  onClick={() => {
                    if (!isPreview) window.open(preSaveUrl, '_blank', 'noopener,noreferrer')
                  }}
                >
                  [{preSaveButtonText.toUpperCase()}]
                </button>
              )}
              {isReleased && afterCountdownAction === 'custom' && (
                afterCountdownUrl ? (
                  <button
                    className="text-sm mt-2 underline uppercase tracking-wide"
                    onClick={() => {
                      if (!isPreview) window.open(afterCountdownUrl, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    [{(afterCountdownText || 'LISTEN NOW').toUpperCase()}]
                  </button>
                ) : (
                  <div className="text-sm mt-2 uppercase tracking-wide">[{(afterCountdownText || 'OUT NOW').toUpperCase()}]</div>
                )
              )}
            </div>
          )
        })}

        {/* Social Icons */}
        {showSocialIcons && socialIcons.length > 0 && (
          <div className="flex justify-center flex-wrap gap-3 mt-8 mb-4">
            {socialIcons.map((icon) => {
              const IconComponent = PLATFORM_ICONS[icon.platform]
              if (!IconComponent) return null
              return (
                <a
                  key={icon.id}
                  href={icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zine-social-icon inline-flex items-center justify-center w-10 h-10"
                  style={{
                    border: '3px solid var(--theme-text)',
                    background: 'var(--theme-background)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        )}

        {/* Bottom scribble decoration */}
        <div className="flex justify-center mt-8 opacity-20">
          <svg className="w-24 h-8" viewBox="0 0 200 40">
            <path d="M5,20 Q50,5 100,20 T195,20" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--theme-text)' }} />
            <path d="M5,25 Q50,10 100,25 T195,25" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--theme-text)' }} />
          </svg>
        </div>
      </div>
    </div>
  )
}
