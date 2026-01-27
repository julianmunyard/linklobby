// src/components/editor/video-card-fields.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Link2, Upload, Loader2, AlertCircle } from 'lucide-react'
import { parseVideoUrl } from '@/lib/video-embed'
import { uploadCardVideo } from '@/lib/supabase/storage'
import type { VideoCardContent } from '@/types/card'

interface VideoCardFieldsProps {
  content: VideoCardContent
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
}

export function VideoCardFields({ content, onChange, cardId }: VideoCardFieldsProps) {
  const [embedUrlInput, setEmbedUrlInput] = useState(content.embedUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle embed URL validation and oEmbed fetch
  async function handleEmbedUrlBlur() {
    if (!embedUrlInput.trim()) {
      // Clear embed data if URL is empty
      onChange({
        embedUrl: undefined,
        embedService: undefined,
        embedVideoId: undefined,
        embedThumbnailUrl: undefined,
      })
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const videoInfo = await parseVideoUrl(embedUrlInput)

      // Update content with parsed video info
      onChange({
        embedUrl: videoInfo.embedUrl,
        embedService: videoInfo.service,
        embedVideoId: videoInfo.id,
        embedThumbnailUrl: videoInfo.thumbnailUrl,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid video URL'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle video file upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      setError('Video must be less than 100MB')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await uploadCardVideo(file, cardId)

      // Update content with uploaded video info
      onChange({
        uploadedVideoUrl: result.url,
        uploadedVideoPath: result.path,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload video'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Video Type Toggle */}
      <div className="space-y-2">
        <Label>Video Source</Label>
        <ToggleGroup
          type="single"
          value={content.videoType || 'embed'}
          onValueChange={(value) => {
            if (value) onChange({ videoType: value })
          }}
        >
          <ToggleGroupItem value="embed" aria-label="Embed URL">
            <Link2 className="h-4 w-4 mr-2" /> Embed
          </ToggleGroupItem>
          <ToggleGroupItem value="upload" aria-label="Upload video">
            <Upload className="h-4 w-4 mr-2" /> Upload
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Embed URL Input */}
      {content.videoType === 'embed' && (
        <div className="space-y-2">
          <Label htmlFor="embedUrl">Video URL</Label>
          <div className="relative">
            <Input
              id="embedUrl"
              type="url"
              placeholder="Paste YouTube, Vimeo, or TikTok URL"
              value={embedUrlInput}
              onChange={(e) => setEmbedUrlInput(e.target.value)}
              onBlur={handleEmbedUrlBlur}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {content.embedThumbnailUrl && (
            <p className="text-xs text-muted-foreground">
              ✓ Video loaded from {content.embedService}
            </p>
          )}
        </div>
      )}

      {/* Video Upload */}
      {content.videoType === 'upload' && (
        <div className="space-y-2">
          <Label htmlFor="videoUpload">Upload Video</Label>

          {content.uploadedVideoUrl ? (
            <div className="space-y-2">
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium mb-1">Video uploaded</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {content.uploadedVideoPath}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Trigger file input click to replace video
                  document.getElementById('videoUpload')?.click()
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Replace Video
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                id="videoUpload"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                MP4, WebM, or OGG. Max 100MB.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
