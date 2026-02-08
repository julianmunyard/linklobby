'use client'

import { useState } from 'react'
import type { ReverbConfig } from '@/types/audio'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

interface ReverbConfigModalProps {
  config: ReverbConfig
  onSave: (config: ReverbConfig) => void
  trigger?: React.ReactNode
}

export function ReverbConfigModal({
  config,
  onSave,
  trigger
}: ReverbConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<ReverbConfig>(config)

  const handleChange = (field: keyof ReverbConfig, value: number | boolean) => {
    const newConfig = { ...localConfig, [field]: value }
    setLocalConfig(newConfig)
    // Auto-save changes
    onSave(newConfig)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">Reverb Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold">Enabled</label>
              <p className="text-xs text-muted-foreground">
                Turn reverb effect on/off
              </p>
            </div>
            <Switch
              checked={localConfig.enabled}
              onCheckedChange={(checked) => handleChange('enabled', checked)}
            />
          </div>

          {/* Mix Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Mix</label>
              <span className="text-xs font-mono">{localConfig.mix.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Wet/dry balance (0 = dry, 1 = fully wet)
            </p>
            <Slider
              value={[localConfig.mix]}
              onValueChange={([value]) => handleChange('mix', value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Width Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Width</label>
              <span className="text-xs font-mono">{localConfig.width.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Stereo spread (0 = mono, 1 = full stereo)
            </p>
            <Slider
              value={[localConfig.width]}
              onValueChange={([value]) => handleChange('width', value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Damp Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Damp</label>
              <span className="text-xs font-mono">{localConfig.damp.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              High frequency absorption (0 = bright, 1 = muffled)
            </p>
            <Slider
              value={[localConfig.damp]}
              onValueChange={([value]) => handleChange('damp', value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Room Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Room Size</label>
              <span className="text-xs font-mono">{localConfig.roomSize.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Reverb decay length (0 = small room, 1 = cathedral)
            </p>
            <Slider
              value={[localConfig.roomSize]}
              onValueChange={([value]) => handleChange('roomSize', value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          {/* Pre-delay Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Pre-delay</label>
              <span className="text-xs font-mono">{localConfig.predelayMs.toFixed(0)} ms</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Delay before reverb onset (0-200ms)
            </p>
            <Slider
              value={[localConfig.predelayMs]}
              onValueChange={([value]) => handleChange('predelayMs', value)}
              min={0}
              max={200}
              step={1}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
