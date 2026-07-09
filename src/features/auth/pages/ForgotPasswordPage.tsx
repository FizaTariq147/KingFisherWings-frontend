import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { axiosInstance } from '@/lib/axios'

// ── Schema ─────────────────────────────────────────────────────────────────
const forgotSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type ForgotFormValues = z.infer<typeof forgotSchema>

const RESEND_SECONDS = 60

// ── Component ──────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step, setStep]           = useState<'enter' | 'sent'>('enter')
  const [sentTo, setSentTo]       = useState('')
  const [apiError, setApiError]   = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    mode: 'onTouched',
  })

  const emailValue = watch('email')

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function startCountdown() {
    setCountdown(RESEND_SECONDS)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const sendResetLink = async (email: string) => {
    setIsLoading(true)
    setApiError(null)  // always clear before new attempt
    try {
      await axiosInstance.post('/api/auth/forgot-password', { email })
      setSentTo(email)
      setStep('sent')
      startCountdown()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        setApiError('No account found with that email address.')
      } else if (status === 429) {
        setApiError('Too many reset requests. Please wait before trying again.')
      } else if (!status) {
        setApiError('Unable to reach the server. Please check your connection.')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (values: ForgotFormValues) => sendResetLink(values.email)

  const onResend = () => sendResetLink(sentTo)

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
          {/* ── Step 1: Enter email ──────────────────────────────────────── */}
          {step === 'enter' && (
            <>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                Reset your password
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we'll send a reset link.
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
                <div>
                  <label
                    htmlFor="fp-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <div
                    className={[
                      'flex items-center rounded-lg border bg-white px-3 transition-all',
                      errors.email
                        ? 'border-red-500'
                        : emailValue
                        ? 'border-green-500'
                        : 'border-gray-300',
                    ].join(' ')}
                  >
                    <Mail
                      size={15}
                      aria-hidden="true"
                      className={[
                        'flex-shrink-0 mr-2 transition-colors',
                        errors.email
                          ? 'text-red-500'
                          : emailValue
                          ? 'text-green-500'
                          : 'text-gray-400',
                      ].join(' ')}
                    />
                    <input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      disabled={isLoading}
                      aria-label="Email address"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'fp-email-error' : undefined}
                      {...register('email')}
                      className="flex-1 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
                    />
                  </div>
                  {errors.email && (
                    <p
                      id="fp-email-error"
                      role="alert"
                      className="mt-1 flex items-center gap-1 text-xs text-red-600"
                    >
                      <AlertCircle size={11} />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={13} />
                  Back to sign in
                </Link>
              </div>
            </>
          )}

          {/* ── Step 2: Email sent ───────────────────────────────────────── */}
          {step === 'sent' && (
            <>
              <div
                role="status"
                className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2.5 text-sm mb-5"
              >
                <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
                <span>
                  Reset link sent to <strong>{sentTo}</strong>
                </span>
              </div>

              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                Check your inbox
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Didn't receive it? Check your spam folder or resend below.
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

              <Button
                type="button"
                variant="ghost"
                disabled={countdown > 0 || isLoading}
                aria-busy={isLoading}
                onClick={onResend}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Sending…
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend link'
                )}
              </Button>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={13} />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}