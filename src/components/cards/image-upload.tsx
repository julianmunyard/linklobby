// src/components/cards/image-upload.tsx
"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadCardImage } from "@/lib/supabase/storage"

interface ImageUploadProps {
  value?: string           // Current image URL
  onChange: (url: string | undefined) => void
  cardId: string           // For organizing uploads
  disabled?: boolean
  className?: string
  aspectRatio?: "video" | "square"  // 16:9 or 1:1
}

export function ImageUpload({
  value,
  onChange,
  cardId,
  disabled = false,
  className,
  aspectRatio = "video",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const result = await uploadCardImage(file, cardId)
      onChange(result.url)
      toast.success("Image uploaded")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      toast.error(message)
    } finally {
      setIsUploading(false)
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  function handleRemove() {
    onChange(undefined)
    toast.success("Image removed")
    // Note: We don't delete from storage immediately - orphan cleanup can happen later
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {value ? (
        // Small thumbnail preview with remove button
        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
          <Upload className="h-5 w-5 text-muted-foreground" />
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
        <span className="text-xs text-muted-foreground">Max 5MB</span>
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
  )
}
