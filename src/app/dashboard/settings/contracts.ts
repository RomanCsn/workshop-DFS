export type PasswordActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Partial<Record<'currentPassword' | 'newPassword' | 'confirmPassword', string>>
}

export const PASSWORD_INITIAL_STATE: PasswordActionState = {
  status: 'idle',
}
