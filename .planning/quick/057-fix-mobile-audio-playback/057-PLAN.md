---
phase: quick-057
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/audio/engine/audioEngine.ts
  - src/audio/hooks/useAudioPlayer.ts
autonomous: true

must_haves:
  truths:
    - "Tapping play on mobile phone starts audio playback"
    - "Play button works on first tap (no double-tap required)"
    - "iOS silent unlock fires before AudioContext resume"
    - "Desktop playback continues to work unchanged"
    - "Engine init failure surfaces to UI (isLoading stays false, no phantom playing state)"
  artifacts:
    - path: "src/audio/engine/audioEngine.ts"
      provides: "Lazy-init AudioEngine that defers AudioContext creation to first play()"
      contains: "async play"
    - path: "src/audio/hooks/useAudioPlayer.ts"
      provides: "Async play handler that awaits engine init on user gesture"
      contains: "await.*init"
  key_links:
    - from: "src/audio/hooks/useAudioPlayer.ts play()"
      to: "audioEngine.init()"
      via: "await initPromiseRef on first play gesture"
      pattern: "initPromiseRef"
    - from: "audioEngine.play()"
      to: "context.resume()"
      via: "ensureUnlocked THEN resume within same user gesture callstack"
      pattern: "ensureUnlocked.*resume"
---

<objective>
Fix mobile audio playback - play button does nothing on mobile phones but works on desktop.

Purpose: The audio player is completely broken on mobile due to AudioContext being created outside a user gesture. Mobile browsers (Safari, Chrome) strictly enforce that AudioContext creation/resume must happen during a user-initiated event (tap, click). The current code creates the AudioContext on component mount (useEffect), which silently fails on mobile.

Output: Working audio playback on mobile and desktop with lazy engine initialization triggered by the first play tap.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/audio/engine/audioEngine.ts
@src/audio/hooks/useAudioPlayer.ts
@src/components/audio/audio-player.tsx
@src/components/cards/audio-card.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Defer AudioEngine init to first play() call (lazy initialization)</name>
  <files>
    src/audio/engine/audioEngine.ts
    src/audio/hooks/useAudioPlayer.ts
  </files>
  <action>
**audioEngine.ts changes:**

1. Make `play()` async — change signature to `async play(): Promise<void>`. This is the critical fix: play() must be the method that triggers init() so the AudioContext is created within the user gesture callstack.

2. Inside `async play()`, add lazy init at the top:
   ```
   if (!this.started) {
     await this.init()
   }
   ```
   This ensures the AudioContext is created during the user's tap/click event, satisfying the mobile browser gesture requirement.

3. Fix iOS unlock timing: `ensureUnlocked()` calls `audio.play()` which returns a Promise. For iOS, the silent audio element play MUST be called synchronously within the gesture handler, BEFORE `context.resume()`. The current code already has the right order (ensureUnlocked before resume on line 199-206), but make `ensureUnlocked()` fire the silent audio play call synchronously (don't await it — the fire-and-forget is fine, the important thing is the browser sees audio.play() called in the gesture context).

4. Keep the existing `play()` logic for re-sending loadTrack when `!isLoadedFlag` and `pendingPlayAfterLoad` — this handles the case where the track hasn't finished downloading yet.

**useAudioPlayer.ts changes:**

1. Remove the eager init from the useEffect (lines 69-73). Delete the `engine.init()` call from the mount effect entirely. The engine will init lazily on first play().

2. Make `play` callback async:
   ```typescript
   const play = useCallback(async () => {
     const engine = engineRef.current
     if (embedPlayback) {
       embedPlayback.setActiveEmbed(cardId)
     }
     try {
       await engine.play()
       setIsPlaying(true)
     } catch (error) {
       console.error('Failed to play:', error)
       setIsPlaying(false)
     }
     if (onPlay) onPlay()
   }, [cardId, embedPlayback, onPlay])
   ```
   CRITICAL: `setIsPlaying(true)` must move AFTER `await engine.play()` succeeds, not before. Currently it's set optimistically which causes phantom "playing" state when init fails on mobile.

3. Make `togglePlay` handle async play:
   ```typescript
   const togglePlay = useCallback(() => {
     if (isPlaying) {
       pause()
     } else {
       play()
     }
   }, [isPlaying, play, pause])
   ```
   No change needed here since play() returns a Promise but togglePlay doesn't need to await it.

4. Make `loadTrack` handle the case where engine is not yet initialized — since we removed eager init, `loadTrack` in the useEffect (line 138-142) fires on mount when trackUrl exists. The engine won't be initialized yet. Update `loadTrack` to store the URL but defer the actual engine.loadTrack() call:
   - In the loadTrack callback, check if `engine.started` (add a public getter `isStarted(): boolean` to AudioEngine that returns `this.started`).
   - If engine is not started, just store the URL in a ref (`pendingTrackUrlRef`). The engine's `play()` method already handles re-sending loadTrack when `!isLoadedFlag && currentUrl` exists.
   - If engine IS started, proceed with `await engine.loadTrack(url)` as before.

5. Update the loadTrack callback to also call `engine.setCurrentUrl(url)` or have the engine expose a method to set the pending URL without requiring initialization. Simplest approach: add a `setPendingTrack(url: string)` method to AudioEngine that just sets `this.currentUrl = url` without requiring init. Then loadTrack in the hook calls `engine.setPendingTrack(url)` when not initialized, and `engine.loadTrack(url)` when initialized.

**AudioEngine new public methods:**
- `isStarted(): boolean` — returns `this.started`
- `setPendingTrack(url: string): void` — sets `this.currentUrl = url` and resets load state (`this.isLoadedFlag = false`, `this.currentTimeSeconds = 0`, `this.durationSeconds = 0`)

**What NOT to change:**
- Do NOT touch any UI components (audio-player.tsx, audio-card.tsx, player-controls.tsx)
- Do NOT change the waveform, reverb knob, or varispeed slider
- Do NOT change the singleton pattern (getAudioEngine)
- Do NOT change the Superpowered processor message handling
- Do NOT change the EmbedPlaybackProvider integration pattern
  </action>
  <verify>
1. `npx tsc --noEmit` passes with no type errors
2. `npm run build` succeeds
3. Manual test on desktop: play button starts audio, pause stops it, seek works
4. Manual test on mobile (or Chrome DevTools mobile emulation): play button starts audio on first tap
5. Check browser console for "AudioEngine initialized (Superpowered)" message appearing AFTER play tap, not on page load
  </verify>
  <done>
- Play button works on mobile phones (AudioContext created within user gesture)
- Play button continues to work on desktop (no regression)
- `setIsPlaying(true)` only fires after successful engine.play()
- No console errors on mobile when tapping play
- Engine initializes lazily on first play, not on component mount
  </done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` — no type errors
2. `npm run build` — build succeeds
3. Desktop browser: audio plays/pauses/seeks correctly
4. Mobile browser (or DevTools emulation): first play tap triggers audio
5. Console shows "AudioEngine initialized" AFTER play tap, not on page load
6. No "Cannot play: not initialized" warnings in console on mobile
7. Multiple audio cards on same page: playing one pauses the other (embed coordination still works)
</verification>

<success_criteria>
- Mobile audio playback works on first play tap
- Desktop playback unaffected (no regression)
- AudioContext created lazily within user gesture
- iOS silent unlock fires within gesture context
- No phantom playing state (isPlaying only true after successful play)
- Build passes, no type errors
</success_criteria>

<output>
After completion, create `.planning/quick/057-fix-mobile-audio-playback/057-SUMMARY.md`
</output>
