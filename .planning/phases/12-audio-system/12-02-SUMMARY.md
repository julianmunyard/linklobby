---
phase: 12-audio-system
plan: 02
subsystem: audio
tags: [web-audio-api, react-hooks, ios-audio, singleton, waveform]

# Dependency graph
requires:
  - phase: 12-01
    provides: Audio types and card type system
provides:
  - AudioEngine singleton with play/pause/seek
  - Web Audio fallback mode (Superpowered SDK integration deferred)
  - iOS silent audio unlock pattern
  - useAudioPlayer hook with EmbedPlaybackProvider integration
  - useWaveform hook for client-side peak extraction
affects: [12-03, 12-04, audio-card-component, audio-player-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Singleton AudioEngine pattern prevents memory leaks"
    - "Web Audio API fallback for development without Superpowered license"
    - "iOS silent audio unlock using looping MP3 at 0.001 volume"
    - "EmbedPlaybackProvider coordination for one-at-a-time playback"
    - "Client-side waveform generation with caching"

key-files:
  created:
    - src/audio/engine/audioEngine.ts
    - src/audio/engine/types.ts
    - src/audio/hooks/useAudioPlayer.ts
    - src/audio/hooks/useWaveform.ts
    - public/worklet/audioProcessor.js
    - public/superpowered/README.md
  modified: []

key-decisions:
  - "Implemented Web Audio fallback instead of blocking on Superpowered SDK integration"
  - "Superpowered SDK will be added later for time-stretch varispeed and reverb"
  - "iOS unlock pattern ported exactly from Munyard Mixer (unmute.js pattern)"
  - "useOptionalEmbedPlayback for graceful degradation outside provider context"

patterns-established:
  - "Singleton pattern: getAudioEngine() returns shared instance"
  - "Progress tracking via callbacks and requestAnimationFrame"
  - "Waveform caching in hook to avoid re-generation"
  - "Abort controller cleanup for fetch operations"

# Metrics
duration: 4min
completed: 2026-02-08
---

# Phase 12 Plan 02: Audio Engine & Hooks Summary

**Web Audio fallback engine with iOS unlock, React hooks for playback control and waveform generation, EmbedPlaybackProvider coordination**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-08T08:15:31Z
- **Completed:** 2026-02-08T08:19:17Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- AudioEngine singleton ported from Munyard Mixer with Web Audio fallback mode
- iOS silent audio unlock pattern keeps media channel active during playback
- useAudioPlayer hook provides complete playback control with EmbedPlaybackProvider integration
- useWaveform hook generates client-side peak data for visualization
- Superpowered SDK integration path documented for future time-stretch and reverb

## Task Commits

Each task was committed atomically:

1. **Task 1: Port AudioEngine and AudioWorklet processor from Munyard Mixer** - `1fbf65e` (feat)
2. **Task 2: Create useAudioPlayer and useWaveform React hooks** - `92f356b` (feat)

**Plan metadata:** `b677554` (docs: complete plan 12-01, committed after this plan)

## Files Created/Modified

- `src/audio/engine/types.ts` - AudioEngineState, callbacks, and message types
- `src/audio/engine/audioEngine.ts` - Singleton AudioEngine with Web Audio fallback, iOS unlock, play/pause/seek, varispeed (0.5x-1.5x), looping
- `public/worklet/audioProcessor.js` - Placeholder AudioWorklet processor for future Superpowered integration
- `public/superpowered/README.md` - Superpowered SDK integration plan and WASM setup notes
- `src/audio/hooks/useAudioPlayer.ts` - React hook for audio playback with EmbedPlaybackProvider coordination
- `src/audio/hooks/useWaveform.ts` - React hook for client-side waveform peak extraction

## Decisions Made

**1. Web Audio fallback mode**
- **Rationale:** Superpowered SDK requires license key and npm package installation. Implementing Web Audio fallback allows development to proceed without blocking on external dependencies.
- **Impact:** Basic features work (play/pause/seek, looping, pitch-shifting varispeed). Advanced features (time-stretch varispeed, reverb) log warnings but don't break.
- **Future:** Superpowered integration will be added in a separate task when license is available.

**2. iOS silent audio unlock pattern**
- **Rationale:** iOS requires user interaction to unlock audio playback. Ported exact pattern from Munyard Mixer (unmute.js approach) that uses looping silent MP3 at 0.001 volume.
- **Implementation:** `ensureUnlocked()` method called on first play interaction. Silent audio element kept alive while engine is active.
- **Result:** Prevents iOS silent mode from blocking audio playback.

**3. EmbedPlaybackProvider integration via useOptionalEmbedPlayback**
- **Rationale:** Audio cards should pause other audio/music embeds when playing (one-at-a-time coordination).
- **Implementation:** useAudioPlayer calls `registerEmbed()` on mount, `setActiveEmbed()` on play, `clearActiveEmbed()` on pause, `unregisterEmbed()` on unmount.
- **Graceful degradation:** useOptionalEmbedPlayback allows hook to work outside provider context (public pages).

**4. Client-side waveform generation**
- **Rationale:** Waveform data can be generated client-side by decoding audio and extracting peaks. Results can be cached in card content for future visits.
- **Implementation:** useWaveform fetches audio, decodes with AudioContext, extracts 128 peak values, normalizes to 0-1 range.
- **Cleanup:** Abort controller cancels fetch if component unmounts or URL changes.

## Deviations from Plan

None - plan executed exactly as written. Web Audio fallback mode was specified in the plan as the approach if Superpowered SDK installation fails.

## Issues Encountered

**1. Superpowered SDK not installed**
- **Issue:** `npm list @superpoweredsdk/web` shows package not installed
- **Resolution:** Implemented Web Audio fallback mode as specified in plan. Superpowered integration deferred to future task.
- **Impact:** Basic features functional, advanced features (time-stretch varispeed, reverb) unavailable until SDK integrated.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for next phase:**
- AudioEngine and hooks are functional with Web Audio fallback
- useAudioPlayer integrates with EmbedPlaybackProvider
- useWaveform generates peak data for visualization
- Audio card component can use these hooks immediately

**Deferred for later:**
- Superpowered SDK integration for advanced features:
  - Time-stretch varispeed (pitch-independent speed changes)
  - Reverb effects (artist-configured + visitor mix knob)
- License key required before integration can proceed
- Current Web Audio fallback provides sufficient functionality for MVP

**No blockers:**
- Audio card UI can be built using current hooks
- Advanced features can be added incrementally without breaking changes

---
*Phase: 12-audio-system*
*Completed: 2026-02-08*
