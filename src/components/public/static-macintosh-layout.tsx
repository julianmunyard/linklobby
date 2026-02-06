'use client'

import Link from 'next/link'
import { useMemo, useCallback, useState, useRef } from 'react'
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
    case 'title-link':
      return <StaticTitleLink card={card} onClick={onClick} />
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
      <div style={{ background: '#F2FFA4', minHeight: '100px' }}>
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
      <div style={{ background: '#F2FFA4', height: '3px' }}>
        <div style={{ borderTop: '2px solid #000', marginLeft: `${FOLD_SIZE}px`, height: '100%' }} />
      </div>
      <div style={{ background: '#F2FFA4', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#F2FFA4', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#F2FFA4', borderTop: '2px solid #000', height: '2px' }} />
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
      <div style={{ background: '#fff', minHeight: '120px', padding: '16px' }}>
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
