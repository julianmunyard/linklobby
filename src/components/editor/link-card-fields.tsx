// src/components/editor/link-card-fields.tsx
"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { BlinkieStylePicker } from "./blinkie-style-picker"
import { useThemeStore } from "@/stores/theme-store"
import { Check, X } from "lucide-react"
import type { LinkCardContent, CardType } from "@/types/card"
import type { CardTypeFontSizes } from "@/types/theme"

function parseIframeCode(html: string): { src: string; height: number } | null {
  const srcMatch = html.match(/src=["']([^"']+)["']/)
  if (!srcMatch) return null
  const heightMatch = html.match(/height[:=]["']?\s*(\d+)/)
  return { src: srcMatch[1], height: heightMatch ? parseInt(heightMatch[1], 10) : 352 }
}

interface LinkCardFieldsProps {
  content: LinkCardContent
  onChange: (updates: Record<string, unknown>) => void
  cardType?: CardType
}

const FONT_SIZE_LABELS: Partial<Record<CardType, string>> = {
  link: 'Font Size (all link cards)',
  mini: 'Font Size (all link cards)',
  text: 'Font Size (all text cards)',
}

export function LinkCardFields({ content, onChange, cardType = 'link' }: LinkCardFieldsProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const themeTextColor = useThemeStore((state) => state.colors.text)
  // Text cards use the 'text' font size key, link/mini use 'link'
  const fontSizeKey: keyof CardTypeFontSizes = cardType === 'text' ? 'text' : 'link'
  const fontSize = useThemeStore((state) => state.cardTypeFontSizes[fontSizeKey])
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)

  // Show blinky style picker for link/mini cards when blinkies theme is active
  const showBlinkiePicker = themeId === 'blinkies' && (cardType === 'link' || cardType === 'mini')

  const [embedCode, setEmbedCode] = useState("")
  const hasEmbed = !!content.embedIframeUrl

  function handleEmbedBlur() {
    if (!embedCode.trim()) return
    const parsed = parseIframeCode(embedCode)
    if (parsed) {
      onChange({ embedIframeUrl: parsed.src, embedHeight: parsed.height })
    }
  }

  function clearEmbed() {
    setEmbedCode("")
    onChange({ embedIframeUrl: null, embedHeight: null })
  }

  return (
    <div className="space-y-4">
      {/* Embed Code */}
      {cardType === 'link' && (
        <div className="space-y-2">
          <Label>Embed Code</Label>
          {hasEmbed ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-500" />
              <span className="flex-1">Embed detected</span>
              <Button variant="ghost" size="sm" onClick={clearEmbed} className="h-6 px-2">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          ) : (
            <>
              <Textarea
                placeholder="Paste an embed code from Spotify, Apple Music, etc."
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                onBlur={handleEmbedBlur}
                rows={3}
                className="text-xs font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Paste an {'<iframe>'} embed code and click away to apply.
              </p>
            </>
          )}
        </div>
      )}

      {/* Blinky style picker (only for blinkies theme) */}
      {showBlinkiePicker && (
        <BlinkieStylePicker
          currentStyle={content.blinkieStyle || '0008-pink'}
          onStyleChange={(style) => onChange({ blinkieStyle: style })}
        />
      )}

      {/* Font Size (hidden for blinkies theme since blinky badges have fixed size) */}
      {!showBlinkiePicker && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>{FONT_SIZE_LABELS[cardType] || 'Font Size'}</Label>
            <span className="text-muted-foreground">{Math.round(fontSize * 100)}%</span>
          </div>
          <Slider
            value={[fontSize]}
            onValueChange={(v) => setCardTypeFontSize(fontSizeKey, v[0])}
            min={0.5}
            max={2}
            step={0.1}
          />
        </div>
      )}

      {/* Text color (hidden for blinkies since animations have fixed colors) */}
      {!showBlinkiePicker && (
        <ColorPicker
          label="Text Color"
          color={content.textColor || themeTextColor}
          onChange={(color) => onChange({ textColor: color })}
        />
      )}
    </div>
  )
}
