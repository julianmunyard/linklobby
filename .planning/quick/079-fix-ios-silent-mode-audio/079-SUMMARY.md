# Quick Task 079 Summary: Fix iOS Silent Mode Audio

## Problem
Audio played through the speaker even when the iOS device was on silent/ringer-off mode.

## Root Cause
The `ensureUnlocked()` method in `audioEngine.ts` creates a silent `<audio>` element with `loop = true` to unlock the iOS media channel during a user gesture. However, after unlock succeeded, the element was never paused — it kept looping indefinitely. An actively playing `<audio>` element establishes a "playback" audio session on iOS, which overrides the silent/ringer switch and forces all audio (including Web Audio API output) through the speaker.

## Fix
After the silent audio element successfully unlocks the media channel (`audioUnlocked = true`), immediately pause it, clear its source, and remove it from the DOM. The element only needs to play momentarily to unlock the channel — the AudioContext stays running independently.

## File Changed
- `src/audio/engine/audioEngine.ts` — Added cleanup of `silentAudioElement` after successful unlock in `ensureUnlocked()`
