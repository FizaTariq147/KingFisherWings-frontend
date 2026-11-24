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
import { withAuthThrottleMessage } from '@/features/auth/utils/authThrottleMessage';
import { safeInternalPath } from '@/lib/safeInternalPath';
import {
  isSuperAdminOtpChallenge,
  superAdminAuthService,
  type SuperAdminLoginResponse,
} from '../services/superAdminAuth.service';
import { useSuperAdminAuthStore } from '../store/superAdminAuthStore';
import { AppMotionStyles } from '@/components/motion';
import { BackgroundBeams } from '@/components/aceternity/background-beams';
import { Spotlight } from '@/components/aceternity/spotlight';
import { BrandLogo } from '@/features/branding/components/BrandLogo';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
});

const signupSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().trim().min(2, 'First name is required').max(100),
  last_name: z.string().trim().min(2, 'Last name is required').max(100),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OtpFormValues = z.infer<typeof otpSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface LocationState {
  from?: { pathname: string };
}

function authErrorMessage(error: unknown, fallback: string): string {
  let detail = fallback;
  if (error instanceof ApiError && error.message.trim()) detail = error.message;
  else if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: string | string[] }).message;
      if (Array.isArray(message) && message.length) detail = message.map(String).join('; ');
      else if (typeof message === 'string' && message.trim()) detail = message;
    } else if (error.response?.status === 401) {
      detail = 'Invalid credentials. Check email and password.';
    }
  } else if (error instanceof Error && error.message.trim()) {
    if (/status code 401/i.test(error.message)) {
      detail = 'Invalid credentials. Check email and password.';
    } else {
      detail = error.message;
    }
  }
  return withAuthThrottleMessage(error, detail);
}

export default function SuperAdminLoginPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useSuperAdminAuthStore((s) => s.setSession);
  const clearErpSession = useAuthStore((s) => s.clearSession);
  const allowSignup = import.meta.env.DEV;
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    clearErpSession();
  }, [clearErpSession]);

  useEffect(() => {
    if (!allowSignup && mode === 'signup') setMode('login');
  }, [allowSignup, mode]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = window.setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendCooldown]);

  const loginForm = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const otpForm = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });
  const signupForm = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const completeLogin = (session: SuperAdminLoginResponse) => {
    clearErpSession();
    setSession(session.user, session.access_token, session.refresh_token);
    const from = (location.state as LocationState | null)?.from?.pathname;
    navigate(
      safeInternalPath(from, { prefix: '/superadmin', fallback: '/superadmin/dashboard' }),
      { replace: true },
    );
  };

  const loginMutation = useMutation({
    mutationFn: superAdminAuthService.login,
    onSuccess: (result) => {
      if (isSuperAdminOtpChallenge(result)) {
        setChallengeId(result.challenge_id);
        setOtpHint(
          result.message ||
            'We emailed a 6-digit code to your Super Admin address. Enter it to continue.',
        );
        setResendCooldown(typeof result.expires_in === 'number' ? Math.min(60, result.expires_in) : 30);
        otpForm.reset({ otp: '' });
        setMode('otp');
        return;
      }
      completeLogin(result);
    },
    onError: (error: unknown) => {
      loginForm.setError('root', {
        message: authErrorMessage(error, 'Login failed. Try again.'),
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (otp: string) => {
      if (!challengeId) throw new Error('OTP challenge expired. Sign in again.');
      return superAdminAuthService.verifyOtp({ challenge_id: challengeId, otp });
    },
    onSuccess: completeLogin,
    onError: (error: unknown) => {
      otpForm.setError('root', {
        message: authErrorMessage(error, 'Invalid or expired code. Try again.'),
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => {
      if (!challengeId) throw new Error('OTP challenge expired. Sign in again.');
      return superAdminAuthService.resendOtp(challengeId);
    },
    onSuccess: (result) => {
      setOtpHint(result.message || 'A new code was sent to your email.');
      setResendCooldown(typeof result.expires_in === 'number' ? Math.min(60, result.expires_in) : 30);
      otpForm.clearErrors('root');
    },
    onError: (error: unknown) => {
      otpForm.setError('root', {
        message: authErrorMessage(error, 'Could not resend code. Wait and try again.'),
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: superAdminAuthService.signup,
    onSuccess: () => {
      setMode('login');
      loginForm.setValue('email', signupForm.getValues('email'));
      loginForm.setError('root', {
        message: 'Account created. Sign in with your email and password — an OTP will be emailed.',
      });
    },
    onError: (error: unknown) => {
      signupForm.setError('root', {
        message: authErrorMessage(error, 'Signup failed. Try again.'),
      });
    },
  });

  const backToPassword = () => {
    setChallengeId(null);
    setOtpHint(null);
    setMode('login');
    otpForm.reset({ otp: '' });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-surface)] px-4">
      <AppMotionStyles />
      <BackgroundBeams className="pointer-events-none absolute inset-0 z-0 opacity-40" />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#FF751F" />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white/95 p-8 shadow-lg backdrop-blur-sm app-login-form">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandLogo
              systemOnly
              alt="King Fisher Technologies"
              className="h-14 w-auto max-w-[220px] object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">KingFisher Tech Gold</h1>
          <p className="mt-1 text-sm text-gray-500">Super Admin Portal</p>
        </div>

        {mode === 'otp' ? (
          <>
            <p className="mb-4 text-center text-sm text-gray-600">
              {otpHint || 'Enter the 6-digit code emailed to you.'}
            </p>
            {otpForm.formState.errors.root && (
              <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {otpForm.formState.errors.root.message}
              </div>
            )}
            <form
              onSubmit={otpForm.handleSubmit((values) => verifyOtpMutation.mutate(values.otp))}
              noValidate
            >
              <div className="mb-6">
                <label htmlFor="otp" className="mb-1 block text-sm font-medium text-gray-700">
                  One-time code
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.35em] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                  {...otpForm.register('otp')}
                />
                {otpForm.formState.errors.otp && (
                  <p className="mt-1 text-xs text-red-600">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={verifyOtpMutation.isPending}
                className="w-full rounded-sm bg-[var(--btn-primary-bg)] py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]"
              >
                {verifyOtpMutation.isPending ? 'Verifying…' : 'Verify and sign in'}
              </button>
            </form>
            <div className="mt-4 flex flex-col gap-2 text-center text-sm">
              <button
                type="button"
                className="text-[var(--color-primary)] hover:underline disabled:opacity-50"
                disabled={resendCooldown > 0 || resendOtpMutation.isPending || !challengeId}
                onClick={() => resendOtpMutation.mutate()}
              >
                {resendOtpMutation.isPending
                  ? 'Sending…'
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend code'}
              </button>
              <button
                type="button"
                className="text-gray-500 hover:underline"
                onClick={backToPassword}
              >
                Back to password
              </button>
            </div>
          </>
        ) : allowSignup ? (
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
          <p className="mb-6 text-center text-sm text-gray-500">
            Sign in with your platform account — email OTP required
          </p>
        )}

        {mode === 'login' ? (
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
                className="w-full rounded-sm bg-[var(--btn-primary-bg)] py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]"
              >
                {loginMutation.isPending ? 'Signing in…' : 'Continue'}
              </button>
            </form>
          </>
        ) : null}

        {mode === 'signup' && allowSignup ? (
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
                className="w-full rounded-sm bg-[var(--btn-primary-bg)] py-2.5 text-sm font-semibold text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]"
              >
                {signupMutation.isPending ? 'Creating…' : 'Create platform account'}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
}
