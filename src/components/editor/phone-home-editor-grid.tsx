'use client'

import { useMemo, useState, useCallback } from 'react'
import { DndContext, DragOverlay, useDraggable, useDroppable, type DragEndEvent, type DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { usePageStore } from '@/stores/page-store'
import { useThemeStore } from '@/stores/theme-store'
import { sortCardsBySortKey } from '@/lib/ordering'
import type { Card, PhoneHomeLayout } from '@/types/card'
import { cn } from '@/lib/utils'

const GRID_COLS = 4
const MAX_ROWS = 6

// Fallback icon colors + emoji per card type (same as public layout)
const FALLBACK_ICONS: Record<string, { emoji: string; bg: string }> = {
  hero:               { emoji: '🖼', bg: 'linear-gradient(135deg, #FF6B6B, #EE5A24)' },
  horizontal:         { emoji: '🔗', bg: 'linear-gradient(135deg, #4ECDC4, #2ECC71)' },
  square:             { emoji: '📷', bg: 'linear-gradient(135deg, #A29BFE, #6C5CE7)' },
  video:              { emoji: '▶️', bg: 'linear-gradient(135deg, #FF4757, #C44569)' },
  gallery:            { emoji: '🏞', bg: 'linear-gradient(135deg, #FFA502, #FF6348)' },
  game:               { emoji: '🎮', bg: 'linear-gradient(135deg, #7BED9F, #2ED573)' },
  audio:              { emoji: '🎵', bg: 'linear-gradient(135deg, #FC5C7D, #6A82FB)' },
  music:              { emoji: '🎧', bg: 'linear-gradient(135deg, #E91E63, #9C27B0)' },
  'social-icons':     { emoji: '👤', bg: 'linear-gradient(135deg, #00B4DB, #0083B0)' },
  link:               { emoji: '🌐', bg: 'linear-gradient(135deg, #667EEA, #764BA2)' },
  mini:               { emoji: '📌', bg: 'linear-gradient(135deg, #F7971E, #FFD200)' },
  text:               { emoji: '📝', bg: 'linear-gradient(135deg, #89F7FE, #66A6FF)' },
  'email-collection': { emoji: '✉️', bg: 'linear-gradient(135deg, #F093FB, #F5576C)' },
  release:            { emoji: '💿', bg: 'linear-gradient(135deg, #4FACFE, #00F2FE)' },
}

// Draggable icon
function DraggableIcon({ card, onClick }: { card: Card; onClick: (card: Card) => void }) {
  const content = card.content as Record<string, unknown>
  const appIconUrl = content.appIconUrl as string | undefined
  const imageUrl = content.imageUrl as string | undefined
  const fallback = FALLBACK_ICONS[card.card_type] ?? FALLBACK_ICONS.link
  const iconSrc = appIconUrl || imageUrl

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: card.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30',
      )}
      onClick={() => onClick(card)}
    >
      <div
        className="w-[48px] h-[48px] rounded-[11px] overflow-hidden flex items-center justify-center"
        style={iconSrc ? undefined : { background: fallback.bg }}
      >
        {iconSrc ? (
          <img src={iconSrc} alt={card.title || ''} className="w-full h-full object-cover" draggable={false} />
        ) : (
          <span className="text-[20px] select-none">{fallback.emoji}</span>
        )}
      </div>
      <span className="text-[9px] text-center truncate max-w-[56px] text-muted-foreground">
        {card.title || card.card_type}
      </span>
    </div>
  )
}

// Droppable grid cell
function DroppableCell({ row, col, children }: { row: number; col: number; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${row}-${col}`,
    data: { row, col },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-center min-h-[72px] rounded-lg transition-colors',
        isOver ? 'bg-accent/20 ring-1 ring-accent/40' : 'bg-transparent',
      )}
    >
      {children}
    </div>
  )
}

interface PhoneHomeEditorGridProps {
  onCardSelect: (card: Card) => void
}

export function PhoneHomeEditorGrid({ onCardSelect }: PhoneHomeEditorGridProps) {
  const cards = usePageStore((s) => s.cards)
  const updateCard = usePageStore((s) => s.updateCard)
  const phoneHomeDock = useThemeStore((s) => s.phoneHomeDock)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const sortedCards = useMemo(() => sortCardsBySortKey(cards), [cards])
  const gridCards = useMemo(
    () => sortedCards.filter((c) => c.is_visible && !phoneHomeDock.includes(c.id)),
    [sortedCards, phoneHomeDock],
  )

  // Build grid: map cards to positions
  const grid = useMemo(() => {
    const cellMap = new Map<string, Card>() // "row,col" -> card
    const unplaced: Card[] = []

    for (const card of gridCards) {
      const content = card.content as Record<string, unknown>
      const layout = content.phoneHomeLayout as PhoneHomeLayout | undefined
      if (layout && layout.page === 0) {
        cellMap.set(`${layout.row},${layout.col}`, card)
      } else {
        unplaced.push(card)
      }
    }

    // Auto-place unplaced cards
    for (const card of unplaced) {
      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (!cellMap.has(`${r},${c}`)) {
            cellMap.set(`${r},${c}`, card)
            break
          }
        }
        if ([...cellMap.values()].includes(card)) break
      }
    }

    return cellMap
  }, [gridCards])

  // Find max row used
  const maxRow = useMemo(() => {
    let max = 0
    grid.forEach((_, key) => {
      const r = parseInt(key.split(',')[0])
      if (r > max) max = r
    })
    return Math.min(max + 2, MAX_ROWS) // Show 1 extra row
  }, [grid])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const cardId = active.id as string
    const cellData = over.data.current as { row: number; col: number } | undefined
    if (!cellData) return

    const card = gridCards.find((c) => c.id === cardId)
    if (!card) return

    const content = card.content as Record<string, unknown>
    const currentLayout = (content.phoneHomeLayout as PhoneHomeLayout) ?? { page: 0, row: 0, col: 0, width: 1, height: 1 }

    updateCard(cardId, {
      content: {
        ...content,
        phoneHomeLayout: {
          ...currentLayout,
          row: cellData.row,
          col: cellData.col,
        },
      },
    })
  }, [gridCards, updateCard])

  const activeCard = activeId ? gridCards.find((c) => c.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Drag icons to reorder on the home screen grid.</p>
        <div
          className="grid gap-1 p-2 rounded-lg bg-muted/30 border"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        >
          {Array.from({ length: maxRow * GRID_COLS }).map((_, i) => {
            const row = Math.floor(i / GRID_COLS)
            const col = i % GRID_COLS
            const card = grid.get(`${row},${col}`)

            return (
              <DroppableCell key={`${row}-${col}`} row={row} col={col}>
                {card && <DraggableIcon card={card} onClick={onCardSelect} />}
              </DroppableCell>
            )
          })}
        </div>
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="flex flex-col items-center gap-1 opacity-80">
            <div
              className="w-[48px] h-[48px] rounded-[11px] overflow-hidden flex items-center justify-center shadow-lg"
              style={{
                background: (FALLBACK_ICONS[activeCard.card_type] ?? FALLBACK_ICONS.link).bg,
              }}
            >
              <span className="text-[20px] select-none">
                {(FALLBACK_ICONS[activeCard.card_type] ?? FALLBACK_ICONS.link).emoji}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
