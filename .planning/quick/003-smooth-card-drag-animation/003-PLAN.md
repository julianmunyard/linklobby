# Quick Task 003: Smooth Card Drag Animation

## Problem

When dropping a card after dragging, the card "jumps" from its original position to the drop position. The other cards animate smoothly, but the dragged card itself has a visual discontinuity.

## Root Cause

In `flow-grid.tsx`, the `DragOverlay` has an incomplete `dropAnimation` config:
```tsx
<DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
```

When you drop:
1. The original card (hidden with `opacity-0`) suddenly becomes visible at its **new position**
2. The `DragOverlay` tries to animate but without proper `sideEffects`, there's a visual mismatch

## Solution

Set `dropAnimation={null}` to instantly remove the overlay on drop. This makes the card appear immediately at its new position without any jump. The other cards still animate smoothly via their `transition` CSS.

This is the recommended approach for sortable lists where the items themselves handle transitions.

## Tasks

### Task 1: Remove drop animation from DragOverlay

**File:** `src/components/canvas/flow-grid.tsx`

**Change:**
```tsx
// Before
<DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>

// After
<DragOverlay dropAnimation={null}>
```

**Verification:** Drag and drop a card - it should appear smoothly at its new position without jumping.

## Acceptance Criteria

- [ ] Card appears at drop position without visual jump
- [ ] Other cards still animate smoothly out of the way
- [ ] No console errors
