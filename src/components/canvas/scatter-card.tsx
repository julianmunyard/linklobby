'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  onDragStop,
  onResizeStop,
  onBringToFront,
  onSelect,
}: ScatterCardProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  // Get scatter position for this theme from card content, or compute default
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId] || getDefaultPosition(cardIndex, totalCards, card.card_type)

  // Convert percentage positions to pixels
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * canvasHeight
  const pixelWidth = (scatterPos.width / 100) * canvasWidth

  // Content renders at full canvasWidth, CSS-scaled to pixelWidth.
  // This ensures cards always render at full fidelity regardless of target size.
  const scale = canvasWidth > 0 ? pixelWidth / canvasWidth : 1

  // Measure content height (at full canvasWidth rendering)
  useEffect(() => {
    if (!contentRef.current) return
    const observer = new ResizeObserver((entries) => {
      const h = entries[0].contentRect.height
      if (h > 0) setContentHeight(h)
    })
    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  // Visual height = full-width content height × scale
  const visualHeight = contentHeight > 0
    ? contentHeight * scale
    : (scatterPos.height / 100) * canvasHeight

  // Corner scale: DOM manipulation during drag, store update on release.
  // Uses translate+scale with constant top-left origin to anchor opposite corner.
  const handleCornerDown = useCallback((corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.PointerEvent) => {
    if (!arrangeMode) return
    e.stopPropagation()
    e.preventDefault()
    onBringToFront(card.id)

    const wrapper = wrapperRef.current
    if (!wrapper) return

    const startClientX = e.clientX
    const startClientY = e.clientY
    const startScale = scale
    const startVisualW = pixelWidth
    const startVisualH = visualHeight

    let finalScale = startScale
    let tx = 0
    let ty = 0

    const onMove = (me: PointerEvent) => {
      let dx = me.clientX - startClientX
      let dy = me.clientY - startClientY

      // For left/top corners, moving left/up increases size
      if (corner.includes('l')) dx = -dx
      if (corner.includes('t')) dy = -dy

      // Use larger delta for uniform scaling
      const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy
      const ratio = Math.max(0.15, (startVisualW + delta) / startVisualW)
      finalScale = startScale * ratio

      // Translate to keep opposite corner fixed (origin stays top-left)
      const dW = startVisualW - startVisualW * ratio
      const dH = startVisualH - startVisualH * ratio
      tx = corner.includes('l') ? dW : 0
      ty = corner.includes('t') ? dH : 0

      wrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${finalScale})`
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)

      // No significant change — reset
      if (Math.abs(finalScale - startScale) < 0.005) {
        wrapper.style.transform = `scale(${startScale})`
        return
      }

      const newW = canvasWidth * finalScale
      const newH = contentHeight * finalScale

      // New position = old position + translate offset, clamped to canvas
      const newX = Math.max(0, Math.min(pixelX + tx, canvasWidth - newW))
      const newY = Math.max(0, Math.min(pixelY + ty, canvasHeight - newH))

      onResizeStop(card.id, newW, newH, newX, newY)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [arrangeMode, scale, pixelWidth, visualHeight, pixelX, pixelY, canvasWidth, canvasHeight, contentHeight, card.id, onResizeStop, onBringToFront])

  return (
    <Rnd
      size={{ width: pixelWidth, height: visualHeight }}
      position={{ x: pixelX, y: pixelY }}
      bounds="parent"
      disableDragging={!arrangeMode}
      enableResizing={false}
      style={{
        touchAction: arrangeMode ? 'none' : 'auto',
        zIndex: scatterPos.zIndex,
        cursor: arrangeMode ? 'grab' : 'pointer',
      }}
      onDragStart={() => {
        if (arrangeMode) onBringToFront(card.id)
      }}
      onDragStop={(e, d) => {
        if (arrangeMode) onDragStop(card.id, d.x, d.y)
      }}
      onMouseDown={() => {
        if (!arrangeMode) onSelect(card.id)
      }}
      onTouchStart={() => {
        if (!arrangeMode) onSelect(card.id)
      }}
      className={cn(
        'scatter-card',
        isSelected && arrangeMode && 'ring-2 ring-blue-500'
      )}
    >
      {/* Content wrapper — renders at full canvasWidth, CSS-scaled to target size.
          pointerEvents:none lets clicks pass through to Rnd for drag/select. */}
      <div
        ref={wrapperRef}
        style={{
          width: canvasWidth,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <div ref={contentRef} className="w-full">
          <CardRenderer card={card} isPreview={true} themeId={themeId} />
        </div>
      </div>

      {/* Corner scale handles — positioned on Rnd container (not inside scaled wrapper) */}
      {arrangeMode && (
        <>
          <div
            className="absolute -top-[7px] -left-[7px] w-[14px] h-[14px] cursor-nwse-resize z-10 bg-white border-2 border-blue-500 rounded-sm shadow-sm"
            onPointerDown={handleCornerDown('tl')}
          />
          <div
            className="absolute -top-[7px] -right-[7px] w-[14px] h-[14px] cursor-nesw-resize z-10 bg-white border-2 border-blue-500 rounded-sm shadow-sm"
            onPointerDown={handleCornerDown('tr')}
          />
          <div
            className="absolute -bottom-[7px] -left-[7px] w-[14px] h-[14px] cursor-nesw-resize z-10 bg-white border-2 border-blue-500 rounded-sm shadow-sm"
            onPointerDown={handleCornerDown('bl')}
          />
          <div
            className="absolute -bottom-[7px] -right-[7px] w-[14px] h-[14px] cursor-nwse-resize z-10 bg-white border-2 border-blue-500 rounded-sm shadow-sm"
            onPointerDown={handleCornerDown('br')}
          />
        </>
      )}
    </Rnd>
  )
}
