import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { PortalApiError } from '@/lib/portalApiClient';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useAuthStore } from '@/store/authStore';
import { portalAuthService } from '../services/portalAuth.service';
import { usePortalAuthBootstrap } from '../hooks/usePortalAuthBootstrap';
import { usePortalBrand } from '../hooks/usePortalBrand';
import { usePortalAuthStore } from '../store/portalAuthStore';
import { clearPortalQueryCache } from '@/features/portal-shared/clearPortalQueryCache';

const loginSchema = z.object({
  tenant_slug: z
    .string()
    .trim()
    .min(2, 'Tenant slug is required')
    .max(100, 'Tenant slug is too long'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname: string };
}

const inputClass =
  'w-full border-0 border-b border-[var(--color-neutral-300)] bg-transparent px-0 py-3 text-[15px] text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] transition-[border-color] focus:border-[var(--color-primary)] focus:outline-none focus:ring-0';

export default function PortalLoginPage() {
  useApplyTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = usePortalAuthStore((s) => s.setSession);
  const { ready, accessToken } = usePortalAuthBootstrap();
  const { companyName, portalLabel } = usePortalBrand();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenant_slug: '',
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: portalAuthService.login,
    onSuccess: async ({ user, accessToken, refreshToken }) => {
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });

      clearPortalQueryCache();
      setSession(user, accessToken, refreshToken);

      try {
        const me = await portalAuthService.me();
        usePortalAuthStore.getState().setUser(me);
      } catch {
        /* login tokens are enough; /me can refresh on home */
      }

      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from ?? '/portal', { replace: true });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof PortalApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Login failed. Try again.';
      form.setError('root', { message });
    },
  });

  if (ready && accessToken) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="portal-login min-h-screen lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <style>{`
        @keyframes portal-login-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes portal-login-draw {
          from { stroke-dashoffset: 420; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes portal-login-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .portal-login-rise { animation: portal-login-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .portal-login-rise-delay { animation: portal-login-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both; }
        .portal-login-form { animation: portal-login-rise 650ms cubic-bezier(0.22, 1, 0.36, 1) 80ms both; }
        .portal-login-route {
          stroke-dasharray: 420;
          animation: portal-login-draw 2.4s ease-out 0.35s both;
        }
        .portal-login-grid {
          background-image:
            linear-gradient(to right, color-mix(in srgb, white 8%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, white 8%, transparent) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 30% 40%, black 20%, transparent 75%);
          animation: portal-login-fade 1.2s ease both;
        }
      `}</style>

      {/* Brand plane — full-bleed, not a card */}
      <aside className="relative flex min-h-[42vh] flex-col justify-between overflow-hidden bg-[var(--color-primary)] px-8 py-10 text-white sm:px-12 sm:py-14 lg:min-h-screen lg:px-16 lg:py-16">
        <div className="portal-login-grid pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Route line motif */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 800 900"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className="portal-login-route"
            d="M60 720 C180 620, 220 480, 340 420 S560 360, 620 240 S700 80, 760 40"
            stroke="var(--color-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="340" cy="420" r="5" fill="var(--color-secondary)" />
          <circle cx="620" cy="240" r="5" fill="white" fillOpacity="0.85" />
          <circle cx="760" cy="40" r="4" fill="var(--color-secondary)" />
        </svg>

        <div className="relative z-10">
          <p className="portal-login-rise text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            {portalLabel}
          </p>
          <h2
            className="portal-login-rise-delay mt-6 max-w-lg text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
            style={{ fontFamily: "'Noto Serif', 'Nunito', Georgia, serif" }}
          >
            {companyName}
          </h2>
          <p className="portal-login-rise-delay mt-5 max-w-md text-base leading-relaxed text-white/65">
            Your consignments, quotes, and documents — managed in one place with your forwarder.
          </p>
        </div>

        <p className="relative z-10 mt-10 text-xs text-white/40 lg:mt-0">
          Secure access for registered customers only.
        </p>
      </aside>

      {/* Sign-in — quiet interaction surface */}
      <main className="relative flex items-center bg-[var(--color-surface)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="portal-login-form mx-auto w-full max-w-[380px]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
            Sign in
          </h2>
          <p className="mt-1.5 text-sm text-[var(--color-neutral-500)]">
            Enter the workspace and credentials from your forwarder.
          </p>

          {form.formState.errors.root && (
            <div
              className="mt-6 border-l-2 border-red-500 bg-red-50/80 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {form.formState.errors.root.message}
            </div>
          )}

          <form
            onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
            noValidate
            className="mt-8 space-y-6"
          >
            <div>
              <label
                htmlFor="tenant_slug"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
              >
                Workspace
              </label>
              <input
                id="tenant_slug"
                autoComplete="organization"
                placeholder="Tenant slug"
                className={`${inputClass} mt-1`}
                {...form.register('tenant_slug')}
              />
              {form.formState.errors.tenant_slug && (
                <p className="mt-1.5 text-xs text-red-600">
                  {form.formState.errors.tenant_slug.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="portal_email"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
              >
                Email
              </label>
              <input
                id="portal_email"
                type="email"
                autoComplete="username"
                className={`${inputClass} mt-1`}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="portal_password"
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="portal_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--color-neutral-400)] transition-colors hover:text-[var(--color-neutral-700)]"
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 w-full bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-[var(--color-secondary)] active:scale-[0.99] disabled:opacity-60"
            >
              {loginMutation.isPending ? 'Signing in…' : 'Continue'}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-[var(--color-neutral-400)]">
            Staff access?{' '}
            <Link
              to="/login"
              className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              ERP login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
