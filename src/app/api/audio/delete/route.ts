import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCsrfOrigin } from '@/lib/csrf'
import { generalApiRatelimit, checkRateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const AUDIO_BUCKET = 'card-audio'

export async function DELETE(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = await checkRateLimit(generalApiRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    const { storagePath } = await request.json()

    if (!storagePath || typeof storagePath !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: storagePath' },
        { status: 400 }
      )
    }

    // Derive directory and filename from storagePath (e.g. "{cardId}/{trackId}.mp3")
    const parts = storagePath.split('/')
    const fileName = parts.pop() || ''
    const directoryPath = parts.join('/')

    // BEFORE deleting: query Supabase Storage metadata to get the file size.
    // This is the authoritative size — we do not trust any client-sent value.
    let fileSize = 0
    if (directoryPath && fileName) {
      const { data: fileList } = await supabase.storage
        .from(AUDIO_BUCKET)
        .list(directoryPath, { limit: 100 })

      const fileInfo = fileList?.find((f) => f.name === fileName)
      fileSize = fileInfo?.metadata?.size || 0
    }

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([storagePath])

    if (deleteError) {
      console.error('Supabase delete error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message || 'Failed to delete audio' },
        { status: 500 }
      )
    }

    // Decrement storage_used_bytes by actual file size (never go below 0)
    if (fileSize > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('storage_used_bytes')
        .eq('id', user.id)
        .single()

      if (profile) {
        const newUsage = Math.max(0, (profile.storage_used_bytes || 0) - fileSize)
        await supabase
          .from('profiles')
          .update({ storage_used_bytes: newUsage })
          .eq('id', user.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audio delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete audio' },
      { status: 500 }
    )
  }
}
