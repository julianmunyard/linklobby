// src/lib/fan-tools/csv-export.ts
// CSV export utility for collected emails

import type { CollectedEmail } from "@/types/fan-tools"

/**
 * Escape a value for CSV format
 * - Wrap in quotes if contains comma, quote, or newline
 * - Double-escape any existing quotes
 */
function escapeCSVValue(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return ""
  }

  const str = String(value)

  // Check if escaping is needed
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    // Double-escape quotes and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Format a date string for CSV export
 */
function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return ""

  try {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return isoString
  }
}

/**
 * Export collected emails to CSV and trigger browser download
 */
export function exportEmailsToCSV(emails: CollectedEmail[], filename: string): void {
  // CSV header
  const header = "Email,Name,Collected At"

  // CSV rows
  const rows = emails.map((email) => {
    const escapedEmail = escapeCSVValue(email.email)
    const escapedName = escapeCSVValue(email.name)
    const formattedDate = escapeCSVValue(formatDate(email.collected_at))

    return `${escapedEmail},${escapedName},${formattedDate}`
  })

  // Combine header and rows
  const csvContent = [header, ...rows].join("\n")

  // Create blob with BOM for Excel compatibility
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" })

  // Create temporary anchor element for download
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}
