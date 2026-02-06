'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Card } from '@/types/card'

type MacWindowStyle = 'notepad' | 'small-window' | 'large-window' | 'title-link' | 'map' | 'calculator'

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
    case 'map':
      return <MacintoshMap card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
    case 'calculator':
      return <MacintoshCalculator card={card} isPreview={isPreview} onClick={onClick} isSelected={isSelected} />
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
        {/* Top border line – extends past to meet outer edge of right line */}
        <line x1="0" y1="0" x2={FOLD_SIZE + 1} y2="0" stroke="#000" strokeWidth="2" />
        {/* Right border line – extends up to meet outer edge of top line */}
        <line x1={FOLD_SIZE} y1={-1} x2={FOLD_SIZE} y2={FOLD_SIZE} stroke="#000" strokeWidth="2" />
        {/* Dashed diagonal from top-left to bottom-right */}
        <line
          x1="0" y1="0"
          x2={FOLD_SIZE} y2={FOLD_SIZE}
          stroke="#000"
          strokeWidth="2"
          strokeDasharray="3,3"
        />
      </svg>
    </div>
  )
}

// ─── 1. NotePad ─────────────────────────────────────────────────────────────

export function MacintoshNotepad({ card, onClick, isSelected }: MacCardProps) {
  const content = card.content as Record<string, unknown>
  const macLinks = (content?.macLinks as Array<{ title: string; url: string }>) || []
  const title = card.title || 'Note Pad'

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      {/* White title bar */}
      <LinesTitleBar title={title} bgColor="#fff" />
      {/* Yellow content area */}
      <div style={{ background: '#F2FFA4', minHeight: '100px' }}>
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
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{'\u2192'}</span>
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
      <div style={{ background: '#F2FFA4', height: '3px' }}>
        <div style={{ borderTop: '2px solid #000', marginLeft: `${FOLD_SIZE}px`, height: '100%' }} />
      </div>
      <div style={{ background: '#F2FFA4', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#F2FFA4', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#F2FFA4', borderTop: '2px solid #000', height: '2px' }} />
    </WindowWrapper>
  )
}

// ─── 2. Small Window ────────────────────────────────────────────────────────

export function MacintoshSmallWindow({ card, onClick, isSelected }: MacCardProps) {
  const content = card.content as Record<string, unknown>
  const macMode = (content?.macMode as string) || 'link'
  const title = card.title || 'Window'

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <CheckerboardTitleBar title={title} />
      {/* Blue/white content area */}
      <div style={{ background: '#d0e4ff', minHeight: '80px', position: 'relative' }}>
        <div style={{ padding: '12px 16px', background: '#fff', margin: '8px', border: '1px solid #000' }}>
          {macMode === 'video' && card.url ? (
            <p style={{ fontFamily: TITLE_FONT, fontSize: '12px', color: '#000' }}>
              {'\u25B6'} {card.title || 'Video'}
            </p>
          ) : (
            <p style={{ fontFamily: TITLE_FONT, fontSize: '12px', color: '#000' }}>
              {card.title || card.url || 'Empty window'}
            </p>
          )}
        </div>
        {/* Scrollbar visual at bottom */}
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
    </WindowWrapper>
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
      <div style={{ background: '#fff', minHeight: '120px', padding: '16px' }}>
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

const CALC_BUTTONS = [
  ['C', '\u00B1', '%', '\u00F7'],
  ['7', '8', '9', '\u00D7'],
  ['4', '5', '6', '\u2212'],
  ['1', '2', '3', '+'],
  ['0', '0', '.', '='],
]

export function MacintoshCalculator({ card, onClick, isSelected }: MacCardProps) {
  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <CheckerboardTitleBar title="Calculator" />
      {/* Orange checkerboard background */}
      <div
        style={{
          background: 'repeating-conic-gradient(#FFB672 0% 25%, #ffc88f 0% 50%) 0 0 / 10px 10px',
          padding: '12px',
        }}
      >
        {/* Display */}
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
        {/* Button grid */}
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
                cursor: 'default',
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
