import { createClient } from '@/lib/supabase/client'

const BACKGROUND_BUCKET = 'card-images' // Use existing bucket for backgrounds

export async function uploadBackgroundImage(file: File): Promise<string> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${user.id}/backgrounds/${Date.now()}.${ext}`

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from(BACKGROUND_BUCKET)
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BACKGROUND_BUCKET)
    .getPublicUrl(data.path)

  return publicUrl
}

export async function uploadBackgroundVideo(file: File): Promise<string> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Validate file size (100MB limit)
  const MAX_VIDEO_SIZE = 100 * 1024 * 1024
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video must be less than 100MB')
  }

  // Validate file type - support MP4, WebM, OGG, and MOV (QuickTime)
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  // Also check extension for MOV files that might have wrong MIME type
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const isMovByExtension = ext === 'mov'

  if (!validVideoTypes.includes(file.type) && !isMovByExtension) {
    throw new Error('Video must be MP4, WebM, OGG, or MOV format')
  }

  const filename = `${user.id}/backgrounds/${Date.now()}.${ext}`

  // Use card-videos bucket for video uploads
  const { data, error } = await supabase.storage
    .from('card-videos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: isMovByExtension ? 'video/quicktime' : file.type
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('card-videos')
    .getPublicUrl(data.path)

  return publicUrl
}
