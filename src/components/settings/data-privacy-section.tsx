"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Download, Trash2, ShieldAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DataPrivacySectionProps {
  username: string
}

export function DataPrivacySection({ username }: DataPrivacySectionProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  /**
   * Download all user data as ZIP file
   */
  async function handleExportData() {
    try {
      setIsExporting(true)
      const response = await fetch("/api/legal/export-data")

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Export failed")
      }

      // Download ZIP file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `linklobby-data-export-${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Data exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error(error instanceof Error ? error.message : "Export failed")
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Initiate account deletion (30-day grace period)
   */
  async function handleDeleteAccount() {
    try {
      setIsDeleting(true)
      const response = await fetch("/api/legal/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmUsername }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Deletion failed")
      }

      toast.success("Account deletion scheduled", {
        description: "You have 30 days to recover your account by logging in.",
      })

      // Close dialog and reset
      setDialogOpen(false)
      setConfirmUsername("")

      // Redirect to logout after short delay
      setTimeout(() => {
        window.location.href = "/auth/signout"
      }, 2000)
    } catch (error) {
      console.error("Deletion error:", error)
      toast.error(error instanceof Error ? error.message : "Deletion failed")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Download Your Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Your Data
          </CardTitle>
          <CardDescription>
            Export all your data in a machine-readable format (GDPR compliant).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Data (ZIP)
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Includes: profile, page settings, cards, analytics summary, collected emails, and images.
          </p>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone after 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This will disable your account immediately and schedule permanent deletion in 30 days.
                  </p>
                  <p className="font-medium">
                    You can recover your account by logging in within 30 days.
                  </p>
                  <p>
                    To confirm, type your username:{" "}
                    <span className="font-mono font-semibold">{username}</span>
                  </p>
                  <Input
                    placeholder="Type your username"
                    value={confirmUsername}
                    onChange={(e) => setConfirmUsername(e.target.value)}
                    className="mt-2"
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={confirmUsername !== username || isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete My Account"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-xs text-muted-foreground mt-3">
            Your page will be unpublished immediately. All data will be permanently deleted after 30 days.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
