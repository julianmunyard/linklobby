# Phase 6: Advanced Cards - Research

**Researched:** 2026-01-27
**Domain:** Interactive card types (Dropdown container, Game cards), Multi-select grouping
**Confidence:** MEDIUM-HIGH

## Summary

This phase introduces three major features: (1) Dropdown cards that act as containers for other cards with accordion expand/collapse behavior, (2) Game cards with playable retro arcade games (Snake, Breakout, Flappy Bird), and (3) multi-select functionality for grouping cards into dropdowns.

The existing codebase already uses dnd-kit for drag-and-drop with fractional-indexing for ordering. Radix UI Collapsible is already installed and can provide accordion animations with CSS variables. For games, HTML5 Canvas with requestAnimationFrame game loops is the standard approach. The multi-select box selection can use @air/react-drag-to-select.

**Primary recommendation:** Extend dnd-kit's existing setup with multiple SortableContext containers for dropdown nesting, use Radix Collapsible with CSS animations (no framer-motion needed), and implement games as isolated Canvas components with custom hooks for game loops and touch controls.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @dnd-kit/core | ^6.3.1 | Drag and drop foundation | Already in use, supports multiple containers |
| @dnd-kit/sortable | ^10.0.0 | Sortable list presets | Already in use, supports nested contexts |
| @radix-ui/react-collapsible | ^1.1.12 | Accordion expand/collapse | Already installed, provides CSS variables for animation |
| fractional-indexing | (existing) | Card ordering | Already in use for sortKey management |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @air/react-drag-to-select | latest | Box selection / marquee | Multi-select via drag rectangle |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @air/react-drag-to-select | react-selectable-fast | More features but heavier, @air is simpler and performant |
| Radix Collapsible | framer-motion | framer-motion not installed, CSS animations sufficient |
| Custom game engines | Phaser.js/PixiJS | Overkill for simple retro games, adds 200KB+ bundle |

**Installation:**
```bash
npm install @air/react-drag-to-select
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── cards/
│   │   ├── dropdown-card.tsx        # Dropdown container card
│   │   ├── game-card.tsx            # Game card wrapper
│   │   └── games/
│   │       ├── snake-game.tsx       # Snake implementation
│   │       ├── breakout-game.tsx    # Breakout implementation
│   │       ├── flappy-game.tsx      # Flappy Bird implementation
│   │       └── use-game-loop.ts     # Shared game loop hook
│   ├── canvas/
│   │   ├── sortable-card-list.tsx   # Extended for dropdown context
│   │   └── dropdown-sortable.tsx    # Nested sortable for dropdown contents
│   └── editor/
│       ├── multi-select-provider.tsx # Selection state context
│       ├── selection-toolbar.tsx     # Floating action toolbar
│       └── dropdown-card-fields.tsx  # Editor for dropdown properties
├── hooks/
│   ├── use-multi-select.ts          # Selection state management
│   └── use-swipe-controls.ts        # Mobile game controls
└── types/
    └── card.ts                       # Extended for DropdownCardContent, GameCardContent
```

### Pattern 1: Nested dnd-kit Containers
**What:** Dropdowns are containers with their own SortableContext nested inside the main canvas SortableContext
**When to use:** When cards can be dragged between main canvas and dropdown containers
**Example:**
```typescript
// Source: dnd-kit docs - Multiple Containers pattern
// Main DndContext wraps everything
<DndContext
  sensors={sensors}
  collisionDetection={collisionDetectionStrategy}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  {/* Main canvas context */}
  <SortableContext items={mainCanvasCardIds}>
    {cards.map(card => (
      card.card_type === 'dropdown' ? (
        <DropdownCard key={card.id} card={card}>
          {/* Nested context for dropdown contents */}
          <SortableContext items={getDropdownChildIds(card.id)}>
            {getDropdownChildren(card.id).map(child => (
              <SortableCard key={child.id} card={child} />
            ))}
          </SortableContext>
        </DropdownCard>
      ) : (
        <SortableCard key={card.id} card={card} />
      )
    ))}
  </SortableContext>
  <DragOverlay>
    {activeId ? <CardPreview card={findCard(activeId)} /> : null}
  </DragOverlay>
</DndContext>
```

### Pattern 2: Radix Collapsible with CSS Animation
**What:** Animate dropdown expand/collapse using CSS transitions on Radix's CSS variables
**When to use:** Dropdown accordion animation
**Example:**
```typescript
// Source: Radix UI Collapsible docs
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

// CSS (in globals.css or component):
// .dropdown-content[data-state="open"] {
//   animation: slideDown 300ms ease-out;
// }
// .dropdown-content[data-state="closed"] {
//   animation: slideUp 300ms ease-out;
// }
// @keyframes slideDown {
//   from { height: 0; opacity: 0; }
//   to { height: var(--radix-collapsible-content-height); opacity: 1; }
// }
// @keyframes slideUp {
//   from { height: var(--radix-collapsible-content-height); opacity: 1; }
//   to { height: 0; opacity: 0; }
// }

<Collapsible open={isOpen} onOpenChange={setIsOpen}>
  <CollapsibleTrigger className="flex items-center justify-between w-full">
    <span>{card.title} ({childCount} items)</span>
    <ChevronDown className={cn("transition-transform", isOpen && "rotate-180")} />
  </CollapsibleTrigger>
  <CollapsibleContent className="dropdown-content overflow-hidden">
    {children}
  </CollapsibleContent>
</Collapsible>
```

### Pattern 3: Canvas Game Loop Hook
**What:** Reusable hook for requestAnimationFrame-based game loops with pause/resume
**When to use:** All game implementations
**Example:**
```typescript
// Source: Common React game loop pattern
function useGameLoop(
  update: (deltaTime: number) => void,
  draw: (ctx: CanvasRenderingContext2D) => void,
  isPlaying: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameIdRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return

    const ctx = canvasRef.current.getContext('2d')!

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Cap deltaTime to prevent huge jumps after tab switch
      const cappedDelta = Math.min(deltaTime, 100)

      update(cappedDelta)
      draw(ctx)

      frameIdRef.current = requestAnimationFrame(gameLoop)
    }

    frameIdRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
    }
  }, [isPlaying, update, draw])

  return canvasRef
}
```

### Pattern 4: Multi-Select with Box Selection
**What:** Combine @air/react-drag-to-select for box selection with Shift+click for individual toggle
**When to use:** Multi-select mode on desktop
**Example:**
```typescript
// Source: @air/react-drag-to-select docs
import { useSelectionContainer, boxesIntersect } from '@air/react-drag-to-select'

function MultiSelectProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { DragSelection } = useSelectionContainer({
    onSelectionChange: (box) => {
      const selected = new Set<string>()
      document.querySelectorAll('[data-selectable-id]').forEach(el => {
        const rect = el.getBoundingClientRect()
        if (boxesIntersect(box, rect)) {
          selected.add(el.getAttribute('data-selectable-id')!)
        }
      })
      setSelectedIds(selected)
    },
    shouldStartSelecting: (target) => {
      // Don't start box selection on drag handles or interactive elements
      if (target instanceof HTMLElement) {
        return !target.closest('[data-no-select]')
      }
      return true
    },
    selectionProps: {
      style: {
        border: '2px solid white',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
      }
    }
  })

  return (
    <SelectionContext.Provider value={{ selectedIds, setSelectedIds }}>
      <DragSelection />
      {children}
    </SelectionContext.Provider>
  )
}
```

### Anti-Patterns to Avoid
- **Nested DndContext:** Don't nest DndContext - use a single context with multiple SortableContext children
- **Animation with height: auto:** Don't animate to `height: auto` directly - use Radix CSS variables
- **setInterval for game loops:** Don't use setInterval - use requestAnimationFrame for smooth 60fps
- **Storing selection in page-store:** Don't persist selection to database - keep it as transient UI state

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion animation | Custom height animation | Radix Collapsible CSS vars | Radix handles measuring, unmounting, accessibility |
| Box selection | Custom mouse tracking | @air/react-drag-to-select | Near 60fps performance, handles edge cases |
| Swipe detection | Custom touch handlers | Simple vanilla pattern | Only 20 lines, proven pattern |
| Fractional indexing | Custom sort keys | fractional-indexing (existing) | Already in use, handles edge cases |
| Container detection | Custom collision logic | dnd-kit collisionDetection | Built-in strategies, customizable |

**Key insight:** The complexity in this phase is in orchestrating existing primitives correctly, not building new ones. Focus effort on the game implementations which genuinely need custom code.

## Common Pitfalls

### Pitfall 1: dnd-kit Nested Container Collision
**What goes wrong:** Dragging items into nested containers causes jitter or incorrect placement
**Why it happens:** Default collision detection doesn't account for nested container hierarchy
**How to avoid:** Implement custom `collisionDetectionStrategy` that checks container hierarchy first, then falls back to item-level detection. Cache `lastOverId` to prevent layout thrashing.
**Warning signs:** Items "jumping" between containers rapidly during drag

### Pitfall 2: Dropdown State Sync with dnd-kit
**What goes wrong:** Moving cards into/out of dropdowns doesn't update parent_id correctly
**Why it happens:** dnd-kit handles visual ordering but state updates happen separately
**How to avoid:** In `onDragEnd`, detect cross-container moves by comparing source/destination container IDs. Update both `sortKey` AND `parent_id` (or `content.parentDropdownId`) atomically.
**Warning signs:** Cards visually in dropdown but not persisted there after reload

### Pitfall 3: Game Canvas Resize on Card Size Change
**What goes wrong:** Games break or look wrong when card is resized
**Why it happens:** Canvas resolution set once on mount, not updated on resize
**How to avoid:** Use ResizeObserver to detect container size changes, update canvas width/height attributes AND scale game logic accordingly.
**Warning signs:** Blurry games, clipped content, or game physics that don't match visual boundaries

### Pitfall 4: Touch/Click Conflict on Mobile
**What goes wrong:** Games don't receive touch events or cards can't be selected
**Why it happens:** Touch events are captured by wrong handler (dnd-kit vs game vs selection)
**How to avoid:** Game cards in edit mode show static preview only. In preview mode, disable dnd-kit entirely. Use `stopPropagation()` appropriately.
**Warning signs:** Unable to play games on mobile, or unable to edit game cards

### Pitfall 5: Selection State Memory Leak
**What goes wrong:** Selected card IDs reference deleted cards
**Why it happens:** Selection state not cleaned up when cards are removed
**How to avoid:** Subscribe to card deletion events, filter out deleted IDs from selection set immediately.
**Warning signs:** Console errors about missing cards, stale selections

## Code Examples

Verified patterns from official sources:

### Dropdown Card Content Type
```typescript
// Extend types/card.ts
export interface DropdownCardContent {
  headerText?: string        // Custom header (default: card.title)
  expandText?: string        // "Show more" (optional)
  collapseText?: string      // "Show less" (optional)
  childCardIds: string[]     // IDs of cards inside this dropdown
}
```

### Game Card Content Type
```typescript
// Extend types/card.ts
export type GameType = 'snake' | 'breakout' | 'flappy'

export interface GameCardContent {
  gameType: GameType
}
```

### Simple Swipe Detection Hook
```typescript
// Source: Vanilla JS pattern - works with React
function useSwipeControls(
  onSwipe: (direction: 'up' | 'down' | 'left' | 'right') => void
) {
  const touchStart = useRef({ x: 0, y: 0 })
  const minSwipeDistance = 50

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        onSwipe(deltaX > 0 ? 'right' : 'left')
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        onSwipe(deltaY > 0 ? 'down' : 'up')
      }
    }
  }, [onSwipe])

  return { handleTouchStart, handleTouchEnd }
}
```

### findContainer Helper for dnd-kit
```typescript
// Source: dnd-kit MultipleContainers example pattern
function findContainer(id: string, items: Record<string, string[]>): string | undefined {
  // Check if id IS a container
  if (id in items) return id

  // Otherwise find which container contains this item
  return Object.keys(items).find(key => items[key].includes(id))
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| setInterval game loops | requestAnimationFrame | ~2015 | Smoother animation, battery savings |
| JS height animation | CSS keyframes with CSS vars | Radix pattern | No JS execution during animation |
| react-dnd for nesting | dnd-kit multiple containers | dnd-kit v6+ | Better performance, simpler API |
| Custom marquee selection | @air/react-drag-to-select | 2023 | 60fps performance out of box |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Atlassian deprecated, use dnd-kit
- `framer-motion` for height animations: Overkill when Radix CSS vars work

## Open Questions

Things that couldn't be fully resolved:

1. **Empty Dropdown Drop Detection**
   - What we know: dnd-kit has known issues dropping into empty containers
   - What's unclear: Best workaround - minimum height placeholder? Custom droppable zone?
   - Recommendation: Implement minimum height for empty dropdowns, test thoroughly

2. **Game Card Size Constraints**
   - What we know: Games need minimum playable area, very small cards problematic
   - What's unclear: Exact minimum size per game type
   - Recommendation: Define minimum card size for game type, enforce in editor

3. **Mobile Checkbox Select Implementation**
   - What we know: CONTEXT.md specifies checkbox mode for mobile
   - What's unclear: Exact interaction with existing tap-to-select behavior
   - Recommendation: Separate "select mode" vs "edit mode" toggle in mobile UI

## Sources

### Primary (HIGH confidence)
- dnd-kit official docs (https://docs.dndkit.com/presets/sortable) - SortableContext, multiple containers
- Radix UI Collapsible (https://www.radix-ui.com/primitives/docs/components/collapsible) - CSS animation pattern
- @air/react-drag-to-select GitHub (https://github.com/AirLabsTeam/react-drag-to-select) - API usage

### Secondary (MEDIUM confidence)
- dnd-kit MultipleContainers.tsx story file - Implementation patterns for nested containers
- CSS-Tricks Canvas Snake tutorial - Game loop fundamentals
- GeeksforGeeks React games tutorials (July 2025) - Snake, Flappy Bird patterns

### Tertiary (LOW confidence)
- Community CodeSandbox examples for nested dnd-kit - Need validation
- Various Medium articles on game implementation - Basic patterns, verify details

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Uses existing dependencies, minimal new additions
- Architecture: MEDIUM-HIGH - dnd-kit patterns well-documented, but nested containers complex
- Pitfalls: MEDIUM - Based on documented issues and common patterns
- Game implementation: MEDIUM - Straightforward Canvas patterns, but details need validation

**Research date:** 2026-01-27
**Valid until:** 30 days (stable libraries, established patterns)
