'use client'

import { useThemeStore } from '@/stores/theme-store'
import { CURATED_FONTS } from '@/app/fonts'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function FontPicker() {
  const { fonts, setFont } = useThemeStore()

  // Group fonts by category for better organization
  const fontsByCategory = CURATED_FONTS.reduce((acc, font) => {
    if (!acc[font.category]) acc[font.category] = []
    acc[font.category].push(font)
    return acc
  }, {} as Record<string, typeof CURATED_FONTS[number][]>)

  return (
    <div className="space-y-5">
      {/* Heading Font */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Heading Font</Label>
        <Select
          value={fonts.heading}
          onValueChange={(value) => setFont('heading', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select heading font" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fontsByCategory).map(([category, categoryFonts]) => (
              <div key={category}>
                <div className="px-2 py-1 text-xs text-muted-foreground uppercase">
                  {category}
                </div>
                {categoryFonts.map((font) => (
                  <SelectItem
                    key={font.id}
                    value={font.variable}
                    style={{ fontFamily: font.variable }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Heading Size */}
        <div className="flex items-center gap-3">
          <Label className="text-xs min-w-[60px]">Size</Label>
          <Slider
            value={[fonts.headingSize]}
            onValueChange={([value]) => setFont('headingSize', value)}
            min={0.75}
            max={2}
            step={0.125}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">
            {(fonts.headingSize * 100).toFixed(0)}%
          </span>
        </div>

        {/* Heading Weight */}
        <div className="flex items-center gap-3">
          <Label className="text-xs min-w-[60px]">Weight</Label>
          <ToggleGroup
            type="single"
            value={fonts.headingWeight}
            onValueChange={(value) => value && setFont('headingWeight', value)}
            className="justify-start"
          >
            <ToggleGroupItem value="normal" className="text-xs h-7">
              Regular
            </ToggleGroupItem>
            <ToggleGroupItem value="bold" className="text-xs h-7 font-bold">
              Bold
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Body Font */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Body Font</Label>
        <Select
          value={fonts.body}
          onValueChange={(value) => setFont('body', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select body font" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(fontsByCategory).map(([category, categoryFonts]) => (
              <div key={category}>
                <div className="px-2 py-1 text-xs text-muted-foreground uppercase">
                  {category}
                </div>
                {categoryFonts.map((font) => (
                  <SelectItem
                    key={font.id}
                    value={font.variable}
                    style={{ fontFamily: font.variable }}
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Body Size */}
        <div className="flex items-center gap-3">
          <Label className="text-xs min-w-[60px]">Size</Label>
          <Slider
            value={[fonts.bodySize]}
            onValueChange={([value]) => setFont('bodySize', value)}
            min={0.75}
            max={1.5}
            step={0.125}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">
            {(fonts.bodySize * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Font Preview */}
      <div className="p-3 rounded-lg border bg-muted/30">
        <p
          className="text-lg mb-1"
          style={{
            fontFamily: fonts.heading,
            fontWeight: fonts.headingWeight === 'bold' ? 700 : 400,
            fontSize: `${fonts.headingSize}rem`,
          }}
        >
          Heading Preview
        </p>
        <p
          className="text-muted-foreground"
          style={{
            fontFamily: fonts.body,
            fontSize: `${fonts.bodySize}rem`,
          }}
        >
          Body text preview shows how your description text will appear on cards.
        </p>
      </div>
    </div>
  )
}
