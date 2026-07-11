import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw, ShieldOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

/**
 * Idle timeout popup (60 minutes of inactivity — not from login).
 * Continue → refresh tokens and keep working (no login).
 * Revoke → POST /auth/sessions/{sessionId}/revoke then sign out.
 */
export function SessionExpiredModal() {
  const sessionExpired = useAuthStore((s) => s.sessionExpired)
  const continueSession = useAuthStore((s) => s.continueExpiredSession)
  const revokeSession = useAuthStore((s) => s.revokeExpiredSessionAndLogin)
  const [busy, setBusy] = useState<'continue' | 'revoke' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionExpired) {
      setBusy(null)
      setError(null)
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [sessionExpired])

  if (!sessionExpired) return null

  const handleContinue = async () => {
    setBusy('continue')
    setError(null)
    try {
      await continueSession()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue session.')
      setBusy(null)
    }
  }

  const handleRevoke = async () => {
    setBusy('revoke')
    setError(null)
    try {
      await revokeSession()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl border border-[var(--color-neutral-200)]"
      >
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-danger-100)' }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--color-danger-700)' }} aria-hidden />
            </div>
            <div>
              <h2
                id="session-expired-title"
                className="text-base font-semibold text-[var(--color-neutral-900)]"
              >
                Session idle
              </h2>
              <p className="text-sm text-[var(--color-neutral-500)] mt-1 leading-relaxed">
                No activity for 60 minutes. Continue to keep working without signing in again, or
                revoke this session.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--color-danger-700)]" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="danger"
              disabled={busy !== null}
              onClick={handleRevoke}
              className="w-full sm:w-auto"
            >
              {busy === 'revoke' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldOff className="h-4 w-4" />
              )}
              {busy === 'revoke' ? 'Revoking…' : 'Revoke session'}
            </Button>
            <Button
              type="button"
              disabled={busy !== null}
              onClick={handleContinue}
              className="w-full sm:w-auto"
            >
              {busy === 'continue' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {busy === 'continue' ? 'Continuing…' : 'Continue session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
