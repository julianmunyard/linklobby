// src/components/cards/image-upload.tsx
"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadCardImageBlob } from "@/lib/supabase/storage"
import { ImageCropDialog } from "@/components/shared/image-crop-dialog"
import type { CardType } from "@/types/card"

interface ImageUploadProps {
  value?: string           // Current image URL
  onChange: (url: string | undefined) => void
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
  onChange,
  cardId,
  cardType,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle file selection - open crop dialog
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image")
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
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

  // Handle thumbnail click - open crop dialog with existing image
  function handleThumbnailClick() {
    if (!value || disabled || isUploading) return
    setImageToCrop(value)
    setCropDialogOpen(true)
  }

  // Handle crop complete - upload cropped blob
  async function handleCropComplete(croppedBlob: Blob) {
    try {
      setIsUploading(true)
      const result = await uploadCardImageBlob(croppedBlob, cardId)
      onChange(result.url)
      toast.success("Image uploaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemove() {
    onChange(undefined)
    toast.success("Image removed")
    // Note: We don't delete from storage immediately - orphan cleanup can happen later
  }

  return (
    <>
      <div className={cn("flex items-center gap-3", className)}>
        {value ? (
          // Small thumbnail preview with click-to-crop
          <div
            className={cn(
              "relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0",
              !disabled && !isUploading && "cursor-pointer hover:opacity-80 transition-opacity"
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
          <span className="text-xs text-muted-foreground">Max 5MB · Click to crop</span>
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

      {/* Crop dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          initialAspect={getAspectForCardType(cardType)}
        />
      )}
    </>
  )
}
