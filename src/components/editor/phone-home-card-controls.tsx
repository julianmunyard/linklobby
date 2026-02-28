"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/cards/image-upload"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Card, CardType, PhoneHomeLayout } from "@/types/card"

// Phone Home preset icon sections
export const PHONE_HOME_ICON_SECTIONS = [
  {
    label: 'Windows 98',
    icons: [
      { src: '/icons/8bit/my-computer.png', label: 'My Computer' },
      { src: '/icons/8bit/recycle-bin.png', label: 'Recycle Bin' },
      { src: '/icons/8bit/internet-explorer.png', label: 'Internet' },
      { src: '/icons/8bit/my-documents.png', label: 'My Documents' },
      { src: '/icons/8bit/folder.png', label: 'Folder' },
      { src: '/icons/8bit/notepad.png', label: 'Notepad' },
      { src: '/icons/8bit/paint.png', label: 'Paint' },
      { src: '/icons/8bit/calculator.png', label: 'Calculator' },
      { src: '/icons/8bit/media-player.png', label: 'Media Player' },
      { src: '/icons/8bit/winamp.png', label: 'Winamp' },
      { src: '/icons/8bit/sound.png', label: 'Sound' },
      { src: '/icons/8bit/mail.png', label: 'Mail' },
      { src: '/icons/8bit/outlook.png', label: 'Outlook' },
      { src: '/icons/8bit/minesweeper.png', label: 'Minesweeper' },
      { src: '/icons/8bit/solitaire.png', label: 'Solitaire' },
      { src: '/icons/8bit/pinball.png', label: 'Pinball' },
      { src: '/icons/8bit/settings.png', label: 'Settings' },
      { src: '/icons/8bit/help.png', label: 'Help' },
      { src: '/icons/8bit/find-file.png', label: 'Find File' },
      { src: '/icons/8bit/run.png', label: 'Run' },
      { src: '/icons/8bit/shutdown.png', label: 'Shut Down' },
      { src: '/icons/8bit/network.png', label: 'Network' },
      { src: '/icons/8bit/hard-drive.png', label: 'Hard Drive' },
      { src: '/icons/8bit/printer.png', label: 'Printer' },
      { src: '/icons/8bit/msdos.png', label: 'MS-DOS' },
    ],
  },
  {
    label: 'Classic Mac',
    icons: [
      { src: '/icons/mac/happy-mac.png', label: 'Happy Mac' },
      { src: '/icons/mac/sad-mac.png', label: 'Sad Mac' },
      { src: '/icons/mac/classic-mac.png', label: 'Classic Mac' },
      { src: '/icons/mac/about-mac.png', label: 'About Mac' },
      { src: '/icons/mac/trash.png', label: 'Trash' },
      { src: '/icons/mac/trash-full.png', label: 'Trash Full' },
      { src: '/icons/mac/trash-fire.png', label: 'Trash Fire' },
      { src: '/icons/mac/floppy.png', label: 'Floppy' },
      { src: '/icons/mac/bomb.png', label: 'Bomb' },
      { src: '/icons/mac/alert.png', label: 'Alert' },
      { src: '/icons/mac/warning.png', label: 'Warning' },
      { src: '/icons/mac/stop.png', label: 'Stop' },
      { src: '/icons/mac/info.png', label: 'Info' },
      { src: '/icons/mac/watch.png', label: 'Watch' },
      { src: '/icons/mac/command.png', label: 'Command' },
      { src: '/icons/mac/macpaint.png', label: 'MacPaint' },
      { src: '/icons/mac/macdraw.png', label: 'MacDraw' },
      { src: '/icons/mac/simpletext.png', label: 'SimpleText' },
      { src: '/icons/mac/sound.png', label: 'Sound' },
      { src: '/icons/mac/dogcow.png', label: 'Dogcow' },
      { src: '/icons/mac/resedit.png', label: 'ResEdit' },
      { src: '/icons/mac/finger.png', label: 'Finger' },
      { src: '/icons/mac/hand.png', label: 'Hand' },
      { src: '/icons/mac/pencil.png', label: 'Pencil' },
      { src: '/icons/mac/paint-bucket.png', label: 'Paint Bucket' },
      { src: '/icons/mac/lasso.png', label: 'Lasso' },
      { src: '/icons/mac/spray-can.png', label: 'Spray Can' },
      { src: '/icons/mac/lemmings.png', label: 'Lemmings' },
      { src: '/icons/mac/appleshare.png', label: 'AppleShare' },
      { src: '/icons/mac/font-suitcase.png', label: 'Font Suitcase' },
    ],
  },
]

// Default phone home layout dimensions per card type (matches autoLayoutCards logic)
// Detect Bandcamp embed height from URL params
export function detectBandcampHeight(url: string): number {
  if (!url) return 470
  if (url.includes('/size=small')) return 42
  if (url.includes('/artwork=small') && url.includes('/tracklist=false')) return 120
  if (url.includes('/minimal=true')) return 350
  return 470
}

// Calculate grid rows needed for a given pixel height (76px rows, 20px gap)
export function rowsForHeight(px: number): number {
  if (px <= 76) return 1
  return Math.ceil((px + 20) / 96)
}

export function getDefaultPhoneHomeSize(cardType: CardType, content?: Record<string, unknown>): { width: 1 | 2 | 4; height: number } {
  if (cardType === 'gallery') return { width: 4, height: 2 }
  if (cardType === 'music') {
    const platform = content?.platform as string | undefined
    const iframeUrl = (content?.embedIframeUrl || content?.embedUrl || '') as string
    if (platform === 'bandcamp') {
      const bcHeight = detectBandcampHeight(iframeUrl)
      return { width: 4, height: rowsForHeight(bcHeight) }
    }
    const embedH = content?.embedHeight as number | undefined
    return { width: 4, height: (embedH && embedH > 200) ? 2 : 1 }
  }
  if (cardType === 'audio') return { width: 4, height: 1 }
  return { width: 1, height: 1 }
}

export function PhoneHomeCardControls({
  card,
  currentContent,
  phoneHomeDock,
  addToDock,
  removeFromDock,
  onContentChange,
  onCardUpdate,
}: {
  card: Card
  currentContent: Record<string, unknown>
  phoneHomeDock: string[]
  addToDock: (id: string) => void
  removeFromDock: (id: string) => void
  onContentChange: (updates: Record<string, unknown>) => void
  onCardUpdate?: (updates: { title?: string | null; url?: string | null }) => void
}) {
  const phoneLayout = currentContent.phoneHomeLayout as PhoneHomeLayout | undefined
  const isInDock = phoneHomeDock.includes(card.id)
  const canAddToDock = phoneHomeDock.length < 4
  const isMusicCard = card.card_type === 'music'
  const isAudioCard = card.card_type === 'audio'
  const isGalleryCard = card.card_type === 'gallery'
  const showIcon = !isMusicCard && !isAudioCard && !isGalleryCard
  const defaultSize = getDefaultPhoneHomeSize(card.card_type, currentContent)
  const defaultLayout = { page: 0, row: 0, col: 0, ...defaultSize }

  return (
    <div className="space-y-4 border rounded-lg p-3 bg-muted/30">
      {/* Name and URL — first, hidden for music/audio/gallery */}
      {showIcon && onCardUpdate && (
        <div className="space-y-2">
          <Input
            placeholder="Name"
            value={card.title ?? ''}
            onChange={(e) => onCardUpdate({ title: e.target.value || null })}
            className="h-8 text-sm"
          />
          <Input
            placeholder="https://..."
            value={card.url ?? ''}
            onChange={(e) => onCardUpdate({ url: e.target.value || null })}
            className="h-8 text-sm"
          />
        </div>
      )}

      {/* App Icon — hidden for music/audio/gallery */}
      {showIcon && (
        <div className="space-y-2">
          <Label className="text-sm">App Icon</Label>
          <ImageUpload
            value={currentContent.appIconUrl as string | undefined}
            originalValue={currentContent.originalAppIconUrl as string | undefined}
            onChange={(url, originalUrl) => onContentChange({ appIconUrl: url, originalAppIconUrl: originalUrl })}
            cardId={card.id}
            cardType="square"
          />
          {/* Preset icon picker — sectioned by platform */}
          <div className="space-y-2.5">
            {PHONE_HOME_ICON_SECTIONS.map((section) => (
              <div key={section.label} className="space-y-1">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{section.label}</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {section.icons.map((icon) => (
                    <button
                      key={icon.src}
                      type="button"
                      className={`relative w-full aspect-square rounded-md border overflow-hidden transition-all hover:ring-1 hover:ring-muted-foreground/30 ${
                        currentContent.appIconUrl === icon.src
                          ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                          : 'border-muted'
                      }`}
                      onClick={() => onContentChange({ appIconUrl: icon.src })}
                      title={icon.label}
                    >
                      <img src={icon.src} alt={icon.label} className="w-full h-full object-contain p-1" style={{ imageRendering: 'pixelated' }} draggable={false} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pin to Dock — hidden for music/audio/gallery */}
      {showIcon && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Pin to Dock</Label>
            <p className="text-xs text-muted-foreground">{isInDock ? 'In dock' : canAddToDock ? 'Add to bottom bar' : 'Dock full (4/4)'}</p>
          </div>
          <Switch
            checked={isInDock}
            disabled={!isInDock && !canAddToDock}
            onCheckedChange={(checked) => {
              if (checked) addToDock(card.id)
              else removeFromDock(card.id)
            }}
          />
        </div>
      )}

      {/* Page Selector */}
      {!isInDock && (
        <div className="space-y-2">
          <Label className="text-sm">Page</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={String(phoneLayout?.page ?? 0)}
            onValueChange={(v) => {
              if (v) onContentChange({
                phoneHomeLayout: {
                  ...(phoneLayout ?? defaultLayout),
                  page: Number(v),
                },
              })
            }}
            className="justify-start"
          >
            {[0, 1, 2, 3].map((p) => (
              <ToggleGroupItem key={p} value={String(p)}>
                {p + 1}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      {/* Widget Size (for gallery) */}
      {!isInDock && card.card_type === 'gallery' && (
        <div className="space-y-2">
          <Label className="text-sm">Widget Size</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={`${phoneLayout?.width ?? defaultSize.width}x${phoneLayout?.height ?? defaultSize.height}`}
            onValueChange={(v) => {
              if (!v) return
              const [w, h] = v.split('x').map(Number)
              onContentChange({
                phoneHomeLayout: {
                  ...(phoneLayout ?? defaultLayout),
                  width: w,
                  height: h,
                },
              })
            }}
            className="justify-start"
          >
            {card.card_type !== 'gallery' && <ToggleGroupItem value="1x1">Icon</ToggleGroupItem>}
            <ToggleGroupItem value="2x2">Square</ToggleGroupItem>
            <ToggleGroupItem value="4x2">Wide</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Widget Size (for music — especially Bandcamp) */}
      {!isInDock && isMusicCard && (
        <div className="space-y-2">
          <Label className="text-sm">Widget Size</Label>
          <ToggleGroup
            type="single"
            variant="outline"
            value={`${phoneLayout?.width ?? defaultSize.width}x${phoneLayout?.height ?? defaultSize.height}`}
            onValueChange={(v) => {
              if (!v) return
              const [w, h] = v.split('x').map(Number)
              onContentChange({
                phoneHomeLayout: {
                  ...(phoneLayout ?? defaultLayout),
                  width: w,
                  height: h,
                },
              })
            }}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="4x2">Slim</ToggleGroupItem>
            <ToggleGroupItem value="4x4">Medium</ToggleGroupItem>
            <ToggleGroupItem value="4x6">Standard</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    </div>
  )
}
