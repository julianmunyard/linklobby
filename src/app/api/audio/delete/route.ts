import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const AUDIO_BUCKET = 'card-audio'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storagePath } = await request.json()

    if (!storagePath || typeof storagePath !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: storagePath' },
        { status: 400 }
      )
    }

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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audio delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete audio' },
      { status: 500 }
    )
  }
}
