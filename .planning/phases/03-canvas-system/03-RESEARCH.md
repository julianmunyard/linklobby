# Phase 3: Canvas System - Research

**Researched:** 2026-01-24
**Domain:** Vertical stack layout, drag-to-reorder, card sizing, database persistence
**Confidence:** HIGH

## Summary

Phase 3 implements a **vertical stack layout** (NOT a free-form 2D canvas) where artists reorder cards by dragging them up/down in a list. Cards stack top-to-bottom in a single column, and the artist controls order via drag-to-reorder. This is a mobile-first layout that renders identically on desktop (just wider).

The recommended approach uses **dnd-kit** for drag-and-drop reordering (the modern, actively-maintained React DnD library), **fractional-indexing** for efficient order persistence (only updates moved cards, not entire list), and **predefined card sizes** (Small/Medium/Large) rather than free resize handles.

Key insight from CONTEXT.md: This is NOT a 2D canvas with free positioning. The `position_x`/`position_y` columns in the database schema are legacy and should be ignored. Only `sort_order` matters for this phase. The implementation focuses on:
1. Vertical stack in preview
2. Drag-to-reorder in editor
3. Predefined size options per card
4. Responsive width (narrower on mobile, wider on desktop)

**Primary recommendation:** Use dnd-kit with @dnd-kit/sortable preset for vertical list reordering, fractional-indexing for database order persistence, and predefined size classes for card sizing.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | latest | Drag-and-drop core | Modern, lightweight (10kb), accessible, React 19 compatible |
| @dnd-kit/sortable | latest | Sortable list preset | Built-in vertical list strategy, handles reordering |
| @dnd-kit/utilities | latest | Transform utilities | CSS.Transform for smooth drag animations |
| fractional-indexing | 3.2.0 | Order persistence | Only update moved items, not all rows |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @dnd-kit/modifiers | latest | Drag constraints | If restricting drag to vertical axis |
| uuid | ^9.0 | Card ID generation | Already in project via Supabase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| dnd-kit | @hello-pangea/dnd | hello-pangea is fork of react-beautiful-dnd, more opinionated but less flexible |
| dnd-kit | pragmatic-drag-and-drop | Atlassian's new headless library, less React-integrated |
| fractional-indexing | Integer sort_order | Integers require updating all subsequent rows on reorder |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities fractional-indexing
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── canvas/
│   │   ├── sortable-card-list.tsx    # DndContext + SortableContext wrapper
│   │   ├── sortable-card.tsx         # Individual draggable card with useSortable
│   │   ├── card-placeholder.tsx      # Visual placeholder during drag
│   │   └── card-size-selector.tsx    # Small/Medium/Large toggle
│   └── editor/
│       └── cards-tab.tsx             # Links tab content with sortable list
├── stores/
│   └── page-store.ts                 # Extended with card ordering
├── lib/
│   └── ordering.ts                   # fractional-indexing helpers
└── types/
    └── card.ts                       # Card interface with sortKey
```

### Pattern 1: Vertical Sortable List with dnd-kit
**What:** Cards render in vertical stack, reorderable via drag
**When to use:** Canvas preview and editor cards list
**Example:**
```typescript
// Source: https://docs.dndkit.com/presets/sortable
"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface SortableCardListProps {
  cards: Card[]
  onReorder: (cards: Card[]) => void
}

export function SortableCardList({ cards, onReorder }: SortableCardListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id)
      const newIndex = cards.findIndex((c) => c.id === over.id)
      onReorder(arrayMove(cards, oldIndex, newIndex))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {cards.map((card) => (
          <SortableCard key={card.id} card={card} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Pattern 2: Sortable Card with Drag Handle
**What:** Individual card with dedicated drag handle for accessibility
**When to use:** Each card in the sortable list
**Example:**
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/usedraggable
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableCardProps {
  card: Card
}

export function SortableCard({ card }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-4 bg-background border rounded-lg"
    >
      {/* Drag handle - attach listeners and attributes here */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none p-1 hover:bg-muted rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Card content - not draggable, just displays info */}
      <div className="flex-1">
        <p className="font-medium">{card.title || 'Untitled'}</p>
        <p className="text-sm text-muted-foreground">{card.card_type}</p>
      </div>
    </div>
  )
}
```

### Pattern 3: Fractional Indexing for Order Persistence
**What:** Generate string keys for ordering without renumbering all rows
**When to use:** When persisting card order to Supabase
**Example:**
```typescript
// Source: https://github.com/rocicorp/fractional-indexing
import { generateKeyBetween } from 'fractional-indexing'

// Initial card creation - append to end
const firstCardSortKey = generateKeyBetween(null, null) // "a0"
const secondCardSortKey = generateKeyBetween(firstCardSortKey, null) // "a1"

// Insert between existing cards
const sortedCards = cards.sort((a, b) =>
  a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
)
const targetIndex = 1 // Insert at position 1
const above = sortedCards[targetIndex - 1]?.sortKey ?? null
const below = sortedCards[targetIndex]?.sortKey ?? null
const newSortKey = generateKeyBetween(above, below) // e.g., "a0V"

// Only need to UPDATE the moved card, not all cards!
await supabase.from('cards').update({ sort_key: newSortKey }).eq('id', movedCardId)
```

### Pattern 4: Predefined Card Sizes
**What:** Small, Medium, Large size options instead of free resize
**When to use:** Card sizing in editor
**Example:**
```typescript
// Card size configuration
const CARD_SIZES = {
  small: {
    label: 'Small',
    height: 'h-24',      // 96px
    maxHeight: 'max-h-24',
  },
  medium: {
    label: 'Medium',
    height: 'h-40',      // 160px
    maxHeight: 'max-h-40',
  },
  large: {
    label: 'Large',
    height: 'h-64',      // 256px
    maxHeight: 'max-h-64',
  },
} as const

type CardSize = keyof typeof CARD_SIZES

// Usage in card component
function CardPreview({ card }: { card: Card }) {
  const sizeConfig = CARD_SIZES[card.size || 'medium']

  return (
    <div className={cn(
      "w-full rounded-lg border bg-card",
      sizeConfig.height,
    )}>
      {/* Card content */}
    </div>
  )
}
```

### Pattern 5: Next.js Hydration Fix for dnd-kit
**What:** Prevent hydration mismatch with SSR
**When to use:** Any component using DndContext
**Example:**
```typescript
// Source: https://github.com/clauderic/dnd-kit/issues/285
"use client"

import { useState, useEffect } from 'react'
import { DndContext } from '@dnd-kit/core'

export function DndProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null or placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-[200px]">{/* Placeholder */}</div>
  }

  return <DndContext>{children}</DndContext>
}
```

### Pattern 6: Canvas Container with Mobile-First Widths
**What:** Single column that adapts width responsively
**When to use:** Preview canvas container
**Example:**
```typescript
// Mobile-first: full width on mobile, constrained on desktop
function CanvasContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-4">
      {children}
    </div>
  )
}

// max-w-md = 448px (good for link-in-bio pages)
// space-y-4 = 16px gap between cards
// px-4 = 16px side margins
```

### Anti-Patterns to Avoid
- **Using position_x/position_y:** The schema has these columns but they're for a 2D canvas we're NOT building. Use sort_key only.
- **Integer sort_order:** Requires updating all cards after the moved one. Use fractional-indexing strings.
- **Full-element drag on mobile:** Use drag handles to preserve scroll behavior.
- **Skipping hydration guard:** DndContext generates different IDs on server/client, causing React warnings.
- **Using react-beautiful-dnd:** Unmaintained since 2022, not compatible with React 19.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop reordering | Custom drag handlers | @dnd-kit/sortable | Accessibility, keyboard support, touch handling |
| Order persistence | Integer positions | fractional-indexing | Only updates moved items, not all rows |
| Keyboard navigation | Custom key handlers | dnd-kit KeyboardSensor | Standardized controls, screen reader support |
| Touch scrolling | Custom touch detection | Drag handles with touch-action:none | Let list scroll, handle drags intentionally |
| Drag transforms | Manual style updates | CSS.Transform from @dnd-kit/utilities | Handles browser quirks, GPU acceleration |

**Key insight:** The vertical sortable list is a solved problem. dnd-kit's sortable preset handles all the edge cases (touch, keyboard, animations, accessibility) that take weeks to build correctly.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch with DndContext
**What goes wrong:** React warning about aria-describedby mismatch between server and client
**Why it happens:** dnd-kit generates unique IDs using useId which differs between SSR and CSR
**How to avoid:** Wrap DndContext in mounted check or use dynamic import with ssr: false
**Warning signs:** Console warnings about "Prop 'aria-describedby' did not match"

### Pitfall 2: Mobile Scrolling Blocked by Drag
**What goes wrong:** Users can't scroll the page on mobile, every touch initiates drag
**Why it happens:** touch-action not set correctly, or set on entire draggable instead of handle
**How to avoid:** Use dedicated drag handle with touch-action: none, let rest of content scroll
**Warning signs:** Page doesn't scroll on mobile, or scrolls erratically

### Pitfall 3: Integer Ordering Causes N Updates
**What goes wrong:** Moving one card requires updating positions of all subsequent cards
**Why it happens:** Using integers 1,2,3... requires renumbering when inserting
**How to avoid:** Use fractional-indexing strings that allow infinite insertions between any two values
**Warning signs:** Slow save times, many database writes on single reorder

### Pitfall 4: Stale Closure in onDragEnd
**What goes wrong:** Card order reverts or updates incorrectly after drag
**Why it happens:** onDragEnd closes over stale cards array
**How to avoid:** Use functional update pattern: setCards(prev => arrayMove(prev, oldIndex, newIndex))
**Warning signs:** Inconsistent reordering, order "jumps back"

### Pitfall 5: Missing Keyboard Support
**What goes wrong:** Keyboard users can't reorder cards
**Why it happens:** Only PointerSensor configured, KeyboardSensor omitted
**How to avoid:** Include both PointerSensor and KeyboardSensor with sortableKeyboardCoordinates
**Warning signs:** Tab doesn't focus drag handles, arrow keys don't move items

### Pitfall 6: Z-Index Confusion
**What goes wrong:** Cards visually overlap during drag or after reorder
**Why it happens:** z-index used for persistent layering instead of just drag visuals
**How to avoid:** Per CONTEXT.md, cards don't overlap. Z-index only elevates actively dragged card.
**Warning signs:** Cards stacking on top of each other, confusing click targets

## Code Examples

Verified patterns from official sources:

### Complete Sortable List Setup
```typescript
// Source: https://docs.dndkit.com/presets/sortable
"use client"

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableCard } from './sortable-card'
import type { Card } from '@/types/card'

interface SortableCardListProps {
  cards: Card[]
  onReorder: (cards: Card[]) => void
}

export function SortableCardList({ cards, onReorder }: SortableCardListProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id)
      const newIndex = cards.findIndex((c) => c.id === over.id)
      onReorder(arrayMove(cards, oldIndex, newIndex))
    }
  }

  // Hydration guard
  if (!mounted) {
    return (
      <div className="space-y-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="h-16 bg-muted rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
```

### SortableCard with Drag Handle
```typescript
// Source: https://docs.dndkit.com/api-documentation/draggable/usedraggable
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Card } from '@/types/card'

interface SortableCardProps {
  card: Card
}

export function SortableCard({ card }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border rounded-lg",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      {/* Drag handle with touch-action: none for mobile */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1.5 -m-1.5 hover:bg-muted rounded"
        aria-label={`Drag to reorder ${card.title || 'card'}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Card content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{card.title || 'Untitled'}</p>
        <p className="text-sm text-muted-foreground capitalize">
          {card.card_type.replace('_', ' ')}
        </p>
      </div>
    </div>
  )
}
```

### Fractional Indexing Helpers
```typescript
// Source: https://github.com/rocicorp/fractional-indexing
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing'
import type { Card } from '@/types/card'

/**
 * Generate a sort key for a new card at the end of the list
 */
export function generateAppendKey(cards: Card[]): string {
  if (cards.length === 0) {
    return generateKeyBetween(null, null)
  }
  const sorted = sortCardsBySortKey(cards)
  const lastKey = sorted[sorted.length - 1].sortKey
  return generateKeyBetween(lastKey, null)
}

/**
 * Generate a sort key for inserting at a specific index
 */
export function generateInsertKey(cards: Card[], targetIndex: number): string {
  const sorted = sortCardsBySortKey(cards)
  const above = targetIndex > 0 ? sorted[targetIndex - 1].sortKey : null
  const below = targetIndex < sorted.length ? sorted[targetIndex].sortKey : null
  return generateKeyBetween(above, below)
}

/**
 * Generate a new sort key after moving a card
 */
export function generateMoveKey(
  cards: Card[],
  movedCardId: string,
  newIndex: number
): string {
  // Filter out the moved card, then find neighbors at new position
  const otherCards = cards.filter((c) => c.id !== movedCardId)
  const sorted = sortCardsBySortKey(otherCards)

  const above = newIndex > 0 ? sorted[newIndex - 1]?.sortKey ?? null : null
  const below = sorted[newIndex]?.sortKey ?? null

  return generateKeyBetween(above, below)
}

/**
 * Sort cards by their sort key using string comparison
 */
export function sortCardsBySortKey(cards: Card[]): Card[] {
  return [...cards].sort((a, b) =>
    a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
  )
}
```

### Card Type Definition
```typescript
// types/card.ts
export type CardType =
  | 'hero'
  | 'horizontal'
  | 'square'
  | 'video'
  | 'gallery'
  | 'dropdown'
  | 'game'
  | 'audio'

export type CardSize = 'small' | 'medium' | 'large'

export interface Card {
  id: string
  page_id: string
  card_type: CardType
  title: string | null
  description: string | null
  url: string | null
  content: Record<string, unknown>
  size: CardSize
  sortKey: string  // fractional-indexing key for ordering
  is_visible: boolean
  created_at: string
  updated_at: string
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | dnd-kit | 2022 (rbd unmaintained) | dnd-kit is actively maintained, React 19 compatible |
| Integer sort positions | Fractional indexing | 2023+ (popularized by Figma) | Single-row updates instead of N updates |
| Free-form 2D canvas | Vertical stack | CONTEXT.md decision | Simpler, mobile-first, better UX |
| CSS drag transforms | @dnd-kit/utilities CSS.Transform | 2024 | Handles browser quirks automatically |

**Deprecated/outdated:**
- react-beautiful-dnd: Unmaintained, no React 19 support
- Integer-based sort_order: Inefficient for frequent reordering
- 2D position_x/position_y: Not used in vertical stack layout

## Open Questions

Things that couldn't be fully resolved:

1. **Canvas max-width decision (Claude's discretion per CONTEXT.md)**
   - What we know: Mobile-first single column
   - Options: max-w-md (448px), max-w-lg (512px), full-width with padding
   - Recommendation: Start with max-w-md, matches typical link-in-bio feel

2. **Card gap/spacing (Claude's discretion per CONTEXT.md)**
   - What we know: Cards should have visual separation
   - Options: space-y-3 (12px), space-y-4 (16px), space-y-6 (24px)
   - Recommendation: space-y-4 (16px) - balanced, not too dense

3. **Database migration for sortKey**
   - What we know: Current schema has integer sort_order
   - Options: Add sort_key TEXT column, migrate existing data, drop sort_order
   - Recommendation: Add sort_key column, keep sort_order as fallback initially

## Sources

### Primary (HIGH confidence)
- [dnd-kit Documentation](https://docs.dndkit.com) - Sortable preset, useSortable hook, accessibility
- [dnd-kit Sortable](https://docs.dndkit.com/presets/sortable) - verticalListSortingStrategy, arrayMove
- [dnd-kit Accessibility](https://docs.dndkit.com/guides/accessibility) - Keyboard support, screen readers
- [fractional-indexing GitHub](https://github.com/rocicorp/fractional-indexing) - generateKeyBetween API
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design) - Mobile-first breakpoints

### Secondary (MEDIUM confidence)
- [Steve Ruiz: Fractional Indexing](https://www.steveruiz.me/posts/reordering-fractional-indices) - Practical implementation guide
- [dnd-kit Hydration Fix](https://github.com/clauderic/dnd-kit/issues/285) - Next.js SSR workaround
- [Puck Editor Blog: Top 5 DnD Libraries](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - Library comparison 2026

### Tertiary (LOW confidence)
- [Dave Gray React DnD Example](https://www.davegray.codes/posts/missing-example-for-react-drag-n-drop) - Sequence value pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - dnd-kit is the clear winner for React 19, well-documented
- Architecture: HIGH - Patterns verified from official docs and production apps
- Pitfalls: HIGH - Common issues well-documented in GitHub issues/discussions
- Fractional indexing: HIGH - Used by Figma, Notion, documented by library authors

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable domain)
