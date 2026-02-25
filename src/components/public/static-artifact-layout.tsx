'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Card } from '@/types/card'
import { isAudioContent } from '@/types/card'
import type { AudioCardContent } from '@/types/audio'
import type { SocialIcon, SocialPlatform } from '@/types/profile'
import { AudioPlayer } from '@/components/audio/audio-player'
import { SystemSettingsCard } from '@/components/cards/system-settings-card'
import { sortCardsBySortKey } from '@/lib/ordering'
import { ArrowUpRight } from 'lucide-react'
import { Globe, Mail, Music } from 'lucide-react'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import type { ComponentType } from 'react'

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

// Default colors matching the Brutalist palette
const DEFAULT_COLORS = {
  background: '#080808',
  cardBg: '#2F5233',
  text: '#F2E8DC',
  accent: '#FF8C55',
  border: '#FFC0CB',
  link: '#4A6FA5',
}

/** Determine if a hex color is "light" (needs dark text) */
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length < 6) return false
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 140
}

/** Get contrasting text color for a given background */
function contrastText(bgHex: string, lightText: string, darkText: string): string {
  return isLightColor(bgHex) ? darkText : lightText
}

interface StaticArtifactLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  socialIcons?: SocialIcon[]
  showSocialIcons?: boolean
  avatarUrl?: string | null
  showAvatar?: boolean
  bio?: string | null
  themeColors?: { background: string; cardBg: string; text: string; accent: string; border: string; link: string }
  // Artifact-specific settings
  artifactMarqueeText?: string
  artifactHeaderTopLeft?: string
  artifactHeaderTopCenter?: string
  artifactHeaderTopRight?: string
  artifactHeaderBottomLeft?: string
  artifactHeaderBottomCenter?: string
  artifactHeaderBottomRight?: string
  artifactShowHeaderMeta?: boolean
  artifactHeroOverlay?: boolean
  artifactHeroMediaType?: 'image' | 'video'
  artifactHeroImageUrl?: string
  artifactHeroVideoUrl?: string
  artifactHeroPositionX?: number
  artifactHeroPositionY?: number
  hasProAccess?: boolean
}

export function StaticArtifactLayout({
  username,
  title,
  cards,
  headingSize = 1.6,
  bodySize = 0.9,
  socialIcons = [],
  showSocialIcons = true,
  avatarUrl,
  showAvatar = true,
  bio,
  themeColors,
  artifactMarqueeText,
  artifactHeaderTopLeft,
  artifactHeaderTopCenter,
  artifactHeaderTopRight,
  artifactHeaderBottomLeft,
  artifactHeaderBottomCenter,
  artifactHeaderBottomRight,
  artifactShowHeaderMeta = true,
  artifactHeroOverlay = true,
  artifactHeroMediaType = 'image',
  artifactHeroImageUrl,
  artifactHeroVideoUrl,
  artifactHeroPositionX = 50,
  artifactHeroPositionY = 50,
  hasProAccess = false,
}: StaticArtifactLayoutProps) {
  const [audioOpen, setAudioOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const displayName = title || 'ARTIFACT'
  const marqueeText = artifactMarqueeText || 'LINKS_DATABASE /// ACCESS_GRANTED >>> CONNECT_NOW /// NET_RUNNER'

  // Use passed-in colors or defaults
  const colors = themeColors || DEFAULT_COLORS

  // Cycling card block colors derived from palette
  const blockColors = [colors.cardBg, colors.text, colors.border, colors.link, colors.accent]

  // Find audio card
  const audioCard = cards.find(c => c.card_type === 'audio' && c.is_visible !== false)
  const audioContent = audioCard && isAudioContent(audioCard.content) ? (audioCard.content as unknown as AudioCardContent) : null

  // Filter visible link-type cards
  const visibleCards = sortCardsBySortKey(
    cards.filter(c =>
      c.is_visible !== false &&
      c.card_type !== 'social-icons' &&
      c.card_type !== 'audio' &&
      c.card_type !== 'release'
    )
  )

  const currentYear = new Date().getFullYear()

  // Computed contrast colors
  const headerTextColor = contrastText(colors.border, colors.text, colors.background)
  const marqueeTextColor = contrastText(colors.accent, colors.text, colors.background)
  const heroLeftText = contrastText(colors.link, colors.text, colors.background)
  const footerTextColor = contrastText(colors.text, colors.background, colors.background)

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: colors.background }}
    >
      {/* Injected keyframes */}
      <style>{`
        @keyframes artifact-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes artifact-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 999,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 1. HEADER BLOCK */}
        <div
          style={{
            background: colors.border,
            padding: '1rem 1.5rem',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {artifactShowHeaderMeta && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.7rem',
                fontWeight: 'bold',
                color: headerTextColor,
                letterSpacing: '-0.02em',
              }}
            >
              <span>{artifactHeaderTopLeft || `USER.ID_${String(username.length).padStart(2, '0')}`}</span>
              <span>{artifactHeaderTopCenter || '[ONLINE]'}</span>
              <span>{artifactHeaderTopRight || `EST. ${currentYear}`}</span>
            </div>
          )}

          <div
            style={{
              fontFamily: 'var(--font-archivo-black)',
              fontSize: displayName.length <= 6 ? '16vw' : displayName.length <= 10 ? '12vw' : displayName.length <= 16 ? '9vw' : '6vw',
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
              color: headerTextColor,
              overflow: 'hidden',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {displayName}
          </div>

          {artifactShowHeaderMeta && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                color: headerTextColor,
                letterSpacing: '-0.02em',
              }}
            >
              <span>{artifactHeaderBottomLeft || 'DIGITAL // PHY'}</span>
              <span>{artifactHeaderBottomCenter || '///'}</span>
              <span>{artifactHeaderBottomRight || 'SYS_ADMIN'}</span>
            </div>
          )}
        </div>

        {/* 2. MARQUEE BANNER */}
        <div
          style={{
            background: colors.accent,
            height: '60px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              animation: 'artifact-marquee 20s linear infinite',
            }}
          >
            {[0, 1].map(i => (
              <span
                key={i}
                style={{
                  fontFamily: 'var(--font-archivo-black)',
                  fontSize: '1.8rem',
                  textTransform: 'uppercase',
                  color: marqueeTextColor,
                  paddingRight: '2rem',
                }}
              >
                {`>>> ${marqueeText} >>> ${marqueeText} `}
              </span>
            ))}
          </div>
        </div>

        {/* 3. TWO-PANEL HERO */}
        <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '3px', height: '25vh', flexShrink: 0 }}>
          {/* Left panel - CD disc */}
          <div
            style={{
              background: colors.link,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: audioContent ? 'pointer' : 'default',
              gap: '8px',
            }}
            onClick={() => {
              if (audioContent) setAudioOpen(prev => !prev)
            }}
          >
            <img
              src="/images/artifact-cd.gif"
              alt="CD"
              style={{
                width: 'min(120px, 50%)',
                aspectRatio: '1',
                borderRadius: '50%',
                objectFit: 'cover',
                animation: audioOpen ? 'artifact-spin 3s linear infinite' : 'none',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.6rem',
                fontWeight: 'bold',
                color: heroLeftText,
                letterSpacing: '0.1em',
              }}
            >
              {audioOpen ? 'NOW PLAYING' : audioContent ? 'PLAY' : 'NO TRACK'}
            </span>
          </div>

          {/* Right panel - Profile photo / video */}
          <div
            style={{
              background: colors.cardBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {artifactHeroMediaType === 'video' && artifactHeroVideoUrl ? (
              <video
                src={artifactHeroVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${artifactHeroPositionX}% ${artifactHeroPositionY}%`,
                  filter: artifactHeroOverlay ? 'grayscale(100%) contrast(1.25)' : 'none',
                  mixBlendMode: artifactHeroOverlay ? 'multiply' : 'normal',
                }}
              />
            ) : (artifactHeroImageUrl || (showAvatar && avatarUrl)) ? (
              <img
                src={artifactHeroImageUrl || avatarUrl || ''}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${artifactHeroPositionX}% ${artifactHeroPositionY}%`,
                  filter: artifactHeroOverlay ? 'grayscale(100%) contrast(1.25)' : 'none',
                  mixBlendMode: artifactHeroOverlay ? 'multiply' : 'normal',
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-archivo-black)',
                  fontSize: '2rem',
                  color: colors.text,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                NO SIGNAL
              </span>
            )}
          </div>
        </div>

        {/* 4. LINK CARDS SECTION + AUDIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Audio player (conditionally shown) */}
          {audioOpen && audioContent && audioContent.tracks && audioContent.tracks.length > 0 && audioCard && (() => {
            // Artifact theme: audio player always matches the theme palette
            const innerText = contrastText(colors.cardBg, colors.text, colors.background)
            const artifactBlinkieColors = {
              outerBox: colors.border,
              innerBox: colors.cardBg,
              text: innerText,
              playerBox: colors.link,
              buttons: colors.accent,
            }
            return (
              <div
                data-card-id={audioCard.id}
                className="artifact-audio-square"
              >
                <style>{`
                  .artifact-audio-square div[style*="border-radius"] { border-radius: 0 !important; }
                  .artifact-audio-square > div > div:first-child button.w-4.h-4 { display: none; }
                `}</style>
                <SystemSettingsCard
                  cardType="audio"
                  transparentBackground={false}
                  titleBarStyle="system-settings"
                  blinkieBg={false}
                  blinkieCardBgNone={true}
                  blinkieOuterBoxColor={artifactBlinkieColors.outerBox}
                  blinkieInnerBoxColor={artifactBlinkieColors.innerBox}
                  blinkieTextColor={artifactBlinkieColors.text}
                >
                  <AudioPlayer
                    tracks={audioContent?.tracks || []}
                    albumArtUrl={audioContent?.albumArtUrl}
                    showWaveform={audioContent?.showWaveform ?? true}
                    looping={audioContent?.looping ?? false}
                    reverbConfig={audioContent?.reverbConfig}
                    blinkieColors={artifactBlinkieColors}
                    blinkieCardHasBgImage={false}
                    cardId={audioCard.id}
                    pageId={audioCard.page_id}
                    themeVariant="blinkies"
                  />
                </SystemSettingsCard>
              </div>
            )
          })()}

          {/* Link cards */}
          {visibleCards.map((card, i) => {
            const bgColor = blockColors[i % blockColors.length]
            const textColor = contrastText(bgColor, colors.text, colors.background)
            const isHovered = hoveredIndex === i

            const displayTitle = card.title || card.card_type.toUpperCase()
            const subtitle = card.description || ''
            const cardTypeLabel = `LINK_${String(i + 1).padStart(2, '0')}`

            const cardContent = (
              <div
                data-card-id={card.id}
                style={{
                  background: isHovered ? textColor : bgColor,
                  color: isHovered ? bgColor : textColor,
                  padding: '1.5rem 2rem',
                  minHeight: '80px',
                  position: 'relative',
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Top row: label + arrow */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      opacity: 0.6,
                    }}
                  >
                    {cardTypeLabel}
                  </span>
                  <ArrowUpRight
                    size={20}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: isHovered ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily: 'var(--font-archivo-black)',
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {displayTitle}
                </div>

                {/* Subtitle */}
                {subtitle && (
                  <div
                    style={{
                      fontFamily: 'var(--font-space-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      opacity: 0.7,
                      textAlign: 'right',
                      marginTop: '0.5rem',
                    }}
                  >
                    {subtitle}
                  </div>
                )}
              </div>
            )

            if (card.url) {
              return (
                <a
                  key={card.id}
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {cardContent}
                </a>
              )
            }

            return <div key={card.id}>{cardContent}</div>
          })}
        </div>

        {/* 5. SOCIAL ICONS FOOTER */}
        {showSocialIcons && socialIcons.length > 0 && (
          <div
            style={{
              background: colors.text,
              padding: '1rem',
              minHeight: '80px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(socialIcons.length, 4)}, 1fr)`,
              }}
            >
              {socialIcons.map((icon, idx) => {
                const IconComp = PLATFORM_ICONS[icon.platform]
                if (!IconComp) return null
                const isLast = idx === Math.min(socialIcons.length, 4) - 1 || (idx + 1) % 4 === 0
                return (
                  <a
                    key={icon.id}
                    href={icon.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem',
                      color: footerTextColor,
                      borderRight: isLast ? 'none' : `3px solid ${footerTextColor}`,
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = colors.accent }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                  >
                    <IconComp className="w-6 h-6" />
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legal footer */}
      <footer
        style={{
          padding: '1rem',
          textAlign: 'center',
          fontSize: '0.65rem',
          color: colors.text,
          opacity: 0.5,
          fontFamily: 'var(--font-space-mono)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href={`/privacy?username=${username}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <span>///</span>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </div>
        {!hasProAccess && (
          <div style={{ marginTop: '0.5rem' }}>
            Powered by LinkLobby
          </div>
        )}
      </footer>
    </div>
  )
}
