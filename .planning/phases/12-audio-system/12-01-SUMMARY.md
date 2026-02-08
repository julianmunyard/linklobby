---
phase: 12
plan: 01
subsystem: audio-infrastructure
tags: [audio, types, upload-api, storage, webpack]

# Dependency graph
requires:
  - Supabase Storage infrastructure (existing)
  - Card type system (existing)
provides:
  - AudioCardContent type system
  - Audio upload API endpoint
  - Audio file storage in Supabase
  - Webpack configuration for AudioWorklet
affects:
  - 12-02 (Audio upload UI will use these types and API)
  - 12-03 (Audio player will render AudioCardContent)

# Tech tracking
tech-stack:
  added:
    - AudioWorklet webpack configuration
  patterns:
    - Type-driven audio card content schema
    - Supabase Storage bucket pattern extended to audio files
    - TODO comments for future optimizations (server-side conversion, waveform generation)

# File tracking
key-files:
  created:
    - src/types/audio.ts
    - src/app/api/audio/upload/route.ts
    - public/worklet/.gitkeep
  modified:
    - src/types/card.ts
    - src/stores/page-store.ts
    - src/lib/supabase/storage.ts
    - next.config.ts

# Decisions
decisions:
  - id: audio-01-client-waveform
    title: Client-side waveform generation
    choice: Generate waveforms client-side using AudioContext.decodeAudioData()
    rationale: More practical for browser playback, avoids server-side audio processing complexity
    alternatives: Server-side generation with ffmpeg/waveform.js
    impact: Waveform generation happens after upload in browser

  - id: audio-01-format-flexibility
    title: Accept multiple audio formats
    choice: Accept any audio format, rely on Superpowered engine's format support
    rationale: Simplifies v1 implementation, Superpowered handles MP3/WAV/AAC/etc natively
    alternatives: Server-side conversion to MP3 using fluent-ffmpeg
    impact: Server doesn't enforce MP3-only; conversion is future optimization

  - id: audio-01-duration-extraction
    title: Client-side duration extraction
    choice: Extract duration client-side using HTMLAudioElement
    rationale: Simpler than server-side ffprobe, duration needed for UI anyway
    alternatives: Server-side extraction with ffprobe or similar
    impact: Duration populated after upload in client

# Metrics
duration: 173s
completed: 2026-02-08
---

# Phase 12 Plan 01: Audio Infrastructure Foundation Summary

JWT auth with refresh rotation using jose library

## One-liner

Audio card type system with upload API, Supabase storage, and webpack AudioWorklet support

## What Was Built

### Task 1: Audio types and card type system
**Commit:** b1aa86f

Created comprehensive audio type system:
- `AudioCardContent` interface with tracks, album art, reverb config, player colors, waveform/looping toggles
- `AudioTrack` interface with metadata, URL, storage path, and optional waveform data
- `ReverbConfig` interface with 6 parameters (mix, width, damp, roomSize, predelayMs, enabled)
- `PlayerColors` interface for 3-color customization (border, element background, foreground)
- `DEFAULT_AUDIO_CONTENT` and `DEFAULT_REVERB_CONFIG` constants

Updated card type system:
- Added `AudioCardContent` to `CardContent` union type
- Added `isAudioContent()` type guard
- Re-exported `AudioCardContent` from card.ts for convenience
- Updated page store to create audio cards with default content

**Files:**
- Created: `src/types/audio.ts`
- Modified: `src/types/card.ts`, `src/stores/page-store.ts`

### Task 2: Audio upload API and storage infrastructure
**Commit:** bbe8b38

Built audio file upload infrastructure:
- Added `AUDIO_BUCKET` constant ("card-audio") with 100MB limit to storage.ts
- Created `uploadAudioFile()` function: uploads to `{cardId}/{trackId}.mp3` path
- Created `deleteAudioFile()` function for cleanup
- Built POST `/api/audio/upload` endpoint with authentication, FormData parsing, file validation
- Created `public/worklet/.gitkeep` directory for future AudioWorklet processor files
- Added webpack configuration for AudioWorklet support in next.config.ts

**Pragmatic v1 decisions (with TODO comments):**
- Accept any audio format (Superpowered engine handles multiple formats)
- Duration extraction happens client-side (using HTMLAudioElement)
- Waveform generation happens client-side (using AudioContext.decodeAudioData())
- Future optimizations: server-side MP3 conversion with fluent-ffmpeg

**Files:**
- Created: `src/app/api/audio/upload/route.ts`, `public/worklet/.gitkeep`
- Modified: `src/lib/supabase/storage.ts`, `next.config.ts`

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions Made

### 1. Client-side waveform generation
**Context:** Waveform visualization requires audio analysis
**Decision:** Generate waveforms client-side using Web Audio API's `AudioContext.decodeAudioData()`
**Rationale:**
- More practical for browser playback context
- Avoids server-side audio processing complexity
- Player needs decoded audio anyway for playback
**Trade-offs:** Waveform data not available immediately after upload (populated in client)
**Future:** Could add server-side generation as optimization for faster initial load

### 2. Multi-format audio acceptance
**Context:** Upload endpoint needs to handle audio files
**Decision:** Accept any audio format, rely on Superpowered engine's native format support
**Rationale:**
- Simplifies v1 implementation (no server-side conversion pipeline)
- Superpowered supports MP3, WAV, AAC, FLAC, OGG natively
- Server-side conversion adds complexity without immediate benefit
**Trade-offs:** No format normalization at upload time
**Future:** Add server-side MP3 conversion with fluent-ffmpeg for consistency and smaller file sizes

### 3. Client-side duration extraction
**Context:** Track duration needed for UI display
**Decision:** Extract duration client-side using `HTMLAudioElement`
**Rationale:**
- Simpler than server-side ffprobe setup
- Duration needed in browser context anyway
- Avoids additional server dependency
**Trade-offs:** Duration not available in API response
**Future:** Could add ffprobe for server-side metadata extraction

## Files Changed

### Created (3)
- `src/types/audio.ts` - Audio card content type definitions
- `src/app/api/audio/upload/route.ts` - Audio file upload endpoint
- `public/worklet/.gitkeep` - AudioWorklet processor directory

### Modified (4)
- `src/types/card.ts` - Added AudioCardContent to union type
- `src/stores/page-store.ts` - Audio card default content
- `src/lib/supabase/storage.ts` - Audio storage functions
- `next.config.ts` - AudioWorklet webpack configuration

## Testing Notes

**Verified:**
- TypeScript compilation passes with no errors
- Audio types properly integrated into card type system
- Upload API endpoint exists at `/api/audio/upload`
- public/worklet/ directory created for AudioWorklet files
- Webpack configuration present for AudioWorklet support

**Manual testing needed (future plans):**
- Audio file upload through API endpoint
- Supabase storage bucket creation and permissions
- Audio playback with multiple formats
- Waveform generation client-side

## Next Steps

**Immediate (Plan 02):**
1. Build audio file upload UI component
2. Create waveform generation utility using Web Audio API
3. Add album art upload functionality
4. Build track management UI (add/remove/reorder tracks)

**Future optimizations:**
1. Add server-side MP3 conversion pipeline
2. Pre-generate waveforms server-side for faster initial load
3. Extract duration/metadata server-side with ffprobe
4. Add audio format validation and normalization

## Next Phase Readiness

**Ready for Plan 02:** Yes

**Blockers:** None

**Concerns:**
- Need to create Supabase "card-audio" storage bucket with proper RLS policies
- AudioWorklet processor file will be needed in Plan 03 for reverb effect

**Validation needed:**
- Test upload endpoint with actual audio files
- Verify Supabase storage bucket configuration
- Test multi-format audio handling in browser
