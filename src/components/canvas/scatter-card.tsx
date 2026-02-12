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
  isSelected: boolean
  arrangeMode: boolean
  onUpdate: (cardId: string, position: Partial<ScatterPosition>) => void
  onBringToFront: (cardId: string) => void
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
  isSelected,
  arrangeMode,
  onUpdate,
  onBringToFront,
  onSelect,
}: ScatterCardProps) {
  const targetRef = useRef<HTMLDivElement>(null)

  // Get scatter position for this theme, or compute a default grid position
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId] || getDefaultPosition(cardIndex, totalCards, card.card_type)

  // Convert percentage positions to pixels
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * canvasHeight
  // Scale: width as fraction of canvas (1.0 = full canvas width)
  const scale = scatterPos.width / 100

  return (
    <>
      {/* Card target — renders content at full canvasWidth, CSS-scaled to target size.
          CSS transform handles both position (translate) and size (scale).
          Pointer events respect the visual (scaled) bounds. */}
      <div
        ref={targetRef}
        className={cn(
          'scatter-card absolute',
          isSelected && arrangeMode && 'ring-3 ring-blue-500',
        )}
        style={{
          width: canvasWidth,
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

      {/* Moveable handles drag + scale in arrange mode.
          DOM manipulation during interaction for performance, store update on release. */}
      {arrangeMode && (
        <Moveable
          target={targetRef}
          draggable
          scalable
          keepRatio
          renderDirections={['nw', 'ne', 'sw', 'se']}
          throttleDrag={0}
          throttleScale={0}
          onDragStart={() => {
            onBringToFront(card.id)
          }}
          onDrag={e => {
            e.target.style.transform = e.transform
          }}
          onDragEnd={e => {
            if (!e.lastEvent) return
            const [tx, ty] = e.lastEvent.translate
            onUpdate(card.id, {
              x: Math.max(0, (tx / canvasWidth) * 100),
              y: Math.max(0, (ty / canvasHeight) * 100),
            })
          }}
          onScaleStart={e => {
            onBringToFront(card.id)
            // Min 80px visual width, max canvas width
            e.setMinScaleSize([80, 0])
            e.setMaxScaleSize([canvasWidth, Infinity])
          }}
          onScale={e => {
            e.target.style.transform = e.drag.transform
          }}
          onScaleEnd={e => {
            if (!e.lastEvent) return
            const [sx] = e.lastEvent.scale
            const [tx, ty] = e.lastEvent.drag.translate
            onUpdate(card.id, {
              width: Math.max(15, Math.min(100, sx * 100)),
              x: Math.max(0, (tx / canvasWidth) * 100),
              y: Math.max(0, (ty / canvasHeight) * 100),
            })
          }}
        />
      )}
    </>
  )
}
