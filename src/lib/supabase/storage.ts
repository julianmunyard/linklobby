// src/lib/supabase/storage.ts
import { createClient } from "./client"

const BUCKET_NAME = "card-images"
const PROFILE_BUCKET = "profile-images"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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
    throw new Error("Image must be less than 5MB")
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  const supabase = createClient()

  // Generate unique filename: cardId/uuid.ext
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `${cardId}/${crypto.randomUUID()}.${fileExt}`

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
  // Validate blob size (use same 5MB limit)
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error("Image must be less than 5MB")
  }

  const supabase = createClient()

  // Generate unique filename: userId/type-uuid.jpg
  // Always .jpg since getCroppedImg outputs JPEG
  const fileName = `${userId}/${type}-${crypto.randomUUID()}.jpg`

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
