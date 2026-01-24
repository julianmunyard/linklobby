---
type: quick
number: 001
description: Add delete button to cards in editor
files_modified:
  - src/components/canvas/sortable-card.tsx
autonomous: true
---

# Quick Task 001: Add Delete Button to Cards

## Objective

Add a delete button to each card in the editor's card list so users can remove cards.

## Tasks

### Task 1: Add delete button to SortableCard component

**Files:** `src/components/canvas/sortable-card.tsx`

**Action:**
1. Import Trash2 icon from lucide-react
2. Add onDelete prop to SortableCardProps interface
3. Add delete button next to the card content (right side)
4. Style button to appear on hover or always visible
5. Call onDelete(card.id) when clicked
6. Prevent click propagation so card isn't selected when deleting

**Code changes:**
```typescript
// Add to imports
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Update interface
interface SortableCardProps {
  card: Card
  isSelected?: boolean
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void  // Add this
}

// Add delete button in component (after card content div)
{onDelete && (
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
    onClick={(e) => {
      e.stopPropagation()
      onDelete(card.id)
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
)}
```

**Verify:** Component renders delete button, clicking deletes card

### Task 2: Wire delete through SortableCardList

**Files:** `src/components/canvas/sortable-card-list.tsx`

**Action:**
1. Add onDelete prop to SortableCardListProps
2. Pass onDelete to each SortableCard

**Verify:** Delete prop flows through to cards

### Task 3: Connect delete to store in CardsTab

**Files:** `src/components/editor/cards-tab.tsx`

**Action:**
1. Get removeCard from usePageStore
2. Create handleDelete that calls removeCard AND useCards.removeCard (for DB)
3. Pass handleDelete to SortableCardList

**Verify:** Deleting card removes from UI and database

## Success Criteria

- Delete button visible on each card
- Clicking delete removes card from list
- Card deleted from database
- No errors in console
