import type { Viewport } from "next"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeApplicator } from "@/components/theme-applicator"

// Prevent native pinch-to-zoom on the editor — zoom is handled by our CSS transform gestures
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get sidebar state from cookie for persistence
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  // Get current user's username for sidebar
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username: string | undefined
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
    username = profile?.username
  }

  return (
    <ThemeApplicator>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar username={username} />
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="h-6" />
            {/* Header content will be added by individual pages or Plan 04 */}
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ThemeApplicator>
  )
}
