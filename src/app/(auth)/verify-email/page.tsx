import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <Card className="bg-card/80 backdrop-blur-xl border-white/10">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We&apos;ve sent you a verification link. Please check your inbox and click
          the link to verify your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
        <Button variant="outline" asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
