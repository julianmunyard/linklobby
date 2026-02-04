// src/components/editor/release-card-fields.tsx
'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Loader2, Upload, Calendar, Music, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { uploadCardImageBlob } from '@/lib/supabase/storage'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import { compressImageForUpload } from '@/lib/image-compression'
import { detectPlatform, isMusicPlatform, getPlatformDisplayName } from '@/lib/platform-embed'
import type { ReleaseCardContent } from '@/types/card'

// Default content for new release cards
export const DEFAULT_RELEASE_CONTENT: Partial<ReleaseCardContent> = {
  showCountdown: true,
  preSaveButtonText: 'Pre-save',
}

interface ReleaseCardFieldsProps {
  content: Partial<ReleaseCardContent>
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
}

export function ReleaseCardFields({ content, onChange, cardId }: ReleaseCardFieldsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
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

      const fileToCompress = new File([croppedBlob], 'album-art.jpg', { type: croppedBlob.type })
      const compressedBlob = await compressImageForUpload(fileToCompress)

      const result = await uploadCardImageBlob(compressedBlob, cardId)
      onChange({ albumArtUrl: result.url, albumArtStoragePath: result.path })
      toast.success('Album art uploaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  function handleRemoveArt() {
    onChange({ albumArtUrl: undefined, albumArtStoragePath: undefined })
    toast.success('Album art removed')
  }

  // Validate music URL
  const musicUrlValid = values.musicUrl
    ? detectPlatform(values.musicUrl)?.platform && isMusicPlatform(detectPlatform(values.musicUrl)!.platform)
    : null

  const detectedPlatform = values.musicUrl ? detectPlatform(values.musicUrl) : null

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
                  setImageToCrop(values.albumArtUrl)
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
      <div className="space-y-2">
        <Label htmlFor="releaseTitle">Release Title</Label>
        <Input
          id="releaseTitle"
          placeholder="Album or single name"
          value={values.releaseTitle || ''}
          onChange={(e) => onChange({ releaseTitle: e.target.value || undefined })}
        />
      </div>

      {/* Artist Name */}
      <div className="space-y-2">
        <Label htmlFor="artistName">Artist Name (optional)</Label>
        <Input
          id="artistName"
          placeholder="Leave blank to use profile name"
          value={values.artistName || ''}
          onChange={(e) => onChange({ artistName: e.target.value || undefined })}
        />
      </div>

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

      {/* Music URL (for post-release / auto-conversion) */}
      <div className="space-y-2">
        <Label htmlFor="musicUrl">
          <span className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Streaming URL
          </span>
        </Label>
        <Input
          id="musicUrl"
          type="url"
          placeholder="Spotify, Apple Music, SoundCloud..."
          value={values.musicUrl || ''}
          onChange={(e) => onChange({ musicUrl: e.target.value || undefined })}
        />
        <p className="text-xs text-muted-foreground">
          When the release goes live, this card will show &quot;Listen Now&quot; linking here.
        </p>

        {/* Music URL validation feedback */}
        {values.musicUrl && musicUrlValid && detectedPlatform && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Detected: {getPlatformDisplayName(detectedPlatform.platform)}</span>
          </div>
        )}
        {values.musicUrl && !musicUrlValid && (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>URL will open as external link. For embeds, use Spotify, Apple Music, etc.</span>
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
          initialAspect={1} // Square aspect for album art
        />
      )}
    </div>
  )
}
