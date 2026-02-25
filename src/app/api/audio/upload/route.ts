// src/app/api/audio/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertToMp3 } from '@/lib/audio/convert-to-mp3'
import { validateCsrfOrigin } from '@/lib/csrf'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for large file conversion

const MAX_AUDIO_SIZE = 100 * 1024 * 1024 // 100MB
const AUDIO_BUCKET = 'card-audio'

export async function POST(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

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

    // Get file extension from original filename
    const originalName = file.name || 'audio.mp3'
    const ext = originalName.split('.').pop()?.toLowerCase() || 'mp3'

    // Convert File to ArrayBuffer for processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert non-MP3 audio to MP3 (MP3 files pass through without re-encoding)
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

    // Always store as MP3 (conversion ensures this)
    const fileName = `${cardId}/${trackId}.mp3`

    // Upload directly with server supabase client
    const { data, error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(fileName, finalBuffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload audio' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath: data.path,
      duration: duration || null,
    })

  } catch (error) {
    console.error('Audio upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload audio' },
      { status: 500 }
    )
  }
}
