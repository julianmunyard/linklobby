'use client'

import { useMemo } from 'react'
import { MacintoshCard } from './macintosh-card'
import { sortCardsBySortKey } from '@/lib/ordering'
import { useThemeStore } from '@/stores/theme-store'
import type { Card } from '@/types/card'

const TITLE_FONT = "var(--font-pix-chicago), 'Chicago', monospace"
const DEFAULT_DESKTOP_BG = 'repeating-conic-gradient(#c0c0c0 0% 25%, #d8d8d8 0% 50%) 0 0 / 4px 4px'

interface MacintoshLayoutProps {
  title: string
  cards: Card[]
  isPreview?: boolean
  onCardClick?: (cardId: string) => void
  selectedCardId?: string | null
}

export function MacintoshLayout({
  title,
  cards,
  isPreview,
  onCardClick,
  selectedCardId,
}: MacintoshLayoutProps) {
  const macPattern = useThemeStore((s) => s.macPattern)
  const macPatternColor = useThemeStore((s) => s.macPatternColor)

  const visibleCards = useMemo(
    () => sortCardsBySortKey(cards.filter((c) => c.is_visible !== false)),
    [cards]
  )

  const bgStyle = macPattern
    ? { backgroundColor: macPatternColor, backgroundImage: `url(${macPattern})`, backgroundSize: 'cover' as const, backgroundPosition: 'center' as const, backgroundBlendMode: 'multiply' as const }
    : { background: DEFAULT_DESKTOP_BG }

  return (
    <div
      style={{
        minHeight: '100vh',
        ...bgStyle,
        padding: 0,
        overscrollBehavior: 'none',
      }}
    >
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
          position: 'fixed',
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

      {/* Desktop title bar */}
      <div
        style={{
          textAlign: 'center',
          margin: '0 16px 24px',
          paddingTop: '52px',
          fontFamily: TITLE_FONT,
          fontSize: '22px',
          letterSpacing: '2px',
          color: '#000',
        }}
      >
        {title}
      </div>

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
  )
}
