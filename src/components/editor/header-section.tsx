"use client"

import { useState, useRef } from "react"
import { Camera, User, Upload, Plus, Loader2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useProfileStore } from "@/stores/profile-store"
import { SocialIconsEditor } from "./social-icons-editor"
import { SocialIconPicker } from "./social-icon-picker"
import { ImageCropDialog } from "@/components/shared/image-crop-dialog"
import { uploadProfileImage, type ProfileImageType } from "@/lib/supabase/storage"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { TitleSize, ProfileLayout } from "@/types/profile"

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  toggle?: React.ReactNode
}

function CollapsibleSection({ title, defaultOpen = false, children, toggle }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 text-sm font-medium hover:text-foreground/80 transition-colors">
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
            {title}
          </button>
        </CollapsibleTrigger>
        {toggle}
      </div>
      <CollapsibleContent className="pt-3 space-y-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export function HeaderSection() {
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

  // Local state for crop dialog
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imageType, setImageType] = useState<ProfileImageType>("avatar")
  const [uploadError, setUploadError] = useState<string | null>(null)

  // File input refs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection for avatar
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setImageType("avatar")
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Handle file selection for logo
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setImageType("logo")
      setCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  // Handle crop completion
  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setUploadError("Not authenticated. Please sign in again.")
        return
      }

      const result = await uploadProfileImage(croppedBlob, user.id, imageType)

      if (imageType === "avatar") {
        setAvatarUrl(result.url)
      } else {
        setLogoUrl(result.url)
      }
    } catch (error) {
      console.error("Failed to upload image:", error)
      setUploadError("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
      setSelectedImage(null)
    }
  }

  const [headerOpen, setHeaderOpen] = useState(true)

  return (
    <section>
      <Collapsible open={headerOpen} onOpenChange={setHeaderOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full border-b pb-2 mb-4">
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                headerOpen && "rotate-180"
              )}
            />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Header
            </h2>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          {/* Profile Photo */}
          <CollapsibleSection
        title="Profile Photo"
        defaultOpen={true}
        toggle={
          <Switch
            id="show-avatar"
            checked={showAvatar}
            onCheckedChange={setShowAvatar}
          />
        }
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading && imageType === "avatar" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />
        </div>
        {uploadError && imageType === "avatar" && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}

        {showAvatar && avatarUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Edge Feather</Label>
              <span className="text-xs text-muted-foreground">{avatarFeather}%</span>
            </div>
            <Slider
              value={[avatarFeather]}
              onValueChange={(value) => setAvatarFeather(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Layout */}
      <CollapsibleSection title="Layout" defaultOpen={true}>
        <ToggleGroup
          type="single"
          variant="outline"
          value={profileLayout}
          onValueChange={(value) => {
            if (value) setProfileLayout(value as ProfileLayout)
          }}
          className="justify-start"
        >
          <ToggleGroupItem value="classic" aria-label="Classic layout">
            Classic
          </ToggleGroupItem>
          <ToggleGroupItem value="hero" aria-label="Hero layout">
            Hero
          </ToggleGroupItem>
        </ToggleGroup>
      </CollapsibleSection>

      {/* Display Name / Title */}
      <CollapsibleSection
        title="Display Name"
        defaultOpen={true}
        toggle={
          <Switch
            id="show-title"
            checked={showTitle}
            onCheckedChange={setShowTitle}
          />
        }
      >
        <Input
          id="display-name"
          value={displayName || ""}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
        />
        {showTitle && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Title Size</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={titleSize}
              onValueChange={(value) => {
                if (value) setTitleSize(value as TitleSize)
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="small" aria-label="Small title">
                Small
              </ToggleGroupItem>
              <ToggleGroupItem value="large" aria-label="Large title">
                Large
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </CollapsibleSection>

      {/* Logo */}
      <CollapsibleSection
        title="Logo"
        defaultOpen={false}
        toggle={
          <Switch
            id="show-logo"
            checked={showLogo}
            onCheckedChange={setShowLogo}
          />
        }
      >
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Logo"
                className="h-16 max-w-[200px] object-contain bg-transparent"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading && imageType === "logo" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading && imageType === "logo" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload Logo
            </Button>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoFileSelect}
            className="hidden"
          />
        </div>
        {uploadError && imageType === "logo" && (
          <p className="text-xs text-destructive">{uploadError}</p>
        )}

        {logoUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Logo Size</Label>
              <span className="text-xs text-muted-foreground">{logoScale}%</span>
            </div>
            <Slider
              value={[logoScale]}
              onValueChange={(value) => setLogoScale(value[0])}
              min={50}
              max={300}
              step={10}
              className="w-full"
            />
          </div>
        )}
      </CollapsibleSection>

      {/* Bio */}
      <CollapsibleSection title="Bio" defaultOpen={false}>
        <Textarea
          id="bio"
          value={bio || ""}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your audience about yourself..."
          rows={3}
          className="resize-none"
        />
      </CollapsibleSection>

      {/* Social Icons */}
      <CollapsibleSection
        title="Social Icons"
        defaultOpen={false}
        toggle={
          <Switch
            id="show-social-icons"
            checked={showSocialIcons}
            onCheckedChange={setShowSocialIcons}
          />
        }
      >
        <p className="text-xs text-muted-foreground">
          Icons appear in your page header
        </p>

        {showSocialIcons && (
          <div className="space-y-3">
            <SocialIconsEditor />

            <SocialIconPicker>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Social Icon
              </Button>
            </SocialIconPicker>
          </div>
        )}
          </CollapsibleSection>
        </CollapsibleContent>
      </Collapsible>

      {/* Image Crop Dialog */}
      {selectedImage && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          initialAspect={imageType === "avatar" ? 1 : undefined}
        />
      )}
    </section>
  )
}
