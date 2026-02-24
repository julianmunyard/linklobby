'use client'

import { useState, useRef } from 'react'
import { useThemeStore } from '@/stores/theme-store'
import { getTheme } from '@/lib/themes'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Upload, Loader2 } from 'lucide-react'
import { usePageStore } from '@/stores/page-store'
import type { ThemeId } from '@/types/theme'
import { isScatterTheme } from '@/types/scatter'

// Themes with list-based layouts where card style controls (border radius, shadows) don't apply
const LIST_LAYOUT_THEMES: ThemeId[] = ['vcr-menu', 'ipod-classic', 'receipt', 'phone-home']

// Available stickers for receipt theme
const RECEIPT_STICKERS = [
  { id: 'special-tag', src: '/images/stickers/special-tag.jpeg', label: 'Special' },
  { id: 'price-tag-1', src: '/images/stickers/price-tag-1.jpeg', label: 'Price Tag 1' },
  { id: 'price-tag-2', src: '/images/stickers/price-tag-2.jpeg', label: 'Price Tag 2' },
  { id: 'cleared-stamp', src: '/images/stickers/cleared-stamp.jpeg', label: 'Cleared' },
  { id: 'handle-w-care', src: '/images/stickers/handle-w-care.png', label: 'Handle W Care' },
  { id: 'ladybug', src: '/images/stickers/ladybug.png', label: 'Ladybug' },
  { id: 'mexicans', src: '/images/stickers/mexicans.png', label: 'Mexicans' },
  { id: 'mf-doom', src: '/images/stickers/mf-doom.png', label: 'MF DOOM' },
  { id: 'musiq', src: '/images/stickers/musiq.png', label: 'Musiq' },
  { id: 'no-sub', src: '/images/stickers/no-sub.png', label: 'No Sub' },
  { id: 'nyc', src: '/images/stickers/nyc.png', label: 'NYC' },
  { id: 'pink', src: '/images/stickers/pink.png', label: 'Pink' },
  { id: 'dc-globe', src: '/images/stickers/dc-globe.png', label: 'Globe' },
]

// Available textures for iPod theme
const IPOD_TEXTURES = [
  { id: 'chrome', src: '/images/metal-texture.jpeg', label: 'Chrome' },
  { id: 'rusty', src: '/images/ipod-texture-rusty.jpeg', label: 'Rusty' },
  { id: 'scratched', src: '/images/ipod-texture-scratched.jpeg', label: 'Scratched' },
  { id: 'military', src: '/images/ipod-texture-military.jpeg', label: 'Military' },
  { id: 'redpaint', src: '/images/ipod-texture-redpaint.jpeg', label: 'Red Paint' },
  { id: 'none', src: '', label: 'None' },
]

// Basic card-layout themes that support centering
const BASIC_THEMES: ThemeId[] = ['mac-os', 'instagram-reels', 'system-settings']

export function StyleControls() {
  const { themeId, style, setStyle, centerCards, setCenterCards, vcrCenterContent, setVcrCenterContent, receiptPrice, setReceiptPrice, receiptStickers, addReceiptSticker, updateReceiptSticker, removeReceiptSticker, receiptFloatAnimation, setReceiptFloatAnimation, receiptPaperTexture, setReceiptPaperTexture, ipodStickers, addIpodSticker, updateIpodSticker, removeIpodSticker, ipodTexture, setIpodTexture, phoneHomeShowDock, setPhoneHomeShowDock, phoneHomeDockTranslucent, setPhoneHomeDockTranslucent, phoneHomeVariant, setPhoneHomeVariant, phoneHomeDock, removeFromDock, scatterMode, setScatterMode, visitorDrag, setVisitorDrag, zineShowDoodles, setZineShowDoodles, artifactMarqueeText, setArtifactMarqueeText, artifactHeaderTopLeft, setArtifactHeaderTopLeft, artifactHeaderTopCenter, setArtifactHeaderTopCenter, artifactHeaderTopRight, setArtifactHeaderTopRight, artifactHeaderBottomLeft, setArtifactHeaderBottomLeft, artifactHeaderBottomCenter, setArtifactHeaderBottomCenter, artifactHeaderBottomRight, setArtifactHeaderBottomRight, artifactShowHeaderMeta, setArtifactShowHeaderMeta, artifactHeroOverlay, setArtifactHeroOverlay, artifactHeroMediaType, setArtifactHeroMediaType, artifactHeroImageUrl, setArtifactHeroImageUrl, artifactHeroVideoUrl, setArtifactHeroVideoUrl, artifactHeroPositionX, setArtifactHeroPositionX, artifactHeroPositionY, setArtifactHeroPositionY } = useThemeStore()
  const cards = usePageStore((s) => s.cards)
  const theme = getTheme(themeId)
  const [stickerUploading, setStickerUploading] = useState<'receipt' | 'ipod' | null>(null)
  const receiptStickerInputRef = useRef<HTMLInputElement>(null)
  const ipodStickerInputRef = useRef<HTMLInputElement>(null)

  const handleStickerUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'receipt' | 'ipod') => {
    const file = e.target.files?.[0]
    if (!file) return

    setStickerUploading(target)
    try {
      const { uploadStickerImage } = await import('@/lib/storage')
      const url = await uploadStickerImage(file)
      const sticker = {
        id: `custom-${Date.now()}`,
        src: url,
        x: 50 + Math.random() * 20 - 10,
        y: 30 + Math.random() * 20 - 10,
        rotation: Math.random() * 30 - 15,
        scale: 0.8 + Math.random() * 0.4,
        behindText: false,
      }
      if (target === 'receipt') {
        addReceiptSticker(sticker)
      } else {
        addIpodSticker(sticker)
      }
    } catch (error) {
      console.error('Sticker upload failed:', error)
    } finally {
      setStickerUploading(null)
      if (target === 'receipt' && receiptStickerInputRef.current) receiptStickerInputRef.current.value = ''
      if (target === 'ipod' && ipodStickerInputRef.current) ipodStickerInputRef.current.value = ''
    }
  }

  // Hide card style controls for list-layout themes
  const showCardStyleControls = !LIST_LAYOUT_THEMES.includes(themeId)

  return (
    <div className="space-y-5">
      {/* Scatter Mode Toggle - only for themes that support scatter layouts */}
      {isScatterTheme(themeId) && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Freeform Layout</Label>
              <p className="text-xs text-muted-foreground">Position cards freely on canvas</p>
            </div>
            <Switch
              checked={scatterMode}
              onCheckedChange={(checked) => {
                setScatterMode(checked)
                if (checked) {
                  // Initialize scatter layout on the editor's page store
                  // so cards get scatterLayouts before being sent to preview
                  usePageStore.getState().initializeScatterLayout(themeId)
                }
              }}
            />
          </div>

          {/* Visitor Drag sub-toggle - appears when scatter mode is enabled */}
          {scatterMode && (
            <div className="flex items-center justify-between border-l-2 border-muted pl-4">
              <div>
                <Label className="text-sm">Visitor Drag</Label>
                <p className="text-xs text-muted-foreground">Allow visitors to rearrange cards</p>
              </div>
              <Switch
                checked={visitorDrag}
                onCheckedChange={setVisitorDrag}
              />
            </div>
          )}
        </>
      )}

      {/* Border Radius and Card Shadows - only for card-layout themes */}
      {showCardStyleControls && (
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sharp</span>
              <span>Rounded</span>
            </div>
          </div>

          {/* Shadow Toggle */}
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
        </>
      )}

      {/* Glass/Blur Intensity (only for themes that support it) */}
      {theme?.hasGlassEffect && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Glass Blur</Label>
            <span className="text-xs text-muted-foreground">{style.blurIntensity}px</span>
          </div>
          <Slider
            value={[style.blurIntensity]}
            onValueChange={([value]) => setStyle('blurIntensity', value)}
            min={0}
            max={32}
            step={2}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>Heavy</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Blur effect for glass-style cards. Keep under 16px for best mobile performance.
          </p>
        </div>
      )}

      {/* Basic Themes: Center Cards Toggle */}
      {(BASIC_THEMES.includes(themeId) || themeId === 'word-art') && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Center Cards</Label>
            <p className="text-xs text-muted-foreground">Vertically center on screen</p>
          </div>
          <Switch
            checked={centerCards}
            onCheckedChange={setCenterCards}
          />
        </div>
      )}

      {/* VCR Theme: Center Content Toggle */}
      {themeId === 'vcr-menu' && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Center Content</Label>
            <p className="text-xs text-muted-foreground">Vertically center on screen</p>
          </div>
          <Switch
            checked={vcrCenterContent}
            onCheckedChange={setVcrCenterContent}
          />
        </div>
      )}

      {/* Receipt Theme: Price Text */}
      {themeId === 'receipt' && (
        <div className="space-y-2">
          <Label className="text-sm">Price</Label>
          <Input
            value={receiptPrice}
            onChange={(e) => setReceiptPrice(e.target.value)}
            placeholder="PRICELESS"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">Displayed under total links on your receipt</p>
        </div>
      )}

      {/* Receipt Theme: Paper Texture Toggle */}
      {themeId === 'receipt' && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Paper Texture</Label>
            <p className="text-xs text-muted-foreground">Overlay paper and plastic texture effects</p>
          </div>
          <Switch
            checked={receiptPaperTexture}
            onCheckedChange={setReceiptPaperTexture}
          />
        </div>
      )}

      {/* Receipt Theme: Float Animation Toggle */}
      {themeId === 'receipt' && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Float Animation</Label>
            <p className="text-xs text-muted-foreground">Gentle floating breeze effect</p>
          </div>
          <Switch
            checked={receiptFloatAnimation}
            onCheckedChange={setReceiptFloatAnimation}
          />
        </div>
      )}

      {/* Receipt Theme: Stickers */}
      {themeId === 'receipt' && (
        <div className="space-y-3">
          <Label className="text-sm">Stickers</Label>
          <p className="text-xs text-muted-foreground">Add stickers to your receipt. Drag them around in the preview.</p>

          {/* Sticker picker grid */}
          <div className="grid grid-cols-4 gap-2">
            {RECEIPT_STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => {
                  addReceiptSticker({
                    id: `${sticker.id}-${Date.now()}`,
                    src: sticker.src,
                    x: 50 + Math.random() * 20 - 10,
                    y: 30 + Math.random() * 20 - 10,
                    rotation: Math.random() * 30 - 15,
                    scale: 0.8 + Math.random() * 0.4,
                    behindText: false,
                  })
                }}
                className="p-1 rounded border hover:border-primary transition-colors bg-white"
              >
                <img
                  src={sticker.src}
                  alt={sticker.label}
                  className="w-full h-auto object-contain"
                />
              </button>
            ))}
            <input
              ref={receiptStickerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleStickerUpload(e, 'receipt')}
            />
            <button
              onClick={() => receiptStickerInputRef.current?.click()}
              disabled={stickerUploading === 'receipt'}
              className="p-1 rounded border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors flex items-center justify-center aspect-square"
            >
              {stickerUploading === 'receipt' ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Active stickers list */}
          {receiptStickers.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Active Stickers</Label>
              <div className="space-y-3">
                {receiptStickers.map((sticker, index) => (
                  <div
                    key={sticker.id}
                    className="p-3 rounded bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={sticker.src} alt="" className="w-8 h-8 object-contain" />
                        <span className="text-xs font-medium">Sticker {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeReceiptSticker(sticker.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Rotation slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Rotation</Label>
                        <span className="text-xs text-muted-foreground">{sticker.rotation.toFixed(0)}°</span>
                      </div>
                      <Slider
                        value={[sticker.rotation]}
                        onValueChange={([value]) => updateReceiptSticker(sticker.id, { rotation: value })}
                        min={-45}
                        max={45}
                        step={1}
                      />
                    </div>

                    {/* Scale slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Size</Label>
                        <span className="text-xs text-muted-foreground">{(sticker.scale * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[sticker.scale]}
                        onValueChange={([value]) => updateReceiptSticker(sticker.id, { scale: value })}
                        min={0.3}
                        max={2}
                        step={0.1}
                      />
                    </div>

                    {/* Behind text toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Behind text</Label>
                      <Switch
                        checked={sticker.behindText ?? false}
                        onCheckedChange={(checked) => updateReceiptSticker(sticker.id, { behindText: checked })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* iPod Theme: Texture */}
      {themeId === 'ipod-classic' && (
        <div className="space-y-3">
          <Label className="text-sm">Body Texture</Label>
          <p className="text-xs text-muted-foreground">Choose a texture overlay for the iPod body.</p>
          <div className="grid grid-cols-4 gap-2">
            {IPOD_TEXTURES.map((texture) => (
              <button
                key={texture.id}
                onClick={() => setIpodTexture(texture.src)}
                className={`p-1 rounded border transition-colors ${
                  ipodTexture === texture.src ? 'border-primary ring-2 ring-primary' : 'hover:border-primary'
                } ${texture.src ? 'bg-white' : 'bg-muted'}`}
              >
                {texture.src ? (
                  <img
                    src={texture.src}
                    alt={texture.label}
                    className="w-full h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-12 flex items-center justify-center text-xs text-muted-foreground">
                    None
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* iPod Theme: Stickers */}
      {themeId === 'ipod-classic' && (
        <div className="space-y-3">
          <Label className="text-sm">Stickers</Label>
          <p className="text-xs text-muted-foreground">Add stickers to your iPod. Drag them around in the preview.</p>

          {/* Sticker picker grid */}
          <div className="grid grid-cols-4 gap-2">
            {RECEIPT_STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => {
                  addIpodSticker({
                    id: `${sticker.id}-${Date.now()}`,
                    src: sticker.src,
                    x: 50 + Math.random() * 20 - 10,
                    y: 30 + Math.random() * 20 - 10,
                    rotation: Math.random() * 30 - 15,
                    scale: 0.8 + Math.random() * 0.4,
                    behindText: false,
                  })
                }}
                className="p-1 rounded border hover:border-primary transition-colors bg-white"
              >
                <img
                  src={sticker.src}
                  alt={sticker.label}
                  className="w-full h-auto object-contain"
                />
              </button>
            ))}
            <input
              ref={ipodStickerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleStickerUpload(e, 'ipod')}
            />
            <button
              onClick={() => ipodStickerInputRef.current?.click()}
              disabled={stickerUploading === 'ipod'}
              className="p-1 rounded border-2 border-dashed border-muted-foreground/30 hover:border-primary transition-colors flex items-center justify-center aspect-square"
            >
              {stickerUploading === 'ipod' ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Active stickers list */}
          {ipodStickers.length > 0 && (
            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground">Active Stickers</Label>
              <div className="space-y-3">
                {ipodStickers.map((sticker, index) => (
                  <div
                    key={sticker.id}
                    className="p-3 rounded bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={sticker.src} alt="" className="w-8 h-8 object-contain" />
                        <span className="text-xs font-medium">Sticker {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeIpodSticker(sticker.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Rotation slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Rotation</Label>
                        <span className="text-xs text-muted-foreground">{sticker.rotation.toFixed(0)}°</span>
                      </div>
                      <Slider
                        value={[sticker.rotation]}
                        onValueChange={([value]) => updateIpodSticker(sticker.id, { rotation: value })}
                        min={-45}
                        max={45}
                        step={1}
                      />
                    </div>

                    {/* Scale slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Size</Label>
                        <span className="text-xs text-muted-foreground">{(sticker.scale * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[sticker.scale]}
                        onValueChange={([value]) => updateIpodSticker(sticker.id, { scale: value })}
                        min={0.3}
                        max={2}
                        step={0.1}
                      />
                    </div>

                    {/* Behind text toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Behind text</Label>
                      <Switch
                        checked={sticker.behindText ?? false}
                        onCheckedChange={(checked) => updateIpodSticker(sticker.id, { behindText: checked })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phone Home Theme: Variant + Dock Controls */}
      {themeId === 'phone-home' && (
        <div className="space-y-3">
          {/* Style variant toggle */}
          <div className="space-y-2">
            <Label className="text-sm">Style</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setPhoneHomeVariant('default')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  phoneHomeVariant === 'default'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                Modern
              </button>
              <button
                onClick={() => setPhoneHomeVariant('8-bit')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  phoneHomeVariant === '8-bit'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                8-Bit
              </button>
              <button
                onClick={() => setPhoneHomeVariant('windows-95')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  phoneHomeVariant === 'windows-95'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                Win 95
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Show Dock</Label>
              <p className="text-xs text-muted-foreground">Bottom dock bar for pinned apps</p>
            </div>
            <Switch
              checked={phoneHomeShowDock}
              onCheckedChange={setPhoneHomeShowDock}
            />
          </div>

          {phoneHomeShowDock && phoneHomeVariant === 'default' && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Translucent Dock</Label>
                <p className="text-xs text-muted-foreground">Glass effect with background blur</p>
              </div>
              <Switch
                checked={phoneHomeDockTranslucent}
                onCheckedChange={setPhoneHomeDockTranslucent}
              />
            </div>
          )}

          {phoneHomeDock.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Dock Items ({phoneHomeDock.length}/3)</Label>
              {phoneHomeDock.map((cardId) => {
                const card = cards.find((c) => c.id === cardId)
                return (
                  <div key={cardId} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-xs truncate flex-1">{card?.title || card?.card_type || 'Unknown'}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFromDock(cardId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Chaotic Zine Theme: Show Doodles Toggle */}
      {themeId === 'chaotic-zine' && (
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Doodles</Label>
            <p className="text-xs text-muted-foreground">Arrows, scribbles and background marks</p>
          </div>
          <Switch
            checked={zineShowDoodles}
            onCheckedChange={setZineShowDoodles}
          />
        </div>
      )}

      {/* Artifact Theme Settings */}
      {themeId === 'artifact' && (
        <ArtifactSettings
          artifactShowHeaderMeta={artifactShowHeaderMeta}
          setArtifactShowHeaderMeta={setArtifactShowHeaderMeta}
          artifactHeaderTopLeft={artifactHeaderTopLeft}
          setArtifactHeaderTopLeft={setArtifactHeaderTopLeft}
          artifactHeaderTopCenter={artifactHeaderTopCenter}
          setArtifactHeaderTopCenter={setArtifactHeaderTopCenter}
          artifactHeaderTopRight={artifactHeaderTopRight}
          setArtifactHeaderTopRight={setArtifactHeaderTopRight}
          artifactHeaderBottomLeft={artifactHeaderBottomLeft}
          setArtifactHeaderBottomLeft={setArtifactHeaderBottomLeft}
          artifactHeaderBottomCenter={artifactHeaderBottomCenter}
          setArtifactHeaderBottomCenter={setArtifactHeaderBottomCenter}
          artifactHeaderBottomRight={artifactHeaderBottomRight}
          setArtifactHeaderBottomRight={setArtifactHeaderBottomRight}
          artifactMarqueeText={artifactMarqueeText}
          setArtifactMarqueeText={setArtifactMarqueeText}
          artifactHeroOverlay={artifactHeroOverlay}
          setArtifactHeroOverlay={setArtifactHeroOverlay}
          artifactHeroMediaType={artifactHeroMediaType}
          setArtifactHeroMediaType={setArtifactHeroMediaType}
          artifactHeroImageUrl={artifactHeroImageUrl}
          setArtifactHeroImageUrl={setArtifactHeroImageUrl}
          artifactHeroVideoUrl={artifactHeroVideoUrl}
          setArtifactHeroVideoUrl={setArtifactHeroVideoUrl}
          artifactHeroPositionX={artifactHeroPositionX}
          setArtifactHeroPositionX={setArtifactHeroPositionX}
          artifactHeroPositionY={artifactHeroPositionY}
          setArtifactHeroPositionY={setArtifactHeroPositionY}
        />
      )}

      {/* Style Preview */}
      <div className="p-4 rounded-lg border bg-muted/30">
        <div
          className="w-full h-16 rounded flex items-center justify-center text-sm"
          style={{
            borderRadius: `${style.borderRadius}px`,
            backgroundColor: 'var(--theme-card-bg, hsl(var(--card)))',
            boxShadow: style.shadowEnabled ? 'var(--theme-shadow)' : 'none',
            backdropFilter: theme?.hasGlassEffect ? `blur(${style.blurIntensity}px)` : undefined,
          }}
        >
          Card Preview
        </div>
      </div>
    </div>
  )
}

// Artifact theme settings sub-component
function ArtifactSettings({
  artifactShowHeaderMeta, setArtifactShowHeaderMeta,
  artifactHeaderTopLeft, setArtifactHeaderTopLeft,
  artifactHeaderTopCenter, setArtifactHeaderTopCenter,
  artifactHeaderTopRight, setArtifactHeaderTopRight,
  artifactHeaderBottomLeft, setArtifactHeaderBottomLeft,
  artifactHeaderBottomCenter, setArtifactHeaderBottomCenter,
  artifactHeaderBottomRight, setArtifactHeaderBottomRight,
  artifactMarqueeText, setArtifactMarqueeText,
  artifactHeroOverlay, setArtifactHeroOverlay,
  artifactHeroMediaType, setArtifactHeroMediaType,
  artifactHeroImageUrl, setArtifactHeroImageUrl,
  artifactHeroVideoUrl, setArtifactHeroVideoUrl,
  artifactHeroPositionX, setArtifactHeroPositionX,
  artifactHeroPositionY, setArtifactHeroPositionY,
}: {
  artifactShowHeaderMeta: boolean
  setArtifactShowHeaderMeta: (v: boolean) => void
  artifactHeaderTopLeft: string
  setArtifactHeaderTopLeft: (v: string) => void
  artifactHeaderTopCenter: string
  setArtifactHeaderTopCenter: (v: string) => void
  artifactHeaderTopRight: string
  setArtifactHeaderTopRight: (v: string) => void
  artifactHeaderBottomLeft: string
  setArtifactHeaderBottomLeft: (v: string) => void
  artifactHeaderBottomCenter: string
  setArtifactHeaderBottomCenter: (v: string) => void
  artifactHeaderBottomRight: string
  setArtifactHeaderBottomRight: (v: string) => void
  artifactMarqueeText: string
  setArtifactMarqueeText: (v: string) => void
  artifactHeroOverlay: boolean
  setArtifactHeroOverlay: (v: boolean) => void
  artifactHeroMediaType: 'image' | 'video'
  setArtifactHeroMediaType: (v: 'image' | 'video') => void
  artifactHeroImageUrl: string
  setArtifactHeroImageUrl: (v: string) => void
  artifactHeroVideoUrl: string
  setArtifactHeroVideoUrl: (v: string) => void
  artifactHeroPositionX: number
  setArtifactHeroPositionX: (v: number) => void
  artifactHeroPositionY: number
  setArtifactHeroPositionY: (v: number) => void
}) {
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImageUploading(true)
    try {
      const { uploadBackgroundImage } = await import('@/lib/storage')
      const url = await uploadBackgroundImage(file)
      setArtifactHeroImageUrl(url)
      setArtifactHeroMediaType('image')
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setIsImageUploading(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsVideoUploading(true)
    try {
      const { uploadBackgroundVideo } = await import('@/lib/storage')
      const url = await uploadBackgroundVideo(file)
      setArtifactHeroVideoUrl(url)
      setArtifactHeroMediaType('video')
    } catch (error) {
      console.error('Video upload failed:', error)
    } finally {
      setIsVideoUploading(false)
      if (videoInputRef.current) videoInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Artifact Settings</Label>
      <p className="text-xs text-muted-foreground -mt-2">Click the header in the preview to jump here</p>

      {/* Header Metadata Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">Show Metadata</Label>
          <p className="text-xs text-muted-foreground">Small text around the title</p>
        </div>
        <Switch
          checked={artifactShowHeaderMeta}
          onCheckedChange={setArtifactShowHeaderMeta}
        />
      </div>

      {/* Header Metadata Fields */}
      {artifactShowHeaderMeta && (
        <div className="space-y-2 border-l-2 border-muted pl-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Top Left</Label>
              <Input
                value={artifactHeaderTopLeft}
                onChange={(e) => setArtifactHeaderTopLeft(e.target.value)}
                placeholder="USER.ID_99"
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Top Center</Label>
              <Input
                value={artifactHeaderTopCenter}
                onChange={(e) => setArtifactHeaderTopCenter(e.target.value)}
                placeholder="[ONLINE]"
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Top Right</Label>
              <Input
                value={artifactHeaderTopRight}
                onChange={(e) => setArtifactHeaderTopRight(e.target.value)}
                placeholder="EST. 2024"
                className="font-mono text-xs h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Bottom Left</Label>
              <Input
                value={artifactHeaderBottomLeft}
                onChange={(e) => setArtifactHeaderBottomLeft(e.target.value)}
                placeholder="DIGITAL // PHY"
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Bottom Center</Label>
              <Input
                value={artifactHeaderBottomCenter}
                onChange={(e) => setArtifactHeaderBottomCenter(e.target.value)}
                placeholder="///"
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Bottom Right</Label>
              <Input
                value={artifactHeaderBottomRight}
                onChange={(e) => setArtifactHeaderBottomRight(e.target.value)}
                placeholder="SYS_ADMIN"
                className="font-mono text-xs h-8"
              />
            </div>
          </div>
        </div>
      )}

      {/* Marquee Text */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Marquee Text</Label>
        <Input
          value={artifactMarqueeText}
          onChange={(e) => setArtifactMarqueeText(e.target.value)}
          placeholder="LINKS_DATABASE /// ACCESS_GRANTED"
          className="font-mono text-xs"
        />
      </div>

      {/* Hero Overlay Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">Grayscale Overlay</Label>
          <p className="text-xs text-muted-foreground">B&W filter on hero photo</p>
        </div>
        <Switch
          checked={artifactHeroOverlay}
          onCheckedChange={setArtifactHeroOverlay}
        />
      </div>

      {/* Hero Media Type */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Hero Media</Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={artifactHeroMediaType === 'image' ? 'default' : 'outline'}
            onClick={() => setArtifactHeroMediaType('image')}
            className="flex-1 text-xs h-8"
          >
            Image
          </Button>
          <Button
            size="sm"
            variant={artifactHeroMediaType === 'video' ? 'default' : 'outline'}
            onClick={() => setArtifactHeroMediaType('video')}
            className="flex-1 text-xs h-8"
          >
            Video
          </Button>
        </div>
      </div>

      {/* Image Upload (when image mode) */}
      {artifactHeroMediaType === 'image' && (
        <div className="space-y-2 border-l-2 border-muted pl-3">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8"
            onClick={() => imageInputRef.current?.click()}
            disabled={isImageUploading}
          >
            {isImageUploading ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-3 h-3 mr-1" /> {artifactHeroImageUrl ? 'Replace Image' : 'Upload Hero Image'}</>
            )}
          </Button>
          {artifactHeroImageUrl && (
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground truncate flex-1">Uploaded</p>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1 text-[10px] text-muted-foreground"
                onClick={() => setArtifactHeroImageUrl('')}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          {!artifactHeroImageUrl && (
            <p className="text-[10px] text-muted-foreground">Falls back to profile photo if empty</p>
          )}
        </div>
      )}

      {/* Video Upload (when video mode) */}
      {artifactHeroMediaType === 'video' && (
        <div className="space-y-2 border-l-2 border-muted pl-3">
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-8"
            onClick={() => videoInputRef.current?.click()}
            disabled={isVideoUploading}
          >
            {isVideoUploading ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-3 h-3 mr-1" /> {artifactHeroVideoUrl ? 'Replace Video' : 'Upload Video'}</>
            )}
          </Button>
          {artifactHeroVideoUrl && (
            <p className="text-[10px] text-muted-foreground truncate">Uploaded</p>
          )}
        </div>
      )}

      {/* Position Sliders */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Position X</Label>
          <span className="text-xs text-muted-foreground">{artifactHeroPositionX}%</span>
        </div>
        <Slider
          value={[artifactHeroPositionX]}
          onValueChange={([v]) => setArtifactHeroPositionX(v)}
          min={0}
          max={100}
          step={1}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Position Y</Label>
          <span className="text-xs text-muted-foreground">{artifactHeroPositionY}%</span>
        </div>
        <Slider
          value={[artifactHeroPositionY]}
          onValueChange={([v]) => setArtifactHeroPositionY(v)}
          min={0}
          max={100}
          step={1}
        />
      </div>
    </div>
  )
}
