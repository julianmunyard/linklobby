'use client'

import Link from 'next/link'
import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import { Calendar, Globe, Mail, Music } from 'lucide-react'
import {
  SiInstagram, SiTiktok, SiYoutube, SiSpotify, SiX,
  SiSoundcloud, SiApplemusic, SiBandcamp, SiAmazonmusic,
  SiFacebook, SiThreads, SiBluesky, SiSnapchat, SiPinterest, SiLinkedin, SiWhatsapp,
  SiTwitch, SiKick, SiDiscord,
  SiPatreon, SiVenmo, SiCashapp, SiPaypal
} from 'react-icons/si'
import { sortCardsBySortKey } from '@/lib/ordering'
import type { Card, ReleaseCardContent, GalleryCardContent, GalleryImage } from '@/types/card'
import type { SocialIcon, SocialPlatform } from '@/types/profile'
import type { ComponentType } from 'react'

type IconComponent = ComponentType<{ className?: string; style?: React.CSSProperties }>

const STATIC_PLATFORM_ICONS: Record<SocialPlatform, IconComponent> = {
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

const TITLE_FONT = "var(--font-pix-chicago), 'Chicago', monospace"
const MAC_BORDER = '3px solid #000'
const HORIZONTAL_LINES = 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 5px)'
const CHECKERBOARD = 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 8px 8px'
const DEFAULT_DESKTOP_BG = 'repeating-conic-gradient(#c0c0c0 0% 25%, #d8d8d8 0% 50%) 0 0 / 4px 4px'

interface FrameInsets {
  top: number
  bottom: number
  left: number
  right: number
}

interface StaticMacintoshLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  macPattern?: string
  macPatternColor?: string
  socialIconsJson?: string | null
  socialIconSize?: number
  frameInsets?: FrameInsets | null
  frameZoom?: number
  framePosX?: number
  framePosY?: number
}

export function StaticMacintoshLayout({
  username,
  title,
  cards,
  headingSize,
  bodySize,
  macPattern,
  macPatternColor,
  socialIconsJson,
  socialIconSize = 24,
  frameInsets,
  frameZoom = 1,
  framePosX = 0,
  framePosY = 0,
}: StaticMacintoshLayoutProps) {
  const socialIcons: SocialIcon[] = socialIconsJson
    ? JSON.parse(socialIconsJson)
    : []
  const sortedSocialIcons = [...socialIcons].sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  )
  const visibleCards = useMemo(
    () => sortCardsBySortKey(cards.filter((c) => c.is_visible !== false)),
    [cards]
  )

  const handleCardClick = useCallback((card: Card) => {
    const content = card.content as Record<string, unknown>
    const macWindowStyle = content?.macWindowStyle as string | undefined

    if (card.card_type === 'social-icons') {
      return
    }
    if (card.card_type === 'gallery') {
      return
    }
    if (macWindowStyle === 'notepad') {
      return
    }
    if (macWindowStyle === 'map' || macWindowStyle === 'calculator') {
      return
    }
    if (card.url) {
      window.open(card.url, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const bgColor = macPatternColor || '#c0c0c0'
  const bgStyle = macPattern
    ? { backgroundColor: bgColor, backgroundImage: `url(${macPattern})`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundBlendMode: 'multiply' as const }
    : { background: DEFAULT_DESKTOP_BG }

  const hasFrame = !!frameInsets
  const contentStyle: React.CSSProperties = hasFrame
    ? {
        position: 'fixed',
        overflowY: 'auto',
        overflowX: 'hidden',
        width: `${100 - frameInsets.left - frameInsets.right}vw`,
        left: `${frameInsets.left}vw`,
        top: `${frameInsets.top}vh`,
        bottom: `${frameInsets.bottom}vh`,
        transform: `scale(${frameZoom}) translate(${framePosX}%, ${framePosY}%)`,
        transformOrigin: 'center center',
      }
    : {
        minHeight: '100vh',
        padding: '0 0 0 0',
        position: 'relative' as const,
      }

  return (
    <>
      {/* Fixed background that extends slightly beyond viewport to cover overscroll */}
      <div
        className="fixed -z-10"
        style={{
          top: '-5vh',
          left: '-5vw',
          right: '-5vw',
          bottom: '-5vh',
          ...bgStyle,
        }}
      />
      <div style={contentStyle}>
      {/* Mac Menu Bar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '2px solid #000',
          padding: '0 8px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: TITLE_FONT,
          fontSize: '12px',
          color: '#000',
          position: hasFrame ? 'sticky' : 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>{'\uF8FF'}</span>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Label</span>
          <span>Special</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div style={{ width: '18px', height: '16px', border: '2px solid #000', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>?</div>
          <div style={{ width: '18px', height: '16px', border: '2px solid #000', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '10px', height: '8px', border: '1.5px solid #000', borderRadius: '1px' }} />
          </div>
        </div>
      </div>

      <div>
      {/* Desktop title */}
      <div
        style={{
          textAlign: 'center',
          margin: '0 16px 24px',
          paddingTop: hasFrame ? '24px' : '52px',
          fontFamily: TITLE_FONT,
          fontSize: headingSize ? `${22 * headingSize}px` : '22px',
          letterSpacing: '2px',
          color: '#000',
        }}
      >
        {title}
      </div>

      {/* Stack Mac windows vertically */}
      <div
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {visibleCards.map((card) => {
          const style = (card.content as Record<string, unknown>)?.macWindowStyle as string | undefined
          const isSmall = style === 'small-window'
          return (
            <div key={card.id} style={{ width: isSmall ? 'calc(50% - 10px)' : '100%' }}>
              <StaticMacCard
                card={card}
                onClick={() => handleCardClick(card)}
                bodySize={bodySize}
                socialIcons={sortedSocialIcons}
              />
            </div>
          )
        })}
      </div>

      {/* Legal footer */}
      <footer className="mt-12 pt-6 text-center text-xs" style={{ opacity: 0.5 }}>
        <div className="flex items-center justify-center gap-4" style={{ color: '#000' }}>
          <Link
            href={`/privacy?username=${username}`}
            className="hover:opacity-80 transition-opacity"
          >
            Privacy Policy
          </Link>
          <span>•</span>
          <Link
            href="/terms"
            className="hover:opacity-80 transition-opacity"
          >
            Terms of Service
          </Link>
        </div>
        <div className="mt-2" style={{ color: '#000' }}>
          Powered by LinkLobby
        </div>
      </footer>
      </div>
    </div>
    </>
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function CloseBox() {
  return (
    <div
      style={{
        width: '17px',
        height: '17px',
        border: '2px solid #000',
        background: '#fff',
        flexShrink: 0,
      }}
    />
  )
}

function LinesTitleBar({ title, bgColor = '#fff' }: { title?: string; bgColor?: string }) {
  return (
    <div
      className="flex items-center px-1"
      style={{
        height: '28px',
        borderBottom: MAC_BORDER,
        background: bgColor,
        position: 'relative',
      }}
    >
      {/* Lines fill the entire bar behind everything */}
      <div
        style={{
          position: 'absolute',
          inset: '4px 2px',
          backgroundImage: HORIZONTAL_LINES,
          backgroundPosition: 'center',
        }}
      />
      {/* Close box sits on top of lines */}
      <div style={{ position: 'relative', zIndex: 1, margin: '0 4px', flexShrink: 0 }}>
        <CloseBox />
      </div>
      {/* Title centered absolutely relative to full bar width */}
      {title && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: TITLE_FONT,
            fontSize: '16px',
            letterSpacing: '2px',
            lineHeight: '1',
            color: '#000',
            background: bgColor,
            whiteSpace: 'nowrap',
            padding: '4px 8px',
            zIndex: 10,
          }}
        >
          {title}
        </div>
      )}
    </div>
  )
}

function CheckerboardTitleBar({ title }: { title?: string }) {
  return (
    <div
      className="flex items-center gap-2 px-2"
      style={{
        height: '28px',
        borderBottom: MAC_BORDER,
        background: CHECKERBOARD,
        position: 'relative',
      }}
    >
      <CloseBox />
      {title && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: TITLE_FONT,
            fontSize: '16px',
            letterSpacing: '2px',
            lineHeight: '1',
            color: '#000',
            background: '#fff',
            whiteSpace: 'nowrap',
            padding: '4px 8px',
            zIndex: 10,
          }}
        >
          {title}
        </div>
      )}
    </div>
  )
}

// ─── Static Mac Card Router ─────────────────────────────────────────────────

function StaticMacCard({ card, onClick, bodySize, socialIcons }: { card: Card; onClick: () => void; bodySize?: number; socialIcons?: SocialIcon[] }) {
  // Social icons card gets special treatment
  if (card.card_type === 'social-icons') {
    return <StaticMacSocials card={card} socialIcons={socialIcons || []} />
  }

  // Gallery card gets special treatment
  if (card.card_type === 'gallery') {
    return <StaticMacGallery card={card} />
  }

  const content = card.content as Record<string, unknown>
  const macWindowStyle = content?.macWindowStyle as string | undefined

  switch (macWindowStyle) {
    case 'notepad':
      return <StaticNotepad card={card} bodySize={bodySize} />
    case 'small-window':
      return <StaticSmallWindow card={card} onClick={onClick} bodySize={bodySize} />
    case 'large-window':
      return <StaticLargeWindow card={card} onClick={onClick} bodySize={bodySize} />
    case 'title-link':
      return <StaticTitleLink card={card} onClick={onClick} />
    case 'gallery':
      return <StaticMacGallery card={card} />
    case 'map':
      return <StaticMap card={card} />
    case 'calculator':
      return <StaticCalculator card={card} />
    case 'presave':
      return <StaticPresave card={card} bodySize={bodySize} />
    default:
      return <StaticLargeWindow card={card} onClick={onClick} bodySize={bodySize} />
  }
}

// ─── Static Socials Window ──────────────────────────────────────────────────

function StaticMacSocials({ card, socialIcons }: { card: Card; socialIcons: SocialIcon[] }) {
  if (socialIcons.length === 0) return null
  const content = card.content as Record<string, unknown>
  const windowBgColor = (content?.socialWindowBgColor as string) || '#fff'

  return (
    <div data-card-id={card.id} style={{ border: MAC_BORDER, overflow: 'hidden' }}>
      <LinesTitleBar title="Socials" />
      <div style={{ background: windowBgColor, padding: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {socialIcons.map((icon) => {
            const Icon = STATIC_PLATFORM_ICONS[icon.platform]
            if (!Icon) return null
            return (
              <a
                key={icon.id}
                href={icon.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
                data-card-id={card.id}
              >
                <div
                  style={{
                    background: '#000',
                    clipPath: PIXEL_BTN_CLIP,
                    padding: '2px',
                  }}
                >
                  <div
                    style={{
                      background: windowBgColor,
                      clipPath: PIXEL_BTN_CLIP,
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ color: '#000', width: 20, height: 20 }}>
                      <Icon className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Static Window Components ───────────────────────────────────────────────

function StaticNotepad({ card, bodySize }: { card: Card; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macLinks = (content?.macLinks as Array<{ title: string; url: string }>) || []
  const notepadStyle = (content?.notepadStyle as string) || 'list'
  const notepadBgColor = (content?.notepadBgColor as string) || '#F2FFA4'
  const title = card.title || 'Note Pad'
  const fontSize = bodySize ? `${14 * bodySize}px` : '14px'

  return (
    <div
      data-card-id={card.id}
      style={{ border: MAC_BORDER, overflow: 'hidden' }}
    >
      {/* White title bar */}
      <LinesTitleBar title={title} bgColor="#fff" />
      <div style={{ background: notepadBgColor, minHeight: '100px' }}>
        <div style={{ padding: '12px 16px' }}>
          {macLinks.length === 0 ? (
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#666' }}>No links yet...</p>
          ) : notepadStyle === 'buttons' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              {macLinks.map((link, i) => (
                link.url ? (
                  <div
                    key={i}
                    style={{
                      background: '#000',
                      clipPath: PIXEL_BTN_CLIP,
                      padding: '2px',
                      width: '100%',
                    }}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: TITLE_FONT,
                        fontSize,
                        color: '#000',
                        background: notepadBgColor,
                        clipPath: PIXEL_BTN_CLIP,
                        padding: '8px 16px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block',
                      }}
                      data-card-id={card.id}
                    >
                      {link.title || link.url}
                    </a>
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{
                      fontFamily: TITLE_FONT,
                      fontSize,
                      color: '#000',
                      padding: '8px 16px',
                      textAlign: 'center',
                      width: '100%',
                    }}
                  >
                    {link.title || 'Untitled'}
                  </div>
                )
              ))}
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {macLinks.map((link, i) => (
                <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: link.url ? 'left' : 'center' }}>
                  {link.url ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: TITLE_FONT,
                        fontSize,
                        color: '#000',
                        textDecoration: 'none',
                      }}
                      data-card-id={card.id}
                    >
                      <span style={{ marginRight: '8px' }}>{'\u2192'}</span>
                      {link.title || link.url}
                    </a>
                  ) : (
                    <span style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
                      {link.title || 'Untitled'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Fold box in bottom-left corner */}
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 8px 0 0' }}>
          <StaticFoldBox />
        </div>
      </div>
      {/* 4 stacked page lines – first one starts after the fold triangle */}
      <div style={{ background: notepadBgColor, height: '3px' }}>
        <div style={{ borderTop: '2px solid #000', marginLeft: `${FOLD_SIZE}px`, height: '100%' }} />
      </div>
      <div style={{ background: notepadBgColor, borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: notepadBgColor, borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: notepadBgColor, borderTop: '2px solid #000', height: '2px' }} />
    </div>
  )
}

const FOLD_SIZE = 36

function StaticFoldBox() {
  // 8-bit staircase diagonal: 12 steps of 3px each across 36px
  const steps = 12
  const stepSize = FOLD_SIZE / steps
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = i * stepSize
    const y = i * stepSize
    if (i > 0) points.push(`${x},${y - stepSize}`)
    points.push(`${x},${y}`)
  }

  return (
    <div
      style={{
        width: `${FOLD_SIZE}px`,
        height: `${FOLD_SIZE}px`,
        position: 'relative',
      }}
    >
      <svg
        viewBox={`0 0 ${FOLD_SIZE} ${FOLD_SIZE}`}
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <line x1="0" y1="0" x2={FOLD_SIZE + 1} y2="0" stroke="#000" strokeWidth="2" />
        <line x1={FOLD_SIZE} y1={-1} x2={FOLD_SIZE} y2={FOLD_SIZE} stroke="#000" strokeWidth="2" />
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#000"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

const STATIC_SMALL_WIN_CHECKERBOARD = 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px'

const STATIC_SMALL_WIN_HALFTONE = [
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 0 0 / 5px 7px',
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 2.5px 3.5px / 5px 7px',
  'linear-gradient(#fff, #fff)',
].join(', ')

function StaticSmallWindow({ card, onClick, bodySize }: { card: Card; onClick: () => void; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const fontSize = bodySize ? `${12 * bodySize}px` : '12px'
  const checkerBgColor = (content?.macCheckerColor as string) || '#cfffcc'
  const windowBg = (content?.macWindowBgColor as string) || '#afb3ee'
  const textAlign = ((content?.macTextAlign as string) || 'left') as 'left' | 'center'
  const textColor = (content?.macTextColor as string) || '#000'
  const macVideoUrl = (content?.macVideoUrl as string) || ''
  const checkerBg = `repeating-conic-gradient(#000 0% 25%, ${checkerBgColor} 0% 50%) 0 0 / 4px 4px`

  return (
    <div
      data-card-id={card.id}
      onClick={onClick}
      style={{ border: MAC_BORDER, borderRadius: '6px', overflow: 'hidden', cursor: card.url ? 'pointer' : 'default' }}
    >
      {/* Halftone title bar */}
      <div
        style={{
          height: '28px',
          borderBottom: MAC_BORDER,
          background: STATIC_SMALL_WIN_HALFTONE,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 8px',
        }}
      >
        <div style={{ width: '15px', height: '15px', border: '2px solid #000', background: '#fff', flexShrink: 0 }} />
      </div>
      {/* Checkerboard border around content */}
      <div style={{ background: checkerBg, padding: '6px', aspectRatio: '4 / 3', display: 'flex', flexDirection: 'column' }}>
        {/* Black border inside checkerboard */}
        <div style={{ border: '2px solid #000', background: windowBg, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {macMode === 'video' && macVideoUrl ? (
            <>
              <video
                src={macVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {card.title && (
                <div style={{ position: 'absolute', inset: 0, padding: '12px 16px', textAlign }}>
                  <p style={{ fontFamily: TITLE_FONT, fontSize, color: textColor }}>
                    {card.title}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Text content area */}
              <div style={{ flex: 1, padding: '12px 16px', textAlign }}>
                <p style={{ fontFamily: TITLE_FONT, fontSize, color: textColor }}>
                  {card.title || card.url || 'Empty window'}
                </p>
              </div>
              {/* Scrollbar at bottom */}
              <div
                style={{
                  height: '14px',
                  borderTop: '2px solid #000',
                  background: '#fff',
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StaticLargeWindow({ card, onClick, bodySize }: { card: Card; onClick: () => void; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const macBodyText = (content?.macBodyText as string) || ''
  const title = card.title || 'Window'
  const fontSize = bodySize ? `${16 * bodySize}px` : '16px'

  return (
    <div
      data-card-id={card.id}
      onClick={onClick}
      style={{ border: MAC_BORDER, overflow: 'hidden', cursor: card.url ? 'pointer' : 'default' }}
    >
      <LinesTitleBar title={title} />
      <div style={{ background: '#fff', minHeight: '180px', padding: '16px' }}>
        {macMode === 'video' && card.url ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
              {'\u25B6'} {macBodyText || card.title || 'Video'}
            </p>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '10px', color: '#666', marginTop: '4px' }}>
              {card.url}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
              {macBodyText || '\u00A0'}
            </p>
            {card.url && (
              <p style={{ fontFamily: TITLE_FONT, fontSize: '10px', color: '#666', marginTop: '4px' }}>
                {card.url}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StaticTitleLink({ card, onClick }: { card: Card; onClick: () => void }) {
  const title = card.title || 'Link'

  return (
    <div
      data-card-id={card.id}
      onClick={onClick}
      style={{ border: MAC_BORDER, overflow: 'hidden', cursor: card.url ? 'pointer' : 'default' }}
    >
      <div
        style={{
          height: '28px',
          background: '#fff',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '4px 2px',
            backgroundImage: HORIZONTAL_LINES,
            backgroundPosition: 'center',
          }}
        />
        {title && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: TITLE_FONT,
              fontSize: '16px',
              letterSpacing: '2px',
              lineHeight: '1',
              color: '#000',
              background: '#fff',
              whiteSpace: 'nowrap',
              padding: '4px 8px',
              zIndex: 10,
            }}
          >
            {title}
          </div>
        )}
      </div>
    </div>
  )
}

function StaticMap({ card }: { card: Card }) {
  const ZOOM_LEVELS = [1, 1.5, 2, 3]
  const [zoomIdx, setZoomIdx] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoom = ZOOM_LEVELS[zoomIdx]

  const clampPan = useCallback((x: number, y: number, scale: number) => {
    if (scale <= 1) return { x: 0, y: 0 }
    const maxX = ((scale - 1) / (2 * scale)) * 100
    const maxY = ((scale - 1) / (2 * scale)) * 100
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }, [])

  function handleZoomIn(e: React.MouseEvent) {
    e.stopPropagation()
    if (zoomIdx < ZOOM_LEVELS.length - 1) {
      const newIdx = zoomIdx + 1
      setZoomIdx(newIdx)
      setPan(clampPan(pan.x, pan.y, ZOOM_LEVELS[newIdx]))
    }
  }

  function handleZoomOut(e: React.MouseEvent) {
    e.stopPropagation()
    if (zoomIdx > 0) {
      const newIdx = zoomIdx - 1
      setZoomIdx(newIdx)
      setPan(clampPan(pan.x, pan.y, ZOOM_LEVELS[newIdx]))
    }
  }

  function handleReset(e: React.MouseEvent) {
    e.stopPropagation()
    setZoomIdx(0)
    setPan({ x: 0, y: 0 })
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (zoom <= 1) return
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: pan.x, startPanY: pan.y }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragRef.current.startX) / rect.width) * 100
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100
    setPan(clampPan(dragRef.current.startPanX + dx / zoom, dragRef.current.startPanY + dy / zoom, zoom))
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  return (
    <div
      data-card-id={card.id}
      style={{ border: MAC_BORDER, overflow: 'hidden' }}
    >
      <LinesTitleBar title="Map" />
      <div style={{ background: '#fff', padding: '8px', position: 'relative' }}>
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            height: '180px',
            background: '#9EFFD5',
            border: '1px solid #000',
            position: 'relative',
            overflow: 'hidden',
            cursor: zoom > 1 ? 'grab' : 'default',
            touchAction: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mac-pixel-map.png"
            alt="Pixel art world map"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'pixelated',
              transform: `scale(${zoom}) translate(${pan.x}%, ${pan.y}%)`,
              transformOrigin: 'center center',
              transition: dragRef.current ? 'none' : 'transform 0.15s ease-out',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', justifyContent: 'flex-end' }}>
          {[
            { label: 'Zoom In', handler: handleZoomIn },
            { label: 'Zoom Out', handler: handleZoomOut },
            { label: 'Reset', handler: handleReset },
          ].map(({ label, handler }) => (
            <div
              key={label}
              onClick={handler}
              style={{
                fontFamily: TITLE_FONT,
                fontSize: '9px',
                color: '#000',
                border: '1px solid #000',
                padding: '2px 6px',
                background: '#fff',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const STATIC_CALC_HALFTONE = [
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 0 0 / 5px 7px',
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 2.5px 3.5px / 5px 7px',
  'linear-gradient(#FFA454, #FFA454)',
].join(', ')

const STATIC_CALC_BTN: React.CSSProperties = {
  background: '#79FF8C',
  border: '2px solid #000',
  boxShadow: '4px 4px 0 #000',
  fontFamily: TITLE_FONT,
  fontSize: '16px',
  color: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 0',
}

// 8-bit jagged rounded border for buttons
const PIXEL_BTN_CLIP = `polygon(
  6px 0%, calc(100% - 6px) 0%,
  calc(100% - 6px) 3px, calc(100% - 3px) 3px,
  calc(100% - 3px) 6px, 100% 6px,
  100% calc(100% - 6px), calc(100% - 3px) calc(100% - 6px),
  calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 3px),
  calc(100% - 6px) 100%, 6px 100%,
  6px calc(100% - 3px), 3px calc(100% - 3px),
  3px calc(100% - 6px), 0% calc(100% - 6px),
  0% 6px, 3px 6px,
  3px 3px, 6px 3px
)`

const STATIC_CALC_CLIP = `polygon(
  4px 0%, calc(100% - 4px) 0%,
  calc(100% - 4px) 2px, calc(100% - 2px) 2px,
  calc(100% - 2px) 4px, 100% 4px,
  100% calc(100% - 4px), calc(100% - 2px) calc(100% - 4px),
  calc(100% - 2px) calc(100% - 2px), calc(100% - 4px) calc(100% - 2px),
  calc(100% - 4px) 100%, 4px 100%,
  4px calc(100% - 2px), 2px calc(100% - 2px),
  2px calc(100% - 4px), 0% calc(100% - 4px),
  0% 4px, 2px 4px,
  2px 2px, 4px 2px
)`

const STATIC_CALC_JOKES = [
  '5318008',  // BOOBIES
  '0.208',    // BOZO
]

function StaticCalculator({ card }: { card: Card }) {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState<number | null>(null)
  const [op, setOp] = useState<string | null>(null)
  const [fresh, setFresh] = useState(true)
  const [flipped, setFlipped] = useState(false)

  const press = (val: string) => {
    if (val === 'C') {
      setDisplay('0')
      setPrev(null)
      setOp(null)
      setFresh(true)
      setFlipped(false)
      return
    }
    if (val === '=') {
      setDisplay(STATIC_CALC_JOKES[Math.floor(Math.random() * STATIC_CALC_JOKES.length)])
      setPrev(null)
      setOp(null)
      setFresh(true)
      setFlipped(true)
      return
    }
    if (['+', '\u2212', '/', '*'].includes(val)) {
      setPrev(parseFloat(display))
      setOp(val)
      setFresh(true)
      return
    }
    if (val === '.' && display.includes('.') && !fresh) return
    if (fresh) {
      setDisplay(val === '.' ? '0.' : val)
      setFresh(false)
    } else {
      setDisplay(display + val)
    }
  }

  const B = ({ v, style }: { v: string; style?: React.CSSProperties }) => (
    <div style={{ ...STATIC_CALC_BTN, cursor: 'pointer', ...style }} onClick={() => press(v)}>{v}</div>
  )

  return (
    <div
      data-card-id={card.id}
      style={{ width: '65%', margin: '0 auto' }}
    >
      {/* Outer jagged black shell */}
      <div style={{ background: '#000', clipPath: STATIC_CALC_CLIP }}>
        {/* Black title bar */}
        <div
          style={{
            height: '30px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 8px',
          }}
        >
          <div
            style={{ width: '15px', height: '15px', border: '2px solid #fff', flexShrink: 0 }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: TITLE_FONT,
              fontSize: '16px',
              letterSpacing: '2px',
              lineHeight: '1',
              color: '#fff',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            Calculator
          </div>
        </div>
        {/* Orange halftone body with its own jagged edge, inset from black */}
        <div style={{ padding: '0 6px 6px' }}>
          <div style={{ clipPath: STATIC_CALC_CLIP, background: STATIC_CALC_HALFTONE, padding: '12px' }}>
            <div
              style={{
                background: '#715AFF',
                border: '2px solid #000',
                padding: '6px 10px',
                textAlign: 'right',
                fontFamily: TITLE_FONT,
                fontSize: '20px',
                color: '#000',
                marginBottom: '10px',
                overflow: 'hidden',
              }}
            >
              <span style={flipped ? { display: 'inline-block', transform: 'rotate(180deg)' } : undefined}>{display}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(6, auto)', gap: '5px' }}>
              <B v="C" /><B v="=" /><B v="/" /><B v="*" />
              <B v="7" /><B v="8" /><B v="9" /><B v={'\u2212'} />
              <B v="4" /><B v="5" /><B v="6" /><B v="+" />
              <B v="1" /><B v="2" /><B v="3" />
              <B v="=" style={{ gridRow: 'span 2' }} />
              <B v="0" style={{ gridColumn: 'span 2' }} /><B v="." />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 6. Static Presave ──────────────────────────────────────────────────────

function StaticPresave({ card, bodySize }: { card: Card; bodySize?: number }) {
  const content = card.content as Partial<ReleaseCardContent> & { dropsInText?: string; presaveBgColor?: string }
  const {
    albumArtUrl,
    releaseDate,
    preSaveUrl,
    preSaveButtonText = 'PRE-SAVE',
    afterCountdownAction = 'custom',
    afterCountdownText = 'OUT NOW',
    afterCountdownUrl,
    dropsInText = 'Drops in',
    presaveBgColor = '#ad7676',
    textColor = '#000000',
  } = content

  const [hasCompleted, setHasCompleted] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false
  const title = (isReleased || hasCompleted) ? 'NEW RELEASE' : (card.title || 'Pre-save')

  const handleComplete = useCallback(() => setHasCompleted(true), [])

  useEffect(() => { setIsMounted(true) }, [])
  useEffect(() => {
    if (isReleased && !hasCompleted) handleComplete()
  }, [isReleased, hasCompleted, handleComplete])

  if ((isReleased || hasCompleted) && afterCountdownAction === 'hide') return null

  const titleFontSize = bodySize ? `${16 * bodySize}px` : '16px'
  const dropsInFontSize = bodySize ? `${14 * bodySize}px` : '14px'
  const countdownFontSize = bodySize ? `${24 * bodySize}px` : '24px'
  const countdownLabelSize = bodySize ? `${9 * bodySize}px` : '9px'

  const renderCountdown = (days: number, hours: number, minutes: number, seconds: number) => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      {days > 0 && (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: TITLE_FONT, fontSize: countdownFontSize }}>{days}</span>
          <span style={{ fontFamily: TITLE_FONT, fontSize: countdownLabelSize, display: 'block', opacity: 0.7 }}>DAYS</span>
        </div>
      )}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: TITLE_FONT, fontSize: countdownFontSize }}>{String(hours).padStart(2, '0')}</span>
        <span style={{ fontFamily: TITLE_FONT, fontSize: countdownLabelSize, display: 'block', opacity: 0.7 }}>HRS</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: TITLE_FONT, fontSize: countdownFontSize }}>{String(minutes).padStart(2, '0')}</span>
        <span style={{ fontFamily: TITLE_FONT, fontSize: countdownLabelSize, display: 'block', opacity: 0.7 }}>MIN</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: TITLE_FONT, fontSize: countdownFontSize }}>{String(seconds).padStart(2, '0')}</span>
        <span style={{ fontFamily: TITLE_FONT, fontSize: countdownLabelSize, display: 'block', opacity: 0.7 }}>SEC</span>
      </div>
    </div>
  )

  const countdownRenderer = ({ days, hours, minutes, seconds, completed }: CountdownRenderProps) => {
    if (completed || hasCompleted) return null
    return renderCountdown(days, hours, minutes, seconds)
  }

  const macBtnInner: React.CSSProperties = {
    fontFamily: TITLE_FONT,
    fontSize: '14px',
    color: textColor,
    background: presaveBgColor,
    clipPath: PIXEL_BTN_CLIP,
    padding: '6px 16px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    textAlign: 'center',
  }

  const macBtnOuter: React.CSSProperties = {
    background: textColor,
    clipPath: PIXEL_BTN_CLIP,
    padding: '2px',
    display: 'inline-block',
  }

  return (
    <div data-card-id={card.id} style={{ border: MAC_BORDER, overflow: 'hidden' }}>
      <LinesTitleBar title={title} />
      <div style={{ background: presaveBgColor, padding: '16px', color: textColor }}>
        {/* Album art */}
        {albumArtUrl && (
          <div style={{ border: '2px solid #000', marginBottom: '12px', overflow: 'hidden' }}>
            <img
              src={albumArtUrl}
              alt={title}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          {/* Pre-release state */}
          {!isReleased && !hasCompleted && (
            <>
              {/* Drops in label */}
              <p style={{ fontFamily: TITLE_FONT, fontSize: dropsInFontSize, marginBottom: '8px' }}>
                {dropsInText}
              </p>

              {/* Countdown - live if date set, static zeros if not */}
              <div style={{ margin: '12px 0' }}>
                {releaseDate && isMounted ? (
                  <Countdown date={new Date(releaseDate)} renderer={countdownRenderer} onComplete={handleComplete} />
                ) : (
                  renderCountdown(0, 0, 0, 0)
                )}
              </div>

              {/* Pre-save button */}
              <div style={macBtnOuter}>
                {preSaveUrl ? (
                  <a href={preSaveUrl} target="_blank" rel="noopener noreferrer" style={macBtnInner}>
                    {preSaveButtonText}
                  </a>
                ) : (
                  <div style={macBtnInner}>
                    {preSaveButtonText}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Post-release */}
          {(isReleased || hasCompleted) && afterCountdownAction === 'custom' && (
            <div style={macBtnOuter}>
              {afterCountdownUrl ? (
                <a href={afterCountdownUrl} target="_blank" rel="noopener noreferrer" style={macBtnInner}>
                  {afterCountdownText || 'OUT NOW'}
                </a>
              ) : (
                <div style={macBtnInner}>
                  {afterCountdownText || 'OUT NOW'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 8-bit pixel arrows (SVG) ────────────────────────────────────────────────

function StaticPixelArrowLeft({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="0" width="2" height="2" fill="currentColor" />
      <rect x="6" y="2" width="2" height="2" fill="currentColor" />
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="2" y="6" width="2" height="2" fill="currentColor" />
      <rect x="4" y="8" width="2" height="2" fill="currentColor" />
      <rect x="6" y="10" width="2" height="2" fill="currentColor" />
      <rect x="8" y="12" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

function StaticPixelArrowRight({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="0" width="2" height="2" fill="currentColor" />
      <rect x="8" y="2" width="2" height="2" fill="currentColor" />
      <rect x="10" y="4" width="2" height="2" fill="currentColor" />
      <rect x="12" y="6" width="2" height="2" fill="currentColor" />
      <rect x="10" y="8" width="2" height="2" fill="currentColor" />
      <rect x="8" y="10" width="2" height="2" fill="currentColor" />
      <rect x="6" y="12" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

// ─── 7. Static Mac Gallery ──────────────────────────────────────────────────

function StaticMacGallery({ card }: { card: Card }) {
  const content = card.content as Partial<GalleryCardContent>
  const title = card.title || 'Photos'
  const images = content.images || []
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <div data-card-id={card.id} style={{ border: MAC_BORDER, overflow: 'hidden' }}>
      <LinesTitleBar title={title} />
      <div style={{ background: '#000', position: 'relative', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.alt || 'Photo'}
          style={{ width: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4/3' }}
        />
        {/* 8-bit pixel arrows */}
        {images.length > 1 && (
          <>
            <div
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length) }}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fff',
                border: '2px solid #000',
                padding: '4px',
                cursor: 'pointer',
                color: '#000',
                lineHeight: 0,
              }}
            >
              <StaticPixelArrowLeft size={20} />
            </div>
            <div
              onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length) }}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fff',
                border: '2px solid #000',
                padding: '4px',
                cursor: 'pointer',
                color: '#000',
                lineHeight: 0,
              }}
            >
              <StaticPixelArrowRight size={20} />
            </div>
          </>
        )}
        {/* Image counter */}
        {images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: TITLE_FONT,
              fontSize: '11px',
              color: '#000',
              background: '#fff',
              border: '2px solid #000',
              padding: '2px 8px',
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  )
}
