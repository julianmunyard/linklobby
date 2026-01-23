import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">LinkLobby</h1>
      <p className="text-muted-foreground mb-8">Your link-in-bio, reimagined for artists</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    </main>
  )
}
