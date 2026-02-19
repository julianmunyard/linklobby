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
    <div className="h-full overflow-auto p-4 sm:p-8">
      <header className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/editor">Back to Editor</Link>
        </Button>
      </header>

      <main className="max-w-md">
        <UsernameForm currentUsername={profile?.username || ''} />
      </main>
    </div>
  )
}
