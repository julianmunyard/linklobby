'use client'

import Link from 'next/link'
import { useMemo, useCallback } from 'react'
import { sortCardsBySortKey } from '@/lib/ordering'
import type { Card } from '@/types/card'

const TITLE_FONT = "var(--font-pix-chicago), 'Chicago', monospace"
const MAC_BORDER = '3px solid #000'
const HORIZONTAL_LINES = 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 5px)'
const CHECKERBOARD = 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 8px 8px'
const DEFAULT_DESKTOP_BG = 'repeating-conic-gradient(#c0c0c0 0% 25%, #d8d8d8 0% 50%) 0 0 / 4px 4px'

interface StaticMacintoshLayoutProps {
  username: string
  title: string
  cards: Card[]
  headingSize?: number
  bodySize?: number
  macPattern?: string
  macPatternColor?: string
}

export function StaticMacintoshLayout({
  username,
  title,
  cards,
  headingSize,
  bodySize,
  macPattern,
  macPatternColor,
}: StaticMacintoshLayoutProps) {
  const visibleCards = useMemo(
    () => sortCardsBySortKey(cards.filter((c) => c.is_visible !== false)),
    [cards]
  )

  const handleCardClick = useCallback((card: Card) => {
    const content = card.content as Record<string, unknown>
    const macWindowStyle = content?.macWindowStyle as string | undefined

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

  const bgStyle = macPattern
    ? { backgroundColor: macPatternColor || '#c0c0c0', backgroundImage: `url(${macPattern})`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundBlendMode: 'multiply' as const }
    : { background: DEFAULT_DESKTOP_BG }

  return (
    <div
      style={{
        minHeight: '100vh',
        ...bgStyle,
        padding: '24px 16px',
      }}
    >
      {/* Desktop title */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '24px',
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
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {visibleCards.map((card) => (
          <StaticMacCard
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card)}
            bodySize={bodySize}
          />
        ))}
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
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────

function CloseBox() {
  return (
    <div
      style={{
        width: '14px',
        height: '14px',
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
      {/* Spacer to center title */}
      <div className="flex-1" />
      {title && (
        <div
          className="flex-shrink-0"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '16px',
            letterSpacing: '2px',
            lineHeight: '1',
            color: '#000',
            background: bgColor,
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 1,
            padding: '4px 8px',
          }}
        >
          {title}
        </div>
      )}
      <div className="flex-1" />
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
      }}
    >
      <CloseBox />
      <div className="flex-1" />
      {title && (
        <div
          className="flex-shrink-0 px-2"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '16px',
            letterSpacing: '2px',
            lineHeight: '1',
            color: '#000',
            background: '#fff',
            whiteSpace: 'nowrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {title}
        </div>
      )}
      <div className="flex-1" />
    </div>
  )
}

// ─── Static Mac Card Router ─────────────────────────────────────────────────

function StaticMacCard({ card, onClick, bodySize }: { card: Card; onClick: () => void; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macWindowStyle = content?.macWindowStyle as string | undefined

  switch (macWindowStyle) {
    case 'notepad':
      return <StaticNotepad card={card} bodySize={bodySize} />
    case 'small-window':
      return <StaticSmallWindow card={card} onClick={onClick} bodySize={bodySize} />
    case 'large-window':
      return <StaticLargeWindow card={card} onClick={onClick} bodySize={bodySize} />
    case 'map':
      return <StaticMap card={card} />
    case 'calculator':
      return <StaticCalculator card={card} />
    default:
      return <StaticLargeWindow card={card} onClick={onClick} bodySize={bodySize} />
  }
}

// ─── Static Window Components ───────────────────────────────────────────────

function StaticNotepad({ card, bodySize }: { card: Card; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macLinks = (content?.macLinks as Array<{ title: string; url: string }>) || []
  const title = card.title || 'Note Pad'
  const fontSize = bodySize ? `${14 * bodySize}px` : '14px'

  return (
    <div
      data-card-id={card.id}
      style={{ border: MAC_BORDER, overflow: 'hidden' }}
    >
      {/* White title bar */}
      <LinesTitleBar title={title} bgColor="#fff" />
      <div style={{ background: '#FFF3B0', minHeight: '100px' }}>
        <div style={{ padding: '12px 16px' }}>
          {macLinks.length === 0 ? (
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#666' }}>No links yet...</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {macLinks.map((link, i) => (
                <li key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
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
                      <span style={{ marginRight: '8px' }}>{'\u2192'}</span>
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
      <div style={{ background: '#FFF3B0', height: '3px' }}>
        <div style={{ borderTop: '2px solid #000', marginLeft: `${FOLD_SIZE}px`, height: '100%' }} />
      </div>
      <div style={{ background: '#FFF3B0', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#FFF3B0', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#FFF3B0', borderTop: '2px solid #000', height: '2px' }} />
    </div>
  )
}

const FOLD_SIZE = 36

function StaticFoldBox() {
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
        <line x1="0" y1="0" x2={FOLD_SIZE} y2={FOLD_SIZE} stroke="#000" strokeWidth="2" strokeDasharray="3,3" />
      </svg>
    </div>
  )
}

function StaticSmallWindow({ card, onClick, bodySize }: { card: Card; onClick: () => void; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const title = card.title || 'Window'
  const fontSize = bodySize ? `${12 * bodySize}px` : '12px'

  return (
    <div
      data-card-id={card.id}
      onClick={onClick}
      style={{ border: MAC_BORDER, overflow: 'hidden', cursor: card.url ? 'pointer' : 'default' }}
    >
      <CheckerboardTitleBar title={title} />
      <div style={{ background: '#d0e4ff', minHeight: '80px', position: 'relative' }}>
        <div style={{ padding: '12px 16px', background: '#fff', margin: '8px', border: '1px solid #000' }}>
          {macMode === 'video' && card.url ? (
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
              {'\u25B6'} {card.title || 'Video'}
            </p>
          ) : (
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
              {card.title || card.url || 'Empty window'}
            </p>
          )}
        </div>
        <div
          style={{
            height: '16px',
            borderTop: '1px solid #000',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 2px',
          }}
        >
          <div style={{ width: '16px', height: '12px', border: '1px solid #000', background: '#fff' }} />
          <div style={{ flex: 1, height: '12px', background: CHECKERBOARD, margin: '0 2px' }} />
          <div style={{ width: '16px', height: '12px', border: '1px solid #000', background: '#fff' }} />
        </div>
      </div>
    </div>
  )
}

function StaticLargeWindow({ card, onClick, bodySize }: { card: Card; onClick: () => void; bodySize?: number }) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const title = card.title || 'Window'
  const fontSize = bodySize ? `${16 * bodySize}px` : '16px'

  return (
    <div
      data-card-id={card.id}
      onClick={onClick}
      style={{ border: MAC_BORDER, overflow: 'hidden', cursor: card.url ? 'pointer' : 'default' }}
    >
      <LinesTitleBar title={title} />
      <div style={{ background: '#fff', minHeight: '120px', padding: '16px' }}>
        {macMode === 'video' && card.url ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
              {'\u25B6'} {card.title || 'Video'}
            </p>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '10px', color: '#666', marginTop: '4px' }}>
              {card.url}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize, color: '#000' }}>
              {card.title || card.url || 'Empty window'}
            </p>
            {card.url && card.title && (
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

function StaticMap({ card }: { card: Card }) {
  return (
    <div
      data-card-id={card.id}
      style={{ border: MAC_BORDER, overflow: 'hidden' }}
    >
      <LinesTitleBar title="Map" />
      <div style={{ background: '#fff', padding: '8px', position: 'relative' }}>
        <div
          style={{
            height: '140px',
            background: '#fff',
            border: '1px solid #000',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
            <rect x="20" y="15" width="30" height="5" fill="#000" />
            <rect x="15" y="20" width="40" height="5" fill="#000" />
            <rect x="18" y="25" width="35" height="5" fill="#000" />
            <rect x="20" y="30" width="30" height="5" fill="#000" />
            <rect x="25" y="35" width="20" height="5" fill="#000" />
            <rect x="28" y="40" width="12" height="5" fill="#000" />
            <rect x="42" y="50" width="15" height="5" fill="#000" />
            <rect x="45" y="55" width="12" height="5" fill="#000" />
            <rect x="44" y="60" width="10" height="5" fill="#000" />
            <rect x="43" y="65" width="8" height="5" fill="#000" />
            <rect x="44" y="70" width="6" height="5" fill="#000" />
            <rect x="45" y="75" width="4" height="3" fill="#000" />
            <rect x="90" y="15" width="15" height="5" fill="#000" />
            <rect x="88" y="20" width="18" height="5" fill="#000" />
            <rect x="85" y="25" width="20" height="5" fill="#000" />
            <rect x="88" y="35" width="18" height="5" fill="#000" />
            <rect x="90" y="40" width="16" height="5" fill="#000" />
            <rect x="92" y="45" width="14" height="5" fill="#000" />
            <rect x="93" y="50" width="12" height="5" fill="#000" />
            <rect x="94" y="55" width="10" height="5" fill="#000" />
            <rect x="95" y="60" width="8" height="5" fill="#000" />
            <rect x="96" y="65" width="5" height="3" fill="#000" />
            <rect x="110" y="10" width="35" height="5" fill="#000" />
            <rect x="108" y="15" width="45" height="5" fill="#000" />
            <rect x="110" y="20" width="50" height="5" fill="#000" />
            <rect x="115" y="25" width="40" height="5" fill="#000" />
            <rect x="120" y="30" width="30" height="5" fill="#000" />
            <rect x="125" y="35" width="20" height="5" fill="#000" />
            <rect x="150" y="60" width="15" height="5" fill="#000" />
            <rect x="148" y="65" width="18" height="5" fill="#000" />
            <rect x="150" y="70" width="12" height="5" fill="#000" />
          </svg>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', justifyContent: 'flex-end' }}>
          {['Zoom In', 'Zoom Out', 'Scroll'].map((label) => (
            <div
              key={label}
              style={{
                fontFamily: TITLE_FONT,
                fontSize: '9px',
                color: '#000',
                border: '1px solid #000',
                padding: '2px 6px',
                background: '#fff',
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

const CALC_BUTTONS = [
  ['C', '\u00B1', '%', '\u00F7'],
  ['7', '8', '9', '\u00D7'],
  ['4', '5', '6', '\u2212'],
  ['1', '2', '3', '+'],
  ['0', '0', '.', '='],
]

function StaticCalculator({ card }: { card: Card }) {
  return (
    <div
      data-card-id={card.id}
      style={{ border: MAC_BORDER, overflow: 'hidden' }}
    >
      <CheckerboardTitleBar title="Calculator" />
      <div
        style={{
          background: 'repeating-conic-gradient(#FFB672 0% 25%, #ffc88f 0% 50%) 0 0 / 10px 10px',
          padding: '12px',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '2px solid #000',
            padding: '8px 12px',
            textAlign: 'right',
            fontFamily: TITLE_FONT,
            fontSize: '22px',
            color: '#000',
            marginBottom: '8px',
          }}
        >
          0
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
          {CALC_BUTTONS.flat().map((label, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '2px solid #000',
                padding: '6px',
                textAlign: 'center',
                fontFamily: TITLE_FONT,
                fontSize: '14px',
                color: '#000',
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
