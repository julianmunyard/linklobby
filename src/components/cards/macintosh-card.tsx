'use client'

import { cn } from '@/lib/utils'
import type { Card } from '@/types/card'

type MacWindowStyle = 'notepad' | 'small-window' | 'large-window' | 'map' | 'calculator'

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
      {/* Spacer to center title */}
      <div className="flex-1" />
      {title && (
        <div
          className="flex-shrink-0 px-2 relative z-10"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '16px',
            letterSpacing: '2px',
            lineHeight: '1',
            color: '#000',
            background: bgColor,
            whiteSpace: 'nowrap',
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
          className="flex-shrink-0 px-2 relative z-10"
          style={{
            fontFamily: TITLE_FONT,
            fontSize: '16px',
            letterSpacing: '2px',
            lineHeight: '1',
            color: '#000',
            background: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      )}
      <div className="flex-1" />
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
      <div style={{ background: '#FFF3B0', minHeight: '100px' }}>
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
      <div style={{ background: '#FFF3B0', height: '3px' }}>
        <div style={{ borderTop: '2px solid #000', marginLeft: `${FOLD_SIZE}px`, height: '100%' }} />
      </div>
      <div style={{ background: '#FFF3B0', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#FFF3B0', borderTop: '2px solid #000', height: '3px' }} />
      <div style={{ background: '#FFF3B0', borderTop: '2px solid #000', height: '2px' }} />
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
  const title = card.title || 'Window'

  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <LinesTitleBar title={title} />
      {/* White content area */}
      <div style={{ background: '#fff', minHeight: '120px', padding: '16px' }}>
        {macMode === 'video' && card.url ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '16px', color: '#000' }}>
              {'\u25B6'} {card.title || 'Video'}
            </p>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '10px', color: '#666', marginTop: '4px' }}>
              {card.url}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '16px', color: '#000' }}>
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
    </WindowWrapper>
  )
}

// ─── 4. Map ─────────────────────────────────────────────────────────────────

export function MacintoshMap({ card, onClick, isSelected }: MacCardProps) {
  return (
    <WindowWrapper onClick={onClick} isSelected={isSelected}>
      <LinesTitleBar title="Map" />
      {/* Map content - pixel art world map */}
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
          {/* Simplified pixel world map using CSS */}
          <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
            {/* North America */}
            <rect x="20" y="15" width="30" height="5" fill="#000" />
            <rect x="15" y="20" width="40" height="5" fill="#000" />
            <rect x="18" y="25" width="35" height="5" fill="#000" />
            <rect x="20" y="30" width="30" height="5" fill="#000" />
            <rect x="25" y="35" width="20" height="5" fill="#000" />
            <rect x="28" y="40" width="12" height="5" fill="#000" />
            {/* South America */}
            <rect x="42" y="50" width="15" height="5" fill="#000" />
            <rect x="45" y="55" width="12" height="5" fill="#000" />
            <rect x="44" y="60" width="10" height="5" fill="#000" />
            <rect x="43" y="65" width="8" height="5" fill="#000" />
            <rect x="44" y="70" width="6" height="5" fill="#000" />
            <rect x="45" y="75" width="4" height="3" fill="#000" />
            {/* Europe */}
            <rect x="90" y="15" width="15" height="5" fill="#000" />
            <rect x="88" y="20" width="18" height="5" fill="#000" />
            <rect x="85" y="25" width="20" height="5" fill="#000" />
            {/* Africa */}
            <rect x="88" y="35" width="18" height="5" fill="#000" />
            <rect x="90" y="40" width="16" height="5" fill="#000" />
            <rect x="92" y="45" width="14" height="5" fill="#000" />
            <rect x="93" y="50" width="12" height="5" fill="#000" />
            <rect x="94" y="55" width="10" height="5" fill="#000" />
            <rect x="95" y="60" width="8" height="5" fill="#000" />
            <rect x="96" y="65" width="5" height="3" fill="#000" />
            {/* Asia */}
            <rect x="110" y="10" width="35" height="5" fill="#000" />
            <rect x="108" y="15" width="45" height="5" fill="#000" />
            <rect x="110" y="20" width="50" height="5" fill="#000" />
            <rect x="115" y="25" width="40" height="5" fill="#000" />
            <rect x="120" y="30" width="30" height="5" fill="#000" />
            <rect x="125" y="35" width="20" height="5" fill="#000" />
            {/* Australia */}
            <rect x="150" y="60" width="15" height="5" fill="#000" />
            <rect x="148" y="65" width="18" height="5" fill="#000" />
            <rect x="150" y="70" width="12" height="5" fill="#000" />
          </svg>
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
