import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { EditorLayout } from "@/components/editor/editor-layout"

export default async function EditorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single()

  if (!profile?.username) {
    redirect("/signup")
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Editor header with username, URL, save status */}
        <DashboardHeader username={profile.username} />

        {/* Split-screen editor */}
        <div className="flex-1 overflow-hidden">
          <EditorLayout />
        </div>
      </div>
    </TooltipProvider>
  )
}
