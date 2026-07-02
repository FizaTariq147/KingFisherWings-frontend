import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { axiosInstance } from '@/lib/axios'

// ── Strength logic ─────────────────────────────────────────────────────────
type PasswordStrength = 'weak' | 'fair' | 'strong'

function getStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak'
  const hasNumber  = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  if (hasNumber && hasSpecial) return 'strong'
  return 'fair'
}

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { label: string; width: string; color: string }
> = {
  weak:   { label: 'Weak',   width: 'w-1/3', color: 'bg-red-500'   },
  fair:   { label: 'Fair',   width: 'w-2/3', color: 'bg-amber-400' },
  strong: { label: 'Strong', width: 'w-full', color: 'bg-green-500' },
}

// ── Schema ─────────────────────────────────────────────────────────────────
const resetSchema = z
  .object({
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetSchema>

const REDIRECT_SECONDS = 3

// ── Component ──────────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const navigate          = useNavigate()
  const [searchParams]    = useSearchParams()
  const token             = searchParams.get('token')

  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)
  const [apiError, setApiError]       = useState<string | null>(null)
  const [success, setSuccess]         = useState(false)
  const [countdown, setCountdown]     = useState(REDIRECT_SECONDS)
  const timerRef                      = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    mode: 'onTouched',
  })

  const newPasswordValue = watch('newPassword') ?? ''
  const confirmValue     = watch('confirmPassword') ?? ''

  // Clear stale API error when user edits either field
  useEffect(() => {
    if (apiError) setApiError(null)
  }, [newPasswordValue, confirmValue]) // eslint-disable-line react-hooks/exhaustive-deps
  const strength         = newPasswordValue.length > 0
    ? getStrength(newPasswordValue)
    : null

  // Token guard — redirect if missing
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', {
        state: { toast: 'Invalid or expired link. Please request a new one.' },
      })
    }
  }, [token, navigate])

  // Start redirect countdown after success
  useEffect(() => {
    if (!success) return
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          navigate('/login')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [success, navigate])

  const onSubmit = async (values: ResetFormValues) => {
    if (isLoading) return   // double-submit guard
    setIsLoading(true)
    setApiError(null)
    try {
      await axiosInstance.post('/api/auth/reset-password', {
        token,
        newPassword: values.newPassword,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 400 || status === 410) {
        setApiError('This reset link has expired or already been used. Please request a new one.')
      } else if (status === 404) {
        setApiError('Invalid reset link. Please request a new one.')
      } else if (!status) {
        setApiError('Unable to reach the server. Please check your connection.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) return null // redirecting

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">F</span>
          </div>
          <span className="text-gray-900 text-lg font-semibold">KingFisher Tech Gold</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8">
          {/* ── Success state ─────────────────────────────────────────────── */}
          {success ? (
            <>
              <div
                role="status"
                className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2.5 text-sm mb-5"
              >
                <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                <span>Password updated successfully.</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                All done!
              </h1>
              <p className="text-sm text-gray-500">
                Redirecting to sign in in{' '}
                <span className="font-medium text-gray-700">{countdown}s</span>
                …
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                Set new password
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Choose a strong password — at least 8 characters.
              </p>

              {apiError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm mb-4"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New password
                  </label>
                  <div
                    className={[
                      'flex items-center rounded-lg border bg-white px-3 transition-all',
                      errors.newPassword ? 'border-red-500' : 'border-gray-300',
                    ].join(' ')}
                  >
                    <Lock
                      size={15}
                      aria-hidden="true"
                      className={`flex-shrink-0 mr-2 ${
                        errors.newPassword ? 'text-red-500' : 'text-gray-400'
                      }`}
                    />
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      aria-label="New password"
                      aria-invalid={!!errors.newPassword}
                      aria-describedby={
                        errors.newPassword ? 'new-pw-error' : 'pw-strength'
                      }
                      {...register('newPassword')}
                      className="flex-1 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {newPasswordValue.length > 0 && strength && (
                    <div id="pw-strength" className="mt-2" aria-live="polite">
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={[
                            'h-full rounded-full transition-all duration-300',
                            STRENGTH_CONFIG[strength].width,
                            STRENGTH_CONFIG[strength].color,
                          ].join(' ')}
                        />
                      </div>
                      <p
                        className={[
                          'mt-1 text-xs font-medium',
                          strength === 'weak'   ? 'text-red-600'   : '',
                          strength === 'fair'   ? 'text-amber-600' : '',
                          strength === 'strong' ? 'text-green-600' : '',
                        ].join(' ')}
                      >
                        {STRENGTH_CONFIG[strength].label}
                      </p>
                    </div>
                  )}

                  {errors.newPassword && (
                    <p
                      id="new-pw-error"
                      role="alert"
                      className="mt-1 flex items-center gap-1 text-xs text-red-600"
                    >
                      <AlertCircle size={11} />
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm password
                  </label>
                  <div
                    className={[
                      'flex items-center rounded-lg border bg-white px-3 transition-all',
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300',
                    ].join(' ')}
                  >
                    <Lock
                      size={15}
                      aria-hidden="true"
                      className={`flex-shrink-0 mr-2 ${
                        errors.confirmPassword ? 'text-red-500' : 'text-gray-400'
                      }`}
                    />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      aria-label="Confirm new password"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword ? 'confirm-pw-error' : undefined
                      }
                      {...register('confirmPassword')}
                      className="flex-1 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      id="confirm-pw-error"
                      role="alert"
                      className="mt-1 flex items-center gap-1 text-xs text-red-600"
                    >
                      <AlertCircle size={11} />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    'Set new password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}