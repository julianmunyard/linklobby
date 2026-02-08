---
phase: quick
plan: 047
type: execute
wave: 1
depends_on: []
files_modified:
  - src/audio/engine/audioEngine.ts
  - src/audio/engine/types.ts
  - src/audio/hooks/useAudioPlayer.ts
autonomous: true

must_haves:
  truths:
    - "Pressing play on an audio card plays audible sound through speakers"
    - "Pressing pause stops the audio"
    - "Progress bar updates as audio plays and seek works"
    - "Varispeed (playback rate) control changes speed"
    - "Track auto-advances in multi-track mode"
    - "Audio works on both editor/preview and public slug pages"
  artifacts:
    - path: "src/audio/engine/audioEngine.ts"
      provides: "Web Audio API engine replacing Superpowered SDK"
      exports: ["getAudioEngine", "AudioEngine"]
    - path: "src/audio/engine/types.ts"
      provides: "Type definitions for engine state and callbacks"
      exports: ["AudioEngineState", "AudioEngineCallbacks", "AudioEngineMessage", "VarispeedMode"]
  key_links:
    - from: "src/audio/hooks/useAudioPlayer.ts"
      to: "src/audio/engine/audioEngine.ts"
      via: "getAudioEngine() singleton"
      pattern: "getAudioEngine"
    - from: "src/audio/engine/audioEngine.ts"
      to: "AudioContext.decodeAudioData"
      via: "fetch + decode for track loading"
      pattern: "decodeAudioData"
    - from: "src/audio/engine/audioEngine.ts"
      to: "AudioBufferSourceNode"
      via: "createBufferSource for playback"
      pattern: "createBufferSource"
---

<objective>
Replace the broken Superpowered SDK audio engine with a clean Web Audio API implementation that produces actual audible sound when the play button is pressed.

Purpose: The current Superpowered SDK implementation silently fails due to version mismatch between the npm package (2.7.6 WASM) and the worklet-side SP-es6.js (2.7.2 glue code), plus COEP header complications with blob URL Workers fetching cross-origin audio from Supabase. The Web Audio API is the browser-native solution that eliminates all these failure modes for single-track playback.

Output: A working AudioEngine class using standard Web Audio API (fetch + decodeAudioData + AudioBufferSourceNode) that maintains the exact same public interface so useAudioPlayer hook and all UI components work without modification.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/audio/engine/audioEngine.ts
@src/audio/engine/types.ts
@src/audio/hooks/useAudioPlayer.ts
@src/components/audio/audio-player.tsx
@src/components/audio/player-controls.tsx
@src/types/audio.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace AudioEngine with Web Audio API implementation</name>
  <files>src/audio/engine/audioEngine.ts, src/audio/engine/types.ts</files>
  <action>
Rewrite `src/audio/engine/audioEngine.ts` to use the standard Web Audio API instead of Superpowered SDK. The class MUST preserve the exact same public interface so no other files need changes.

**Public interface to preserve (method signatures must remain identical):**
- `init(): Promise<void>` -- create AudioContext (do NOT suspend it on init; leave in default state)
- `loadTrack(url: string): Promise<void>` -- fetch audio URL, decode with `audioContext.decodeAudioData()`, store AudioBuffer, fire `onLoaded` callback with duration
- `play(): void` -- SYNCHRONOUS. Resume AudioContext if suspended (same `.resume()` call), create `AudioBufferSourceNode` from stored AudioBuffer, connect to destination, call `.start()` from current seek position. Set `isPlayingFlag = true`. If already playing, no-op.
- `pause(): void` -- Stop the source node (`.stop()`), record current playback position (calculate from `audioContext.currentTime - startedAtContextTime + startOffset`). Set `isPlayingFlag = false`.
- `seek(positionSeconds: number): void` -- If playing: stop current source, update startOffset, create new source and start from new position. If paused: just update startOffset.
- `setVarispeed(speed: number, isNatural: boolean): void` -- Set `sourceNode.playbackRate.value = speed`. Store speed for new source nodes. isNatural param stored but not differentiated (Web Audio has no time-stretching; both modes change pitch).
- `setReverbConfig(config: ReverbConfig): void` -- Store config but no-op for now (reverb can be added later with ConvolverNode; do NOT block playback on this).
- `setReverbMix(mix: number): void` -- Store mix value, no-op processing.
- `setLooping(enabled: boolean): void` -- Set `sourceNode.loop = enabled` on current and future source nodes.
- `isPlaying(): boolean`, `isLoaded(): boolean` -- Return flags.
- `getDuration(): number` -- Return stored duration from decoded buffer.
- `getCurrentTime(): number` -- Calculate and return current playback position.
- `getAudioContext(): AudioContext | null` -- Return the AudioContext.
- `ensureUnlocked(): void` -- Keep iOS silent audio unlock pattern unchanged.
- `diagTestTone(): void` -- Keep unchanged.
- `setCallbacks(callbacks: AudioEngineCallbacks): void` -- Keep unchanged.
- `destroy(): void` -- Stop source, close AudioContext, clean up.

**Implementation details:**

1. Remove ALL imports from `@superpoweredsdk/web`. Remove `SuperpoweredGlue`, `SuperpoweredWebAudio`, and all worklet/processor references.

2. Create AudioContext directly: `new AudioContext({ sampleRate: 48000 })`. Do NOT call `.suspend()` in init -- leave it in default state. The browser auto-suspends until user gesture anyway.

3. For `loadTrack(url)`:
   ```
   const response = await fetch(url)
   const arrayBuffer = await response.arrayBuffer()
   this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
   this.duration = this.audioBuffer.duration
   this.isLoadedFlag = true
   this.callbacks.onLoaded?.(this.duration)
   ```

4. For `play()`:
   - Resume AudioContext: `this.audioContext.resume()` (fire-and-forget, same as current)
   - Create new `AudioBufferSourceNode` each time (Web Audio pattern -- source nodes are one-shot)
   - `sourceNode.buffer = this.audioBuffer`
   - `sourceNode.playbackRate.value = this.playbackSpeed`
   - `sourceNode.loop = this.looping`
   - `sourceNode.connect(this.audioContext.destination)`
   - `sourceNode.start(0, this.startOffset)` -- start from current seek position
   - Record `this.startedAtContextTime = this.audioContext.currentTime`
   - Set `sourceNode.onended` handler: if not paused/seeked (i.e., natural end), fire `onEnded` callback and set `isPlayingFlag = false`

5. For position tracking, use a `setInterval` (every 250ms) while playing:
   ```
   const elapsed = (audioContext.currentTime - startedAtContextTime) * playbackSpeed
   const currentTime = startOffset + elapsed
   callbacks.onProgress?.(currentTime, duration)
   ```
   Clear interval on pause/stop/destroy.

6. For `pause()`:
   - Calculate current position: `startOffset + (audioContext.currentTime - startedAtContextTime) * playbackSpeed`
   - Store in `this.startOffset`
   - Call `sourceNode.stop()` (this triggers onended, so set a flag `this.intentionalStop = true` to suppress onEnded callback)
   - Set `sourceNode = null`
   - Clear progress interval

7. For `seek(positionSeconds)`:
   - Clamp to [0, duration]
   - `this.startOffset = positionSeconds`
   - If playing: stop current source (intentional stop), create new source, start from new offset
   - Fire onProgress with new position

**Do NOT change `src/audio/engine/types.ts`** -- the types are already correct and engine-agnostic. Keep `AudioEngineCallbacks`, `AudioEngineState`, `AudioEngineMessage`, `ProcessorEvent`, and `VarispeedMode` unchanged.

**Why NOT to use AudioWorklet for this:** Single-track playback with AudioBufferSourceNode is the standard Web Audio pattern. AudioWorklets are for custom DSP (which Superpowered needed for its WASM processing). We don't need custom DSP for play/pause/seek/speed.
  </action>
  <verify>
Run `npx tsc --noEmit` -- should compile with no errors related to audioEngine.ts.
Run `npm run build` or `npx next build` -- should build successfully.
Verify no remaining imports from `@superpoweredsdk/web` in audioEngine.ts.
  </verify>
  <done>
AudioEngine class uses Web Audio API (AudioContext + AudioBufferSourceNode + decodeAudioData), has zero Superpowered SDK imports, and maintains the identical public interface so useAudioPlayer.ts and all UI components compile without changes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update useAudioPlayer hook for Web Audio API compatibility</name>
  <files>src/audio/hooks/useAudioPlayer.ts</files>
  <action>
Make minimal targeted changes to `useAudioPlayer.ts` to work with the new Web Audio API engine. Most of the hook should remain unchanged since the engine interface is preserved. Specific changes:

1. **Remove the double AudioContext.resume() call in `play()` callback (line 200-208).** The hook currently calls `ctx.resume()` AND then `engine.play()` also calls `ctx.resume()`. With the Superpowered engine this was needed because the engine's play() was complex. With the new engine, `engine.play()` handles resume internally. The hook's play callback should just call `engine.play()` directly. Keep the `engine.isLoaded()` guard. Keep the `engine.ensureUnlocked()` call for iOS. Keep the `embedPlayback` integration.

   The updated play callback should be:
   ```
   const play = useCallback(() => {
     const engine = engineRef.current
     if (!engine.isLoaded()) return

     // iOS unlock
     engine.ensureUnlocked()

     // Set active embed (pauses all others)
     embedPlaybackRef.current?.setActiveEmbed(cardId)

     engine.play()
     setIsPlaying(true)
     onPlayRef.current?.()
   }, [cardId])
   ```

2. **Remove the `diagTestTone` and `__audioEngineState` window globals (lines 166-184).** These were debugging tools for the Superpowered issue. Remove the entire useEffect block that sets `window.__audioEngineDiag` and `window.__audioEngineState`. They clutter the window namespace and are no longer needed.

3. **Keep everything else unchanged:** The init flow, callbacks (onProgress, onLoaded, onEnded, onError), loadTrack, pause, seek, setSpeed, setVarispeedMode, setReverbMix, embed provider integration, cleanup on unmount -- all remain the same because the engine interface is preserved.
  </action>
  <verify>
Run `npx tsc --noEmit` -- no type errors.
Grep for `__audioEngineDiag` in the file -- should not appear.
Grep for `ctx.resume()` in useAudioPlayer.ts -- should not appear (resume is handled by engine.play()).
  </verify>
  <done>
Hook calls engine.play() without redundant AudioContext.resume(), debug globals removed, all other behavior preserved.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Replaced Superpowered SDK audio engine with standard Web Audio API implementation. The play button should now produce audible sound.</what-built>
  <how-to-verify>
    1. Run `npm run dev` and open the editor or a public page with an audio card that has an uploaded track
    2. Press the play button -- you should hear audio playing through your speakers
    3. Press pause -- audio should stop
    4. Press play again -- audio should resume from where it was paused
    5. Drag the waveform/progress bar to seek -- playback should jump to that position
    6. Adjust the varispeed slider -- playback speed should change (pitch will change too, this is expected)
    7. If multi-track: let a track end and verify the next track auto-advances
    8. Check browser console for any errors during all of the above
  </how-to-verify>
  <resume-signal>Type "approved" if audio plays correctly, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with no errors
- `npm run build` completes successfully
- No imports from `@superpoweredsdk/web` remain in `audioEngine.ts`
- No references to `SuperpoweredGlue`, `SuperpoweredWebAudio`, `processorNode`, `sendMessageToAudioScope` in engine
- `useAudioPlayer.ts` compiles and the play/pause/seek/progress cycle works
- Audio is audible when play is pressed on an audio card
</verification>

<success_criteria>
Audio plays audibly when the play button is pressed on any audio card. Play, pause, seek, and speed controls all function. Progress bar updates during playback. No console errors during normal playback operations.
</success_criteria>

<output>
After completion, create `.planning/quick/047-fix-audio-playback/047-SUMMARY.md`
</output>
