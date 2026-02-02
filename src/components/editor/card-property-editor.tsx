// src/components/editor/card-property-editor.tsx
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X, Copy, Trash2 } from "lucide-react"
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
import { ImageUpload } from "@/components/cards/image-upload"
import { HeroCardFields } from "./hero-card-fields"
import { HorizontalLinkFields } from "./horizontal-link-fields"
import { SquareCardFields } from "./square-card-fields"
import { VideoCardFields } from "./video-card-fields"
import { GalleryCardFields } from "./gallery-card-fields"
import { GameCardFields } from "./game-card-fields"
import { SocialIconsCardFields } from "./social-icons-card-fields"
import { LinkCardFields } from "./link-card-fields"
import { CardTypePicker, isConvertibleType } from "./card-type-picker"
import { usePageStore } from "@/stores/page-store"
import { useHistory } from "@/hooks/use-history"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from "lucide-react"
import type { Card, CardType, CardSize, HorizontalPosition, HeroCardContent, HorizontalLinkContent, SquareCardContent, VideoCardContent, GalleryCardContent, GameCardContent, LinkCardContent, TextAlign, VerticalAlign } from "@/types/card"
import { CARD_TYPE_SIZING, CARD_TYPES_NO_IMAGE } from "@/types/card"

// Card types that support horizontal positioning (w-fit cards)
const POSITIONABLE_CARD_TYPES: CardType[] = ['mini', 'text']

// Common form schema
const cardFormSchema = z.object({
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  url: z.string().url().optional().or(z.literal("")),
})

type CardFormValues = z.infer<typeof cardFormSchema>

interface CardPropertyEditorProps {
  card: Card
  onClose: () => void
}

export function CardPropertyEditor({ card, onClose }: CardPropertyEditorProps) {
  const updateCard = usePageStore((state) => state.updateCard)
  const duplicateCard = usePageStore((state) => state.duplicateCard)
  const removeCard = usePageStore((state) => state.removeCard)
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
      const url = values.url || null

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

  // Handle URL blur - validate and auto-fix
  function handleUrlBlur(e: React.FocusEvent<HTMLInputElement>) {
    const result = validateAndFixUrl(e.target.value)
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
            <p className="text-xs text-muted-foreground">Widget</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-11 w-11">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y">
          {/* Social icons editor */}
          <SocialIconsCardFields />

          {/* Position hint */}
          <p className="text-xs text-muted-foreground">
            Drag this card to position where social icons appear on your page.
          </p>

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
            {/* Card Type Picker - only for convertible types */}
            {isConvertibleType(card.card_type) && (
              <div className="space-y-2">
                <Label>Card Type</Label>
                <CardTypePicker
                  currentType={card.card_type}
                  onChange={handleTypeChange}
                />
              </div>
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
              />
            )}

            {/* Game-specific fields at top for game cards */}
            {card.card_type === "game" && (
              <GameCardFields
                content={currentContent as Partial<GameCardContent>}
                onChange={handleContentChange}
              />
            )}

            {/* Image upload - hidden for card types that don't support images */}
            {!CARD_TYPES_NO_IMAGE.includes(card.card_type) && (
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

            {/* Card Size - visual toggle with SVG icons */}
            {CARD_TYPE_SIZING[card.card_type] && (
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

            {/* Card Position - for w-fit cards (mini, text) */}
            {POSITIONABLE_CARD_TYPES.includes(card.card_type) && (
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

            {/* Text Alignment */}
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

            {/* Vertical Alignment */}
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

            {/* Description - hidden for square cards */}
            {card.card_type !== "square" && (
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
                      type="url"
                      placeholder="https://..."
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

            {/* Type-specific fields */}
            {card.card_type === "hero" && (
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
