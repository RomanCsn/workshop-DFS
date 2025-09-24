'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { auth } from '@/lib/auth'

import type { PasswordActionState } from './contracts'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export async function changePasswordAction(
  _prevState: PasswordActionState | undefined,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = passwordSchema.safeParse({
    currentPassword: getFormValue(formData, 'currentPassword'),
    newPassword: getFormValue(formData, 'newPassword'),
    confirmPassword: getFormValue(formData, 'confirmPassword'),
    revokeOtherSessions: formData.get('revokeOtherSessions') === 'on',
  })

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten()
    return {
      status: 'error',
      message: 'Please review the highlighted fields.',
      fieldErrors: {
        currentPassword: fieldErrors.currentPassword?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    }
  }

  try {
    const headerList = await headers()

    await auth.api.changePassword({
      headers: headerList,
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: parsed.data.revokeOtherSessions,
      },
    })

    if (parsed.data.revokeOtherSessions) {
      revalidatePath('/dashboard/settings')
    }

    return {
      status: 'success',
      message: 'Password updated successfully.',
    }
  } catch (error) {
    console.error('changePasswordAction', error)

    return {
      status: 'error',
      message: 'Unable to update password. Double-check your details and try again.',
    }
  }
}

type SimpleActionResponse = {
  status: 'success' | 'error'
  message: string
}

export async function revokeSessionAction(token: string): Promise<SimpleActionResponse> {
  if (!token) {
    return {
      status: 'error',
      message: 'Missing session token.',
    }
  }

  try {
    const headerList = await headers()

    await auth.api.revokeSession({
      headers: headerList,
      body: { token },
    })

    revalidatePath('/dashboard/settings')

    return {
      status: 'success',
      message: 'Session revoked.',
    }
  } catch (error) {
    console.error('revokeSessionAction', error)

    return {
      status: 'error',
      message: 'Failed to revoke the selected session.',
    }
  }
}

export async function revokeOtherSessionsAction(): Promise<SimpleActionResponse> {
  try {
    const headerList = await headers()

    await auth.api.revokeOtherSessions({
      headers: headerList,
    })

    revalidatePath('/dashboard/settings')

    return {
      status: 'success',
      message: 'All other sessions have been signed out.',
    }
  } catch (error) {
    console.error('revokeOtherSessionsAction', error)

    return {
      status: 'error',
      message: 'Unable to revoke sessions right now. Please try again shortly.',
    }
  }
}

function getFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key)
  return typeof value === 'string' ? value : undefined
}
