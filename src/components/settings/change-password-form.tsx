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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface ChangePasswordFormProps {
  userEmail: string
}

export function ChangePasswordForm({ userEmail }: ChangePasswordFormProps) {
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  async function onSubmit(data: ChangePasswordFormData) {
    setError(null)
    setSuccess(false)

    // Re-authenticate with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: data.currentPassword,
    })

    if (signInError) {
      setError('Current password is incorrect')
      return
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    })

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    reset()

    // Auto-clear success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password. You&apos;ll need to confirm your current password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              autoComplete="current-password"
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-500 text-sm">
              Password updated successfully!
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
