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
  const wrapperRef = useRef<HTMLDivElement>(null)
  const baseWidthRef = useRef<number>(0)
  const baseHeightRef = useRef<number>(0)
  const isDraggingCorner = useRef(false)
  const [baseReady, setBaseReady] = useState(false)

  // Get scatter position for this theme from card content, or compute default
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId] || getDefaultPosition(cardIndex, totalCards, card.card_type)

  // Convert percentage positions to pixels
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * canvasHeight
  const pixelWidth = (scatterPos.width / 100) * canvasWidth

  // Capture base dimensions once — content renders at these dimensions forever,
  // CSS transform: scale() handles all visual resizing (no reflow)
  useEffect(() => {
    if (!contentRef.current) return
    const observer = new ResizeObserver((entries) => {
      if (baseWidthRef.current === 0 && entries[0].contentRect.width > 0) {
        baseWidthRef.current = entries[0].contentRect.width
        baseHeightRef.current = entries[0].contentRect.height
        setBaseReady(true)
      }
    })
    observer.observe(contentRef.current)
    return () => observer.disconnect()
  }, [])

  // Scale factor: stored width / base width
  const scale = baseReady && baseWidthRef.current > 0
    ? pixelWidth / baseWidthRef.current
    : 1
  const visualHeight = baseReady
    ? baseHeightRef.current * scale
    : (scatterPos.height / 100) * canvasHeight

  // Custom corner scale — translate+scale with constant top-left origin
  // During drag: wrapper gets translate(tx,ty) scale(s) to anchor opposite corner
  // On release: commit new position = old position + translate offset (no visual jump)
  const handleCornerDown = useCallback((corner: 'tl' | 'tr' | 'bl' | 'br') => (e: React.PointerEvent) => {
    if (!arrangeMode || !baseReady) return
    e.stopPropagation()
    e.preventDefault()

    isDraggingCorner.current = true
    onBringToFront(card.id)

    const wrapper = wrapperRef.current
    if (!wrapper) return

    const rect = wrapper.getBoundingClientRect()
    const anchorX = corner.includes('l') ? rect.right : rect.left
    const anchorY = corner.includes('t') ? rect.bottom : rect.top
    const startDist = Math.hypot(e.clientX - anchorX, e.clientY - anchorY)
    const startScale = scale
    const bw = baseWidthRef.current
    const bh = baseHeightRef.current

    let finalScale = startScale
    let tx = 0
    let ty = 0

    const onMove = (me: PointerEvent) => {
      const currentDist = Math.hypot(me.clientX - anchorX, me.clientY - anchorY)
      finalScale = Math.max(0.1, startScale * (currentDist / startDist))

      // Translate to keep the opposite corner fixed (origin stays top-left)
      const dScale = startScale - finalScale
      tx = corner.includes('l') ? bw * dScale : 0
      ty = corner.includes('t') ? bh * dScale : 0

      wrapper.style.transform = `translate(${tx}px, ${ty}px) scale(${finalScale})`
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      isDraggingCorner.current = false

      if (Math.abs(finalScale - startScale) < 0.01) {
        wrapper.style.transform = `scale(${startScale})`
        return
      }

      const newW = bw * finalScale
      const newH = bh * finalScale

      // New Rnd position = old position + translate offset, clamped to canvas
      let newX = Math.max(0, Math.min(pixelX + tx, canvasWidth - newW))
      let newY = Math.max(0, Math.min(pixelY + ty, canvasHeight - newH))

      onResizeStop(card.id, newW, newH, newX, newY)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [arrangeMode, baseReady, scale, pixelWidth, pixelX, pixelY, card.id, onResizeStop, onBringToFront])

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
        if (!arrangeMode) return
        onBringToFront(card.id)
      }}
      onDragStop={(e, d) => {
        if (!arrangeMode) return
        onDragStop(card.id, d.x, d.y)
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
      {/* Content wrapper — always at base dimensions, CSS scale for visual resize */}
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          width: baseReady ? baseWidthRef.current : '100%',
          height: baseReady ? baseHeightRef.current : '100%',
          transform: baseReady ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        <div ref={contentRef} className="w-full pointer-events-none">
          <CardRenderer card={card} isPreview={true} themeId={themeId} />
        </div>

        {/* Corner scale handles */}
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
      </div>
    </Rnd>
  )
}
