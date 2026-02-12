'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Move, MousePointer } from 'lucide-react'
import type { Card } from '@/types/card'
import type { ScatterPosition, ScatterLayouts } from '@/types/scatter'
import type { ThemeId } from '@/types/theme'
import { useThemeStore } from '@/stores/theme-store'
import { usePageStore } from '@/stores/page-store'
import { useMediaQuery } from '@/hooks/use-media-query'
import { ScatterCard } from './scatter-card'

interface ScatterCanvasProps {
  cards: Card[]
}

export function ScatterCanvas({ cards: propCards }: ScatterCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [referenceHeight, setReferenceHeight] = useState(0)  // Width-based reference for y-coordinate mapping (matches public page)
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [arrangeMode, setArrangeMode] = useState(true)

  // Touch device detection for tap-to-toggle resize
  const isTouchDevice = useMediaQuery('(pointer: coarse)')
  // On touch: activeCardId means "this card is in resize mode". null = all cards draggable.
  const [resizeCardId, setResizeCardId] = useState<string | null>(null)

  // Reset resize card when arrange mode changes
  useEffect(() => {
    setResizeCardId(null)
  }, [arrangeMode])

  // Local cards state — merges prop updates with scatter position changes.
  // This ensures React rendering matches Moveable's DOM state immediately,
  // without waiting for the async STATE_UPDATE echo from the editor.
  const [localCards, setLocalCards] = useState(propCards)

  // Sync from props when they change (e.g. card added/removed, editor property changes)
  useEffect(() => {
    setLocalCards(propCards)
  }, [propCards])

  // Read from stores
  const themeId = useThemeStore((state) => state.themeId)
  const selectedCardId = usePageStore((state) => state.selectedCardId)
  const updateCardScatterPosition = usePageStore((state) => state.updateCardScatterPosition)
  const selectCard = usePageStore((state) => state.selectCard)

  // referenceHeight is derived from canvasWidth so the coordinate system
  // is purely width-relative. This ensures the preview iframe (375×667)
  // produces identical positions to the public page (real viewport).
  useEffect(() => {
    if (canvasWidth > 0) {
      setReferenceHeight(canvasWidth)
    }
  }, [canvasWidth])

  // Measure canvas width with ResizeObserver (for x-coordinate mapping)
  useEffect(() => {
    if (!canvasRef.current) return

    const updateWidth = () => {
      if (canvasRef.current) {
        setCanvasWidth(canvasRef.current.getBoundingClientRect().width)
      }
    }

    updateWidth()

    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(canvasRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Calculate max z-index from all cards for current theme
  useEffect(() => {
    let max = 0
    localCards.forEach((card) => {
      const scatterLayouts = (card.content.scatterLayouts as Record<string, { zIndex: number }>) || {}
      const pos = scatterLayouts[themeId]
      if (pos && pos.zIndex > max) {
        max = pos.zIndex
      }
    })
    setMaxZIndex(max)
  }, [localCards, themeId])

  // Send scatter position update to local state + store + parent editor
  const sendScatterUpdate = useCallback((cardId: string, position: Partial<ScatterPosition>) => {
    // Update local cards immediately so React state matches Moveable's DOM.
    // This is critical for mode switching — when Moveable unmounts (Edit mode),
    // React re-renders from localCards, which must have the latest positions.
    setLocalCards(prev => prev.map(card => {
      if (card.id !== cardId) return card
      const currentLayouts = (card.content.scatterLayouts as ScatterLayouts) || {}
      const currentPosition = currentLayouts[themeId as ThemeId]
      return {
        ...card,
        content: {
          ...card.content,
          scatterLayouts: {
            ...currentLayouts,
            [themeId]: {
              ...currentPosition,
              ...position,
            }
          }
        }
      }
    }))

    // Update page store (for auto-save)
    updateCardScatterPosition(cardId, themeId, position)

    // Notify parent editor
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SCATTER_POSITION_UPDATE', payload: { cardId, themeId, position } },
        window.location.origin
      )
    }
  }, [themeId, updateCardScatterPosition])

  // Unified update callback — ScatterCard calls this on drag/scale end
  const handleUpdate = useCallback((cardId: string, position: Partial<ScatterPosition>) => {
    sendScatterUpdate(cardId, position)
  }, [sendScatterUpdate])

  // Handle card selection — notify parent for property editing
  const handleSelect = useCallback((cardId: string) => {
    selectCard(cardId)
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'SELECT_CARD', payload: { cardId } },
        window.location.origin
      )
    }
  }, [selectCard])

  // Handle card tap — delegates to select in edit mode, toggles resize on touch in arrange mode
  const handleCardTap = useCallback((cardId: string) => {
    if (!arrangeMode) {
      handleSelect(cardId)
      return
    }

    if (isTouchDevice) {
      if (resizeCardId === cardId) {
        // Same card already in resize → back to all-drag
        setResizeCardId(null)
      } else {
        // Tap card → enter resize mode for this card
        setResizeCardId(cardId)
      }
    }
    // Desktop: no action needed on tap in arrange mode (drag/resize always active)
  }, [arrangeMode, isTouchDevice, resizeCardId, handleSelect])

  // Handle canvas background click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (arrangeMode) {
        // Clear resize card on touch devices → back to all-drag
        setResizeCardId(null)
      } else {
        selectCard(null)
        if (window.parent !== window) {
          window.parent.postMessage(
            { type: 'SELECT_CARD', payload: { cardId: null } },
            window.location.origin
          )
        }
      }
    }
  }, [selectCard, arrangeMode])

  // Filter visible cards only
  const visibleCards = localCards.filter((card) => card.is_visible)

  // Dynamic min-height: at least viewport, grows to contain all cards
  const dynamicMinHeight = useMemo(() => {
    if (referenceHeight === 0) return '100vh'
    let maxBottom = 0
    localCards.forEach(card => {
      if (!card.is_visible) return
      const layouts = (card.content.scatterLayouts as Record<string, ScatterPosition>) || {}
      const pos = layouts[themeId]
      if (pos) {
        const pixelY = (pos.y / 100) * referenceHeight
        maxBottom = Math.max(maxBottom, pixelY + referenceHeight * 0.5)
      }
    })
    // Use CSS max() so canvas is always at least viewport height
    return maxBottom > 0 ? `max(100vh, ${maxBottom}px)` : '100vh'
  }, [localCards, themeId, referenceHeight])

  return (
    <div
      ref={canvasRef}
      className="relative w-full select-none"
      style={{ minHeight: dynamicMinHeight, touchAction: arrangeMode ? 'none' : 'auto', WebkitUserSelect: 'none' } as React.CSSProperties}
      onClick={(e) => {
        e.stopPropagation()
        handleCanvasClick(e)
      }}
    >
      {/* Grid overlay — only in arrange mode */}
      {arrangeMode && (
        <div className="absolute inset-0 pointer-events-none z-[999]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
              `,
              backgroundSize: '8.333% 8.333%',
            }}
          />
        </div>
      )}

      {/* Mode toggle button + touch hint */}
      <div className="fixed bottom-6 left-6 z-[1000] flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setArrangeMode((prev) => !prev)
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors text-sm font-medium"
          style={{
            backgroundColor: arrangeMode ? 'hsl(217 91% 60%)' : 'hsl(0 0% 15%)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {arrangeMode ? (
            <>
              <Move className="h-4 w-4" />
              Arrange
            </>
          ) : (
            <>
              <MousePointer className="h-4 w-4" />
              Edit
            </>
          )}
        </button>

        {/* Touch mode hint — only shown when a card is in resize mode */}
        {isTouchDevice && arrangeMode && resizeCardId && (
          <span
            className="px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
            style={{
              backgroundColor: 'hsl(25 95% 53%)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Resize mode &mdash; tap again to drag
          </span>
        )}
      </div>

      {/* Render scatter cards with react-moveable */}
      {canvasWidth > 0 && referenceHeight > 0 && visibleCards.map((card, index) => {
        const isResizing = resizeCardId === card.id
        return (
          <ScatterCard
            key={card.id}
            card={card}
            cardIndex={index}
            totalCards={visibleCards.length}
            themeId={themeId}
            canvasWidth={canvasWidth}
            referenceHeight={referenceHeight}
            maxZIndex={maxZIndex}
            isSelected={selectedCardId === card.id}
            arrangeMode={arrangeMode}
            isDragMode={arrangeMode && (isTouchDevice ? !isResizing : true)}
            isResizeMode={arrangeMode && (isTouchDevice ? isResizing : true)}
            isTouchDevice={isTouchDevice}
            onUpdate={handleUpdate}
            onTap={handleCardTap}
          />
        )
      })}
    </div>
  )
}
