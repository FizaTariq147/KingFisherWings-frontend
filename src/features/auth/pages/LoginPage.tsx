import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye, EyeOff, Loader2, AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { erpPostAuthPath } from '@/features/auth/utils/postLoginPath'
import { stripSensitiveSearchParams } from '@/lib/stripSensitiveSearchParams'
import { wakeApi } from '@/lib/wakeApi'
import { AuthLandingShell } from '@/features/auth/components/AuthLandingShell'
import { AcceptInvitePopup } from '@/features/auth/components/AcceptInvitePopup'
import { LoginPopupFrame, popupInputClass, popupLabelClass, popupSubmitClass } from '@/features/auth/components/LoginPopupFrame'

function erpHomeFromAuthStore(): string {
  return erpPostAuthPath(useAuthStore.getState().user)
}

// ── Brand tokens ───────────────────────────────────────────────────────────
const NAVY     = '#0A2942'

// ── Zod schemas — match Swagger LoginDto / TenantLoginDto ─────────────────
const tenantAdminSchema = z.object({
  tenant_slug: z.string().trim().min(1, 'Tenant slug is required'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
})

const staffSchema = z.object({
  tenant_slug: z.string().trim().min(1, 'Tenant slug is required'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
})

type StaffFormValues = z.infer<typeof staffSchema>
type TenantAdminFormValues = z.infer<typeof tenantAdminSchema>
type FormValues = {
  tenant_slug: string
  email?: string
  password: string
  remember_me?: boolean
}
type LoginMode = 'tenant_admin' | 'staff'

function defaultDeviceName(): string {
  return 'Web'
}

// ─────────────────────────────────────────────────────────────────────────
// LOGIN MODAL
// ─────────────────────────────────────────────────────────────────────────
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { loginTenant, loginStaff, isLoading } = useAuthStore()
  const [loginMode, setLoginMode] = useState<LoginMode>('tenant_admin')
  const [showPw, setShowPw]   = useState(false)
  const [apiErr, setApiErr]   = useState<string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const [agreed, setAgreed]   = useState(false)
  const [agreedTouched, setAgreedTouched] = useState(false)

  const [forgotOpen, setForgotOpen]     = useState(false)
  const [forgotEmail, setForgotEmail]   = useState('')
  const [forgotErr, setForgotErr]       = useState<string | null>(null)
  const [forgotSending, setForgotSending] = useState(false)
  const [forgotSent, setForgotSent]     = useState(false)
  const forgotInputRef = useRef<HTMLInputElement>(null)

  const schema = loginMode === 'staff' ? staffSchema : tenantAdminSchema

  const { register, handleSubmit, formState: { errors }, watch, reset, setFocus } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      tenant_slug: '',
      email: '',
      password: '',
      remember_me: true,
    },
  })

  const slug = watch('tenant_slug')
  const email = watch('email')
  const pv = watch('password')
  useEffect(() => { if (apiErr) setApiErr(null) }, [slug, email, pv, loginMode]) // eslint-disable-line

  useEffect(() => {
    if (open) setTimeout(() => setFocus('tenant_slug'), 80)
  }, [open, setFocus])

  useEffect(() => {
    if (!open) {
      reset(); setApiErr(null); setStatusMsg(null); setShowPw(false); setAgreed(false); setAgreedTouched(false)
      setLoginMode('tenant_admin')
      setForgotOpen(false); setForgotEmail(''); setForgotErr(null); setForgotSent(false)
    }
  }, [open, reset])

  useEffect(() => {
    if (forgotOpen) {
      setForgotEmail(''); setForgotErr(null); setForgotSent(false)
      setTimeout(() => forgotInputRef.current?.focus(), 80)
    }
  }, [forgotOpen])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (forgotOpen) setForgotOpen(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose, forgotOpen])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const onSubmit = async (v: FormValues) => {
    if (isLoading) return
    if (!agreed) { setAgreedTouched(true); return }
    setApiErr(null)

    const parsed =
      loginMode === 'staff' ? staffSchema.safeParse(v) : tenantAdminSchema.safeParse(v)
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message
      setApiErr(first || 'Please check your credentials.')
      return
    }

    const device_name = defaultDeviceName()
    setStatusMsg('Waking API (Render free tier can take up to ~90s)…')
    const awake = await wakeApi(90_000)
    setStatusMsg(awake ? 'Signing in…' : 'API still cold — signing in with retries…')

    if (loginMode === 'staff') {
      const values = parsed.data as StaffFormValues
      await loginStaff({
        tenant_slug: values.tenant_slug,
        email: values.email,
        password: values.password,
        ...(values.remember_me ? { remember_me: true } : {}),
        device_name,
      })
    } else {
      const values = parsed.data as TenantAdminFormValues
      await loginTenant({
        tenant_slug: values.tenant_slug,
        password: values.password,
        ...(values.remember_me ? { remember_me: true } : {}),
        device_name,
      })
    }
    setStatusMsg(null)
    const s = useAuthStore.getState()
    if (s.isAuthenticated) {
      onClose()
      navigate(erpHomeFromAuthStore())
    } else {
      setApiErr(s.error ?? 'Incorrect credentials. Please try again.')
    }
  }

  const handleForgotSend = async () => {
    setForgotErr(
      'Password reset is not available through the current API. Contact your Tenant Admin or platform support.',
    )
    setForgotSending(false)
    setForgotSent(false)
  }

  if (!open) return null

  return (
    <>
      <LoginPopupFrame title="Admin Sign In" onClose={onClose} compact>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2.5">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => { setLoginMode('tenant_admin'); setApiErr(null) }}
              className="rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors"
              style={{
                background: loginMode === 'tenant_admin' ? NAVY : 'transparent',
                color: loginMode === 'tenant_admin' ? '#fff' : '#64748b',
              }}
            >
              Tenant Admin
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('staff'); setApiErr(null) }}
              className="rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors"
              style={{
                background: loginMode === 'staff' ? NAVY : 'transparent',
                color: loginMode === 'staff' ? '#fff' : '#64748b',
              }}
            >
              Staff / User
            </button>
          </div>

          <div>
            <label htmlFor="kf-tenant-slug" className={popupLabelClass}>Workspace</label>
            <input
              id="kf-tenant-slug"
              type="text"
              autoComplete="off"
              placeholder="tenant_slug"
              disabled={isLoading}
              aria-invalid={!!errors.tenant_slug}
              {...register('tenant_slug')}
              className={popupInputClass}
            />
            {errors.tenant_slug && (
              <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                <AlertCircle size={11} />{errors.tenant_slug.message}
              </p>
            )}
          </div>

          {loginMode === 'staff' && (
            <div>
              <label htmlFor="kf-email" className={popupLabelClass}>Email</label>
              <input
                id="kf-email"
                type="email"
                autoComplete="off"
                placeholder="user email"
                disabled={isLoading}
                aria-invalid={!!errors.email}
                {...register('email')}
                className={popupInputClass}
              />
              {errors.email && (
                <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                  <AlertCircle size={11} />{errors.email.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="kf-pw" className={popupLabelClass}>Password</label>
            <div className="relative">
              <input
                id="kf-pw"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={loginMode === 'staff' ? 'temporary password' : 'password'}
                disabled={isLoading}
                aria-invalid={!!errors.password}
                {...register('password')}
                className={`${popupInputClass} pr-10 [&::-ms-reveal]:hidden`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-[calc(50%+2px)] -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
                <AlertCircle size={11} />{errors.password.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="mt-1 ml-auto block text-[12px] font-medium text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300"
              style={{ accentColor: NAVY }}
              {...register('remember_me')}
            />
            <span className="text-[12.5px] text-slate-600">Remember me on this device</span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setAgreedTouched(true) }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
              style={{ accentColor: NAVY }}
            />
            <span className="text-[12px] leading-snug text-slate-600">
              I agree to the{' '}
              <Link to="/usage-policy" className="font-semibold hover:underline" style={{ color: NAVY }} onClick={(e) => e.stopPropagation()}>
                usage policy
              </Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="font-semibold hover:underline" style={{ color: NAVY }} onClick={(e) => e.stopPropagation()}>
                privacy policy
              </Link>
            </span>
          </label>
          {agreedTouched && !agreed && (
            <p role="alert" className="flex items-center gap-1 text-[11px] text-red-500">
              <AlertCircle size={11} />You must agree before continuing.
            </p>
          )}

          {statusMsg && (
            <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600">
              <Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" /><span>{statusMsg}</span>
            </div>
          )}
          {apiErr && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-600">
              <AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{apiErr}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className={popupSubmitClass}
            style={{ background: NAVY }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </LoginPopupFrame>

      {forgotOpen && (
        <LoginPopupFrame title="Forgot Password" onClose={() => setForgotOpen(false)}>
          {forgotSent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[12.5px] text-emerald-700">
              If an account exists for that email, a reset link has been sent.
            </div>
          ) : (
            <>
              <label htmlFor="kf-forgot-email" className={popupLabelClass}>Email</label>
              <input
                id="kf-forgot-email"
                ref={forgotInputRef}
                type="email"
                placeholder="Email as username"
                value={forgotEmail}
                disabled={forgotSending}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleForgotSend() }}
                className={popupInputClass}
              />
              {forgotErr && (
                <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                  <AlertCircle size={11} />{forgotErr}
                </p>
              )}
              <button
                type="button"
                onClick={() => void handleForgotSend()}
                disabled={forgotSending}
                className={`${popupSubmitClass} mt-4`}
                style={{ background: NAVY }}
              >
                {forgotSending ? 'Sending…' : 'Send'}
              </button>
            </>
          )}
        </LoginPopupFrame>
      )}
    </>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [inviteToken] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return (params.get('token') || params.get('invite') || '').trim()
  })
  const [loginOpen, setLoginOpen] = useState(() => searchParams.get('admin') === '1' && !inviteToken)
  const [inviteOpen, setInviteOpen] = useState(() => Boolean(inviteToken))
  const [inviteDone, setInviteDone] = useState(false)

  useEffect(() => {
    if (inviteToken) {
      stripSensitiveSearchParams(searchParams, setSearchParams)
    }
  }, [inviteToken, searchParams, setSearchParams])

  useEffect(() => {
    if (isAuthenticated && !inviteToken) {
      navigate(erpHomeFromAuthStore(), { replace: true })
    }
  }, [isAuthenticated, inviteToken, navigate])

  useEffect(() => {
    if (searchParams.get('admin') === '1' && !inviteToken) {
      setLoginOpen(true)
      searchParams.delete('admin')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, inviteToken])

  const closeAdmin = () => setLoginOpen(false)

  return (
    <AuthLandingShell
      onAdminClick={() => setLoginOpen(true)}
      videoOnly={loginOpen || inviteOpen}
    >
      <LoginModal open={loginOpen} onClose={closeAdmin} />
      {inviteOpen && inviteToken && (
        <AcceptInvitePopup
          token={inviteToken}
          onClose={() => setInviteOpen(false)}
          onAccepted={() => {
            setInviteOpen(false)
            setInviteDone(true)
            setLoginOpen(true)
          }}
        />
      )}
      {inviteDone && loginOpen && (
        <p className="sr-only">Invite accepted. Sign in with Staff / User.</p>
      )}
    </AuthLandingShell>
  )
}
