'use client'

import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getCroppedImg } from './crop-utils'

/**
 * Aspect ratio presets
 * - ORIGINAL: match the source image's natural aspect ratio
 * - PORTRAIT: 7:9 for gallery images (matches CircularGallery display)
 * - RECTANGLE: 16:9 for landscape images
 * - SQUARE: 1:1 for profile photos
 */
const ASPECT_PRESETS = [
  { label: 'ORIGINAL', aspect: 'original' as const },
  { label: 'PORTRAIT', aspect: 7 / 9 },
  { label: 'RECTANGLE', aspect: 16 / 9 },
  { label: 'SQUARE', aspect: 1 },
] as const

type AspectValue = number | 'original'

interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  initialAspect?: number // undefined = use original image aspect
  outputFormat?: 'image/jpeg' | 'image/png' // default: image/jpeg
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  initialAspect,
  outputFormat = 'image/jpeg',
}: ImageCropDialogProps) {
  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [naturalAspect, setNaturalAspect] = useState<number>(1)
  const [aspectSelection, setAspectSelection] = useState<AspectValue>(
    initialAspect ?? 'original'
  )
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load image to get natural dimensions
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight
      setNaturalAspect(aspect)
    }
    img.src = imageSrc
  }, [imageSrc])

  // Compute actual aspect ratio for cropper
  const aspect = aspectSelection === 'original' ? naturalAspect : aspectSelection

  // Store the cropped area pixels when crop completes
  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  // Reset crop position and zoom when aspect ratio changes
  const handleAspectChange = (newAspect: AspectValue) => {
    setAspectSelection(newAspect)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  // Reset all crop settings to initial state
  const handleReset = () => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setAspectSelection(initialAspect ?? 'original')
  }

  // Process the crop and return the blob
  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsSaving(true)
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 0, outputFormat)
      onCropComplete(croppedBlob)
      onOpenChange(false)
    } catch (error) {
      console.error('Error cropping image:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Find current preset for highlighting
  const currentPresetLabel =
    ASPECT_PRESETS.find((p) => p.aspect === aspectSelection)?.label ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        {/* Aspect ratio preset buttons */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {ASPECT_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={currentPresetLabel === preset.label ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleAspectChange(preset.aspect)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleReset}>
            RESET
          </Button>
        </div>

        {/* Cropper container */}
        <div className="relative h-[300px] bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            objectFit="contain"
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-12">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-muted-foreground w-10 text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !croppedAreaPixels}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
