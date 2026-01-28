import { createClient } from '@/lib/supabase/client'

export async function uploadBackgroundImage(file: File): Promise<string> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const filename = `${user.id}/backgrounds/${Date.now()}.${ext}`

  // Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  return publicUrl
}
