"use client"

import { useState } from "react"
import { Palette, Sparkles, Image, User } from "lucide-react"
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

interface MobileQuickSettingsProps {
  onOpenFullSettings: (subTab: string) => void
}

export function MobileQuickSettings({ onOpenFullSettings }: MobileQuickSettingsProps) {
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null)

  const handleButtonClick = (drawer: string) => {
    if (activeDrawer === drawer) {
      setActiveDrawer(null)
    } else {
      setActiveDrawer(drawer)
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
            onClick={() => handleButtonClick('style')}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
              activeDrawer === 'style'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
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

                {/* Card Shadows */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Card Shadows</Label>
                    <p className="text-xs text-muted-foreground">Add depth to cards</p>
                  </div>
                  <Switch
                    checked={style.shadowEnabled}
                    onCheckedChange={(checked) => setStyle('shadowEnabled', checked)}
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
            {/* Background type selector */}
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
                <ToggleGroupItem value="solid" className="text-xs">
                  Solid
                </ToggleGroupItem>
                <ToggleGroupItem value="image" className="text-xs">
                  Image
                </ToggleGroupItem>
                <ToggleGroupItem value="video" className="text-xs">
                  Video
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Solid color picker */}
            {background.type === 'solid' && (
              <ColorPicker
                label="Background Color"
                color={background.value}
                onChange={(value) => setBackground({ ...background, type: 'solid', value })}
              />
            )}

            {/* Image upload message */}
            {background.type === 'image' && (
              <p className="text-sm text-muted-foreground">
                Use full settings to upload a background image
              </p>
            )}

            {/* Video upload message */}
            {background.type === 'video' && (
              <p className="text-sm text-muted-foreground">
                Use full settings to upload a background video
              </p>
            )}

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

            {/* Profile layout */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Layout</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={profileLayout}
                onValueChange={(v) => v && setProfileLayout(v as ProfileLayout)}
                className="justify-start"
              >
                <ToggleGroupItem value="classic">Classic</ToggleGroupItem>
                <ToggleGroupItem value="hero">Hero</ToggleGroupItem>
              </ToggleGroup>
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
