# Quick Task 079: Fix iOS Silent Mode Audio

## Goal
Audio plays through speaker even when iOS device is on silent/ringer-off mode. The silent audio unlock element (`ensureUnlocked()`) creates a looping `<audio>` element that never gets paused after unlock, keeping an active "playback" audio session that overrides the silent switch.

## Task 1: Pause silent audio element after media channel unlock

**File:** `src/audio/engine/audioEngine.ts`

**Change:** In `ensureUnlocked()`, after the `audioUnlocked = true` line, pause the silent audio element and remove it from DOM. The element only needs to play momentarily to unlock the iOS media channel — keeping it looping creates a persistent "playback" session that ignores the ringer switch.

**Before:**
```ts
this.silentAudioElement.play()
  .then(() => {
    this.audioUnlocked = true
    console.log('iOS media channel unlocked')
    if (this.processorNode?.context.state !== 'running') {
      this.processorNode.context.resume()
    }
  })
```

**After:**
```ts
this.silentAudioElement.play()
  .then(() => {
    this.audioUnlocked = true
    console.log('iOS media channel unlocked')
    // Stop the silent audio immediately — it only needs to play momentarily
    // to unlock the media channel. Keeping it looping creates a "playback"
    // audio session that overrides the iOS silent/ringer switch.
    if (this.silentAudioElement) {
      this.silentAudioElement.pause()
      this.silentAudioElement.src = ''
      if (this.silentAudioElement.parentNode) {
        this.silentAudioElement.parentNode.removeChild(this.silentAudioElement)
      }
      this.silentAudioElement = null
    }
    if (this.processorNode?.context.state !== 'running') {
      this.processorNode.context.resume()
    }
  })
```

Also clean up the `destroy()` method — it won't need to handle `silentAudioElement` cleanup since we now clean it up immediately after unlock.
