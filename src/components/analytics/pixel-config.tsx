'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Sparkles } from 'lucide-react'

interface PixelConfigProps {
  pageId: string
}

/**
 * PixelConfig - Pixel tracking configuration UI
 *
 * Features:
 * - Facebook Pixel ID input with save and test
 * - Google Analytics Measurement ID input with save and test
 * - Saves to page.theme_settings.pixels
 * - Test button sends verification event
 *
 * Usage:
 * ```tsx
 * <PixelConfig pageId={page.id} />
 * ```
 */
export function PixelConfig({ pageId }: PixelConfigProps) {
  const [facebookPixelId, setFacebookPixelId] = useState('')
  const [gaMeasurementId, setGaMeasurementId] = useState('')
  const [isFetchingFb, setIsFetchingFb] = useState(false)
  const [isFetchingGa, setIsFetchingGa] = useState(false)
  const [isSavingFb, setIsSavingFb] = useState(false)
  const [isSavingGa, setIsSavingGa] = useState(false)
  const [isTestingFb, setIsTestingFb] = useState(false)
  const [isTestingGa, setIsTestingGa] = useState(false)

  // Fetch current pixel settings on mount
  useEffect(() => {
    async function fetchPixelSettings() {
      try {
        setIsFetchingFb(true)
        setIsFetchingGa(true)

        const response = await fetch('/api/theme')
        if (!response.ok) {
          throw new Error('Failed to fetch theme data')
        }

        const data = await response.json()
        const pixels = data.theme?.pixels || {}

        setFacebookPixelId(pixels.facebookPixelId || '')
        setGaMeasurementId(pixels.gaMeasurementId || '')
      } catch (error) {
        console.error('Error fetching pixel settings:', error)
        toast.error('Failed to load pixel settings')
      } finally {
        setIsFetchingFb(false)
        setIsFetchingGa(false)
      }
    }

    fetchPixelSettings()
  }, [pageId])

  // Save Facebook Pixel ID
  async function handleSaveFacebookPixel() {
    try {
      setIsSavingFb(true)

      // Fetch current theme to merge with
      const fetchResponse = await fetch('/api/theme')
      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch current theme')
      }
      const { theme: currentTheme } = await fetchResponse.json()

      // Merge pixel settings into theme
      const updatedTheme = {
        ...currentTheme,
        pixels: {
          ...(currentTheme?.pixels || {}),
          facebookPixelId,
        },
      }

      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: updatedTheme }),
      })

      if (!response.ok) {
        throw new Error('Failed to save Facebook Pixel ID')
      }

      toast.success('Facebook Pixel ID saved')
    } catch (error) {
      console.error('Error saving Facebook Pixel ID:', error)
      toast.error('Failed to save Facebook Pixel ID')
    } finally {
      setIsSavingFb(false)
    }
  }

  // Save GA4 Measurement ID
  async function handleSaveGaMeasurementId() {
    try {
      setIsSavingGa(true)

      // Fetch current theme to merge with
      const fetchResponse = await fetch('/api/theme')
      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch current theme')
      }
      const { theme: currentTheme } = await fetchResponse.json()

      // Merge pixel settings into theme
      const updatedTheme = {
        ...currentTheme,
        pixels: {
          ...(currentTheme?.pixels || {}),
          gaMeasurementId,
        },
      }

      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: updatedTheme }),
      })

      if (!response.ok) {
        throw new Error('Failed to save GA4 Measurement ID')
      }

      toast.success('GA4 Measurement ID saved')
    } catch (error) {
      console.error('Error saving GA4 Measurement ID:', error)
      toast.error('Failed to save GA4 Measurement ID')
    } finally {
      setIsSavingGa(false)
    }
  }

  // Test Facebook Pixel
  async function handleTestFacebookPixel() {
    if (!facebookPixelId) {
      toast.error('Enter a Facebook Pixel ID first')
      return
    }

    try {
      setIsTestingFb(true)

      const response = await fetch('/api/pixels/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelType: 'facebook',
          pixelId: facebookPixelId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, { duration: 5000 })
      } else {
        toast.error(result.message || 'Test event failed')
      }
    } catch (error) {
      console.error('Error testing Facebook Pixel:', error)
      toast.error('Failed to send test event')
    } finally {
      setIsTestingFb(false)
    }
  }

  // Test Google Analytics
  async function handleTestGoogleAnalytics() {
    if (!gaMeasurementId) {
      toast.error('Enter a GA4 Measurement ID first')
      return
    }

    try {
      setIsTestingGa(true)

      const response = await fetch('/api/pixels/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelType: 'google',
          pixelId: gaMeasurementId,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.info(result.message, { duration: 8000 })
      } else {
        toast.error(result.message || 'Test failed')
      }
    } catch (error) {
      console.error('Error testing Google Analytics:', error)
      toast.error('Failed to test GA4')
    } finally {
      setIsTestingGa(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Tracking Pixels
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect your ad platforms to track visitor behavior and retarget audiences
        </p>
      </div>

      {/* Facebook Pixel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facebook Pixel</CardTitle>
          <CardDescription>
            Track visitors for Facebook and Instagram ad retargeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook-pixel-id">Pixel ID</Label>
            <Input
              id="facebook-pixel-id"
              placeholder="Enter your Facebook Pixel ID"
              value={facebookPixelId}
              onChange={(e) => setFacebookPixelId(e.target.value)}
              disabled={isFetchingFb}
            />
            <p className="text-xs text-muted-foreground">
              Find this in Facebook Events Manager → Data Sources → Pixels
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveFacebookPixel}
              disabled={isSavingFb || !facebookPixelId}
              className="flex-1"
            >
              {isSavingFb && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
            <Button
              variant="outline"
              onClick={handleTestFacebookPixel}
              disabled={isTestingFb || !facebookPixelId}
              className="flex-1"
            >
              {isTestingFb && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Google Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Analytics 4</CardTitle>
          <CardDescription>
            Track page views and visitor behavior with GA4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ga-measurement-id">Measurement ID</Label>
            <Input
              id="ga-measurement-id"
              placeholder="G-XXXXXXXXXX"
              value={gaMeasurementId}
              onChange={(e) => setGaMeasurementId(e.target.value)}
              disabled={isFetchingGa}
            />
            <p className="text-xs text-muted-foreground">
              Find this in Google Analytics Admin → Data Streams → Measurement ID
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveGaMeasurementId}
              disabled={isSavingGa || !gaMeasurementId}
              className="flex-1"
            >
              {isSavingGa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
            <Button
              variant="outline"
              onClick={handleTestGoogleAnalytics}
              disabled={isTestingGa || !gaMeasurementId}
              className="flex-1"
            >
              {isTestingGa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Privacy Notice:</strong> Pixels only load after visitors accept cookies via the consent banner. This ensures GDPR compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
