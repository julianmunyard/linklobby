'use client'

import { useMemo } from 'react'
import { MacintoshCard } from './macintosh-card'
import { sortCardsBySortKey } from '@/lib/ordering'
import type { Card } from '@/types/card'

const TITLE_FONT = "var(--font-vt323), 'Chicago', monospace"
const DESKTOP_BG = 'repeating-conic-gradient(#c0c0c0 0% 25%, #d8d8d8 0% 50%) 0 0 / 4px 4px'

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
  const visibleCards = useMemo(
    () => sortCardsBySortKey(cards.filter((c) => c.is_visible !== false)),
    [cards]
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: DESKTOP_BG,
        padding: '24px 16px',
      }}
    >
      {/* Desktop title bar */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '24px',
          fontFamily: TITLE_FONT,
          fontSize: '24px',
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
            boxShadow: '4px 4px 0px 0px #fff, 6px 6px 0px 0px #000',
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
            <p style={{ fontFamily: TITLE_FONT, fontSize: '16px', color: '#000' }}>
              No windows yet
            </p>
            <p style={{ fontFamily: TITLE_FONT, fontSize: '14px', color: '#666', marginTop: '8px' }}>
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
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {visibleCards.map((card) => (
            <MacintoshCard
              key={card.id}
              card={card}
              isPreview={isPreview}
              onClick={onCardClick ? () => onCardClick(card.id) : undefined}
              isSelected={selectedCardId === card.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
