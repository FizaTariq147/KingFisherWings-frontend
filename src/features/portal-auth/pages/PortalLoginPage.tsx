import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { PortalApiError } from '@/lib/portalApiClient';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useAuthStore } from '@/store/authStore';
import { portalAuthService } from '../services/portalAuth.service';
import { usePortalAuthBootstrap } from '../hooks/usePortalAuthBootstrap';
import { usePortalAuthStore } from '../store/portalAuthStore';
import { clearPortalQueryCache } from '@/features/portal-shared/clearPortalQueryCache';
import { useVendorAuthStore } from '@/features/vendor-auth/store/vendorAuthStore';
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { AuthLandingShell } from '@/features/auth/components/AuthLandingShell'
import { withAuthThrottleMessage } from '@/features/auth/utils/authThrottleMessage';
import { safeInternalPath } from '@/lib/safeInternalPath';
import { stripSensitiveSearchParams } from '@/lib/stripSensitiveSearchParams';
import {
  clearInviteTokenSession,
  readInviteTokenFromSearch,
} from '@/lib/inviteTokenSession';
import { softPasswordField } from '@/lib/validation';
import { portalInviteErrorMessage } from '../utils/portalInviteErrorMessage';
import {
  LoginPopupFrame,
  popupInputClass,
  popupLabelClass,
  popupSubmitClass,
} from '@/features/auth/components/LoginPopupFrame'

const loginSchema = z.object({
  tenant_slug: z
    .string()
    .trim()
    .min(2, 'Tenant slug is required')
    .max(100, 'Tenant slug is too long'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const inviteSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length >= 2, 'Full name must be at least 2 characters'),
  password: softPasswordField(8),
  confirm: z.string().min(1, 'Confirm your password'),
}).refine((v) => v.password === v.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type InviteFormValues = z.infer<typeof inviteSchema>;

interface LocationState {
  from?: { pathname: string };
}

export default function PortalLoginPage() {
  useApplyTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inviteToken] = useState(() =>
    readInviteTokenFromSearch(window.location.search, 'portal'),
  );
  const isAcceptInvitePath = /accept-invite/i.test(location.pathname);
  const missingInviteToken = isAcceptInvitePath && !inviteToken;
  const setSession = usePortalAuthStore((s) => s.setSession);
  const { ready, accessToken } = usePortalAuthBootstrap();
  const [showPassword, setShowPassword] = useState(false);
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSlug, setForgotSlug] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotErr, setForgotErr] = useState<string | null>(null);
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenant_slug: '',
      email: '',
      password: '',
    },
  });

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { full_name: '', password: '', confirm: '' },
  });

  useEffect(() => {
    if (inviteToken) {
      stripSensitiveSearchParams(searchParams, setSearchParams);
    }
  }, [inviteToken, searchParams, setSearchParams]);

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
      useVendorAuthStore.getState().logout();
      clearVendorQueryCache();

      clearPortalQueryCache();
      setSession(user, accessToken, refreshToken);

      let mustChange = Boolean(user.mustChangePassword);
      try {
        const me = await portalAuthService.me();
        usePortalAuthStore.getState().setUser(me);
        mustChange = Boolean(me.mustChangePassword);
      } catch {
        /* login tokens are enough; /me can refresh on home */
      }

      if (mustChange) {
        navigate('/portal/change-password', { replace: true });
        return;
      }

      const from = (location.state as LocationState | null)?.from?.pathname;
      navigate(safeInternalPath(from, { prefix: '/portal', fallback: '/portal' }), { replace: true });
    },
    onError: (error: unknown) => {
      const raw =
        error instanceof PortalApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Login failed. Try again.';
      form.setError('root', { message: withAuthThrottleMessage(error, raw) });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: portalAuthService.acceptInvite,
    onSuccess: async (result) => {
      clearInviteTokenSession('portal');
      if (result?.accessToken) {
        useAuthStore.setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        useVendorAuthStore.getState().logout();
        clearVendorQueryCache();
        clearPortalQueryCache();
        setSession(result.user, result.accessToken, result.refreshToken);
        try {
          const me = await portalAuthService.me();
          usePortalAuthStore.getState().setUser(me);
        } catch {
          /* optional */
        }
        navigate('/portal', { replace: true });
        return;
      }
      setInviteSuccessMsg('Account activated. Sign in with your new password.');
      window.setTimeout(() => {
        navigate('/portal/login', { replace: true });
      }, 1200);
    },
    onError: (error: unknown) => {
      inviteForm.setError('root', { message: portalInviteErrorMessage(error) });
    },
  });

  const openForgot = () => {
    setForgotSlug(form.getValues('tenant_slug') || '');
    setForgotEmail(form.getValues('email') || '');
    setForgotErr(null);
    setForgotSent(false);
    setForgotOpen(true);
  };

  const handleForgotSend = async () => {
    const tenant_slug = forgotSlug.trim();
    const email = forgotEmail.trim().toLowerCase();
    if (tenant_slug.length < 2) {
      setForgotErr('Workspace username is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setForgotErr('Enter a valid email address.');
      return;
    }
    setForgotErr(null);
    setForgotSending(true);
    try {
      await portalAuthService.forgotPassword({ tenant_slug, email });
      setForgotSent(true);
    } catch (error) {
      const raw =
        error instanceof PortalApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Could not send temporary password.';
      setForgotErr(withAuthThrottleMessage(error, raw));
    } finally {
      setForgotSending(false);
    }
  };

  if (ready && accessToken) {
    const mustChange = Boolean(usePortalAuthStore.getState().user?.mustChangePassword);
    return (
      <Navigate to={mustChange ? '/portal/change-password' : '/portal'} replace />
    );
  }

  const closeToHub = () => navigate('/login');

  return (
    <AuthLandingShell onAdminClick={() => navigate('/login?admin=1')} videoOnly>
      {forgotOpen ? (
        <LoginPopupFrame title="Forgot password" onClose={() => setForgotOpen(false)}>
          {forgotSent ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
                If an account exists, a temporary password has been emailed. Sign in with it, then
                change your password.
              </div>
              <button
                type="button"
                className={popupSubmitClass}
                style={{ background: '#0A2942' }}
                onClick={() => setForgotOpen(false)}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <p className="text-xs text-slate-500">
                We email a temporary password. After signing in you must set a new password.
              </p>
              <div>
                <label htmlFor="portal_forgot_slug" className={popupLabelClass}>
                  Username
                </label>
                <input
                  id="portal_forgot_slug"
                  className={popupInputClass}
                  value={forgotSlug}
                  disabled={forgotSending}
                  onChange={(e) => setForgotSlug(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="portal_forgot_email" className={popupLabelClass}>
                  Email
                </label>
                <input
                  id="portal_forgot_email"
                  type="email"
                  className={popupInputClass}
                  value={forgotEmail}
                  disabled={forgotSending}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleForgotSend();
                  }}
                />
              </div>
              {forgotErr ? (
                <p className="text-xs text-red-600" role="alert">
                  {forgotErr}
                </p>
              ) : null}
              <button
                type="button"
                disabled={forgotSending}
                className={popupSubmitClass}
                style={{ background: '#0A2942' }}
                onClick={() => void handleForgotSend()}
              >
                {forgotSending ? 'Sending…' : 'Email temporary password'}
              </button>
            </div>
          )}
        </LoginPopupFrame>
      ) : (
      <LoginPopupFrame
        title={
          inviteToken || missingInviteToken
            ? 'Activate account & set password'
            : 'Customer Portal Sign In'
        }
        onClose={closeToHub}
      >
        {(form.formState.errors.root || inviteForm.formState.errors.root) && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
            {form.formState.errors.root?.message || inviteForm.formState.errors.root?.message}
          </div>
        )}
        {inviteSuccessMsg ? (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800" role="status">
            {inviteSuccessMsg}
          </div>
        ) : null}

        {missingInviteToken ? (
          <div className="space-y-3.5">
            <p className="text-sm text-slate-600" role="alert">
              This invitation link is missing a token. Open the full link from your email, or ask
              your forwarder to resend the invitation.
            </p>
            <button
              type="button"
              className={popupSubmitClass}
              style={{ background: '#0A2942' }}
              onClick={() => navigate('/portal/login', { replace: true })}
            >
              Go to portal sign in
            </button>
          </div>
        ) : inviteToken ? (
          <form
            onSubmit={inviteForm.handleSubmit((values) =>
              inviteMutation.mutate({
                token: inviteToken,
                password: values.password,
                full_name: values.full_name?.trim() || undefined,
              }),
            )}
            noValidate
            className="space-y-3.5"
          >
            <p className="text-xs text-slate-500">
              Choose a password for your customer portal account. After activation you can sign in
              anytime.
            </p>
            <div>
              <label htmlFor="invite_full_name" className={popupLabelClass}>
                Full name (optional)
              </label>
              <input id="invite_full_name" autoComplete="name" className={popupInputClass} {...inviteForm.register('full_name')} />
              {inviteForm.formState.errors.full_name && (
                <p className="mt-1 text-xs text-red-600">{inviteForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="invite_password" className={popupLabelClass}>
                New password
              </label>
              <div className="relative">
                <input
                  id="invite_password"
                  type={showInvitePassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`${popupInputClass} pr-10`}
                  {...inviteForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowInvitePassword((v) => !v)}
                  aria-label={showInvitePassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-[calc(50%+2px)] -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showInvitePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {inviteForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{inviteForm.formState.errors.password.message}</p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">At least 8 characters, with a letter and a number.</p>
            </div>
            <div>
              <label htmlFor="invite_confirm" className={popupLabelClass}>
                Confirm password
              </label>
              <input
                id="invite_confirm"
                type={showInvitePassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={popupInputClass}
                {...inviteForm.register('confirm')}
              />
              {inviteForm.formState.errors.confirm && (
                <p className="mt-1 text-xs text-red-600">{inviteForm.formState.errors.confirm.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={inviteMutation.isPending || Boolean(inviteSuccessMsg)}
              className={popupSubmitClass}
              style={{ background: '#0A2942' }}
            >
              {inviteMutation.isPending ? 'Activating…' : 'Activate account & set password'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
            noValidate
            className="space-y-3.5"
          >
            <div>
              <label htmlFor="tenant_slug" className={popupLabelClass}>
                Username
              </label>
              <input
                id="tenant_slug"
                autoComplete="organization"
                placeholder="Username"
                className={popupInputClass}
                {...form.register('tenant_slug')}
              />
              {form.formState.errors.tenant_slug && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.tenant_slug.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="portal_email" className={popupLabelClass}>
                Email
              </label>
              <input
                id="portal_email"
                type="email"
                autoComplete="username"
                className={popupInputClass}
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="portal_password" className={popupLabelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="portal_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`${popupInputClass} pr-10`}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-[calc(50%+2px)] -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</p>
              )}
              <button
                type="button"
                onClick={openForgot}
                className="mt-1 ml-auto block text-[12px] font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className={popupSubmitClass}
              style={{ background: '#0A2942' }}
            >
              {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}
      </LoginPopupFrame>
      )}
    </AuthLandingShell>
  );
}
