'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import { Upload, Loader2 } from 'lucide-react'
import { uploadCardVideo } from '@/lib/supabase/storage'

interface MacWindowFieldsProps {
  macMode: string
  macBodyText: string
  macWindowStyle?: string
  macCheckerColor?: string
  macWindowBgColor?: string
  macTextAlign?: string
  macTextColor?: string
  macVideoUrl?: string
  cardId: string
  onChange: (updates: Record<string, unknown>) => void
}

export function MacWindowFields({ macMode, macBodyText, macWindowStyle, macCheckerColor, macWindowBgColor, macTextAlign, macTextColor, macVideoUrl, cardId, onChange }: MacWindowFieldsProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be less than 100MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadCardVideo(file, cardId)
      onChange({ macVideoUrl: result.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Window Mode</Label>
        <ToggleGroup
          type="single"
          value={macMode || 'link'}
          onValueChange={(value) => {
            if (value) onChange({ macMode: value })
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="link" className="h-9 px-4">
            Link
          </ToggleGroupItem>
          <ToggleGroupItem value="video" className="h-9 px-4">
            Video
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {macWindowStyle !== 'small-window' && (
        <div className="space-y-2">
          <Label>Window Body Text</Label>
          <Input
            placeholder="Text shown inside the window"
            value={macBodyText}
            onChange={(e) => onChange({ macBodyText: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Separate from the title bar. Leave empty to use the card title.
          </p>
        </div>
      )}

      {macWindowStyle === 'small-window' && macMode === 'video' && (
        <div className="space-y-2">
          {macVideoUrl ? (
            <>
              <Label>Video Preview</Label>
              <div className="relative aspect-[4/3] rounded overflow-hidden bg-black">
                <video
                  src={macVideoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`macVideo-${cardId}`)?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" />Replace Video</>
                )}
              </Button>
              <Input
                id={`macVideo-${cardId}`}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov"
                onChange={handleVideoUpload}
                disabled={isUploading}
                className="hidden"
              />
            </>
          ) : (
            <>
              <Label>Upload Video</Label>
              <Input
                id={`macVideo-${cardId}`}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,.mov"
                onChange={handleVideoUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">MP4, WebM, or OGG. Max 100MB.</p>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />Uploading...
                </div>
              )}
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      {macWindowStyle === 'small-window' && (
        <>
          <div className="space-y-2">
            <Label>Checker Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={macCheckerColor || '#cfffcc'}
                onChange={(e) => onChange({ macCheckerColor: e.target.value })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#000000"
                value={macCheckerColor || ''}
                onChange={(e) => onChange({ macCheckerColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Window Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={macWindowBgColor || '#afb3ee'}
                onChange={(e) => onChange({ macWindowBgColor: e.target.value })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#ffffff"
                value={macWindowBgColor || ''}
                onChange={(e) => onChange({ macWindowBgColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={macTextColor || '#000000'}
                onChange={(e) => onChange({ macTextColor: e.target.value })}
                className="h-9 w-9 rounded border cursor-pointer"
              />
              <Input
                placeholder="#000000"
                value={macTextColor || ''}
                onChange={(e) => onChange({ macTextColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Text Align</Label>
            <ToggleGroup
              type="single"
              value={macTextAlign || 'left'}
              onValueChange={(value) => {
                if (value) onChange({ macTextAlign: value })
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="left" className="h-9 px-4">
                Left
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="h-9 px-4">
                Center
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </>
      )}
    </div>
  )
}
