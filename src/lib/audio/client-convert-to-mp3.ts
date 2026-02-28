import type { FFmpeg } from '@ffmpeg/ffmpeg'

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance

  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const ff = new FFmpeg()

    const baseURL = `${window.location.origin}/ffmpeg`
    await ff.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      classWorkerURL: `${baseURL}/worker.js`,
    })

    ffmpegInstance = ff
    return ff
  })()

  try {
    return await loadPromise
  } catch (err) {
    loadPromise = null
    throw err
  }
}

function getExtension(file: File): string {
  const name = file.name.toLowerCase()
  const dotIdx = name.lastIndexOf('.')
  return dotIdx >= 0 ? name.slice(dotIdx + 1) : ''
}

function isMp3(file: File): boolean {
  return file.type === 'audio/mpeg' || getExtension(file) === 'mp3'
}

async function getDuration(mp3Blob: Blob): Promise<number> {
  try {
    const arrayBuffer = await mp3Blob.arrayBuffer()
    const audioCtx = new AudioContext()
    try {
      // Race decodeAudioData against a 10s timeout — it can hang on some files/browsers
      const audioBuffer = await Promise.race([
        audioCtx.decodeAudioData(arrayBuffer),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('decodeAudioData timeout')), 10000)
        ),
      ])
      return audioBuffer.duration
    } finally {
      await audioCtx.close().catch(() => {})
    }
  } catch (err) {
    console.warn('[AudioConvert] getDuration failed, falling back to 0:', err)
    return 0
  }
}

export interface ConvertResult {
  blob: Blob
  duration: number
}

export type ProgressPhase = 'converting' | 'reading'

/**
 * Convert an audio file to MP3 client-side using ffmpeg-wasm.
 * MP3 files pass through without re-encoding.
 */
export async function convertToMp3Client(
  file: File,
  onProgress?: (phase: ProgressPhase, ratio: number) => void
): Promise<ConvertResult> {
  // MP3 passthrough — skip conversion entirely
  if (isMp3(file)) {
    onProgress?.('reading', 1)
    const duration = await getDuration(file)
    return { blob: file, duration }
  }

  onProgress?.('converting', 0)

  const ffmpeg = await getFFmpeg()
  const { fetchFile } = await import('@ffmpeg/util')

  const ext = getExtension(file) || 'wav'
  const inputName = `input.${ext}`
  const outputName = 'output.mp3'

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.('converting', Math.min(progress, 0.99))
  }
  ffmpeg.on('progress', progressHandler)

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file))

    await ffmpeg.exec([
      '-i', inputName,
      '-codec:a', 'libmp3lame',
      '-b:a', '192k',
      '-f', 'mp3',
      outputName,
    ])

    const data = await ffmpeg.readFile(outputName)
    // ffmpeg.readFile returns FileData (Uint8Array | string); we know it's binary.
    // slice() creates a new ArrayBuffer, avoiding TS strict ArrayBufferLike issues.
    const bytes = (data as Uint8Array).slice()
    const mp3Blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/mpeg' })

    onProgress?.('converting', 1)

    const duration = await getDuration(mp3Blob)
    return { blob: mp3Blob, duration }
  } finally {
    ffmpeg.off('progress', progressHandler)
    await ffmpeg.deleteFile(inputName).catch(() => {})
    await ffmpeg.deleteFile(outputName).catch(() => {})
  }
}
