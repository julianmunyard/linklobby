'use client'

import { useState, useRef } from 'react'
import { Upload, Trash2, X, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import { ReverbConfigModal } from '@/components/audio/reverb-config-modal'
import { cn } from '@/lib/utils'
import { uploadCardImageBlob } from '@/lib/supabase/storage'
import { compressImageForUpload } from '@/lib/image-compression'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import type { AudioCardContent, AudioTrack, ReverbConfig } from '@/types/audio'
import { DEFAULT_REVERB_CONFIG } from '@/types/audio'

interface AudioCardFieldsProps {
  content: Partial<AudioCardContent>
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
}

export function AudioCardFields({ content, onChange, cardId }: AudioCardFieldsProps) {
  const [isUploadingTrack, setIsUploadingTrack] = useState(false)
  const [isUploadingArt, setIsUploadingArt] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const trackInputRef = useRef<HTMLInputElement>(null)
  const artInputRef = useRef<HTMLInputElement>(null)

  const tracks = content.tracks || []
  const reverbConfig = content.reverbConfig || DEFAULT_REVERB_CONFIG

  // Handle track upload
  async function handleTrackUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      toast.error('File must be an audio file')
      return
    }

    // 100MB limit
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Audio file must be less than 100MB')
      return
    }

    try {
      setIsUploadingTrack(true)
      setUploadProgress(0)

      const trackId = crypto.randomUUID()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cardId', cardId)
      formData.append('trackId', trackId)

      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const result = await response.json()

      // Create track object
      const newTrack: AudioTrack = {
        id: trackId,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        artist: '',
        duration: result.duration || 0,
        audioUrl: result.url,
        storagePath: result.path,
        waveformData: result.waveformData,
      }

      // Add to tracks array
      const updatedTracks = [...tracks, newTrack]
      onChange({ tracks: updatedTracks })

      toast.success('Track uploaded')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploadingTrack(false)
      setUploadProgress(0)
      if (trackInputRef.current) {
        trackInputRef.current.value = ''
      }
    }
  }

  // Handle track field updates
  function handleTrackUpdate(trackId: string, field: 'title' | 'artist', value: string) {
    const updatedTracks = tracks.map((track) =>
      track.id === trackId ? { ...track, [field]: value } : track
    )
    onChange({ tracks: updatedTracks })
  }

  // Handle track deletion
  async function handleTrackDelete(trackId: string) {
    const track = tracks.find((t) => t.id === trackId)
    if (!track) return

    try {
      // Remove from tracks array
      const updatedTracks = tracks.filter((t) => t.id !== trackId)
      onChange({ tracks: updatedTracks })

      // Delete from storage
      const response = await fetch(`/api/audio/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: track.storagePath }),
      })

      if (!response.ok) {
        console.error('Failed to delete track from storage')
      }

      toast.success('Track deleted')
    } catch (error) {
      console.error('Failed to delete track:', error)
      toast.error('Failed to delete track')
    }
  }

  // Handle album art file selection
  async function handleArtSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

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

    if (artInputRef.current) {
      artInputRef.current.value = ''
    }
  }

  // Handle crop complete - upload album art
  async function handleCropComplete(croppedBlob: Blob) {
    try {
      setIsUploadingArt(true)

      const fileToCompress = new File([croppedBlob], 'album-art.jpg', { type: croppedBlob.type })
      const compressedBlob = await compressImageForUpload(fileToCompress)

      const result = await uploadCardImageBlob(compressedBlob, cardId)
      onChange({ albumArtUrl: result.url, albumArtStoragePath: result.path })
      toast.success('Album art uploaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploadingArt(false)
    }
  }

  // Handle album art removal
  function handleRemoveArt() {
    onChange({ albumArtUrl: undefined, albumArtStoragePath: undefined })
    toast.success('Album art removed')
  }

  // Handle reverb config save
  function handleReverbSave(newConfig: ReverbConfig) {
    onChange({ reverbConfig: newConfig })
  }

  // Format reverb status for display
  function getReverbStatus(): string {
    if (!reverbConfig.enabled) return 'Reverb: Off'
    return `Reverb: On (Room: ${(reverbConfig.roomSize * 100).toFixed(0)}%)`
  }

  return (
    <div className="space-y-6">
      {/* Track Upload Section */}
      <div className="space-y-3">
        <Label>Audio Tracks</Label>

        {/* Upload Button */}
        <div>
          <input
            ref={trackInputRef}
            type="file"
            accept="audio/*"
            onChange={handleTrackUpload}
            className="hidden"
            disabled={isUploadingTrack}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => trackInputRef.current?.click()}
            disabled={isUploadingTrack}
            className="w-full"
          >
            {isUploadingTrack ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading... {uploadProgress > 0 && `${uploadProgress}%`}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Track
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            MP3, WAV, or other audio formats. Max 100MB.
          </p>
        </div>

        {/* Track List */}
        {tracks.length > 0 && (
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div key={track.id} className="p-3 rounded-lg border bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">Track {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTrackDelete(track.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Track title"
                  value={track.title}
                  onChange={(e) => handleTrackUpdate(track.id, 'title', e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Artist name"
                  value={track.artist}
                  onChange={(e) => handleTrackUpdate(track.id, 'artist', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Album Art Section */}
      <div className="space-y-2">
        <Label>Album Art</Label>
        <div className="flex items-center gap-3">
          {content.albumArtUrl ? (
            <div
              className={cn(
                'relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0',
                !isUploadingArt && 'cursor-pointer hover:opacity-80 transition-opacity'
              )}
              onClick={() => {
                if (!isUploadingArt && content.albumArtUrl) {
                  setImageToCrop(content.albumArtUrl)
                  setCropDialogOpen(true)
                }
              }}
            >
              <Image
                src={content.albumArtUrl}
                alt="Album art"
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 space-y-2">
            <input
              ref={artInputRef}
              type="file"
              accept="image/*"
              onChange={handleArtSelect}
              className="hidden"
              disabled={isUploadingArt}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => artInputRef.current?.click()}
              disabled={isUploadingArt}
              className="w-full"
            >
              {content.albumArtUrl ? 'Change' : 'Upload'}
            </Button>
            {content.albumArtUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveArt}
                className="w-full"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Player Display Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Waveform Display</Label>
            <p className="text-xs text-muted-foreground">
              Show waveform or progress bar
            </p>
          </div>
          <Switch
            checked={content.showWaveform ?? true}
            onCheckedChange={(checked) => onChange({ showWaveform: checked })}
          />
        </div>
      </div>

      {/* Looping Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Loop Playback</Label>
            <p className="text-xs text-muted-foreground">
              Automatically restart when track ends
            </p>
          </div>
          <Switch
            checked={content.looping ?? false}
            onCheckedChange={(checked) => onChange({ looping: checked })}
          />
        </div>
      </div>

      {/* Reverb Configuration */}
      <div className="space-y-2">
        <Label>Reverb Effect</Label>
        <ReverbConfigModal
          config={reverbConfig}
          onSave={handleReverbSave}
          trigger={
            <Button type="button" variant="outline" size="sm" className="w-full justify-start">
              <Settings2 className="h-4 w-4 mr-2" />
              {getReverbStatus()}
            </Button>
          }
        />
      </div>

      {/* Player Colors */}
      <div className="space-y-3">
        <Label>Player Colors</Label>
        <div className="space-y-2">
          <ColorPicker
            label="Border"
            color={content.playerColors?.borderColor || '#3b82f6'}
            onChange={(color) =>
              onChange({
                playerColors: { ...content.playerColors, borderColor: color },
              })
            }
          />
          <ColorPicker
            label="Elements"
            color={content.playerColors?.elementBgColor || '#e5e7eb'}
            onChange={(color) =>
              onChange({
                playerColors: { ...content.playerColors, elementBgColor: color },
              })
            }
          />
          <ColorPicker
            label="Accent"
            color={content.playerColors?.foregroundColor || '#3b82f6'}
            onChange={(color) =>
              onChange({
                playerColors: { ...content.playerColors, foregroundColor: color },
              })
            }
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange({ playerColors: undefined })}
          className="w-full"
        >
          Reset to Theme Defaults
        </Button>
      </div>

      {/* Image Crop Dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          initialAspect={1} // Square for album art
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
