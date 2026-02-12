'use client'

import { useRef, useCallback } from 'react'
import Moveable from 'react-moveable'
import type { Card } from '@/types/card'
import type { ScatterPosition } from '@/types/scatter'
import { CardRenderer } from '@/components/cards/card-renderer'
import { cn } from '@/lib/utils'

interface ScatterCardProps {
  card: Card
  cardIndex: number
  totalCards: number
  themeId: string
  canvasWidth: number
  referenceHeight: number  // Width-based reference for y-coordinate mapping (equals canvasWidth for consistency)
  maxZIndex: number
  isSelected: boolean
  arrangeMode: boolean
  isDragMode: boolean
  isResizeMode: boolean
  isTouchDevice: boolean
  onUpdate: (cardId: string, position: Partial<ScatterPosition>) => void
  onTap: (cardId: string) => void
}

// Card types that need full interactivity (touch/mouse events pass through)
const INTERACTIVE_CARD_TYPES = new Set(['gallery', 'video', 'game', 'social-icons', 'audio'])

// Default width for a card in scatter mode — matches flow grid sizing
// so toggling freeform doesn't change visual card sizes.
function getDefaultWidth(card: Card): number {
  if (card.card_type === 'text' || card.card_type === 'social-icons') return 100
  if (card.card_type === 'mini') return 20
  if (card.card_type === 'link' || card.card_type === 'horizontal') return 100
  return card.size !== 'small' ? 100 : 48
}

function getDefaultPosition(cardIndex: number, card: Card): ScatterPosition {
  // Fallback for cards added while scatter mode is already active.
  // Places cards in a vertical stack at the top.
  const width = getDefaultWidth(card)
  return {
    x: 0,
    y: 5 + cardIndex * 15,
    width,
    height: 10,
    zIndex: cardIndex,
  }
}

export function ScatterCard({
  card,
  cardIndex,
  totalCards,
  themeId,
  canvasWidth,
  referenceHeight,
  maxZIndex,
  isSelected,
  arrangeMode,
  isDragMode,
  isResizeMode,
  isTouchDevice,
  onUpdate,
  onTap,
}: ScatterCardProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  // Cache element dimensions on drag/scale start to avoid per-frame DOM reads
  const cachedDims = useRef({ w: 0, h: 0 })

  // Content-only cards (text, social-icons) use fit-content so the Moveable
  // bounding box wraps the actual visible content, not a full-width container.
  // For these, width in ScatterPosition is a scale multiplier (100 = 1x natural size).
  // For regular cards, width is a % of canvas and the card renders at canvasWidth.
  const isFitContent = card.card_type === 'text' || card.card_type === 'social-icons'
  const isInteractive = INTERACTIVE_CARD_TYPES.has(card.card_type)

  // Get scatter position for this theme, or compute a default grid position
  const scatterLayouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
  const scatterPos = scatterLayouts[themeId] || getDefaultPosition(cardIndex, card)

  // Convert percentage positions to pixels
  // x maps to canvas width; y maps to referenceHeight (equals canvasWidth for consistency)
  const pixelX = (scatterPos.x / 100) * canvasWidth
  const pixelY = (scatterPos.y / 100) * referenceHeight
  // Scale: width as fraction (1.0 = full canvas for regular, 1.0 = natural size for fit-content)
  const scale = scatterPos.width / 100

  // Ring color: on touch, blue for drag, orange for resize. On desktop, blue when selected.
  const showRing = arrangeMode && (isDragMode || isResizeMode || isSelected)
  const ringColor = isTouchDevice && (isDragMode || isResizeMode)
    ? (isResizeMode ? 'ring-orange-500' : 'ring-blue-500')
    : 'ring-blue-500'

  // Cursor: depends on mode (interactive cards keep their own cursors)
  const cursor = isInteractive
    ? undefined
    : isDragMode
      ? 'grab'
      : isResizeMode
        ? 'nwse-resize'
        : 'pointer'

  // --- Custom pointer-based drag for interactive cards ---
  // Moveable's Gesto library calls preventDefault() on pointer events by default,
  // which kills click events on audio controls (play/pause, seek, etc.).
  // Instead of fighting Moveable, we implement drag ourselves on the handle element.
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isDragMode || !targetRef.current) return
    e.preventDefault()
    e.stopPropagation()

    const el = targetRef.current
    const startX = e.clientX
    const startY = e.clientY
    const elW = el.offsetWidth
    let moved = false
    let lastTx = pixelX
    let lastTy = pixelY

    el.style.zIndex = '9999'

    const onMove = (me: PointerEvent) => {
      moved = true
      const dx = me.clientX - startX
      const dy = me.clientY - startY
      const tx = pixelX + dx
      const ty = pixelY + dy
      const visualW = elW * scale
      const maxTx = Math.max(0, canvasWidth - visualW)
      const cx = Math.max(0, Math.min(maxTx, tx))
      const cy = Math.max(0, ty)
      lastTx = cx
      lastTy = cy
      el.style.transform = `translate(${cx}px, ${cy}px) scale(${scale})`
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)

      if (!moved) {
        // No movement — treat as tap (toggle resize on touch)
        el.style.zIndex = String(scatterPos.zIndex)
        onTap(card.id)
        return
      }

      el.style.transform = `translate(${lastTx}px, ${lastTy}px) scale(${scale})`
      onUpdate(card.id, {
        x: (lastTx / canvasWidth) * 100,
        y: (lastTy / referenceHeight) * 100,
        zIndex: maxZIndex + 1,
      })
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [isDragMode, pixelX, pixelY, scale, canvasWidth, referenceHeight, scatterPos.zIndex, maxZIndex, card.id, onUpdate, onTap])

  // Should Moveable render? For interactive cards, ONLY in resize mode (never drag).
  // Moveable's event interception (preventDefault on Gesto) blocks audio/video controls.
  const showMoveable = isInteractive
    ? isResizeMode
    : (isDragMode || isResizeMode)

  return (
    <>
      <div
        ref={targetRef}
        className={cn(
          'scatter-card absolute select-none',
          showRing && `ring-3 ${ringColor}`,
        )}
        style={{
          width: isFitContent ? 'fit-content' : canvasWidth,
          maxWidth: isFitContent ? canvasWidth : undefined,
          transform: `translate(${pixelX}px, ${pixelY}px) scale(${scale})`,
          transformOrigin: 'top left',
          zIndex: scatterPos.zIndex,
          cursor,
          touchAction: arrangeMode ? 'none' : 'auto',
          WebkitUserSelect: 'none',
          willChange: 'transform',
        }}
        onClick={isInteractive ? undefined : () => onTap(card.id)}
      >
        {isInteractive ? (
          <>
            {/* Drag handle — visible in arrange mode so interactive cards can be moved
                while keeping their controls (play/pause, seek, etc.) accessible.
                Uses custom pointer events instead of Moveable to avoid preventDefault killing clicks. */}
            {arrangeMode && (
              <div
                className="cursor-grab active:cursor-grabbing flex items-center justify-center py-1.5"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
              >
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>
            )}
            <div className="relative">
              <CardRenderer card={card} isPreview={true} themeId={themeId} />
              {/* Selection overlay — edit mode only, removed when selected */}
              {!arrangeMode && !isSelected && (
                <div
                  className="absolute inset-0 z-[5] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTap(card.id)
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <div style={{ pointerEvents: 'none' }}>
            <CardRenderer card={card} isPreview={true} themeId={themeId} />
          </div>
        )}
      </div>

      {showMoveable && (
        <Moveable
          target={targetRef}
          draggable={isInteractive ? false : isDragMode}
          scalable={isResizeMode}
          keepRatio={isResizeMode}
          renderDirections={isResizeMode ? ['nw', 'ne', 'sw', 'se'] : []}
          // On touch devices: expand the invisible hit area around corner handles
          // and allow grabbing any edge to resize (much easier than hitting a corner dot)
          edge={isTouchDevice && isResizeMode}
          controlPadding={isTouchDevice ? 24 : 0}
          throttleDrag={0}
          throttleScale={0}
          onDragStart={e => {
            // Cache element dimensions once — used in onDrag for boundary clamping
            // without per-frame DOM reads (which cause layout thrashing + ghost trails).
            const el = e.target as HTMLElement
            cachedDims.current = { w: el.offsetWidth, h: el.offsetHeight }
            // Set z-index via DOM only — NO store update during interaction.
            el.style.zIndex = '9999'
          }}
          onDrag={e => {
            // Real-time boundary clamping using cached dimensions (no DOM reads)
            // Top/left/right: concrete wall. Bottom: no limit (canvas expands).
            const [tx, ty] = e.translate
            const { w } = cachedDims.current
            const visualW = w * scale
            const maxTx = Math.max(0, canvasWidth - visualW)
            const cx = Math.max(0, Math.min(maxTx, tx))
            const cy = Math.max(0, ty)
            e.target.style.transform = `translate(${cx}px, ${cy}px) scale(${scale})`
          }}
          onDragEnd={e => {
            if (!e.lastEvent) {
              (e.target as HTMLElement).style.zIndex = String(scatterPos.zIndex)
              onTap(card.id)
              return
            }
            const [tx, ty] = e.lastEvent.translate
            const { w } = cachedDims.current
            const visualW = w * scale
            const maxTx = Math.max(0, canvasWidth - visualW)
            const cx = Math.max(0, Math.min(maxTx, tx))
            const cy = Math.max(0, ty)
            e.target.style.transform = `translate(${cx}px, ${cy}px) scale(${scale})`
            onUpdate(card.id, {
              x: (cx / canvasWidth) * 100,
              y: (cy / referenceHeight) * 100,
              zIndex: maxZIndex + 1,
            })
          }}
          onScaleStart={e => {
            const el = e.target as HTMLElement
            cachedDims.current = { w: el.offsetWidth, h: el.offsetHeight }
            el.style.zIndex = '9999'
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
            const maxWidth = isFitContent ? 500 : 100
            const newWidth = Math.max(15, Math.min(maxWidth, sx * 100))
            const newScale = newWidth / 100
            const { w } = cachedDims.current
            const visualW = w * newScale
            const maxTx = Math.max(0, canvasWidth - visualW)
            const cx = Math.max(0, Math.min(maxTx, tx))
            const cy = Math.max(0, ty)
            e.target.style.transform = `translate(${cx}px, ${cy}px) scale(${newScale})`
            onUpdate(card.id, {
              width: newWidth,
              x: (cx / canvasWidth) * 100,
              y: (cy / referenceHeight) * 100,
              zIndex: maxZIndex + 1,
            })
          }}
        />
      )}
    </>
  )
}
