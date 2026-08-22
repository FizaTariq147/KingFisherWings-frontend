import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { VendorApiError } from '@/lib/vendorApiClient';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { AuthLandingShell } from '@/features/auth/components/AuthLandingShell'
import {
  LoginPopupFrame,
  popupInputClass,
  popupLabelClass,
  popupSubmitClass,
} from '@/features/auth/components/LoginPopupFrame'
import { clearVendorQueryCache } from '@/features/vendor-shared/clearVendorQueryCache';
import { vendorErrorMessage } from '@/features/vendor-shared/vendorUnavailable';
import { safeInternalPath } from '@/lib/safeInternalPath';
import { useVendorAuthBootstrap } from '../hooks/useVendorAuthBootstrap';
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

export default function VendorLoginPage() {
  useApplyTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const inviteToken = (searchParams.get('token') || searchParams.get('invite') || '').trim();
  const setSession = useVendorAuthStore((s) => s.setSession);
  const { ready, accessToken } = useVendorAuthBootstrap();
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
      navigate(safeInternalPath(from, { prefix: '/vendor', fallback: '/vendor' }), { replace: true });
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

  const closeToHub = () => navigate('/login');

  return (
    <AuthLandingShell onAdminClick={() => navigate('/login?admin=1')} videoOnly>
      <LoginPopupFrame
        title={inviteToken ? 'Accept invite' : 'Vendor Portal Sign In'}
        onClose={closeToHub}
      >
        {(form.formState.errors.root || inviteForm.formState.errors.root) && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
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
            className="space-y-3.5"
          >
            <div>
              <label htmlFor="invite_full_name" className={popupLabelClass}>
                Full name (optional)
              </label>
              <input id="invite_full_name" autoComplete="name" className={popupInputClass} {...inviteForm.register('full_name')} />
            </div>
            <div>
              <label htmlFor="invite_password" className={popupLabelClass}>
                New password
              </label>
              <input
                id="invite_password"
                type="password"
                autoComplete="new-password"
                className={popupInputClass}
                {...inviteForm.register('password')}
              />
              {inviteForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{inviteForm.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="invite_confirm" className={popupLabelClass}>
                Confirm password
              </label>
              <input
                id="invite_confirm"
                type="password"
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
              disabled={inviteMutation.isPending}
              className={popupSubmitClass}
              style={{ background: '#0A2942' }}
            >
              {inviteMutation.isPending ? 'Activating…' : 'Activate account'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
            noValidate
            className="space-y-3.5"
          >
            <div>
              <label htmlFor="vendor_tenant_slug" className={popupLabelClass}>
                Workspace
              </label>
              <input
                id="vendor_tenant_slug"
                autoComplete="organization"
                placeholder="Tenant slug"
                className={popupInputClass}
                {...form.register('tenant_slug')}
              />
              {form.formState.errors.tenant_slug && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.tenant_slug.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="vendor_email" className={popupLabelClass}>
                Email
              </label>
              <input
                id="vendor_email"
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
              <label htmlFor="vendor_password" className={popupLabelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="vendor_password"
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
    </AuthLandingShell>
  );
}
