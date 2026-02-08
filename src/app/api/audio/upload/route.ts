// src/app/api/audio/upload/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const MAX_AUDIO_SIZE = 100 * 1024 * 1024 // 100MB
const AUDIO_BUCKET = 'card-audio'

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

    // Get file extension from original filename, default to original extension
    const originalName = file.name || 'audio.mp3'
    const ext = originalName.split('.').pop()?.toLowerCase() || 'mp3'
    const fileName = `${cardId}/${trackId}.${ext}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload directly with server supabase client
    const { data, error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(fileName, buffer, {
        contentType: file.type || 'audio/mpeg',
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
      duration: null,
    })

  } catch (error) {
    console.error('Audio upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload audio' },
      { status: 500 }
    )
  }
}
