"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Pencil, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { validateAndFixUrl } from "@/lib/url-validation"
import { toast } from "sonner"
import { CARD_TYPES_NO_IMAGE, CARD_TYPE_SIZING } from "@/types/card"
import type { Card, CardType, CardSize, TextAlign, VerticalAlign } from "@/types/card"
import type { CardTypeFontSizes } from "@/types/theme"

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
  const cardTypeFontSizes = useThemeStore((state) => state.cardTypeFontSizes)
  const setCardTypeFontSize = useThemeStore((state) => state.setCardTypeFontSize)
  const [activeTab, setActiveTab] = useState(0)

  const currentContent = (card?.content || {}) as Record<string, unknown>
  const macWindowStyle = currentContent.macWindowStyle as string | undefined
  const isMacCard = !!macWindowStyle
  const isConvertible = card ? (!isMacCard && isConvertibleType(card.card_type)) : false

  const hasImage = card ? !CARD_TYPES_NO_IMAGE.includes(card.card_type) && !isMacCard : false

  const tabs: TabDef[] = (() => {
    const t: TabDef[] = [{ key: 'type', label: 'Type' }]
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
    const result = validateAndFixUrl(e.target.value)
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
  // Check if touch started on a slider (only sliders need swipe blocking — they use horizontal drag)
  const isSliderTarget = useCallback((target: EventTarget | null) => {
    let el = target as HTMLElement | null
    while (el) {
      if (el.getAttribute('role') === 'slider' || el.dataset.radixSlider !== undefined) return true
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
        const pct = (dx / track.parentElement!.offsetWidth) * 100
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
      track.style.transition = ''
    }
    if (isDragging.current && Math.abs(dragOffset.current) > 40) {
      if (dragOffset.current < 0) {
        setActiveTab((prev) => Math.min(prev + 1, tabs.length - 1))
      } else {
        setActiveTab((prev) => Math.max(prev - 1, 0))
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

            {/* Swipeable pane area — translateX for smooth sliding */}
            {card && (
              <div
                className="overflow-x-clip pt-0.5"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  ref={trackRef}
                  className="flex transition-transform duration-300 ease-out items-start"
                  style={{ transform: `translateX(-${activeTab * 100}%)` }}
                >
                  {tabs.map((tab) => (
                    <div
                      key={tab.key}
                      className="min-w-full flex-shrink-0 px-0.5"
                    >
                      {/* ---- Type ---- */}
                      {tab.key === 'type' && (
                        <div className="space-y-1.5">
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
                        </div>
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
