// src/components/editor/link-card-fields.tsx
"use client"

import { ColorPicker } from "@/components/ui/color-picker"
import { useThemeStore } from "@/stores/theme-store"
import type { LinkCardContent } from "@/types/card"

interface LinkCardFieldsProps {
  content: LinkCardContent
  onChange: (updates: Record<string, unknown>) => void
}

export function LinkCardFields({ content, onChange }: LinkCardFieldsProps) {
  const themeTextColor = useThemeStore((state) => state.colors.text)

  return (
    <div className="space-y-4">
      <ColorPicker
        label="Text Color"
        color={content.textColor || themeTextColor}
        onChange={(color) => onChange({ textColor: color })}
      />
    </div>
  )
}
