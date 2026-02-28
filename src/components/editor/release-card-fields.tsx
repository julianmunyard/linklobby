// src/components/editor/release-card-fields.tsx
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Loader2, Upload, Calendar, AlertCircle, ExternalLink, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { uploadCardImageBlob } from '@/lib/supabase/storage'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import { compressImageForUpload } from '@/lib/image-compression'
import type { ReleaseCardContent } from '@/types/card'

// Default content for new release cards
export const DEFAULT_RELEASE_CONTENT: Partial<ReleaseCardContent> = {
  showCountdown: true,
  preSaveButtonText: 'Pre-save',
  afterCountdownAction: 'custom',
  afterCountdownText: 'OUT NOW',
}

interface ReleaseCardFieldsProps {
  content: Partial<ReleaseCardContent>
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
  hideNameFields?: boolean
}

export function ReleaseCardFields({ content, onChange, cardId, hideNameFields }: ReleaseCardFieldsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const originalFileRef = useRef<File | null>(null)
  // Holds the original (uncropped) image URL for the current crop session
  const pendingOriginalUrlRef = useRef<string | null>(null)

  // Merge with defaults
  const values: Partial<ReleaseCardContent> = {
    ...DEFAULT_RELEASE_CONTENT,
    ...content,
  }

  // Convert UTC ISO to local datetime-local format
  function utcToLocal(utcString?: string): string {
    if (!utcString) return ''
    const date = new Date(utcString)
    // Format as YYYY-MM-DDTHH:MM (datetime-local format)
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    return localDate.toISOString().slice(0, 16)
  }

  // Convert local datetime-local to UTC ISO
  function localToUtc(localString: string): string | undefined {
    if (!localString) return undefined
    const localDate = new Date(localString)
    return localDate.toISOString()
  }

  // Handle album art file selection
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be less than 20MB')
      return
    }

    originalFileRef.current = file

    // GIFs: upload directly to preserve animation (canvas destroys frames)
    if (file.type === 'image/gif') {
      try {
        setIsUploading(true)
        const result = await uploadCardImageBlob(file, cardId, file.type)
        onChange({ albumArtUrl: result.url, albumArtStoragePath: result.path, originalAlbumArtUrl: undefined })
        toast.success('Album art uploaded')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setUploadError(message)
      } finally {
        setIsUploading(false)
      }
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    // Upload the original (uncropped) image to storage first
    try {
      const isPng = file.type === 'image/png' || file.type === 'image/webp'
      const uploadType = isPng ? 'image/png' : 'image/jpeg'
      const ext = isPng ? 'png' : 'jpg'
      const fileToCompress = new File([file], `original.${ext}`, { type: uploadType })
      const compressedOriginal = await compressImageForUpload(fileToCompress)
      const originalResult = await uploadCardImageBlob(compressedOriginal, cardId, uploadType)
      pendingOriginalUrlRef.current = originalResult.url
    } catch {
      pendingOriginalUrlRef.current = null
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImageToCrop(dataUrl)
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Handle crop complete - upload
  async function handleCropComplete(croppedBlob: Blob) {
    try {
      setIsUploading(true)
      setUploadError(null)

      const isPng = originalFileRef.current?.type === 'image/png'
      const ext = isPng ? 'png' : 'jpg'
      const fileToCompress = new File([croppedBlob], `album-art.${ext}`, { type: croppedBlob.type })
      const compressedBlob = await compressImageForUpload(fileToCompress)

      const result = await uploadCardImageBlob(compressedBlob, cardId, isPng ? 'image/png' : 'image/jpeg')
      const originalUrl = pendingOriginalUrlRef.current || values.originalAlbumArtUrl
      onChange({ albumArtUrl: result.url, albumArtStoragePath: result.path, ...(originalUrl ? { originalAlbumArtUrl: originalUrl } : {}) })
      pendingOriginalUrlRef.current = null
      toast.success('Album art uploaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveArt() {
    onChange({ albumArtUrl: undefined, albumArtStoragePath: undefined, originalAlbumArtUrl: undefined })
    toast.success('Album art removed')
  }

  return (
    <div className="space-y-4">
      {/* Album Art Upload */}
      <div className="space-y-2">
        <Label>Album Art</Label>
        <div className="flex items-center gap-3">
          {values.albumArtUrl ? (
            <div
              className={cn(
                'relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0',
                !isUploading && 'cursor-pointer hover:opacity-80 transition-opacity'
              )}
              onClick={() => {
                if (!isUploading && values.albumArtUrl) {
                  // Use original (uncropped) image for re-crop if available
                  setImageToCrop(values.originalAlbumArtUrl || values.albumArtUrl)
                  pendingOriginalUrlRef.current = values.originalAlbumArtUrl || null
                  setCropDialogOpen(true)
                }
              }}
            >
              <Image
                src={values.albumArtUrl}
                alt="Album art"
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <button
              type="button"
              className="text-sm text-primary hover:underline text-left"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : values.albumArtUrl ? 'Change art' : 'Upload art'}
            </button>
            {values.albumArtUrl && (
              <button
                type="button"
                className="text-sm text-destructive hover:underline text-left"
                onClick={handleRemoveArt}
              >
                Remove
              </button>
            )}
            <span className="text-xs text-muted-foreground">Square recommended</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Release Title */}
      {!hideNameFields && (
        <div className="space-y-2">
          <Label htmlFor="releaseTitle">Release Title</Label>
          <Input
            id="releaseTitle"
            placeholder="Album or single name"
            value={values.releaseTitle || ''}
            onChange={(e) => onChange({ releaseTitle: e.target.value || undefined })}
          />
        </div>
      )}

      {/* Artist Name */}
      {!hideNameFields && (
        <div className="space-y-2">
          <Label htmlFor="artistName">Artist Name (optional)</Label>
          <Input
            id="artistName"
            placeholder="Leave blank to use profile name"
            value={values.artistName || ''}
            onChange={(e) => onChange({ artistName: e.target.value || undefined })}
          />
        </div>
      )}

      {/* Release Date */}
      <div className="space-y-2">
        <Label htmlFor="releaseDate">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Release Date & Time
          </span>
        </Label>
        <Input
          id="releaseDate"
          type="datetime-local"
          value={utcToLocal(values.releaseDate)}
          onChange={(e) => onChange({ releaseDate: localToUtc(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          Time is in your local timezone. Countdown will tick to this moment.
        </p>
      </div>

      {/* Show Countdown */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="showCountdown">Show Countdown</Label>
          <p className="text-xs text-muted-foreground">
            Display countdown timer before release
          </p>
        </div>
        <Switch
          id="showCountdown"
          checked={values.showCountdown ?? true}
          onCheckedChange={(checked) => onChange({ showCountdown: checked })}
        />
      </div>

      {/* Pre-save URL */}
      <div className="space-y-2">
        <Label htmlFor="preSaveUrl">Pre-save URL</Label>
        <Input
          id="preSaveUrl"
          type="url"
          placeholder="https://feature.fm/... or https://smarturl.it/..."
          value={values.preSaveUrl || ''}
          onChange={(e) => onChange({ preSaveUrl: e.target.value || undefined })}
        />
        <p className="text-xs text-muted-foreground">
          Link to pre-save page (feature.fm, smarturl, distrokid, etc.)
        </p>
      </div>

      {/* Pre-save Button Text */}
      {values.preSaveUrl && (
        <div className="space-y-2">
          <Label htmlFor="preSaveButtonText">Pre-save Button Text</Label>
          <Input
            id="preSaveButtonText"
            placeholder="Pre-save"
            value={values.preSaveButtonText || 'Pre-save'}
            onChange={(e) => onChange({ preSaveButtonText: e.target.value || 'Pre-save' })}
          />
        </div>
      )}

      {/* When Countdown Ends Section */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-base font-medium">When Countdown Ends</Label>

        <div className="space-y-2">
          {/* Option: Show Custom Message */}
          <div
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-colors",
              (values.afterCountdownAction === 'custom' || !values.afterCountdownAction) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            onClick={() => onChange({ afterCountdownAction: 'custom' })}
          >
            <div className="flex items-center gap-2 font-medium">
              <ExternalLink className="h-4 w-4" />
              Show custom message with link
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Album art with custom button text and link
            </p>
            {(values.afterCountdownAction === 'custom' || !values.afterCountdownAction) && (
              <div className="pt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-1">
                  <Label htmlFor="afterCountdownText" className="text-xs">Button Text</Label>
                  <Input
                    id="afterCountdownText"
                    placeholder="OUT NOW"
                    value={values.afterCountdownText || ''}
                    onChange={(e) => onChange({ afterCountdownText: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="afterCountdownUrl" className="text-xs">Link URL</Label>
                  <Input
                    id="afterCountdownUrl"
                    type="url"
                    placeholder="https://linktr.ee/artist or any URL"
                    value={values.afterCountdownUrl || ''}
                    onChange={(e) => onChange({ afterCountdownUrl: e.target.value || undefined })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Option: Hide Card */}
          <div
            className={cn(
              "p-3 rounded-lg border cursor-pointer transition-colors",
              values.afterCountdownAction === 'hide' ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
            onClick={() => onChange({ afterCountdownAction: 'hide' })}
          >
            <div className="flex items-center gap-2 font-medium">
              <EyeOff className="h-4 w-4" />
              Hide card
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Card disappears when countdown ends
            </p>
          </div>
        </div>
      </div>

      {/* Crop dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          initialAspect={1} // Square aspect for album art
          outputFormat={originalFileRef.current?.type === 'image/png' ? 'image/png' : 'image/jpeg'}
        />
      )}
    </div>
  )
}
