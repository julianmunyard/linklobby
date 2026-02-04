"use client"

import { useState, useRef, useCallback } from "react"
import QRCode from "react-qr-code"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, QrCode } from "lucide-react"

interface QRCodeDialogProps {
  pageUrl: string
  username: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type QRSize = "256" | "512" | "1024"
type ColorScheme = "black-on-white" | "white-on-black" | "theme"

const SIZE_OPTIONS: { value: QRSize; label: string }[] = [
  { value: "256", label: "Screen (256px)" },
  { value: "512", label: "Print (512px)" },
  { value: "1024", label: "Large Print (1024px)" },
]

const COLOR_OPTIONS: { value: ColorScheme; label: string; fg: string; bg: string }[] = [
  { value: "black-on-white", label: "Black on White", fg: "#000000", bg: "#ffffff" },
  { value: "white-on-black", label: "White on Black", fg: "#ffffff", bg: "#000000" },
  { value: "theme", label: "Theme Colors", fg: "hsl(var(--foreground))", bg: "hsl(var(--background))" },
]

export function QRCodeDialog({ pageUrl, username, open, onOpenChange }: QRCodeDialogProps) {
  const [size, setSize] = useState<QRSize>("256")
  const [colorScheme, setColorScheme] = useState<ColorScheme>("black-on-white")
  const svgRef = useRef<HTMLDivElement>(null)

  const currentColor = COLOR_OPTIONS.find(c => c.value === colorScheme) || COLOR_OPTIONS[0]

  // Get the actual hex color for theme colors (needed for downloads)
  const getComputedColors = useCallback(() => {
    if (colorScheme === "theme") {
      // For theme colors, read computed styles
      const style = getComputedStyle(document.documentElement)
      const fg = style.getPropertyValue("--foreground").trim()
      const bg = style.getPropertyValue("--background").trim()

      // Convert HSL values to hex if needed
      const fgParts = fg.split(" ")
      const bgParts = bg.split(" ")

      const hslToHex = (h: number, s: number, l: number): string => {
        s /= 100
        l /= 100
        const a = s * Math.min(l, 1 - l)
        const f = (n: number) => {
          const k = (n + h / 30) % 12
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
          return Math.round(255 * color).toString(16).padStart(2, "0")
        }
        return `#${f(0)}${f(8)}${f(4)}`
      }

      const parseHsl = (parts: string[]): string => {
        if (parts.length >= 3) {
          const h = parseFloat(parts[0])
          const s = parseFloat(parts[1])
          const l = parseFloat(parts[2])
          return hslToHex(h, s, l)
        }
        return "#000000"
      }

      return {
        fg: parseHsl(fgParts),
        bg: parseHsl(bgParts),
      }
    }
    return { fg: currentColor.fg, bg: currentColor.bg }
  }, [colorScheme, currentColor])

  const downloadSVG = useCallback(() => {
    const svgElement = svgRef.current?.querySelector("svg")
    if (!svgElement) return

    const colors = getComputedColors()

    // Clone and modify SVG for standalone download
    const clone = svgElement.cloneNode(true) as SVGElement
    clone.setAttribute("width", size)
    clone.setAttribute("height", size)
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    // Add background rect
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    bgRect.setAttribute("width", "100%")
    bgRect.setAttribute("height", "100%")
    bgRect.setAttribute("fill", colors.bg)
    clone.insertBefore(bgRect, clone.firstChild)

    // Update fill color
    const path = clone.querySelector("path")
    if (path) {
      path.setAttribute("fill", colors.fg)
    }

    const svgData = new XMLSerializer().serializeToString(clone)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `${username}-qr.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [size, username, getComputedColors])

  const downloadPNG = useCallback(() => {
    const svgElement = svgRef.current?.querySelector("svg")
    if (!svgElement) return

    const colors = getComputedColors()
    const exportSize = Math.max(1024, parseInt(size)) // Minimum 1024px for print quality

    // Clone and modify SVG
    const clone = svgElement.cloneNode(true) as SVGElement
    clone.setAttribute("width", String(exportSize))
    clone.setAttribute("height", String(exportSize))
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    // Add background rect
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    bgRect.setAttribute("width", "100%")
    bgRect.setAttribute("height", "100%")
    bgRect.setAttribute("fill", colors.bg)
    clone.insertBefore(bgRect, clone.firstChild)

    // Update fill color
    const path = clone.querySelector("path")
    if (path) {
      path.setAttribute("fill", colors.fg)
    }

    const svgData = new XMLSerializer().serializeToString(clone)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = exportSize
      canvas.height = exportSize
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0, exportSize, exportSize)
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = pngUrl
            link.download = `${username}-qr.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(pngUrl)
          }
        }, "image/png")
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [size, username, getComputedColors])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code
          </DialogTitle>
          <DialogDescription>
            Generate a QR code for your page to use on flyers, merch, or posters.
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Preview */}
        <div
          ref={svgRef}
          className="flex items-center justify-center p-6 rounded-lg"
          style={{ backgroundColor: currentColor.bg }}
        >
          <QRCode
            value={pageUrl}
            size={256}
            level="M"
            fgColor={currentColor.fg}
            bgColor={currentColor.bg}
          />
        </div>

        {/* Settings */}
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="size">Export Size</Label>
            <Select value={size} onValueChange={(v) => setSize(v as QRSize)}>
              <SelectTrigger id="size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={(v) => setColorScheme(v as ColorScheme)}>
              <SelectTrigger id="color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex gap-2">
          <Button onClick={downloadSVG} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download SVG
          </Button>
          <Button onClick={downloadPNG} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          PNG exports at minimum 1024px for print quality
        </p>
      </DialogContent>
    </Dialog>
  )
}
