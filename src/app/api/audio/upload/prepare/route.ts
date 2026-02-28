import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateCsrfOrigin } from '@/lib/csrf'
import { audioUploadRatelimit, checkRateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const STORAGE_QUOTA_BYTES = 500 * 1024 * 1024 // 500MB per user
const MAX_AUDIO_SIZE = 100 * 1024 * 1024 // 100MB
const AUDIO_BUCKET = 'card-audio'

export async function POST(request: Request) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rl = await checkRateLimit(audioUploadRatelimit, user.id)
    if (!rl.allowed) return rl.response!

    const { cardId, trackId, fileSize } = await request.json()

    if (!cardId || !trackId || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: cardId, trackId, fileSize' },
        { status: 400 }
      )
    }

    if (fileSize > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: 'Audio file must be less than 100MB' },
        { status: 413 }
      )
    }

    // Check storage quota
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes')
      .eq('id', user.id)
      .single()

    const currentUsage = profile?.storage_used_bytes || 0
    if (currentUsage + fileSize > STORAGE_QUOTA_BYTES) {
      const usedMB = Math.round(currentUsage / (1024 * 1024))
      const fileMB = Math.round(fileSize / (1024 * 1024))
      return NextResponse.json(
        { error: `Storage quota exceeded. You're using ${usedMB}MB of 500MB. This file is ${fileMB}MB.` },
        { status: 413 }
      )
    }

    // Use admin client to create signed upload URL (bypasses RLS)
    const admin = createAdminClient()
    const path = `${cardId}/${trackId}.mp3`

    const { data, error: signedUrlError } = await admin.storage
      .from(AUDIO_BUCKET)
      .createSignedUploadUrl(path)

    if (signedUrlError || !data) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
    })
  } catch (error) {
    console.error('Audio upload prepare error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to prepare upload' },
      { status: 500 }
    )
  }
}
