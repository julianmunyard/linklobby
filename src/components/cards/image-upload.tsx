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

  const aspectClass = aspectRatio === "square" ? "aspect-square" : "aspect-video"

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        // Image preview with remove button
        <div className={cn("relative rounded-lg overflow-hidden bg-muted", aspectClass)}>
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="(max-width: 400px) 100vw, 400px"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      ) : (
        // Upload button/dropzone
        <button
          type="button"
          className={cn(
            "w-full border-2 border-dashed rounded-lg",
            "flex flex-col items-center justify-center gap-2",
            "text-muted-foreground hover:text-foreground hover:border-foreground/50",
            "transition-colors cursor-pointer",
            aspectClass,
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8" />
              <span className="text-sm">Click to upload image</span>
              <span className="text-xs text-muted-foreground">Max 5MB</span>
            </>
          )}
        </button>
      )}

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
