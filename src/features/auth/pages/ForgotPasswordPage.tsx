import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * Self-service forgot-password is NOT in Swagger Auth tag.
 * Password recovery: Tenant Admin → Users → admin-reset-password, or
 * authenticated user → Change Password.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--color-primary-50)' }}
          >
            <AlertCircle size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-neutral-900)]">
              Password reset unavailable
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              The Auth API does not expose forgot-password or email-reset endpoints. Contact your
              Tenant Admin to reset a staff password, or sign in and use Change Password if you
              already know your current password.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/login">
            <Button type="button" variant="primary">
              <ArrowLeft size={16} />
              Back to login
            </Button>
          </Link>
          <Link to="/change-password">
            <Button type="button" variant="secondary">
              Change password
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
