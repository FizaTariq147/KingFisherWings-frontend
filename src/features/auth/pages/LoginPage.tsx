import { useState, useRef, useEffect, type ComponentType } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Phone, Mail, Lock, ArrowRight, ChevronDown,
  ShieldCheck, Cloud, Database, GraduationCap, LineChart,
  Settings, Headphones, Eye, EyeOff, Loader2, AlertCircle, X,
  Menu, Plane, Ship, Truck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  getErpHomePath,
  resolveAuthRoleSlug,
} from '@/features/users/constants/userPermissions'
import { wakeApi } from '@/lib/wakeApi'
import heroBg from '@/assets/hero-freight.jpg'
import logo from '@/assets/logo.png'

function erpHomeFromAuthStore(): string {
  const { user } = useAuthStore.getState()
  if (user?.mustChangePassword) return '/change-password'
  return getErpHomePath(resolveAuthRoleSlug(user?.role))
}

// ── Brand tokens ───────────────────────────────────────────────────────────
const NAVY     = '#0A2942'
const ORANGE   = '#FF751F'
const ORANGE_D = '#DD5F0D'
const SURFACE  = '#FFFFFF'

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
type FormValues = StaffFormValues
type LoginMode = 'tenant_admin' | 'staff'

function defaultDeviceName(): string {
  return 'Web'
}

// -------------------------------------------------------------------------
// NAVBAR — measured Bézier seam (pixel-fit to reference image)
// -------------------------------------------------------------------------
function NavCurvedShape({ className = '' }: { className?: string }) {
  // viewBox 200x90 with preserveAspectRatio="none" lets both width AND
  // height scale freely, so the curve's proportional shape holds at any
  // header height (mobile/tablet/desktop) without distortion of the seam.
  return (
    <svg
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 200 90"
      preserveAspectRatio="none"
      style={{ zIndex: 2 }}
    >
      <path d="M43,0 C50,28 47,57 59,90 L200,90 L200,0 Z" fill={NAVY} />
      <path
        d="M43,0 C50,28 47,57 59,90"
        fill="none"
        stroke={ORANGE}
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header
        className="relative z-40 w-full h-[64px] sm:h-[78px] md:h-[90px]"
        style={{ background: '#FFFFFF', overflow: 'hidden' }}
      >
        {/* ── NAVY CURVED SECTION (measured Bézier) ────────────────────── */}
        <NavCurvedShape />

        {/* ── Bottom orange baseline ─────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-[3px]"
          style={{ left: '29.5%', background: ORANGE, zIndex: 10 }}
        />

        {/* ── WHITE (LEFT) ZONE — logo ──────────────────────────────── */}
        <div
          className="relative flex items-center h-full shrink-0 pl-3 sm:pl-6 md:pl-[34px]"
          style={{ width: '25%', minWidth: 'clamp(84px, 22vw, 150px)', zIndex: 12 }}
        >
          <img
            src={logo}
            alt="KingFisher Wings"
            style={{ height: 'clamp(38px, 9vw, 72px)', width: 'auto', maxWidth: '160px' }}
          />
        </div>

        {/* ── NAVY (RIGHT) ZONE CONTENT ────────────────────────────────── */}
        <div
          className="absolute top-0 h-full flex items-center justify-between right-3 sm:right-6 md:right-8"
          style={{ left: '32%', zIndex: 12 }}
        >
          <div className="hidden xl:flex items-center gap-6 lg:gap-10">
            <a
              href="tel:+97155535286"
              className="flex items-center gap-2 hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', fontWeight: 500 }}
            >
              <Phone size={14} />
              +971 55 535 5286
            </a>
            <a
              href="mailto:info@kingfisherwings.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', fontWeight: 500 }}
            >
              <Mail size={14} />
              info@kingfisherwings.com
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center text-white transition-colors duration-200 px-3.5 sm:px-4 md:px-[22px] py-1.5 sm:py-2 md:py-2 text-[12px] sm:text-[13px] font-semibold"
              style={{
                border: `1.5px solid ${ORANGE}`,
                borderRadius: '6px',
                background: 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              Enquiry
            </Link>

            <button
              type="button"
              onClick={onLoginClick}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-white transition-colors duration-200 px-3 sm:px-4 md:px-[22px] py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-semibold"
              style={{
                background: ORANGE,
                borderRadius: '6px',
                border: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE_D }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ORANGE }}
            >
              <Lock size={13} strokeWidth={2.5} />
              Login
            </button>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(v => !v)}
              className="xl:hidden p-1.5 sm:p-2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="xl:hidden z-50 bg-white border-b border-slate-200 shadow flex flex-col gap-3 px-5 sm:px-6 py-4"
        >
          <a href="tel:+97155535286" className="flex items-center gap-2 hover:text-[#0A2942] transition-colors text-[14px]" style={{ color: '#4B5563' }}>
            <Phone size={14} /> +971 55 535 5286
          </a>
          <a href="mailto:info@kingfisherwings.com" className="flex items-center gap-2 hover:text-[#0A2942] transition-colors text-[14px]" style={{ color: '#4B5563' }}>
            <Mail size={14} /> info@kingfisherwings.com
          </a>
          <Link to="/contact" className="hover:text-[#0A2942] transition-colors text-[14px]" style={{ color: '#4B5563' }}>
            Enquiry
          </Link>
        </div>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PORTAL CARDS
// ─────────────────────────────────────────────────────────────────────────
interface PortalLink {
  label: string; to: string; primary?: boolean; openLogin?: boolean; center?: boolean
}
interface PortalCard {
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: Record<string, string | number> }>
  title: string
  description: string
  links: PortalLink[]
}

const PRIMARY_CARDS: PortalCard[] = [
  {
    icon: ShieldCheck,
    title: 'Single Sign-On',
    description: 'Access all platforms with one login',
    links: [
      { label: 'KingFisher Login Link 1', to: '/login', primary: true, openLogin: true, center: true },
      { label: 'KingFisher Login Link 2', to: '/login', openLogin: true, center: true },
      { label: 'KingFisher Login Link 3', to: '/login', openLogin: true, center: true },
    ],
  },
  {
    icon: Cloud,
    title: 'Private SAAS Login',
    description: 'Access your private SAAS portal',
    links: [
      { label: 'Private Login 1', to: '/login', primary: true, openLogin: true, center: true },
      { label: 'Private Login 2', to: '/login', openLogin: true, center: true },
      { label: 'Private Login 3', to: '/login', openLogin: true, center: true },
    ],
  },
  {
    icon: Database,
    title: 'Old Data Access',
    description: 'Access your old data and records',
    links: [
      { label: 'Please Contact Support', to: '/support', primary: true, center: true },
    ],
  },
]

const SECONDARY_CARDS: PortalCard[] = [
  {
    icon: GraduationCap,
    title: 'KingFisher Training',
    description: 'Access online training and certification',
    links: [{ label: 'KingFisher Gold – Online Training', to: '/training', primary: true, center: true }],
  },
  {
    icon: LineChart,
    title: 'KingFisher Analytics',
    description: 'Access analytics and insights portal',
    links: [{ label: 'Analytics Demo Login', to: '/analytics', primary: true, center: true }],
  },
]

function PortalBtn({
  label, to, primary, openLogin, center, onLoginClick, onSelect,
}: PortalLink & { onLoginClick?: () => void; onSelect?: () => void }) {
  const base = [
    'group flex items-center gap-2 w-full rounded-lg px-3.5 sm:px-4 py-2.5 sm:py-[11px]',
    center ? 'justify-center' : 'justify-between',
    'text-[12px] sm:text-[12.5px] font-semibold transition-all duration-200',
    'hover:-translate-y-0.5 active:translate-y-0',
  ].join(' ')

  if (openLogin && onLoginClick) {
    return (
      <button type="button" onClick={() => { onSelect?.(); onLoginClick() }}
        className={`${base} ${primary
          ? 'text-white'
          : 'border-[1.5px] border-slate-200 bg-white text-slate-600 hover:bg-[#0A2942] hover:border-[#0A2942] hover:text-white'}`}
        style={primary ? { background: NAVY } : undefined}
        onMouseEnter={e => { if (primary) (e.currentTarget as HTMLElement).style.background = ORANGE }}
        onMouseLeave={e => { if (primary) (e.currentTarget as HTMLElement).style.background = NAVY }}
      >
        <span className="truncate">{label}</span>
        {!center && <ArrowRight size={14} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:translate-x-1" />}
      </button>
    )
  }
  return (
    <Link to={to} onClick={() => onSelect?.()}
      className={`${base} ${primary
        ? 'text-white'
        : 'border-[1.5px] border-slate-200 bg-white text-slate-600 hover:bg-[#0A2942] hover:border-[#0A2942] hover:text-white'}`}
      style={primary ? { background: NAVY } : undefined}
      onMouseEnter={e => { if (primary) (e.currentTarget as HTMLElement).style.background = ORANGE }}
      onMouseLeave={e => { if (primary) (e.currentTarget as HTMLElement).style.background = NAVY }}
    >
      <span className="truncate">{label}</span>
      {!center && <ArrowRight size={14} strokeWidth={2.5} className="shrink-0 transition-transform group-hover:translate-x-1" />}
    </Link>
  )
}

function Card({ icon: Icon, title, description, links, delay = 0, onLoginClick }: PortalCard & { delay?: number; onLoginClick: () => void }) {
 
  const initialIndex = Math.max(links.findIndex(l => l.primary), 0)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  return (
    <div className="kf-up rounded-2xl border border-slate-300 bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(10,41,66,0.07)] hover:shadow-[0_12px_28px_rgba(10,41,66,0.11)] transition-shadow duration-300"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border"
          style={{ background: '#FFFFF', borderColor: '#FBDFC4' }}>
          <Icon size={20} strokeWidth={1.75} className="shrink-0" style={{ color: ORANGE }} />
        </div>
        <div>
          <h3 className="text-[14px] sm:text-[15px] font-bold leading-snug" style={{ color: NAVY }}>{title}</h3>
          <p className="text-[12px] sm:text-[12.5px] text-slate-400 leading-snug mt-0.5">{description}</p>
          <span className="mt-2 block h-[2px] w-8 rounded-full" style={{ background: ORANGE }} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {links.map((l, i) => (
          <PortalBtn
            key={l.label}
            {...l}
            primary={i === activeIndex}
            onLoginClick={l.openLogin ? onLoginClick : undefined}
            onSelect={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LOGIN MODAL
// ─────────────────────────────────────────────────────────────────────────
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { loginTenant, loginStaff, isLoading } = useAuthStore()
  const [step, setStep]       = useState<'signon' | 'credentials'>('signon')
  const [loginMode, setLoginMode] = useState<LoginMode>('staff')
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
    defaultValues: { tenant_slug: '', email: '', password: '', remember_me: true },
  })

  const slug = watch('tenant_slug'); const email = watch('email'); const pv = watch('password')
  useEffect(() => { if (apiErr) setApiErr(null) }, [slug, email, pv, loginMode]) // eslint-disable-line

  useEffect(() => {
    if (open && step === 'credentials') setTimeout(() => setFocus('tenant_slug'), 80)
  }, [open, step, setFocus])

  useEffect(() => {
    if (!open) {
      reset(); setApiErr(null); setStatusMsg(null); setShowPw(false); setStep('signon'); setAgreed(false); setAgreedTouched(false)
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
      // AuthController_login (LoginDto): tenant_slug + email + password
      await loginStaff({
        tenant_slug: values.tenant_slug,
        email: values.email,
        password: values.password,
        // Same optional fields Swagger typically leaves empty unless checked.
        ...(values.remember_me ? { remember_me: true } : {}),
        device_name,
      })
    } else {
      const values = parsed.data as TenantAdminFormValues
      // AuthController_tenantLogin (TenantLoginDto): tenant_slug + password only
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

  const inp = 'w-full h-11 rounded-lg border px-4 text-sm outline-none transition-all duration-200 text-slate-800 bg-white placeholder-slate-400 disabled:opacity-50'

  return (
    <>
      {/* ── Full-bleed blurred backdrop — reuses the hero freight photo ── */}
      <div className="fixed inset-0 z-50" onClick={onClose} aria-hidden="true">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          style={{ filter: 'blur(6px)' }}
        />
        <div className="absolute inset-0" style={{ background: `${NAVY}66` }} />
      </div>

      <div role="dialog" aria-modal="true" aria-label="Sign in" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[420px] sm:max-w-[520px] rounded-xl bg-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {step === 'signon' ? (
            /* ── STEP 1 — brand splash + single sign-on button ────────── */
            <div className="px-7 sm:px-9 pt-9 pb-7 overflow-y-auto">
              <button type="button" onClick={onClose} aria-label="Close"
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20">
                <X size={16} />
              </button>

              <div className="flex items-center justify-center gap-4">
                <img src={logo} alt="KingFisher Wings" style={{ height: '48px', width: 'auto' }} />
              </div>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="mt-8 w-full h-12 rounded-lg text-white flex items-center justify-center gap-2.5 text-[14px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(10,41,66,0.28)]"
                style={{ background: NAVY }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ORANGE }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = NAVY }}
              >
                <Lock size={15} strokeWidth={2.5} />
                Customer / User Sign On
              </button>

              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => { reset(); setApiErr(null) }}
                  className="flex items-center gap-1.5 text-[12.5px] font-semibold transition-colors"
                  style={{ color: ORANGE }}
                  onMouseEnter={e => (e.currentTarget.style.color = ORANGE_D)}
                  onMouseLeave={e => (e.currentTarget.style.color = ORANGE)}
                >
                  <Loader2 size={13} />
                  Refresh
                </button>
              </div>

              <div className="mt-5 flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={{ background: SURFACE }}>
                <span
                  className="mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold text-white leading-none"
                  style={{ background: ORANGE }}
                >
                  NEW
                </span>
                <p className="text-[11.5px] leading-snug text-slate-500">
                  Do not share your password with anyone. KingFisher has added an additional
                  security layer to block using the same username across more than one system.
                </p>
              </div>

              <p className="mt-5 text-center text-[11px] text-slate-400">
                Copyright © {new Date().getFullYear()} All rights reserved by{' '}
                <span className="font-semibold" style={{ color: ORANGE }}>KingFisher Wings</span>
              </p>
            </div>
          ) : (
            /* ── STEP 2 — Single Sign-On credentials, per reference ────── */
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col max-h-[92vh]">
              {/* Header: plain white bar, centered title, close X */}
              <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b border-slate-100 shrink-0">
                <h2 className="text-center text-[17px] sm:text-[19px] font-semibold text-slate-800">
                  KingFisher Single Sign-On
                </h2>
                <button type="button" onClick={onClose} aria-label="Close"
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 sm:px-8 py-6 sm:py-7 space-y-4 overflow-y-auto">
                {/* Login mode */}
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => { setLoginMode('tenant_admin'); setApiErr(null) }}
                    className="rounded-md px-3 py-2 text-[12px] font-semibold transition-colors"
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
                    className="rounded-md px-3 py-2 text-[12px] font-semibold transition-colors"
                    style={{
                      background: loginMode === 'staff' ? NAVY : 'transparent',
                      color: loginMode === 'staff' ? '#fff' : '#64748b',
                    }}
                  >
                    Staff / User
                  </button>
                </div>
                {loginMode === 'tenant_admin' && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tenant Admin (workspace owner): <span className="font-semibold">slug + password</span> from Create Tenant{' '}(<code className="text-[10px]">POST /auth/tenant-login</code>).
                    No email. Staff employees use the <span className="font-semibold">Staff / User</span> tab.
                  </p>
                )}
                {loginMode === 'staff' && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Employees (Sales, Ops, Finance, etc.) created by Tenant Admin:{' '}
                    <span className="font-semibold">slug + email + temporary password</span>{' '}
                    (<code className="text-[10px]">POST /auth/login</code>).
                    On first login you will be asked to set your own password for next time.
                  </p>
                )}

                {/* Tenant slug */}
                <div>
                  <div className="relative">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: ORANGE }} aria-hidden="true">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                      id="kf-tenant-slug"
                      type="text"
                      autoComplete="off"
                      placeholder="tenant_slug"
                      disabled={isLoading}
                      aria-invalid={!!errors.tenant_slug}
                      {...register('tenant_slug')}
                      className={`${inp} pl-10 h-12 ${errors.tenant_slug
                        ? 'border-red-300 ring-2 ring-red-100'
                        : `border-slate-200 focus:border-[${ORANGE}] focus:ring-2 focus:ring-[${ORANGE}]/15`}`}
                    />
                  </div>
                  {errors.tenant_slug && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} />{errors.tenant_slug.message}</p>}
                  <p className="mt-1 text-[11px] text-slate-400">Exact Create Tenant slug — not code, not .fresagold.app</p>
                </div>

                {loginMode === 'staff' && (
                  <div>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                      <input
                        id="kf-email"
                        type="email"
                        autoComplete="off"
                        placeholder="user email"
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                        {...register('email')}
                        className={`${inp} pl-10 h-12 ${errors.email
                          ? 'border-red-300 ring-2 ring-red-100'
                          : `border-slate-200 focus:border-[${ORANGE}] focus:ring-2 focus:ring-[${ORANGE}]/15`}`}
                      />
                    </div>
                    {errors.email && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} />{errors.email.message}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">Email from Add user — required for Staff / User login</p>
                  </div>
                )}

                

                {/* Password */}
                <div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="kf-pw"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={loginMode === 'staff' ? 'temporary password' : 'password'}
                      disabled={isLoading}
                      aria-invalid={!!errors.password}
                      {...register('password')}
                      className={`${inp} pl-10 pr-10 h-12 [&::-ms-reveal]:hidden ${errors.password
                        ? 'border-red-300 ring-2 ring-red-100'
                        : `border-slate-200 focus:border-[${ORANGE}] focus:ring-2 focus:ring-[${ORANGE}]/15`}`}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500"><AlertCircle size={11} />{errors.password.message}</p>}
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-slate-300 shrink-0"
                    style={{ accentColor: NAVY }}
                    {...register('remember_me')}
                  />
                  <span className="text-[12.5px] text-slate-600">Remember me on this device</span>
                </label>

                {/* Terms checkbox */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => { setAgreed(e.target.checked); setAgreedTouched(true) }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 shrink-0"
                      style={{ accentColor: NAVY }}
                    />
                    <span className="text-[12.5px] leading-snug text-slate-600">
                      I agree to the terms of the{' '}
                      <Link to="/usage-policy" className="font-semibold hover:underline" style={{ color: NAVY }} onClick={e => e.stopPropagation()}>
                        usage policy
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="font-semibold hover:underline" style={{ color: NAVY }} onClick={e => e.stopPropagation()}>
                        privacy policy
                      </Link>
                    </span>
                  </label>
                  {agreedTouched && !agreed && (
                    <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                      <AlertCircle size={11} />You must agree before continuing.
                    </p>
                  )}
                </div>

                {/* Forget Password — opens nested modal instead of navigating */}
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="inline-block text-[12.5px] font-semibold transition-colors"
                  style={{ color: NAVY }}
                >
                  Forget Password
                </button>

                {statusMsg && (
                  <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-[12px] text-slate-600"
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" /><span>{statusMsg}</span>
                  </div>
                )}

                {apiErr && (
                  <div role="alert" className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-[12px] text-red-600"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{apiErr}</span>
                  </div>
                )}
              </div>

              {/* Footer bar — Close (red) / Continue to Sign On (green) */}
              <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-colors"
                  style={{ background: '#DC2626' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B91C1C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#DC2626' }}
                >
                  <X size={15} strokeWidth={2.5} />
                  Close
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: NAVY }}
                  onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = ORANGE }}
                  onMouseLeave={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = NAVY }}
                >
                  {isLoading
                    ? <><Loader2 size={15} className="animate-spin" />Signing in…</>
                    : <><ArrowRight size={15} strokeWidth={2.5} />Continue to Sign On</>}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Nested "Forgot Password" modal, stacked above credentials ── */}
        {forgotOpen && (
          <>
            <div
              className="fixed inset-0 z-[60] bg-black/25"
              onClick={() => setForgotOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Forgot password"
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <div
                className="relative w-full max-w-[400px] rounded-xl bg-white shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative px-6 pt-5 pb-4 border-b border-slate-100">
                  <h3 className="text-center text-[16px] sm:text-[17px] font-semibold text-slate-800">
                    Forgot Password
                  </h3>
                  <button type="button" onClick={() => setForgotOpen(false)} aria-label="Close"
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  {forgotSent ? (
                    <div className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-[12.5px]" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
                      If an account exists for that email, a reset link has been sent.
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                          ref={forgotInputRef}
                          type="email"
                          placeholder="Email as username"
                          value={forgotEmail}
                          disabled={forgotSending}
                          onChange={e => setForgotEmail(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleForgotSend() }}
                          className={`${inp} pl-10 ${forgotErr
                            ? 'border-red-300 ring-2 ring-red-100'
                            : `border-slate-200 focus:border-[${ORANGE}] focus:ring-2 focus:ring-[${ORANGE}]/15`}`}
                        />
                      </div>
                      {forgotErr && (
                        <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                          <AlertCircle size={11} />{forgotErr}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white transition-colors"
                    style={{ background: '#DC2626' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#B91C1C' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#DC2626' }}
                  >
                    <X size={14} strokeWidth={2.5} />
                    Cancel
                  </button>

                  {!forgotSent && (
                    <button
                      type="button"
                      onClick={handleForgotSend}
                      disabled={forgotSending}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[12.5px] font-semibold text-white transition-colors disabled:opacity-60"
                      style={{ background: NAVY }}
                      onMouseEnter={e => { if (!forgotSending) (e.currentTarget as HTMLElement).style.background = ORANGE }}
                      onMouseLeave={e => { if (!forgotSending) (e.currentTarget as HTMLElement).style.background = NAVY }}
                    >
                      {forgotSending
                        ? <><Loader2 size={14} className="animate-spin" />Sending…</>
                        : <><Mail size={14} strokeWidth={2.5} />Send</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [loginOpen,    setLoginOpen]    = useState(false)
  const [supportHover, setSupportHover] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(erpHomeFromAuthStore(), { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen" style={{ background: SURFACE }}>
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      <main className="mx-auto max-w-[1320px] px-4 sm:px-5 md:px-8">

        {/* ── Hero + scroll cue ─────────────────────────────────────── */}
        <div className="kf-up mt-4 sm:mt-6">
          <section className="relative overflow-hidden rounded-2xl">
            <img
              src={heroBg}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-[65%_center] sm:object-center"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${NAVY}E8 0%, ${NAVY}99 55%, ${NAVY}55 100%)` }}
            />

            <div className="relative z-10 px-4 py-7 sm:px-8 sm:py-10 md:px-14 md:py-12">
              <div className="max-w-[600px]">
                <span
                  className="block text-[10px] sm:text-[11px] font-bold tracking-[0.16em] sm:tracking-[0.22em]"
                  style={{ color: ORANGE }}
                >
                  WELCOME TO
                </span>
                <h1 className="mt-1.5 sm:mt-2 text-[1.35rem] sm:text-[2rem] md:text-[2.375rem] lg:text-[2.75rem] font-extrabold text-white leading-[1.12] sm:leading-[1.05] tracking-tight">
                  KINGFISHER WINGS
                  <span className="block sm:inline sm:ml-2" style={{ color: ORANGE }}>
                    LOGISTICS PORTAL
                  </span>
                </h1>
                <p
                  className="mt-2 sm:mt-3 text-[11px] sm:text-sm leading-relaxed max-w-[460px]"
                  style={{ color: '#B0C4D8' }}
                >
                  Your All-in-one Platform for Seamless Logistics Management &amp; Digital Solutions
                </p>

                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-0">
                  <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold" style={{ color: '#DCE7F2' }}>
                    <Ship size={13} className="sm:w-[15px] sm:h-[15px] shrink-0" style={{ color: ORANGE }} />
                    Sea Freight
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold" style={{ color: '#DCE7F2' }}>
                    <Plane size={13} className="sm:w-[15px] sm:h-[15px] shrink-0" style={{ color: ORANGE }} />
                    Air Freight
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold" style={{ color: '#DCE7F2' }}>
                    <Truck size={13} className="sm:w-[15px] sm:h-[15px] shrink-0" style={{ color: ORANGE }} />
                    Road / Land Freight
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Scroll cue */}
          <div className="flex justify-center">
            <button
              type="button"
              aria-label="Scroll to portal options"
              onClick={() => document.getElementById('kf-portals')?.scrollIntoView({ behavior: 'smooth' })}
              className="kf-bounce -mt-4 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg z-10 transition-transform hover:scale-110"
              style={{ background: ORANGE }}
            >
              <ChevronDown size={16} className="text-white" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* ── Primary cards ─────────────────────────────────────────── */}
        <section id="kf-portals" className="grid gap-4 sm:gap-5 sm:grid-cols-2 md:grid-cols-3 mt-8 sm:mt-12">
          {PRIMARY_CARDS.map((c, i) => (
            <Card key={c.title} {...c} delay={i * 80} onLoginClick={() => setLoginOpen(true)} />
          ))}
        </section>

        {/* ── Secondary cards ──────────────────────────────────────── */}
        <section className="grid gap-4 sm:gap-5 sm:grid-cols-2 max-w-3xl mx-auto mt-4 sm:mt-5">
          {SECONDARY_CARDS.map((c, i) => (
            <Card key={c.title} {...c} delay={i * 80} onLoginClick={() => setLoginOpen(true)} />
          ))}
        </section>

        {/* ── Notice bar ────────────────────────────────────────────── */}
        <section
          className="kf-up mt-8 sm:mt-10 mb-4 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-5 lg:gap-10"
          style={{ background: NAVY }}
        >
          <div className="flex items-start gap-3 flex-1">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: ORANGE }}>
              <Settings size={18} className="text-white" />
            </span>
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold" style={{ color: ORANGE }}>System Maintenance Notice</p>
              <p className="text-[11.5px] sm:text-[12px] text-[#AEBBD1] leading-snug mt-0.5">
                Our systems will undergo scheduled maintenance every Sunday at 08:00 AM (UAE Time) for 15 to 30 minutes.
              </p>
            </div>
          </div>
          <div className="hidden lg:block h-10 w-px bg-white/10" />
          <div className="flex items-start gap-3 flex-1">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Headphones size={18} className="text-white" />
            </span>
            <div>
              <p className="text-[12.5px] sm:text-[13px] font-bold text-white">Need Support?</p>
              <p className="text-[11.5px] sm:text-[12px] text-[#AEBBD1] leading-snug mt-0.5">
                If you face any issues accessing the portal, our support team is here to help you.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            onMouseEnter={() => setSupportHover(true)}
            onMouseLeave={() => setSupportHover(false)}
            className="flex items-center gap-2 rounded-lg border-[1.5px] px-4 sm:px-5 py-2 sm:py-2.5 text-[12px] sm:text-[12.5px] font-semibold text-white shrink-0 transition-all duration-250 w-full lg:w-auto justify-center lg:justify-start"
            style={{ borderColor: ORANGE, background: supportHover ? ORANGE : 'transparent' }}
          >
            Contact Support
            <ArrowRight size={14} className={`transition-transform duration-250 ${supportHover ? 'translate-x-1' : ''}`} />
          </Link>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-[11.5px] sm:text-[12px] text-slate-400 text-center">
          <span>© {new Date().getFullYear()} KingFisher Wings.</span>
          <span className="flex items-center gap-1.5">
            KingFisher Tech Gold by
            <CrewMark />
            <span className="font-semibold text-slate-500">Crew Innovations</span>
          </span>
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

      <style>{`
        @keyframes kf-up {
          from { opacity:0; transform:translateY(16px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .kf-up { animation: kf-up 0.55s cubic-bezier(.22,1,.36,1) both }

        @keyframes kf-bounce {
          0%,100% { transform:translate(0,0) }
          50%     { transform:translate(0,6px) }
        }
        .kf-bounce { animation: kf-bounce 1.8s ease-in-out infinite }

        @media (prefers-reduced-motion:reduce) {
          .kf-up,.kf-bounce { animation:none!important }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// BRAND MARKS
// ─────────────────────────────────────────────────────────────────────────
function KfWordmark({ centered = false }: { centered?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="KingFisher Tech Gold home"
      className={`flex items-center gap-2.5 shrink-0 ${centered ? 'justify-center' : ''}`}
    >
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M4 24 C10 8, 22 4, 36 10 C28 13, 21 19, 19 27 C15 21, 9 21, 4 24 Z" fill={ORANGE} />
        <path d="M7 27 C13 15, 23 13, 31 17 C23 18, 18 24, 17 32 C13 27, 9 26, 7 27 Z" fill={NAVY} />
        <circle cx="30" cy="11" r="3" fill="white" opacity="0.9" />
      </svg>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight text-white">KingFisher</span>
        <span className="block text-[10.5px] font-bold tracking-[0.28em]" style={{ color: ORANGE }}>TECH GOLD</span>
      </span>
    </Link>
  )
}

function CrewMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="none" stroke={ORANGE} strokeWidth="1.4" />
      <path d="M8 15 L8 9 L12 9 A3 3 0 0 1 12 15 L10.5 15 L14 18"
        fill="none" stroke={ORANGE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}