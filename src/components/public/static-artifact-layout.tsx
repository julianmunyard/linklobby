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

const ARTIFACT_COLORS = ['#2F5233', '#F2E8DC', '#FFC0CB', '#A6A6A6', '#FF8C55']
const LIGHT_BG_COLORS = ['#F2E8DC', '#FFC0CB', '#A6A6A6']

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
}: StaticArtifactLayoutProps) {
  const [audioOpen, setAudioOpen] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const displayName = title || 'ARTIFACT'

  // Find audio card
  const audioCard = cards.find(c => c.card_type === 'audio' && c.is_visible !== false && isAudioContent(c.content))
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

  return (
    <div
      className="fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{ background: '#080808' }}
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
          display: 'grid',
          gridTemplateRows: 'auto auto 25vh 1fr auto',
          gap: '3px',
          minHeight: '100vh',
        }}
      >
        {/* 1. HEADER BLOCK - Pink */}
        <div
          style={{
            background: '#FFC0CB',
            padding: '1rem 1.5rem',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          {/* Top metadata row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: '#080808',
              letterSpacing: '-0.02em',
            }}
          >
            <span>USER.ID_{String(username.length).padStart(2, '0')}</span>
            <span>[ONLINE]</span>
            <span>EST. {currentYear}</span>
          </div>

          {/* Giant display name */}
          <div
            style={{
              fontFamily: 'var(--font-archivo-black)',
              fontSize: '16vw',
              lineHeight: 0.85,
              letterSpacing: '-0.05em',
              textTransform: 'uppercase',
              color: '#080808',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </div>

          {/* Bottom metadata row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              color: '#080808',
              letterSpacing: '-0.02em',
            }}
          >
            <span>DIGITAL // PHY</span>
            <span>///</span>
            <span>SYS_ADMIN</span>
          </div>
        </div>

        {/* 2. MARQUEE BANNER - Orange */}
        <div
          style={{
            background: '#FF8C55',
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
                  color: '#080808',
                  paddingRight: '2rem',
                }}
              >
                {'>>> LINKS_DATABASE /// ACCESS_GRANTED >>> CONNECT_NOW /// NET_RUNNER >>> LINKS_DATABASE /// ACCESS_GRANTED >>> CONNECT_NOW /// NET_RUNNER '}
              </span>
            ))}
          </div>
        </div>

        {/* 3. TWO-PANEL HERO (25vh) */}
        <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '3px' }}>
          {/* Left panel - Grey with vinyl record */}
          <div
            style={{
              background: '#A6A6A6',
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
            {/* CD disc */}
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
                color: '#080808',
                letterSpacing: '0.1em',
              }}
            >
              {audioOpen ? 'NOW PLAYING' : audioContent ? 'PLAY' : 'NO TRACK'}
            </span>
          </div>

          {/* Right panel - Blue with profile photo */}
          <div
            style={{
              background: '#4A6FA5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {showAvatar && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(100%) contrast(1.25)',
                  mixBlendMode: 'multiply',
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-archivo-black)',
                  fontSize: '2rem',
                  color: '#F2E8DC',
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
          {audioOpen && audioContent && audioCard && (
            <div
              data-card-id={audioCard.id}
              style={{
                background: '#080808',
                padding: '1rem 1.5rem',
              }}
            >
              <SystemSettingsCard
                cardType="audio"
                transparentBackground={audioContent.transparentBackground === true}
                titleBarStyle="system-settings"
                blinkieBg={true}
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
                  reverbConfig={audioContent.reverbConfig}
                  playerColors={audioContent.playerColors}
                  blinkieColors={audioContent.blinkieColors}
                  blinkieCardHasBgImage={!!(audioContent.blinkieBoxBackgrounds?.cardBgUrl) && !(audioContent.transparentBackground)}
                  cardId={audioCard.id}
                  pageId={audioCard.page_id}
                  themeVariant="blinkies"
                />
              </SystemSettingsCard>
            </div>
          )}

          {/* Link cards */}
          {visibleCards.map((card, i) => {
            const bgColor = ARTIFACT_COLORS[i % ARTIFACT_COLORS.length]
            const isLightBg = LIGHT_BG_COLORS.includes(bgColor)
            const textColor = isLightBg ? '#080808' : '#F2E8DC'
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

        {/* 5. SOCIAL ICONS FOOTER - Cream */}
        {showSocialIcons && socialIcons.length > 0 && (
          <div
            style={{
              background: '#F2E8DC',
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
                      color: '#080808',
                      borderRight: isLast ? 'none' : '3px solid #080808',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FFC0CB' }}
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
          color: '#A6A6A6',
          fontFamily: 'var(--font-space-mono)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href={`/privacy?username=${username}`} style={{ color: '#A6A6A6', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <span>///</span>
          <Link href="/terms" style={{ color: '#A6A6A6', textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          Powered by LinkLobby
        </div>
      </footer>
    </div>
  )
}
