'use client'

import { useMemo } from 'react'
import { MacintoshCard } from './macintosh-card'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import type { Card } from '@/types/card'

const TITLE_FONT = "var(--font-pix-chicago), 'Chicago', monospace"

/** Lighten a hex color by a factor (1.0 = no change, 1.15 = 15% lighter) */
function lightenHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.min(255, Math.round(r + (255 - r) * (factor - 1)))
  const lg = Math.min(255, Math.round(g + (255 - g) * (factor - 1)))
  const lb = Math.min(255, Math.round(b + (255 - b) * (factor - 1)))
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
}

function makeCheckerboard(color: string): string {
  const lighter = lightenHex(color, 1.15)
  return `repeating-conic-gradient(${color} 0% 25%, ${lighter} 0% 50%) 0 0 / 4px 4px`
}

interface FrameInsets {
  top: number
  bottom: number
  left: number
  right: number
}

interface MacintoshLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
  frameInsets?: FrameInsets | null
  frameZoom?: number
  framePosX?: number
  framePosY?: number
}

export function MacintoshLayout({
  title,
  cards,
  isPreview,
  onCardClick,
  selectedCardId,
  frameInsets,
  frameZoom = 1,
  framePosX = 0,
  framePosY = 0,
}: MacintoshLayoutProps) {
  const macPattern = useThemeStore((s) => s.macPattern)
  const macPatternColor = useThemeStore((s) => s.macPatternColor)

  const visibleCards = useMemo(
    () => sortCardsBySortKey(cards.filter((c) => c.is_visible !== false)),
    [cards]
  )

  // For PNG patterns, use two layers (pattern + color overlay with mix-blend-mode)
  // because background-blend-mode doesn't work reliably on iOS Safari.
  // For the default checkerboard, the color is baked into the CSS gradient.
  const usePatternLayers = !!macPattern
  const checkerboardBg = makeCheckerboard(macPatternColor)

  // When frame is active, constrain content inside frame bounds
  const hasFrame = !!frameInsets
  const contentStyle: React.CSSProperties = hasFrame
    ? {
        position: 'fixed',
        zIndex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        width: `${100 - frameInsets.left - frameInsets.right}vw`,
        left: `${frameInsets.left}vw`,
        top: 0,
        bottom: 0,
        transform: `scale(${frameZoom}) translate(${framePosX}%, ${framePosY}%)`,
        transformOrigin: 'center center',
      }
    : {
        minHeight: '100vh',
        padding: 0,
        overscrollBehavior: 'none',
        position: 'relative',
        zIndex: 1,
      }

  return (
    <>
    {/* Fixed background layer — z-index 0 above body, content at z-index 1 above this.
        Oversized by 50% in every direction to guarantee full coverage on all devices/safe areas. */}
    {usePatternLayers ? (
      /* Two-layer approach for PNG patterns: pattern + color overlay.
         Uses mix-blend-mode instead of background-blend-mode for iOS Safari compatibility. */
      <div style={{ position: 'fixed', zIndex: 0, top: '-50vh', left: '-50vw', right: '-50vw', bottom: '-50vh' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${macPattern})`, backgroundRepeat: 'repeat', backgroundSize: '500px auto', imageRendering: 'pixelated' as const }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: macPatternColor, mixBlendMode: 'multiply' }} />
      </div>
    ) : (
      /* Default checkerboard: color baked into CSS gradient, no blend mode needed */
      <div style={{ position: 'fixed', zIndex: 0, top: '-50vh', left: '-50vw', right: '-50vw', bottom: '-50vh', background: checkerboardBg }} />
    )}
    <div style={contentStyle}>
      {/* White spacer above menu bar for frame — unified bar with status bar.
          +1vh buffer clears the frame's curved inner edge on desktop aspect ratios. */}
      {hasFrame && frameInsets && (
        <div style={{ height: `${frameInsets.top + 1}vh`, background: '#fff', position: 'sticky', top: 0, zIndex: 101 }} />
      )}
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
          top: hasFrame && frameInsets ? `${frameInsets.top + 1}vh` : 0,
          left: 0,
          right: 0,
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
        </div>
        <div style={{ flexShrink: 0 }}>
          <span>{title}</span>
        </div>
      </div>

      {/* Spacer for fixed menu bar */}
      <div style={{ height: hasFrame ? '24px' : '52px' }} />

      {visibleCards.length === 0 ? (
        /* Empty state: Mac dialog */
        <div
          style={{
            maxWidth: '320px',
            margin: '40px auto',
            background: '#fff',
            border: '3px solid #000',
          }}
        >
          <div
            className="flex items-center gap-2 px-2"
            style={{
              height: '28px',
              borderBottom: '3px solid #000',
              background: 'repeating-linear-gradient(0deg, #000 0px, #000 2px, #fff 2px, #fff 4px)',
            }}
          />
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '14px', color: '#000' }}>
              No windows yet
            </p>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Add Mac windows using the editor.
            </p>
          </div>
        </div>
      ) : (
        /* Stack Mac windows vertically */
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
                <MacintoshCard
                  card={card}
                  isPreview={isPreview}
                  onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                  isSelected={selectedCardId === card.id}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}
