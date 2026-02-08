# Phase 12: Audio System - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Artists can upload audio files and display them as themed audio cards on their page. Visitors can play, pause, scrub, and interact with varispeed and reverb controls. The audio engine is ported from the Munyard Mixer codebase using the Superpowered SDK (WASM). Audio cards adapt visually to the existing theme system.

</domain>

<decisions>
## Implementation Decisions

### Audio Engine Source
- Port audio engine from Munyard Mixer codebase at `/Users/julianmunyard/Documents/ESSENTIAL WEBSITES/NEW MUNYARD MIXER`
- Use **Superpowered SDK (WASM)** for all audio processing — no fallback systems
- No mobile chunking fallback — Superpowered handles all devices directly
- Key files to port from: `realTimelineMixerEngine.js`, `useAudioEngine.ts`, `timelineProcessor.js`, `ReverbConfigModal.tsx`, `VarispeedSlider.tsx`
- iOS silent audio unlock pattern required (from Munyard Mixer)

### Player Layout (Consistent Across All Themes)
- Same base layout on every theme — themes skin the elements, not rearrange them
- Layout elements: play/pause toggle, square album art, varispeed slider, reverb knob with tick marks, progress bar (or waveform), time display, track title + artist name + duration
- Artist chooses between waveform visualization or standard progress bar per card (editor toggle)

### Player Color Customization (3 Fields)
- **Border color** — outlines/borders of the player card
- **Element background color** — fill of buttons, slider tracks, knob backgrounds
- **Foreground/accent color** — play icon, knob ticks, text, active/highlighted elements
- Artist sets these per card in the editor
- Theme provides defaults; artist overrides with color pickers

### Theme-Adapted Controls
- **Instagram Reels**: Clean, simple controls within standard Reels card border style. Simple play/pause toggle, slider, knob — minimal and sharp.
- **Macintosh**: Pixel-art controls, **Pix Chicago font** for time/labels, rendered inside the **large window card** (existing MacintoshCard component). Pixelated play button, chunky slider, full retro Mac commitment.
- **System Settings**: Full **Poolsuite treatment** — Ishmeria/ChiKareGo fonts, cream inner box, thin borders, retro aesthetic. All 3 color customization fields apply.
- **Receipt**: Uses the existing **receipt monospace font**. Simple black controls (buttons, slider, knob) on paper-like background. Clean, minimal, monochrome. Same layout, just rendered in receipt's black-on-white mono aesthetic.
- **iPod Classic**: Player renders **inside the iPod LCD screen area**. **Click wheel is functional** — scroll wheel adjusts varispeed, play/pause button works, forward/back buttons navigate tracks in multi-track cards. Like the real iPod Now Playing screen.
- **VCR**: **VHS tape deck look** — chunky transport-style buttons, **LED counter** for time display, tape-style progress bar. Simpler retro controls (not full hardware skeuomorphism) — chunky buttons and sliders in VCR color scheme.
- Each theme applies its own default control styling while keeping the same base layout
- All themes support the 3 color customization fields (border, element background, foreground/accent)

### Playback Behavior
- **Never autoplays** — visitor must press play
- **One at a time** — playing any audio pauses all other audio (audio cards AND music embeds) via existing EmbedPlaybackProvider
- Play/pause and scrub controls only — no volume control (visitors use device volume)
- **Looping** is an artist-set option in the editor (toggle per card) — visitors just experience it, no visible loop button

### Varispeed Controls
- **Always visible** on every audio card — core differentiator
- **Both modes available** with toggle: Natural (vinyl-style pitch+speed change) and Time-Stretch (speed changes, pitch stays constant)
- Speed range: 0.5x to 1.5x (matching Munyard Mixer)

### Reverb Controls
- **Artist configures full reverb parameters** in the editor: mix, width, damp, room size, predelay (matching Munyard Mixer's ReverbConfigModal)
- **Visitor sees only a single reverb knob** on the card that scales the wet/dry mix
- Artist sets the *character* of the reverb, visitor controls *how much*

### Upload & Conversion
- Accept **any audio format** — convert to MP3 for playback
- **100MB maximum file size** per upload
- Conversion location: Claude's discretion (client-side or server-side based on practical tradeoffs)

### Multi-Track Cards
- Single audio card can hold **multiple tracks** (EP/tracklist)
- **Track list displayed below player** — tap a track to switch, current track highlighted
- Each track has its own title, artist, duration
- Shared album art for the card (single cover image)

### Card Metadata Display
- Track title + artist name + album art (square) + duration
- All visible on the card

### Analytics
- Audio plays tracked for analytics (integrates with Phase 11 analytics system)

### Claude's Discretion
- WAV-to-MP3 conversion location (client-side vs server-side)
- Waveform generation approach (pre-computed vs real-time)
- Exact Superpowered SDK integration architecture (how to wire AudioWorklet in Next.js)
- Loading states during audio file processing
- How multi-track cards handle different reverb settings per track vs shared settings

</decisions>

<specifics>
## Specific Ideas

- Audio engine ported directly from Munyard Mixer — not built from scratch. Reference implementation exists at `/Users/julianmunyard/Documents/ESSENTIAL WEBSITES/NEW MUNYARD MIXER`
- Superpowered SDK provides the DSP for reverb and varispeed — uses WASM binary (`superpowered.wasm`)
- Munyard Mixer uses AudioWorkletNode with message-based IPC between main thread and audio processor
- The reverb knob on the card should have a simple knob look with ticked lines around it
- The play button transforms into a pause button when pressed (toggle icon)
- Macintosh theme player goes inside the existing large window card component (MacintoshCard)
- iPod click wheel should actually control the audio player — scroll for varispeed, play/pause, forward/back for tracks
- VCR player should have an LED-style counter (like a real VCR display) for time, not a normal font
- Receipt player keeps everything in the receipt's monospace font — no fancy styling, just simple black on white
- "No chunking bullshit" — Superpowered handles mobile audio directly, no StreamingAudioManager fallback

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-audio-system*
*Context gathered: 2026-02-08*
