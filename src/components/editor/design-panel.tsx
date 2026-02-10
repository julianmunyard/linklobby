'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { Camera, User, Upload, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
// ScrollArea/ScrollBar removed — native overflow-x-auto used for touch swipe
import { ThemePresets } from './theme-presets'
import { ColorCustomizer } from './color-customizer'
import { FontPicker } from './font-picker'
import { StyleControls } from './style-controls'
import { BackgroundControls } from './background-controls'
import { SocialIconsEditor } from './social-icons-editor'
import { SocialIconPicker } from './social-icon-picker'
import { ImageCropDialog } from '@/components/shared/image-crop-dialog'
import { ColorPicker } from '@/components/ui/color-picker'
import { useProfileStore } from '@/stores/profile-store'
import { useThemeStore } from '@/stores/theme-store'
import { uploadProfileImage, type ProfileImageType } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { TitleSize, ProfileLayout } from '@/types/profile'
import type { ThemeId } from '@/types/theme'

const TABS = [
  { id: 'presets', label: 'Presets' },
  { id: 'colors', label: 'Colors' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'background', label: 'Background' },
  { id: 'style', label: 'Style' },
  { id: 'header', label: 'Header' },
] as const

type TabId = typeof TABS[number]['id']

// Themes with fixed fonts where the Fonts tab should be hidden
const FIXED_FONT_THEMES: ThemeId[] = ['vcr-menu', 'ipod-classic', 'receipt']

interface DesignPanelProps {
  initialSubTab?: string | null
}

export function DesignPanel({ initialSubTab }: DesignPanelProps = {}) {
  const [activeTab, setActiveTab] = useState<TabId>('presets')

  // Watch for initialSubTab changes and switch to that tab
  useEffect(() => {
    if (initialSubTab && TABS.some(t => t.id === initialSubTab)) {
      setActiveTab(initialSubTab as TabId)
    }
  }, [initialSubTab])

  // Theme store for current theme
  const themeId = useThemeStore((state) => state.themeId)

  // Compute visible tabs based on theme
  const visibleTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (tab.id === 'fonts' && FIXED_FONT_THEMES.includes(themeId)) {
        return false
      }
      return true
    })
  }, [themeId])

  // Profile store state
  const displayName = useProfileStore((state) => state.displayName)
  const bio = useProfileStore((state) => state.bio)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const avatarFeather = useProfileStore((state) => state.avatarFeather)
  const showAvatar = useProfileStore((state) => state.showAvatar)
  const showTitle = useProfileStore((state) => state.showTitle)
  const titleSize = useProfileStore((state) => state.titleSize)
  const showLogo = useProfileStore((state) => state.showLogo)
  const logoUrl = useProfileStore((state) => state.logoUrl)
  const logoScale = useProfileStore((state) => state.logoScale)
  const profileLayout = useProfileStore((state) => state.profileLayout)
  const showSocialIcons = useProfileStore((state) => state.showSocialIcons)
  const headerTextColor = useProfileStore((state) => state.headerTextColor)

  // Profile store actions
  const setDisplayName = useProfileStore((state) => state.setDisplayName)
  const setBio = useProfileStore((state) => state.setBio)
  const setAvatarUrl = useProfileStore((state) => state.setAvatarUrl)
  const setAvatarFeather = useProfileStore((state) => state.setAvatarFeather)
  const setShowAvatar = useProfileStore((state) => state.setShowAvatar)
  const setShowTitle = useProfileStore((state) => state.setShowTitle)
  const setTitleSize = useProfileStore((state) => state.setTitleSize)
  const setShowLogo = useProfileStore((state) => state.setShowLogo)
  const setLogoUrl = useProfileStore((state) => state.setLogoUrl)
  const setLogoScale = useProfileStore((state) => state.setLogoScale)
  const setProfileLayout = useProfileStore((state) => state.setProfileLayout)
  const setShowSocialIcons = useProfileStore((state) => state.setShowSocialIcons)
  const setHeaderTextColor = useProfileStore((state) => state.setHeaderTextColor)

  // Theme store for default text color
  const themeTextColor = useThemeStore((state) => state.colors.text)

  // Image upload state
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageType, setImageType] = useState<ProfileImageType>('avatar')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setImageType('avatar')
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setImageType('logo')
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUploadError('Not authenticated')
        return
      }
      const result = await uploadProfileImage(croppedBlob, user.id, imageType)
      if (imageType === 'avatar') {
        setAvatarUrl(result.url)
      } else {
        setLogoUrl(result.url)
      }
    } catch (error) {
      console.error('Failed to upload:', error)
      setUploadError('Upload failed. Try again.')
    } finally {
      setIsUploading(false)
      setSelectedImage(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Horizontal scrollable tabs - native overflow for touch swipe support */}
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
        <div className="flex gap-2 pb-2 w-max">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'presets' && <ThemePresets />}

        {activeTab === 'colors' && <ColorCustomizer />}

        {activeTab === 'fonts' && <FontPicker />}

        {activeTab === 'background' && <BackgroundControls />}

        {activeTab === 'style' && <StyleControls />}

        {activeTab === 'header' && (
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Profile Photo</Label>
                <Switch checked={showAvatar} onCheckedChange={setShowAvatar} />
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading && imageType === 'avatar' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
              </div>
              {showAvatar && avatarUrl && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Edge Feather</span>
                    <span>{avatarFeather}%</span>
                  </div>
                  <Slider value={[avatarFeather]} onValueChange={(v) => setAvatarFeather(v[0])} min={0} max={100} step={5} />
                </div>
              )}
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Layout</Label>
              <ToggleGroup type="single" variant="outline" value={profileLayout} onValueChange={(v) => v && setProfileLayout(v as ProfileLayout)} className="justify-start">
                <ToggleGroupItem value="classic">Classic</ToggleGroupItem>
                <ToggleGroupItem value="hero">Hero</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Display Name</Label>
                <Switch checked={showTitle} onCheckedChange={setShowTitle} />
              </div>
              <Input value={displayName || ''} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
              {showTitle && (
                <ToggleGroup type="single" variant="outline" value={titleSize} onValueChange={(v) => v && setTitleSize(v as TitleSize)} className="justify-start">
                  <ToggleGroupItem value="small">Small</ToggleGroupItem>
                  <ToggleGroupItem value="large">Large</ToggleGroupItem>
                </ToggleGroup>
              )}
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Logo</Label>
                <Switch checked={showLogo} onCheckedChange={setShowLogo} />
              </div>
              {logoUrl ? (
                <div className="relative inline-block">
                  <img src={logoUrl} alt="Logo" className="h-12 max-w-[150px] object-contain" />
                  <Button size="icon" variant="secondary" className="absolute -top-1 -right-1 h-6 w-6 rounded-full" onClick={() => logoInputRef.current?.click()} disabled={isUploading}>
                    {isUploading && imageType === 'logo' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={isUploading}>
                  {isUploading && imageType === 'logo' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Logo
                </Button>
              )}
              <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoFileSelect} className="hidden" />
              {logoUrl && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Logo Size</span>
                    <span>{logoScale}%</span>
                  </div>
                  <Slider value={[logoScale]} onValueChange={(v) => setLogoScale(v[0])} min={50} max={300} step={10} />
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea value={bio || ''} onChange={(e) => setBio(e.target.value)} placeholder="Tell your audience about yourself..." rows={2} className="resize-none" />
            </div>

            {/* Header Text Color */}
            <div className="space-y-2">
              <ColorPicker
                color={headerTextColor || themeTextColor}
                onChange={setHeaderTextColor}
                label="Text Color"
              />
              {headerTextColor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHeaderTextColor(null)}
                  className="text-xs text-muted-foreground"
                >
                  Reset to theme default
                </Button>
              )}
            </div>

            {/* Social Icons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Social Icons</Label>
                <Switch checked={showSocialIcons} onCheckedChange={setShowSocialIcons} />
              </div>
              {showSocialIcons && (
                <div className="space-y-2">
                  <SocialIconsEditor />
                  <SocialIconPicker>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Icon
                    </Button>
                  </SocialIconPicker>
                </div>
              )}
            </div>

            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          </div>
        )}
      </div>

      {/* Image Crop Dialog */}
      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          initialAspect={imageType === 'avatar' ? 1 : undefined}
          outputFormat={imageType === 'logo' ? 'image/png' : 'image/jpeg'}
        />
      )}
    </div>
  )
}
