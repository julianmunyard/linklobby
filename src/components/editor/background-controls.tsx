'use client'

import { useState } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ColorPicker } from '@/components/ui/color-picker'
import { Loader2, Upload, Image, Video, Paintbrush } from 'lucide-react'
import type { BackgroundConfig } from '@/types/theme'

export function BackgroundControls() {
  const { background, setBackground } = useThemeStore()
  const [isUploading, setIsUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState(background.type === 'video' ? background.value : '')

  const handleTypeChange = (type: BackgroundConfig['type']) => {
    if (!type) return

    if (type === 'solid') {
      setBackground({ type: 'solid', value: background.type === 'solid' ? background.value : '#0a0a0a' })
    } else if (type === 'image') {
      setBackground({ type: 'image', value: background.type === 'image' ? background.value : '' })
    } else if (type === 'video') {
      setBackground({ type: 'video', value: videoUrl || '' })
    }
  }

  const handleColorChange = (color: string) => {
    setBackground({ type: 'solid', value: color })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Upload to Supabase storage
      const { uploadBackgroundImage } = await import('@/lib/storage')
      const url = await uploadBackgroundImage(file)
      setBackground({ type: 'image', value: url })
    } catch (error) {
      console.error('Background upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    if (background.type === 'video') {
      setBackground({ type: 'video', value: url })
    }
  }

  const handleVideoUrlBlur = () => {
    if (background.type === 'video' && videoUrl) {
      setBackground({ type: 'video', value: videoUrl })
    }
  }

  return (
    <div className="space-y-4">
      {/* Background Type Selector */}
      <div>
        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Background Type</Label>
        <ToggleGroup
          type="single"
          value={background.type}
          onValueChange={(value) => handleTypeChange(value as BackgroundConfig['type'])}
          className="justify-start"
        >
          <ToggleGroupItem value="solid" className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            <span className="text-xs">Solid</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="image" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span className="text-xs">Image</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            <span className="text-xs">Video</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Solid Color Picker */}
      {background.type === 'solid' && (
        <ColorPicker
          label="Color"
          color={background.value}
          onChange={handleColorChange}
        />
      )}

      {/* Image Upload */}
      {background.type === 'image' && (
        <div className="space-y-2">
          <Label className="text-xs">Background Image</Label>
          {background.value ? (
            <div className="relative aspect-video rounded overflow-hidden">
              <img
                src={background.value}
                alt="Background preview"
                className="w-full h-full object-cover"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={() => document.getElementById('bg-image-input')?.click()}
              >
                Change
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => document.getElementById('bg-image-input')?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Upload Image</span>
                </>
              )}
            </Button>
          )}
          <input
            id="bg-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      {/* Video URL */}
      {background.type === 'video' && (
        <div className="space-y-2">
          <Label className="text-xs">Video URL</Label>
          <Input
            placeholder="https://example.com/video.mp4"
            value={videoUrl}
            onChange={(e) => handleVideoUrlChange(e.target.value)}
            onBlur={handleVideoUrlBlur}
          />
          <p className="text-xs text-muted-foreground">
            Enter a direct video URL (MP4). Video will autoplay muted on loop.
          </p>
          {videoUrl && (
            <div className="aspect-video rounded overflow-hidden bg-muted">
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
