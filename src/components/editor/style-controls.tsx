'use client'

import { useThemeStore } from '@/stores/theme-store'
import { getTheme } from '@/lib/themes'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export function StyleControls() {
  const { themeId, style, setStyle } = useThemeStore()
  const theme = getTheme(themeId)

  return (
    <div className="space-y-5">
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
