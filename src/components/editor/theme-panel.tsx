'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemePresets } from './theme-presets'
import { ColorCustomizer } from './color-customizer'
import { FontPicker } from './font-picker'
import { StyleControls } from './style-controls'
import { BackgroundControls } from './background-controls'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Palette } from 'lucide-react'
import { useState } from 'react'

export function ThemePanel() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span>Theme</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Tabs defaultValue="presets" className="mt-3">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="presets" className="text-xs">Presets</TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">Colors</TabsTrigger>
            <TabsTrigger value="fonts" className="text-xs">Fonts</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-3">
            <ThemePresets />
          </TabsContent>

          <TabsContent value="colors" className="mt-3">
            <ColorCustomizer />
          </TabsContent>

          <TabsContent value="fonts" className="mt-3">
            <FontPicker />
          </TabsContent>

          <TabsContent value="style" className="mt-3">
            <StyleControls />
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground mb-3">Page Background</h5>
          <BackgroundControls />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
