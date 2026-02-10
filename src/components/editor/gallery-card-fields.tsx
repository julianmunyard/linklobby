'use client'

import { useState, useCallback, useRef } from 'react'
import { DndContext, closestCenter, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ColorPicker } from '@/components/ui/color-picker'
import { useThemeStore } from '@/stores/theme-store'
import { Circle, Rows3, X, Loader2, Plus, Crop, GripVertical } from 'lucide-react'
import { uploadCardImage } from '@/lib/supabase/storage'
import { compressImageForUpload } from '@/lib/image-compression'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import type { GalleryCardContent, GalleryImage } from '@/types/card'

interface GalleryCardFieldsProps {
  content: Partial<GalleryCardContent>
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
  isMacCard?: boolean
}

// Separate component to avoid hooks in conditional
function GalleryFontSize() {
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes.gallery)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <Label>Font Size (all gallery cards)</Label>
        <span className="text-muted-foreground">{Math.round(fontSize * 100)}%</span>
      </div>
      <Slider
        value={[fontSize]}
        onValueChange={(v) => setCardTypeFontSize('gallery', v[0])}
        min={0.5}
        max={2}
        step={0.1}
      />
    </div>
  )
}

function SortableImage({
  image,
  onRemove,
  onCrop,
  onUpdate
}: {
  image: GalleryImage
  onRemove: () => void
  onCrop: () => void
  onUpdate: (updates: Partial<GalleryImage>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg relative group">
      {/* Drag handle and thumbnail */}
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <div {...attributes} {...listeners} className="cursor-move text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Thumbnail with crop button */}
        <div className="w-12 h-12 relative flex-shrink-0 rounded overflow-hidden">
          <Image src={image.url} alt={image.alt} fill className="object-cover" />

          {/* Crop button overlay */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCrop()
            }}
            className="absolute inset-0 bg-black/70 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Crop image"
          >
            <Crop className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Caption and Link inputs */}
      <div className="flex-1 space-y-2">
        <Input
          placeholder="Caption (optional)"
          value={image.caption || ''}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          className="text-sm"
        />
        <Input
          placeholder="Link URL (optional)"
          value={image.link || ''}
          onChange={(e) => onUpdate({ link: e.target.value })}
          className="text-sm"
        />
      </div>

      {/* Remove button - top right */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function GalleryCardFields({ content, onChange, cardId, isMacCard }: GalleryCardFieldsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<GalleryImage | null>(null)
  // File input ref for hidden input
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const images = content.images || []

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex(img => img.id === active.id)
    const newIndex = images.findIndex(img => img.id === over.id)

    const reordered = arrayMove(images, oldIndex, newIndex)
    onChange({ images: reordered })
  }, [images, onChange])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Calculate how many we can add (max 10 total)
    const remainingSlots = 10 - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      setError('Gallery is full (max 10 images)')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const newImages: GalleryImage[] = []

      // Upload all files
      for (const file of filesToUpload) {
        // Compress before upload
        const compressed = await compressImageForUpload(file)

        // Upload to Supabase
        const result = await uploadCardImage(compressed as File, cardId)

        // Create new image entry
        newImages.push({
          id: crypto.randomUUID(),
          url: result.url,
          alt: file.name.replace(/\.[^/.]+$/, ''), // filename without extension
          storagePath: result.path,
        })
      }

      // Add all to images array
      onChange({ images: [...images, ...newImages] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ''
    }
  }, [images, onChange, cardId])

  const handleRemoveImage = useCallback((id: string) => {
    const newImages = images.filter(img => img.id !== id)
    onChange({ images: newImages })
  }, [images, onChange])

  const handleUpdateImage = useCallback((id: string, updates: Partial<GalleryImage>) => {
    const updatedImages = images.map(img =>
      img.id === id ? { ...img, ...updates } : img
    )
    onChange({ images: updatedImages })
  }, [images, onChange])

  // Open crop dialog for an image
  const handleOpenCrop = useCallback((image: GalleryImage) => {
    setImageToCrop(image)
    setCropDialogOpen(true)
  }, [])

  // Handle crop completion - re-upload and replace image
  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    if (!imageToCrop) return

    setIsUploading(true)
    setError(null)
    try {
      // Convert Blob to File for compression
      const croppedFile = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' })

      // Compress the cropped image
      const compressed = await compressImageForUpload(croppedFile)

      // Upload to Supabase
      const result = await uploadCardImage(compressed as File, cardId)

      // Update the image in the array with new URL
      const updatedImages = images.map(img =>
        img.id === imageToCrop.id
          ? { ...img, url: result.url, storagePath: result.path }
          : img
      )
      onChange({ images: updatedImages })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Crop upload failed')
    } finally {
      setIsUploading(false)
      setImageToCrop(null)
    }
  }, [imageToCrop, images, onChange, cardId])

  return (
    <div className="space-y-4">
      {/* Gallery Style Toggle - hidden on Macintosh theme (carousel only) */}
      {!isMacCard && (
        <div className="space-y-2">
          <Label>Gallery Style</Label>
          <ToggleGroup
            type="single"
            value={content.galleryStyle || 'circular'}
            onValueChange={(value) => {
              if (value) onChange({ galleryStyle: value })
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="circular" aria-label="Circular gallery">
              <Circle className="h-4 w-4 mr-2" /> Circular
            </ToggleGroupItem>
            <ToggleGroupItem value="carousel" aria-label="Carousel">
              <Rows3 className="h-4 w-4 mr-2" /> Carousel
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Circular Gallery Settings - only show when circular style selected (default) and not Mac */}
      {!isMacCard && content.galleryStyle !== 'carousel' && (
        <div className="space-y-4 p-3 bg-muted/50 rounded-lg">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Circular Settings</Label>

          {/* Bend Level */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Bend</Label>
              <span className="text-xs text-muted-foreground">{content.bend ?? 1.5}</span>
            </div>
            <Slider
              value={[content.bend ?? 1.5]}
              onValueChange={([value]) => onChange({ bend: value })}
              min={-3}
              max={3}
              step={0.5}
            />
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Border Radius</Label>
              <span className="text-xs text-muted-foreground">{(content.borderRadius ?? 0.05).toFixed(2)}</span>
            </div>
            <Slider
              value={[content.borderRadius ?? 0.05]}
              onValueChange={([value]) => onChange({ borderRadius: value })}
              min={0}
              max={0.5}
              step={0.05}
            />
          </div>

          {/* Scroll Speed */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Scroll Speed</Label>
              <span className="text-xs text-muted-foreground">{(content.scrollSpeed ?? 1.5).toFixed(1)}</span>
            </div>
            <Slider
              value={[content.scrollSpeed ?? 1.5]}
              onValueChange={([value]) => onChange({ scrollSpeed: value })}
              min={0.5}
              max={5}
              step={0.5}
            />
          </div>

          {/* Scroll Ease */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Scroll Ease</Label>
              <span className="text-xs text-muted-foreground">{(content.scrollEase ?? 0.03).toFixed(2)}</span>
            </div>
            <Slider
              value={[content.scrollEase ?? 0.03]}
              onValueChange={([value]) => onChange({ scrollEase: value })}
              min={0.01}
              max={0.2}
              step={0.01}
            />
          </div>

          {/* Spacing */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Spacing</Label>
              <span className="text-xs text-muted-foreground">{(content.spacing ?? 2.5).toFixed(1)}</span>
            </div>
            <Slider
              value={[content.spacing ?? 2.5]}
              onValueChange={([value]) => onChange({ spacing: value })}
              min={0.5}
              max={4}
              step={0.5}
            />
          </div>

          {/* Show Captions */}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Captions</Label>
            <Switch
              checked={content.showCaptions !== false}
              onCheckedChange={(checked) => onChange({ showCaptions: checked })}
            />
          </div>

          {/* Caption Color - only when captions are shown */}
          {content.showCaptions !== false && (
            <ColorPicker
              label="Caption Color"
              color={content.captionColor || "#ffffff"}
              onChange={(color) => onChange({ captionColor: color })}
            />
          )}

          {/* Font Size */}
          <GalleryFontSize />
        </div>
      )}

      {/* Image List with dnd-kit */}
      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Images ({images.length}/10)</Label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {images.map(image => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onRemove={() => handleRemoveImage(image.id)}
                    onCrop={() => handleOpenCrop(image)}
                    onUpdate={(updates) => handleUpdateImage(image.id, updates)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={isUploading}
        onChange={handleFileSelect}
        className="sr-only"
        aria-label="Upload images"
      />

      {/* Empty state - large centered plus button */}
      {images.length === 0 && (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mb-3"
          >
            <Plus className="h-5 w-5" />
            Add Images
          </Button>
          <p className="text-xs mt-1">Add up to 10 images</p>
          {isUploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Add more state - smaller plus button below image list (hidden at 10 images) */}
      {images.length > 0 && images.length < 10 && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            Add More ({images.length}/10)
          </Button>
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* Crop Dialog */}
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open)
            if (!open) setImageToCrop(null)
          }}
          imageSrc={imageToCrop.url}
          onCropComplete={handleCropComplete}
          initialAspect={7 / 9} // Default to portrait (matches CircularGallery display frame)
        />
      )}
    </div>
  )
}
