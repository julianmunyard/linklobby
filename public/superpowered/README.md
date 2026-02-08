# Superpowered SDK Integration

## Current Status

**Using Web Audio fallback mode** - Superpowered SDK not yet integrated.

The AudioEngine currently uses standard Web Audio API with basic features:
- ✅ Play/pause/seek
- ✅ Looping
- ✅ Basic varispeed (pitch-shifting only, 0.5x-1.5x)
- ❌ Time-stretch varispeed (pitch-independent speed changes)
- ❌ Reverb effects

## Integration Plan

When ready to integrate Superpowered SDK:

1. **Install package:**
   ```bash
   npm install @superpoweredsdk/web
   ```

2. **Obtain license key:**
   - Sign up at https://superpowered.com
   - Get license key for production use
   - Replace "ExampleLicenseKey-WillExpire-OnNextUpdate" in code

3. **WASM files:**
   - The npm package `@superpoweredsdk/web` includes WASM binaries
   - Local files in this directory may not be needed
   - If using local WASM loading, place files here:
     - `superpowered.wasm`
     - `superpowered.js`

4. **Update AudioEngine:**
   - Import `SuperpoweredGlue` and `SuperpoweredWebAudio` from `@superpoweredsdk/web`
   - Replace Web Audio fallback with Superpowered initialization
   - Load AudioWorklet processor from `/worklet/audioProcessor.js`
   - Implement time-stretch varispeed and reverb

5. **Update AudioWorklet processor:**
   - Import Superpowered classes in `/public/worklet/audioProcessor.js`
   - Extend `SuperpoweredWebAudio.AudioWorkletProcessor`
   - Use `AdvancedAudioPlayer` for playback
   - Use `Reverb` for reverb effects
   - Chain: Player -> Reverb -> output

## References

- Munyard Mixer source: `/Users/julianmunyard/Documents/ESSENTIAL WEBSITES/NEW MUNYARD MIXER/audio/engine/`
- Superpowered docs: https://superpowered.com/docs
- Example integration: See Munyard Mixer's `thomasAudioEngine.js` and `timelineProcessor.js`
