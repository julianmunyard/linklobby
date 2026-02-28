import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Squares } from '@/components/ui/squares-background'

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-neutral-950 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <Squares
          direction="diagonal"
          speed={0.5}
          borderColor="#696249"
          squareSize={40}
          hoverFillColor="#956232"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 text-white">LinkLobby</h1>
        <p className="text-neutral-400 mb-8">Your link-in-bio, reimagined for artists</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
