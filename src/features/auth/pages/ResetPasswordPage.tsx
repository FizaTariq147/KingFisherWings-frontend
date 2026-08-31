import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { stripSensitiveSearchParams } from '@/lib/stripSensitiveSearchParams'

/**
 * Token-based reset is NOT in Swagger Auth tag.
 * Keep the route so old email links land on a clear message.
 */
export default function ResetPasswordPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const hasToken = Boolean(searchParams.get('token'))

  useEffect(() => {
    stripSensitiveSearchParams(searchParams, setSearchParams)
  }, [searchParams, setSearchParams])

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
              Reset link not supported
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-500)]">
              {hasToken
                ? 'This reset token cannot be redeemed — the backend Auth module has no reset-password endpoint.'
                : 'Self-service password reset is not available in the current Auth API.'}{' '}
              Ask your Tenant Admin to use Admin Reset Password on your user record, or sign in and
              change your password.
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
          <Link to="/forgot-password">
            <Button type="button" variant="secondary">
              More info
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
