// src/components/cards/email-collection-card.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useThemeStore } from '@/stores/theme-store'
import type { Card } from '@/types/card'
import type { EmailCollectionCardContent } from '@/types/fan-tools'
import { DEFAULT_EMAIL_COLLECTION_CONTENT } from '@/types/fan-tools'

interface EmailCollectionCardProps {
  card: Card
  pageId: string
  isEditing?: boolean
}

// Form schema
const emailFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().max(255).optional(),
})

type EmailFormValues = z.infer<typeof emailFormSchema>

export function EmailCollectionCard({ card, pageId, isEditing = false }: EmailCollectionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get theme border color
  const themeBorderColor = useThemeStore((state) => state.colors.border)

  // Merge card content with defaults
  const content: EmailCollectionCardContent = {
    ...DEFAULT_EMAIL_COLLECTION_CONTENT,
    ...(card.content as Partial<EmailCollectionCardContent>),
  }

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  })

  async function onSubmit(values: EmailFormValues) {
    // Don't submit in editing mode
    if (isEditing) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          name: values.name || undefined,
          pageId,
          cardId: card.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      if (data.alreadySubscribed) {
        setIsAlreadySubscribed(true)
      }
      setIsSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get text alignment class
  const textAlignClass = content.textAlign === 'left' ? 'text-left'
    : content.textAlign === 'right' ? 'text-right'
    : 'text-center'

  // Custom text color style
  const textStyle = content.textColor ? { color: content.textColor } : undefined

  // Success state
  if (isSuccess && !isEditing) {
    return (
      <div className={`w-full p-6 ${textAlignClass}`}>
        <div className="flex flex-col items-center justify-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p
            className="text-lg font-medium"
            style={{ ...textStyle, fontFamily: 'var(--font-theme-heading)' }}
          >
            {isAlreadySubscribed ? "You're already subscribed!" : content.successMessage}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full p-6 ${textAlignClass}`}>
      {/* Heading */}
      <h3
        className="text-xl font-semibold mb-2"
        style={{ ...textStyle, fontFamily: 'var(--font-theme-heading)' }}
      >
        {content.heading}
      </h3>

      {/* Subheading */}
      {content.subheading && (
        <p
          className="text-muted-foreground mb-4"
          style={{ ...textStyle, fontFamily: 'var(--font-theme-body)' }}
        >
          {content.subheading}
        </p>
      )}

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 max-w-md mx-auto"
          style={{ '--email-card-color': content.textColor || 'currentColor' } as React.CSSProperties}
        >
          <style>{`
            .email-card-input::placeholder {
              color: ${content.textColor || 'inherit'} !important;
              opacity: 1 !important;
              font-family: var(--font-theme-body) !important;
            }
            .email-card-input {
              background-color: transparent !important;
              font-family: var(--font-theme-body) !important;
            }
          `}</style>
          {/* Name field (optional) */}
          {content.showNameField && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      disabled={isSubmitting || isEditing}
                      className="email-card-input"
                      style={{
                        borderColor: themeBorderColor || undefined,
                        color: content.textColor || undefined,
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: content.textColor || undefined }}
                    />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 email-card-input"
                      disabled={isSubmitting || isEditing}
                      style={{
                        borderColor: themeBorderColor || undefined,
                        color: content.textColor || undefined,
                      }}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            style={{
              fontFamily: 'var(--font-theme-body)',
              borderColor: themeBorderColor || undefined,
              color: content.textColor || undefined,
              backgroundColor: 'transparent',
            }}
            disabled={isSubmitting || isEditing}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              content.buttonText
            )}
          </Button>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

        </form>
      </Form>
    </div>
  )
}
