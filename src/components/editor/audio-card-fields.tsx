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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ReverbConfigModal } from '@/components/audio/reverb-config-modal'
import { BlinkieStylePicker } from '@/components/editor/blinkie-style-picker'
import { BLINKIE_STYLES } from '@/data/blinkie-styles'
import { cn, generateId } from '@/lib/utils'
import { uploadCardImageBlob } from '@/lib/supabase/storage'
import { compressImageForUpload } from '@/lib/image-compression'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import { CardBgPositionDialog } from '@/components/editor/card-bg-position-dialog'
import { CARD_BG_PRESETS } from '@/data/card-bg-presets'
import type { AudioCardContent, AudioTrack, ReverbConfig } from '@/types/audio'
import { DEFAULT_REVERB_CONFIG } from '@/types/audio'

interface AudioCardFieldsProps {
  content: Partial<AudioCardContent>
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
  themeId?: string
}

export function AudioCardFields({ content, onChange, cardId, themeId }: AudioCardFieldsProps) {
  const [isUploadingTrack, setIsUploadingTrack] = useState(false)
  const [isUploadingArt, setIsUploadingArt] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [boxBgPickerOpen, setBoxBgPickerOpen] = useState(false)
  const [isUploadingCardBg, setIsUploadingCardBg] = useState(false)
  const [cardBgPositionOpen, setCardBgPositionOpen] = useState(false)
  const trackInputRef = useRef<HTMLInputElement>(null)
  const artInputRef = useRef<HTMLInputElement>(null)
  const cardBgInputRef = useRef<HTMLInputElement>(null)

  const tracks = content.tracks || []
  const reverbConfig = content.reverbConfig || DEFAULT_REVERB_CONFIG

  // Handle track upload
  async function handleTrackUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('[AudioUpload] File selected:', file.name, 'type:', file.type, 'size:', (file.size / 1024 / 1024).toFixed(2) + 'MB')

    // Check file type - allow audio/* MIME types and common audio extensions
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.aiff', '.wma']
    const hasAudioMime = file.type.startsWith('audio/')
    const hasAudioExt = audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    if (!hasAudioMime && !hasAudioExt) {
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

      const trackId = generateId()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cardId', cardId)
      formData.append('trackId', trackId)

      console.log('[AudioUpload] Sending to /api/audio/upload...', { cardId, trackId })

      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('[AudioUpload] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AudioUpload] Error response:', errorText)
        let errorMessage = 'Upload failed'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('[AudioUpload] Success:', result)

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
      console.error('[AudioUpload] Upload failed:', error)
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

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be less than 20MB')
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
            accept="*/*"
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

      {/* Autoplay Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label>Autoplay</Label>
            <p className="text-xs text-muted-foreground">
              Play automatically when visitors load the page
            </p>
          </div>
          <Switch
            checked={content.autoplay ?? false}
            onCheckedChange={(checked) => onChange({ autoplay: checked })}
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
          {themeId === 'macintosh' ? (
            <>
              <ColorPicker
                label="Window Background"
                color={content.playerColors?.elementBgColor || '#ffffff'}
                onChange={(color) =>
                  onChange({
                    playerColors: { ...content.playerColors, elementBgColor: color },
                  })
                }
              />
              <ColorPicker
                label="Borders"
                color={content.playerColors?.borderColor || '#000000'}
                onChange={(color) =>
                  onChange({
                    playerColors: { ...content.playerColors, borderColor: color },
                  })
                }
              />
              <ColorPicker
                label="Checker Fill"
                color={content.playerColors?.foregroundColor || '#000000'}
                onChange={(color) =>
                  onChange({
                    playerColors: { ...content.playerColors, foregroundColor: color },
                  })
                }
              />
            </>
          ) : (
            <>
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
            </>
          )}
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

      {/* Card Background (poolsuite themes: blinkies, system-settings, mac-os, instagram-reels) */}
      {(themeId === 'blinkies' || themeId === 'system-settings' || themeId === 'mac-os' || themeId === 'instagram-reels' || themeId === 'phone-home') && (() => {
        const styleId = content.blinkieBoxBackgrounds?.cardOuter
        const styleDef = styleId ? BLINKIE_STYLES[styleId] : null
        return (
          <div className="space-y-2">
            <Label>Card Background</Label>
            <div className="flex items-center gap-2 h-8">
              <button
                type="button"
                className="flex-1 h-full overflow-hidden border rounded cursor-pointer hover:ring-1 hover:ring-muted-foreground/30"
                style={{ imageRendering: 'pixelated' as const }}
                onClick={() => setBoxBgPickerOpen(true)}
              >
                {styleDef ? (
                  <img
                    src={`/blinkies/${styleDef.bgID}-0.png`}
                    alt={styleDef.name}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground flex items-center justify-center h-full">
                    None
                  </span>
                )}
              </button>
              {styleId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => onChange({
                    blinkieBoxBackgrounds: {
                      ...content.blinkieBoxBackgrounds,
                      cardOuter: undefined,
                      cardOuterDim: undefined,
                    },
                  })}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Background Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs">Background Image</Label>
              {content.blinkieBoxBackgrounds?.cardBgUrl ? (
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-12 rounded border overflow-hidden cursor-pointer hover:ring-1 hover:ring-muted-foreground/30 transition-all"
                    onClick={() => setCardBgPositionOpen(true)}
                    title="Click to adjust position"
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url('${content.blinkieBoxBackgrounds.cardBgUrl}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `scale(${content.blinkieBoxBackgrounds?.cardBgScale ?? 1}) translate(${content.blinkieBoxBackgrounds?.cardBgPosX ?? 0}%, ${content.blinkieBoxBackgrounds?.cardBgPosY ?? 0}%)`,
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={() =>
                      onChange({
                        blinkieBoxBackgrounds: {
                          ...content.blinkieBoxBackgrounds,
                          cardBgUrl: undefined,
                          cardBgStoragePath: undefined,
                          cardBgScale: undefined,
                          cardBgPosX: undefined,
                          cardBgPosY: undefined,
                          cardBgNone: true,
                        },
                      })
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    ref={cardBgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingCardBg}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (!file.type.startsWith('image/')) { toast.error('File must be an image'); return }
                      if (file.size > 20 * 1024 * 1024) { toast.error('Image must be less than 20MB'); return }
                      try {
                        setIsUploadingCardBg(true)
                        const compressed = await compressImageForUpload(file)
                        const result = await uploadCardImageBlob(compressed, cardId)
                        onChange({
                          blinkieBoxBackgrounds: {
                            ...content.blinkieBoxBackgrounds,
                            cardBgUrl: result.url,
                            cardBgStoragePath: result.path,
                            cardBgNone: undefined,
                            cardOuter: undefined,
                          },
                        })
                        toast.success('Background uploaded')
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Upload failed')
                      } finally {
                        setIsUploadingCardBg(false)
                        if (cardBgInputRef.current) cardBgInputRef.current.value = ''
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isUploadingCardBg}
                    onClick={() => cardBgInputRef.current?.click()}
                  >
                    {isUploadingCardBg ? (
                      <><Upload className="h-3 w-3 mr-1.5 animate-pulse" />Uploading...</>
                    ) : (
                      <><Upload className="h-3 w-3 mr-1.5" />Upload Image</>
                    )}
                  </Button>
                </>
              )}

              {/* Preset library grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {CARD_BG_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.name}
                    className={cn(
                      "relative h-14 rounded overflow-hidden border transition-all",
                      content.blinkieBoxBackgrounds?.cardBgUrl === preset.url
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                        : "hover:ring-1 hover:ring-muted-foreground/30"
                    )}
                    onClick={() =>
                      onChange({
                        blinkieBoxBackgrounds: {
                          ...content.blinkieBoxBackgrounds,
                          cardBgUrl: preset.url,
                          cardBgStoragePath: undefined,
                          cardBgScale: undefined,
                          cardBgPosX: undefined,
                          cardBgPosY: undefined,
                          cardBgNone: undefined,
                          cardOuter: undefined,
                        },
                      })
                    }
                  >
                    <img
                      src={preset.thumbnail || preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {(styleId || content.blinkieBoxBackgrounds?.cardBgUrl) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-shrink-0">Dim</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={content.blinkieBoxBackgrounds?.cardOuterDim ?? 0}
                  onChange={(e) =>
                    onChange({
                      blinkieBoxBackgrounds: {
                        ...content.blinkieBoxBackgrounds,
                        cardOuterDim: parseInt(e.target.value),
                      },
                    })
                  }
                  className="flex-1 h-1.5 accent-primary"
                />
                <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                  {content.blinkieBoxBackgrounds?.cardOuterDim ?? 0}%
                </span>
              </div>
            )}

            <Dialog open={boxBgPickerOpen} onOpenChange={setBoxBgPickerOpen}>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choose Card Background</DialogTitle>
                </DialogHeader>
                <BlinkieStylePicker
                  currentStyle={styleId || ''}
                  onStyleChange={(newStyleId) => {
                    onChange({
                      blinkieBoxBackgrounds: {
                        cardOuter: newStyleId,
                        cardOuterDim: content.blinkieBoxBackgrounds?.cardOuterDim ?? 30,
                        cardBgUrl: undefined,
                        cardBgStoragePath: undefined,
                        cardBgScale: undefined,
                        cardBgPosX: undefined,
                        cardBgPosY: undefined,
                        cardBgNone: true,
                      },
                    })
                    setBoxBgPickerOpen(false)
                  }}
                />
              </DialogContent>
            </Dialog>

            {content.blinkieBoxBackgrounds?.cardBgUrl && (
              <CardBgPositionDialog
                open={cardBgPositionOpen}
                onOpenChange={setCardBgPositionOpen}
                imageUrl={content.blinkieBoxBackgrounds.cardBgUrl}
                scale={content.blinkieBoxBackgrounds?.cardBgScale ?? 1}
                posX={content.blinkieBoxBackgrounds?.cardBgPosX ?? 0}
                posY={content.blinkieBoxBackgrounds?.cardBgPosY ?? 0}
                onSave={(scale, posX, posY) =>
                  onChange({
                    blinkieBoxBackgrounds: {
                      ...content.blinkieBoxBackgrounds,
                      cardBgScale: scale,
                      cardBgPosX: posX,
                      cardBgPosY: posY,
                    },
                  })
                }
              />
            )}
          </div>
        )
      })()}

      {/* Blinkie Colors (poolsuite themes: blinkies, system-settings, mac-os, instagram-reels) */}
      {(themeId === 'blinkies' || themeId === 'system-settings' || themeId === 'mac-os' || themeId === 'instagram-reels' || themeId === 'phone-home') && (() => {
        const palettes: { name: string; outerBox: string; innerBox: string; text: string; playerBox: string; buttons: string }[] = [
          { name: 'Default',        outerBox: '#3d2020', innerBox: '#c9a832', text: '#9898a8', playerBox: '#8b7db8', buttons: '#b83232' },
          { name: 'Classic',        outerBox: '#F9F0E9', innerBox: '#EDE4DA', text: '#000000', playerBox: '#F9F0E9', buttons: '#F9F0E9' },
          { name: 'Ocean Abyss',    outerBox: '#152535', innerBox: '#3d7a8e', text: '#b8d4de', playerBox: '#4a6878', buttons: '#d46b5a' },
          { name: 'Lavender Haze',  outerBox: '#251835', innerBox: '#8b6aad', text: '#d8cce8', playerBox: '#6b5088', buttons: '#c85a8b' },
          { name: 'Emerald Dusk',   outerBox: '#182518', innerBox: '#5a8a5a', text: '#c8d8c4', playerBox: '#3d6840', buttons: '#c8824a' },
          { name: 'Rose Garden',    outerBox: '#351825', innerBox: '#b86a82', text: '#e8ccd8', playerBox: '#8a4a65', buttons: '#d84a68' },
          { name: 'Steel Dawn',     outerBox: '#1e2830', innerBox: '#5878a0', text: '#c8d8e8', playerBox: '#3d5878', buttons: '#4a98b8' },
          { name: 'Amber Glow',     outerBox: '#352518', innerBox: '#c89848', text: '#e8dcc8', playerBox: '#987040', buttons: '#d85828' },
          { name: 'Midnight Iris',  outerBox: '#1a1530', innerBox: '#6a4898', text: '#ccc0e0', playerBox: '#483570', buttons: '#a84888' },
          { name: 'Sage & Clay',    outerBox: '#252818', innerBox: '#8a9868', text: '#d8dec8', playerBox: '#607040', buttons: '#b89048' },
          { name: 'Coral Cove',     outerBox: '#301818', innerBox: '#c87868', text: '#e8d0cc', playerBox: '#904838', buttons: '#4888a0' },
          { name: 'Frost Violet',   outerBox: '#181830', innerBox: '#6868b0', text: '#ccccec', playerBox: '#383870', buttons: '#8848b0' },
          { name: 'Patina',         outerBox: '#182828', innerBox: '#488880', text: '#c8dcd8', playerBox: '#306058', buttons: '#b0884a' },
          { name: 'Dusk Cherry',    outerBox: '#2d1520', innerBox: '#a04058', text: '#e8c8d0', playerBox: '#703048', buttons: '#d0a040' },
          { name: 'Slate & Rust',   outerBox: '#282830', innerBox: '#707088', text: '#d8d8e0', playerBox: '#484860', buttons: '#c06838' },
          { name: 'Deep Lagoon',    outerBox: '#102028', innerBox: '#286878', text: '#b0d0d8', playerBox: '#1a4858', buttons: '#c86080' },
        ]
        return (
        <div className="space-y-3">
          <Label>Card Colors</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {palettes.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                className={cn(
                  "flex flex-col rounded overflow-hidden h-7 transition-all",
                  content.blinkieColors?.outerBox === p.outerBox && content.blinkieColors?.innerBox === p.innerBox
                    ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : "hover:ring-1 hover:ring-muted-foreground/30"
                )}
                onClick={() =>
                  onChange({
                    blinkieColors: {
                      outerBox: p.outerBox,
                      innerBox: p.innerBox,
                      text: p.text,
                      playerBox: p.playerBox,
                      buttons: p.buttons,
                    },
                  })
                }
              >
                <div className="flex-1 flex">
                  <div className="flex-1" style={{ backgroundColor: p.outerBox }} />
                  <div className="flex-1" style={{ backgroundColor: p.innerBox }} />
                  <div className="flex-1" style={{ backgroundColor: p.playerBox }} />
                  <div className="flex-1" style={{ backgroundColor: p.buttons }} />
                  <div className="flex-1" style={{ backgroundColor: p.text }} />
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <ColorPicker
              label="Outer Box"
              color={content.blinkieColors?.outerBox || '#3d2020'}
              onChange={(color) =>
                onChange({ blinkieColors: { ...content.blinkieColors, outerBox: color } })
              }
            />
            <ColorPicker
              label="Inner Box"
              color={content.blinkieColors?.innerBox || '#c9a832'}
              onChange={(color) =>
                onChange({ blinkieColors: { ...content.blinkieColors, innerBox: color } })
              }
            />
            <ColorPicker
              label="Text"
              color={content.blinkieColors?.text || '#9898a8'}
              onChange={(color) =>
                onChange({ blinkieColors: { ...content.blinkieColors, text: color } })
              }
            />
            <ColorPicker
              label="Player Boxes"
              color={content.blinkieColors?.playerBox || '#8b7db8'}
              onChange={(color) =>
                onChange({ blinkieColors: { ...content.blinkieColors, playerBox: color } })
              }
            />
            <ColorPicker
              label="Buttons"
              color={content.blinkieColors?.buttons || '#b83232'}
              onChange={(color) =>
                onChange({ blinkieColors: { ...content.blinkieColors, buttons: color } })
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ blinkieColors: undefined, blinkieBoxBackgrounds: undefined })}
            className="w-full"
          >
            Reset to Theme Defaults
          </Button>
        </div>
        )
      })()}

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
