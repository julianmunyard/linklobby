// src/components/editor/horizontal-link-fields.tsx
"use client"

import type { HorizontalLinkContent } from "@/types/card"

interface HorizontalLinkFieldsProps {
  content: HorizontalLinkContent
  onChange: (updates: Record<string, unknown>) => void
}

export function HorizontalLinkFields({ content, onChange }: HorizontalLinkFieldsProps) {
  // Horizontal link has no additional fields beyond common ones (title, description, url, image)
  return null
}
