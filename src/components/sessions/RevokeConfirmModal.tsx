import { useEffect, useRef } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface RevokeConfirmModalProps {
  sessionLabel: string
  isRevoking:   boolean
  onConfirm:    () => void
  onCancel:     () => void
}

export function RevokeConfirmModal({
  sessionLabel,
  isRevoking,
  onConfirm,
  onCancel,
}: RevokeConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Auto-focus confirm button and handle Escape
  useEffect(() => {
    confirmRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="revoke-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-danger-100)' }}
            >
              <AlertTriangle
                size={18}
                style={{ color: 'var(--color-danger-700)' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="revoke-title"
                className="text-sm font-semibold text-[var(--color-neutral-900)]"
              >
                Revoke session?
              </h2>
              <p className="text-xs text-[var(--color-neutral-500)] mt-1 leading-relaxed">
                <strong>{sessionLabel}</strong> will be signed out immediately. Any
                unsaved work in that session will be lost.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={isRevoking}
              className="px-4 py-2 rounded-lg border border-[var(--color-neutral-200)] text-sm text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              disabled={isRevoking}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors disabled:opacity-60"
              style={{ background: 'var(--color-danger-500)' }}
            >
              {isRevoking && <Loader2 size={13} className="animate-spin" />}
              {isRevoking ? 'Revoking…' : 'Revoke session'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}