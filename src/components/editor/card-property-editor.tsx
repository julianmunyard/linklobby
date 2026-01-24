// src/components/editor/card-property-editor.tsx
"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/cards/image-upload"
import { HeroCardFields } from "./hero-card-fields"
import { HorizontalLinkFields } from "./horizontal-link-fields"
import { SquareCardFields } from "./square-card-fields"
import { usePageStore } from "@/stores/page-store"
import type { Card, CardSize, HeroCardContent, HorizontalLinkContent, SquareCardContent } from "@/types/card"
import { CARD_SIZES, CARD_TYPE_SIZING } from "@/types/card"

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

  const currentContent = card.content as Record<string, unknown>
  const imageUrl = currentContent.imageUrl as string | undefined

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
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <form className="space-y-6">
            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={imageUrl}
                onChange={handleImageChange}
                cardId={card.id}
                aspectRatio={card.card_type === "square" ? "square" : "video"}
              />
            </div>

            {/* Card Size - only show if card type supports sizing */}
            {CARD_TYPE_SIZING[card.card_type] && (
              <div className="space-y-2">
                <Label htmlFor="cardSize">Card Size</Label>
                <Select
                  value={card.size}
                  onValueChange={(value) => updateCard(card.id, { size: value as CardSize })}
                >
                  <SelectTrigger id="cardSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPE_SIZING[card.card_type]!.map((size) => (
                      <SelectItem key={size} value={size}>
                        {CARD_SIZES[size].label} - {CARD_SIZES[size].description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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

            {/* Description */}
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
                    />
                  </FormControl>
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
          </form>
        </Form>
      </div>
    </div>
  )
}
