'use client'

import { Rnd } from 'react-rnd'
import type { Card } from '@/types/card'
import type { ScatterPosition } from '@/types/scatter'
import { CardRenderer } from '@/components/cards/card-renderer'
import { cn } from '@/lib/utils'

interface ScatterCardProps {
  card: Card
  themeId: string
  canvasWidth: number
  canvasHeight: number
  maxZIndex: number
  isSelected: boolean
  onDragStop: (cardId: string, x: number, y: number) => void
  onResizeStop: (cardId: string, width: number, height: number, x: number, y: number) => void
  onBringToFront: (cardId: string) => void
  onSelect: (cardId: string) => void
}

export function ScatterCard({
  card,
  themeId,
  canvasWidth,
  canvasHeight,
  maxZIndex,
  isSelected,
  onDragStop,
  onResizeStop,
  onBringToFront,
  onSelect,
}: ScatterCardProps) {
  // Get scatter position for this theme from card content
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId]

  // If no scatter position exists for this theme, don't render (initialization pending)
  if (!scatterPos) {
    return null
  }

  // Convert percentage positions to pixels
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * canvasHeight
  const pixelWidth = (scatterPos.width / 100) * canvasWidth
  const pixelHeight = (scatterPos.height / 100) * canvasHeight

  return (
    <Rnd
      size={{ width: pixelWidth, height: pixelHeight }}
      position={{ x: pixelX, y: pixelY }}
      bounds="parent"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      style={{
        touchAction: 'none',
        zIndex: scatterPos.zIndex,
      }}
      onDragStart={() => {
        onBringToFront(card.id)
        onSelect(card.id)
      }}
      onDragStop={(e, d) => {
        onDragStop(card.id, d.x, d.y)
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(
          card.id,
          ref.offsetWidth,
          ref.offsetHeight,
          position.x,
          position.y
        )
      }}
      onMouseDown={() => onSelect(card.id)}
      onTouchStart={() => onSelect(card.id)}
      resizeHandleClasses={{
        top: 'scatter-resize-handle scatter-resize-handle-top',
        right: 'scatter-resize-handle scatter-resize-handle-right',
        bottom: 'scatter-resize-handle scatter-resize-handle-bottom',
        left: 'scatter-resize-handle scatter-resize-handle-left',
        topRight: 'scatter-resize-handle scatter-resize-handle-corner',
        bottomRight: 'scatter-resize-handle scatter-resize-handle-corner',
        bottomLeft: 'scatter-resize-handle scatter-resize-handle-corner',
        topLeft: 'scatter-resize-handle scatter-resize-handle-corner',
      }}
      className={cn(
        'scatter-card',
        isSelected && 'ring-2 ring-blue-500'
      )}
    >
      <div className="w-full h-full overflow-hidden">
        <CardRenderer card={card} isPreview={true} themeId={themeId} />
      </div>
    </Rnd>
  )
}
