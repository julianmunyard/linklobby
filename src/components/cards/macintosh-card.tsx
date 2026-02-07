'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfileStore } from '@/stores/profile-store'
import { useThemeStore } from '@/stores/theme-store'
import { PLATFORM_ICONS } from '@/components/editor/social-icon-picker'
import { GalleryCard } from './gallery-card'
import type { Card, ReleaseCardContent } from '@/types/card'

type MacWindowStyle = 'notepad' | 'small-window' | 'large-window' | 'title-link' | 'map' | 'calculator' | 'presave' | 'gallery'

interface MacCardProps {
  card: Card
  isPreview?: boolean
  onClick?: () => void
  isSelected?: boolean
}

// ─── Shared Styles ──────────────────────────────────────────────────────────

const MAC_BORDER = '3px solid #000'
const TITLE_FONT = "var(--font-pix-chicago), 'Chicago', monospace"

// 6 equal lines: each line is 2px tall, spaced 3px apart within the bar area
const HORIZONTAL_LINES = 'repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 5px)'
const CHECKERBOARD = 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 8px 8px'

// ─── Router Component ───────────────────────────────────────────────────────

export function MacintoshCard({ card, isPreview, onClick, isSelected }: MacCardProps) {
  // Social icons card gets special treatment regardless of macWindowStyle
  if (card.card_type === 'social-icons') {
    return <MacintoshSocials card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
  }

  // Gallery card gets special treatment
  if (card.card_type === 'gallery') {
    return <MacintoshGallery card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
  }

  const style = (card.content as Record<string, unknown>)?.macWindowStyle as MacWindowStyle | undefined

  switch (style) {
    case 'notepad':
      return <MacintoshNotepad card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'small-window':
      return <MacintoshSmallWindow card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'large-window':
      return <MacintoshLargeWindow card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'title-link':
      return <MacintoshTitleLink card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'gallery':
      return <MacintoshGallery card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'map':
      return <MacintoshMap card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'calculator':
      return <MacintoshCalculator card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'presave':
      return <MacintoshPresave card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    default:
      // Fallback: render as large window
      return <MacintoshLargeWindow card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
  }
}

// ─── Close Box ──────────────────────────────────────────────────────────────

function CloseBox() {
  return (
    <div
      className="flex-shrink-0 relative z-10"
      style={{
        width: '17px',
        height: '17px',
        border: '2px solid #000',
        background: '#fff',
      }}
    />
  )
}

// ─── Title Bar Variants ─────────────────────────────────────────────────────

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
      <div className="relative z-10 mx-1">
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

// ─── Window Wrapper ─────────────────────────────────────────────────────────

function WindowWrapper({
  children,
  onClick,
  isSelected,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  isSelected?: boolean
  className?: string
}) {
  return (
    <div
      className={cn('overflow-hidden cursor-pointer', className)}
      onClick={onClick}
      style={{
        border: MAC_BORDER,
        outline: isSelected ? '2px solid #0066ff' : 'none',
        outlineOffset: '2px',
      }}
    >
      {children}
    </div>
  )
}

// ─── Notepad Page Fold Box ──────────────────────────────────────────────────
// Square box with dashed diagonal inside, sits in bottom-left of content area.
// Separate from the 4 full-width stacked page lines below.

const FOLD_SIZE = 36

function NotepadFoldBox() {
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
        {/* Top border line */}
        <line x1="0" y1="0" x2={FOLD_SIZE + 1} y2="0" stroke="#000" strokeWidth="2" />
        {/* Right border line */}
        <line x1={FOLD_SIZE} y1={-1} x2={FOLD_SIZE} y2={FOLD_SIZE} stroke="#000" strokeWidth="2" />
        {/* 8-bit staircase diagonal */}
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

// ─── 1. NotePad ─────────────────────────────────────────────────────────────

export function MacintoshNotepad({ card, onClick, isSelected }: MacCardProps) {
  const content = card.content as Record<string, unknown>
  const macLinks = (content?.macLinks as Array<{ title: string; url: string }>) || []
  const notepadStyle = (content?.notepadStyle as string) || 'list'
  const notepadBgColor = (content?.notepadBgColor as string) || '#F2FFA4'
  const title = card.title || 'Note Pad'

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      {/* White title bar */}
      <LinesTitleBar title={title} bgColor="#fff" />
      {/* Content area */}
      <div style={{ background: notepadBgColor, minHeight: '100px' }}>
        {/* Links */}
        <div style={{ padding: '12px 16px' }}>
          {macLinks.length === 0 ? (
            <p
              style={{
                fontFamily: TITLE_FONT,
                fontSize: '14px',
                color: '#666',
              }}
            >
              No links yet...
            </p>
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
                      display: 'inline-block',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: TITLE_FONT,
                        fontSize: '14px',
                        color: '#000',
                        background: notepadBgColor,
                        clipPath: PIXEL_BTN_CLIP,
                        padding: '8px 16px',
                        textAlign: 'center',
                      }}
                    >
                      {link.title || link.url}
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    style={{
                      fontFamily: TITLE_FONT,
                      fontSize: '14px',
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
                <li
                  key={i}
                  style={{
                    fontFamily: TITLE_FONT,
                    fontSize: '14px',
                    color: '#000',
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    textAlign: link.url ? 'left' : 'center',
                  }}
                >
                  {link.url && <span style={{ marginRight: '8px' }}>{'\u2192'}</span>}
                  {link.title || link.url || 'Untitled'}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Bottom area: fold box in bottom-left corner */}
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 8px 0 0' }}>
          <NotepadFoldBox />
        </div>
      </div>
      {/* 4 stacked page lines – first one starts after the fold triangle */}
      <div style={{ background: notepadBgColor, height: '3px' }}>
        <div style={{ borderTop: '2px solid #000', marginLeft: `${FOLD_SIZE}px`, height: '100%' }} />
      </div>
      <div style={{ background: notepadBgColor, borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: notepadBgColor, borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: notepadBgColor, borderTop: '2px solid #000', height: '2px' }} />
    </WindowWrapper>
  )
}

// ─── 2. Small Window ────────────────────────────────────────────────────────

const SMALL_WIN_CHECKERBOARD = 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px'

const SMALL_WIN_HALFTONE = [
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 0 0 / 5px 7px',
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 2.5px 3.5px / 5px 7px',
  'linear-gradient(#fff, #fff)',
].join(', ')

export function MacintoshSmallWindow({ card, onClick, isSelected }: MacCardProps) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const title = card.title || 'Window'
  const checkerBgColor = (content?.macCheckerColor as string) || '#cfffcc'
  const windowBg = (content?.macWindowBgColor as string) || '#afb3ee'
  const textAlign = ((content?.macTextAlign as string) || 'left') as 'left' | 'center'
  const textColor = (content?.macTextColor as string) || '#000'
  const macVideoUrl = (content?.macVideoUrl as string) || ''
  const checkerBg = `repeating-conic-gradient(#000 0% 25%, ${checkerBgColor} 0% 50%) 0 0 / 4px 4px`

  return (
    <div
      className="overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{
        border: MAC_BORDER,
        borderRadius: '6px',
        outline: isSelected ? '2px solid #0066ff' : 'none',
        outlineOffset: '2px',
      }}
    >
      {/* Halftone title bar */}
      <div
        className="flex items-center gap-2 px-2"
        style={{
          height: '28px',
          borderBottom: MAC_BORDER,
          background: SMALL_WIN_HALFTONE,
          position: 'relative',
        }}
      >
        <CloseBox />
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
                  <p style={{ fontFamily: TITLE_FONT, fontSize: '12px', color: textColor }}>
                    {card.title}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Text content area */}
              <div style={{ flex: 1, padding: '12px 16px', textAlign }}>
                <p style={{ fontFamily: TITLE_FONT, fontSize: '12px', color: textColor }}>
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

// ─── 3. Large Window ────────────────────────────────────────────────────────

export function MacintoshLargeWindow({ card, onClick, isSelected }: MacCardProps) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const macBodyText = (content?.macBodyText as string) || ''
  const title = card.title || 'Window'

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <LinesTitleBar title={title} />
      {/* White content area */}
      <div style={{ background: '#fff', minHeight: '180px', padding: '16px' }}>
        {macMode === 'video' && card.url ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '16px', color: '#000' }}>
              {'\u25B6'} {macBodyText || card.title || 'Video'}
            </p>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '10px', color: '#666', marginTop: '4px' }}>
              {card.url}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '16px', color: '#000' }}>
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
    </WindowWrapper>
  )
}

// ─── 3b. Title Link ─────────────────────────────────────────────────────────

export function MacintoshTitleLink({ card, onClick, isSelected }: MacCardProps) {
  const title = card.title || 'Link'

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <div
        style={{
          height: '28px',
          background: '#fff',
          position: 'relative',
        }}
      >
        {/* Lines fill the entire bar */}
        <div
          style={{
            position: 'absolute',
            inset: '4px 2px',
            backgroundImage: HORIZONTAL_LINES,
            backgroundPosition: 'center',
          }}
        />
        {/* Title centered */}
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
    </WindowWrapper>
  )
}

// ─── 4. Map ─────────────────────────────────────────────────────────────────

export function MacintoshMap({ card, onClick, isSelected }: MacCardProps) {
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
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <LinesTitleBar title="Map" />
      {/* Map content - pixel art world map */}
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
        {/* Control buttons */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginTop: '6px',
            justifyContent: 'flex-end',
          }}
        >
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
    </WindowWrapper>
  )
}

// ─── 5. Calculator ──────────────────────────────────────────────────────────

const CALC_HALFTONE = [
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 0 0 / 5px 7px',
  'radial-gradient(circle, #000 1.3px, transparent 1.3px) 2.5px 3.5px / 5px 7px',
  'linear-gradient(#FFA454, #FFA454)',
].join(', ')

const CALC_BTN: React.CSSProperties = {
  background: '#79FF8C',
  border: '2px solid #000',
  boxShadow: '4px 4px 0 #000',
  fontFamily: TITLE_FONT,
  fontSize: '16px',
  color: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'default',
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

// 8-bit jagged rounded border using clip-path
const CALC_CLIP = `polygon(
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

const CALC_JOKES = [
  '5318008',  // BOOBIES
  '0.208',    // BOZO
]

export function MacintoshCalculator({ card, onClick, isSelected }: MacCardProps) {
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
      setDisplay(CALC_JOKES[Math.floor(Math.random() * CALC_JOKES.length)])
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
    <div style={{ ...CALC_BTN, ...style }} onClick={(e) => { e.stopPropagation(); press(v) }}>{v}</div>
  )

  return (
    <div
      className="overflow-hidden cursor-pointer"
      onClick={onClick}
      style={{
        width: '65%',
        margin: '0 auto',
        outline: isSelected ? '2px solid #0066ff' : 'none',
        outlineOffset: '2px',
      }}
    >
      {/* Outer jagged black shell */}
      <div style={{ background: '#000', clipPath: CALC_CLIP }}>
        {/* Black title bar */}
        <div
          className="flex items-center gap-2 px-2"
          style={{ height: '30px', position: 'relative' }}
        >
          <div
            className="flex-shrink-0"
            style={{ width: '15px', height: '15px', border: '2px solid #fff' }}
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
          <div style={{ clipPath: CALC_CLIP, background: CALC_HALFTONE, padding: '12px' }}>
            {/* Display */}
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
            {/* Button grid */}
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

// ─── 7. Socials ─────────────────────────────────────────────────────────────

export function MacintoshSocials({ card, onClick, isSelected }: MacCardProps) {
  const getSortedSocialIcons = useProfileStore((state) => state.getSortedSocialIcons)
  const showSocialIcons = useProfileStore((state) => state.showSocialIcons)
  const socialIconSize = useThemeStore((state) => state.socialIconSize)
  const socialIcons = getSortedSocialIcons()
  const content = card.content as Record<string, unknown>
  const windowBgColor = (content?.socialWindowBgColor as string) || '#fff'

  if (!showSocialIcons || socialIcons.length === 0) {
    return (
      <WindowWrapper onClick={onClick} isSelected={isSelected}>
        <LinesTitleBar title="Socials" />
        <div style={{ background: windowBgColor, padding: '16px', textAlign: 'center' }}>
          <p style={{ fontFamily: TITLE_FONT, fontSize: '14px', color: '#666' }}>
            No social icons added
          </p>
        </div>
      </WindowWrapper>
    )
  }

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <LinesTitleBar title="Socials" />
      <div style={{ background: windowBgColor, padding: '12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {socialIcons.map((icon) => {
            const Icon = PLATFORM_ICONS[icon.platform]
            return (
              <div
                key={icon.id}
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
                  <div style={{ color: '#000', width: socialIconSize, height: socialIconSize }}>
                    <Icon className="w-full h-full" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </WindowWrapper>
  )
}

// ─── 6. Presave ─────────────────────────────────────────────────────────────

export function MacintoshPresave({ card, onClick, isSelected }: MacCardProps) {
  const content = card.content as Record<string, unknown>
  const release = content as Partial<ReleaseCardContent> & { dropsInText?: string }
  const {
    albumArtUrl,
    releaseDate,
    preSaveUrl,
    preSaveButtonText = 'PRE-SAVE',
    afterCountdownAction = 'custom',
    afterCountdownText = 'OUT NOW',
    afterCountdownUrl,
    dropsInText = 'Drops in',
    textColor = '#000000',
  } = release
  const presaveBgColor = (content?.presaveBgColor as string) || '#ad7676'

  const [hasCompleted, setHasCompleted] = useState(false)
  const isReleased = releaseDate ? new Date(releaseDate) <= new Date() : false
  const title = (isReleased || hasCompleted) ? 'NEW RELEASE' : (card.title || 'Pre-save')

  const handleComplete = useCallback(() => setHasCompleted(true), [])

  useEffect(() => {
    if (isReleased && !hasCompleted) handleComplete()
  }, [isReleased, hasCompleted, handleComplete])

  if ((isReleased || hasCompleted) && afterCountdownAction === 'hide') return null

  const renderCountdown = (days: number, hours: number, minutes: number, seconds: number) => (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      {days > 0 && (
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: TITLE_FONT, fontSize: '24px' }}>{days}</span>
          <span style={{ fontFamily: TITLE_FONT, fontSize: '9px', display: 'block', opacity: 0.7 }}>DAYS</span>
        </div>
      )}
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: TITLE_FONT, fontSize: '24px' }}>{String(hours).padStart(2, '0')}</span>
        <span style={{ fontFamily: TITLE_FONT, fontSize: '9px', display: 'block', opacity: 0.7 }}>HRS</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: TITLE_FONT, fontSize: '24px' }}>{String(minutes).padStart(2, '0')}</span>
        <span style={{ fontFamily: TITLE_FONT, fontSize: '9px', display: 'block', opacity: 0.7 }}>MIN</span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontFamily: TITLE_FONT, fontSize: '24px' }}>{String(seconds).padStart(2, '0')}</span>
        <span style={{ fontFamily: TITLE_FONT, fontSize: '9px', display: 'block', opacity: 0.7 }}>SEC</span>
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
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
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
              <p style={{ fontFamily: TITLE_FONT, fontSize: '14px', marginBottom: '8px' }}>
                {dropsInText}
              </p>

              {/* Countdown - live if date set, static zeros if not */}
              <div style={{ margin: '12px 0' }}>
                {releaseDate ? (
                  <Countdown date={new Date(releaseDate)} renderer={countdownRenderer} onComplete={handleComplete} />
                ) : (
                  renderCountdown(0, 0, 0, 0)
                )}
              </div>

              {/* Pre-save button */}
              <div style={macBtnOuter}>
                {preSaveUrl ? (
                  <a href={preSaveUrl} target="_blank" rel="noopener noreferrer" style={macBtnInner} onClick={(e) => e.stopPropagation()}>
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
                <a href={afterCountdownUrl} target="_blank" rel="noopener noreferrer" style={macBtnInner} onClick={(e) => e.stopPropagation()}>
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
    </WindowWrapper>
  )
}

// ─── 8. Gallery (Photos) ────────────────────────────────────────────────────

export function MacintoshGallery({ card, isPreview, onClick, isSelected }: MacCardProps) {
  const title = card.title || 'Photos'

  return (
    <div
      className="cursor-pointer"
      onClick={onClick}
      style={{
        border: MAC_BORDER,
        outline: isSelected ? '2px solid #0066ff' : 'none',
        outlineOffset: '2px',
      }}
    >
      <LinesTitleBar title={title} />
      {/* White content area with gallery inside */}
      <div style={{ background: '#fff', overflow: 'hidden' }}>
        <GalleryCard card={card} isPreview={isPreview} />
      </div>
    </div>
  )
}
