import { useEffect, useState, type InputHTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { softPasswordField, V, withAppFormDefaults } from '@/lib/validation'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/features/auth/services/auth.service'
import {
  getErpHomePath,
  isTenantUserManagerRole,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'
import { useAuthStore } from '@/store/authStore'

const NAVY = '#0A2942'
const ORANGE = '#FF751F'

const schema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: softPasswordField(8),
    confirm_password: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: V.passwordMatch,
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: V.passwordDifferent,
    path: ['new_password'],
  })

type FormValues = z.infer<typeof schema>

function extractErrorMessage(error: unknown): string {
  const ax = error as {
    response?: { data?: { message?: string | string[]; error?: string } }
    message?: string
  }
  const msg = ax.response?.data?.message
  if (Array.isArray(msg) && msg[0]) return String(msg[0])
  if (typeof msg === 'string' && msg.trim()) return msg
  if (typeof ax.response?.data?.error === 'string') return ax.response.data.error
  if (error instanceof Error && error.message) return error.message
  return 'Could not change password. Please try again.'
}

/**
 * Change password:
 * - Tenant Admin → POST /auth/tenant/change-password (TenantChangePasswordDto)
 * - Staff / User → POST /auth/change-password (ChangePasswordDto)
 */
export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const clearMustChangePassword = useAuthStore((s) => s.clearMustChangePassword)
  const forced = Boolean(user?.mustChangePassword)
  const isTenantAdmin = isTenantUserManagerRole(resolveAuthRoleSlug(user?.role))

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>(withAppFormDefaults({
    resolver: zodResolver(schema),
  }))

  const current = watch('current_password')
  const next = watch('new_password')
  const confirm = watch('confirm_password')

  useEffect(() => {
    if (apiError) setApiError(null)
  }, [current, next, confirm]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (values: FormValues) => {
    if (submitting) return
    setSubmitting(true)
    setApiError(null)
    const dto = {
      current_password: values.current_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    }
    try {
      if (isTenantAdmin) {
        await authService.changeTenantPassword(dto)
      } else {
        await authService.changePassword(dto)
      }
      clearMustChangePassword()
      navigate(getErpHomePath(resolveAuthRoleSlug(user?.role)), { replace: true })
    } catch (err) {
      setApiError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) return null

  const title = forced
    ? 'Set your password'
    : isTenantAdmin
      ? 'Change tenant password'
      : 'Change password'

  const description = forced
    ? isTenantAdmin
      ? 'Choose a new workspace password. Use it next time on ERP Login → Tenant Admin (slug + password).'
      : 'You signed in with a temporary password. Choose your own password to continue. Use this new password for future Staff / User logins.'
    : isTenantAdmin
      ? 'Update the Tenant Admin workspace password. Next login uses slug + this new password.'
      : 'Update your staff account password. You will use it next time on Staff / User login.'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, #0f3a5c 45%, #163d52 100%)`,
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100 p-6 sm:p-8 space-y-5">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${ORANGE}18`, color: ORANGE }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
            {(user?.email || isTenantAdmin) && (
              <p className="mt-2 text-xs text-slate-400">
                {isTenantAdmin ? (
                  <>
                    Signed in as{' '}
                    <span className="font-medium text-slate-600">Tenant Admin</span>
                    {user?.email ? (
                      <>
                        {' '}
                        · <span className="font-medium text-slate-600">{user.email}</span>
                      </>
                    ) : null}
                  </>
                ) : (
                  <>
                    Signed in as <span className="font-medium text-slate-600">{user?.email}</span>
                  </>
                )}
              </p>
            )}
          </div>
        </div>

        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <PasswordField
            id="current_password"
            label={forced && !isTenantAdmin ? 'Temporary password' : 'Current password'}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            error={errors.current_password?.message}
            autoComplete="current-password"
            disabled={submitting}
            {...register('current_password')}
          />
          <PasswordField
            id="new_password"
            label="New password"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            error={errors.new_password?.message}
            autoComplete="new-password"
            disabled={submitting}
            hint="At least 8 characters, with a letter and a number"
            {...register('new_password')}
          />
          <PasswordField
            id="confirm_password"
            label="Confirm new password"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            error={errors.confirm_password?.message}
            autoComplete="new-password"
            disabled={submitting}
            {...register('confirm_password')}
          />

          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : forced ? (
              'Save password & continue'
            ) : (
              'Update password'
            )}
          </Button>
        </form>

        {!forced && (
          <p className="text-center text-xs text-slate-400">
            <Link
              to={getErpHomePath(resolveAuthRoleSlug(user?.role))}
              className="text-slate-600 hover:underline"
            >
              Back to dashboard
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

type PasswordFieldProps = {
  id: string
  label: string
  show: boolean
  onToggle: () => void
  error?: string
  hint?: string
  autoComplete?: string
  disabled?: boolean
} & InputHTMLAttributes<HTMLInputElement>

function PasswordField({
  id,
  label,
  show,
  onToggle,
  error,
  hint,
  autoComplete,
  disabled,
  ...rest
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          className={`h-11 w-full rounded-lg border bg-white pl-9 pr-10 text-sm text-slate-800 outline-none focus:ring-2 ${
            error
              ? 'border-red-300 focus:ring-red-100'
              : 'border-slate-200 focus:border-[#FF751F] focus:ring-[#FF751F]/15'
          }`}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  )
}
