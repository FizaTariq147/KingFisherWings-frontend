import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { VendorApiError } from '@/lib/vendorApiClient';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import {
  portalAnimationStyles,
  PortalGsapRouteMap,
  usePortalAutoAnimate,
} from '@/features/portal-auth/components/portal-ui';
import {
  BackgroundBeams,
  MovingBorderButton,
  Spotlight,
  TextGenerateEffect,
} from '@/components/aceternity';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { useVendorAuthBootstrap } from '../hooks/useVendorAuthBootstrap';
import { useVendorBrand } from '../hooks/useVendorBrand';
import { vendorAuthService } from '../services/vendorAuth.service';
import { useVendorAuthStore } from '../store/vendorAuthStore';
import { clearOtherAuthSessions } from '../utils/clearOtherSessions';

const loginSchema = z.object({
  tenant_slug: z
    .string()
    .trim()
    .min(2, 'Tenant slug is required')
    .max(100, 'Tenant slug is too long'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const inviteSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .max(200)
      .optional()
      .or(z.literal(''))
      .refine((v) => !v || v.length >= 2, 'Full name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type InviteFormValues = z.infer<typeof inviteSchema>;

interface LocationState {
  from?: { pathname: string };
}

const inputClass =
  'w-full border-0 border-b border-[var(--color-neutral-300)] bg-transparent px-0 py-3 text-[15px] text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] transition-[border-color] focus:border-[var(--color-primary)] focus:outline-none focus:ring-0';

export default function VendorLoginPage() {
  useApplyTheme();
  const [brandRef] = usePortalAutoAnimate();
  const [formRef] = usePortalAutoAnimate();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const inviteToken = (searchParams.get('token') || searchParams.get('invite') || '').trim();
  const setSession = useVendorAuthStore((s) => s.setSession);
  const { ready, accessToken } = useVendorAuthBootstrap();
  const { companyName, portalLabel } = useVendorBrand();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenant_slug: '', email: '', password: '' },
  });

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { full_name: '', password: '', confirm: '' },
  });

  const applySession = async (user: Parameters<typeof setSession>[0], token: string, refresh: string) => {
    clearOtherAuthSessions();
    clearVendorQueryCache();
    setSession(user, token, refresh);
    try {
      const me = await vendorAuthService.me();
      useVendorAuthStore.getState().setUser(me);
    } catch {
      /* tokens are enough; /me can refresh on home */
    }
  };

  const loginMutation = useMutation({
    mutationFn: vendorAuthService.login,
    onSuccess: async ({ user, accessToken: token, refreshToken }) => {
      await applySession(user, token, refreshToken);
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from && from.startsWith('/vendor') ? from : '/vendor', { replace: true });
    },
    onError: (error: unknown) => {
      form.setError('root', {
        message:
          error instanceof VendorApiError
            ? vendorErrorMessage(error, 'Login failed. Try again.')
            : error instanceof Error
              ? error.message
              : 'Login failed. Try again.',
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: vendorAuthService.acceptInvite,
    onSuccess: async (result) => {
      if (result?.accessToken) {
        await applySession(result.user, result.accessToken, result.refreshToken);
        navigate('/vendor', { replace: true });
        return;
      }
      navigate('/vendor/login', { replace: true });
    },
    onError: (error: unknown) => {
      inviteForm.setError('root', {
        message:
          error instanceof VendorApiError
            ? vendorErrorMessage(error, 'Could not accept invite.')
            : error instanceof Error
              ? error.message
              : 'Could not accept invite.',
      });
    },
  });

  if (ready && accessToken) {
    return <Navigate to="/vendor" replace />;
  }

  return (
    <div className="portal-login min-h-screen lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <style>{portalAnimationStyles}</style>

      <aside className="portal-page-enter relative flex min-h-[42vh] flex-col justify-between overflow-hidden bg-[var(--color-primary)] px-8 py-10 text-white sm:px-12 sm:py-14 lg:min-h-screen lg:px-16 lg:py-16">
        <div className="portal-login-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <BackgroundBeams className="opacity-70" />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-20" fill="white" />
        <div
          className="portal-login-pulse pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-[var(--color-secondary)]/25 blur-3xl"
          aria-hidden="true"
        />
        <PortalGsapRouteMap className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-40" />

        <div ref={brandRef} className="relative z-10 portal-login-brand">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            {portalLabel}
          </p>
          <h2
            className="mt-6 max-w-lg text-[clamp(2.25rem,4.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]"
            style={{ fontFamily: "'Noto Serif', 'Nunito', Georgia, serif" }}
          >
            {companyName}
          </h2>
          <TextGenerateEffect
            words="Invoices, payments, and remittances — your accounts payable workspace with your forwarder."
            className="mt-5 max-w-md text-base text-white/80"
            filter
            duration={0.4}
          />
          <p className="mt-10 text-xs text-white/40 lg:mt-16">
            Secure access for registered vendors only.
          </p>
        </div>
      </aside>

      <main className="portal-page-enter relative flex items-center bg-[var(--color-surface)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div ref={formRef} className="portal-login-form mx-auto w-full max-w-[380px]">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--color-neutral-900)]">
            {inviteToken ? 'Accept invite' : 'Sign in'}
          </h2>
          <p className="mt-1.5 text-sm text-[var(--color-neutral-500)]">
            {inviteToken
              ? 'Set your password to activate your vendor portal account.'
              : 'Enter the workspace and credentials from your forwarder.'}
          </p>

          {(form.formState.errors.root || inviteForm.formState.errors.root) && (
            <div
              className="mt-6 border-l-2 border-red-500 bg-red-50/80 px-3 py-2.5 text-sm text-red-700"
              role="alert"
            >
              {form.formState.errors.root?.message || inviteForm.formState.errors.root?.message}
            </div>
          )}

          {inviteToken ? (
            <form
              onSubmit={inviteForm.handleSubmit((values) =>
                inviteMutation.mutate({
                  token: inviteToken,
                  password: values.password,
                  full_name: values.full_name?.trim() || undefined,
                }),
              )}
              noValidate
              className="mt-8 space-y-6"
            >
              <div>
                <label
                  htmlFor="invite_full_name"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
                >
                  Full name (optional)
                </label>
                <input
                  id="invite_full_name"
                  autoComplete="name"
                  className={`${inputClass} mt-1`}
                  {...inviteForm.register('full_name')}
                />
              </div>
              <div>
                <label
                  htmlFor="invite_password"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
                >
                  New password
                </label>
                <input
                  id="invite_password"
                  type="password"
                  autoComplete="new-password"
                  className={`${inputClass} mt-1`}
                  {...inviteForm.register('password')}
                />
                {inviteForm.formState.errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {inviteForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="invite_confirm"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
                >
                  Confirm password
                </label>
                <input
                  id="invite_confirm"
                  type="password"
                  autoComplete="new-password"
                  className={`${inputClass} mt-1`}
                  {...inviteForm.register('confirm')}
                />
                {inviteForm.formState.errors.confirm && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {inviteForm.formState.errors.confirm.message}
                  </p>
                )}
              </div>
              <MovingBorderButton
                type="submit"
                disabled={inviteMutation.isPending}
                containerClassName="mt-2 w-full"
                className="w-full bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white transition-[background-color] hover:bg-[var(--color-secondary)] disabled:opacity-60"
                borderRadius="0.5rem"
                duration={2500}
              >
                {inviteMutation.isPending ? 'Activating…' : 'Activate account'}
              </MovingBorderButton>
            </form>
          ) : (
            <form
              onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
              noValidate
              className="mt-8 space-y-6"
            >
              <div>
                <label
                  htmlFor="vendor_tenant_slug"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
                >
                  Workspace
                </label>
                <input
                  id="vendor_tenant_slug"
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
                  htmlFor="vendor_email"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
                >
                  Email
                </label>
                <input
                  id="vendor_email"
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
                  htmlFor="vendor_password"
                  className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-neutral-500)]"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="vendor_password"
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
                    {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>
              <MovingBorderButton
                type="submit"
                disabled={loginMutation.isPending}
                containerClassName="mt-2 w-full"
                className="w-full bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white transition-[background-color] hover:bg-[var(--color-secondary)] disabled:opacity-60"
                borderRadius="0.5rem"
                duration={2500}
              >
                {loginMutation.isPending ? 'Signing in…' : 'Continue'}
              </MovingBorderButton>
            </form>
          )}

          <p className="mt-10 text-center text-xs text-[var(--color-neutral-400)]">
            Customer portal?{' '}
            <Link
              to="/portal/login"
              className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
            >
              Sign in there
            </Link>
            {' · '}
            Staff?{' '}
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
