---
phase: 03-canvas-system
plan: 03
name: "Sortable Card Components"
completed: 2026-01-24
duration: 82s
subsystem: canvas
tags: [dnd-kit, drag-drop, accessibility, mobile]

dependency-graph:
  requires: ["03-01"]
  provides: ["SortableCardList", "SortableCard", "CanvasContainer"]
  affects: ["03-04", "03-06"]

tech-stack:
  added: []
  patterns: ["hydration-guard", "drag-handle-isolation", "keyboard-accessibility"]

key-files:
  created:
    - src/components/canvas/canvas-container.tsx
    - src/components/canvas/sortable-card.tsx
    - src/components/canvas/sortable-card-list.tsx
  modified: []

decisions:
  - key: "drag-handle-isolation"
    choice: "Separate button with touch-none"
    reason: "Allows mobile users to scroll page without triggering drag"
  - key: "hydration-guard"
    choice: "useState/useEffect pattern"
    reason: "dnd-kit generates different IDs on server vs client"
  - key: "activation-constraint"
    choice: "8px distance"
    reason: "Prevents accidental drags while allowing intentional ones"

metrics:
  tasks: 3/3
  commits: 3
  lines-added: 211
---

# Phase 03 Plan 03: Sortable Card Components Summary

**One-liner:** dnd-kit sortable components with hydration guard, keyboard accessibility, and mobile-safe drag handles

## What Was Built

### CanvasContainer (canvas-container.tsx)
Mobile-first responsive container that centers the card stack:
- `max-w-md` (448px) matches typical link-in-bio width
- Centered with auto margins
- Padding for breathing room
- Accepts `className` prop for customization

### SortableCard (sortable-card.tsx)
Individual draggable card with dedicated drag handle:
- `useSortable` hook integration for drag state
- Separate drag handle button with `touch-none` CSS
- Visual feedback: opacity/shadow when dragging, ring when selected
- Size configuration from `CARD_SIZES` constant
- Accessible aria-label on drag handle

### SortableCardList (sortable-card-list.tsx)
DndContext wrapper with full accessibility support:
- Hydration guard prevents SSR/client mismatch
- `PointerSensor` with 8px activation distance
- `KeyboardSensor` with sortable coordinates
- `verticalListSortingStrategy` for vertical lists
- Empty state UI for zero cards
- Loading skeleton during hydration

## Key Patterns

### Hydration Guard
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])
if (!mounted) return <Skeleton />
```
dnd-kit generates unique IDs that differ between server and client. The hydration guard delays rendering until client-side to prevent React hydration warnings.

### Drag Handle Isolation
```typescript
<button {...attributes} {...listeners} className="touch-none">
  <GripVertical />
</button>
```
By putting `touch-none` only on the drag handle, users can scroll the page by touching anywhere except the handle, while still being able to drag by touching the handle.

### Keyboard Accessibility
```typescript
useSensor(KeyboardSensor, {
  coordinateGetter: sortableKeyboardCoordinates,
})
```
Users can use arrow keys to reorder cards, meeting WCAG accessibility requirements.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 20eb2da | feat | Create CanvasContainer component |
| 7076022 | feat | Create SortableCard component |
| 39a522f | feat | Create SortableCardList component |

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 03-04 (Store & Editor Integration):**
- Components export correctly and are ready to import
- `onReorder` callback provides indices for store integration
- `selectedCardId` and `onSelectCard` props ready for editor state
- Card type properly imported from `@/types/card`

**Dependencies satisfied:**
- Uses Card type from 03-01
- Uses CARD_SIZES constant from 03-01
