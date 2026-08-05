import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PortalApiError } from '@/lib/portalApiClient';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useAuthStore } from '@/store/authStore';
import { portalAuthService } from '../services/portalAuth.service';
import { usePortalAuthBootstrap } from '../hooks/usePortalAuthBootstrap';
import { usePortalBrand } from '../hooks/usePortalBrand';
import { usePortalAuthStore } from '../store/portalAuthStore';

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

export default function PortalLoginPage() {
  useApplyTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = usePortalAuthStore((s) => s.setSession);
  const { ready, accessToken } = usePortalAuthBootstrap();
  const { companyName, portalLabel } = usePortalBrand();

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
      // Keep portal session isolated from ERP staff session.
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">{companyName}</h1>
          <p className="mt-1 text-sm text-[var(--color-neutral-500)]">{portalLabel}</p>
        </div>

        {form.formState.errors.root && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {form.formState.errors.root.message}
          </div>
        )}

        <form
          onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
          noValidate
          className="space-y-4"
        >
          <div>
            <label htmlFor="tenant_slug" className="mb-1 block text-sm font-medium text-gray-700">
              Tenant slug
            </label>
            <input
              id="tenant_slug"
              autoComplete="organization"
              placeholder="e.g. kingfisher"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              {...form.register('tenant_slug')}
            />
            {form.formState.errors.tenant_slug && (
              <p className="mt-1 text-xs text-red-600">
                {form.formState.errors.tenant_slug.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="portal_email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="portal_email"
              type="email"
              autoComplete="username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="portal_password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="portal_password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              {...form.register('password')}
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-[var(--color-secondary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-secondary-600)] disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Staff?{' '}
          <Link to="/login" className="text-[var(--color-primary)] underline">
            ERP login
          </Link>
        </p>
      </div>
    </div>
  );
}
