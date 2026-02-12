# LinkLobby - Claude Code Notes

## Audio Engine Architecture

The audio system uses Superpowered Web Audio SDK with an AudioWorklet processor pattern.

### Key Rules (learned from bugs)

1. **NEVER call `context.suspend()` before the AudioWorklet has processed its first frame.** Superpowered's AudioContext starts in 'running' state on desktop. Suspending before any `processAudio()` call can make `context.resume()` silently fail in certain component mount timings. Let the browser's autoplay policy handle initial suspension.

2. **Public page audio cards MUST render AudioPlayer directly** — never route through CardRenderer/AudioCard. AudioCard uses `useThemeStore` (Zustand) which has wrong default state on public pages. Both `StaticFlowGrid` and `StaticScatterCanvas` bypass CardRenderer for audio cards.

3. **Store React context values in refs when used in useEffect dependencies.** The `EmbedPlaybackProvider` context value is not memoized — every `setActiveEmbedId` call creates a new object. If `embedPlayback` is in a useEffect dependency array, the effect cleanup will re-run (calling `engine.pause()`) every time play is triggered. Use `useRef` to hold the context value and update it on every render.

4. **Don't call `engine.setPendingTrack()` before `engine.loadTrack()`** — it resets `isLoadedFlag` which defeats the same-URL short-circuit and forces redundant track downloads on React Strict Mode re-mounts.

### Architecture Quick Reference

- **Singleton:** `getAudioEngine()` returns one `AudioEngine` instance per page load
- **Play/Pause mechanism:** `context.resume()` / `context.suspend()` — the processor's `processAudio()` has NO playing flag; AudioContext state controls whether it runs
- **Processor:** `public/processors/audioCardProcessor.js` — always processes audio when loaded, outputs silence when not loaded
- **Hook:** `src/audio/hooks/useAudioPlayer.ts` — manages engine lifecycle per component
- **Engine:** `src/audio/engine/audioEngine.ts` — Superpowered AudioWorklet engine
- **Retry:** play() verifies playback after 150ms, retries up to 5 times with increasing delays

### Debugging Audio Issues Checklist

1. Check console for `AudioEngine: play (context.state: ...)` — if state is 'suspended', resume() isn't working
2. Check for `AudioEngine: pause` appearing right after play — means something is re-triggering a useEffect cleanup
3. Check if `processAudio` is being called — look for progress messages from the processor
4. Verify the component is rendering AudioPlayer directly, not through CardRenderer/AudioCard
5. Check useEffect dependency arrays for unstable references (context values, un-memoized objects)
