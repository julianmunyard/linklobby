---
phase: 04-basic-cards
plan: 03
subsystem: editor
tags: [property-editor, forms, react-hook-form, shadcn, optimistic-updates]

requires:
  - phase: 04-basic-cards
    plan: 01
    provides: ["ImageUpload", "Card content types"]
  - phase: 03-canvas-system
    plan: 04
    provides: ["page-store with selectedCardId", "updateCard action"]

provides:
  - component: CardPropertyEditor
    exports: ["CardPropertyEditor"]
    purpose: "Main property editor that switches fields by card type"
  - component: HeroCardFields
    exports: ["HeroCardFields"]
    purpose: "Hero-specific form fields (buttonText, buttonStyle)"
  - component: HorizontalLinkFields
    exports: ["HorizontalLinkFields"]
    purpose: "Horizontal-specific form fields placeholder"
  - component: SquareCardFields
    exports: ["SquareCardFields"]
    purpose: "Square-specific form fields (showTitle toggle)"

affects:
  - phase: 04-basic-cards
    plan: 02
    reason: "Will integrate CardPropertyEditor into editor panel"

tech-stack:
  added:
    - package: "@hookform/resolvers"
      purpose: "Zod resolver for react-hook-form validation"
    - component: "shadcn/select"
      purpose: "Dropdown for button style selection"
    - component: "shadcn/switch"
      purpose: "Toggle for showTitle option"
  patterns:
    - name: "Optimistic updates"
      implementation: "form.watch() subscription updates store immediately"
    - name: "Form reset on selection"
      implementation: "useEffect resets form when card.id changes"
    - name: "Type-specific fields"
      implementation: "Conditional rendering based on card_type"

key-files:
  created:
    - path: "src/components/editor/card-property-editor.tsx"
      loc: 209
      exports: ["CardPropertyEditor"]
    - path: "src/components/editor/hero-card-fields.tsx"
      loc: 51
      exports: ["HeroCardFields"]
    - path: "src/components/editor/horizontal-link-fields.tsx"
      loc: 14
      exports: ["HorizontalLinkFields"]
    - path: "src/components/editor/square-card-fields.tsx"
      loc: 26
      exports: ["SquareCardFields"]
    - path: "src/components/ui/select.tsx"
      loc: 154
      exports: ["Select", "SelectContent", "SelectItem", "SelectTrigger", "SelectValue"]
    - path: "src/components/ui/switch.tsx"
      loc: 27
      exports: ["Switch"]

decisions:
  - decision: "Use react-hook-form for property editor"
    rationale: "Established pattern from phase 01, provides validation and watch API for optimistic updates"
    phase: "04-03"
  - decision: "Optimistic updates via form.watch()"
    rationale: "Changes appear immediately in store and preview without save button"
    phase: "04-03"
  - decision: "Type-specific field components"
    rationale: "Keeps main editor clean, allows each card type to extend independently"
    phase: "04-03"
  - decision: "shadcn select and switch"
    rationale: "Consistent UI components for dropdown and toggle controls"
    phase: "04-03"

metrics:
  duration: "2 minutes"
  tasks: 2
  commits: 2
  files_created: 6
  lines_added: 586
  completed: "2026-01-24"
---

# Phase 04 Plan 03: Card Property Editor Summary

**One-liner:** Card property editor with react-hook-form, optimistic updates, and type-specific fields for Hero/Horizontal/Square cards

## What Was Built

Created a comprehensive card property editor system that displays when a card is selected in the canvas. The editor shows common fields (title, description, URL, image) plus type-specific fields based on the card type. All changes update the Zustand store immediately (optimistic updates) for real-time preview.

### Core Components

1. **CardPropertyEditor** (main component)
   - Header with card type indicator and close button
   - Common fields: title, description, URL, image upload
   - ImageUpload component integration with aspect ratio detection
   - react-hook-form with Zod validation
   - Optimistic updates via form.watch() subscription
   - Conditional rendering of type-specific field components

2. **HeroCardFields**
   - Button text input (empty = stretched link)
   - Button style dropdown (primary/secondary/outline)
   - Image alt text input

3. **HorizontalLinkFields**
   - Minimal implementation (returns null)
   - Ready for future icon selection feature

4. **SquareCardFields**
   - Show title overlay toggle (default: true)
   - Image alt text input

### Key Features

- **Optimistic updates:** Form changes immediately update the store without explicit save
- **Form reset:** Automatically resets when different card is selected
- **Type safety:** Uses HeroCardContent, HorizontalLinkContent, SquareCardContent types
- **Image aspect ratio:** Automatically uses square for square cards, 16:9 for others
- **Reusable patterns:** handleImageChange and handleContentChange helpers

## Technical Implementation

### Optimistic Update Pattern

```typescript
useEffect(() => {
  const subscription = form.watch((values) => {
    const title = values.title || null
    const description = values.description || null
    const url = values.url || null

    updateCard(card.id, { title, description, url })
  })
  return () => subscription.unsubscribe()
}, [form, card.id, updateCard])
```

### Content Update Pattern

```typescript
function handleContentChange(updates: Record<string, unknown>) {
  const content = { ...(card.content as Record<string, unknown>), ...updates }
  updateCard(card.id, { content })
}
```

This pattern allows type-specific components to update their portion of the content object while preserving other fields.

### Type-Specific Field Rendering

```typescript
{card.card_type === "hero" && (
  <HeroCardFields
    content={currentContent as HeroCardContent}
    onChange={handleContentChange}
  />
)}
```

## Testing Notes

### Manual Verification Needed

Once integrated into the editor panel:

1. **Select a card** - Property editor should appear
2. **Edit title** - Should update store immediately, visible in preview
3. **Upload image** - Should show in both editor preview and canvas preview
4. **Change card type fields:**
   - Hero: Button text and style should affect card rendering
   - Square: Toggle showTitle should show/hide title overlay
5. **Select different card** - Form should reset to new card's values
6. **Close editor** - Property editor should disappear

### Edge Cases to Test

- Empty values (should convert to null)
- Invalid URL format (Zod validation should show error)
- Switching between cards rapidly
- Image upload while editing other fields

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Optimistic updates via form.watch() | Immediate feedback in preview without save button | Better UX, matches modern editor expectations |
| Type-specific field components | Separation of concerns, extensibility | Each card type can evolve independently |
| handleContentChange helper | Merge updates into content object | Preserves fields not managed by current form |
| Image aspect ratio detection | Automatic UX based on card type | Square cards get square upload, others get 16:9 |

## Integration Points

### Required by Next Plans

- **Plan 04-02 (Hero Card):** Will use HeroCardFields to configure hero cards
- **Plan 04-04 (Horizontal & Square):** Will use respective field components

### Dependencies Satisfied

- Uses ImageUpload from plan 04-01 ✓
- Uses updateCard from page-store (plan 03-04) ✓
- Uses selectedCardId from page-store (plan 03-04) ✓

## Next Phase Readiness

**Status: Ready**

The property editor infrastructure is complete. Next plans can:
1. Integrate CardPropertyEditor into the editor panel sidebar
2. Build actual card components that consume the edited data
3. Add more type-specific fields as card types evolve

**No blockers identified.**

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| src/components/editor/card-property-editor.tsx | Created | Main property editor with common fields and type switching |
| src/components/editor/hero-card-fields.tsx | Created | Hero-specific fields (button text, style) |
| src/components/editor/horizontal-link-fields.tsx | Created | Horizontal-specific fields (minimal for now) |
| src/components/editor/square-card-fields.tsx | Created | Square-specific fields (showTitle toggle) |
| src/components/ui/select.tsx | Created | shadcn select component |
| src/components/ui/switch.tsx | Created | shadcn switch component |

## Commits

| Hash | Message | Files Changed |
|------|---------|---------------|
| f95f607 | feat(04-03): create CardPropertyEditor main component | card-property-editor.tsx, select.tsx, switch.tsx |
| ccbab61 | feat(04-03): create type-specific field components | hero-card-fields.tsx, horizontal-link-fields.tsx, square-card-fields.tsx |

---

**Phase 04 Plan 03 Status: COMPLETE ✓**
