import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { ApiError } from '../../../lib/superAdminApiClient';
import { useAuthStore } from '@/store/authStore';
import { safeInternalPath } from '@/lib/safeInternalPath';
import { superAdminAuthService } from '../services/superAdminAuth.service';
import { useSuperAdminAuthStore } from '../store/superAdminAuthStore';
import { AppMotionStyles } from '@/components/motion';
import { BackgroundBeams } from '@/components/aceternity/background-beams';
import { Spotlight } from '@/components/aceternity/spotlight';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().trim().min(2, 'First name is required').max(100),
  last_name: z.string().trim().min(2, 'Last name is required').max(100),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface LocationState {
  from?: { pathname: string };
}

function authErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message.trim()) return error.message;
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: string | string[] }).message;
      if (Array.isArray(message) && message.length) return message.map(String).join('; ');
      if (typeof message === 'string' && message.trim()) return message;
    }
    if (error.response?.status === 401) {
      return 'Invalid credentials. Check email and password.';
    }
  }
  if (error instanceof Error && error.message.trim()) {
    if (/status code 401/i.test(error.message)) {
      return 'Invalid credentials. Check email and password.';
    }
    return error.message;
  }
  return fallback;
}

export default function SuperAdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSuperAdminAuthStore((s) => s.setSession);
  const clearErpSession = useAuthStore((s) => s.clearSession);
  const allowSignup =
    import.meta.env.DEV || import.meta.env.VITE_ALLOW_SUPERADMIN_SIGNUP === 'true';
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Drop leftover ERP idle/session state so the Revoke/Continue modal never appears here.
  useEffect(() => {
    clearErpSession();
  }, [clearErpSession]);

  useEffect(() => {
    if (!allowSignup && mode === 'signup') setMode('login');
  }, [allowSignup, mode]);

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const loginMutation = useMutation({
    mutationFn: superAdminAuthService.login,
    onSuccess: ({ user, access_token, refresh_token }) => {
      clearErpSession();
      setSession(user, access_token, refresh_token);
      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(safeInternalPath(from, { prefix: '/superadmin', fallback: '/superadmin/dashboard' }), { replace: true });
    },
    onError: (error: unknown) => {
      loginForm.setError('root', {
        message: authErrorMessage(error, 'Login failed. Try again.'),
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: superAdminAuthService.signup,
    onSuccess: () => {
      setMode('login');
      loginForm.setValue('email', signupForm.getValues('email'));
      loginForm.setError('root', {
        message: 'Account created. Sign in with your new credentials.',
      });
    },
    onError: (error: unknown) => {
      signupForm.setError('root', {
        message: authErrorMessage(error, 'Signup failed. Try again.'),
      });
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4">
      <AppMotionStyles />
      <BackgroundBeams className="pointer-events-none absolute inset-0 z-0 opacity-40" />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#FF751F" />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white/95 p-8 shadow-lg backdrop-blur-sm app-login-form">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">KingFisher Tech Gold</h1>
          <p className="mt-1 text-sm text-gray-500">Super Admin Portal</p>
        </div>

        {allowSignup ? (
          <div className="mb-6 flex rounded-md border border-gray-200 p-1 text-sm">
            <button
              type="button"
              className={`flex-1 rounded py-1.5 font-medium ${
                mode === 'login' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600'
              }`}
              onClick={() => setMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded py-1.5 font-medium ${
                mode === 'signup' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600'
              }`}
              onClick={() => setMode('signup')}
            >
              Register
            </button>
          </div>
        ) : (
          <p className="mb-6 text-center text-sm text-gray-500">Sign in with your platform account</p>
        )}

        {mode === 'login' || !allowSignup ? (
          <>
            {loginForm.formState.errors.root && (
              <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {loginForm.formState.errors.root.message}
              </div>
            )}

            <form
              onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}
              noValidate
            >
              <div className="mb-4">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
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
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {loginForm.formState.errors.password.message}
                  </p>
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
          </>
        ) : (
          <>
            {signupForm.formState.errors.root && (
              <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {signupForm.formState.errors.root.message}
              </div>
            )}

            <form
              onSubmit={signupForm.handleSubmit((values) => signupMutation.mutate(values))}
              noValidate
            >
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    id="first_name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    {...signupForm.register('first_name')}
                  />
                  {signupForm.formState.errors.first_name && (
                    <p className="mt-1 text-xs text-red-600">
                      {signupForm.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    id="last_name"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    {...signupForm.register('last_name')}
                  />
                  {signupForm.formState.errors.last_name && (
                    <p className="mt-1 text-xs text-red-600">
                      {signupForm.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="signup_email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="signup_email"
                  type="email"
                  autoComplete="username"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  {...signupForm.register('email')}
                />
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="signup_password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="signup_password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  {...signupForm.register('password')}
                />
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full rounded-md bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {signupMutation.isPending ? 'Creating…' : 'Create platform account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
