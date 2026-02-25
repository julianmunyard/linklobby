// src/components/editor/card-property-editor.tsx
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { validateAndFixUrl } from "@/lib/url-validation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/cards/image-upload"
import { HeroCardFields } from "./hero-card-fields"
import { HorizontalLinkFields } from "./horizontal-link-fields"
import { SquareCardFields } from "./square-card-fields"
import { VideoCardFields } from "./video-card-fields"
import { GalleryCardFields } from "./gallery-card-fields"
import { GameCardFields } from "./game-card-fields"
import { AudioCardFields } from "./audio-card-fields"
import { MusicCardFields } from "./music-card-fields"
import { EmailCollectionFields } from "./email-collection-fields"
import { ReleaseCardFields } from "./release-card-fields"
import { SocialIconsCardFields } from "./social-icons-card-fields"
import { LinkCardFields } from "./link-card-fields"
import { MacNotepadFields } from "./mac-notepad-fields"
import { MacWindowFields } from "./mac-window-fields"
import { CardTypePicker, isConvertibleType } from "./card-type-picker"
import { WordArtStylePicker } from "./word-art-style-picker"
import { ProGate } from "@/components/billing/pro-gate"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { useProfileStore } from "@/stores/profile-store"
import { SOCIAL_PLATFORMS } from "@/types/profile"
import { useHistory } from "@/hooks/use-history"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from "lucide-react"
import type { Card, CardType, CardSize, HorizontalPosition, HeroCardContent, HorizontalLinkContent, SquareCardContent, VideoCardContent, GalleryCardContent, GameCardContent, AudioCardContent, MusicCardContent, LinkCardContent, EmailCollectionCardContent, ReleaseCardContent, TextAlign, VerticalAlign, PhoneHomeLayout } from "@/types/card"
import { CARD_TYPE_SIZING, CARD_TYPES_NO_IMAGE } from "@/types/card"

// Card types that support horizontal positioning (w-fit cards)
const POSITIONABLE_CARD_TYPES: CardType[] = ['mini']

// Common form schema
const cardFormSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  url: z.string().url().optional().or(z.literal("")),
})

type CardFormValues = z.infer<typeof cardFormSchema>

// Phone Home preset icon sections
const PHONE_HOME_ICON_SECTIONS = [
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

// Phone Home per-social-icon customization (icon upload + color per platform)
function SocialIconCustomization({
  card,
  currentContent,
  onContentChange,
}: {
  card: Card
  currentContent: Record<string, unknown>
  onContentChange: (updates: Record<string, unknown>) => void
}) {
  const getSortedSocialIcons = useProfileStore((s) => s.getSortedSocialIcons)
  const socialIcons = getSortedSocialIcons()
  const socialAppIcons = (currentContent.socialAppIcons ?? {}) as Record<string, { appIconUrl?: string; appIconColor?: string }>

  function updatePlatformIcon(platform: string, updates: { appIconUrl?: string; appIconColor?: string }) {
    const current = socialAppIcons[platform] ?? {}
    const updated = { ...current, ...updates }
    // Remove undefined values
    if (!updated.appIconUrl) delete updated.appIconUrl
    if (!updated.appIconColor) delete updated.appIconColor
    const newSocialAppIcons = { ...socialAppIcons }
    if (Object.keys(updated).length === 0) {
      delete newSocialAppIcons[platform]
    } else {
      newSocialAppIcons[platform] = updated
    }
    onContentChange({ socialAppIcons: newSocialAppIcons })
  }

  if (socialIcons.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Add social icons in Settings to customize their app icons.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Icons per Social</Label>
      {socialIcons.map((si) => {
        const platformMeta = SOCIAL_PLATFORMS[si.platform]
        if (!platformMeta) return null
        const override = socialAppIcons[si.platform]
        return (
          <div key={si.id} className="space-y-2 border rounded-lg p-2.5 bg-muted/20">
            <Label className="text-xs font-medium">{platformMeta.label}</Label>
            <ImageUpload
              value={override?.appIconUrl}
              onChange={(url) => updatePlatformIcon(si.platform, { appIconUrl: url })}
              cardId={`${card.id}-${si.platform}`}
              cardType="square"
            />
            {/* Preset icons */}
            {PHONE_HOME_ICON_SECTIONS.map((section) => (
              <div key={section.label} className="space-y-1">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{section.label}</span>
                <div className="grid grid-cols-5 gap-1">
                  {section.icons.map((icon) => (
                    <button
                      key={icon.src}
                      type="button"
                      className={`relative w-full aspect-square rounded-md border overflow-hidden transition-all hover:ring-1 hover:ring-muted-foreground/30 ${
                        override?.appIconUrl === icon.src
                          ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                          : 'border-muted'
                      }`}
                      onClick={() => updatePlatformIcon(si.platform, { appIconUrl: icon.src })}
                      title={icon.label}
                    >
                      {override?.appIconColor ? (
                        <div
                          className="w-full h-full p-1"
                          style={{
                            backgroundColor: override.appIconColor,
                            WebkitMaskImage: `url('${icon.src}')`,
                            maskImage: `url('${icon.src}')`,
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                            imageRendering: 'pixelated',
                          }}
                        />
                      ) : (
                        <img src={icon.src} alt={icon.label} className="w-full h-full object-contain p-1" style={{ imageRendering: 'pixelated' }} draggable={false} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <ColorPicker
              label="Icon Color"
              color={override?.appIconColor || ''}
              onChange={(color) => updatePlatformIcon(si.platform, { appIconColor: color || undefined })}
            />
            {override?.appIconColor && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs w-full"
                onClick={() => updatePlatformIcon(si.platform, { appIconColor: undefined })}
              >
                Reset Color
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Phone Home card controls — extracted so hooks work properly (no IIFE)
// Default phone home layout dimensions per card type (matches autoLayoutCards logic)
function getDefaultPhoneHomeSize(cardType: CardType, content?: Record<string, unknown>): { width: 1 | 2 | 4; height: 1 | 2 | 3 } {
  if (cardType === 'gallery') return { width: 4, height: 2 }
  if (cardType === 'music') {
    const embedH = content?.embedHeight as number | undefined
    return { width: 4, height: (embedH && embedH > 200) ? 2 : 1 }
  }
  if (cardType === 'audio') return { width: 4, height: 1 }
  return { width: 1, height: 1 }
}

function PhoneHomeCardControls({
  card,
  currentContent,
  phoneHomeDock,
  addToDock,
  removeFromDock,
  onContentChange,
}: {
  card: Card
  currentContent: Record<string, unknown>
  phoneHomeDock: string[]
  addToDock: (id: string) => void
  removeFromDock: (id: string) => void
  onContentChange: (updates: Record<string, unknown>) => void
}) {
  const phoneLayout = currentContent.phoneHomeLayout as PhoneHomeLayout | undefined
  const isInDock = phoneHomeDock.includes(card.id)
  const canAddToDock = phoneHomeDock.length < 4
  const isMusicCard = card.card_type === 'music'
  const defaultSize = getDefaultPhoneHomeSize(card.card_type, currentContent)
  const defaultLayout = { page: 0, row: 0, col: 0, ...defaultSize }

  return (
    <div className="space-y-4 border rounded-lg p-3 bg-muted/30">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone Home</Label>

      {/* App Icon Upload — uses square card type to get 1:1 crop, hidden for music cards */}
      {!isMusicCard && <div className="space-y-2">
        <Label className="text-sm">App Icon</Label>
        <ImageUpload
          value={currentContent.appIconUrl as string | undefined}
          onChange={(url) => onContentChange({ appIconUrl: url })}
          cardId={card.id}
          cardType="square"
        />
        {/* Preset icon picker — sectioned by platform */}
        <div className="space-y-2.5">
          <Label className="text-xs text-muted-foreground">Preset Icons</Label>
          {PHONE_HOME_ICON_SECTIONS.map((section) => {
            const iconColor = currentContent.appIconColor as string | undefined
            return (
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
                      {iconColor ? (
                        <div
                          className="w-full h-full p-1"
                          style={{
                            backgroundColor: iconColor,
                            WebkitMaskImage: `url('${icon.src}')`,
                            maskImage: `url('${icon.src}')`,
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                            imageRendering: 'pixelated',
                          }}
                        />
                      ) : (
                        <img src={icon.src} alt={icon.label} className="w-full h-full object-contain p-1" style={{ imageRendering: 'pixelated' }} draggable={false} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        {/* Icon Color */}
        <ColorPicker
          label="Icon Color"
          color={(currentContent.appIconColor as string) || ''}
          onChange={(color) => onContentChange({ appIconColor: color || undefined })}
        />
        {!!currentContent.appIconColor && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs w-full"
            onClick={() => onContentChange({ appIconColor: undefined })}
          >
            Reset to Default
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Upload your own or pick a preset icon</p>
      </div>}

      {/* Pin to Dock — hidden for music cards */}
      {!isMusicCard && (
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

      {/* Widget Size (for gallery, or audio when widget mode is on — music auto-sets via platform detection) */}
      {!isInDock && (card.card_type === 'gallery' || (card.card_type === 'audio' && !!currentContent.phoneHomeWidgetMode)) && (
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
    </div>
  )
}

interface CardPropertyEditorProps {
  card: Card
  onClose: () => void
}

export function CardPropertyEditor({ card, onClose }: CardPropertyEditorProps) {
  const updateCard = usePageStore((state) => state.updateCard)
  const duplicateCard = usePageStore((state) => state.duplicateCard)
  const removeCard = usePageStore((state) => state.removeCard)
  const setAllCardsTransparency = usePageStore((state) => state.setAllCardsTransparency)
  const themeId = useThemeStore((s) => s.themeId)
  const phoneHomeDock = useThemeStore((s) => s.phoneHomeDock)
  const addToDock = useThemeStore((s) => s.addToDock)
  const removeFromDock = useThemeStore((s) => s.removeFromDock)
  const { undo } = useHistory()
  const [urlError, setUrlError] = useState<string | null>(null)

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      title: card.title ?? "",
      description: card.description ?? "",
      url: card.url ?? "",
    },
  })

  // Reset form when card changes
  useEffect(() => {
    form.reset({
      title: card.title ?? "",
      description: card.description ?? "",
      url: card.url ?? "",
    })
  }, [card.id, card.title, card.description, card.url, form])

  // Watch form changes and update store (optimistic updates)
  useEffect(() => {
    const subscription = form.watch((values) => {
      // Only update if values are valid-ish
      const title = values.title || null
      const description = values.description || null
      // Don't push iframe embed code as the card URL — onBlur will handle extraction
      const rawUrl = values.url || null
      const url = rawUrl && rawUrl.includes('<iframe') ? null : rawUrl

      updateCard(card.id, {
        title,
        description,
        url,
      })
    })
    return () => subscription.unsubscribe()
  }, [form, card.id, updateCard])

  // Handle image changes
  function handleImageChange(imageUrl: string | undefined) {
    const content = { ...(card.content as Record<string, unknown>), imageUrl }
    updateCard(card.id, { content })
  }

  // Handle content field changes (for type-specific fields)
  function handleContentChange(updates: Record<string, unknown>) {
    const content = { ...(card.content as Record<string, unknown>), ...updates }
    updateCard(card.id, { content })
  }

  // Handle URL blur - validate and auto-fix, or detect embed iframe code
  function handleUrlBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.target.value.trim()

    // Detect pasted iframe embed code in the URL field
    if (value.includes('<iframe') && card.card_type === 'link') {
      const srcMatch = value.match(/src=["']([^"']+)["']/)
      if (srcMatch) {
        const heightMatch = value.match(/height[:=]["']?\s*(\d+)/)
        const embedHeight = heightMatch ? parseInt(heightMatch[1], 10) : 352
        handleContentChange({ embedIframeUrl: srcMatch[1], embedHeight })
        // Clear the URL field since we extracted the embed
        form.setValue('url', '')
        setUrlError(null)
        return
      }
    }

    const result = validateAndFixUrl(value)
    if (!result.valid && result.error) {
      setUrlError(result.error)
    } else {
      setUrlError(null)
      // If URL was fixed (https added), update form
      if (result.url && result.url !== e.target.value) {
        form.setValue('url', result.url)
      }
    }
  }

  const currentContent = card.content as Record<string, unknown>
  const imageUrl = currentContent.imageUrl as string | undefined
  const macWindowStyle = currentContent.macWindowStyle as string | undefined
  const isMacCard = !!macWindowStyle
  const isPhoneHome = themeId === 'phone-home'
  const isPhoneHomeWidget = isPhoneHome && (card.card_type === 'gallery' || card.card_type === 'audio')
  const isMusicCard = card.card_type === 'music'

  // Handle card type change
  function handleTypeChange(newType: CardType) {
    updateCard(card.id, { card_type: newType })
  }

  // Handle duplicate
  function handleDuplicate() {
    duplicateCard(card.id)
    onClose()
  }

  // Handle delete with undo toast
  async function handleDelete() {
    // Remove from store (optimistic)
    removeCard(card.id)
    onClose()

    // Delete from database
    try {
      const response = await fetch(`/api/cards/${card.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete card")
      }
    } catch (error) {
      console.error("Failed to delete card from database:", error)
      // Card already removed from store - undo will restore it
    }

    toast("Card deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          undo()
          // Re-create in database (card is restored in store by undo)
          try {
            const restoredCard = usePageStore.getState().cards.find(c => c.id === card.id)
            if (restoredCard) {
              await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: restoredCard.id,
                  card_type: restoredCard.card_type,
                  title: restoredCard.title,
                  description: restoredCard.description,
                  url: restoredCard.url,
                  content: restoredCard.content,
                  size: restoredCard.size,
                  position: restoredCard.position,
                  sortKey: restoredCard.sortKey,
                  is_visible: restoredCard.is_visible,
                }),
              })
            }
          } catch (err) {
            console.error("Failed to restore card:", err)
          }
          toast("Card restored")
        },
      },
      duration: 5000,
    })
  }

  // Social icons card - shows all icons with editing
  if (card.card_type === "social-icons") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Social Icons</h2>
            <p className="text-xs text-muted-foreground">{themeId === 'phone-home' ? 'Each social appears as an app icon' : 'Widget'}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y">
          {/* Card title (shown in iPod/Macintosh themes as menu label) */}
          <div className="space-y-2">
            <Label className="text-sm">Card Label</Label>
            <Input
              value={card.title ?? ''}
              onChange={(e) => updateCard(card.id, { title: e.target.value || null })}
              placeholder="SOCIALS"
              className="h-9 uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Display name for this card (defaults to SOCIALS)
            </p>
          </div>

          {/* Social icons editor */}
          <SocialIconsCardFields />

          {/* Phone Home: per-icon customization */}
          {themeId === 'phone-home' && (
            <SocialIconCustomization
              card={card}
              currentContent={currentContent}
              onContentChange={handleContentChange}
            />
          )}

          {/* Position hint */}
          {themeId !== 'phone-home' && (
            <p className="text-xs text-muted-foreground">
              Drag this card to position where social icons appear on your page.
            </p>
          )}

          {/* Delete button */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="w-full h-11"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold text-sm">Edit Card</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {card.card_type.replace("_", " ")}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
        <Form {...form}>
          <form className="space-y-6">
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                {card.is_visible ? (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {card.is_visible ? "Visible" : "Hidden"}
                </span>
              </div>
              <Switch
                checked={card.is_visible}
                onCheckedChange={(checked) => {
                  updateCard(card.id, { is_visible: checked })
                }}
              />
            </div>

            {/* Card Type Picker - only for convertible types, hidden for Mac cards and Phone Home */}
            {!isMacCard && themeId !== 'phone-home' && isConvertibleType(card.card_type) && (
              <div className="space-y-2">
                <Label>Card Type</Label>
                <CardTypePicker
                  currentType={card.card_type}
                  onChange={handleTypeChange}
                />
              </div>
            )}

            {/* Word Art style picker - shown when word-art theme is active */}
            {themeId === 'word-art' && !['audio', 'social-icons'].includes(card.card_type) && (
              <WordArtStylePicker
                currentStyleId={(currentContent.wordArtStyle as string) || 'style-one'}
                onChange={(styleId) => handleContentChange({ wordArtStyle: styleId })}
              />
            )}

            {/* Phone Home theme: App Icon + Dock + Page + Widget Size */}
            {themeId === 'phone-home' && (
              <PhoneHomeCardControls
                card={card}
                currentContent={currentContent}
                phoneHomeDock={phoneHomeDock}
                addToDock={addToDock}
                removeFromDock={removeFromDock}
                onContentChange={handleContentChange}
              />
            )}

            {/* Video-specific fields at top for video cards */}
            {card.card_type === "video" && (
              <VideoCardFields
                content={currentContent as VideoCardContent}
                onChange={handleContentChange}
                cardId={card.id}
              />
            )}

            {/* Gallery-specific fields at top for gallery cards */}
            {card.card_type === "gallery" && (
              <GalleryCardFields
                content={currentContent as Partial<GalleryCardContent>}
                onChange={handleContentChange}
                cardId={card.id}
                isMacCard={isMacCard}
                isPhoneHome={isPhoneHome}
              />
            )}

            {/* Game-specific fields at top for game cards */}
            {card.card_type === "game" && (
              <GameCardFields
                content={currentContent as Partial<GameCardContent>}
                onChange={handleContentChange}
              />
            )}

            {/* Audio-specific fields at top for audio cards */}
            {card.card_type === "audio" && (
              <AudioCardFields
                content={currentContent as Partial<AudioCardContent>}
                onChange={handleContentChange}
                cardId={card.id}
                themeId={themeId}
              />
            )}

            {/* Music-specific fields at top for music cards */}
            {card.card_type === "music" && (
              <MusicCardFields
                content={currentContent as MusicCardContent}
                onChange={handleContentChange}
                cardId={card.id}
              />
            )}

            {/* Email collection-specific fields */}
            {card.card_type === "email-collection" && (
              <ProGate feature="Email Collection">
                <EmailCollectionFields
                  content={currentContent as Partial<EmailCollectionCardContent>}
                  onChange={handleContentChange}
                />
              </ProGate>
            )}

            {/* Release-specific fields */}
            {card.card_type === "release" && (
              <ProGate feature="Release Mode">
                <ReleaseCardFields
                  content={currentContent as Partial<ReleaseCardContent>}
                  onChange={handleContentChange}
                  cardId={card.id}
                />
              </ProGate>
            )}

            {/* Mac-specific fields */}
            {macWindowStyle === 'notepad' && (
              <MacNotepadFields
                macLinks={(currentContent.macLinks as Array<{ title: string; url: string }>) || []}
                notepadStyle={(currentContent.notepadStyle as string) || 'list'}
                notepadBgColor={(currentContent.notepadBgColor as string) || '#F2FFA4'}
                onChange={handleContentChange}
              />
            )}
            {(macWindowStyle === 'small-window' || macWindowStyle === 'large-window') && (
              <MacWindowFields
                macMode={(currentContent.macMode as string) || 'link'}
                macBodyText={(currentContent.macBodyText as string) || ''}
                macWindowStyle={macWindowStyle}
                macCheckerColor={(currentContent.macCheckerColor as string) || ''}
                macWindowBgColor={(currentContent.macWindowBgColor as string) || ''}
                macTextAlign={(currentContent.macTextAlign as string) || ''}
                macTextColor={(currentContent.macTextColor as string) || ''}
                macVideoUrl={(currentContent.macVideoUrl as string) || ''}
                cardId={card.id}
                onChange={handleContentChange}
              />
            )}
            {macWindowStyle === 'presave' && (
              <ProGate feature="Release Mode">
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">&quot;Drops in&quot; Text</label>
                    <Input
                      placeholder="Drops in"
                      value={(currentContent.dropsInText as string) || ''}
                      onChange={(e) => handleContentChange({ dropsInText: e.target.value || undefined })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Text shown above the countdown timer
                    </p>
                  </div>
                  <ColorPicker
                    label="Window Background"
                    color={(currentContent.presaveBgColor as string) || '#ad7676'}
                    onChange={(color) => handleContentChange({ presaveBgColor: color })}
                  />
                  <ColorPicker
                    label="Text Color"
                    color={(currentContent.textColor as string) || '#000000'}
                    onChange={(color) => handleContentChange({ textColor: color })}
                  />
                  <ReleaseCardFields
                    content={currentContent as Partial<ReleaseCardContent>}
                    onChange={handleContentChange}
                    cardId={card.id}
                    hideNameFields
                  />
                </>
              </ProGate>
            )}
            {macWindowStyle === 'map' && (
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-sm text-muted-foreground">Decorative window — no editable content.</p>
              </div>
            )}
            {macWindowStyle === 'calculator' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Message</label>
                <Input
                  placeholder="Type a message..."
                  value={(currentContent.calcMessage as string) || ''}
                  onChange={(e) => handleContentChange({ calcMessage: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Shown on the calculator display when = is pressed
                </p>
              </div>
            )}

            {/* Image upload - hidden for card types that don't support images, Mac cards, and phone-home gallery/audio */}
            {!isMacCard && !isPhoneHomeWidget && !CARD_TYPES_NO_IMAGE.includes(card.card_type) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <ImageUpload
                  value={imageUrl}
                  onChange={handleImageChange}
                  cardId={card.id}
                  cardType={card.card_type}
                />
              </div>
            )}

            {/* Card Size - visual toggle with SVG icons, hidden for Mac cards and phone-home gallery/audio */}
            {!isMacCard && !isPhoneHomeWidget && CARD_TYPE_SIZING[card.card_type] && (
              <div className="space-y-2">
                <Label>Card Size</Label>
                <ToggleGroup
                  type="single"
                  value={card.size}
                  onValueChange={(value) => {
                    if (value) updateCard(card.id, { size: value as CardSize })
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="big" aria-label="Full width" className="flex-col gap-1 h-auto py-2 px-4">
                    {/* Full width rectangle SVG */}
                    <svg width="48" height="24" viewBox="0 0 48 24" className="text-current">
                      <rect x="2" y="4" width="44" height="16" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="text-xs">Big</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="small" aria-label="Half width" className="flex-col gap-1 h-auto py-2 px-4">
                    {/* Half width rectangle SVG */}
                    <svg width="48" height="24" viewBox="0 0 48 24" className="text-current">
                      <rect x="10" y="4" width="28" height="16" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="text-xs">Small</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            {/* Card Position - for w-fit cards (mini, text), hidden for Mac cards */}
            {!isMacCard && POSITIONABLE_CARD_TYPES.includes(card.card_type) && (
              <div className="space-y-2">
                <Label>Position</Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={card.position}
                  onValueChange={(value) => {
                    if (value) updateCard(card.id, { position: value as HorizontalPosition })
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="left" aria-label="Position left">
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Position center">
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Position right">
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            {/* Text Alignment - hidden for Mac cards, phone-home gallery/audio, and music cards */}
            {!isMacCard && !isPhoneHomeWidget && !isMusicCard && <div className="space-y-2">
              <Label>Text Align</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={(currentContent.textAlign as string) || "center"}
                onValueChange={(value) => {
                  if (value) handleContentChange({ textAlign: value as TextAlign })
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="left" aria-label="Align left">
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Align center">
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Align right">
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>}

            {/* Vertical Alignment - hidden for Mac cards, phone-home gallery/audio, and music cards */}
            {!isMacCard && !isPhoneHomeWidget && !isMusicCard && <div className="space-y-2">
              <Label>Vertical Align</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={(currentContent.verticalAlign as string) || "middle"}
                onValueChange={(value) => {
                  if (value) handleContentChange({ verticalAlign: value as VerticalAlign })
                }}
                className="justify-start"
              >
                <ToggleGroupItem value="top" aria-label="Align top">
                  <AlignVerticalJustifyStart className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="middle" aria-label="Align middle">
                  <AlignVerticalJustifyCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="bottom" aria-label="Align bottom">
                  <AlignVerticalJustifyEnd className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>}

            {/* Transparent Background - hidden for Mac cards, phone-home gallery/audio, and music cards */}
            {!isMacCard && !isPhoneHomeWidget && !isMusicCard && <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!currentContent.transparentBackground}
                    onCheckedChange={(checked) => {
                      handleContentChange({ transparentBackground: checked })
                    }}
                  />
                  <Label className="cursor-pointer" onClick={() => {
                    handleContentChange({ transparentBackground: !currentContent.transparentBackground })
                  }}>
                    Transparent Background
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAllCardsTransparency(!!currentContent.transparentBackground)
                    toast("Applied transparency to all cards")
                  }}
                  className="h-8"
                >
                  Apply to All
                </Button>
              </div>
            </div>}

            {/* Title - hidden for notepad, map, calculator Mac cards and music cards */}
            {!isMusicCard && (!isMacCard || macWindowStyle === 'small-window' || macWindowStyle === 'large-window' || macWindowStyle === 'title-link' || macWindowStyle === 'presave' || macWindowStyle === 'gallery') && (
            <>
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter title..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description - hidden for square cards and Mac cards */}
            {!isMacCard && card.card_type !== "square" && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description..."
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="https://... or paste embed code"
                      {...field}
                      value={field.value ?? ""}
                      onBlur={handleUrlBlur}
                    />
                  </FormControl>
                  {urlError && (
                    <p className="text-sm text-destructive">{urlError}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            </>
            )}

            {/* Type-specific fields */}
            {!isMacCard && card.card_type === "hero" && (
              <HeroCardFields
                content={currentContent as HeroCardContent}
                onChange={handleContentChange}
              />
            )}
            {card.card_type === "horizontal" && (
              <HorizontalLinkFields
                content={currentContent as HorizontalLinkContent}
                onChange={handleContentChange}
              />
            )}
            {card.card_type === "square" && (
              <SquareCardFields
                content={currentContent as SquareCardContent}
                onChange={handleContentChange}
              />
            )}
            {(card.card_type === "link" || card.card_type === "mini" || card.card_type === "text") && (
              <LinkCardFields
                content={currentContent as LinkCardContent}
                onChange={handleContentChange}
                cardType={card.card_type}
              />
            )}
            {/* Action buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                className="flex-1 h-11" // 44px minimum touch target
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="flex-1 h-11" // 44px minimum touch target
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
