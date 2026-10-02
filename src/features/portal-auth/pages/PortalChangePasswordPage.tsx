import { useEffect, useState, type InputHTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { softPasswordField, V, withAppFormDefaults } from '@/lib/validation';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PortalApiError } from '@/lib/portalApiClient';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { AuthLandingShell } from '@/features/auth/components/AuthLandingShell';
import { LoginPopupFrame } from '@/features/auth/components/LoginPopupFrame';
import { PORTAL_CHANGE_PASSWORD_PATH } from '../api/portalAuth.api';
import { portalAuthService } from '../services/portalAuth.service';
import { usePortalAuthStore } from '../store/portalAuthStore';

const schema = z
  .object({
    current_password: z.string().min(1, 'Temporary password is required'),
    new_password: softPasswordField(8),
    confirm_password: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: V.passwordMatch,
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: V.passwordDifferent,
    path: ['new_password'],
  });

type FormValues = z.infer<typeof schema>;

function extractErrorMessage(error: unknown): string {
  if (error instanceof PortalApiError && error.message.trim()) return error.message;
  const ax = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };
  const msg = ax.response?.data?.message;
  if (Array.isArray(msg) && msg[0]) return String(msg[0]);
  if (typeof msg === 'string' && msg.trim()) return msg;
  if (typeof ax.response?.data?.error === 'string') return ax.response.data.error;
  if (error instanceof Error && error.message) return error.message;
  return 'Could not change password. Please try again.';
}

/**
 * Forced / optional portal password change.
 * OpenAPI: POST /portal/auth/change-password (required when must_change_password is true).
 */
export default function PortalChangePasswordPage() {
  useApplyTheme();
  const navigate = useNavigate();
  const user = usePortalAuthStore((s) => s.user);
  const isAuthenticated = usePortalAuthStore((s) => s.isAuthenticated);
  const accessToken = usePortalAuthStore((s) => s.accessToken);
  const clearMustChangePassword = usePortalAuthStore((s) => s.clearMustChangePassword);
  const logout = usePortalAuthStore((s) => s.logout);
  const forced = Boolean(user?.mustChangePassword);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>(
    withAppFormDefaults({
      resolver: zodResolver(schema),
    }),
  );

  const current = watch('current_password');
  const next = watch('new_password');
  const confirm = watch('confirm_password');

  useEffect(() => {
    if (apiError) setApiError(null);
  }, [current, next, confirm]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated && !accessToken) {
      navigate('/portal/login', { replace: true });
    }
  }, [isAuthenticated, accessToken, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (submitting) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await portalAuthService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      clearMustChangePassword();
      navigate('/portal', { replace: true });
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated && !accessToken) return null;

  return (
    <AuthLandingShell onAdminClick={() => navigate('/login?admin=1')} videoOnly>
      <LoginPopupFrame
        title={forced ? 'Set your password' : 'Change password'}
        onClose={() => {
          if (forced) {
            logout();
            navigate('/portal/login', { replace: true });
            return;
          }
          navigate('/portal/account');
        }}
      >
        <p className="mb-4 text-sm text-slate-500 leading-relaxed">
          {forced
            ? 'You signed in with a temporary password. Choose your own password to continue using the customer portal.'
            : 'Update your portal password. You will use it the next time you sign in.'}
        </p>
        {user?.email ? (
          <p className="mb-4 text-xs text-slate-400">
            Signed in as <span className="font-medium text-slate-600">{user.email}</span>
          </p>
        ) : null}

        {apiError ? (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{apiError}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          <PasswordField
            id="portal_current_password"
            label={forced ? 'Temporary password' : 'Current password'}
            show={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            error={errors.current_password?.message}
            autoComplete="current-password"
            disabled={submitting}
            {...register('current_password')}
          />
          <PasswordField
            id="portal_new_password"
            label="New password"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
            error={errors.new_password?.message}
            autoComplete="new-password"
            disabled={submitting}
            hint="At least 8 characters, with a letter and a number"
            {...register('new_password')}
          />
          <PasswordField
            id="portal_confirm_password"
            label="Confirm new password"
            show={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            error={errors.confirm_password?.message}
            autoComplete="new-password"
            disabled={submitting}
            {...register('confirm_password')}
          />

          <Button type="submit" className="w-full mt-1" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                {forced ? 'Save and continue' : 'Update password'}
              </>
            )}
          </Button>

          {!forced ? (
            <button
              type="button"
              className="w-full text-center text-xs text-slate-500 hover:text-slate-700"
              onClick={() => navigate('/portal/account')}
            >
              Back to account
            </button>
          ) : (
            <p className="text-center text-[11px] text-slate-400">
              You must set a new password before using the portal ({PORTAL_CHANGE_PASSWORD_PATH}).
            </p>
          )}
        </form>
      </LoginPopupFrame>
    </AuthLandingShell>
  );
}

function PasswordField({
  id,
  label,
  show,
  onToggle,
  error,
  hint,
  ...rest
}: {
  id: string;
  label: string;
  show: boolean;
  onToggle: () => void;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:border-[var(--color-secondary)] focus:ring-2 focus:ring-[var(--color-secondary)]/20"
          {...rest}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !error ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
