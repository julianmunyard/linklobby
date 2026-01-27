'use client'

import { useState, useCallback } from 'react'
import { DndContext, closestCenter, DragEndEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Circle, Rows3, X, Loader2, ImageIcon, Crop } from 'lucide-react'
import { uploadCardImage } from '@/lib/supabase/storage'
import { compressImageForUpload } from '@/lib/image-compression'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import type { GalleryCardContent, GalleryImage } from '@/types/card'

interface GalleryCardFieldsProps {
  content: Partial<GalleryCardContent>
  onChange: (updates: Record<string, unknown>) => void
  cardId: string
}

function SortableImage({
  image,
  onRemove,
  onCrop
}: {
  image: GalleryImage
  onRemove: () => void
  onCrop: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group aspect-square">
      <div {...attributes} {...listeners} className="cursor-move w-full h-full">
        <Image src={image.url} alt={image.alt} fill className="object-cover rounded" />
      </div>
      {/* Crop button - bottom right */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onCrop()
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className="absolute bottom-1 right-1 bg-black/70 hover:bg-black/90 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Crop image"
      >
        <Crop className="h-3 w-3" />
      </button>
      {/* Remove button - top right */}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onRemove()
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove image"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export function GalleryCardFields({ content, onChange, cardId }: GalleryCardFieldsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<GalleryImage | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
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
      {/* Gallery Style Toggle */}
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

      {/* Circular Gallery Settings - only show when circular style selected (default) */}
      {content.galleryStyle !== 'carousel' && (
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
        </div>
      )}

      {/* Image Grid with dnd-kit */}
      {images.length > 0 && (
        <div className="space-y-2">
          <Label>Images ({images.length}/10)</Label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-2">
                {images.map(image => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onRemove={() => handleRemoveImage(image.id)}
                    onCrop={() => handleOpenCrop(image)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add Image button (hidden at 10 images) */}
      {images.length < 10 && (
        <div className="space-y-2">
          <Label htmlFor="addImage">Add Images {images.length > 0 && `(${images.length}/10)`}</Label>
          <Input
            id="addImage"
            type="file"
            accept="image/*"
            multiple
            disabled={isUploading}
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
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

      {images.length === 0 && (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No images added yet</p>
          <p className="text-xs mt-1">Add up to 10 images</p>
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
