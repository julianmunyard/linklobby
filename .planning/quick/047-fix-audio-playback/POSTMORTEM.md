# Quick-047: Fixing Superpowered Audio Playback — Full Postmortem

## What Was Asked

Julian wanted to revert LinkLobby's audio back to Superpowered SDK playback. A previous attempt (quick-047) had tried replacing Superpowered with a plain Web Audio API fallback. Those commits were already reverted via git (`c619c4f`, `b843016`), but the audio still wasn't working — because it had **never actually been wired up to Superpowered in the first place**. The `audioEngine.ts` file was always a Web Audio API placeholder that was never connected to the Superpowered AudioWorklet processor.

The reference implementation was Munyard Mixer (`/Users/julianmunyard/Documents/ESSENTIAL WEBSITES/NEW MUNYARD MIXER`), Julian's other project where Superpowered audio works perfectly.

---

## The Struggle — A Timeline of Failures

### Mistake 1: Accidentally Discarding the Superpowered Infrastructure

Early on, I misunderstood the situation. There were uncommitted changes that added the Superpowered SDK infrastructure (COOP/COEP headers, `@superpoweredsdk/web` package, processor files, type definitions). I ran `git checkout HEAD` on these files, thinking they were leftover mess. They were actually the foundation we needed. Julian was furious.

**Fix:** I restored every file from the diffs I had captured earlier in the conversation. Lesson: understand what uncommitted changes are before discarding them.

### Mistake 2: Discovering audioEngine.ts Was Never Connected

After restoring the infrastructure, audio still didn't work. Investigation revealed that `audioEngine.ts` was a plain Web Audio API fallback — it used `new Audio()` and `HTMLAudioElement`, not Superpowered at all. The processor file (`public/processors/audioCardProcessor.js`) existed and was correctly written, but the main-thread engine never loaded it.

**Fix:** Complete rewrite of `audioEngine.ts` to match Munyard Mixer's `thomasAudioEngine.js` pattern:
- `SuperpoweredGlue.Instantiate()` → `SuperpoweredWebAudio()` → `createAudioNodeAsync()` → connect to destination
- Play = `context.resume()` + send play command to processor
- Pause = `context.suspend()`
- Track loading via `sendMessageToAudioScope({ command: 'loadTrack', url })`

### Mistake 3: AudioContext Mismatch (InvalidAccessError)

After the rewrite, clicking play threw:
```
InvalidAccessError: cannot connect to an AudioNode belonging to a different audio context
```

**Root cause:** `SuperpoweredWebAudio` constructor checks if the AudioContext's sample rate is below the minimum (48000). If it is, it **closes the original context and creates a new one**. The processor node ended up on a different context than `webaudioManager.audioContext`.

**Fix:** Changed all references from `this.webaudioManager.audioContext` to `this.processorNode.context`. The processor node always knows its own context. Munyard Mixer happens to work with `webaudioManager.audioContext` because its system sample rate is >= 48000, but using `processorNode.context` is more robust.

### Mistake 4: TypeScript/Turbopack Build Errors

Tried importing Superpowered SDK via dynamic import from `/SP-es6.js` to avoid bundler issues. This caused:
- `TS2307: Cannot find module '/SP-es6.js'` — TypeScript can't resolve URL paths
- `Module not found: Can't resolve './SP-es6.js'` — Turbopack intercepted the dynamic import

**Fix:** Went back to the npm import `from '@superpoweredsdk/web'`. The npm package works fine for the main-thread import.

### Mistake 5: Play Button Constantly Loading (Track Never Loads)

The Superpowered engine initialized, the processor loaded, but clicking play showed an infinite loading spinner. The `loaded` event from the processor never fired. The track was never decoded.

**Root cause:** Turbopack mangles `SuperpoweredGlue.toString()`. The SDK uses this to create a blob URL Worker that downloads and decodes audio files. With mangled source code, the Worker was invalid and silently failed.

**Attempted workaround:** Created a manual Worker file at `/public/workers/trackLoader.js`:
```javascript
importScripts('/SP-es6-classic.js');
SuperpoweredGlue.wasmCDNUrl = '/superpowered/superpowered.wasm';
onmessage = SuperpoweredGlue.loaderWorkerOnmessage;
```
And patched the SDK: `this.superpowered._trackLoaderSource = '/workers/trackLoader.js'`

This also required creating `/public/SP-es6-classic.js` (a non-module version of the SDK for `importScripts` compatibility).

**Result:** Still didn't work. The fundamental problem was Turbopack, not the Worker loading mechanism.

### The Breakthrough: Comparing with Munyard Mixer

A thorough comparison between Munyard Mixer and LinkLobby revealed the **root cause**:

**Munyard Mixer's package.json:**
```json
"dev:next": "next dev --webpack",
"build": "... next build --webpack"
```

**LinkLobby's package.json:**
```json
"dev": "next dev",
"build": "next build"
```

Next.js 16 uses Turbopack by default. Munyard Mixer explicitly uses `--webpack`. LinkLobby's `next.config.ts` even had `turbopack: {}` explicitly configured.

### Fix 1: Switch to Webpack

```json
"dev": "next dev --webpack",
"build": "next build --webpack"
```
Removed `turbopack: {}` from `next.config.ts`.

**Result:** Engine initialized, processor loaded... but track STILL didn't load.

### Fix 2: Use CDN for WASM (Not Local File)

The SDK has two WASM files in its npm package:
- `superpowered.wasm` (1,348,861 bytes)
- `superpowered-npm.wasm` (1,348,742 bytes) — **this is what the CDN serves**

We were serving `superpowered.wasm` locally at `/superpowered/superpowered.wasm`. But the SDK's track loader Worker defaults to loading `superpowered-npm.wasm` from CDN. These are **different files**.

Munyard Mixer doesn't pass a WASM path to `SuperpoweredGlue.Instantiate()` — it uses the CDN default.

**Fix:** Removed the WASM path parameter:
```typescript
// Before (broken)
this.superpowered = await SuperpoweredGlue.Instantiate(
  'ExampleLicenseKey-WillExpire-OnNextUpdate',
  '/superpowered/superpowered.wasm'
)

// After (working) — matches Munyard Mixer exactly
this.superpowered = await SuperpoweredGlue.Instantiate(
  'ExampleLicenseKey-WillExpire-OnNextUpdate'
)
```

**Result: Audio plays.**

### Fix 3: Pause Required Double-Tap

After everything worked, pause required tapping twice. The engine's `pause()` had a guard:
```typescript
if (!this.processorNode || !this.isPlayingFlag) return
```

If `isPlayingFlag` got out of sync with React state, pause would silently return. Since `context.suspend()` is idempotent (calling it when already suspended is harmless), the fix was removing the flag guard:
```typescript
if (!this.processorNode) return
```

---

## Files That Were Needed

### Modified (essential)
| File | What Changed |
|------|-------------|
| `src/audio/engine/audioEngine.ts` | Complete rewrite from Web Audio fallback to Superpowered SDK. Uses `processorNode.context` instead of `webaudioManager.audioContext`. CDN WASM. |
| `src/audio/hooks/useAudioPlayer.ts` | Changed `isInitializedRef` to `initPromiseRef` to properly await engine init before loading tracks. |
| `src/audio/engine/types.ts` | Added `ProcessorEvent` type, changed seek to use `positionMs`. |
| `package.json` | Added `@superpoweredsdk/web: ^2.7.6`. Changed scripts to use `--webpack`. |
| `next.config.ts` | Added WASM content-type headers, COOP/COEP headers. Removed `turbopack: {}`. |
| `src/middleware.ts` | Added COOP/COEP headers for SharedArrayBuffer (required by Superpowered). |
| `src/app/api/audio/upload/route.ts` | Direct Supabase upload. |
| `src/components/editor/audio-card-fields.tsx` | Better audio file type detection. |

### Already Existed (unchanged, essential)
| File | Role |
|------|------|
| `public/processors/audioCardProcessor.js` | Superpowered AudioWorklet processor. Handles `loadTrack`, `play`, `seek`, `setVarispeed`, reverb, looping. Calls `downloadAndDecode` for track loading. |
| `public/SP-es6.js` | Superpowered SDK bundle loaded inside the AudioWorklet processor via `import`. |

### Created But NOT Needed (workarounds for Turbopack)
| File | Why Not Needed |
|------|---------------|
| `public/SP-es6-classic.js` | Non-module version for `importScripts`. Not needed with Webpack. |
| `public/workers/trackLoader.js` | Manual Worker workaround for Turbopack mangling `toString()`. Not needed with Webpack. |
| `public/superpowered/superpowered.wasm` | Local WASM file. Not needed — SDK uses CDN default. |
| `src/types/superpowered-web.d.ts` | Type declarations for `@superpoweredsdk/web`. May still be useful for TypeScript but not critical for playback. |

---

## What Made It Finally Work — The Two Root Causes

### 1. Turbopack breaks `SuperpoweredGlue.toString()`

The Superpowered SDK creates a Web Worker by calling `SuperpoweredGlue.toString()` to get the class source code, then wraps it in a blob URL. This Worker downloads and decodes audio files. Turbopack transforms/mangles the class source, making the blob Worker invalid. The Worker silently fails — no error, no decoded audio, infinite loading.

**Solution:** Use `--webpack` flag, matching Munyard Mixer. Webpack preserves the class source code.

### 2. Wrong WASM file

The SDK npm package contains two different WASM binaries:
- `superpowered.wasm` — for direct/local use
- `superpowered-npm.wasm` — for CDN distribution (what the SDK defaults to)

We were serving `superpowered.wasm` locally, but the track loader Worker (created by the SDK internally) defaults to loading WASM from CDN (`superpowered-npm.wasm`). Even when we overrode the URL to point to our local file, the Worker was loading the wrong binary.

**Solution:** Don't pass a WASM path to `Instantiate()`. Let the SDK use its CDN default, exactly like Munyard Mixer.

---

## How the Audio Flow Actually Works

Understanding this flow was essential to debugging:

1. **Main thread:** `SuperpoweredGlue.Instantiate()` → loads WASM, initializes SDK
2. **Main thread:** `SuperpoweredWebAudio(48000, superpowered)` → creates AudioContext
3. **Main thread:** `createAudioNodeAsync(processorUrl, 'AudioCardProcessor', callback)` → loads the processor as an AudioWorklet, passes WASM code to it
4. **Main thread:** `processorNode.connect(context.destination)` → audio output
5. **Main thread:** `context.suspend()` → silence until play
6. **User clicks play:** `context.resume()` → `processAudio()` starts being called in the processor
7. **Hook calls:** `sendMessageToAudioScope({ command: 'loadTrack', url })` → processor receives it
8. **Processor:** `this.Superpowered.downloadAndDecode(url, this)` → sends `SuperpoweredLoad` message to main thread
9. **Main thread (SDK internal):** `handleTrackLoaderMessage()` → creates blob URL Worker from `SuperpoweredGlue.toString()`
10. **Worker:** Loads WASM from CDN, fetches audio file, decodes it, posts buffer back
11. **Main thread (SDK internal):** `transferLoadedTrack()` → posts decoded buffer to processor
12. **Processor:** `onMessageFromMainScope({ SuperpoweredLoaded })` → `loadAsset()` → loads into `AdvancedAudioPlayer`
13. **Processor:** Sends `{ event: 'loaded' }` to main thread → hook sets `isLoaded = true`
14. **Processor:** `processAudio()` runs every ~2.67ms, gets audio from player, applies reverb, writes to output buffer

Step 9 is where Turbopack broke everything — the blob Worker source was mangled.
Step 10 is where the wrong WASM file broke everything — the Worker couldn't initialize Superpowered.

---

## Lessons Learned

1. **Turbopack is not compatible with Superpowered SDK.** The SDK relies on `Class.toString()` to create Workers. Turbopack transforms class source code, breaking this pattern. Always use `--webpack` for Superpowered projects.

2. **`superpowered.wasm` and `superpowered-npm.wasm` are different files.** Don't assume they're interchangeable. When in doubt, use the SDK's CDN default.

3. **Match the reference implementation exactly.** Every time we diverged from Munyard Mixer's pattern, we hit a new bug. The final working code mirrors `thomasAudioEngine.js` almost line-for-line.

4. **`context.suspend()` is idempotent.** Don't guard it with state flags — just call it.

5. **Silent failures are the worst.** The Worker creation failure produced no console errors. The WASM mismatch produced no console errors. Both just silently failed, leaving the loading spinner spinning forever.
