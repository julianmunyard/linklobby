"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Pencil, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, X } from "lucide-react"
import { Drawer as DrawerPrimitive } from "vaul"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ColorPicker } from "@/components/ui/color-picker"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ImageUpload } from "@/components/cards/image-upload"
import { usePageStore } from "@/stores/page-store"
import { useThemeStore } from "@/stores/theme-store"
import { CONVERTIBLE_CARD_TYPES, isConvertibleType } from "./card-type-picker"
import { BlinkieStylePicker } from "./blinkie-style-picker"
import { cn } from "@/lib/utils"
import { validateAndFixUrl } from "@/lib/url-validation"
import { toast } from "sonner"
import { CARD_TYPES_NO_IMAGE, CARD_TYPE_SIZING } from "@/types/card"
import { CARD_BG_PRESETS } from "@/data/card-bg-presets"
import { BLINKIE_STYLES } from "@/data/blinkie-styles"
import { generateId } from "@/lib/utils"
import type { AudioTrack } from "@/types/audio"
import type { Card, CardType, CardSize, TextAlign, VerticalAlign } from "@/types/card"
import type { CardTypeFontSizes } from "@/types/theme"

// Blinkie card color palettes for audio cards
const BLINKIE_PALETTES = [
  { name: 'Default',        outerBox: '#3d2020', innerBox: '#c9a832', text: '#9898a8', playerBox: '#8b7db8', buttons: '#b83232' },
  { name: 'Classic',        outerBox: '#F9F0E9', innerBox: '#EDE4DA', text: '#000000', playerBox: '#F9F0E9', buttons: '#F9F0E9' },
  { name: 'Ocean Abyss',    outerBox: '#152535', innerBox: '#3d7a8e', text: '#b8d4de', playerBox: '#4a6878', buttons: '#d46b5a' },
  { name: 'Lavender Haze',  outerBox: '#251835', innerBox: '#8b6aad', text: '#d8cce8', playerBox: '#6b5088', buttons: '#c85a8b' },
  { name: 'Emerald Dusk',   outerBox: '#182518', innerBox: '#5a8a5a', text: '#c8d8c4', playerBox: '#3d6840', buttons: '#c8824a' },
  { name: 'Rose Garden',    outerBox: '#351825', innerBox: '#b86a82', text: '#e8ccd8', playerBox: '#8a4a65', buttons: '#d84a68' },
  { name: 'Steel Dawn',     outerBox: '#1e2830', innerBox: '#5878a0', text: '#c8d8e8', playerBox: '#3d5878', buttons: '#4a98b8' },
  { name: 'Amber Glow',     outerBox: '#352518', innerBox: '#c89848', text: '#e8dcc8', playerBox: '#987040', buttons: '#d85828' },
  { name: 'Midnight Iris',  outerBox: '#1a1530', innerBox: '#6a4898', text: '#ccc0e0', playerBox: '#483570', buttons: '#a84888' },
  { name: 'Sage & Clay',    outerBox: '#252818', innerBox: '#8a9868', text: '#d8dec8', playerBox: '#607040', buttons: '#b89048' },
  { name: 'Coral Cove',     outerBox: '#301818', innerBox: '#c87868', text: '#e8d0cc', playerBox: '#904838', buttons: '#4888a0' },
  { name: 'Frost Violet',   outerBox: '#181830', innerBox: '#6868b0', text: '#ccccec', playerBox: '#383870', buttons: '#8848b0' },
  { name: 'Patina',         outerBox: '#182828', innerBox: '#488880', text: '#c8dcd8', playerBox: '#306058', buttons: '#b0884a' },
  { name: 'Dusk Cherry',    outerBox: '#2d1520', innerBox: '#a04058', text: '#e8c8d0', playerBox: '#703048', buttons: '#d0a040' },
  { name: 'Slate & Rust',   outerBox: '#282830', innerBox: '#707088', text: '#d8d8e0', playerBox: '#484860', buttons: '#c06838' },
  { name: 'Deep Lagoon',    outerBox: '#102028', innerBox: '#286878', text: '#b0d0d8', playerBox: '#1a4858', buttons: '#c86080' },
]

// Human-readable labels for card types
const CARD_TYPE_LABELS: Record<string, string> = {
  'hero': 'Hero',
  'horizontal': 'Horizontal',
  'square': 'Square',
  'link': 'Link',
  'mini': 'Mini',
  'text': 'Text',
  'video': 'Video',
  'gallery': 'Gallery',
  'game': 'Game',
  'audio': 'Audio',
  'music': 'Music',
  'social-icons': 'Social Icons',
  'email-collection': 'Email Collection',
  'release': 'Release',
}

interface MobileCardTypeDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: Card | null
  onOpenFullEditor: () => void
}

interface TabDef {
  key: string
  label: string
}

export function MobileCardTypeDrawer({
  open,
  onOpenChange,
  card,
  onOpenFullEditor,
}: MobileCardTypeDrawerProps) {
  const updateCard = usePageStore((state) => state.updateCard)
  const setAllCardsTransparency = usePageStore((state) => state.setAllCardsTransparency)
  const themeId = useThemeStore((state) => state.themeId)
  const cardTypeFontSizes = useThemeStore((state) => state.cardTypeFontSizes)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)
  const [activeTab, setActiveTab] = useState(0)

  const currentContent = (card?.content || {}) as Record<string, unknown>
  const macWindowStyle = currentContent.macWindowStyle as string | undefined
  const isMacCard = !!macWindowStyle
  const isConvertible = card ? (!isMacCard && isConvertibleType(card.card_type)) : false

  const hasImage = card ? !CARD_TYPES_NO_IMAGE.includes(card.card_type) && !isMacCard : false
  const isBlinkieCard = themeId === 'blinkies' && card != null && (card.card_type === 'link' || card.card_type === 'mini')
  const isBlinkieAudioCard = (themeId === 'blinkies' || themeId === 'system-settings' || themeId === 'mac-os' || themeId === 'instagram-reels' || themeId === 'artifact') && card != null && card.card_type === 'audio'

  // State for blinkie style picker dialog in audio background tab
  const [audioBoxBgPickerOpen, setAudioBoxBgPickerOpen] = useState(false)

  // Auto-size drawer height to active pane content
  const activePaneRef = useRef<HTMLDivElement>(null)
  const [paneHeight, setPaneHeight] = useState(0)

  useEffect(() => {
    const el = activePaneRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setPaneHeight(el.scrollHeight)
    })
    ro.observe(el)
    setPaneHeight(el.scrollHeight)
    return () => ro.disconnect()
  }, [activeTab, card?.id])

  const tabs: TabDef[] = (() => {
    if (isBlinkieAudioCard) {
      return [
        { key: 'background', label: 'Background' },
        { key: 'colors', label: 'Colors' },
        { key: 'player', label: 'Player' },
      ]
    }
    const t: TabDef[] = [{ key: 'type', label: isBlinkieCard ? 'Style' : 'Type' }]
    if (!isMacCard) t.push({ key: 'content', label: 'Content' })
    if (hasImage) t.push({ key: 'photo', label: 'Photo' })
    if (!isMacCard) t.push({ key: 'text', label: 'Text' })
    return t
  })()

  // Reset active tab when card changes or drawer opens
  useEffect(() => {
    setActiveTab(0)
  }, [card?.id, open])

  const handleTypeChange = (newType: CardType) => {
    if (!card) return
    updateCard(card.id, { card_type: newType })
  }

  const handleSizeChange = (newSize: CardSize) => {
    if (!card) return
    updateCard(card.id, { size: newSize })
  }

  const handleVisibilityToggle = () => {
    if (!card) return
    updateCard(card.id, { is_visible: !card.is_visible })
  }

  const handleContentChange = (updates: Record<string, unknown>) => {
    if (!card) return
    const content = { ...currentContent, ...updates }
    updateCard(card.id, { content })
  }

  const handleImageChange = (imageUrl: string | undefined) => {
    if (!card) return
    const content = { ...currentContent, imageUrl }
    updateCard(card.id, { content })
  }

  const handleUrlBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (!card) return
    const value = e.target.value.trim()

    // Detect pasted iframe embed code in the URL field (link cards)
    if (value.includes('<iframe') && card.card_type === 'link') {
      const srcMatch = value.match(/src=["']([^"']+)["']/)
      if (srcMatch) {
        const heightMatch = value.match(/height[:=]["']?\s*(\d+)/)
        const embedHeight = heightMatch ? parseInt(heightMatch[1], 10) : 352
        const content = { ...(card.content as Record<string, unknown>), embedIframeUrl: srcMatch[1], embedHeight }
        updateCard(card.id, { content, url: null })
        toast.success('Embed detected')
        return
      }
    }

    const result = validateAndFixUrl(value)
    if (!result.valid && result.error) {
      toast.error(result.error)
    } else if (result.url && result.url !== e.target.value) {
      updateCard(card.id, { url: result.url || null })
    }
  }, [card, updateCard])

  // Swipe: track touch for smooth translateX dragging + snap
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const dragOffset = useRef(0)
  const isDragging = useRef(false)
  const swipeBlocked = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)
  // Check if touch started on a slider or range input (these need swipe blocking)
  const isSliderTarget = useCallback((target: EventTarget | null) => {
    let el = target as HTMLElement | null
    while (el) {
      if (el.getAttribute('role') === 'slider' || el.dataset.radixSlider !== undefined) return true
      if (el instanceof HTMLInputElement && el.type === 'range') return true
      // Block horizontal swipe when inside a vertically-scrollable container
      if (el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === 'auto') return true
      if (el === trackRef.current) break
      el = el.parentElement
    }
    return false
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeBlocked.current = isSliderTarget(e.target)
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    dragOffset.current = 0
    isDragging.current = false
  }, [isSliderTarget])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (swipeBlocked.current) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (!isDragging.current && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      isDragging.current = true
    }
    if (isDragging.current) {
      e.preventDefault()
      dragOffset.current = dx
      const track = trackRef.current
      if (track) {
        const base = -(activeTab * 100)
        let pct = (dx / track.parentElement!.offsetWidth) * 100
        // Elastic resistance at edges
        const atStart = activeTab === 0 && dx > 0
        const atEnd = activeTab === tabs.length - 1 && dx < 0
        if (atStart || atEnd) {
          pct = pct * 0.25 // rubber-band: 25% of drag distance
        }
        track.style.transition = 'none'
        track.style.transform = `translateX(${base + pct}%)`
      }
    }
  }, [activeTab])

  const handleTouchEnd = useCallback(() => {
    if (swipeBlocked.current) {
      swipeBlocked.current = false
      return
    }
    const track = trackRef.current
    if (track) {
      track.style.transition = 'transform 0.3s ease-out'
    }
    if (isDragging.current && Math.abs(dragOffset.current) > 40) {
      const atStart = activeTab === 0 && dragOffset.current > 0
      const atEnd = activeTab === tabs.length - 1 && dragOffset.current < 0
      if (!atStart && !atEnd) {
        if (dragOffset.current < 0) {
          setActiveTab((prev) => Math.min(prev + 1, tabs.length - 1))
        } else {
          setActiveTab((prev) => Math.max(prev - 1, 0))
        }
      } else if (track) {
        // Snap back with animation at edges
        track.style.transform = `translateX(-${activeTab * 100}%)`
      }
    } else if (track) {
      track.style.transform = `translateX(-${activeTab * 100}%)`
    }
    isDragging.current = false
    dragOffset.current = 0
  }, [activeTab, tabs.length])

  const supportsSizing = card ? (!isMacCard && CARD_TYPE_SIZING[card.card_type]) : null

  const fontSizeKey = card?.card_type as keyof CardTypeFontSizes | undefined
  const hasFontSize = !isMacCard && fontSizeKey && fontSizeKey in cardTypeFontSizes
  const currentFontSize = hasFontSize ? cardTypeFontSizes[fontSizeKey] : 1

  const TEXT_COLOR_TYPES = new Set(['hero', 'horizontal', 'link', 'square', 'video', 'music', 'release'])
  const hasTextColor = card ? (!isMacCard && TEXT_COLOR_TYPES.has(card.card_type)) : false
  const currentTextColor = currentContent.textColor as string || '#ffffff'

  const imageUrl = currentContent.imageUrl as string | undefined

  const cardTypeLabel = card
    ? (isMacCard
      ? (macWindowStyle === 'notepad' ? 'Notepad' :
         macWindowStyle === 'calculator' ? 'Calculator' :
         macWindowStyle === 'map' ? 'Map' :
         macWindowStyle === 'presave' ? 'Pre-Save' :
         macWindowStyle === 'gallery' ? 'Gallery' :
         macWindowStyle === 'title-link' ? 'Title Link' :
         macWindowStyle === 'small-window' ? 'Window' :
         macWindowStyle === 'large-window' ? 'Window' :
         'Mac Card')
      : (CARD_TYPE_LABELS[card.card_type] || card.card_type.charAt(0).toUpperCase() + card.card_type.slice(1).replace(/-/g, ' ')))
    : ''

  return (
    <DrawerPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      modal={false}
      direction="top"
      noBodyStyles
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay
          className="fixed inset-0 z-40"
          onClick={() => onOpenChange(false)}
        />
        <DrawerPrimitive.Content
          className="bg-background fixed inset-x-0 top-0 z-50 flex flex-col rounded-b-xl border-b shadow-lg overflow-x-hidden"
        >
          <DrawerPrimitive.Title className="sr-only">Card Settings</DrawerPrimitive.Title>
          <div data-vaul-no-drag className="px-3 pt-3 pb-1.5 space-y-1.5 touch-pan-y">
            {/* Header: card type label + visibility */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {cardTypeLabel}
                </span>
                {card && (
                  <button
                    onClick={handleVisibilityToggle}
                    className={cn(
                      "p-1 rounded transition-colors",
                      card.is_visible
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-destructive hover:text-destructive/80"
                    )}
                    aria-label={card.is_visible ? "Hide card" : "Show card"}
                  >
                    {card.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              {/* Full Settings inline */}
              <button
                onClick={onOpenFullEditor}
                className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide transition-colors"
              >
                <Pencil className="h-2.5 w-2.5" />
                All Settings
              </button>
            </div>

            {/* Tab bar */}
            {card && (
              <div className="flex gap-1">
                {tabs.map((tab, idx) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(idx)}
                    className={cn(
                      "flex-1 py-1 rounded-md border text-[11px] font-medium transition-all",
                      activeTab === idx
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Swipeable pane area — translateX for smooth sliding, height adapts to active tab */}
            {card && (
              <div
                className="overflow-x-clip pt-0.5 transition-[height] duration-300 ease-out"
                style={{ height: paneHeight > 0 ? paneHeight : undefined }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  ref={trackRef}
                  className="flex transition-transform duration-300 ease-out items-start"
                  style={{ transform: `translateX(-${activeTab * 100}%)` }}
                >
                  {tabs.map((tab, idx) => (
                    <div
                      key={tab.key}
                      ref={idx === activeTab ? activePaneRef : undefined}
                      className="w-full min-w-full max-w-full flex-shrink-0 overflow-hidden px-0.5"
                    >
                      {/* ---- Type / Blinkie Style ---- */}
                      {tab.key === 'type' && (
                        <div className="space-y-1.5">
                          {isBlinkieCard ? (
                            <div className="max-h-[40vh] overflow-y-auto overscroll-contain -mx-0.5 px-0.5">
                              <BlinkieStylePicker
                                currentStyle={(currentContent.blinkieStyle as string) || '0008-pink'}
                                onStyleChange={(style) => handleContentChange({ blinkieStyle: style })}
                              />
                            </div>
                          ) : (
                            <>
                              {isConvertible && (
                                <div className="grid grid-cols-3 gap-1">
                                  {CONVERTIBLE_CARD_TYPES.map(({ type, icon: Icon, label }) => {
                                    const isSelected = card.card_type === type
                                    return (
                                      <button
                                        key={type}
                                        onClick={() => handleTypeChange(type)}
                                        className={cn(
                                          "flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg border transition-all",
                                          isSelected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-transparent bg-muted/50 text-muted-foreground"
                                        )}
                                      >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-[10px] font-medium">{label}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                              {!isConvertible && (
                                <div className="rounded-lg bg-muted/50 px-3 py-1.5">
                                  <p className="text-xs text-muted-foreground">
                                    This card type cannot be converted.
                                  </p>
                                </div>
                              )}
                              {supportsSizing && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleSizeChange('big')}
                                    className={cn(
                                      "flex-1 py-1 rounded-md border text-xs font-medium transition-all",
                                      card.size === 'big'
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-transparent bg-muted/50 text-muted-foreground"
                                    )}
                                  >
                                    Big
                                  </button>
                                  <button
                                    onClick={() => handleSizeChange('small')}
                                    className={cn(
                                      "flex-1 py-1 rounded-md border text-xs font-medium transition-all",
                                      card.size === 'small'
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-transparent bg-muted/50 text-muted-foreground"
                                    )}
                                  >
                                    Small
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* ---- Background (blinkies audio) ---- */}
                      {tab.key === 'background' && isBlinkieAudioCard && (
                        <BlinkieAudioBackgroundPane
                          currentContent={currentContent}
                          onContentChange={handleContentChange}
                          pickerOpen={audioBoxBgPickerOpen}
                          onPickerOpenChange={setAudioBoxBgPickerOpen}
                        />
                      )}

                      {/* ---- Colors (blinkies audio) ---- */}
                      {tab.key === 'colors' && isBlinkieAudioCard && (
                        <BlinkieAudioColorsPane
                          currentContent={currentContent}
                          onContentChange={handleContentChange}
                        />
                      )}

                      {/* ---- Player (blinkies audio) ---- */}
                      {tab.key === 'player' && isBlinkieAudioCard && card && (
                        <BlinkieAudioPlayerPane
                          currentContent={currentContent}
                          onContentChange={handleContentChange}
                          cardId={card.id}
                        />
                      )}

                      {/* ---- Content ---- */}
                      {tab.key === 'content' && (
                        <div className="space-y-1.5">
                          <Input
                            placeholder="Title"
                            value={card.title ?? ''}
                            onChange={(e) => updateCard(card.id, { title: e.target.value || null })}
                            className="h-8 text-sm"
                          />
                          <Textarea
                            placeholder="Description"
                            value={card.description ?? ''}
                            onChange={(e) => updateCard(card.id, { description: e.target.value || null })}
                            rows={2}
                            className="text-sm min-h-0"
                          />
                          <Input
                            placeholder="https://..."
                            value={card.url ?? ''}
                            onChange={(e) => updateCard(card.id, { url: e.target.value || null })}
                            onBlur={handleUrlBlur}
                            className="h-8 text-sm"
                          />
                        </div>
                      )}

                      {/* ---- Photo ---- */}
                      {tab.key === 'photo' && (
                        <ImageUpload
                          value={imageUrl}
                          onChange={handleImageChange}
                          cardId={card.id}
                          cardType={card.card_type}
                        />
                      )}

                      {/* ---- Text ---- */}
                      {tab.key === 'text' && (
                        <div className="space-y-2">
                          <div className="flex gap-3 items-end">
                            <div className="space-y-0.5 flex-1">
                              <span className="text-[10px] text-muted-foreground">Horizontal</span>
                              <ToggleGroup
                                type="single"
                                variant="outline"
                                value={(currentContent.textAlign as string) || "center"}
                                onValueChange={(value) => {
                                  if (value) handleContentChange({ textAlign: value as TextAlign })
                                }}
                                className="justify-start"
                              >
                                <ToggleGroupItem value="left" aria-label="Align left" className="h-7 w-7 p-0">
                                  <AlignLeft className="h-3.5 w-3.5" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="center" aria-label="Align center" className="h-7 w-7 p-0">
                                  <AlignCenter className="h-3.5 w-3.5" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="right" aria-label="Align right" className="h-7 w-7 p-0">
                                  <AlignRight className="h-3.5 w-3.5" />
                                </ToggleGroupItem>
                              </ToggleGroup>
                            </div>
                            <div className="space-y-0.5 flex-1">
                              <span className="text-[10px] text-muted-foreground">Vertical</span>
                              <ToggleGroup
                                type="single"
                                variant="outline"
                                value={(currentContent.verticalAlign as string) || "middle"}
                                onValueChange={(value) => {
                                  if (value) handleContentChange({ verticalAlign: value as VerticalAlign })
                                }}
                                className="justify-start"
                              >
                                <ToggleGroupItem value="top" aria-label="Align top" className="h-7 w-7 p-0">
                                  <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="middle" aria-label="Align middle" className="h-7 w-7 p-0">
                                  <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="bottom" aria-label="Align bottom" className="h-7 w-7 p-0">
                                  <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
                                </ToggleGroupItem>
                              </ToggleGroup>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {card.card_type === 'square' && (
                              <label className="flex items-center gap-1.5 flex-1">
                                <Switch
                                  checked={currentContent.showTitle !== false}
                                  onCheckedChange={(checked) => handleContentChange({ showTitle: checked })}
                                  className="scale-75 origin-left"
                                />
                                <span className="text-[10px] text-muted-foreground">Title Overlay</span>
                              </label>
                            )}
                            {card.card_type === 'hero' && (
                              <label className="flex items-center gap-1.5 flex-1">
                                <Switch
                                  checked={currentContent.showButton !== false}
                                  onCheckedChange={(checked) => handleContentChange({ showButton: checked })}
                                  className="scale-75 origin-left"
                                />
                                <span className="text-[10px] text-muted-foreground">Show Button</span>
                              </label>
                            )}
                            <label className="flex items-center gap-1.5 flex-1">
                              <Switch
                                checked={!!currentContent.transparentBackground}
                                onCheckedChange={(checked) => handleContentChange({ transparentBackground: checked })}
                                className="scale-75 origin-left"
                              />
                              <span className="text-[10px] text-muted-foreground">No BG</span>
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAllCardsTransparency(!!currentContent.transparentBackground)
                                toast("Applied to all cards")
                              }}
                              className="h-6 px-2 text-[10px]"
                            >
                              Apply All
                            </Button>
                          </div>

                          {hasFontSize && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">Size</span>
                              <Slider
                                value={[currentFontSize]}
                                onValueChange={(v) => setCardTypeFontSize(fontSizeKey!, v[0])}
                                min={0.5}
                                max={2}
                                step={0.1}
                                className="h-5 flex-1"
                              />
                              <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(currentFontSize * 100)}%</span>
                            </div>
                          )}

                          {hasTextColor && (
                            <ColorPicker
                              label="Text Color"
                              color={currentTextColor}
                              onChange={(color) => {
                                if (!card) return
                                updateCard(card.id, {
                                  content: { ...card.content, textColor: color }
                                })
                              }}
                              className="text-xs"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom drag handle */}
          <div className="flex justify-center pb-1.5 pt-0.5 flex-shrink-0">
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}

/* ── Blinkies Audio sub-panes (extracted to avoid IIFE type issues) ── */

interface BlinkieAudioPaneProps {
  currentContent: Record<string, unknown>
  onContentChange: (updates: Record<string, unknown>) => void
}

function BlinkieAudioBackgroundPane({
  currentContent,
  onContentChange,
  pickerOpen,
  onPickerOpenChange,
}: BlinkieAudioPaneProps & { pickerOpen: boolean; onPickerOpenChange: (v: boolean) => void }) {
  const boxBgs = currentContent.blinkieBoxBackgrounds as Record<string, unknown> | undefined
  const styleId = boxBgs?.cardOuter as string | undefined
  const styleDef = styleId ? BLINKIE_STYLES[styleId] : null
  const cardBgUrl = (boxBgs?.cardBgUrl as string) || ''
  const cardOuterDim = (boxBgs?.cardOuterDim as number | undefined) ?? 0

  return (
    <div className="space-y-1">
      {/* GIF preset grid — fixed 48px squares, flex-wrap */}
      <div className="flex flex-wrap gap-[3px]">
        {CARD_BG_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.name}
            className={cn(
              "w-[48px] h-[48px] rounded-sm overflow-hidden border-0 flex-shrink-0",
              cardBgUrl === preset.url
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                : "opacity-80"
            )}
            onClick={() =>
              onContentChange({
                blinkieBoxBackgrounds: {
                  ...boxBgs,
                  cardBgUrl: preset.url,
                  cardBgStoragePath: undefined,
                  cardBgScale: undefined,
                  cardBgPosX: undefined,
                  cardBgPosY: undefined,
                  cardBgNone: undefined,
                  cardOuter: undefined,
                },
              })
            }
          >
            <img
              src={preset.thumbnail || preset.url}
              alt={preset.name}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Tile pattern + clear row */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="flex-1 h-6 overflow-hidden border rounded text-[10px] text-muted-foreground hover:ring-1 hover:ring-muted-foreground/30"
          style={{ imageRendering: 'pixelated' as const }}
          onClick={() => onPickerOpenChange(true)}
        >
          {styleDef ? (
            <img
              src={`/blinkies/${styleDef.bgID}-0.png`}
              alt={styleDef.name}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <span className="flex items-center justify-center h-full">Tile Pattern...</span>
          )}
        </button>
        {(styleId || cardBgUrl) && (
          <button
            type="button"
            className="h-6 px-1.5 rounded border text-[10px] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            onClick={() =>
              onContentChange({
                blinkieBoxBackgrounds: {
                  ...boxBgs,
                  cardBgUrl: undefined,
                  cardBgStoragePath: undefined,
                  cardBgScale: undefined,
                  cardBgPosX: undefined,
                  cardBgPosY: undefined,
                  cardBgNone: true,
                  cardOuter: undefined,
                  cardOuterDim: undefined,
                },
              })
            }
          >
            Clear
          </button>
        )}
      </div>

      {/* Dim slider */}
      {(styleId || cardBgUrl) && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Dim</span>
          <input
            type="range"
            min="0"
            max="100"
            value={cardOuterDim}
            onChange={(e) =>
              onContentChange({
                blinkieBoxBackgrounds: {
                  ...boxBgs,
                  cardOuterDim: parseInt(e.target.value),
                },
              })
            }
            className="flex-1 h-1.5 accent-primary"
          />
          <span className="text-[10px] text-muted-foreground tabular-nums w-5 text-right">
            {cardOuterDim}
          </span>
        </div>
      )}

      {/* Blinkie Style Picker bottom sheet */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={() => onPickerOpenChange(false)}>
          <div className="bg-background rounded-t-xl border-t w-full max-h-[60vh] overflow-y-auto p-3 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Tile Pattern</span>
              <button onClick={() => onPickerOpenChange(false)} className="p-1"><X className="h-4 w-4" /></button>
            </div>
            <BlinkieStylePicker
              currentStyle={styleId || ''}
              onStyleChange={(newStyleId) => {
                onContentChange({
                  blinkieBoxBackgrounds: {
                    cardOuter: newStyleId,
                    cardOuterDim: cardOuterDim || 30,
                    cardBgUrl: undefined,
                    cardBgStoragePath: undefined,
                    cardBgScale: undefined,
                    cardBgPosX: undefined,
                    cardBgPosY: undefined,
                    cardBgNone: true,
                  },
                })
                onPickerOpenChange(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function BlinkieAudioColorsPane({ currentContent, onContentChange }: BlinkieAudioPaneProps) {
  const blinkieColors = currentContent.blinkieColors as Record<string, string> | undefined
  return (
    <div className="space-y-1.5">
      {/* Palette swatches only */}
      <div className="grid grid-cols-4 gap-1">
        {BLINKIE_PALETTES.map((p) => (
          <button
            key={p.name}
            type="button"
            title={p.name}
            className={cn(
              "flex rounded overflow-hidden h-6 transition-all",
              blinkieColors?.outerBox === p.outerBox && blinkieColors?.innerBox === p.innerBox
                ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                : "opacity-80"
            )}
            onClick={() =>
              onContentChange({
                blinkieColors: {
                  outerBox: p.outerBox,
                  innerBox: p.innerBox,
                  text: p.text,
                  playerBox: p.playerBox,
                  buttons: p.buttons,
                },
              })
            }
          >
            <div className="flex-1" style={{ backgroundColor: p.outerBox }} />
            <div className="flex-1" style={{ backgroundColor: p.innerBox }} />
            <div className="flex-1" style={{ backgroundColor: p.playerBox }} />
            <div className="flex-1" style={{ backgroundColor: p.buttons }} />
            <div className="flex-1" style={{ backgroundColor: p.text }} />
          </button>
        ))}
      </div>
      {blinkieColors && (
        <button
          type="button"
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => onContentChange({ blinkieColors: undefined })}
        >
          Reset Colors
        </button>
      )}
    </div>
  )
}

function BlinkieAudioPlayerPane({ currentContent, onContentChange, cardId }: BlinkieAudioPaneProps & { cardId: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const tracks = (currentContent.tracks as AudioTrack[]) || []

  function handleTrackUpdate(trackId: string, field: 'title' | 'artist', value: string) {
    const updated = tracks.map((t) => t.id === trackId ? { ...t, [field]: value } : t)
    onContentChange({ tracks: updated })
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const audioExtensions = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.aiff', '.wma']
    const hasAudioMime = file.type.startsWith('audio/')
    const hasAudioExt = audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    if (!hasAudioMime && !hasAudioExt) { toast.error('Must be an audio file'); return }
    if (file.size > 100 * 1024 * 1024) { toast.error('Max 100MB'); return }
    try {
      setIsUploading(true)
      const trackId = generateId()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('cardId', cardId)
      formData.append('trackId', trackId)
      const response = await fetch('/api/audio/upload', { method: 'POST', body: formData })
      if (!response.ok) {
        const txt = await response.text()
        let msg = 'Upload failed'
        try { msg = JSON.parse(txt).error || msg } catch { msg = txt || msg }
        throw new Error(msg)
      }
      const result = await response.json()
      const newTrack: AudioTrack = {
        id: trackId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '',
        duration: result.duration || 0,
        audioUrl: result.url,
        storagePath: result.path,
        waveformData: result.waveformData,
      }
      onContentChange({ tracks: [...tracks, newTrack] })
      toast.success('Track uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(trackId: string) {
    const track = tracks.find(t => t.id === trackId)
    if (!track) return
    onContentChange({ tracks: tracks.filter(t => t.id !== trackId) })
    try {
      await fetch('/api/audio/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath: track.storagePath }),
      })
    } catch { /* storage cleanup is best-effort */ }
    toast.success('Track removed')
  }

  return (
    <div className="space-y-2">
      {/* Upload button */}
      <div>
        <input ref={fileRef} type="file" accept="*/*" className="hidden" disabled={isUploading} onChange={handleUpload} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          disabled={isUploading}
          onClick={() => fileRef.current?.click()}
        >
          {isUploading ? 'Uploading...' : 'Upload Track'}
        </Button>
        <p className="text-[10px] text-muted-foreground mt-0.5">MP3, WAV, or other audio. Max 100MB.</p>
      </div>

      {/* Track list with title/artist editing */}
      {tracks.length > 0 && (
        <div className="space-y-1.5">
          {tracks.map((track, i) => (
            <div key={track.id} className="p-2 rounded border bg-muted/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">Track {i + 1}</span>
                <button
                  type="button"
                  className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(track.id)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <Input
                placeholder="Track title"
                value={track.title}
                onChange={(e) => handleTrackUpdate(track.id, 'title', e.target.value)}
                className="h-7 text-xs"
              />
              <Input
                placeholder="Artist name"
                value={track.artist}
                onChange={(e) => handleTrackUpdate(track.id, 'artist', e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {/* Quick toggles */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 flex-1">
          <Switch
            checked={(currentContent.looping as boolean) ?? false}
            onCheckedChange={(v) => onContentChange({ looping: v })}
            className="scale-75 origin-left"
          />
          <span className="text-[10px] text-muted-foreground">Loop</span>
        </label>
        <label className="flex items-center gap-1 flex-1">
          <Switch
            checked={(currentContent.autoplay as boolean) ?? false}
            onCheckedChange={(v) => onContentChange({ autoplay: v })}
            className="scale-75 origin-left"
          />
          <span className="text-[10px] text-muted-foreground">Autoplay</span>
        </label>
      </div>
    </div>
  )
}
