// src/lib/supabase/storage.ts
import { createClient } from "./client"
import { generateId } from '@/lib/utils'

const BUCKET_NAME = "card-images"
const PROFILE_BUCKET = "profile-images"
const VIDEO_BUCKET = "card-videos"
const AUDIO_BUCKET = "card-audio"
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_AUDIO_SIZE = 100 * 1024 * 1024 // 100MB

export interface UploadResult {
  url: string
  path: string
}

export async function uploadCardImage(
  file: File,
  cardId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be less than 20MB")
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  const supabase = createClient()

  // Generate unique filename: cardId/uuid.ext
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `${cardId}/${generateId()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error("Upload error:", error)
    throw new Error(error.message || "Failed to upload image")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function uploadCardImageBlob(
  blob: Blob,
  cardId: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  // Validate blob size
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("Image must be less than 20MB")
  }

  const supabase = createClient()

  // Derive extension from content type
  const extMap: Record<string, string> = { 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
  const ext = extMap[contentType] || 'jpg'
  const fileName = `${cardId}/${generateId()}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, blob, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error("Upload error:", error)
    throw new Error(error.message || "Failed to upload image")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteCardImage(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    console.error("Delete error:", error)
    throw new Error(error.message || "Failed to delete image")
  }
}

// ============================================
// PROFILE IMAGE STORAGE
// ============================================

export type ProfileImageType = "avatar" | "logo"

export async function uploadProfileImage(
  blob: Blob,
  userId: string,
  type: ProfileImageType
): Promise<UploadResult> {
  // Validate blob size (use same 20MB limit)
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("Image must be less than 20MB")
  }

  const supabase = createClient()

  // Generate unique filename: userId/type-uuid.jpg
  // Always .jpg since getCroppedImg outputs JPEG
  const fileName = `${userId}/${type}-${generateId()}.jpg`

  const { data, error } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(fileName, blob, {
      contentType: "image/jpeg",
      upsert: false,
    })

  if (error) {
    console.error("Profile upload error:", error)
    throw new Error(error.message || "Failed to upload profile image")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(PROFILE_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteProfileImage(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(PROFILE_BUCKET)
    .remove([path])

  if (error) {
    console.error("Profile delete error:", error)
    throw new Error(error.message || "Failed to delete profile image")
  }
}

// ============================================
// VIDEO STORAGE
// ============================================

export async function uploadCardVideo(
  file: File,
  cardId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video must be less than 100MB")
  }

  // Validate file type (MP4, WebM, OGG, MOV/QuickTime)
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  // Also check extension for MOV files that might have wrong MIME type
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "mp4"
  const isMovByExtension = fileExt === 'mov'

  if (!validVideoTypes.includes(file.type) && !isMovByExtension) {
    throw new Error("Video must be MP4, WebM, OGG, or MOV format")
  }

  const supabase = createClient()

  // Generate unique filename: cardId/uuid.ext (fileExt already defined above)
  const fileName = `${cardId}/${generateId()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error("Video upload error:", error)
    throw new Error(error.message || "Failed to upload video")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(VIDEO_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteCardVideo(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .remove([path])

  if (error) {
    console.error("Video delete error:", error)
    throw new Error(error.message || "Failed to delete video")
  }
}

// ============================================
// AUDIO STORAGE
// ============================================

export async function uploadAudioFile(
  file: File | Blob,
  cardId: string,
  trackId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_AUDIO_SIZE) {
    throw new Error("Audio file must be less than 100MB")
  }

  const supabase = createClient()

  // Generate filename: cardId/trackId.mp3
  const fileName = `${cardId}/${trackId}.mp3`

  // Determine content type
  const contentType = file instanceof File ? file.type : 'audio/mpeg'

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(fileName, file, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error("Audio upload error:", error)
    throw new Error(error.message || "Failed to upload audio")
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteAudioFile(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([path])

  if (error) {
    console.error("Audio delete error:", error)
    throw new Error(error.message || "Failed to delete audio")
  }
}
