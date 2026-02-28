import { convertToMp3Client, type ProgressPhase } from './client-convert-to-mp3'
import { generateId } from '@/lib/utils'
import type { AudioTrack } from '@/types/audio'

export type UploadPhase = 'converting' | 'preparing' | 'uploading' | 'confirming'

export interface UploadProgress {
  phase: UploadPhase
  /** 0–1 ratio within the current phase */
  ratio: number
  /** Human-readable label */
  label: string
}

const PHASE_LABELS: Record<UploadPhase, string> = {
  converting: 'Converting to MP3...',
  preparing: 'Preparing upload...',
  uploading: 'Uploading...',
  confirming: 'Finalizing...',
}

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.aiff', '.wma', '.webm']
const MAX_SIZE = 100 * 1024 * 1024 // 100MB

function isAudioFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true
  return AUDIO_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
}

/**
 * Upload an audio track: convert → prepare signed URL → upload to Supabase → confirm.
 * Returns a complete AudioTrack ready to add to card content.
 */
export async function uploadAudioTrack(
  file: File,
  cardId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<AudioTrack> {
  // Client-side validation
  if (!isAudioFile(file)) {
    throw new Error('File must be an audio file')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Audio file must be less than 100MB')
  }

  const trackId = generateId()

  const emit = (phase: UploadPhase, ratio: number) => {
    onProgress?.({ phase, ratio, label: PHASE_LABELS[phase] })
  }

  // Phase 1: Convert to MP3 (or passthrough)
  const { blob: mp3Blob, duration } = await convertToMp3Client(file, (phase: ProgressPhase, ratio: number) => {
    emit('converting', ratio)
  })

  // Phase 2: Get signed upload URL
  emit('preparing', 0)
  const prepareRes = await fetch('/api/audio/upload/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, trackId, fileSize: mp3Blob.size }),
  })

  if (!prepareRes.ok) {
    const err = await prepareRes.json().catch(() => ({ error: 'Failed to prepare upload' }))
    throw new Error(err.error || 'Failed to prepare upload')
  }

  const { signedUrl, token, path } = await prepareRes.json()
  emit('preparing', 1)

  // Phase 3: Upload MP3 directly to Supabase via signed URL (XHR for progress)
  // The Supabase signed upload endpoint expects FormData (matching the SDK's behavior)
  emit('uploading', 0)
  await uploadWithProgress(signedUrl, token, mp3Blob, (ratio) => {
    emit('uploading', ratio)
  })

  // Phase 4: Confirm upload and update quota
  emit('confirming', 0)
  const confirmRes = await fetch('/api/audio/upload/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, duration }),
  })

  if (!confirmRes.ok) {
    const err = await confirmRes.json().catch(() => ({ error: 'Failed to confirm upload' }))
    throw new Error(err.error || 'Failed to confirm upload')
  }

  const { url, storagePath } = await confirmRes.json()
  emit('confirming', 1)

  return {
    id: trackId,
    title: file.name.replace(/\.[^/.]+$/, ''),
    artist: '',
    duration: duration || 0,
    audioUrl: url,
    storagePath,
  }
}

function uploadWithProgress(
  signedUrl: string,
  token: string,
  blob: Blob,
  onProgress: (ratio: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Supabase signed upload expects FormData with cacheControl field (matching SDK behavior).
    // The token is already in the signedUrl query string.
    const formData = new FormData()
    formData.append('cacheControl', '3600')
    formData.append('', blob)

    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signedUrl)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded / e.total)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1)
        resolve()
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed — network error'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout = 5 * 60 * 1000 // 5 minutes

    // Don't set Content-Type manually — browser sets multipart boundary for FormData
    xhr.send(formData)
  })
}
