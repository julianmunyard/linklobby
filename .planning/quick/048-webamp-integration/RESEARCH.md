# Webamp Integration Research

## Overview

Integrate [Webamp](https://github.com/captbaritone/webamp) — a browser-based Winamp 2 reimplementation — as a new audio card theme in LinkLobby. Potentially replace Webamp's internal audio engine with Superpowered to retain DSP features (varispeed, time-stretching, reverb).

---

## What is Webamp

- Full Winamp 2 reimplementation in HTML5/JS
- npm package: `webamp`
- Full skin support (.wsz files — thousands available at skins.webamp.org)
- Uses Web Audio API internally
- Milkdrop 2 visualizations via Butterchurn (WebGL)
- Works in Edge, Firefox, Safari, Chrome
- Renders well on mobile (confirmed via demo — stacks main player, EQ, playlist, milkdrop vertically)

---

## Webamp API

### Constructor Options (all optional)

| Option | Type | Description |
|---|---|---|
| `initialTracks` | `Track[]` | Tracks to prepopulate playlist. Each: `{ url, metaData: { artist, title }, duration }` |
| `initialSkin` | `{ url: string }` | Initial .wsz skin file URL |
| `availableSkins` | `{ url, name }[]` | Skins available in Options menu |
| `enableDoubleSizeMode` | `boolean` | 2x scaling (default: false) |
| `zIndex` | `number` | CSS stacking context (default: 99999) |
| `windowLayout` | `object` | Initial window positions/states for `main`, `equalizer`, `playlist`, `milkdrop`. Omitted windows start hidden |
| `enableHotkeys` | `boolean` | Global keyboard shortcuts (default: false) |
| `enableMediaSession` | `boolean` | Browser Media Session API integration (default: false) |
| `filePickers` | `array` | Custom file picker objects |
| `handleTrackDropEvent` | `function` | Custom drag-drop handler |
| `handleAddUrlEvent` | `function` | Custom "ADD URL" handler |
| `handleLoadListEvent` | `function` | Custom "LOAD LIST" handler |
| `handleSaveListEvent` | `function` | Custom "SAVE LIST" handler |
| `requireButterchurnPresets` | `function` | Milkdrop preset loader |

### Instance Methods

| Method | Description |
|---|---|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `stop()` | Stop playback (like pressing stop button) |
| `seekToTime(seconds)` | Seek within current track |
| `seekForward(seconds)` | Seek forward |
| `seekBackward(seconds)` | Seek backward |
| `setVolume(0-100)` | Set volume |
| `setCurrentTrack(index)` | Jump to track in playlist |
| `previousTrack()` | Go to previous track |
| `nextTrack()` | Go to next track |
| `appendTracks(tracks)` | Add tracks to playlist |
| `setTracksToPlay(tracks)` | Replace playlist |
| `getMediaStatus()` | Returns `"PLAYING"` / `"STOPPED"` / `"PAUSED"` |
| `getPlaylistTracks()` | Get current playlist |
| `isShuffleEnabled()` | Check shuffle state |
| `toggleShuffle()` | Toggle shuffle |
| `isRepeatEnabled()` | Check repeat state |
| `toggleRepeat()` | Toggle repeat |
| `renderWhenReady(domElement)` | Render into a DOM element |
| `renderInto(domElement)` | Alternative render method |
| `onTrackDidChange(callback)` | Listen for track changes |
| `onWillClose(callback)` | Before close event |
| `onClose(callback)` | After close event |
| `dispose()` | Clean up instance |

### React Integration Pattern

```tsx
import Webamp from "webamp";

function WinampPlayer({ tracks }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const webamp = new Webamp({
      initialTracks: tracks.map(t => ({
        url: t.audioUrl,
        metaData: { artist: t.artist, title: t.title },
        duration: t.duration,
      })),
      initialSkin: { url: '/skins/custom.wsz' },
      windowLayout: {
        main: { position: { top: 0, left: 0 } },
        // omit equalizer/playlist/milkdrop to hide them
      },
    });

    webamp.renderWhenReady(containerRef.current!);

    return () => webamp.dispose();
  }, []);

  return <div ref={containerRef} />;
}
```

No official React wrapper exists — ref-based pattern is the recommended approach (confirmed by maintainer in [issue #974](https://github.com/captbaritone/webamp/issues/974)).

---

## CSS Customization — Full Element Control

Every UI element is targetable under the `#webamp` namespace. Hiding elements with CSS does NOT break skin rendering — skins are bitmap spritesheets, each element references a specific region independently.

### All Targetable Selectors

**Playback Controls:**
- `#webamp .actions #previous`
- `#webamp .actions #play`
- `#webamp .actions #pause`
- `#webamp .actions #stop`
- `#webamp .actions #next`
- `#webamp #eject`

**Volume & Balance:**
- `#webamp #volume`
- `#webamp #volume input`
- `#webamp #balance`

**Seek/Position:**
- `#webamp #position`

**Shuffle & Repeat:**
- `#webamp .shuffle-repeat #shuffle`
- `#webamp .shuffle-repeat #repeat`

**Window Toggle Buttons:**
- `#webamp .windows #equalizer-button`
- `#webamp .windows #playlist-button`

**Title Bar Buttons:**
- `#webamp #title-bar #option-context`
- `#webamp #minimize`
- `#webamp #shade`
- `#webamp #close`

**Status/Info:**
- `#webamp #play-pause`
- `#webamp #work-indicator`
- `#webamp .webamp-status #time`
- `#webamp #marquee`
- `#webamp .media-info #kbps`
- `#webamp .media-info #khz`
- `#webamp .media-info .mono-stereo`
- `#webamp #about`

**Window-level hiding (via constructor):**
- Omit `equalizer` from `windowLayout` to hide EQ window
- Omit `playlist` from `windowLayout` to hide playlist window
- Omit `milkdrop` from `windowLayout` to hide visualizer window

### Example: Stripped-Down Player

```css
/* Remove buttons not needed in LinkLobby context */
#webamp #eject { display: none; }
#webamp .shuffle-repeat { display: none; }
#webamp #minimize { display: none; }
#webamp #shade { display: none; }
#webamp #close { display: none; }
#webamp .windows #equalizer-button { display: none; }
#webamp .media-info #kbps { display: none; }
#webamp .media-info #khz { display: none; }
```

---

## Superpowered Engine Swap — Feasibility

### Architecture Finding

Webamp's audio engine IS replaceable. The codebase has a clean `IMedia` interface with an `ElementSource` abstraction. Source code comment confirms precedent:

> "https://winampify.io/ is replacing this class with a custom version"

### Webamp Audio Architecture

```
ElementSource (HTMLAudioElement)
  → Preamp (GainNode, -12dB to +12dB)
  → Equalizer (BiquadFilterNodes: lowshelf, peaking, highshelf)
  → StereoBalanceNode
  → AnalyserNode (FFT 2048, for visualizer)
  → Volume (GainNode)
  → Destination
```

Communication is event-driven (`timeupdate`, `playing`, `ended`, `fileLoaded`) — UI is loosely coupled to the audio backend.

### IMedia Interface Mapping to Superpowered

| Webamp IMedia Method | Superpowered Equivalent |
|---|---|
| `play()` | `AudioContext.resume()` |
| `pause()` | `AudioContext.suspend()` |
| `stop()` | Suspend + seek to 0 |
| `seekToTime(t)` | Send seek command to AudioWorklet processor |
| `loadUrl(url)` | `Superpowered.downloadAndDecode()` |
| `getDuration()` | Return decoded duration from processor |
| `getTimeElapsed()` | Return current position from processor progress events |
| Events: `positionChange`, `ended`, `statusChange`, `loaded` | Map from processor message events |

### What Superpowered Engine Swap Gives You

- Winamp UI + full skin support (from Webamp)
- EQ window + Milkdrop visualizations (from Webamp)
- Varispeed / time-stretching (from Superpowered) — preserved
- Reverb processing (from Superpowered) — preserved
- All existing DSP features maintained

### Approach Options

1. **Fork Webamp** and replace the `Media` class with a Superpowered-backed implementation
2. **Inject custom media class** via constructor (need to verify if this is exposed without forking)
3. **Post-process only** — let Webamp handle playback, pipe its output through Superpowered for effects (simpler but no varispeed/time-stretch, only reverb/EQ)

### Effort Assessment

| Approach | Effort | Features Retained |
|---|---|---|
| Webamp as-is (new theme, no Superpowered) | Low | No varispeed, no reverb, gains EQ + skins |
| Post-process through Superpowered | Medium | Reverb yes, varispeed no |
| Full engine swap (fork + custom IMedia) | High | Everything — varispeed, reverb, time-stretch |

---

## How It Fits Into LinkLobby

### Current Audio Card Theme System

The audio card already supports multiple theme variants: `instagram-reels`, `mac-os`, `receipt`, `ipod-classic`, `vcr-menu`. Adding `"winamp"` as a new variant slots directly into this system.

### Integration Points

- `src/components/cards/audio-card.tsx` — add `"winamp"` to theme variant mapping
- New component: `src/components/audio/themes/winamp-theme.tsx`
- Map existing `AudioTrack[]` to Webamp's track format
- Wire into `EmbedPlaybackProvider` for single-playback coordination
- CSS containment to keep Webamp inside card boundaries (override default `z-index: 99999` and absolute positioning)

### Key Considerations

- Webamp inserts itself as a child of `<body>`, not the container you provide — it centers within the container but lives in body. Will need CSS overrides for card containment.
- Track URLs must be served with correct CORS headers (Supabase storage already does this).
- Skin files (.wsz) would need to be hosted — could offer a curated selection or let users upload custom skins.

---

## References

- [Webamp GitHub](https://github.com/captbaritone/webamp)
- [Webamp Docs](https://docs.webamp.org)
- [Constructor Options](https://docs.webamp.org/docs/api/webamp-constructor/)
- [Instance Methods](https://docs.webamp.org/docs/api/instance-methods/)
- [React Integration Issue #974](https://github.com/captbaritone/webamp/issues/974)
- [Skin Museum](https://skins.webamp.org)
