// src/app/api/audio/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadAudioFile } from '@/lib/supabase/storage'

export const runtime = 'nodejs'

const MAX_AUDIO_SIZE = 100 * 1024 * 1024 // 100MB

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const cardId = formData.get('cardId') as string | null
    const trackId = formData.get('trackId') as string | null

    if (!file || !cardId || !trackId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, cardId, trackId' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: 'Audio file must be less than 100MB' },
        { status: 413 }
      )
    }

    // TODO: Server-side conversion to MP3 for non-MP3 files
    // For v1: Accept any audio format - Superpowered audio engine handles multiple formats
    // Browser-based conversion can happen client-side if needed
    // Future optimization: Use fluent-ffmpeg for server-side conversion

    // Upload to Supabase Storage
    const { url, path } = await uploadAudioFile(file, cardId, trackId)

    // TODO: Extract duration from audio file
    // For v1: Return null duration - client can extract using HTMLAudioElement
    // Future: Use ffprobe or similar to extract metadata server-side

    // TODO: Generate waveform data server-side
    // For v1: Return without waveform - client generates using AudioContext.decodeAudioData()
    // Client-side approach is more practical for browser playback anyway

    return NextResponse.json({
      url,
      storagePath: path,
      duration: null, // Client will populate this
    })

  } catch (error) {
    console.error('Audio upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload audio' },
      { status: 500 }
    )
  }
}
