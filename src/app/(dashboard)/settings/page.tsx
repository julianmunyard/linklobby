import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UsernameForm } from './username-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/editor">Back to Editor</Link>
        </Button>
      </header>

      <main className="max-w-md">
        <UsernameForm currentUsername={profile?.username || ''} />
      </main>
    </div>
  )
}
