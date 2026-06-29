import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Globe,
  Star,
  Smartphone,
  BarChart2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { type Product, useAuthStore } from '@/store/authStore'

// ── Validation schema ──────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type LoginFormValues = z.infer<typeof loginSchema>

// ── Product tiles config ───────────────────────────────────────────────────
interface ProductTile {
  id: Product
  label: string
  Icon: React.ElementType
}

const PRODUCTS: ProductTile[] = [
  { id: 'Fresa Global',    label: 'Fresa Global',    Icon: Globe },
  { id: 'Fresa Gold',      label: 'Fresa Gold',      Icon: Star },
  { id: 'Fresa App',       label: 'Fresa App',       Icon: Smartphone },
  { id: 'Fresa Analytics', label: 'Fresa Analytics', Icon: BarChart2 },
]

const TRUST_POINTS = [
  'Multi-tenant freight ERP — all modes, one platform',
  'Air, Sea FCL/LCL, Land & Courier operations',
  'UAE VAT-compliant invoicing and accounting',
  'Role-based access with full audit trail',
  'Real-time shipment tracking and MIS dashboards',
]

// ── Field state helper ─────────────────────────────────────────────────────
type FieldState = 'default' | 'focused' | 'valid' | 'invalid'

function fieldBorderClass(state: FieldState): string {
  switch (state) {
    case 'focused':  return 'border-blue-500 ring-1 ring-blue-500'
    case 'valid':    return 'border-green-500'
    case 'invalid':  return 'border-red-500'
    default:         return 'border-gray-300'
  }
}

function fieldIconClass(state: FieldState): string {
  switch (state) {
    case 'focused':  return 'text-blue-500'
    case 'valid':    return 'text-green-500'
    case 'invalid':  return 'text-red-500'
    default:         return 'text-gray-400'
  }
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, error, isLoading, clearError } = useAuthStore()

  const [selectedProduct, setSelectedProduct] = useState<Product>('Fresa Gold')
  const [showPassword, setShowPassword]       = useState(false)
  const [focusedField, setFocusedField]       = useState<'email' | 'password' | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const emailValue    = watch('email')
  const passwordValue = watch('password')

  function getFieldState(
    field: 'email' | 'password',
    value: string | undefined,
    hasError: boolean,
  ): FieldState {
    if (hasError)                    return 'invalid'
    if (focusedField === field)      return 'focused'
    if (value && value.length > 0)   return 'valid'
    return 'default'
  }

  const emailState    = getFieldState('email',    emailValue,    !!errors.email)
  const passwordState = getFieldState('password', passwordValue, !!errors.password)

  const onSubmit = async (values: LoginFormValues) => {
    clearError()
    await login(values.email, values.password, selectedProduct)
    if (useAuthStore.getState().isAuthenticated) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel (desktop only) ───────────────────────────────────── */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-between px-12 py-14"
        style={{ backgroundColor: '#0A1628' }}
      >
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">
              Fresa Gold
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-snug max-w-sm">
            Freight forwarding,<br />
            <span className="text-blue-400">unified.</span>
          </h1>
          <p className="mt-3 text-gray-400 text-sm max-w-xs leading-relaxed">
            End-to-end operations for freight forwarders, NVOCCs, and 3PL providers.
          </p>

          {/* Trust points */}
          <ul className="mt-10 space-y-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-gray-300">
                <CheckCircle2
                  size={16}
                  className="text-blue-400 mt-0.5 flex-shrink-0"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} Kingfisher Wings Logistic LLC. All rights reserved.
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="text-gray-900 text-lg font-semibold">Fresa Gold</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your workspace</p>

            {/* ── Product selector ──────────────────────────────────────── */}
            <fieldset className="mb-5">
              <legend className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Product
              </legend>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select product">
                {PRODUCTS.map(({ id, label, Icon }) => {
                  const isSelected = selectedProduct === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedProduct(id)}
                      aria-pressed={isSelected}
                      className={[
                        'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left',
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-800'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <Icon
                        size={14}
                        className={isSelected ? 'text-blue-600' : 'text-gray-400'}
                      />
                      <span className="truncate">{label}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {/* ── Auth error banner ─────────────────────────────────────── */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm mb-4"
              >
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Form ─────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className={`flex items-center rounded-lg border bg-white px-3 transition-all ${fieldBorderClass(emailState)}`}>
                  <Mail
                    size={15}
                    aria-hidden="true"
                    className={`flex-shrink-0 mr-2 transition-colors ${fieldIconClass(emailState)}`}
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    disabled={isLoading}
                    aria-label="Email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...register('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1 flex items-center gap-1 text-xs text-red-600"
                  >
                    <AlertCircle size={11} />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className={`flex items-center rounded-lg border bg-white px-3 transition-all ${fieldBorderClass(passwordState)}`}>
                  <Lock
                    size={15}
                    aria-hidden="true"
                    className={`flex-shrink-0 mr-2 transition-colors ${fieldIconClass(passwordState)}`}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    aria-label="Password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="flex-1 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1 flex items-center gap-1 text-xs text-red-600"
                  >
                    <AlertCircle size={11} />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  `Sign in to ${selectedProduct}`
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}