import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/features/auth/services/auth.service'
import { withAuthThrottleMessage } from '@/features/auth/utils/authThrottleMessage'
import { softPasswordField, V } from '@/lib/validation'
import { stripSensitiveSearchParams } from '@/lib/stripSensitiveSearchParams'

const schema = z
  .object({
    new_password: softPasswordField(8),
    confirm_password: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: V.passwordMatch,
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

function extractError(error: unknown): string {
  const ax = error as {
    response?: { data?: { message?: string | string[] }; status?: number }
    message?: string
  }
  const msg = ax.response?.data?.message
  const detail = Array.isArray(msg)
    ? String(msg[0] || '')
    : typeof msg === 'string'
      ? msg
      : error instanceof Error
        ? error.message
        : 'Could not reset password.'
  return withAuthThrottleMessage(error, detail || 'Could not reset password.')
}

/**
 * Staff password reset from email token — POST /auth/reset-password.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [token] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return (params.get('token') || '').trim()
  })
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: '', confirm_password: '' },
  })

  useEffect(() => {
    if (token) stripSensitiveSearchParams(searchParams, setSearchParams)
  }, [token, searchParams, setSearchParams])

  const onSubmit = async (values: FormValues) => {
    if (!token) return
    setApiError(null)
    try {
      await authService.resetPassword({
        token,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      })
      setDone(true)
    } catch (err) {
      setApiError(extractError(err))
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-4">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--color-primary-50)' }}
            >
              <AlertCircle size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">
                Reset link missing
              </h1>
              <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
                Open the link from your password-reset email, or request a new one.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/forgot-password">
              <Button type="button">Request reset link</Button>
            </Link>
            <Link to="/login">
              <Button type="button" variant="secondary">
                <ArrowLeft size={16} />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--color-primary-50)' }}
          >
            <Lock size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">
              Set a new password
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              Choose a new password for your staff account, then sign in.
            </p>
          </div>
        </div>

        {done ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
              Password updated. You can sign in with your new password.
            </div>
            <Button type="button" onClick={() => navigate('/login', { replace: true })}>
              Go to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <div>
              <label
                htmlFor="reset-new"
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="reset-new"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 pr-10 text-sm"
                  {...register('new_password')}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.new_password ? (
                <p className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="reset-confirm"
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 pr-10 text-sm"
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm_password ? (
                <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
              ) : null}
            </div>
            {apiError ? (
              <p role="alert" className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle size={14} />
                {apiError}
              </p>
            ) : null}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Update password'
              )}
            </Button>
          </form>
        )}

        <Link to="/login" className="inline-flex text-sm text-[var(--color-neutral-500)] hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  )
}
