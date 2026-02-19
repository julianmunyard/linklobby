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


/**
 * Get character style based on nth-child cycling from the original design.
 * Faithfully reproduces the CSS nth-child rules from the user's HTML/CSS.
 */
function getCharStyle(index: number): React.CSSProperties {
  const n = index + 1 // 1-based for nth-child matching

  // Apply in reverse priority order (later rules override)
  // Base style for all characters
  let style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 6px',
    margin: '0 2px',
    lineHeight: 1.1,
    textTransform: 'uppercase' as const,
    color: 'var(--theme-text)',
  }

  // nth-child(2n) - even characters: dark bg, light text, fat font
  if (n % 2 === 0) {
    style = {
      ...style,
      fontFamily: 'var(--font-abril-fatface)',
      fontSize: '2.5rem',
      background: 'var(--theme-text)',
      color: 'var(--theme-background)',
      transform: 'rotate(3deg)',
    }
  }

  // nth-child(2n+1) - odd characters: marker font, no bg, ink color
  if (n % 2 === 1) {
    style = {
      ...style,
      fontFamily: 'var(--font-permanent-marker)',
      fontSize: '3rem',
      color: 'var(--theme-text)',
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

/**
 * Get card background clip-path and rotation matching the original design's
 * .link-bg nth-child styles exactly.
 */
function getCardClipStyle(index: number): React.CSSProperties {
  const variant = index % 4
  switch (variant) {
    case 0: return {
      clipPath: 'polygon(2% 4%, 98% 0%, 100% 95%, 95% 100%, 2% 98%, 0% 10%)',
      transform: 'rotate(-2deg)',
    }
    case 1: return {
      clipPath: 'polygon(0% 0%, 96% 2%, 100% 90%, 98% 100%, 4% 96%, 0% 100%)',
      transform: 'rotate(1.5deg)',
    }
    case 2: return {
      clipPath: 'polygon(4% 0%, 100% 4%, 96% 96%, 0% 100%, 2% 50%)',
      transform: 'rotate(-1deg)',
    }
    case 3: return {
      clipPath: 'polygon(1% 1%, 99% 0%, 95% 95%, 5% 98%)',
      transform: 'rotate(2deg)',
      borderWidth: '4px',
      borderStyle: 'dashed',
    }
    default: return {}
  }
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
        style={{
          fontFamily: 'var(--font-rock-salt)',
          fontSize: '4rem',
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          opacity: 0.1,
          transform: 'rotate(-30deg)',
          pointerEvents: 'none',
          zIndex: 0,
          color: 'var(--theme-text)',
        }}
      >
        &amp;
      </div>
      <div
        style={{
          fontFamily: 'var(--font-bangers)',
          fontSize: '5rem',
          position: 'absolute',
          top: '100px',
          left: '-10px',
          opacity: 0.1,
          transform: 'rotate(10deg)',
          pointerEvents: 'none',
          zIndex: 0,
          color: 'var(--theme-text)',
        }}
      >
        ?!
      </div>

      {/* Main content - chaos-wrapper from original design */}
      <div className="relative z-10 flex flex-col items-center" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh' }}>

        {/* Profile Section */}
        <div className="w-full text-center" style={{ marginBottom: '2rem' }}>
          {/* Ransom-note title */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px', marginBottom: '2rem', transform: 'rotate(-2deg)' }}>
            {titleText.split('').map((char, index) => {
              if (char === ' ') {
                return <span key={index} style={{ width: '15px' }} />
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
            <div className="relative" style={{ width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
              {/* Tape overlay */}
              <div
                className="zine-tape"
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(-2deg)',
                  width: '60px',
                  height: '25px',
                  zIndex: 10,
                }}
              />
              <img
                src={avatarUrl}
                alt={titleText}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  clipPath: 'polygon(5% 5%, 95% 0%, 100% 90%, 85% 100%, 5% 95%, 0% 50%)',
                  filter: 'grayscale(100%) contrast(120%)',
                  border: '2px solid var(--theme-text)',
                  background: 'var(--theme-text)',
                }}
              />
            </div>
          )}

          {/* Bio text */}
          {bio && (
            <div
              className="zine-bio"
              style={{
                fontFamily: 'var(--font-special-elite)',
                fontSize: `${bodySize || 1}rem`,
                textAlign: 'center',
                marginTop: '1rem',
                maxWidth: '300px',
                lineHeight: 1.4,
                padding: '0.5rem',
                display: 'inline-block',
              }}
            >
              {bio}
            </div>
          )}
        </div>

        {/* SVG Scribble decorations - positioned relative to content */}
        <svg
          style={{ position: 'absolute', top: '180px', right: '10px', width: '60px', transform: 'rotate(20deg)', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 100 100"
        >
          <path d="M10,10 Q50,50 90,90 M90,90 L70,50 M90,90 L50,80" fill="none" stroke="var(--theme-text)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        </svg>
        <svg
          style={{ position: 'absolute', bottom: '50px', left: '-20px', width: '100px', opacity: 0.25, transform: 'rotate(-10deg)', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 100 100"
        >
          <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="var(--theme-text)" strokeWidth="2" />
          <path d="M15,60 Q35,20 55,60 T95,60" fill="none" stroke="var(--theme-text)" strokeWidth="2" />
        </svg>

        {/* Cards Section - link-stack from original */}
        <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {visibleCards.map((card, index) => {
            const isDark = index % 2 === 0
            const isSelected = selectedCardId === card.id
            const displayText = card.title || card.card_type

            // Text cards render as section markers
            if (card.card_type === 'text') {
              return (
                <div
                  key={card.id}
                  className={cn('relative cursor-pointer', isSelected && 'outline outline-2 outline-offset-2')}
                  style={{
                    fontFamily: 'var(--font-special-elite)',
                    fontSize: `${bodySize || 1}rem`,
                    padding: '1rem 2rem',
                    textAlign: 'center',
                    outlineColor: 'var(--theme-accent)',
                  }}
                  onClick={() => onCardClick?.(card.id)}
                >
                  <div
                    className={cn(isDark ? 'zine-card-dark' : 'zine-card-light')}
                    style={{ position: 'absolute', inset: 0, zIndex: -1, ...getCardClipStyle(index) }}
                  />
                  <span style={{ position: 'relative', zIndex: 1, color: isDark ? 'var(--theme-background)' : 'var(--theme-text)' }}>
                    {displayText}
                  </span>
                </div>
              )
            }

            // Audio cards render the full player inline
            if (card.card_type === 'audio' && isAudioContent(card.content)) {
              const audioContent = card.content as AudioCardContent
              return (
                <div
                  key={card.id}
                  className="relative"
                  style={{ padding: '0.75rem' }}
                  onClick={() => onCardClick?.(card.id)}
                >
                  <div
                    className={cn(isDark ? 'zine-card-dark' : 'zine-card-light')}
                    style={{ position: 'absolute', inset: 0, zIndex: -1, ...getCardClipStyle(index) }}
                  />
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
                  'relative cursor-pointer transition-all',
                  isSelected && 'outline outline-2 outline-offset-2'
                )}
                style={{
                  fontFamily: 'var(--font-permanent-marker)',
                  fontSize: '1.5rem',
                  padding: '1rem 2rem',
                  textAlign: 'center',
                  outlineColor: 'var(--theme-accent)',
                }}
                onClick={() => handleCardClick(card)}
              >
                {/* Background shape layer - matches original .link-bg pattern */}
                <div
                  className={cn(isDark ? 'zine-card-dark' : 'zine-card-light')}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    ...getCardClipStyle(index),
                  }}
                />
                {/* Text color must match the background */}
                <span style={{ position: 'relative', zIndex: 1, color: isDark ? 'var(--theme-background)' : 'var(--theme-text)' }}>
                  {displayText}
                </span>
                {/* NEW! badge on first card */}
                {index === 0 && (
                  <span
                    className="zine-badge"
                    style={{ position: 'absolute', top: '-10px', right: '-10px', padding: '0.2rem 0.5rem', fontSize: '1rem', zIndex: 10 }}
                  >
                    NEW!
                  </span>
                )}
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

        {/* Social Icons - matches original .socials footer */}
        {showSocialIcons && socialIcons.length > 0 && (
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', zIndex: 2 }}>
            {socialIcons.map((icon) => {
              const IconComponent = PLATFORM_ICONS[icon.platform]
              if (!IconComponent) return null
              return (
                <a
                  key={icon.id}
                  href={icon.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zine-social-icon"
                  style={{
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--theme-text)',
                    background: '#fff',
                    color: 'var(--theme-text)',
                    textDecoration: 'none',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconComponent className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
