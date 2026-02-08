# Phase 12: Audio System - Research

**Researched:** 2026-02-08
**Domain:** Web Audio API, AudioWorklet, Superpowered SDK (WASM), Next.js audio integration
**Confidence:** HIGH

## Summary

Phase 12 requires porting a complete audio engine from the existing Munyard Mixer codebase to LinkLobby. The research confirms that all key technologies are well-understood and proven:

1. **Superpowered SDK (@superpoweredsdk/web v2.7.2)** - A production-ready WebAssembly audio library that handles all DSP (reverb, varispeed, time-stretching) across all devices including mobile. No fallback systems needed.

2. **AudioWorklet architecture** - The Munyard Mixer implementation uses AudioWorkletNode with message-based IPC between main thread and audio processor. This pattern is tested and working in production.

3. **iOS silent audio unlock** - Critical requirement for iOS playback. Munyard Mixer has a proven implementation using a looping silent MP3 to keep the media channel unlocked.

The reference implementation at `/Users/julianmunyard/Documents/ESSENTIAL WEBSITES/NEW MUNYARD MIXER` provides all necessary patterns. This is a **code porting task**, not a research/build task.

**Primary recommendation:** Port audio engine directly from Munyard Mixer, adapt UI components to LinkLobby's theme system, integrate with existing EmbedPlaybackProvider for one-at-a-time playback.

## Standard Stack

### Core (Ported from Munyard Mixer)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @superpoweredsdk/web | ^2.7.2 | WebAssembly audio engine with DSP effects | Industry-standard for low-latency web audio, handles all platforms without fallbacks |
| Web Audio API | Native | AudioWorkletNode integration | Browser standard for real-time audio processing |
| Next.js | 16.x | Framework | Already in use, requires webpack config for AudioWorklet |

### Supporting (Audio File Handling)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lamejs | Latest | WAV to MP3 conversion (client-side option) | If client-side conversion chosen for files <20MB |
| ffmpeg.wasm | ^0.13.x | WAV to MP3 conversion (client-side option) | If client-side conversion chosen, handles any format |
| wavesurfer.js | ^7.x | Waveform visualization | If real-time waveform chosen over pre-computed |
| waveform-data.js | Latest | Pre-computed waveform generation | If pre-computed approach chosen (recommended for performance) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Superpowered SDK | Tone.js or Howler.js | Lacks time-stretch varispeed and quality reverb. Superpowered chosen because it's already proven in Munyard Mixer |
| AudioWorklet | ScriptProcessorNode | Deprecated, has latency issues. AudioWorklet is the modern standard |
| Client-side conversion | Server-side FFmpeg | Client-side preserves privacy and reduces server load, but limited by browser memory (~100MB is safe limit) |
| Pre-computed waveforms | Real-time generation | Real-time is CPU-intensive, pre-computed is better for visitor experience |

**Installation:**
```bash
npm install @superpoweredsdk/web
# For waveform (if chosen):
npm install waveform-data.js
# For client-side conversion (if chosen):
npm install lamejs
# OR
npm install @ffmpeg.wasm/main @ffmpeg.wasm/core-st
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── audio/
│   ├── engine/                     # Audio engine core (ported)
│   │   ├── audioEngine.ts         # Main engine class
│   │   ├── types.ts               # Engine type definitions
│   │   └── utils/                 # Audio utilities
│   ├── hooks/
│   │   ├── useAudioPlayer.ts      # Hook for audio card playback
│   │   └── useWaveform.ts         # Hook for waveform generation
│   └── worklet/
│       └── audioProcessor.js      # AudioWorklet processor
├── components/
│   ├── cards/
│   │   └── audio-card.tsx         # Audio card renderer
│   ├── audio/
│   │   ├── audio-player.tsx       # Base player component
│   │   ├── player-controls.tsx    # Play/pause/scrub controls
│   │   ├── varispeed-slider.tsx   # Ported from Munyard Mixer
│   │   ├── reverb-knob.tsx        # Simple visitor knob
│   │   ├── reverb-config-modal.tsx # Full editor config
│   │   ├── waveform-display.tsx   # Waveform or progress bar
│   │   └── track-list.tsx         # Multi-track selector
│   └── editor/
│       └── audio-card-fields.tsx  # Editor controls
├── types/
│   └── audio.ts                   # Audio card types
public/
├── worklet/
│   └── audioProcessor.js          # Deployed AudioWorklet
└── superpowered/
    ├── superpowered.wasm          # Superpowered WASM binary
    └── SP-es6.js                  # Superpowered loader
```

### Pattern 1: AudioWorklet Integration in Next.js

**What:** AudioWorklet requires special webpack configuration in Next.js to load processor scripts.

**When to use:** Required for any AudioWorklet usage.

**Example:**
```typescript
// next.config.ts
const config = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Set global object for AudioWorklet context
      config.output.globalObject = "(typeof self !== 'undefined' ? self : this)"

      // Set public path for chunk loading
      config.output.publicPath = "/_next/"
    }
    return config
  }
}
```

**Source:** [Next.js Discussion #62376](https://github.com/vercel/next.js/discussions/62376), [Next.js Issue #24907](https://github.com/vercel/next.js/issues/24907)

### Pattern 2: iOS Silent Audio Unlock

**What:** iOS requires a silent audio track to keep the media channel unlocked, enabling Web Audio API playback even when device is muted.

**When to use:** Required for iOS support.

**Example:**
```typescript
// From Munyard Mixer useAudioEngine.ts (lines 143-239)
// Create silent MP3 audio element
const audio = document.createElement('audio')
audio.loop = true
audio.volume = 0.001 // Not zero (iOS mutes zero volume)
audio.preload = 'auto'
audio.setAttribute('playsinline', 'true')

// High-quality silent MP3 (from unmute.js pattern)
const huffman = (count: number, repeatStr: string): string => {
  let e = repeatStr
  for (; count > 1; count--) e += repeatStr
  return e
}
const silence = "data:audio/mpeg;base64,//uQx" + huffman(23, "A") + "WGluZw..."
audio.src = silence
audio.load()

// Play on first user interaction
await audio.play()
audioUnlockedRef.current = true

// Keep playing while audio engine is active
// DO NOT pause when pausing main audio
```

**Source:** Munyard Mixer codebase, [unmute-ios-audio pattern](https://github.com/feross/unmute-ios-audio), [iOS Web Audio API quirks](https://adactio.medium.com/web-audio-api-update-on-ios-1e553fff7847)

### Pattern 3: Message-Based Engine Control

**What:** AudioWorklet runs in separate thread. Control via message passing.

**When to use:** All audio engine operations (play, pause, seek, effects).

**Example:**
```typescript
// From thomasAudioEngine.js
class AudioEngine {
  sendMessageToAudioProcessor(message: any) {
    this.audioWorkletNode.sendMessageToAudioScope(message)
  }

  // Play command
  play() {
    this.sendMessageToAudioProcessor({
      type: "command",
      data: { command: "play" }
    })
  }

  // Varispeed command
  setVarispeed(speed: number, isNatural: boolean) {
    this.sendMessageToAudioProcessor({
      type: "command",
      data: {
        command: "setVarispeed",
        speed,
        isNatural
      }
    })
  }
}
```

### Pattern 4: EmbedPlaybackProvider Integration

**What:** Use existing provider to ensure only one audio source plays at a time.

**When to use:** Audio cards must coordinate with music embeds.

**Example:**
```typescript
// From existing embed-provider.tsx
function AudioCard() {
  const { setActiveEmbed, clearActiveEmbed } = useEmbedPlayback()
  const cardId = card.id

  const handlePlay = () => {
    setActiveEmbed(cardId) // Pauses all other embeds/audio
    audioEngine.play()
  }

  const handlePause = () => {
    clearActiveEmbed(cardId)
    audioEngine.pause()
  }

  // Register pause function on mount
  useEffect(() => {
    registerEmbed(cardId, handlePause)
    return () => unregisterEmbed(cardId)
  }, [])
}
```

### Pattern 5: Theme-Adapted Player Layout

**What:** Same layout elements, different visual styling per theme.

**When to use:** All audio players across all themes.

**Example:**
```typescript
// Base layout (consistent):
interface AudioPlayerLayout {
  playPauseToggle: JSX.Element
  albumArt: JSX.Element // Square
  varispeedSlider: JSX.Element
  reverbKnob: JSX.Element
  progressBar: JSX.Element // OR waveform
  timeDisplay: JSX.Element
  trackInfo: JSX.Element // title + artist + duration
}

// Theme-specific styling:
function AudioPlayer({ themeId, colors }) {
  if (themeId === 'mac-os') {
    return <MacintoshPlayer layout={baseLayout} font="Pix Chicago" pixelArt />
  }
  if (themeId === 'system-settings') {
    return <PoolsuitePlayer layout={baseLayout} font="Ishmeria" creamBox />
  }
  if (themeId === 'receipt') {
    return <ReceiptPlayer layout={baseLayout} monospace blackOnWhite />
  }
  if (themeId === 'ipod-classic') {
    return <iPodPlayer layout={baseLayout} lcdScreen clickWheel />
  }
  // ... etc
}
```

### Anti-Patterns to Avoid

- **Different layouts per theme:** Same elements, just restyled. Don't move elements or change structure.
- **Custom audio processing:** Use Superpowered SDK for all DSP. Don't hand-roll reverb or varispeed.
- **Mobile chunking fallback:** Superpowered handles all devices. Don't create StreamingAudioManager.
- **Volume controls:** Visitors use device volume. Don't add volume slider.
- **Autoplay:** Never autoplay. iOS blocks it anyway.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reverb DSP | Custom convolution reverb | Superpowered Reverb | Superpowered has high-quality reverb with all parameters (mix, width, damp, room size, predelay). Proven in Munyard Mixer |
| Varispeed (time-stretch) | Custom pitch-shift algorithm | Superpowered TimeStretcher | Natural mode (vinyl-style) and Time-Stretch mode (constant pitch). Complex DSP, use proven library |
| iOS audio unlock | Custom unlock sequence | Munyard Mixer pattern | Tested across iOS versions, handles page visibility, uses optimal silent MP3 format |
| AudioWorklet setup | Custom worklet registration | Superpowered's SuperpoweredWebAudio helper | Handles WASM loading, AudioContext setup, worklet registration correctly |
| Waveform generation | Canvas drawing from audio buffer | waveform-data.js | Handles resampling, efficient storage, zoom levels. BBC library, battle-tested |
| One-at-a-time playback | Custom pause coordination | Existing EmbedPlaybackProvider | Already implements pause coordination for music embeds, just extend it |

**Key insight:** Audio DSP is complex. Superpowered SDK solves the hard problems (reverb quality, time-stretching algorithms, mobile compatibility). Don't reinvent these wheels.

## Common Pitfalls

### Pitfall 1: AudioWorklet 404 in Next.js Production

**What goes wrong:** AudioWorklet processor file loads in dev but 404s in production build.

**Why it happens:** Next.js bundles everything by default. AudioWorklet needs separate file.

**How to avoid:**
1. Place processor in `public/worklet/audioProcessor.js` (not bundled)
2. Set webpack `output.publicPath = "/_next/"` in next.config.ts
3. Load with full origin URL: `window.location.origin + '/worklet/audioProcessor.js'`

**Warning signs:** "Failed to load AudioWorklet module" in production console.

**Source:** [Next.js AudioWorklet discussion](https://github.com/vercel/next.js/discussions/62376), Munyard Mixer implementation

### Pitfall 2: iOS Silent Mode Blocks All Audio

**What goes wrong:** Audio plays on desktop but silent on iOS even when user taps play.

**Why it happens:** iOS has two audio channels: ringer (muted by silent switch) and media (unmuted). Web Audio API defaults to ringer channel.

**How to avoid:**
1. Play silent HTML5 audio element on first user interaction
2. Keep it playing (looped) while audio engine is active
3. Use data URI MP3 (not WAV) for best iOS compatibility
4. Handle page visibility changes (destroy/recreate when hidden/shown)

**Warning signs:** Audio doesn't start on iOS, or stops when page becomes hidden.

**Source:** [unmute-ios-audio library](https://github.com/feross/unmute-ios-audio), [iOS Web Audio quirks](https://adactio.com/journal/17709), Munyard Mixer proven implementation

### Pitfall 3: Large File Upload Timeouts

**What goes wrong:** 100MB audio files fail to upload or time out.

**Why it happens:** Default Next.js body size limits, no upload progress feedback.

**How to avoid:**
1. Increase Next.js body size limit in API route config
2. Stream upload in chunks (streaming file upload pattern)
3. Show progress bar during upload
4. Validate file size client-side before upload (100MB max)
5. Consider client-side conversion to reduce upload size

**Warning signs:** Upload hangs at 100%, timeout errors after 30-60 seconds.

**Source:** [Next.js large file uploads](https://dev.to/grimshinigami/how-to-handle-large-filefiles-streams-in-nextjs-13-using-busboymulter-25gb), [Streaming uploads in Node.js](https://oneuptime.com/blog/post/2026-01-30-nodejs-streaming-file-uploads/view)

### Pitfall 4: Memory Leak from AudioContext

**What goes wrong:** Audio keeps playing after component unmounts, or multiple AudioContexts created.

**Why it happens:** AudioContext and AudioWorkletNode not cleaned up properly.

**How to avoid:**
1. Single AudioEngine instance (singleton or global ref)
2. Cleanup in component unmount: `audioEngine.pause()` and `audioEngine.stop()`
3. Don't create new AudioContext on every render
4. Reuse engine across card instances if possible

**Warning signs:** Audio continues after navigation, browser warns "too many AudioContexts".

**Source:** Web Audio API best practices, Munyard Mixer cleanup patterns in useAudioEngine.ts (lines 126-139)

### Pitfall 5: Waveform Generation Blocks UI

**What goes wrong:** Browser freezes while generating waveform from large audio file.

**Why it happens:** Waveform calculation is CPU-intensive, runs on main thread.

**How to avoid:**
1. Use pre-computed waveforms (generate on upload, store in DB)
2. OR: Generate in Web Worker (off main thread)
3. OR: Use waveform-data.js which handles chunking efficiently
4. Show loading state during generation

**Warning signs:** UI freezes when audio loads, especially on mobile.

**Source:** [waveform-data.js documentation](https://github.com/bbc/waveform-data.js), performance best practices

## Code Examples

Verified patterns from Munyard Mixer and official sources:

### Audio Engine Initialization

```typescript
// Source: Munyard Mixer audio/engine/thomasAudioEngine.js
import { SuperpoweredGlue, SuperpoweredWebAudio } from "@superpoweredsdk/web"

class AudioEngine {
  webaudioManager = null
  audioWorkletNode = null
  superpowered = null

  async init() {
    // Initialize Superpowered WASM
    this.superpowered = await SuperpoweredGlue.Instantiate(
      "YourLicenseKey"
    )

    // Create Web Audio manager
    this.webaudioManager = new SuperpoweredWebAudio(48000, this.superpowered)
    this.webaudioManager.audioContext.suspend()

    // Load AudioWorklet processor
    const processorUrl = `${window.location.origin}/worklet/audioProcessor.js`

    this.audioWorkletNode = await this.webaudioManager.createAudioNodeAsync(
      processorUrl,
      "AudioProcessor",
      this.handleMessageFromProcessor
    )

    // Connect to output
    this.audioWorkletNode.connect(
      this.webaudioManager.audioContext.destination
    )
  }

  handleMessageFromProcessor = (message) => {
    if (message.event === "ready") {
      console.log("Audio processor ready")
    }
    // ... handle other events
  }
}
```

### Varispeed Control (Both Modes)

```typescript
// Source: Munyard Mixer useAudioEngine.ts (lines 475-492)
const setVarispeedControl = useCallback((speed: number, isNatural: boolean) => {
  if (!mixerEngineRef.current?.audioEngine) return

  mixerEngineRef.current.audioEngine.sendMessageToAudioProcessor({
    type: "command",
    data: {
      command: "setVarispeed",
      speed: speed,        // 0.5 to 1.5
      isNatural: isNatural // true = vinyl-style, false = time-stretch
    }
  })

  setVarispeed(speed)
  setIsNaturalVarispeed(isNatural)
}, [])
```

### Reverb Configuration (Artist Editor)

```typescript
// Source: Munyard Mixer ReverbConfigModal.tsx
interface ReverbConfig {
  mix: number         // Wet/dry mix (0-1)
  width: number       // Stereo width (0-1)
  damp: number        // High frequency damping (0-1)
  roomSize: number    // Reverb decay time (0-1)
  predelayMs: number  // Pre-delay in milliseconds (0-200)
  lowCutHz: number    // Low cut filter frequency (0-500)
  enabled: boolean
}

// Artist configures full params in editor
function ReverbConfigModal({ onSave, initialConfig }) {
  const [config, setConfig] = useState<ReverbConfig>(initialConfig)

  return (
    <div>
      <Slider
        value={config.mix}
        onChange={(mix) => setConfig({...config, mix})}
        min={0} max={1} step={0.01}
      />
      {/* ...other controls */}
      <Button onClick={() => onSave(config)}>Save</Button>
    </div>
  )
}

// Visitor sees single knob that controls mix only
function ReverbKnob({ config }) {
  const [mix, setMix] = useState(config.mix)

  return (
    <Knob
      value={mix}
      onChange={(newMix) => {
        setMix(newMix)
        audioEngine.sendMessage({
          type: "command",
          data: { command: "setReverbMix", mix: newMix }
        })
      }}
    />
  )
}
```

### Analytics Tracking Integration

```typescript
// Source: LinkLobby src/lib/analytics/track-event.ts
interface TrackAudioPlayPayload {
  cardId: string
  pageId: string
  trackTitle?: string
  duration?: number
}

export async function trackAudioPlay(payload: TrackAudioPlayPayload): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'audio_play',
        ...payload
      })
    })
  } catch (error) {
    // Swallow errors - tracking should never break user experience
    console.debug('Failed to track audio play:', error)
  }
}

// In audio player component:
const handlePlay = () => {
  audioEngine.play()
  trackAudioPlay({
    cardId: card.id,
    pageId,
    trackTitle: currentTrack.title,
    duration: currentTrack.duration
  })
}
```

### Multi-Track Card

```typescript
interface AudioCardContent {
  tracks: AudioTrack[]
  albumArt: string
  // ... other fields
}

interface AudioTrack {
  id: string
  title: string
  artist: string
  duration: number
  audioUrl: string
}

function AudioCard({ card }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const currentTrack = card.content.tracks[currentTrackIndex]

  const handleTrackSelect = (index: number) => {
    audioEngine.pause()
    setCurrentTrackIndex(index)
    audioEngine.loadTrack(card.content.tracks[index].audioUrl)
  }

  return (
    <div>
      <AudioPlayer track={currentTrack} albumArt={card.content.albumArt} />
      <TrackList
        tracks={card.content.tracks}
        currentIndex={currentTrackIndex}
        onSelect={handleTrackSelect}
      />
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ScriptProcessorNode | AudioWorklet | 2018 | AudioWorklet is non-blocking, lower latency, better for mobile |
| Custom pitch-shift | Time-domain stretching (Superpowered) | 2020+ | Better audio quality for varispeed, constant pitch mode |
| WAV storage | MP3 conversion | Ongoing | 10x smaller files, all browsers support MP3 playback |
| Real-time waveform | Pre-computed waveform data | 2015+ | BBC waveform-data.js standard, better performance |
| Server-side processing only | Client-side option (WASM) | 2023+ | ffmpeg.wasm enables privacy-preserving client conversion |

**Deprecated/outdated:**
- **ScriptProcessorNode:** Deprecated in Web Audio API. Use AudioWorklet.
- **WebKitAudioContext:** Old iOS prefix. Use standard AudioContext.
- **Flash-based players:** Dead. Web Audio API is the standard.
- **Custom DSP algorithms:** Use proven libraries (Superpowered, Tone.js). Hand-rolling reverb/pitch-shift is maintenance nightmare.

## Open Questions

Things that couldn't be fully resolved:

1. **Client-side vs Server-side Audio Conversion**
   - What we know: Both are viable. Munyard Mixer uses ffmpeg.wasm client-side for privacy.
   - What's unclear: LinkLobby's preference for server load vs privacy tradeoff.
   - Recommendation: **Client-side with ffmpeg.wasm** for files <100MB. Matches Munyard Mixer pattern, better privacy, simpler backend. Server-side if conversion needs exceed browser capabilities.

2. **Waveform Pre-computation vs Real-time**
   - What we know: Pre-computed is faster for visitors, real-time is simpler for MVP.
   - What's unclear: Whether storage cost of waveform data matters.
   - Recommendation: **Pre-computed waveforms** generated on upload, stored as JSON in DB. Better visitor experience, aligns with "core differentiator" positioning.

3. **Multi-track Reverb Settings**
   - What we know: Artist configures reverb params per card in editor. Visitor has single mix knob.
   - What's unclear: Whether multi-track cards have shared reverb config or per-track config.
   - Recommendation: **Shared reverb config** for the card. Simpler UX, matches "EP/album" mental model (all tracks have same reverb character).

4. **Superpowered License Key**
   - What we know: Munyard Mixer uses "ExampleLicenseKey-WillExpire-OnNextUpdate" (test key).
   - What's unclear: Whether LinkLobby has production Superpowered license.
   - Recommendation: Contact Superpowered for production license before launch. Test key works for development/prototyping.

## Sources

### Primary (HIGH confidence)

- **Munyard Mixer Codebase** - `/Users/julianmunyard/Documents/ESSENTIAL WEBSITES/NEW MUNYARD MIXER`
  - `audio/engine/realTimelineMixerEngine.js` - Engine wrapper
  - `audio/engine/thomasAudioEngine.js` - Core AudioWorklet integration
  - `app/components/hooks/useAudioEngine.ts` - React hook with iOS unlock
  - `app/components/ReverbConfigModal.tsx` - Full reverb config UI
  - `app/components/VarispeedSlider.tsx` - Varispeed UI component
  - `public/worklet/timelineProcessor.js` - AudioWorklet processor
  - `package.json` - Superpowered SDK v2.7.2, ffmpeg.wasm
- **Superpowered SDK Documentation**
  - [@superpoweredsdk/web npm package](https://www.npmjs.com/package/@superpoweredsdk/web)
  - [Official Superpowered Web Audio SDK](https://superpowered.com/webassembly-wasm-audio-web-audio)
  - [GitHub: web-audio-javascript-webassembly-SDK](https://github.com/superpoweredSDK/web-audio-javascript-webassembly-SDK-interactive-audio)
- **LinkLobby Existing Codebase**
  - `src/components/providers/embed-provider.tsx` - EmbedPlaybackProvider pattern
  - `src/lib/analytics/track-event.ts` - Analytics tracking helpers
  - `src/app/api/analytics/track/route.ts` - Analytics API endpoint
  - `src/components/cards/themed-card-wrapper.tsx` - Theme system

### Secondary (MEDIUM confidence)

- **Next.js AudioWorklet Integration**
  - [AudioWorklet Support Discussion #62376](https://github.com/vercel/next.js/discussions/62376) - Webpack configuration
  - [AudioWorklet Support Issue #24907](https://github.com/vercel/next.js/issues/24907) - Known issues
  - [MDN: Using AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet) - Official documentation
- **iOS Audio Unlock**
  - [unmute-ios-audio library](https://github.com/feross/unmute-ios-audio) - Proven unlock pattern
  - [Web Audio API update on iOS](https://adactio.medium.com/web-audio-api-update-on-ios-1e553fff7847) - iOS behavior
  - [iOS Web Audio quirks](https://adactio.com/journal/17709) - Silent switch behavior
- **File Upload and Conversion**
  - [Large file streams in Next.js 13+](https://dev.to/grimshinigami/how-to-handle-large-filefiles-streams-in-nextjs-13-using-busboymulter-25gb)
  - [Streaming file uploads in Node.js 2026](https://oneuptime.com/blog/post/2026-01-30-nodejs-streaming-file-uploads/view)
  - [WAV to MP3 conversion using Lame.js](https://scribbler.live/2024/12/05/Coverting-Wav-to-Mp3-in-JavaScript-Using-Lame-js.html)
  - [ffmpeg.wasm audio conversion](https://devtails.medium.com/how-to-convert-audio-from-wav-to-mp3-in-javascript-using-ffmpeg-wasm-5dcd07a11821)
- **Waveform Libraries**
  - [Wavesurfer.js v7](https://wavesurfer.xyz/) - Interactive waveforms
  - [waveform-data.js](https://github.com/bbc/waveform-data.js) - BBC waveform library
  - [Peaks.js](https://zolmok.org/peaks-js/) - Navigable waveforms
- **Analytics Tracking**
  - [HTML5 audio tracking with GTM](https://www.analyticsmania.com/post/track-html5-audio-player-with-google-tag-manager/)
  - [HTML Media Elements Tracking Library](https://github.com/analytics-debugger/html-media-elements-tracking-library)

### Tertiary (LOW confidence)

- General web search results on 2026 best practices (used for context, verified against primary sources)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - Superpowered SDK proven in Munyard Mixer, all libraries in active use
- Architecture: **HIGH** - Reference implementation exists, patterns are tested in production
- Pitfalls: **HIGH** - All pitfalls documented from real Munyard Mixer debugging experience

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - stack is stable, unlikely to change rapidly)

**Key insight:** This is **not a greenfield project**. All core audio functionality exists and works in Munyard Mixer. The task is porting and adapting to LinkLobby's architecture (theme system, card types, analytics). Low technical risk.
