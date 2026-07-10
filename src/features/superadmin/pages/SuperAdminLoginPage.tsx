import type { JSX } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ApiError } from '../../../lib/superAdminApiClient';
import { useAuthStore } from '@/store/authStore';
import { superAdminAuthService } from '../services/superAdminAuth.service';
import { useSuperAdminAuthStore } from '../store/superAdminAuthStore';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname: string };
}

export default function SuperAdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSuperAdminAuthStore((s) => s.setSession);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useMutation({
    mutationFn: superAdminAuthService.login,
    onSuccess: ({ user, access_token, refresh_token }) => {
      // Keep platform and tenant sessions mutually exclusive in the UI.
      useAuthStore.setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        error: null,
      });
      setSession(user, access_token, refresh_token);
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(from ?? '/superadmin/dashboard', { replace: true });
    },
    onError: (error: unknown) => {
      const message = error instanceof ApiError ? error.message : 'Login failed. Try again.';
      setError('root', { message });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">KingFisher Tech Gold</h1>
          <p className="mt-1 text-sm text-gray-500">Super Admin Portal</p>
        </div>

        {errors.root && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit((values) => loginMutation.mutate(values))} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              {...register('email')}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}