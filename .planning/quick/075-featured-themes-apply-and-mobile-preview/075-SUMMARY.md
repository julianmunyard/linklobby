---
phase: quick
plan: 075
subsystem: editor
tags: [templates, mobile, UX, apply-flow]
completed: 2026-02-24
duration: ~2.5min
---

# Quick Task 075: Featured Themes Apply and Mobile Preview

**One-liner:** Featured template cards now apply on click with confirmation dialog, loading state, and mobile bottom sheet dismiss.

## What Was Done

### Task 1: Template Apply Flow in FeaturedThemesTab
- Changed `motion.div` to `motion.button` for clickable template cards
- Added `applyTemplate()` function replicating TemplatePicker's POST `/api/templates/apply` pattern
- Store hydration: setCards, loadFromDatabase, initializeProfile with hasChanges flags
- Confirmation dialog (AlertDialog) with Replace/Add options when user has existing cards
- Loading spinner overlay (Loader2 + semi-transparent backdrop) on the applying card
- Other cards disabled/dimmed while one is applying
- "Explore theme" link uses `stopPropagation` to prevent triggering apply
- Commit: `637a753`

### Task 2: Callback Threading and Mobile Dismiss
- Added `onTemplateApplied` prop to EditorPanel, threaded to FeaturedThemesTab
- Created `handleTemplateApplied` callback in EditorLayout that closes mobile bottom sheet
- Added Featured FAB button (Sparkles icon) to MobileFAB for re-entry after dismiss
- Desktop: callback is no-op since isMobileLayout is false
- Commit: `7bfdc4d`

## Files Modified

| File | Changes |
|------|---------|
| `src/components/editor/featured-themes-tab.tsx` | Apply logic, confirmation dialog, loading state, clickable cards |
| `src/components/editor/editor-panel.tsx` | Added onTemplateApplied prop, passed to FeaturedThemesTab |
| `src/components/editor/editor-layout.tsx` | handleTemplateApplied callback, Featured FAB wiring |
| `src/components/editor/mobile-fab.tsx` | Added onOpenFeatured prop and Featured (Sparkles) FAB button |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| motion.button instead of wrapping motion.div | Cleaner than wrapper, semantic button element for clickable cards |
| span with role=button for Explore theme | Cannot nest button inside motion.button, span with stopPropagation works |
| Conditional Featured FAB render | Only renders when onOpenFeatured provided, backward compatible |
