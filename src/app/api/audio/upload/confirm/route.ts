import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateCsrfOrigin } from '@/lib/csrf'

export const runtime = 'nodejs'

const STORAGE_QUOTA_BYTES = 500 * 1024 * 1024 // 500MB per user
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

    const { path, duration } = await request.json()

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: path' },
        { status: 400 }
      )
    }

    // Use admin client to verify the file exists and get its actual size
    const admin = createAdminClient()

    const parts = path.split('/')
    const fileName = parts.pop() || ''
    const directoryPath = parts.join('/')

    const { data: fileList } = await admin.storage
      .from(AUDIO_BUCKET)
      .list(directoryPath, { limit: 100 })

    const fileInfo = fileList?.find((f) => f.name === fileName)
    if (!fileInfo) {
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      )
    }

    const actualSize = fileInfo.metadata?.size || 0

    // Re-check quota with actual size (don't trust client)
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes')
      .eq('id', user.id)
      .single()

    const currentUsage = profile?.storage_used_bytes || 0
    if (currentUsage + actualSize > STORAGE_QUOTA_BYTES) {
      // Over quota — delete the uploaded file
      await admin.storage.from(AUDIO_BUCKET).remove([path])
      const usedMB = Math.round(currentUsage / (1024 * 1024))
      return NextResponse.json(
        { error: `Storage quota exceeded (${usedMB}MB / 500MB). Upload removed.` },
        { status: 413 }
      )
    }

    // Update storage usage
    await supabase
      .from('profiles')
      .update({ storage_used_bytes: currentUsage + actualSize })
      .eq('id', user.id)

    // Get public URL
    const { data: urlData } = admin.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(path)

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath: path,
      duration: duration || 0,
    })
  } catch (error) {
    console.error('Audio upload confirm error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm upload' },
      { status: 500 }
    )
  }
}
