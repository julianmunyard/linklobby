'use client'

import { useThemeStore } from '@/stores/theme-store'
import { getTheme } from '@/lib/themes'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { ThemeId } from '@/types/theme'

// Themes with list-based layouts where card style controls (border radius, shadows) don't apply
const LIST_LAYOUT_THEMES: ThemeId[] = ['vcr-menu', 'ipod-classic', 'receipt']

// Available stickers for receipt theme
const RECEIPT_STICKERS = [
  { id: 'special-tag', src: '/images/stickers/special-tag.jpeg', label: 'Special' },
  { id: 'price-tag-1', src: '/images/stickers/price-tag-1.jpeg', label: 'Price Tag 1' },
  { id: 'price-tag-2', src: '/images/stickers/price-tag-2.jpeg', label: 'Price Tag 2' },
  { id: 'cleared-stamp', src: '/images/stickers/cleared-stamp.jpeg', label: 'Cleared' },
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
  const { themeId, style, setStyle, centerCards, setCenterCards, vcrCenterContent, setVcrCenterContent, receiptPrice, setReceiptPrice, receiptStickers, addReceiptSticker, updateReceiptSticker, removeReceiptSticker, receiptFloatAnimation, setReceiptFloatAnimation, ipodStickers, addIpodSticker, updateIpodSticker, removeIpodSticker, ipodTexture, setIpodTexture, classifiedStampText, setClassifiedStampText, classifiedDeptText, setClassifiedDeptText, classifiedCenterText, setClassifiedCenterText, classifiedMessageText, setClassifiedMessageText } = useThemeStore()
  const theme = getTheme(themeId)

  // Hide card style controls for list-layout themes
  const showCardStyleControls = !LIST_LAYOUT_THEMES.includes(themeId)

  return (
    <div className="space-y-5">
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
      {BASIC_THEMES.includes(themeId) && (
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

      {/* Classified Theme: Header Text Fields */}
      {themeId === 'classified' && (
        <div className="space-y-3">
          <Label className="text-sm">Document Text</Label>
          <p className="text-xs text-muted-foreground">Customize the classified document header text</p>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Stamp Text</Label>
            <Input
              value={classifiedStampText}
              onChange={(e) => setClassifiedStampText(e.target.value)}
              placeholder="SECRET"
              className="font-mono uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Department</Label>
            <Input
              value={classifiedDeptText}
              onChange={(e) => setClassifiedDeptText(e.target.value)}
              placeholder="War Department"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Center Line</Label>
            <Input
              value={classifiedCenterText}
              onChange={(e) => setClassifiedCenterText(e.target.value)}
              placeholder="Classified Message Center"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Message Line</Label>
            <Input
              value={classifiedMessageText}
              onChange={(e) => setClassifiedMessageText(e.target.value)}
              placeholder="Incoming Message"
              className="font-mono"
            />
          </div>
        </div>
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
