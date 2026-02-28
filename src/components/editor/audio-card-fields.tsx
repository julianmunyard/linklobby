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
import { cn } from '@/lib/utils'
import { uploadCardImageBlob } from '@/lib/supabase/storage'
import { uploadAudioTrack, type UploadProgress } from '@/lib/audio/upload-audio-track'
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
  cardTitle?: string
  onCardTitleChange?: (title: string) => void
}

export function AudioCardFields({ content, onChange, cardId, themeId, cardTitle, onCardTitleChange }: AudioCardFieldsProps) {
  const [isUploadingTrack, setIsUploadingTrack] = useState(false)
  const [isUploadingArt, setIsUploadingArt] = useState<string | false>(false) // trackId or false
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [boxBgPickerOpen, setBoxBgPickerOpen] = useState(false)
  const [isUploadingCardBg, setIsUploadingCardBg] = useState(false)
  const [cardBgPositionOpen, setCardBgPositionOpen] = useState(false)
  const trackInputRef = useRef<HTMLInputElement>(null)
  const artInputRef = useRef<HTMLInputElement>(null)
  const artTrackIdRef = useRef<string | null>(null)
  const cardBgInputRef = useRef<HTMLInputElement>(null)
  const originalFileRef = useRef<File | null>(null)
  // Holds the original (uncropped) image URL for the current crop session
  const pendingOriginalUrlRef = useRef<string | null>(null)

  const tracks = content.tracks || []
  const reverbConfig = content.reverbConfig || DEFAULT_REVERB_CONFIG
  const isCdPlayer = content.playerStyle === 'cd-player'
  const isPhoneHomeDefault = themeId === 'phone-home' && !isCdPlayer

  // Handle track upload
  async function handleTrackUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingTrack(true)
      setUploadProgress(null)

      const newTrack = await uploadAudioTrack(file, cardId, (progress) => {
        setUploadProgress(progress)
      })

      onChange({ tracks: [...tracks, newTrack] })
      toast.success('Track uploaded')
    } catch (error) {
      console.error('[AudioUpload] Upload failed:', error)
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploadingTrack(false)
      setUploadProgress(null)
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

  // Handle album art file selection (per-track)
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

    const trackId = artTrackIdRef.current
    originalFileRef.current = file

    // GIFs: upload directly to preserve animation (canvas destroys frames)
    if (file.type === 'image/gif') {
      try {
        setIsUploadingArt(trackId || 'card')
        const result = await uploadCardImageBlob(file, cardId, file.type)
        if (trackId) {
          const updatedTracks = tracks.map((t) =>
            t.id === trackId ? { ...t, albumArtUrl: result.url, albumArtStoragePath: result.path, originalAlbumArtUrl: undefined } : t
          )
          onChange({ tracks: updatedTracks })
        } else {
          onChange({ albumArtUrl: result.url, albumArtStoragePath: result.path, originalAlbumArtUrl: undefined })
        }
        toast.success('Album art uploaded')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        toast.error(message)
      } finally {
        setIsUploadingArt(false)
      }
      if (artInputRef.current) artInputRef.current.value = ''
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

    if (artInputRef.current) {
      artInputRef.current.value = ''
    }
  }

  // Handle crop complete - upload album art (per-track)
  async function handleCropComplete(croppedBlob: Blob) {
    const trackId = artTrackIdRef.current
    try {
      setIsUploadingArt(trackId || 'card')

      const isPng = originalFileRef.current?.type === 'image/png'
      const ext = isPng ? 'png' : 'jpg'
      const fileToCompress = new File([croppedBlob], `album-art.${ext}`, { type: croppedBlob.type })
      const compressedBlob = await compressImageForUpload(fileToCompress)

      const result = await uploadCardImageBlob(compressedBlob, cardId, isPng ? 'image/png' : 'image/jpeg')
      const originalUrl = pendingOriginalUrlRef.current
      if (trackId) {
        const track = tracks.find(t => t.id === trackId)
        const origArtUrl = originalUrl || (track as unknown as Record<string, unknown>)?.originalAlbumArtUrl as string | undefined
        const updatedTracks = tracks.map((t) =>
          t.id === trackId ? { ...t, albumArtUrl: result.url, albumArtStoragePath: result.path, ...(origArtUrl ? { originalAlbumArtUrl: origArtUrl } : {}) } : t
        )
        onChange({ tracks: updatedTracks })
      } else {
        const origArtUrl = originalUrl || (content as Record<string, unknown>).originalAlbumArtUrl as string | undefined
        onChange({ albumArtUrl: result.url, albumArtStoragePath: result.path, ...(origArtUrl ? { originalAlbumArtUrl: origArtUrl } : {}) })
      }
      pendingOriginalUrlRef.current = null
      toast.success('Album art uploaded')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploadingArt(false)
    }
  }

  // Handle album art removal (per-track)
  function handleRemoveTrackArt(trackId: string) {
    const updatedTracks = tracks.map((t) =>
      t.id === trackId ? { ...t, albumArtUrl: undefined, albumArtStoragePath: undefined, originalAlbumArtUrl: undefined } : t
    )
    onChange({ tracks: updatedTracks })
    toast.success('Album art removed')
  }

  // Handle reverb config save
  function handleReverbSave(newConfig: ReverbConfig) {
    onChange({ reverbConfig: newConfig })
  }

  // Format reverb status for display
  function getReverbStatus(): string {
    return `Reverb (Room: ${(reverbConfig.roomSize * 100).toFixed(0)}%)`
  }

  return (
    <div className="space-y-6">
      {/* Display Title */}
      {onCardTitleChange && (
        <div className="space-y-2">
          <Label>Display Title</Label>
          <Input
            placeholder="Player title"
            value={cardTitle ?? ''}
            onChange={(e) => onCardTitleChange(e.target.value)}
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">
            Shown as the menu label in iPod and other themes
          </p>
        </div>
      )}

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
                {uploadProgress?.label || 'Processing...'} {uploadProgress ? `${Math.round(uploadProgress.ratio * 100)}%` : ''}
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
                <div className="flex gap-2">
                  {/* Per-track album art thumbnail */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    {track.albumArtUrl ? (
                      <div
                        className="relative h-12 w-12 rounded overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          if (isUploadingArt) return
                          artTrackIdRef.current = track.id
                          // Use original (uncropped) image for re-crop if available
                          const origUrl = (track as unknown as Record<string, unknown>).originalAlbumArtUrl as string | undefined
                          setImageToCrop(origUrl || track.albumArtUrl!)
                          pendingOriginalUrlRef.current = origUrl || null
                          setCropDialogOpen(true)
                        }}
                      >
                        <Image
                          src={track.albumArtUrl}
                          alt="Track art"
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="h-12 w-12 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        onClick={() => {
                          artTrackIdRef.current = track.id
                          artInputRef.current?.click()
                        }}
                        disabled={!!isUploadingArt}
                      >
                        {isUploadingArt === track.id ? (
                          <Upload className="h-3 w-3 text-muted-foreground animate-pulse" />
                        ) : (
                          <Upload className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    {track.albumArtUrl && (
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            artTrackIdRef.current = track.id
                            artInputRef.current?.click()
                          }}
                        >
                          Edit
                        </button>
                        <span className="text-[10px] text-muted-foreground/40">|</span>
                        <button
                          type="button"
                          className="text-[10px] text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveTrackArt(track.id)}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Track title & artist fields */}
                  <div className="flex-1 space-y-2">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input for per-track album art */}
      <input
        ref={artInputRef}
        type="file"
        accept="image/*"
        onChange={handleArtSelect}
        className="hidden"
        disabled={!!isUploadingArt}
      />

      {/* Player Style selector (phone-home theme only) */}
      {themeId === 'phone-home' && (
        <div className="space-y-2">
          <Label>Player Style</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-all",
                (!content.playerStyle || content.playerStyle === 'default')
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : "hover:border-muted-foreground/40"
              )}
              onClick={() => onChange({ playerStyle: 'default' })}
            >
              <span className="text-lg">🎛</span>
              <span className="font-medium">Default</span>
            </button>
            <button
              type="button"
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs transition-all",
                content.playerStyle === 'cd-player'
                  ? "ring-2 ring-primary border-primary bg-primary/5"
                  : "hover:border-muted-foreground/40"
              )}
              onClick={() => onChange({ playerStyle: 'cd-player' })}
            >
              <span className="text-lg">💿</span>
              <span className="font-medium">CD Player</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Window Color & Text Color (macintosh theme) */}
      {themeId === 'macintosh' && (
        <>
          <div className="space-y-2">
            <Label>Window Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={content.playerColors?.elementBgColor || '#ffffff'}
                onChange={(e) => onChange({ playerColors: { ...content.playerColors, elementBgColor: e.target.value } })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#ffffff"
                value={content.playerColors?.elementBgColor || ''}
                onChange={(e) => onChange({ playerColors: { ...content.playerColors, elementBgColor: e.target.value } })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={content.textColor || '#000000'}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#000000"
                value={content.textColor || ''}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      {/* Card Background (poolsuite themes + phone-home default player) */}
      {(themeId === 'blinkies' || themeId === 'system-settings' || themeId === 'mac-os' || themeId === 'instagram-reels' || themeId === 'artifact' || isPhoneHomeDefault) && (() => {
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

      {/* Blinkie Colors (poolsuite themes + phone-home default player) */}
      {(themeId === 'blinkies' || themeId === 'system-settings' || themeId === 'mac-os' || themeId === 'instagram-reels' || themeId === 'artifact' || isPhoneHomeDefault) && (() => {
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
          outputFormat={originalFileRef.current?.type === 'image/png' ? 'image/png' : 'image/jpeg'}
        />
      )}
    </div>
  )
}
