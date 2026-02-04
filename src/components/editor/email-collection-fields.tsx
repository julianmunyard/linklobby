// src/components/editor/email-collection-fields.tsx
'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { EmailCollectionCardContent } from '@/types/fan-tools'
import { DEFAULT_EMAIL_COLLECTION_CONTENT } from '@/types/fan-tools'

interface EmailCollectionFieldsProps {
  content: Partial<EmailCollectionCardContent>
  onChange: (updates: Record<string, unknown>) => void
}

export function EmailCollectionFields({ content, onChange }: EmailCollectionFieldsProps) {
  // Merge with defaults
  const values: EmailCollectionCardContent = {
    ...DEFAULT_EMAIL_COLLECTION_CONTENT,
    ...content,
  }

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="space-y-2">
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          placeholder="Stay in the loop"
          value={values.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
        />
      </div>

      {/* Subheading */}
      <div className="space-y-2">
        <Label htmlFor="subheading">Subheading (optional)</Label>
        <Textarea
          id="subheading"
          placeholder="Get notified about new releases and updates"
          rows={2}
          value={values.subheading || ''}
          onChange={(e) => onChange({ subheading: e.target.value || undefined })}
        />
      </div>

      {/* Button Text */}
      <div className="space-y-2">
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          placeholder="Subscribe"
          value={values.buttonText}
          onChange={(e) => onChange({ buttonText: e.target.value })}
        />
      </div>

      {/* Show Name Field */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="showNameField">Show Name Field</Label>
          <p className="text-xs text-muted-foreground">
            Ask visitors for their name (optional)
          </p>
        </div>
        <Switch
          id="showNameField"
          checked={values.showNameField}
          onCheckedChange={(checked) => onChange({ showNameField: checked })}
        />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <Label htmlFor="successMessage">Success Message</Label>
        <Input
          id="successMessage"
          placeholder="Thanks for subscribing!"
          value={values.successMessage}
          onChange={(e) => onChange({ successMessage: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Shown after someone subscribes
        </p>
      </div>
    </div>
  )
}
