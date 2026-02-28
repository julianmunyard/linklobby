"use client"

import { useState, useCallback, useRef } from "react"
import { Palette, Sparkles, Image, User, Frame, Moon, Pipette } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ColorPicker } from "@/components/ui/color-picker"
import { useThemeStore } from "@/stores/theme-store"
import { useProfileStore } from "@/stores/profile-store"
import { getTheme } from "@/lib/themes"
import { cn } from "@/lib/utils"
import type { ProfileLayout } from "@/types/profile"
import type { BackgroundConfig } from "@/types/theme"

interface MobileQuickSettingsProps {
  onOpenFullSettings: (subTab: string) => void
  onQuickSettingsOpen?: () => void
}

export function MobileQuickSettings({ onOpenFullSettings, onQuickSettingsOpen }: MobileQuickSettingsProps) {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)

  const handleButtonClick = (drawer: string) => {
    if (activeDrawer === drawer) {
      setActiveDrawer(null)
    } else {
      setActiveDrawer(drawer)
      // Notify parent so it can close other panels (e.g. card type drawer)
      onQuickSettingsOpen?.()
    }
  }

  const handleFullSettingsClick = (subTab: string) => {
    setActiveDrawer(null)
    onOpenFullSettings(subTab)
  }

  // Theme store
  const themeId = useThemeStore((state) => state.themeId)
  const colors = useThemeStore((state) => state.colors)
  const setColor = useThemeStore((state) => state.setColor)
  const setPalette = useThemeStore((state) => state.setPalette)
  const resetToThemeDefaults = useThemeStore((state) => state.resetToThemeDefaults)
  const style = useThemeStore((state) => state.style)
  const setStyle = useThemeStore((state) => state.setStyle)
  const background = useThemeStore((state) => state.background)
  const setBackground = useThemeStore((state) => state.setBackground)
  const macPattern = useThemeStore((state) => state.macPattern)
  const macPatternColor = useThemeStore((state) => state.macPatternColor)
  const setMacPattern = useThemeStore((state) => state.setMacPattern)
  const setMacPatternColor = useThemeStore((state) => state.setMacPatternColor)

  // Profile store
  const displayName = useProfileStore((state) => state.displayName)
  const setDisplayName = useProfileStore((state) => state.setDisplayName)
  const bio = useProfileStore((state) => state.bio)
  const setBio = useProfileStore((state) => state.setBio)
  const profileLayout = useProfileStore((state) => state.profileLayout)
  const setProfileLayout = useProfileStore((state) => state.setProfileLayout)

  const theme = getTheme(themeId)

  // List layout themes don't support style controls
  const LIST_LAYOUT_THEMES = ['vcr-menu', 'ipod-classic', 'receipt']
  const showStyleControls = !LIST_LAYOUT_THEMES.includes(themeId)

  return (
    <>
      {/* Quick access buttons bar */}
      <div className="bg-background border-b p-2 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 w-max min-w-full">
          <button
            onClick={() => handleButtonClick('color')}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
              activeDrawer === 'color'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Palette className="h-4 w-4" />
            Color
          </button>
          <button
            onClick={() => handleFullSettingsClick('style')}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
              "bg-muted text-muted-foreground"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Style
          </button>
          <button
            onClick={() => handleButtonClick('background')}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
              activeDrawer === 'background'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Image className="h-4 w-4" />
            Background
          </button>
          <button
            onClick={() => handleButtonClick('header')}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
              activeDrawer === 'header'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <User className="h-4 w-4" />
            Header
          </button>
        </div>
      </div>

      {/* Color Drawer */}
      <Drawer
        open={activeDrawer === 'color'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
        modal={false}
      >
        <DrawerContent className="h-[50dvh] max-h-[50dvh] flex flex-col">
          <DrawerHeader className="border-b px-4 py-3">
            <DrawerTitle>Color Settings</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto touch-pan-y p-4 space-y-4">
            {/* Palette presets */}
            {theme && theme.palettes.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-2">Palettes</h5>
                <div className="flex flex-wrap gap-2">
                  {theme.palettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => setPalette(palette.id)}
                      className="relative flex gap-0.5 h-8 w-20 rounded overflow-hidden border-2 transition-all border-transparent hover:border-muted"
                      title={palette.name}
                    >
                      {Object.values(palette.colors).slice(0, 4).map((color, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color pickers in 2-column grid */}
            <div>
              <h5 className="text-xs font-medium text-muted-foreground mb-2">Colors</h5>
              <div className="grid grid-cols-2 gap-3">
                <ColorPicker
                  label="Background"
                  color={colors.background}
                  onChange={(v) => setColor('background', v)}
                />
                <ColorPicker
                  label="Card"
                  color={colors.cardBg}
                  onChange={(v) => setColor('cardBg', v)}
                />
                <ColorPicker
                  label="Text"
                  color={colors.text}
                  onChange={(v) => setColor('text', v)}
                />
                <ColorPicker
                  label="Accent"
                  color={colors.accent}
                  onChange={(v) => setColor('accent', v)}
                />
                <ColorPicker
                  label="Border"
                  color={colors.border}
                  onChange={(v) => setColor('border', v)}
                />
                <ColorPicker
                  label="Link"
                  color={colors.link}
                  onChange={(v) => setColor('link', v)}
                />
              </div>
            </div>

            {/* Reset button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToThemeDefaults}
              className="w-full"
            >
              Reset to Default
            </Button>

            {/* Full settings button */}
            <Button
              variant="outline"
              onClick={() => handleFullSettingsClick('colors')}
              className="w-full"
            >
              Full Color Settings
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Style Drawer */}
      <Drawer
        open={activeDrawer === 'style'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
        modal={false}
      >
        <DrawerContent className="h-[50dvh] max-h-[50dvh] flex flex-col">
          <DrawerHeader className="border-b px-4 py-3">
            <DrawerTitle>Style Settings</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto touch-pan-y p-4 space-y-4">
            {showStyleControls ? (
              <>
                {/* Border Radius */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Border Radius</Label>
                    <span className="text-xs text-muted-foreground">{style.borderRadius}px</span>
                  </div>
                  <Slider
                    value={[style.borderRadius]}
                    onValueChange={([value]) => setStyle('borderRadius', value)}
                    min={0}
                    max={32}
                    step={2}
                  />
                </div>

                {/* Full settings button */}
                <Button
                  variant="outline"
                  onClick={() => handleFullSettingsClick('style')}
                  className="w-full"
                >
                  Full Style Settings
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Style settings not available for this theme
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleFullSettingsClick('style')}
                  className="w-full"
                >
                  Full Style Settings
                </Button>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Background Drawer */}
      <Drawer
        open={activeDrawer === 'background'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
        modal={false}
      >
        <DrawerContent className="h-[50dvh] max-h-[50dvh] flex flex-col">
          <DrawerHeader className="border-b px-4 py-3">
            <DrawerTitle>Background Settings</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto touch-pan-y p-4 space-y-4">
            {/* Macintosh theme: desktop pattern */}
            {themeId === 'macintosh' ? (
              <>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Desktop Pattern</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { id: '', label: 'Default', path: '', preview: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0 / 4px 4px' },
                      { id: 'pattern-1', label: 'Checker', path: '/images/mac-patterns/pattern-1.png' },
                      { id: 'pattern-2', label: 'Cross', path: '/images/mac-patterns/pattern-2.png' },
                      { id: 'pattern-3', label: 'Grid', path: '/images/mac-patterns/pattern-3.png' },
                      { id: 'pattern-4', label: 'Scale', path: '/images/mac-patterns/pattern-4.png' },
                      { id: 'pattern-5', label: 'Micro', path: '/images/mac-patterns/pattern-5.png' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setMacPattern(opt.path)}
                        className={cn(
                          "aspect-square rounded border-2 overflow-hidden transition-all",
                          macPattern === opt.path
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-muted-foreground"
                        )}
                        title={opt.label}
                      >
                        {opt.path ? (
                          <img
                            src={opt.path}
                            alt={opt.label}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <div className="w-full h-full" style={{ background: opt.preview }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <ColorPicker
                  label="Background Color"
                  color={macPatternColor}
                  onChange={setMacPatternColor}
                />
              </>
            ) : (
              <>
                {/* Standard themes: background type selector */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-2 block">Type</Label>
                  <ToggleGroup
                    type="single"
                    value={background.type}
                    onValueChange={(value) => {
                      if (!value) return
                      if (value === 'solid') {
                        setBackground({ ...background, type: 'solid', value: background.type === 'solid' ? background.value : colors.background })
                      } else if (value === 'image') {
                        setBackground({ ...background, type: 'image', value: background.type === 'image' ? background.value : '' })
                      } else if (value === 'video') {
                        setBackground({ ...background, type: 'video', value: background.type === 'video' ? background.value : '' })
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="solid" className="text-xs">Solid</ToggleGroupItem>
                    <ToggleGroupItem value="image" className="text-xs">Image</ToggleGroupItem>
                    <ToggleGroupItem value="video" className="text-xs">Video</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {background.type === 'solid' && (
                  <ColorPicker
                    label="Background Color"
                    color={background.value}
                    onChange={(value) => setBackground({ ...background, type: 'solid', value })}
                  />
                )}

                {background.type === 'image' && (
                  <p className="text-xs text-muted-foreground">
                    Use full settings to upload a background image
                  </p>
                )}

                {background.type === 'video' && (
                  <p className="text-xs text-muted-foreground">
                    Use full settings to upload a background video
                  </p>
                )}
              </>
            )}

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Frame Overlay */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Frame className="w-3.5 h-3.5 text-muted-foreground" />
                <Label className="text-xs font-medium text-muted-foreground">Frame Overlay</Label>
              </div>
              <div className="flex gap-2">
                {[
                  { id: '', label: 'None', path: '' },
                  { id: 'awge-tv', label: 'AWGE TV', path: '/frames/awge-tv.png' },
                ].map((frame) => (
                  <Button
                    key={frame.id}
                    variant={background.frameOverlay === frame.path || (!background.frameOverlay && !frame.path) ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setBackground({
                      ...background,
                      frameOverlay: frame.path || undefined,
                      ...(frame.path
                        ? { frameFitContent: true }
                        : { frameZoom: undefined, framePositionX: undefined, framePositionY: undefined, frameFitContent: undefined })
                    })}
                  >
                    {frame.label}
                  </Button>
                ))}
              </div>
              {background.frameOverlay && (
                <div className="space-y-3 pl-3 border-l-2 border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Fit Content</Label>
                    <Switch
                      checked={background.frameFitContent ?? true}
                      onCheckedChange={(checked) => setBackground({ ...background, frameFitContent: checked })}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Zoom</span><span>{(background.frameZoom ?? 1).toFixed(2)}x</span>
                    </div>
                    <Slider value={[background.frameZoom ?? 1]} onValueChange={([v]) => setBackground({ ...background, frameZoom: v })} min={0.5} max={2} step={0.05} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Position X</span><span>{background.framePositionX ?? 0}%</span>
                    </div>
                    <Slider value={[background.framePositionX ?? 0]} onValueChange={([v]) => setBackground({ ...background, framePositionX: v })} min={-50} max={50} step={1} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Position Y</span><span>{background.framePositionY ?? 0}%</span>
                    </div>
                    <Slider value={[background.framePositionY ?? 0]} onValueChange={([v]) => setBackground({ ...background, framePositionY: v })} min={-50} max={50} step={1} />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Noise Overlay */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                  <Label className="text-xs font-medium text-muted-foreground">Noise</Label>
                </div>
                <Switch
                  checked={background.noiseOverlay ?? false}
                  onCheckedChange={(checked) => setBackground({ ...background, noiseOverlay: checked })}
                />
              </div>
              {background.noiseOverlay && (
                <div className="space-y-1 pl-3 border-l-2 border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Intensity</span><span>{background.noiseIntensity ?? 15}%</span>
                  </div>
                  <Slider value={[background.noiseIntensity ?? 15]} onValueChange={([v]) => setBackground({ ...background, noiseIntensity: v })} min={5} max={50} step={1} />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Dim Overlay */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-muted-foreground" />
                  <Label className="text-xs font-medium text-muted-foreground">Dim</Label>
                </div>
                <Switch
                  checked={background.dimOverlay ?? false}
                  onCheckedChange={(checked) => setBackground({ ...background, dimOverlay: checked })}
                />
              </div>
              {background.dimOverlay && (
                <div className="space-y-1 pl-3 border-l-2 border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Intensity</span><span>{background.dimIntensity ?? 40}%</span>
                  </div>
                  <Slider value={[background.dimIntensity ?? 40]} onValueChange={([v]) => setBackground({ ...background, dimIntensity: v })} min={10} max={80} step={5} />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Status bar color — with image sampler */}
            <StatusBarColorSection background={background} setBackground={setBackground} />

            {/* Full settings button */}
            <Button
              variant="outline"
              onClick={() => handleFullSettingsClick('background')}
              className="w-full"
            >
              Full Background Settings
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Header Drawer */}
      <Drawer
        open={activeDrawer === 'header'}
        onOpenChange={(open) => !open && setActiveDrawer(null)}
        modal={false}
      >
        <DrawerContent className="h-[50dvh] max-h-[50dvh] flex flex-col">
          <DrawerHeader className="border-b px-4 py-3">
            <DrawerTitle>Header Settings</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto touch-pan-y p-4 space-y-4">
            {/* Display name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Display Name</Label>
              <Input
                value={displayName || ''}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea
                value={bio || ''}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your audience about yourself..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Full settings button */}
            <Button
              variant="outline"
              onClick={() => handleFullSettingsClick('header')}
              className="w-full"
            >
              Full Header Settings
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

/* Status bar color with mobile eyedropper */
function StatusBarColorSection({ background, setBackground }: { background: BackgroundConfig; setBackground: (bg: BackgroundConfig) => void }) {
  const [samplerOpen, setSamplerOpen] = useState(false)
  const [samplerReady, setSamplerReady] = useState(false)
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hasBgImage = (background.type === 'image' || background.type === 'video') && background.value

  // Open sampler: fetch image as blob → draw to canvas (avoids CORS)
  const openSampler = useCallback(async () => {
    if (!background.value) return
    setSamplerOpen(true)
    setSamplerReady(false)
    setPreviewColor(null)
    setPreviewPos(null)

    try {
      const res = await fetch(background.value)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      const img = new window.Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) { URL.revokeObjectURL(blobUrl); return }

        // Draw at viewport size with object-cover logic so touch coords map 1:1
        const vw = window.innerWidth
        const vh = window.innerHeight
        const dpr = window.devicePixelRatio || 1
        canvas.width = vw * dpr
        canvas.height = vh * dpr
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(blobUrl); return }
        ctx.scale(dpr, dpr)

        // Replicate CSS object-cover: scale image to cover viewport, center it
        const imgAspect = img.naturalWidth / img.naturalHeight
        const viewAspect = vw / vh
        let dw: number, dh: number, dx: number, dy: number
        if (imgAspect > viewAspect) {
          // Image wider than viewport — match height, crop sides
          dh = vh
          dw = vh * imgAspect
          dx = (vw - dw) / 2
          dy = 0
        } else {
          // Image taller than viewport — match width, crop top/bottom
          dw = vw
          dh = vw / imgAspect
          dx = 0
          dy = (vh - dh) / 2
        }
        ctx.drawImage(img, dx, dy, dw, dh)

        URL.revokeObjectURL(blobUrl)
        setSamplerReady(true)
      }
      img.onerror = () => {
        URL.revokeObjectURL(blobUrl)
        setSamplerOpen(false)
      }
      img.src = blobUrl
    } catch {
      setSamplerOpen(false)
    }
  }, [background.value])

  // Sample pixel directly — canvas is viewport-sized so coords map 1:1
  const sampleAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const dpr = window.devicePixelRatio || 1
    const px = Math.floor(clientX * dpr)
    const py = Math.floor(clientY * dpr)
    if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) return null
    const d = ctx.getImageData(px, py, 1, 1).data
    return `#${d[0].toString(16).padStart(2, '0')}${d[1].toString(16).padStart(2, '0')}${d[2].toString(16).padStart(2, '0')}`
  }, [])

  // Store last sampled color in a ref so touchend always has the latest
  const lastColorRef = useRef<string | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!samplerReady) return
    const t = e.touches[0]
    const color = sampleAt(t.clientX, t.clientY)
    if (color) {
      lastColorRef.current = color
      setPreviewColor(color)
      setPreviewPos({ x: t.clientX, y: t.clientY })
    }
  }, [samplerReady, sampleAt])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!samplerReady) return
    e.preventDefault()
    const t = e.touches[0]
    const color = sampleAt(t.clientX, t.clientY)
    if (color) {
      lastColorRef.current = color
      setPreviewColor(color)
      setPreviewPos({ x: t.clientX, y: t.clientY })
    }
  }, [samplerReady, sampleAt])

  const handleTouchEnd = useCallback(() => {
    const color = lastColorRef.current
    if (color) {
      setBackground({ ...background, topBarColor: color })
    }
    setSamplerOpen(false)
    setPreviewColor(null)
    setPreviewPos(null)
    lastColorRef.current = null
  }, [background, setBackground])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!samplerReady) return
    const color = sampleAt(e.clientX, e.clientY)
    if (color) {
      setBackground({ ...background, topBarColor: color })
    }
    setSamplerOpen(false)
    setPreviewColor(null)
    setPreviewPos(null)
  }, [samplerReady, sampleAt, background, setBackground])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ColorPicker
          label="Status Bar Color"
          color={background.topBarColor || '#000000'}
          onChange={(color) => setBackground({ ...background, topBarColor: color })}
        />
        {hasBgImage && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 flex-shrink-0"
            onClick={openSampler}
            title="Pick from background"
          >
            <Pipette className="h-4 w-4" />
          </Button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {/* Full-screen sampler overlay */}
      {samplerOpen && (
        <div
          className="fixed inset-0 z-[100] touch-none"
          style={{ cursor: 'crosshair' }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Show the background image fullscreen so user sees what they're picking from */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={background.value}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Loading indicator */}
          {!samplerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white text-sm">Loading...</span>
            </div>
          )}

          {/* Instructions */}
          {samplerReady && !previewColor && (
            <div className="absolute top-12 left-0 right-0 flex justify-center pointer-events-none">
              <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                Tap or drag to pick a color
              </span>
            </div>
          )}

          {/* Cancel button */}
          <button
            className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-10"
            onClick={(e) => { e.stopPropagation(); setSamplerOpen(false); setPreviewColor(null); setPreviewPos(null) }}
          >
            Cancel
          </button>

          {/* Color preview circle following touch */}
          {previewColor && previewPos && (
            <div
              className="absolute pointer-events-none"
              style={{ left: previewPos.x - 28, top: previewPos.y - 72 }}
            >
              <div
                className="w-14 h-14 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: previewColor }}
              />
              <div className="text-[9px] text-white text-center mt-0.5 font-mono bg-black/60 rounded px-1">
                {previewColor}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
