import { Shield } from 'lucide-react'
import { SessionList } from '@/components/sessions/SessionList'

export default function SessionManagementPage() {
  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-primary-50)' }}
        >
          <Shield size={18} style={{ color: 'var(--color-primary-600)' }} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--color-neutral-900)]">
            Session management
          </h1>
          <p className="text-xs text-[var(--color-neutral-400)]">
            View and revoke your active login sessions across all devices.
          </p>
        </div>
      </div>

      <SessionList />
    </div>
  )
}