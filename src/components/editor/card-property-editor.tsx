// src/components/editor/card-property-editor.tsx
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { validateAndFixUrl } from "@/lib/url-validation"
import { CURATED_FONTS } from "@/app/fonts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
import { Slider } from "@/components/ui/slider"
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
import { PhoneHomeCardControls, PHONE_HOME_ICON_SECTIONS, getDefaultPhoneHomeSize } from "./phone-home-card-controls"
import { ProGate } from "@/components/billing/pro-gate"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { useProfileStore } from "@/stores/profile-store"
import { SOCIAL_PLATFORMS } from "@/types/profile"
import { useHistory } from "@/hooks/use-history"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from "lucide-react"
import type { Card, CardType, CardSize, HorizontalPosition, HeroCardContent, HorizontalLinkContent, SquareCardContent, VideoCardContent, GalleryCardContent, GameCardContent, AudioCardContent, MusicCardContent, LinkCardContent, EmailCollectionCardContent, ReleaseCardContent, TextAlign, VerticalAlign } from "@/types/card"
import { CARD_TYPE_SIZING, CARD_TYPES_NO_IMAGE } from "@/types/card"

// Card types that support horizontal positioning (w-fit cards)
const POSITIONABLE_CARD_TYPES: CardType[] = ['mini']

// Common form schema
const cardFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
})

type CardFormValues = z.infer<typeof cardFormSchema>

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
  const socialAppIcons = (currentContent.socialAppIcons ?? {}) as Record<string, { appIconUrl?: string; appIconColor?: string; originalAppIconUrl?: string }>

  function updatePlatformIcon(platform: string, updates: { appIconUrl?: string; appIconColor?: string; originalAppIconUrl?: string }) {
    const current = socialAppIcons[platform] ?? {}
    const updated = { ...current, ...updates }
    // Remove undefined values
    if (!updated.appIconUrl) { delete updated.appIconUrl; delete updated.originalAppIconUrl }
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
              originalValue={override?.originalAppIconUrl}
              onChange={(url, originalUrl) => updatePlatformIcon(si.platform, { appIconUrl: url, originalAppIconUrl: originalUrl })}
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

interface CardPropertyEditorProps {
  card: Card
  onClose: () => void
  onSettingChanged?: () => void
}

export function CardPropertyEditor({ card, onClose, onSettingChanged }: CardPropertyEditorProps) {
  const updateCard = usePageStore((state) => state.updateCard)
  const duplicateCard = usePageStore((state) => state.duplicateCard)
  const removeCard = usePageStore((state) => state.removeCard)
  const setAllCardsTransparency = usePageStore((state) => state.setAllCardsTransparency)
  const themeId = useThemeStore((s) => s.themeId)
  const themeColors = useThemeStore((s) => s.colors)
  const setThemeColor = useThemeStore((s) => s.setColor)
  const themeTextColor = themeColors.text
  const cardTypeFontSizes = useThemeStore((s) => s.cardTypeFontSizes)
  const setCardTypeFontSize = useThemeStore((s) => s.setCardTypeFontSize)
  const fontFamilyScales = useThemeStore((s) => s.fontFamilyScales)
  const setFontFamilyScale = useThemeStore((s) => s.setFontFamilyScale)
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

  // Handle image changes (stores both cropped URL and original URL for re-crop)
  function handleImageChange(imageUrl: string | undefined, originalImageUrl?: string | undefined) {
    const content = { ...(card.content as Record<string, unknown>), imageUrl, originalImageUrl }
    updateCard(card.id, { content })
    onSettingChanged?.()
  }

  // Handle content field changes (for type-specific fields)
  function handleContentChange(updates: Record<string, unknown>) {
    const content = { ...(card.content as Record<string, unknown>), ...updates }
    updateCard(card.id, { content })
    onSettingChanged?.()
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
  const isBlinkieLink = themeId === 'blinkies' && (card.card_type === 'link' || card.card_type === 'mini')
  const isPhoneHomeWidget = isPhoneHome && (card.card_type === 'gallery' || card.card_type === 'audio')
  const isMusicCard = card.card_type === 'music'
  const isAudioCard = card.card_type === 'audio'
  const isEmailCard = card.card_type === 'email-collection'
  const isReleaseCard = card.card_type === 'release'

  // Handle card type change
  function handleTypeChange(newType: CardType) {
    updateCard(card.id, { card_type: newType })
    onSettingChanged?.()
  }

  // Handle duplicate
  function handleDuplicate() {
    duplicateCard(card.id)
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

  // iPod theme: link cards only need title + URL
  const isIpodSimple = themeId === 'ipod-classic' && !['audio', 'release', 'social-icons'].includes(card.card_type)
  if (isIpodSimple) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Edit Link</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Menu item name" {...field} className="h-11" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} onBlur={handleUrlBlur} className="h-11" />
                    </FormControl>
                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="pt-4 mt-4 border-t">
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

  // Word Art theme: link cards need Word Art style + title + URL
  const isWordArtSimple = themeId === 'word-art' && !['audio', 'social-icons'].includes(card.card_type)
  if (isWordArtSimple) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Edit Link</h2>
            <p className="text-xs text-muted-foreground">Word Art</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
          <Form {...form}>
            <form className="space-y-4">
              {/* Word Art Style Picker */}
              <WordArtStylePicker
                currentStyleId={(currentContent.wordArtStyle as string) || 'style-one'}
                onChange={(styleId) => handleContentChange({ wordArtStyle: styleId })}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Link text" {...field} className="h-11" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} onBlur={handleUrlBlur} className="h-11" />
                    </FormControl>
                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="pt-4 mt-4 border-t">
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

  // Chaotic Zine theme: link cards only need title + URL + badge text on first card
  const isZineSimple = themeId === 'chaotic-zine' && !['audio', 'release', 'text', 'social-icons'].includes(card.card_type)
  const zineBadgeText = useThemeStore((s) => s.zineBadgeText)
  const setZineBadgeText = useThemeStore((s) => s.setZineBadgeText)
  const isFirstZineCard = isZineSimple && (() => {
    const allCards = usePageStore.getState().cards
    const visible = allCards
      .filter(c => c.is_visible !== false && c.card_type !== 'social-icons' && c.card_type !== 'release')
      .sort((a, b) => (a.sortKey || '').localeCompare(b.sortKey || ''))
    return visible.length > 0 && visible[0].id === card.id
  })()
  if (isZineSimple) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Edit Link</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Link title" {...field} className="h-11" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} onBlur={handleUrlBlur} className="h-11" />
                    </FormControl>
                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                  </FormItem>
                )}
              />
            </form>
          </Form>

          {/* Badge Text — only on the first card */}
          {isFirstZineCard && (
            <div className="space-y-1 pt-4 mt-4 border-t">
              <Label className="text-sm font-medium">Badge Text</Label>
              <Input
                value={zineBadgeText}
                onChange={(e) => setZineBadgeText(e.target.value)}
                placeholder="NEW!"
                className="h-11 uppercase"
              />
              <p className="text-xs text-muted-foreground">Shown on this card. Leave empty to hide.</p>
            </div>
          )}

          <div className={isFirstZineCard ? "pt-4 mt-4 border-t" : "pt-4 mt-4 border-t"}>
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

  // VCR theme: simple link cards only need name + URL
  const isVcrSimple = themeId === 'vcr-menu' && !['audio', 'release', 'text', 'social-icons'].includes(card.card_type)
  if (isVcrSimple) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-sm">Edit Link</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 touch-pan-y">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Name</FormLabel>
                    <FormControl>
                      <Input placeholder="MENU ITEM" {...field} className="h-11 uppercase" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} onBlur={handleUrlBlur} className="h-11" />
                    </FormControl>
                    {urlError && <p className="text-xs text-destructive">{urlError}</p>}
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="pt-4 mt-4 border-t">
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
                  onSettingChanged?.()
                }}
              />
            </div>

            {/* Title/Description/URL - hidden for notepad, map, calculator Mac cards, music cards, audio cards, and all phone-home cards */}
            {!isMusicCard && !isAudioCard && !isEmailCard && !isReleaseCard && !isPhoneHome && (!isMacCard || macWindowStyle === 'small-window' || macWindowStyle === 'large-window' || macWindowStyle === 'title-link' || macWindowStyle === 'presave' || macWindowStyle === 'gallery') && (
            <>
            {/* Title — text cards get Textarea for multiline, others get Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    {card.card_type === 'text' ? (
                      <Textarea
                        placeholder="Enter text..."
                        {...field}
                        value={field.value ?? ""}
                        rows={4}
                        className="resize-y"
                      />
                    ) : (
                      <Input
                        placeholder="Enter title..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description - hidden for square cards, Mac cards, and blinky/link cards */}
            {!isMacCard && !isBlinkieLink && card.card_type !== "square" && (
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
                      placeholder={isBlinkieLink ? "https://..." : "https://... or paste embed code"}
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

            {/* Link Type Picker - only for convertible types, hidden for Mac cards and Phone Home */}
            {!isMacCard && themeId !== 'phone-home' && isConvertibleType(card.card_type) && (
              <div className="space-y-2">
                <Label>Link Type</Label>
                <CardTypePicker
                  currentType={card.card_type}
                  onChange={handleTypeChange}
                  themeId={themeId}
                  hiddenTypes={themeId === 'blinkies' ? ['mini', 'horizontal'] : undefined}
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

            {/* Phone Home theme: Name/URL + App Icon + Dock + Page + Widget Size */}
            {themeId === 'phone-home' && (
              <PhoneHomeCardControls
                card={card}
                currentContent={currentContent}
                phoneHomeDock={phoneHomeDock}
                addToDock={addToDock}
                removeFromDock={removeFromDock}
                onContentChange={handleContentChange}
                onCardUpdate={(updates) => updateCard(card.id, updates)}
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
                cardTitle={themeId === 'blinkies' ? undefined : (card.title ?? '')}
                onCardTitleChange={themeId === 'blinkies' ? undefined : (title) => updateCard(card.id, { title: title || null })}
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
                notepadTextColor={(currentContent.notepadTextColor as string) || '#000000'}
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
                  <div className="space-y-2">
                    <Label>Window Background</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(currentContent.presaveBgColor as string) || '#ad7676'}
                        onChange={(e) => handleContentChange({ presaveBgColor: e.target.value })}
                        className="h-9 w-9 rounded border cursor-pointer"
                      />
                      <Input
                        placeholder="#ad7676"
                        value={(currentContent.presaveBgColor as string) || ''}
                        onChange={(e) => handleContentChange({ presaveBgColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(currentContent.textColor as string) || '#000000'}
                        onChange={(e) => handleContentChange({ textColor: e.target.value })}
                        className="h-9 w-9 rounded border cursor-pointer"
                      />
                      <Input
                        placeholder="#000000"
                        value={(currentContent.textColor as string) || ''}
                        onChange={(e) => handleContentChange({ textColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
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
                  originalValue={currentContent.originalImageUrl as string | undefined}
                  onChange={handleImageChange}
                  cardId={card.id}
                  cardType={card.card_type}
                />
              </div>
            )}

            {/* Text Glow toggle — only for hero/square cards with an image */}
            {(card.card_type === 'hero' || card.card_type === 'square') && imageUrl && (
              <div className="flex items-center justify-between">
                <Label>Text Glow</Label>
                <Switch
                  checked={currentContent.showTextGlow === true}
                  onCheckedChange={(checked) => handleContentChange({ showTextGlow: checked })}
                />
              </div>
            )}

            {/* Link Size + Text Align + Vertical Align — grouped together */}
            {!isMacCard && !isPhoneHomeWidget && CARD_TYPE_SIZING[card.card_type] && (
              <div className="space-y-2">
                <Label>Link Size</Label>
                <ToggleGroup
                  type="single"
                  value={card.size}
                  onValueChange={(value) => {
                    if (value) {
                      updateCard(card.id, { size: value as CardSize })
                      onSettingChanged?.()
                    }
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="big" aria-label="Full width" className="flex-col gap-1 h-auto py-2 px-4">
                    <svg width="48" height="24" viewBox="0 0 48 24" className="text-current">
                      <rect x="2" y="4" width="44" height="16" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="text-xs">Big</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="small" aria-label="Half width" className="flex-col gap-1 h-auto py-2 px-4">
                    <svg width="48" height="24" viewBox="0 0 48 24" className="text-current">
                      <rect x="10" y="4" width="28" height="16" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="text-xs">Small</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            {/* Text Align + Vertical Align — side by side, hidden for Mac cards, phone-home, music cards, audio cards, and blinky/link cards */}
            {!isMacCard && !isPhoneHome && !isMusicCard && !isAudioCard && !isBlinkieLink && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
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
                </div>
                <div className="space-y-2">
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
                </div>
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

            {/* Font Size & Text Color - for convertible types + email-collection (hidden for blinkies, phone-home, macintosh) */}
            {(isConvertibleType(card.card_type) || isEmailCard || isReleaseCard) && !isPhoneHome && !isMacCard && !(themeId === 'blinkies' && card.card_type !== 'text') && (<>
              {/* Per-font-family size slider when card has a custom font */}
              {(() => {
                const customFont = (currentContent.fontFamily as string) || null
                const fontSizeKeyMap: Record<string, keyof typeof cardTypeFontSizes> = {
                  hero: 'hero', horizontal: 'horizontal', square: 'square',
                  link: 'link', mini: 'mini', text: 'text',
                }
                const cardTypeKey = fontSizeKeyMap[card.card_type] ?? 'link'
                const fontName = customFont ? CURATED_FONTS.find(f => f.variable === customFont)?.name : null
                const sizeLabel = card.card_type === 'text' ? 'Font Size (all text cards)' : `Font Size (all ${card.card_type} cards)`

                return customFont ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>{fontName} Size</Label>
                      <span className="text-muted-foreground">{Math.round((fontFamilyScales?.[customFont] ?? 1) * 100)}%</span>
                    </div>
                    <Slider
                      value={[fontFamilyScales?.[customFont] ?? 1]}
                      onValueChange={(v) => setFontFamilyScale(customFont, v[0])}
                      min={0.5}
                      max={2}
                      step={0.05}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>{sizeLabel}</Label>
                      <span className="text-muted-foreground">{Math.round((cardTypeFontSizes[cardTypeKey]) * 100)}%</span>
                    </div>
                    <Slider
                      value={[cardTypeFontSizes[cardTypeKey]]}
                      onValueChange={(v) => setCardTypeFontSize(cardTypeKey, v[0])}
                      min={0.5}
                      max={2}
                      step={0.1}
                    />
                  </div>
                )
              })()}
              <ColorPicker
                label="Text Color"
                color={(currentContent.textColor as string) || themeTextColor}
                onChange={(color) => handleContentChange({ textColor: color })}
              />
              <div className="space-y-2">
                <Label>Title Font</Label>
                <Select
                  value={(currentContent.fontFamily as string) || '__default__'}
                  onValueChange={(value) => handleContentChange({ fontFamily: value === '__default__' ? null : value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Theme default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">Theme default</SelectItem>
                    {CURATED_FONTS.map((font) => (
                      <SelectItem
                        key={font.id}
                        value={font.variable}
                        style={{ fontFamily: font.variable }}
                      >
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Description Font - for card types that show descriptions */}
              {['hero', 'link', 'horizontal', 'mini', 'text'].includes(card.card_type) && (
                <div className="space-y-2">
                  <Label>Description Font</Label>
                  <Select
                    value={(currentContent.descriptionFontFamily as string) || '__default__'}
                    onValueChange={(value) => handleContentChange({ descriptionFontFamily: value === '__default__' ? null : value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Theme default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default__">Theme default</SelectItem>
                      {CURATED_FONTS.map((font) => (
                        <SelectItem
                          key={font.id}
                          value={font.variable}
                          style={{ fontFamily: font.variable }}
                        >
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>)}

            {/* Border & Fill - text cards only */}
            {card.card_type === 'text' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!currentContent.showBorder}
                    onCheckedChange={(checked) => handleContentChange({ showBorder: checked })}
                  />
                  <Label className="cursor-pointer" onClick={() => handleContentChange({ showBorder: !currentContent.showBorder })}>
                    Border
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!currentContent.showFill}
                    onCheckedChange={(checked) => handleContentChange({ showFill: checked })}
                  />
                  <Label className="cursor-pointer" onClick={() => handleContentChange({ showFill: !currentContent.showFill })}>
                    Card Fill
                  </Label>
                </div>
              </div>
            )}

            {/* Transparent Background - hidden for Mac cards, phone-home, music cards, audio cards, and blinky/link cards */}
            {!isMacCard && !isPhoneHome && !isMusicCard && !isAudioCard && !isBlinkieLink && <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!currentContent.transparentBackground}
                  onCheckedChange={(checked) => {
                    handleContentChange({ transparentBackground: checked })
                    setAllCardsTransparency(checked)
                  }}
                />
                <Label className="cursor-pointer" onClick={() => {
                  const newValue = !currentContent.transparentBackground
                  handleContentChange({ transparentBackground: newValue })
                  setAllCardsTransparency(newValue)
                }}>
                  Transparent Background
                </Label>
              </div>

              {/* Quick-access theme color pickers — only for themes with visible card backgrounds */}
              {themeId === 'system-settings' && (
                <div className="space-y-2 pl-1">
                  {!currentContent.transparentBackground && (
                    <>
                      <ColorPicker label="Outer Box" color={themeColors.cardBg} onChange={(v) => setThemeColor('cardBg', v)} />
                      <ColorPicker label="Inner Box Fill" color={themeColors.accent} onChange={(v) => setThemeColor('accent', v)} />
                    </>
                  )}
                  <ColorPicker label="Text & Border" color={themeColors.text} onChange={(v) => setThemeColor('text', v)} />
                </div>
              )}
              {themeId === 'mac-os' && (
                <div className="space-y-2 pl-1">
                  {!currentContent.transparentBackground && (
                    <ColorPicker label="Card" color={themeColors.cardBg} onChange={(v) => setThemeColor('cardBg', v)} />
                  )}
                  <ColorPicker label="Border" color={themeColors.border} onChange={(v) => setThemeColor('border', v)} />
                  <ColorPicker label="Text" color={themeColors.text} onChange={(v) => setThemeColor('text', v)} />
                  <ColorPicker label="Title Bar Line" color={themeColors.titleBarLine || '#000000'} onChange={(v) => setThemeColor('titleBarLine', v)} />
                </div>
              )}
              {(themeId === 'instagram-reels' || (themeId === 'blinkies' && !isBlinkieLink)) && (
                <div className="space-y-2 pl-1">
                  {!currentContent.transparentBackground && (
                    <ColorPicker label="Card" color={themeColors.cardBg} onChange={(v) => setThemeColor('cardBg', v)} />
                  )}
                  <ColorPicker label="Border" color={themeColors.border} onChange={(v) => setThemeColor('border', v)} />
                  <ColorPicker label="Text" color={themeColors.text} onChange={(v) => setThemeColor('text', v)} />
                </div>
              )}
            </div>}

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
