import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditorClientWrapper } from "@/components/editor/editor-client-wrapper"

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

  return <EditorClientWrapper username={profile.username} />
}
