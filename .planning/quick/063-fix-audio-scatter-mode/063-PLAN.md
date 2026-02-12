---
wave: 1
autonomous: true
---

# Quick Task 063: Fix Audio Card Not Working in Scatter Mode

## Goal

Audio card controls (play/pause, seek, reverb, varispeed) must be fully interactive in scatter/freeform mode, identical to how they work in flow grid mode.

## Root Cause

Moveable's Gesto library calls `preventDefault()` on pointer/touch events by default (`preventDefault: true` in MoveableManager.tsx line 68). When Moveable is rendered with the audio card as its target, the Gesto intercepts pointer events on the target element, preventing browser-generated click events from reaching audio controls inside the card.

Previous attempts to fix this with `dragTarget` (redirecting Moveable's drag to a handle element) failed because:
1. React ref timing — `handleRef.current` may be null when Moveable first reads it, causing fallback to target
2. Even with `dragTarget`, Moveable may still attach event listeners to the target for gesture detection

## Solution

Bypass Moveable entirely for interactive cards in drag mode. Implement custom pointer-event-based drag on the handle element.

- **Interactive cards (audio, video, gallery, game, social-icons)**: Moveable only renders in resize mode (`scalable={true}`, `draggable={false}`). Drag is handled by custom `onPointerDown` → `document.addEventListener('pointermove/pointerup')` on the drag handle.
- **Non-interactive cards**: Moveable continues to handle both drag and resize as before.

## Tasks

<task id="1">
<name>Bypass Moveable for interactive card drag</name>
<type>fix</type>
<files>src/components/canvas/scatter-card.tsx</files>
<description>
1. Remove handleRef (no longer needed — Moveable doesn't use dragTarget)
2. Add `useCallback` import
3. Create `handlePointerDown` callback that implements custom pointer drag:
   - Captures startX/startY on pointer down
   - Attaches document-level pointermove/pointerup listeners
   - Applies boundary clamping (same logic as Moveable onDrag)
   - On pointer up with no movement: treat as tap (call onTap)
   - On pointer up with movement: call onUpdate with new position
4. Change `showMoveable` logic: interactive cards only show Moveable in resize mode
5. Set `draggable={false}` on Moveable for interactive cards
6. Replace handle's onClick with onPointerDown={handlePointerDown}
</description>
</task>

## Verification

- [ ] Audio play/pause button responds to clicks in scatter arrange mode
- [ ] Audio seek bar (waveform) responds to clicks/drags in scatter mode
- [ ] Audio card can be dragged via the handle bar at the top
- [ ] Audio card can be resized via corner handles (touch: tap card first)
- [ ] Non-interactive cards (hero, link, text) still drag and resize normally
- [ ] TypeScript compiles with no errors

## must_haves

- Audio controls fully interactive in scatter arrange mode
- Interactive cards draggable via handle element
- Interactive cards resizable via Moveable corner handles
- Non-interactive cards unchanged (Moveable handles drag + resize)
