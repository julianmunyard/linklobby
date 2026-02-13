---
phase: quick
plan: 065
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/api/audio/upload/route.ts
  - src/lib/audio/convert-to-mp3.ts
  - package.json
autonomous: true

must_haves:
  truths:
    - "Uploading a WAV file results in an MP3 stored in Supabase with .mp3 extension"
    - "Uploading a FLAC/AIFF/OGG file results in an MP3 stored in Supabase"
    - "Uploading an MP3 file skips conversion and uploads directly (no quality loss)"
    - "Duration is returned as a number (seconds) instead of null"
    - "Upload API returns the same response shape (url, storagePath, duration)"
  artifacts:
    - path: "src/lib/audio/convert-to-mp3.ts"
      provides: "FFmpeg conversion utility with duration extraction"
      exports: ["convertToMp3"]
    - path: "src/app/api/audio/upload/route.ts"
      provides: "Upload route with conversion pipeline"
      contains: "convertToMp3"
  key_links:
    - from: "src/app/api/audio/upload/route.ts"
      to: "src/lib/audio/convert-to-mp3.ts"
      via: "import convertToMp3"
      pattern: "import.*convertToMp3.*from"
    - from: "src/lib/audio/convert-to-mp3.ts"
      to: "ffmpeg-static"
      via: "require for binary path"
      pattern: "ffmpeg-static|ffmpegPath"
---

<objective>
Add server-side audio conversion so all non-MP3 uploads (WAV, FLAC, AIFF, OGG, etc.) are converted to MP3 before storing to Supabase. Also extract audio duration from FFmpeg metadata.

Purpose: WAV/FLAC files are unnecessarily large and may not play correctly in the Superpowered audio engine. Converting server-side ensures consistent MP3 playback and smaller storage footprint.
Output: Updated upload API that converts non-MP3 audio to 192kbps MP3, extracts duration, and stores the MP3 to Supabase.
</objective>

<execution_context>
@/Users/julianmunyard/.claude/get-shit-done/workflows/execute-plan.md
@/Users/julianmunyard/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/app/api/audio/upload/route.ts
@src/app/api/audio/delete/route.ts
@src/components/editor/audio-card-fields.tsx
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install FFmpeg dependencies and create conversion utility</name>
  <files>
    package.json
    src/lib/audio/convert-to-mp3.ts
  </files>
  <action>
    1. Install dependencies:
       ```
       npm install fluent-ffmpeg ffmpeg-static
       npm install -D @types/fluent-ffmpeg
       ```
       - `ffmpeg-static` provides a pre-built FFmpeg binary (no system install needed)
       - `fluent-ffmpeg` provides the Node.js wrapper API
       - Do NOT use `ffmpeg.wasm` (that is client-side WASM, not what we want)

    2. Create `src/lib/audio/convert-to-mp3.ts` with a single exported function:

       ```typescript
       import { path as ffmpegPath } from 'ffmpeg-static'
       import ffmpeg from 'fluent-ffmpeg'
       import { writeFile, readFile, unlink, mkdtemp } from 'fs/promises'
       import { join } from 'path'
       import { tmpdir } from 'os'

       // Set the ffmpeg binary path from ffmpeg-static
       if (ffmpegPath) {
         ffmpeg.setFfmpegPath(ffmpegPath)
       }

       interface ConversionResult {
         buffer: Buffer
         duration: number // seconds
       }

       export async function convertToMp3(
         inputBuffer: Buffer,
         originalExtension: string
       ): Promise<ConversionResult> {
         // Create a temporary directory for this conversion
         const tempDir = await mkdtemp(join(tmpdir(), 'audio-convert-'))
         const inputPath = join(tempDir, `input.${originalExtension}`)
         const outputPath = join(tempDir, 'output.mp3')

         try {
           // Write input buffer to temp file
           await writeFile(inputPath, inputBuffer)

           // Get duration via ffprobe
           const duration = await new Promise<number>((resolve, reject) => {
             ffmpeg.ffprobe(inputPath, (err, metadata) => {
               if (err) {
                 // Non-fatal: we can still convert without duration
                 console.warn('ffprobe duration extraction failed:', err.message)
                 resolve(0)
               } else {
                 resolve(metadata.format.duration || 0)
               }
             })
           })

           // If already MP3, just return the buffer with duration (no re-encoding)
           const ext = originalExtension.toLowerCase()
           if (ext === 'mp3') {
             return { buffer: inputBuffer, duration }
           }

           // Convert to MP3 192kbps CBR
           await new Promise<void>((resolve, reject) => {
             ffmpeg(inputPath)
               .audioCodec('libmp3lame')
               .audioBitrate(192)
               .format('mp3')
               .on('error', (err) => reject(new Error(`FFmpeg conversion failed: ${err.message}`)))
               .on('end', () => resolve())
               .save(outputPath)
           })

           // Read the converted file
           const outputBuffer = await readFile(outputPath)
           return { buffer: outputBuffer, duration }
         } finally {
           // Clean up temp files (best-effort, don't throw)
           await unlink(inputPath).catch(() => {})
           await unlink(outputPath).catch(() => {})
           // Remove temp dir (will fail silently if not empty, that's fine)
           const { rmdir } = await import('fs/promises')
           await rmdir(tempDir).catch(() => {})
         }
       }
       ```

    Key design decisions:
    - MP3 files skip re-encoding entirely (no quality loss) but still get duration extracted via ffprobe
    - 192kbps CBR is a good balance of quality and file size for web playback
    - Temp files are always cleaned up in a `finally` block
    - Duration extraction failure is non-fatal (returns 0 instead of throwing)
    - Uses `mkdtemp` for unique temp directories to avoid conflicts on concurrent uploads

    IMPORTANT: The `ffmpeg-static` package exports the path differently depending on version. Check the actual export:
    - If `import ffmpegStatic from 'ffmpeg-static'` gives a string path, use that directly
    - If it exports `{ path }`, destructure it
    - Test with: `console.log(typeof ffmpegStatic, ffmpegStatic)` if unsure
    - The safest pattern is:
      ```typescript
      import ffmpegStatic from 'ffmpeg-static'
      if (ffmpegStatic) {
        ffmpeg.setFfmpegPath(ffmpegStatic)
      }
      ```
      because `ffmpeg-static` default export IS the path string.
  </action>
  <verify>
    - `npm ls fluent-ffmpeg ffmpeg-static` shows both installed
    - `npx tsc --noEmit src/lib/audio/convert-to-mp3.ts` compiles without errors (or run full `npx tsc --noEmit` and check no new errors in this file)
    - The ffmpeg-static binary exists: `node -e "console.log(require('ffmpeg-static'))"`
  </verify>
  <done>
    - `fluent-ffmpeg` and `ffmpeg-static` are in package.json dependencies
    - `@types/fluent-ffmpeg` is in devDependencies
    - `src/lib/audio/convert-to-mp3.ts` exports `convertToMp3` function
    - Function handles: MP3 passthrough (no re-encode), non-MP3 conversion to 192kbps MP3, duration extraction via ffprobe, temp file cleanup
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate conversion into upload API route</name>
  <files>
    src/app/api/audio/upload/route.ts
  </files>
  <action>
    Update `src/app/api/audio/upload/route.ts` to use the conversion utility:

    1. Import `convertToMp3` from `@/lib/audio/convert-to-mp3`

    2. After the existing buffer creation (`Buffer.from(arrayBuffer)`), add conversion step:
       ```typescript
       // Convert non-MP3 audio to MP3 (MP3 files pass through without re-encoding)
       const { buffer: finalBuffer, duration } = await convertToMp3(buffer, ext)
       ```

    3. Change the fileName to always use `.mp3` extension:
       ```typescript
       // Always store as MP3 (conversion ensures this)
       const fileName = `${cardId}/${trackId}.mp3`
       ```

    4. Update the Supabase upload call:
       - Use `finalBuffer` instead of `buffer`
       - Set `contentType` to `'audio/mpeg'` (always, since we always store MP3)

    5. Update the response to include the actual duration:
       ```typescript
       return NextResponse.json({
         url: urlData.publicUrl,
         storagePath: data.path,
         duration: duration || null,
       })
       ```

    6. Add a try/catch specifically around the conversion step with a clear error message:
       ```typescript
       let finalBuffer: Buffer
       let duration: number
       try {
         const result = await convertToMp3(buffer, ext)
         finalBuffer = result.buffer
         duration = result.duration
       } catch (conversionError) {
         console.error('Audio conversion error:', conversionError)
         return NextResponse.json(
           { error: 'Failed to process audio file. Please try uploading an MP3.' },
           { status: 422 }
         )
       }
       ```

    The full updated route should:
    - Keep all existing validation (auth, file size, required fields)
    - Add conversion between buffer creation and Supabase upload
    - Always use `.mp3` extension and `audio/mpeg` content type
    - Return real duration instead of null
    - Handle conversion errors gracefully with 422 status

    IMPORTANT: Do NOT change the `upsert: false` behavior. Do NOT change the MAX_AUDIO_SIZE. Do NOT modify the auth check or FormData parsing.
  </action>
  <verify>
    - `npx tsc --noEmit` passes (or at minimum, no new type errors in the upload route)
    - `npm run build` succeeds (confirms the route compiles in the Next.js build)
    - Manual test: Upload a WAV file through the editor UI and confirm:
      1. The upload completes without error
      2. The stored file path ends in `.mp3` (check Supabase dashboard or console log)
      3. The returned duration is a number, not null
    - Manual test: Upload an MP3 file and confirm it still works (no re-encoding, fast upload)
  </verify>
  <done>
    - Upload API converts WAV/FLAC/AIFF/OGG to 192kbps MP3 before storing
    - MP3 uploads pass through without re-encoding
    - All stored files have `.mp3` extension and `audio/mpeg` content type
    - Duration is extracted and returned as a number (seconds)
    - Conversion errors return 422 with helpful message
    - Existing upload behavior (auth, validation, response shape) is preserved
  </done>
</task>

</tasks>

<verification>
1. Upload a WAV file -> stored as `.mp3` in Supabase, duration returned
2. Upload an MP3 file -> stored as `.mp3` (no re-encode), duration returned
3. Upload a FLAC file -> stored as `.mp3`, duration returned
4. `npm run build` passes without errors
5. The audio player can play back a converted file (Superpowered loads and plays it)
</verification>

<success_criteria>
- All non-MP3 audio uploads are converted to 192kbps MP3 server-side
- MP3 uploads skip conversion (no quality loss)
- Duration is extracted from all uploads and returned in the API response
- Storage paths always end in `.mp3`
- Build passes, no type errors
- Existing upload flow (client-side validation, FormData, response shape) unchanged
</success_criteria>

<output>
After completion, create `.planning/quick/065-wav-to-mp3-conversion/065-SUMMARY.md`
</output>
