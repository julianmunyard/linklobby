// GET /api/legal/export-data
// GDPR data export endpoint - returns ZIP file with all user data

import { createClient } from "@/lib/supabase/server"
import { exportUserData } from "@/lib/legal/export-user-data"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate ZIP file
    const zipData = await exportUserData(user.id, supabase)

    // Return ZIP as download
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    const filename = `linklobby-data-export-${today}.zip`

    return new NextResponse(Buffer.from(zipData), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipData.length.toString(),
      },
    })
  } catch (error) {
    console.error("Data export error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    )
  }
}
