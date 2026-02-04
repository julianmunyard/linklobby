"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { RefreshCw, Loader2, Check, AlertCircle } from "lucide-react"

interface MailchimpSettingsProps {
  pageId: string
}

interface SyncResult {
  synced: number
  failed: number
  alreadyExists: number
  message: string
}

// LocalStorage key for storing list ID per page
function getListIdKey(pageId: string): string {
  return `mailchimp-list-id-${pageId}`
}

export function MailchimpSettings({ pageId }: MailchimpSettingsProps) {
  const [listId, setListId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(getListIdKey(pageId)) || ""
    }
    return ""
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`mailchimp-last-sync-${pageId}`)
    }
    return null
  })

  const handleListIdChange = useCallback(
    (value: string) => {
      setListId(value)
      if (typeof window !== "undefined") {
        if (value) {
          localStorage.setItem(getListIdKey(pageId), value)
        } else {
          localStorage.removeItem(getListIdKey(pageId))
        }
      }
    },
    [pageId]
  )

  const handleSync = useCallback(async () => {
    if (!listId.trim()) {
      toast.error("Please enter a Mailchimp List ID")
      return
    }

    setIsSyncing(true)
    setLastSyncResult(null)

    try {
      const response = await fetch("/api/mailchimp/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, listId: listId.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Sync failed")
      }

      // Store last sync time
      const now = new Date().toISOString()
      setLastSyncTime(now)
      if (typeof window !== "undefined") {
        localStorage.setItem(`mailchimp-last-sync-${pageId}`, now)
      }

      setLastSyncResult(data)

      if (data.synced > 0) {
        const existsNote =
          data.alreadyExists > 0
            ? ` (${data.alreadyExists} already existed)`
            : ""
        toast.success(`Synced ${data.synced} emails${existsNote}`)
      } else if (data.synced === 0 && data.failed === 0) {
        toast.info("No new emails to sync")
      } else if (data.failed > 0) {
        toast.warning(`Synced ${data.synced} emails, ${data.failed} failed`)
      }
    } catch (error) {
      console.error("Mailchimp sync error:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to sync to Mailchimp"
      )
    } finally {
      setIsSyncing(false)
    }
  }, [pageId, listId])

  const formatLastSync = (isoString: string | null): string => {
    if (!isoString) return ""
    try {
      return new Date(isoString).toLocaleString()
    } catch {
      return isoString
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="listId">Mailchimp List ID</Label>
        <Input
          id="listId"
          placeholder="e.g., abc123def4"
          value={listId}
          onChange={(e) => handleListIdChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Find this in Mailchimp: Audience &rarr; Settings &rarr; Audience name
          and defaults
        </p>
      </div>

      <Button
        onClick={handleSync}
        disabled={isSyncing || !listId.trim()}
        variant="outline"
        className="w-full"
      >
        {isSyncing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync to Mailchimp
          </>
        )}
      </Button>

      {/* Last sync info */}
      {lastSyncTime && (
        <p className="text-xs text-muted-foreground">
          Last sync: {formatLastSync(lastSyncTime)}
        </p>
      )}

      {/* Sync result */}
      {lastSyncResult && (
        <div
          className={`flex items-start gap-2 text-sm p-3 rounded-md ${
            lastSyncResult.failed > 0
              ? "bg-yellow-500/10 text-yellow-500"
              : "bg-green-500/10 text-green-500"
          }`}
        >
          {lastSyncResult.failed > 0 ? (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{lastSyncResult.message}</span>
        </div>
      )}

      {/* Configuration note */}
      <div className="bg-muted/50 rounded-md p-3 space-y-1">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Requires{" "}
          <code className="bg-muted px-1 py-0.5 rounded">MAILCHIMP_API_KEY</code>{" "}
          and{" "}
          <code className="bg-muted px-1 py-0.5 rounded">
            MAILCHIMP_SERVER_PREFIX
          </code>{" "}
          environment variables.
        </p>
      </div>
    </div>
  )
}
