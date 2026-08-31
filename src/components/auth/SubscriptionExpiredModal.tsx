import { useEffect } from 'react'
import { AlertTriangle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

/**
 * Shown when login succeeded but GET /auth/me is blocked (e.g. tenant subscription expired).
 * Keeps the user signed in so they see a clear message instead of a login redirect loop.
 */
export function SubscriptionExpiredModal() {
  const subscriptionBlocked = useAuthStore((s) => s.subscriptionBlocked)
  const subscriptionMessage = useAuthStore((s) => s.subscriptionMessage)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  const visible = subscriptionBlocked && isAuthenticated

  useEffect(() => {
    if (!visible) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-expired-title"
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl border border-[var(--color-neutral-200)]"
      >
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-warning-100, #fef3c7)' }}
            >
              <AlertTriangle
                size={18}
                style={{ color: 'var(--color-warning-700, #b45309)' }}
                aria-hidden
              />
            </div>
            <div>
              <h2
                id="subscription-expired-title"
                className="text-base font-semibold text-[var(--color-neutral-900)]"
              >
                Workspace access paused
              </h2>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1 leading-relaxed">
                {subscriptionMessage ||
                  'This tenant subscription has expired. Contact your platform administrator to renew access.'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void logout()}
              className="w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
