'use client'

import { useState, useCallback } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ColorPicker } from '@/components/ui/color-picker'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Loader2, Upload, Image, Video, Paintbrush, Frame, Sparkles, Moon, Smartphone, Pipette } from 'lucide-react'
import type { BackgroundConfig } from '@/types/theme'

// Available frame overlays
const FRAME_OPTIONS = [
  { id: '', label: 'None', path: '' },
  { id: 'awge-tv', label: 'AWGE TV', path: '/frames/awge-tv.png' },
] as const

// Macintosh desktop patterns
const MAC_PATTERN_OPTIONS = [
  { id: '', label: 'Default', path: '', preview: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px' },
  { id: 'pattern-1', label: 'Checker', path: '/images/mac-patterns/pattern-1.png' },
  { id: 'pattern-2', label: 'Cross', path: '/images/mac-patterns/pattern-2.png' },
  { id: 'pattern-3', label: 'Grid', path: '/images/mac-patterns/pattern-3.png' },
  { id: 'pattern-4', label: 'Scale', path: '/images/mac-patterns/pattern-4.png' },
  { id: 'pattern-5', label: 'Micro', path: '/images/mac-patterns/pattern-5.png' },
] as const

export function BackgroundControls() {
  const { background, setBackground } = useThemeStore()
  const themeId = useThemeStore((s) => s.themeId)
  const macPattern = useThemeStore((s) => s.macPattern)
  const macPatternColor = useThemeStore((s) => s.macPatternColor)
  const setMacPattern = useThemeStore((s) => s.setMacPattern)
  const setMacPatternColor = useThemeStore((s) => s.setMacPatternColor)
  const [isUploading, setIsUploading] = useState(false)
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [videoUrl, setVideoUrl] = useState(background.type === 'video' ? background.value : '')

  const handleTypeChange = (type: BackgroundConfig['type']) => {
    if (!type) return

    if (type === 'solid') {
      setBackground({ ...background, type: 'solid', value: background.type === 'solid' ? background.value : '#0a0a0a' })
    } else if (type === 'image') {
      setBackground({ ...background, type: 'image', value: background.type === 'image' ? background.value : '' })
    } else if (type === 'video') {
      setBackground({ ...background, type: 'video', value: videoUrl || '' })
    }
  }

  const handleColorChange = (color: string) => {
    setBackground({ ...background, type: 'solid', value: color })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { uploadBackgroundImage } = await import('@/lib/storage')
      const url = await uploadBackgroundImage(file)
      setBackground({ ...background, type: 'image', value: url })
    } catch (error) {
      console.error('Background upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsVideoUploading(true)
    try {
      const { uploadBackgroundVideo } = await import('@/lib/storage')
      const url = await uploadBackgroundVideo(file)
      setVideoUrl(url)
      setBackground({ ...background, type: 'video', value: url })
    } catch (error) {
      console.error('Video upload failed:', error)
    } finally {
      setIsVideoUploading(false)
    }
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url)
    if (background.type === 'video') {
      setBackground({ ...background, type: 'video', value: url })
    }
  }

  const handleVideoUrlBlur = () => {
    if (background.type === 'video' && videoUrl) {
      setBackground({ ...background, type: 'video', value: videoUrl })
    }
  }

  // Frame overlay handlers
  const handleFrameChange = (framePath: string) => {
    setBackground({
      ...background,
      frameOverlay: framePath || undefined,
      // When enabling frame, default frameFitContent to true; when disabling, reset all frame settings
      ...(framePath
        ? { frameFitContent: true }
        : { frameZoom: undefined, framePositionX: undefined, framePositionY: undefined, frameFitContent: undefined })
    })
  }

  const handleFrameZoomChange = (value: number[]) => {
    setBackground({ ...background, frameZoom: value[0] })
  }

  const handleFramePositionXChange = (value: number[]) => {
    setBackground({ ...background, framePositionX: value[0] })
  }

  const handleFramePositionYChange = (value: number[]) => {
    setBackground({ ...background, framePositionY: value[0] })
  }

  const handleFrameFitContentChange = (checked: boolean) => {
    setBackground({ ...background, frameFitContent: checked })
  }

  // Noise overlay handlers
  const handleNoiseToggle = (checked: boolean) => {
    setBackground({ ...background, noiseOverlay: checked })
  }

  const handleNoiseIntensityChange = (value: number[]) => {
    setBackground({ ...background, noiseIntensity: value[0] })
  }

  // Dim overlay handlers
  const handleDimToggle = (checked: boolean) => {
    setBackground({ ...background, dimOverlay: checked })
  }

  const handleDimIntensityChange = (value: number[]) => {
    setBackground({ ...background, dimIntensity: value[0] })
  }

  // Eyedropper tool for picking status bar color from screen
  const handleEyedropper = useCallback(async () => {
    // Native EyeDropper API (Chrome/Edge)
    if ('EyeDropper' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dropper = new (window as any).EyeDropper()
        const result = await dropper.open()
        setBackground({ ...background, topBarColor: result.sRGBHex })
      } catch {
        // User cancelled
      }
      return
    }
    // Fallback: use hidden color input for browsers without EyeDropper
    const input = document.createElement('input')
    input.type = 'color'
    input.value = background.topBarColor || '#000000'
    input.addEventListener('input', (e) => {
      setBackground({ ...background, topBarColor: (e.target as HTMLInputElement).value })
    })
    input.click()
  }, [background, setBackground])

  // Status bar color picker (shared by all themes)
  const statusBarSection = (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-muted-foreground" />
        <Label className="text-xs font-medium text-muted-foreground">Status Bar Color</Label>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">Controls the color around the camera and safe areas on mobile</p>
      <div className="flex items-center gap-2">
        <ColorPicker
          label="Color"
          color={background.topBarColor || '#000000'}
          onChange={(color) => setBackground({ ...background, topBarColor: color })}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={handleEyedropper}
          title="Pick color from screen"
        >
          <Pipette className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Macintosh theme has its own background system
  if (themeId === 'macintosh') {
    return (
      <div className="space-y-6">
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-3 block">Desktop Pattern</Label>
          <div className="grid grid-cols-6 gap-2">
            {MAC_PATTERN_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMacPattern(opt.path)}
                className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                  macPattern === opt.path
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-muted-foreground'
                }`}
                title={opt.label}
              >
                {opt.path ? (
                  <img
                    src={opt.path}
                    alt={opt.label}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ background: opt.preview }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <ColorPicker
          label="Background Color"
          color={macPatternColor}
          onChange={setMacPatternColor}
        />

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Frame Overlay Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Frame className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">Frame Overlay</Label>
          </div>

          <div className="flex gap-2 flex-wrap">
            {FRAME_OPTIONS.map((frame) => (
              <Button
                key={frame.id}
                variant={background.frameOverlay === frame.path || (!background.frameOverlay && !frame.path) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFrameChange(frame.path)}
              >
                {frame.label}
              </Button>
            ))}
          </div>

          {background.frameOverlay && (
            <div className="space-y-4 pl-4 border-l-2 border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Fit Content Inside Frame</Label>
                <Switch
                  checked={background.frameFitContent ?? true}
                  onCheckedChange={handleFrameFitContentChange}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Frame Zoom</Label>
                  <span className="text-xs text-muted-foreground">{(background.frameZoom ?? 1).toFixed(2)}x</span>
                </div>
                <Slider
                  value={[background.frameZoom ?? 1]}
                  onValueChange={handleFrameZoomChange}
                  min={0.5}
                  max={2}
                  step={0.05}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Position X</Label>
                  <span className="text-xs text-muted-foreground">{background.framePositionX ?? 0}%</span>
                </div>
                <Slider
                  value={[background.framePositionX ?? 0]}
                  onValueChange={handleFramePositionXChange}
                  min={-50}
                  max={50}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Position Y</Label>
                  <span className="text-xs text-muted-foreground">{background.framePositionY ?? 0}%</span>
                </div>
                <Slider
                  value={[background.framePositionY ?? 0]}
                  onValueChange={handleFramePositionYChange}
                  min={-50}
                  max={50}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Noise Overlay Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <Label className="text-xs font-medium text-muted-foreground">Noise Overlay</Label>
            </div>
            <Switch
              checked={background.noiseOverlay ?? false}
              onCheckedChange={handleNoiseToggle}
            />
          </div>

          {background.noiseOverlay && (
            <div className="space-y-2 pl-4 border-l-2 border-border">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Intensity</Label>
                <span className="text-xs text-muted-foreground">{background.noiseIntensity ?? 15}%</span>
              </div>
              <Slider
                value={[background.noiseIntensity ?? 15]}
                onValueChange={handleNoiseIntensityChange}
                min={5}
                max={50}
                step={1}
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Status Bar Color */}
        {statusBarSection}
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                style={{
                  transform: `scale(${background.imageZoom ?? 1})`,
                  objectPosition: `${background.imagePositionX ?? 50}% ${background.imagePositionY ?? 50}%`,
                }}
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

          {/* Image Crop Controls */}
          {background.value && (
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Zoom</Label>
                  <span className="text-xs text-muted-foreground">{(background.imageZoom ?? 1).toFixed(1)}x</span>
                </div>
                <Slider
                  value={[background.imageZoom ?? 1]}
                  onValueChange={([v]) => setBackground({ ...background, imageZoom: v })}
                  min={1}
                  max={3}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Position X</Label>
                  <span className="text-xs text-muted-foreground">{background.imagePositionX ?? 50}%</span>
                </div>
                <Slider
                  value={[background.imagePositionX ?? 50]}
                  onValueChange={([v]) => setBackground({ ...background, imagePositionX: v })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Position Y</Label>
                  <span className="text-xs text-muted-foreground">{background.imagePositionY ?? 50}%</span>
                </div>
                <Slider
                  value={[background.imagePositionY ?? 50]}
                  onValueChange={([v]) => setBackground({ ...background, imagePositionY: v })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Upload & URL */}
      {background.type === 'video' && (
        <div className="space-y-4">
          {/* Video Upload */}
          <div className="space-y-2">
            <Label className="text-xs">Upload Video</Label>
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center justify-center gap-2"
              onClick={() => document.getElementById('bg-video-input')?.click()}
              disabled={isVideoUploading}
            >
              {isVideoUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Upload MP4, WebM, or MOV</span>
                </>
              )}
            </Button>
            <input
              id="bg-video-input"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Video URL Input */}
          <div className="space-y-2">
            <Label className="text-xs">Video URL</Label>
            <Input
              placeholder="https://example.com/video.mp4"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              onBlur={handleVideoUrlBlur}
            />
          </div>

          {/* Video Preview */}
          {(videoUrl || background.value) && (
            <div className="aspect-video rounded overflow-hidden bg-muted">
              <video
                src={videoUrl || background.value}
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

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Frame Overlay Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Frame className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs font-medium text-muted-foreground">Frame Overlay</Label>
        </div>

        {/* Frame Selection */}
        <div className="flex gap-2 flex-wrap">
          {FRAME_OPTIONS.map((frame) => (
            <Button
              key={frame.id}
              variant={background.frameOverlay === frame.path || (!background.frameOverlay && !frame.path) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFrameChange(frame.path)}
            >
              {frame.label}
            </Button>
          ))}
        </div>

        {/* Frame Settings (only show when frame is selected) */}
        {background.frameOverlay && (
          <div className="space-y-4 pl-4 border-l-2 border-border">
            {/* Fit Content Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-xs">Fit Content Inside Frame</Label>
              <Switch
                checked={background.frameFitContent ?? true}
                onCheckedChange={handleFrameFitContentChange}
              />
            </div>

            {/* Frame Zoom */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Frame Zoom</Label>
                <span className="text-xs text-muted-foreground">{(background.frameZoom ?? 1).toFixed(2)}x</span>
              </div>
              <Slider
                value={[background.frameZoom ?? 1]}
                onValueChange={handleFrameZoomChange}
                min={0.5}
                max={2}
                step={0.05}
              />
            </div>

            {/* Frame Position X */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Position X</Label>
                <span className="text-xs text-muted-foreground">{background.framePositionX ?? 0}%</span>
              </div>
              <Slider
                value={[background.framePositionX ?? 0]}
                onValueChange={handleFramePositionXChange}
                min={-50}
                max={50}
                step={1}
              />
            </div>

            {/* Frame Position Y */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Position Y</Label>
                <span className="text-xs text-muted-foreground">{background.framePositionY ?? 0}%</span>
              </div>
              <Slider
                value={[background.framePositionY ?? 0]}
                onValueChange={handleFramePositionYChange}
                min={-50}
                max={50}
                step={1}
              />
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Noise Overlay Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">Noise Overlay</Label>
          </div>
          <Switch
            checked={background.noiseOverlay ?? false}
            onCheckedChange={handleNoiseToggle}
          />
        </div>

        {/* Noise Intensity (only show when enabled) */}
        {background.noiseOverlay && (
          <div className="space-y-2 pl-4 border-l-2 border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Intensity</Label>
              <span className="text-xs text-muted-foreground">{background.noiseIntensity ?? 15}%</span>
            </div>
            <Slider
              value={[background.noiseIntensity ?? 15]}
              onValueChange={handleNoiseIntensityChange}
              min={5}
              max={50}
              step={1}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Dim Overlay Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <Label className="text-xs font-medium text-muted-foreground">Dim Background</Label>
          </div>
          <Switch
            checked={background.dimOverlay ?? false}
            onCheckedChange={handleDimToggle}
          />
        </div>

        {/* Dim Intensity (only show when enabled) */}
        {background.dimOverlay && (
          <div className="space-y-2 pl-4 border-l-2 border-border">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Intensity</Label>
              <span className="text-xs text-muted-foreground">{background.dimIntensity ?? 40}%</span>
            </div>
            <Slider
              value={[background.dimIntensity ?? 40]}
              onValueChange={handleDimIntensityChange}
              min={10}
              max={80}
              step={5}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Status Bar Color */}
      {statusBarSection}
    </div>
  )
}
