'use client'

import { useEffect, useRef, useState } from 'react'
import { Rnd } from 'react-rnd'
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
  onDragStop: (cardId: string, x: number, y: number) => void
  onResizeStop: (cardId: string, width: number, height: number, x: number, y: number) => void
  onBringToFront: (cardId: string) => void
  onSelect: (cardId: string) => void
}

function getDefaultPosition(cardIndex: number, totalCards: number, cardType: string): ScatterPosition {
  const defaults = DEFAULT_SCATTER_SIZES[cardType] || { width: 30, height: 20 }
  const cols = Math.ceil(Math.sqrt(totalCards))
  const row = Math.floor(cardIndex / cols)
  const col = cardIndex % cols
  const spacingX = 10
  const spacingY = 10

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
  onDragStop,
  onResizeStop,
  onBringToFront,
  onSelect,
}: ScatterCardProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  // Get scatter position for this theme from card content, or compute default
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId] || getDefaultPosition(cardIndex, totalCards, card.card_type)

  // Convert percentage positions to pixels
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * canvasHeight
  const pixelWidth = (scatterPos.width / 100) * canvasWidth

  // Measure actual content height so Rnd container fits the card exactly
  useEffect(() => {
    if (!contentRef.current) return
    const measure = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [pixelWidth, card.content, card.card_type])

  // Use measured height, falling back to stored percentage height until measured
  const pixelHeight = contentHeight ?? (scatterPos.height / 100) * canvasHeight

  const noResize = {
    top: false, right: false, bottom: false, left: false,
    topRight: false, bottomRight: false, bottomLeft: false, topLeft: false,
  }

  const cornerOnly = {
    top: false, right: false, bottom: false, left: false,
    topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
  }

  return (
    <Rnd
      size={{ width: pixelWidth, height: pixelHeight }}
      position={{ x: pixelX, y: pixelY }}
      bounds="parent"
      lockAspectRatio={arrangeMode}
      disableDragging={!arrangeMode}
      enableResizing={arrangeMode ? cornerOnly : noResize}
      style={{
        touchAction: arrangeMode ? 'none' : 'auto',
        zIndex: scatterPos.zIndex,
        cursor: arrangeMode ? 'grab' : 'pointer',
      }}
      onDragStart={() => {
        if (!arrangeMode) return
        onBringToFront(card.id)
      }}
      onDragStop={(e, d) => {
        if (!arrangeMode) return
        onDragStop(card.id, d.x, d.y)
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!arrangeMode) return
        onResizeStop(
          card.id,
          ref.offsetWidth,
          ref.offsetHeight,
          position.x,
          position.y
        )
      }}
      onMouseDown={() => {
        if (!arrangeMode) {
          onSelect(card.id)
        }
      }}
      onTouchStart={() => {
        if (!arrangeMode) {
          onSelect(card.id)
        }
      }}
      resizeHandleClasses={arrangeMode ? {
        topRight: 'scatter-resize-handle scatter-resize-handle-corner scatter-resize-handle-tr',
        bottomRight: 'scatter-resize-handle scatter-resize-handle-corner scatter-resize-handle-br',
        bottomLeft: 'scatter-resize-handle scatter-resize-handle-corner scatter-resize-handle-bl',
        topLeft: 'scatter-resize-handle scatter-resize-handle-corner scatter-resize-handle-tl',
      } : undefined}
      className={cn(
        'scatter-card',
        isSelected && 'ring-2 ring-blue-500'
      )}
    >
      <div ref={contentRef} className="w-full pointer-events-none">
        <CardRenderer card={card} isPreview={true} themeId={themeId} />
      </div>
    </Rnd>
  )
}
