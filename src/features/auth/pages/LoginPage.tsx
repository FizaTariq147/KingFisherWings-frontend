import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Cloud, Eye, EyeOff, AlertCircle, Loader2, Check, Building2 } from 'lucide-react'
import { type Product, useAuthStore } from '@/store/authStore'

// ── Schema ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
})
type LoginFormValues = z.infer<typeof loginSchema>

// ── Products — distinct brand dots (kept separate from primary theme) ──────
const PRODUCTS = [
  { id: 'KingFisher Tech Gold'      as Product, label: 'KingFisher Tech Gold',      dot: '#0EA5E9' },
  { id: 'KingFisher Tech Global'    as Product, label: 'KingFisher Tech Global',    dot: '#6366F1' },
  { id: 'KingFisher Tech App'       as Product, label: 'KingFisher Tech App',       dot: '#7C3AED' },
  { id: 'KingFisher Tech Analytics' as Product, label: 'KingFisher Tech Analytics', dot: '#D97706' },
]

const TRUST_POINTS = [
  'UAE VAT-compliant invoicing',
  'Role-based access control',
  'ISO 42001 certified',
  'Real-time MIS dashboards',
]

// ── Particle canvas — sky-blue palette matching Hero.tsx ────────────────────
function useParticleCanvas(
  ref: React.RefObject<HTMLCanvasElement>,
  containerRef: React.RefObject<HTMLDivElement>,
) {
  useEffect(() => {
    const canvas = ref.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')!

    const COLS = ['#0284C7', '#0EA5E9', '#38BDF8', '#0C4A6E']
    let W = 0, H = 0, raf = 0
    interface Node { x: number; y: number; vx: number; vy: number; r: number; color: string; p: number; ps: number }
    let nodes: Node[] = []

    const resize = () => { W = canvas.width = container.offsetWidth; H = canvas.height = container.offsetHeight }
    const init = () => {
      resize()
      nodes = Array.from({ length: 55 }, () => {
        const a = Math.random() * Math.PI * 2, s = 0.1 + Math.random() * 0.2
        return {
          x: Math.random() * W, y: Math.random() * H, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          r: 0.8 + Math.random() * 2, color: COLS[Math.floor(Math.random() * COLS.length)],
          p: Math.random() * Math.PI * 2, ps: 0.015 + Math.random() * 0.025,
        }
      })
    }
    const frame = () => {
      ctx.fillStyle = '#0F2A3D'; ctx.fillRect(0, 0, W, H)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.p += n.ps
        if (n.x < -5) n.x = W + 5; if (n.x > W + 5) n.x = -5
        if (n.y < -5) n.y = H + 5; if (n.y > H + 5) n.y = -5
      })
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy)
        if (d < 90) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = 'rgba(14,165,233,0.2)'; ctx.lineWidth = 0.5; ctx.stroke()
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1 + Math.sin(n.p) * 0.3), 0, Math.PI * 2)
        ctx.fillStyle = n.color; ctx.globalAlpha = 0.7; ctx.fill(); ctx.globalAlpha = 1
      })
      const g = ctx.createRadialGradient(W * 0.7, H * 0.4, H * 0.05, W * 0.7, H * 0.4, H * 0.8)
      g.addColorStop(0, 'rgba(14,165,233,0.12)'); g.addColorStop(1, 'rgba(15,42,61,0)')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      raf = requestAnimationFrame(frame)
    }
    init(); frame()
    const onResize = () => { cancelAnimationFrame(raf); init(); frame() }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [ref, containerRef])
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, clearError } = useAuthStore()

  const [selectedProduct, setSelectedProduct] = useState<Product>('KingFisher Tech Gold')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const leftPanelRef = useRef<HTMLDivElement>(null!)
  useParticleCanvas(canvasRef, leftPanelRef)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  // Clear stale auth error when user edits any field
  const emailValue    = watch('email')
  const passwordValue = watch('password')
  useEffect(() => { if (authError) setAuthError(null) }, [emailValue, passwordValue]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: LoginFormValues) => {
    // Double-submit guard — authStore.isLoading already set during login()
    if (isLoading) return
    clearError()
    setAuthError(null)
    await login(values.email, values.password, selectedProduct)
    const state = useAuthStore.getState()
    if (state.isAuthenticated) {
      navigate('/dashboard')
    } else {
      setAuthError(state.error ?? 'Incorrect email or password. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ── LEFT — dark panel, matched to Hero.tsx gradient + particles ── */}
      <div
        ref={leftPanelRef}
        className="hidden lg:flex relative overflow-hidden flex-col justify-between p-10"
        style={{
          background: `
            linear-gradient(180deg, rgba(15,42,61,0.85) 0%, rgba(15,42,61,0.55) 100%),
            radial-gradient(circle at 70% 40%, rgba(14,165,233,0.35), transparent 65%),
            linear-gradient(135deg, #1E3A52 0%, #0F2A3D 50%, #15324A 100%)
          `,
          backgroundColor: '#0F2A3D',
        }}
      >
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full opacity-60" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#0EA5E9' }}>
              <Cloud size={15} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight">KingFisher Tech Gold</div>
              <div className="text-[10px] text-[#7B93A8]">by KingFisher Tech Technologies</div>
            </div>
          </div>

          {/* Headline — matches Hero.tsx tone */}
          <h1 className="text-3xl font-bold text-white leading-tight tracking-tight max-w-[240px]">
            Freight ops,{' '}
            <span style={{ color: '#0EA5E9' }}>unified.</span>
          </h1>
          <p className="text-[#B8C5D6] text-sm mt-3 leading-relaxed max-w-[220px]">
            End-to-end ERP for freight forwarders, NVOCCs, and 3PLs — sea, air, and road.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-8">
            {[['1000+', 'Customers'], ['30+', 'Countries'], ['15+', 'Years'], ['5', 'Branches']].map(([v, l]) => (
              <div
                key={l}
                className="rounded-xl p-4 border"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
              >
                <div className="text-2xl font-bold text-white tracking-tight leading-none">{v}</div>
                <div className="text-[9px] text-[#7B93A8] uppercase tracking-widest mt-1.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust points */}
        <div className="relative z-10 flex flex-col gap-2.5">
          {TRUST_POINTS.map(pt => (
            <div key={pt} className="flex items-center gap-2.5 text-[11px] text-[#7B93A8]">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#0EA5E9' }} aria-hidden="true" />
              {pt}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT — form ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-center bg-white px-6 py-12 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
            backgroundSize: '28px 28px',
            opacity: 0.35,
          }}
        />

        <div className={['relative z-10 w-full max-w-[340px]', shake ? 'animate-[shake_0.4s_ease]' : ''].join(' ')}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#0EA5E9' }}>
              <Cloud size={13} className="text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-gray-900">KingFisher Tech Gold</span>
          </div>

          <h2 className="text-[22px] font-bold text-gray-900 tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-7">Sign in to your workspace</p>

          {/* Product selector */}
          <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-gray-400 mb-2.5">
            Continue to
          </p>
          <div className="grid grid-cols-2 gap-1.5 mb-6">
            {PRODUCTS.map(({ id, label, dot }) => {
              const active = selectedProduct === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedProduct(id)}
                  aria-pressed={active}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-[1.5px] text-left transition-all duration-150"
                  style={
                    active
                      ? { borderColor: '#0EA5E9', background: '#EFF6FF' }
                      : { borderColor: '#F1F5F9', background: '#fff' }
                  }
                >
                  {active ? (
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: dot }}>
                      <Check size={8} className="text-white" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                  )}
                  <span
                    className="text-[11px] font-medium truncate"
                    style={{ color: active ? '#0369A1' : '#64748B' }}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                disabled={isLoading}
                aria-label="Email address"
                aria-invalid={!!errors.email}
                {...register('email')}
                className={[
                  'w-full h-10 rounded-xl border-[1.5px] px-4 text-sm text-gray-900 bg-white placeholder-slate-300',
                  'outline-none transition-all duration-150 disabled:opacity-50',
                  errors.email ? 'login-input-error' : 'login-input',
                ].join(' ')}
              />
              {errors.email && (
                <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                  <AlertCircle size={11} />{errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-medium text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Password"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                  className={[
                    'w-full h-10 rounded-xl border-[1.5px] px-4 pr-10 text-sm text-gray-900 bg-white placeholder-slate-300',
                    'outline-none transition-all duration-150 disabled:opacity-50',
                    errors.password ? 'login-input-error' : 'login-input',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
                  <AlertCircle size={11} />{errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot */}
            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-[11px] text-gray-400 hover:text-[#0284C7] transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Auth error */}
            {authError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-[slideDown_0.2s_ease]"
              >
                <AlertCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-[12px] text-red-600">{authError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className={[
                'w-full h-11 rounded-xl text-white text-[13px] font-semibold',
                'transition-all duration-150 flex items-center justify-center gap-2',
                isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-px active:scale-[.99] cursor-pointer',
              ].join(' ')}
              style={{ background: '#0EA5E9' }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#0284C7' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0EA5E9' }}
            >
              {isLoading
                ? <><Loader2 size={14} className="animate-spin" />Signing in…</>
                : `Continue with ${selectedProduct}`}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] text-gray-300">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* SSO */}
            <button
              type="button"
              className="w-full h-10 rounded-xl border-[1.5px] border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-[#BAE6FD] text-gray-500 text-[12px] font-medium flex items-center justify-center gap-2 transition-all duration-150"
            >
              <Building2 size={14} aria-hidden="true" />
              Sign in with SSO
            </button>
          </form>

          {/* Bottom */}
          <div className="mt-7 text-center">
            <p className="text-[11px] text-gray-400">
              Don't have an account?{' '}
              <Link to="/contact" className="font-medium hover:underline" style={{ color: '#0284C7' }}>
                Book a demo
              </Link>
            </p>
            <div className="flex justify-center gap-5 mt-4">
              <a href="https://KingFisher Techtechnologies.com/privacy" target="_blank" rel="noreferrer"
                className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
                Privacy Policy
              </a>
              <a href="https://KingFisher Techtechnologies.com/terms" target="_blank" rel="noreferrer"
                className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
                Usage Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-input { border-color: #E2E8F0; }
        .login-input:focus { border-color: #0EA5E9; box-shadow: 0 0 0 3px rgba(14,165,233,0.08); }
        .login-input-error { border-color: #FCA5A5; box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%     { transform:translateX(-6px); }
          40%     { transform:translateX(6px); }
          60%     { transform:translateX(-4px); }
          80%     { transform:translateX(4px); }
        }
      `}</style>
    </div>
  )
}