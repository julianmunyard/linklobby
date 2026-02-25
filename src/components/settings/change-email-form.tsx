'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const changeEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
})

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>

interface ChangeEmailFormProps {
  userEmail: string
}

export function ChangeEmailForm({ userEmail }: ChangeEmailFormProps) {
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
  })

  async function onSubmit(data: ChangeEmailFormData) {
    setError(null)
    setSuccessEmail(null)

    // Re-authenticate with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: data.currentPassword,
    })

    if (signInError) {
      setError('Current password is incorrect')
      return
    }

    // Request email change — Supabase sends verification to new address
    const { error: updateError } = await supabase.auth.updateUser({
      email: data.newEmail,
    })

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccessEmail(data.newEmail)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Email</CardTitle>
        <CardDescription>
          Current email: <span className="font-medium text-foreground">{userEmail}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              {...register('newEmail')}
              autoComplete="email"
            />
            {errors.newEmail && (
              <p className="text-sm text-destructive">{errors.newEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailCurrentPassword">Current Password</Label>
            <Input
              id="emailCurrentPassword"
              type="password"
              {...register('currentPassword')}
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {successEmail && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
              Verification email sent to {successEmail}. Please check your inbox to confirm the change.
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Update Email'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
