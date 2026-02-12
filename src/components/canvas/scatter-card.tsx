'use client'

import { useRef } from 'react'
import Moveable from 'react-moveable'
import type { Card } from '@/types/card'
import type { ScatterPosition } from '@/types/scatter'
import { DEFAULT_SCATTER_SIZES } from '@/types/scatter'
import { CardRenderer } from '@/components/cards/card-renderer'
import { cn } from '@/lib/utils'

interface ScatterCardProps {
  card: Card
  cardIndex: number
  totalCards: number
  themeId: string
  canvasWidth: number
  canvasHeight: number
  maxZIndex: number
  isSelected: boolean
  arrangeMode: boolean
  onUpdate: (cardId: string, position: Partial<ScatterPosition>) => void
  onSelect: (cardId: string) => void
}

function getDefaultPosition(cardIndex: number, totalCards: number, cardType: string): ScatterPosition {
  const defaults = DEFAULT_SCATTER_SIZES[cardType] || { width: 50, height: 20 }
  const cols = Math.ceil(Math.sqrt(totalCards))
  const row = Math.floor(cardIndex / cols)
  const col = cardIndex % cols
  const spacingX = 5
  const spacingY = 5

  return {
    x: spacingX + col * ((100 - 2 * spacingX) / cols),
    y: spacingY + row * ((100 - 2 * spacingY) / Math.ceil(totalCards / cols)),
    width: defaults.width,
    height: defaults.height,
    zIndex: cardIndex,
  }
}

export function ScatterCard({
  card,
  cardIndex,
  totalCards,
  themeId,
  canvasWidth,
  canvasHeight,
  maxZIndex,
  isSelected,
  arrangeMode,
  onUpdate,
  onSelect,
}: ScatterCardProps) {
  const targetRef = useRef<HTMLDivElement>(null)

  // Content-only cards (text, social-icons) use fit-content so the Moveable
  // bounding box wraps the actual visible content, not a full-width container.
  // For these, width in ScatterPosition is a scale multiplier (100 = 1x natural size).
  // For regular cards, width is a % of canvas and the card renders at canvasWidth.
  const isFitContent = card.card_type === 'text' || card.card_type === 'social-icons'

  // Get scatter position for this theme, or compute a default grid position
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId] || getDefaultPosition(cardIndex, totalCards, card.card_type)

  // Convert percentage positions to pixels
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * canvasHeight
  // Scale: width as fraction (1.0 = full canvas for regular, 1.0 = natural size for fit-content)
  const scale = scatterPos.width / 100

  return (
    <>
      <div
        ref={targetRef}
        className={cn(
          'scatter-card absolute',
          isSelected && arrangeMode && 'ring-3 ring-blue-500',
        )}
        style={{
          width: isFitContent ? 'fit-content' : canvasWidth,
          maxWidth: isFitContent ? canvasWidth : undefined,
          transform: `translate(${pixelX}px, ${pixelY}px) scale(${scale})`,
          transformOrigin: 'top left',
          zIndex: scatterPos.zIndex,
          cursor: arrangeMode ? 'grab' : 'pointer',
          touchAction: arrangeMode ? 'none' : 'auto',
        }}
        onClick={() => {
          if (!arrangeMode) onSelect(card.id)
        }}
      >
        <div style={{ pointerEvents: arrangeMode ? 'none' : 'auto' }}>
          <CardRenderer card={card} isPreview={true} themeId={themeId} />
        </div>
      </div>

      {arrangeMode && (
        <Moveable
          target={targetRef}
          draggable
          scalable
          keepRatio
          renderDirections={['nw', 'ne', 'sw', 'se']}
          throttleDrag={0}
          throttleScale={0}
          onDragStart={e => {
            // Set z-index via DOM only — NO store update during interaction.
            // Store updates trigger React re-renders which reset the transform
            // mid-drag and cause Moveable to lose track of the current position.
            (e.target as HTMLElement).style.zIndex = '9999'
          }}
          onDrag={e => {
            e.target.style.transform = e.transform
          }}
          onDragEnd={e => {
            if (!e.lastEvent) {
              // No movement (just a click) — restore z-index
              (e.target as HTMLElement).style.zIndex = String(scatterPos.zIndex)
              return
            }
            const [tx, ty] = e.lastEvent.translate
            onUpdate(card.id, {
              x: Math.max(0, (tx / canvasWidth) * 100),
              y: Math.max(0, (ty / canvasHeight) * 100),
              zIndex: maxZIndex + 1,
            })
          }}
          onScaleStart={e => {
            (e.target as HTMLElement).style.zIndex = '9999'
            e.setMinScaleSize([80, 0])
            e.setMaxScaleSize([canvasWidth, Infinity])
          }}
          onScale={e => {
            e.target.style.transform = e.drag.transform
          }}
          onScaleEnd={e => {
            if (!e.lastEvent) {
              (e.target as HTMLElement).style.zIndex = String(scatterPos.zIndex)
              return
            }
            const [sx] = e.lastEvent.scale
            const [tx, ty] = e.lastEvent.drag.translate
            onUpdate(card.id, {
              width: Math.max(15, Math.min(100, sx * 100)),
              x: Math.max(0, (tx / canvasWidth) * 100),
              y: Math.max(0, (ty / canvasHeight) * 100),
              zIndex: maxZIndex + 1,
            })
          }}
        />
      )}
    </>
  )
}
