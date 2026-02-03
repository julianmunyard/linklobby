---
phase: quick
plan: 015
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/ui/context-menu.tsx
  - src/components/canvas/selectable-flow-grid.tsx
  - src/components/canvas/dropdown-sortable.tsx
  - src/components/cards/dropdown-card.tsx
autonomous: true

must_haves:
  truths:
    - "Multi-selected cards can be dragged together"
    - "Cards can be dragged into dropdown containers"
    - "Cards can be dragged out of dropdown containers to main canvas"
    - "Right-click on dropdown shows context menu with Add Card and Move Selected options"
  artifacts:
    - path: "src/components/ui/context-menu.tsx"
      provides: "shadcn context-menu component"
      exports: ["ContextMenu", "ContextMenuTrigger", "ContextMenuContent", "ContextMenuItem"]
    - path: "src/components/canvas/dropdown-sortable.tsx"
      provides: "Dropdown with context menu"
      contains: "ContextMenu"
  key_links:
    - from: "src/components/canvas/selectable-flow-grid.tsx"
      to: "src/stores/page-store.ts"
      via: "moveCardToDropdown, removeCardFromDropdown"
      pattern: "moveCardToDropdown|removeCardFromDropdown"
---

<objective>
Fix Phase 6 multi-select and dropdown drag-drop issues, add context menu for dropdowns.

Purpose: Complete multi-select bulk operations, nested drag-and-drop, and provide quick dropdown actions.
Output: Working multi-drag, bidirectional dropdown drag-drop, dropdown context menu.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/canvas/selectable-flow-grid.tsx
@src/components/canvas/dropdown-sortable.tsx
@src/components/cards/dropdown-card.tsx
@src/stores/page-store.ts
@src/contexts/multi-select-context.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Context Menu and Fix Multi-Drag in SelectableFlowGrid</name>
  <files>src/components/ui/context-menu.tsx, src/components/canvas/selectable-flow-grid.tsx</files>
  <action>
**Step 1: Add shadcn context-menu component:**

```bash
npx shadcn@latest add context-menu
```

This creates `src/components/ui/context-menu.tsx` with all context menu exports.

**Step 2: Fix SelectableFlowGrid to support cross-container drag:**

The current SelectableFlowGrid only handles main canvas reordering. Update it to:

1. Add drag-over handling for dropdowns:
```typescript
import { DragOverEvent } from "@dnd-kit/core"
import { usePageStore } from "@/stores/page-store"
import { findContainer, canDropInContainer } from "@/lib/dnd-utils"

// Inside component:
const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
const removeCardFromDropdown = usePageStore((state) => state.removeCardFromDropdown)
```

2. Add `onDragOver` handler to DndContext:
```typescript
function handleDragOver(event: DragOverEvent) {
  const { active, over } = event
  if (!over) return

  const activeId = active.id as string
  const overId = over.id as string

  // Check if hovering over a dropdown
  const overDropdown = over.data.current?.type === "dropdown"
  if (overDropdown) {
    // Visual feedback is handled by dropdown-sortable isOver state
    return
  }
}
```

3. Update `handleDragEnd` to handle cross-container moves:
```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  setActiveCard(null)
  const cardIdsToDrag = [...draggedCardIds]
  setDraggedCardIds([])

  setTimeout(() => {
    isDraggingRef.current = false
  }, 50)

  if (!over) return

  const activeId = active.id as string
  const activeCard = cards.find((c) => c.id === activeId)
  if (!activeCard) return

  // Check if dropping on a dropdown
  const overDropdown = over.data.current?.type === "dropdown"
  const overId = over.id as string

  if (overDropdown) {
    // Move card(s) into dropdown
    if (!canDropInContainer(activeId, overId, cards)) return

    // Move all dragged cards to the dropdown
    cardIdsToDrag.forEach((cardId) => {
      const card = cards.find((c) => c.id === cardId)
      if (card && card.card_type !== "dropdown") {
        moveCardToDropdown(cardId, overId)
      }
    })
    multiSelect.clearSelection()
    return
  }

  // Check if card is being moved OUT of a dropdown to main canvas
  if (activeCard.parentDropdownId && !overDropdown) {
    // Remove from dropdown first
    cardIdsToDrag.forEach((cardId) => {
      removeCardFromDropdown(cardId)
    })
    multiSelect.clearSelection()
    // Continue with reorder on main canvas
  }

  // Normal reorder logic...
  if (active.id !== over.id) {
    const newIndex = cards.filter(c => !c.parentDropdownId).findIndex((c) => c.id === over.id)
    if (newIndex !== -1) {
      if (cardIdsToDrag.length > 1 && onReorderMultiple) {
        onReorderMultiple(cardIdsToDrag, newIndex)
        multiSelect.clearSelection()
      } else {
        const mainCards = cards.filter(c => !c.parentDropdownId)
        const oldIndex = mainCards.findIndex((c) => c.id === active.id)
        if (oldIndex !== -1) {
          onReorder(oldIndex, newIndex)
        }
      }
    }
  }
}
```

4. Ensure all cards (including those inside dropdowns) are in the items list but filtered appropriately for rendering. The existing logic filters `!c.parentDropdownId` for main canvas which is correct.

5. Pass `onDragOver={handleDragOver}` to DndContext.
  </action>
  <verify>
- `npx tsc --noEmit` passes
- Shadcn context-menu installed: `ls src/components/ui/context-menu.tsx`
  </verify>
  <done>Context menu installed, SelectableFlowGrid handles cross-container drag</done>
</task>

<task type="auto">
  <name>Task 2: Add Context Menu to DropdownSortable</name>
  <files>src/components/canvas/dropdown-sortable.tsx, src/components/cards/dropdown-card.tsx</files>
  <action>
Update dropdown-sortable.tsx to wrap DropdownCard with a context menu:

```typescript
"use client"

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { Plus, MoveRight, Trash2 } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { SortableFlowCard } from "./sortable-flow-card"
import { DropdownCard } from "@/components/cards/dropdown-card"
import { useMultiSelectContext } from "@/contexts/multi-select-context"
import { usePageStore } from "@/stores/page-store"
import { isDropdownContent } from "@/types/card"
import type { Card, CardType } from "@/types/card"
import { cn } from "@/lib/utils"

// Card types that can be added to dropdowns (exclude dropdown itself, game, gallery, video)
const DROPDOWN_ALLOWED_TYPES: CardType[] = ["link", "horizontal", "hero", "square"]

interface DropdownSortableProps {
  dropdown: Card
  childCards: Card[]
}

export function DropdownSortable({ dropdown, childCards }: DropdownSortableProps) {
  const { selectedIds, selectedCount, clearSelection } = useMultiSelectContext()
  const addCardToDropdown = usePageStore((state) => state.addCardToDropdown)
  const moveCardToDropdown = usePageStore((state) => state.moveCardToDropdown)
  const cards = usePageStore((state) => state.cards)

  // Make the dropdown a droppable area for receiving cards
  const { setNodeRef, isOver } = useDroppable({
    id: dropdown.id,
    data: {
      type: "dropdown",
      dropdownId: dropdown.id,
    },
  })

  // Handle "Add Card" submenu
  const handleAddCard = (type: CardType) => {
    addCardToDropdown(dropdown.id, type)
  }

  // Handle "Move Selected Here"
  const handleMoveSelectedHere = () => {
    if (selectedCount === 0) return

    selectedIds.forEach((cardId) => {
      const card = cards.find((c) => c.id === cardId)
      // Don't move dropdowns into dropdowns, don't move if already in this dropdown
      if (card && card.card_type !== "dropdown" && card.parentDropdownId !== dropdown.id) {
        moveCardToDropdown(cardId, dropdown.id)
      }
    })
    clearSelection()
  }

  const dropdownTitle = dropdown.title || "Dropdown"

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          className={cn(
            "w-full transition-colors",
            isOver && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <DropdownCard card={dropdown}>
            <SortableContext
              items={childCards.map((c) => c.id)}
              strategy={rectSortingStrategy}
            >
              <div className="space-y-2">
                {childCards.map((card) => (
                  <SortableFlowCard
                    key={card.id}
                    card={card}
                    isInsideDropdown
                  />
                ))}
              </div>
            </SortableContext>
          </DropdownCard>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {/* Add Card submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuItem onClick={() => handleAddCard("link")}>
              Link
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAddCard("horizontal")}>
              Horizontal Link
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAddCard("hero")}>
              Hero Card
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAddCard("square")}>
              Square Card
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Move Selected Here - only show if there are selected cards */}
        {selectedCount > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleMoveSelectedHere}>
              <MoveRight className="mr-2 h-4 w-4" />
              Move {selectedCount} card{selectedCount > 1 ? "s" : ""} here
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
```

Key features:
- Right-click anywhere on dropdown shows context menu
- "Add Card" submenu with allowed card types (link, horizontal, hero, square)
- "Move Selected Here" option shows count and only appears when cards are selected
- Uses existing `addCardToDropdown` and `moveCardToDropdown` from store
  </action>
  <verify>`npx tsc --noEmit` passes</verify>
  <done>DropdownSortable has right-click context menu with Add Card and Move Selected options</done>
</task>

<task type="auto">
  <name>Task 3: Ensure Multi-Select Context Available for Dropdown Context Menu</name>
  <files>src/components/canvas/flow-grid.tsx</files>
  <action>
The DropdownSortable now uses `useMultiSelectContext`. Verify that the MultiSelectProvider wraps the FlowGrid when it's used in the editor.

Check `src/components/editor/preview-panel.tsx` - if it uses FlowGrid directly (not through SelectableFlowGrid), the DropdownSortable inside will fail because it lacks the MultiSelectProvider context.

**Solution:** Create a try-catch pattern in DropdownSortable to gracefully handle missing context:

Update dropdown-sortable.tsx to handle case where context isn't available (e.g., in preview iframe):

```typescript
// At the top of the component, try to get context, fall back gracefully
let selectedIds = new Set<string>()
let selectedCount = 0
let clearSelection = () => {}

try {
  const context = useMultiSelectContext()
  selectedIds = context.selectedIds
  selectedCount = context.selectedCount
  clearSelection = context.clearSelection
} catch {
  // Context not available (e.g., in preview iframe)
  // Leave defaults as empty
}
```

**Alternative approach (cleaner):** Create a hook that returns null if no provider:

In `src/contexts/multi-select-context.tsx`, add:

```typescript
export function useMultiSelectContextOptional() {
  return useContext(MultiSelectContext)
}
```

Then in dropdown-sortable.tsx:

```typescript
import { useMultiSelectContextOptional } from "@/contexts/multi-select-context"

// In component:
const multiSelect = useMultiSelectContextOptional()
const selectedIds = multiSelect?.selectedIds ?? new Set<string>()
const selectedCount = multiSelect?.selectedCount ?? 0
const clearSelection = multiSelect?.clearSelection ?? (() => {})
```

Update `multi-select-context.tsx` to export the optional hook:

```typescript
export function useMultiSelectContextOptional() {
  return useContext(MultiSelectContext)
}
```

This allows the context menu to work in the editor while gracefully degrading in the preview iframe (where there's no selection anyway).
  </action>
  <verify>`npx tsc --noEmit` passes</verify>
  <done>Multi-select context safely accessible in dropdown with fallback for preview</done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- Multi-select cards with Shift+click, drag one to move all
- Drag a card onto a dropdown - card moves inside
- Drag a card out of a dropdown - card moves to main canvas
- Right-click on dropdown shows "Add Card" submenu
- Right-click on dropdown shows "Move X cards here" when cards selected
</verification>

<success_criteria>
- Multi-dragging selected cards works (drag one, all move)
- Cards can be dropped into dropdowns via drag
- Cards can be dragged out of dropdowns to main canvas
- Right-click context menu appears on dropdown
- "Add Card" submenu creates new card inside dropdown
- "Move Selected Here" moves all selected cards into dropdown
</success_criteria>

<output>
After completion, create `.planning/quick/015-fix-phase6-multiselect-dropdown-issues/015-SUMMARY.md`
</output>
