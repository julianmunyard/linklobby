// src/components/cards/image-upload.tsx
"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Crop, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadCardImageBlob } from "@/lib/supabase/storage"
import { ImageCropDialog } from "@/components/shared/image-crop-dialog"
import { compressImageForUpload } from "@/lib/image-compression"
import type { CardType } from "@/types/card"

interface ImageUploadProps {
  value?: string           // Current (cropped) image URL
  originalValue?: string   // Original (uncropped) image URL — used for re-crop
  onChange: (url: string | undefined, originalUrl?: string | undefined) => void
  cardId: string           // For organizing uploads
  cardType: CardType       // For determining aspect ratio
  disabled?: boolean
  className?: string
}

// Map card type to aspect ratio for crop dialog
function getAspectForCardType(cardType: CardType): number {
  switch (cardType) {
    case 'hero': return 16 / 9
    case 'square': return 1
    case 'horizontal': return 4 / 3  // Small thumbnail, more compact
    default: return 16 / 9  // Default to rectangle
  }
}

export function ImageUpload({
  value,
  originalValue,
  onChange,
  cardId,
  cardType,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [sourceImageType, setSourceImageType] = useState<string>('image/jpeg')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  // Holds the original image URL for the current crop session (set during new file select)
  const pendingOriginalUrlRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle file selection - upload original then open crop dialog
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear any previous errors
    setUploadError(null)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return
    }

    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be less than 20MB")
      return
    }

    // Track source image type for transparent format support
    setSourceImageType(file.type)

    // GIF files: skip cropping to preserve animation, upload directly
    if (file.type === 'image/gif') {
      if (inputRef.current) inputRef.current.value = ""
      pendingOriginalUrlRef.current = null
      handleCropComplete(file, 'image/gif')
      return
    }

    // Upload the original (uncropped) image to storage first
    try {
      const hasAlpha = file.type === 'image/png' || file.type === 'image/webp'
      const uploadContentType = hasAlpha ? 'image/png' : 'image/jpeg'
      const extMap: Record<string, string> = { 'image/png': 'png', 'image/webp': 'webp' }
      const ext = extMap[uploadContentType] || 'jpg'
      const fileToCompress = new File([file], `original.${ext}`, { type: uploadContentType })
      const compressedOriginal = await compressImageForUpload(fileToCompress)
      const originalResult = await uploadCardImageBlob(compressedOriginal, cardId, uploadContentType)
      pendingOriginalUrlRef.current = originalResult.url
    } catch {
      // If original upload fails, we'll still allow cropping — just won't have original for re-crop
      pendingOriginalUrlRef.current = null
    }

    // Read file as data URL for cropper
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImageToCrop(dataUrl)
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  // Handle thumbnail click - open crop dialog with ORIGINAL image for re-crop
  function handleThumbnailClick() {
    if (!value || disabled || isUploading) return
    // Use the original (uncropped) image if available, otherwise fall back to current
    setImageToCrop(originalValue || value)
    pendingOriginalUrlRef.current = originalValue || null
    setCropDialogOpen(true)
  }

  // Handle crop complete - compress then upload
  async function handleCropComplete(croppedBlob: Blob, overrideContentType?: string) {
    try {
      setIsUploading(true)
      setUploadError(null)

      // Determine upload content type: override (for GIF skip-crop) or from source image
      // PNG and WebP both support transparency — output as PNG to preserve alpha
      const hasAlpha = sourceImageType === 'image/png' || sourceImageType === 'image/webp'
      const uploadContentType = overrideContentType || (hasAlpha ? 'image/png' : 'image/jpeg')

      // Use correct filename extension so compression library preserves format
      const extMap: Record<string, string> = { 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' }
      const ext = extMap[uploadContentType] || 'jpg'
      const fileToCompress = new File([croppedBlob], `image.${ext}`, { type: uploadContentType })
      const compressedBlob = await compressImageForUpload(fileToCompress)

      // Store for potential retry
      setPendingBlob(compressedBlob)

      const result = await uploadCardImageBlob(compressedBlob, cardId, uploadContentType)
      // Pass both cropped URL and original URL to parent
      onChange(result.url, pendingOriginalUrlRef.current || originalValue || undefined)
      setPendingBlob(null) // Clear pending blob on success
      pendingOriginalUrlRef.current = null
      toast.success("Image uploaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  // Retry upload with the stored blob
  async function handleRetry() {
    if (!pendingBlob) return

    try {
      setIsUploading(true)
      setUploadError(null)
      const result = await uploadCardImageBlob(pendingBlob, cardId)
      onChange(result.url, originalValue)
      setPendingBlob(null)
      toast.success("Image uploaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemove() {
    onChange(undefined, undefined)
    toast.success("Image removed")
    // Note: We don't delete from storage immediately - orphan cleanup can happen later
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center gap-3">
          {value ? (
            // Small thumbnail preview with click-to-crop
            <div
              className={cn(
                "relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 group",
                !disabled && !isUploading && "cursor-pointer"
              )}
              onClick={handleThumbnailClick}
              role="button"
              tabIndex={disabled || isUploading ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleThumbnailClick()
                }
              }}
            >
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="64px"
              />
              {/* Crop icon overlay — visible on hover */}
              {!disabled && !isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Crop className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ) : (
            // Small upload placeholder
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Upload/Change/Remove buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className={cn(
                "text-sm text-primary hover:underline text-left",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              {isUploading ? "Uploading..." : value ? "Change image" : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                className="text-sm text-destructive hover:underline text-left"
                onClick={handleRemove}
                disabled={disabled}
              >
                Remove
              </button>
            )}
            <span className="text-xs text-muted-foreground">Max 20MB · Click to crop</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />
        </div>

        {/* Inline error with retry button */}
        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <span>{uploadError}</span>
            <button
              type="button"
              className="underline font-medium"
              onClick={handleRetry}
              disabled={isUploading}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Crop dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          initialAspect={getAspectForCardType(cardType)}
          outputFormat={sourceImageType === 'image/png' || sourceImageType === 'image/webp' ? 'image/png' : 'image/jpeg'}
        />
      )}
    </>
  )
}
