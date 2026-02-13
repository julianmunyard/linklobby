---
phase: quick
plan: 065
subsystem: api
tags: [ffmpeg, audio, mp3, conversion, upload]

# Dependency graph
requires:
  - phase: 12-audio-system
    provides: audio upload API route and card-audio Supabase bucket
provides:
  - Server-side WAV/FLAC/AIFF/OGG to MP3 conversion via FFmpeg
  - Duration extraction from all audio uploads via ffprobe
  - Consistent MP3 storage format for all audio cards
affects: [audio-system, audio-playback]

# Tech tracking
tech-stack:
  added: [fluent-ffmpeg, ffmpeg-static, "@types/fluent-ffmpeg"]
  patterns: [server-side audio conversion with temp file cleanup]

key-files:
  created:
    - src/lib/audio/convert-to-mp3.ts
  modified:
    - src/app/api/audio/upload/route.ts
    - package.json

key-decisions:
  - "192kbps CBR MP3 for web playback quality/size balance"
  - "MP3 passthrough without re-encoding to avoid quality loss"
  - "ffprobe for duration extraction (non-fatal on failure)"
  - "mkdtemp for unique temp directories on concurrent uploads"

patterns-established:
  - "Audio conversion pipeline: input buffer -> temp file -> ffmpeg -> output buffer -> cleanup"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Quick Task 065: WAV to MP3 Conversion Summary

**Server-side audio conversion pipeline using FFmpeg converting WAV/FLAC/AIFF/OGG to 192kbps MP3 with duration extraction via ffprobe**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T05:49:24Z
- **Completed:** 2026-02-13T05:52:01Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- All non-MP3 audio uploads automatically converted to 192kbps CBR MP3 server-side
- MP3 uploads pass through without re-encoding (no quality loss)
- Duration extracted from all uploads and returned in API response as seconds
- Storage paths always end in `.mp3` with `audio/mpeg` content type

## Task Commits

Each task was committed atomically:

1. **Task 1: Install FFmpeg dependencies and create conversion utility** - `ef14a41` (feat)
2. **Task 2: Integrate conversion into upload API route** - `3056d15` (feat)

## Files Created/Modified
- `src/lib/audio/convert-to-mp3.ts` - FFmpeg conversion utility with duration extraction, temp file cleanup, MP3 passthrough
- `src/app/api/audio/upload/route.ts` - Upload route now runs conversion pipeline before Supabase storage
- `package.json` - Added fluent-ffmpeg, ffmpeg-static, @types/fluent-ffmpeg

## Decisions Made
- **192kbps CBR MP3:** Good balance of quality and file size for web playback in Superpowered engine
- **MP3 passthrough:** Already-MP3 files skip re-encoding entirely, only get duration extracted via ffprobe
- **Non-fatal duration:** If ffprobe fails, duration returns 0 instead of throwing (conversion still proceeds)
- **Unique temp directories:** mkdtemp prevents conflicts on concurrent uploads
- **422 status for conversion errors:** Distinct from 500 server errors, with helpful message suggesting MP3 upload

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- fluent-ffmpeg shows npm deprecation warning but still functions correctly (no actively maintained alternative with equivalent API)

## User Setup Required
None - ffmpeg-static bundles the FFmpeg binary, no system install needed.

## Next Phase Readiness
- Audio upload pipeline complete with conversion and duration extraction
- Superpowered engine receives consistent MP3 format for all uploads
- Duration data available for player UI display

---
*Quick Task: 065-wav-to-mp3-conversion*
*Completed: 2026-02-13*
