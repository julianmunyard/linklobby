"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { QRCodeDialog } from "@/components/fan-tools/qr-code-dialog"
import { EmailExport } from "@/components/fan-tools/email-export"
import { MailchimpSettings } from "@/components/fan-tools/mailchimp-settings"
import { DataPrivacySection } from "@/components/settings/data-privacy-section"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { QrCode, Mail, ChevronDown, Loader2, Settings, Shield } from "lucide-react"

interface PageInfo {
  id: string
  username: string
}

export function SettingsTab() {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [fanToolsOpen, setFanToolsOpen] = useState(true)
  const [dataPrivacyOpen, setDataPrivacyOpen] = useState(false)

  // Fetch page info on mount
  useEffect(() => {
    async function fetchPageInfo() {
      try {
        // Fetch from profile API to get username
        const profileResponse = await fetch("/api/profile")
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile")
        }
        const profile = await profileResponse.json()

        // Fetch page info to get page ID
        const pageResponse = await fetch("/api/page")
        if (!pageResponse.ok) {
          throw new Error("Failed to fetch page")
        }
        const page = await pageResponse.json()

        setPageInfo({
          id: page.id,
          username: profile.username,
        })
      } catch (error) {
        console.error("Error fetching page info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPageInfo()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!pageInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Settings className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          Unable to load settings. Please try refreshing the page.
        </p>
      </div>
    )
  }

  const pageUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${pageInfo.username}`

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Fan Tools Section */}
        <Collapsible open={fanToolsOpen} onOpenChange={setFanToolsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between text-sm font-medium py-2">
              <span>Fan Tools</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  fanToolsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {/* QR Code */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                QR Code
              </h4>
              <Button
                onClick={() => setQrDialogOpen(true)}
                variant="outline"
                className="w-full justify-start"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Generate QR Code
              </Button>
              <p className="text-xs text-muted-foreground">
                Create a QR code for your page to use on flyers, merch, or posters.
              </p>
            </div>

            <Separator />

            {/* Email Export */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Email List
              </h4>
              <EmailExport pageId={pageInfo.id} username={pageInfo.username} />
            </div>

            <Separator />

            {/* Mailchimp Sync */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Mailchimp Integration
              </h4>
              <MailchimpSettings pageId={pageInfo.id} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Data & Privacy Section */}
        <Collapsible open={dataPrivacyOpen} onOpenChange={setDataPrivacyOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between text-sm font-medium py-2">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Data & Privacy
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  dataPrivacyOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            <DataPrivacySection username={pageInfo.username} />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* QR Code Dialog */}
      <QRCodeDialog
        pageUrl={pageUrl}
        username={pageInfo.username}
        open={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
      />
    </ScrollArea>
  )
}
