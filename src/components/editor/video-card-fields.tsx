// src/components/editor/video-card-fields.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Link2, Upload, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
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

  // Drag state for video positioning (use refs to avoid stale closure issues)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [, forceUpdate] = useState(0) // Force re-render for cursor change

  // Handle embed URL validation and oEmbed fetch
  async function handleEmbedUrlBlur() {
    if (!embedUrlInput.trim()) {
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

    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Video must be less than 100MB')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await uploadCardVideo(file, cardId)
      onChange({
        uploadedVideoUrl: result.url,
        uploadedVideoPath: result.path,
        videoZoom: 1,
        videoPositionX: 50,
        videoPositionY: 50,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload video'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Drag handlers for video positioning - use document listeners for reliable drag
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const zoom = content.videoZoom ?? 1
    if (zoom <= 1) return // No drag when not zoomed

    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    forceUpdate(n => n + 1)

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: content.videoPositionX ?? 50,
      posY: content.videoPositionY ?? 50,
    }

    // Add document-level listeners for drag
    const handleDocMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current || !previewRef.current) return
      moveEvent.preventDefault()

      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY
      const rect = previewRef.current.getBoundingClientRect()

      const currentZoom = content.videoZoom ?? 1
      const maxOffset = currentZoom > 1 ? ((currentZoom - 1) / currentZoom) * 50 : 0

      const deltaX = ((moveX - dragStartRef.current.x) / rect.width) * 100
      const deltaY = ((moveY - dragStartRef.current.y) / rect.height) * 100

      let newPosX = dragStartRef.current.posX - deltaX
      let newPosY = dragStartRef.current.posY - deltaY

      if (maxOffset > 0) {
        newPosX = Math.max(50 - maxOffset, Math.min(50 + maxOffset, newPosX))
        newPosY = Math.max(50 - maxOffset, Math.min(50 + maxOffset, newPosY))
      }

      onChange({ videoPositionX: newPosX, videoPositionY: newPosY })
    }

    const handleDocEnd = () => {
      isDraggingRef.current = false
      dragStartRef.current = null
      forceUpdate(n => n + 1)
      document.removeEventListener('mousemove', handleDocMove)
      document.removeEventListener('mouseup', handleDocEnd)
      document.removeEventListener('touchmove', handleDocMove)
      document.removeEventListener('touchend', handleDocEnd)
    }

    document.addEventListener('mousemove', handleDocMove)
    document.addEventListener('mouseup', handleDocEnd)
    document.addEventListener('touchmove', handleDocMove, { passive: false })
    document.addEventListener('touchend', handleDocEnd)
  }, [content.videoZoom, content.videoPositionX, content.videoPositionY, onChange])

  // Reset zoom/position
  const handleResetZoom = () => {
    onChange({ videoZoom: 1, videoPositionX: 50, videoPositionY: 50 })
  }

  const zoom = content.videoZoom ?? 1
  const posX = content.videoPositionX ?? 50
  const posY = content.videoPositionY ?? 50

  return (
    <div className="space-y-4">
      {/* Video Source Toggle */}
      <div className="space-y-2">
        <Label>Video Source</Label>
        <ToggleGroup
          type="single"
          value={content.videoType || 'upload'}
          onValueChange={(value) => {
            if (value) onChange({ videoType: value })
          }}
          className="w-full"
        >
          <ToggleGroupItem value="upload" aria-label="Upload video" className="flex-1">
            <Upload className="h-4 w-4 mr-2" /> Upload
          </ToggleGroupItem>
          <ToggleGroupItem value="embed" aria-label="Embed URL" className="flex-1">
            <Link2 className="h-4 w-4 mr-2" /> Embed
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Upload Mode */}
      {(content.videoType === 'upload' || !content.videoType) && (
        <div className="space-y-4">
          {content.uploadedVideoUrl ? (
            <>
              {/* Video Preview with Zoom/Pan */}
              <div className="space-y-2">
                <Label>Adjust Video</Label>
                <p className="text-xs text-muted-foreground">
                  {(content.videoZoom ?? 1) > 1
                    ? "Drag to reposition the zoomed area"
                    : "Zoom in to crop and reposition"}
                </p>

                {/* Preview Container */}
                <div
                  ref={previewRef}
                  className={`relative aspect-video rounded-lg overflow-hidden bg-black border select-none ${
                    (content.videoZoom ?? 1) > 1
                      ? "cursor-grab active:cursor-grabbing"
                      : "cursor-default"
                  }`}
                  onMouseDown={handleDragStart}
                  onTouchStart={handleDragStart}
                >
                  <video
                    src={content.uploadedVideoUrl}
                    className="w-full h-full pointer-events-none"
                    style={{
                      transform: `scale(${zoom})`,
                      objectFit: 'cover',
                      objectPosition: `${posX}% ${posY}%`,
                    }}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  {isDraggingRef.current && (
                    <div className="absolute inset-0 bg-black/20" />
                  )}
                </div>

                {/* Zoom Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm">Zoom</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{zoom.toFixed(1)}x</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResetZoom}
                        className="h-6 px-2"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => {
                      onChange({ videoZoom: value })
                      // Reset position when zoom changes to keep centered
                      if (value === 1) {
                        onChange({ videoZoom: 1, videoPositionX: 50, videoPositionY: 50 })
                      }
                    }}
                    min={1}
                    max={2}
                    step={0.1}
                  />
                </div>
              </div>

              {/* Replace Video Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('videoUpload')?.click()}
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
              <Input
                id="videoUpload"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
              />
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="videoUpload">Upload Video</Label>
              <Input
                id="videoUpload"
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                MP4, WebM, or OGG. Max 100MB.
              </p>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Embed Mode */}
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
