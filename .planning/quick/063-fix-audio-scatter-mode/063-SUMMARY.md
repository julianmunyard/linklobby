# Quick Task 063: Fix Audio Card Not Working in Scatter Mode

## Status: Complete

## What Changed

**File:** `src/components/canvas/scatter-card.tsx`

### Root Cause
Moveable's Gesto library calls `preventDefault()` on all pointer/touch events by default (configured in MoveableManager.tsx). When Moveable was rendered with the audio card element as its target, this intercepted click events before they could reach audio controls (play/pause, seek bar, reverb knob, etc.).

The previous `dragTarget` approach (pointing Moveable at a handle ref) failed because:
1. React ref timing issues — `handleRef.current` could be null when Moveable first reads it
2. Moveable may still attach gesture detection listeners to the target element regardless

### Fix
Bypassed Moveable entirely for interactive cards in drag mode:

1. **Custom pointer-based drag** (`handlePointerDown` callback) — Interactive cards (audio, video, gallery, game, social-icons) use a custom drag implementation on the handle element via `onPointerDown` → document-level `pointermove`/`pointerup` listeners. This completely avoids Moveable's event interception.

2. **Conditional Moveable rendering** (`showMoveable`) — For interactive cards, Moveable only renders in resize mode (`scalable={true}`, `draggable={false}`). In resize mode, user interaction goes through Moveable's corner handles (separate overlay elements), not the target element, so audio controls remain accessible.

3. **Non-interactive cards unchanged** — Regular cards (hero, link, text, etc.) continue using Moveable for both drag and resize as before.

### Behavior Matrix

| Card Type | Drag Mode | Resize Mode |
|-----------|-----------|-------------|
| Interactive (audio, etc.) | Custom pointer drag on handle, no Moveable | Moveable (scalable only, draggable=false) |
| Non-interactive | Moveable (draggable) | Moveable (scalable) |

## Verification
- [x] TypeScript compiles with no errors
- [x] Audio controls unblocked (no Moveable event interception in drag mode)
- [x] Interactive cards draggable via handle element
- [x] Interactive cards resizable via Moveable corner handles
- [x] Non-interactive cards unchanged
