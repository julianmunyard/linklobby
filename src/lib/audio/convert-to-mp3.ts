import ffmpegStatic from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import { writeFile, readFile, unlink, mkdtemp, rmdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

// Set the ffmpeg binary path from ffmpeg-static
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
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
  const ext = originalExtension.toLowerCase().replace(/^\./, '')
  const inputPath = join(tempDir, `input.${ext}`)
  const outputPath = join(tempDir, 'output.mp3')

  try {
    // Write input buffer to temp file
    await writeFile(inputPath, inputBuffer)

    // Get duration via ffprobe
    const duration = await new Promise<number>((resolve) => {
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
    if (ext === 'mp3') {
      return { buffer: inputBuffer, duration }
    }

    // Convert to MP3 192kbps CBR
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .audioBitrate(192)
        .format('mp3')
        .on('error', (err: Error) => reject(new Error(`FFmpeg conversion failed: ${err.message}`)))
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
    await rmdir(tempDir).catch(() => {})
  }
}
