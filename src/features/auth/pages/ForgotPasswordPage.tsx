import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/features/auth/services/auth.service'
import { withAuthThrottleMessage } from '@/features/auth/utils/authThrottleMessage'

const schema = z.object({
  tenant_slug: z.string().trim().min(2, 'Workspace username is required'),
  email: z.string().trim().email('Enter a valid email address'),
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
        : 'Could not send reset email.'
  return withAuthThrottleMessage(error, detail || 'Could not send reset email.')
}

/**
 * Staff self-service forgot password — POST /auth/forgot-password.
 * Emails a reset link; complete via /reset-password?token=…
 */
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tenant_slug: '', email: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setApiError(null)
    try {
      await authService.forgotPassword(values)
      setSent(true)
    } catch (err) {
      setApiError(extractError(err))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--color-primary-50)' }}
          >
            <Mail size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">
              Forgot password
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              Enter your workspace username and staff email. If an account exists, we send a reset
              link.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
            If an account exists for that email, a password reset link has been sent. Check your
            inbox, then open the link to choose a new password.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <div>
              <label
                htmlFor="forgot-tenant"
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]"
              >
                Workspace username
              </label>
              <input
                id="forgot-tenant"
                autoComplete="organization"
                className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                {...register('tenant_slug')}
              />
              {errors.tenant_slug ? (
                <p className="mt-1 text-xs text-red-600">{errors.tenant_slug.message}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-1 block text-xs font-medium text-[var(--color-neutral-600)]"
              >
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                className="w-full rounded-md border border-[var(--color-neutral-200)] px-3 py-2 text-sm"
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
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
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
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
