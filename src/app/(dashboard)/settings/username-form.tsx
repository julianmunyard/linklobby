'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens'),
})

type UsernameFormData = z.infer<typeof usernameSchema>

interface UsernameFormProps {
  currentUsername: string
}

export function UsernameForm({ currentUsername }: UsernameFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: currentUsername,
    },
  })

  async function onSubmit(data: UsernameFormData) {
    setError(null)
    setSuccess(false)

    if (data.username.toLowerCase() === currentUsername.toLowerCase()) {
      setError('New username is the same as current')
      return
    }

    // Use the update_username RPC function
    const { error: updateError } = await supabase.rpc('update_username', {
      new_username: data.username.toLowerCase()
    })

    if (updateError) {
      if (updateError.message.includes('already taken')) {
        setError('Username is already taken')
      } else {
        setError(updateError.message)
      }
      return
    }

    setSuccess(true)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Username</CardTitle>
        <CardDescription>
          Your public URL will change to linklobby.com/{'{new-username}'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">linklobby.com/</span>
              <Input
                id="username"
                {...register('username')}
                className="flex-1"
              />
            </div>
            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
              Username updated successfully!
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Username'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
