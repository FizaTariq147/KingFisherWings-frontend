import { useEffect } from 'react'
import { AlertTriangle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

/**
 * Shown when login succeeded but protected ERP APIs return REQUIRES_2FA_SETUP (403).
 * This is a backend API guard — not a frontend login or 2FA UI issue.
 */
export function ErpAccessBlockedModal() {
  const erpAccessBlocked = useAuthStore((s) => s.erpAccessBlocked)
  const erpAccessMessage = useAuthStore((s) => s.erpAccessMessage)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  const visible = erpAccessBlocked && isAuthenticated

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
        aria-labelledby="erp-access-blocked-title"
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
                id="erp-access-blocked-title"
                className="text-base font-semibold text-[var(--color-neutral-900)]"
              >
                ERP access blocked by the API
              </h2>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1 leading-relaxed">
                {erpAccessMessage ||
                  'The server is still enforcing a tenant-admin two-factor requirement on ERP routes.'}
              </p>
              <p className="text-sm text-[var(--color-neutral-500)] mt-2 leading-relaxed">
                Sign-in worked, but the backend returned{' '}
                <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">REQUIRES_2FA_SETUP</code>{' '}
                on protected endpoints such as <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">/users</code>.
                Ask the backend team to remove that guard now that 2FA is disabled.
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
