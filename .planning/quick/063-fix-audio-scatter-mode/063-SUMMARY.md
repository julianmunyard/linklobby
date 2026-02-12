# Quick Task 063: Fix Audio Card Not Working in Scatter Mode

## Status: Complete

## Timeline of Fixes (4 commits)

This bug required multiple rounds to fully diagnose. Each round peeled back a layer:

### Round 1: Editor scatter card (scatter-card.tsx) — `a1f777f`
Bypassed Moveable for interactive cards in drag mode with custom pointer drag.
**Result:** Fixed the editor, but the real problem was on the PUBLIC page.

### Round 2: Public page AudioPlayer rendering — `c3b445c`, `c85df1e`
StaticScatterCanvas was routing audio cards through CardRenderer → AudioCard → useThemeStore (Zustand store with default/wrong state on public pages). Fixed by rendering AudioPlayer directly, matching StaticFlowGrid's pattern.
**Result:** Audio card rendered correctly, but play still produced no sound.

### Round 3: EmbedPlayback context re-render loop — `7c525b2`
`useAudioPlayer` had `embedPlayback` in useEffect dependency arrays. When play() called `setActiveEmbed()`, the EmbedPlaybackProvider re-rendered with a new (un-memoized) context value, causing `embedPlayback` reference to change, triggering useEffect cleanup which called `engine.pause()` — killing playback instantly.
**Fix:** Stored embedPlayback in a ref (`embedPlaybackRef`) so effects only depend on `[cardId]`.
**Result:** The instant-pause was gone, but audio still didn't play — "playback not progressing, retrying..."

### Round 4: AudioContext.suspend() before first frame — `42f3116` (THE ROOT CAUSE)
`init()` explicitly called `context.suspend()` on the AudioContext before it ever processed a single audio frame. On desktop, Superpowered's AudioContext starts in 'running' state. The explicit suspend→resume cycle failed in scatter mode because AudioPlayer mounts LATER (after a container measurement cycle via ResizeObserver), while in flow grid it mounts immediately during hydration.

**Fix (3 changes):**
1. Removed `context.suspend()` from `init()` — browser autoplay policy handles suspension naturally
2. Added `context.resume()` Promise handler — re-sends play command when context confirms 'running'
3. Upgraded retry from 1×200ms to 5 retries with increasing delays (150/300/500/1000/2000ms)
4. Removed `setPendingTrack()` call from hook's `loadTrack` — was forcing redundant re-downloads

## Root Cause (Final)

**File:** `src/audio/engine/audioEngine.ts` line 110 (old)

```ts
// OLD (broken):
this.processorNode.context.suspend()  // Suspends before ANY audio frame processed
```

The AudioContext was suspended before the AudioWorklet's `processAudio()` ever ran. In some timing conditions (scatter mode's delayed mount), calling `context.resume()` later failed to transition the context back to 'running' state. The `processAudio()` method was never called, so no progress messages were sent, and playback verification reported "not progressing."

**Why it worked in flow grid but not scatter:**
- **Flow grid:** StaticFlowGrid is a server component. AudioPlayer hydrates immediately on page load. The timing between suspend→resume worked by coincidence.
- **Scatter:** StaticScatterCanvas is a client component with a `containerWidth > 0` guard. AudioPlayer mounts on the SECOND render cycle (after ResizeObserver fires). The delayed mount + suspend-before-first-frame caused `resume()` to silently fail.

## Key Architectural Facts (for future debugging)

1. **AudioEngine is a singleton** — `getAudioEngine()` returns one instance per page load
2. **Superpowered's AudioContext starts 'running' on desktop** — unlike standard Web Audio API where new contexts start 'suspended' due to autoplay policy
3. **play/pause uses context.suspend()/resume()** — the processor's `processAudio()` has no playing flag; it ALWAYS processes when loaded. AudioContext state controls whether `processAudio` is called.
4. **EmbedPlaybackProvider context value is NOT memoized** — every `setActiveEmbedId` creates a new context object. Any hook using `useOptionalEmbedPlayback()` must store the value in a ref to avoid effect re-triggers.
5. **Public page audio cards MUST bypass CardRenderer/AudioCard** — AudioCard uses `useThemeStore` (Zustand) which has wrong defaults on public pages. Both StaticFlowGrid and StaticScatterCanvas render AudioPlayer directly.

## Files Modified (all rounds)

| File | What Changed |
|------|-------------|
| `src/audio/engine/audioEngine.ts` | Removed context.suspend() from init, added resume Promise handler, 5-retry verification |
| `src/audio/hooks/useAudioPlayer.ts` | embedPlayback stored in ref, removed setPendingTrack call |
| `src/components/public/static-scatter-canvas.tsx` | Direct AudioPlayer rendering (bypasses CardRenderer) |
| `src/components/canvas/scatter-card.tsx` | Custom pointer drag for interactive cards in editor |
