"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { exportEmailsToCSV } from "@/lib/fan-tools/csv-export"
import { toast } from "sonner"
import { Download, Mail, Loader2 } from "lucide-react"
import type { CollectedEmail } from "@/types/fan-tools"

interface EmailExportProps {
  pageId: string
  username: string
}

export function EmailExport({ pageId, username }: EmailExportProps) {
  const [emailCount, setEmailCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  // Fetch email count on mount
  useEffect(() => {
    async function fetchCount() {
      try {
        const response = await fetch(`/api/emails/export?pageId=${pageId}`)
        if (response.ok) {
          const data = await response.json()
          setEmailCount(data.count)
        }
      } catch (error) {
        console.error("Error fetching email count:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchCount()
  }, [pageId])

  const handleExport = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/emails/export?pageId=${pageId}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to fetch emails")
      }

      const data = await response.json()
      const emails: CollectedEmail[] = data.emails

      if (emails.length === 0) {
        toast.info("No emails to export")
        return
      }

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0]
      const filename = `${username}-emails-${date}.csv`

      // Export to CSV
      exportEmailsToCSV(emails, filename)

      toast.success(`Exported ${emails.length} emails`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to export emails")
    } finally {
      setIsLoading(false)
    }
  }, [pageId, username])

  if (isFetching) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>{emailCount} email{emailCount !== 1 ? "s" : ""} collected</span>
      </div>

      <Button
        onClick={handleExport}
        disabled={isLoading || emailCount === 0}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export {emailCount > 0 ? `${emailCount} ` : ""}Email{emailCount !== 1 ? "s" : ""} as CSV
          </>
        )}
      </Button>
    </div>
  )
}
