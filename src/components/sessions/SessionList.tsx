import { useState } from 'react'
import {
  Monitor, Smartphone, Tablet, HelpCircle,
  MapPin, Clock, RefreshCw, ShieldCheck,
} from 'lucide-react'
import { useSessions } from '@/hooks/useSessions'
import { RevokeConfirmModal } from './RevokeConfirmModal'
import type { ActiveSession } from '@/types/session.types'

// ── Device icon ────────────────────────────────────────────────────────────
function DeviceIcon({ type }: { type: ActiveSession['deviceType'] }) {
  const props = { size: 18, 'aria-hidden': true as const }
  const color = 'var(--color-neutral-500)'
  switch (type) {
    case 'mobile':  return <Smartphone {...props} style={{ color }} />
    case 'tablet':  return <Tablet     {...props} style={{ color }} />
    case 'desktop': return <Monitor    {...props} style={{ color }} />
    default:        return <HelpCircle {...props} style={{ color }} />
  }
}

// ── Relative time ──────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ── Session card ───────────────────────────────────────────────────────────
interface SessionCardProps {
  session:   ActiveSession
  revoking:  string | null
  onRevoke:  (session: ActiveSession) => void
}

function SessionCard({ session, revoking, onRevoke }: SessionCardProps) {
  const isRevoking  = revoking === session.id
  const isCurrent   = session.isCurrent

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
        isCurrent
          ? 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)]'
          : 'border-[var(--color-neutral-200)] bg-white'
      }`}
    >
      {/* Device icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: isCurrent
            ? 'var(--color-primary-100)'
            : 'var(--color-neutral-100)',
        }}
      >
        <DeviceIcon type={session.deviceType} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[var(--color-neutral-900)]">
            {session.browser}
          </span>
          <span className="text-xs text-[var(--color-neutral-400)]">
            {session.os}
          </span>
          {isCurrent && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                background: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
              }}
            >
              <ShieldCheck size={10} aria-hidden="true" />
              Current session
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
          <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-500)]">
            <MapPin size={11} aria-hidden="true" />
            {session.ipAddress}
            {session.location && ` · ${session.location}`}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-neutral-400)]">
            <Clock size={11} aria-hidden="true" />
            Active {relativeTime(session.lastActiveAt)}
          </span>
        </div>
      </div>

      {/* Revoke */}
      {!isCurrent && (
        <button
          type="button"
          onClick={() => onRevoke(session)}
          disabled={isRevoking}
          className="shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50"
          style={{
            borderColor: 'var(--color-danger-200)',
            color: 'var(--color-danger-700)',
            background: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-danger-100)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white'
          }}
        >
          {isRevoking ? 'Revoking…' : 'Revoke'}
        </button>
      )}
    </div>
  )
}

// ── SessionList ────────────────────────────────────────────────────────────
export function SessionList() {
  const { sessions, isLoading, error, revoking, refresh, revokeById } = useSessions()
  const [pendingRevoke, setPendingRevoke] = useState<ActiveSession | null>(null)

  const handleConfirm = async () => {
    if (!pendingRevoke) return
    await revokeById(pendingRevoke.id)
    setPendingRevoke(null)
  }

  const currentSession  = sessions.find((s) => s.isCurrent)
  const otherSessions   = sessions.filter((s) => !s.isCurrent)

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">
              Active sessions
            </h2>
            <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
              {isLoading
                ? 'Loading…'
                : `${sessions.length} session${sessions.length !== 1 ? 's' : ''} active`}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            aria-label="Refresh sessions"
            className="p-2 rounded-lg border border-[var(--color-neutral-200)] text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] transition-colors disabled:opacity-40"
          >
            <RefreshCw
              size={14}
              className={isLoading ? 'animate-spin' : ''}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-xl text-sm border"
            style={{
              background: 'var(--color-danger-100)',
              borderColor: '#FECACA',
              color: 'var(--color-danger-700)',
            }}
          >
            {error}
          </div>
        )}

        {/* Skeleton */}
        {isLoading && !sessions.length && (
          <div className="flex flex-col gap-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-neutral-100)]"
              />
            ))}
          </div>
        )}

        {/* Current session */}
        {currentSession && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
              This device
            </p>
            <SessionCard
              session={currentSession}
              revoking={revoking}
              onRevoke={setPendingRevoke}
            />
          </div>
        )}

        {/* Other sessions */}
        {otherSessions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-neutral-400)]">
              Other sessions
            </p>
            <div className="flex flex-col gap-2">
              {otherSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  revoking={revoking}
                  onRevoke={setPendingRevoke}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && sessions.length === 0 && (
          <p className="text-sm text-center text-[var(--color-neutral-400)] py-8">
            No active sessions found.
          </p>
        )}
      </div>

      {/* Confirm modal */}
      {pendingRevoke && (
        <RevokeConfirmModal
          sessionLabel={`${pendingRevoke.browser} on ${pendingRevoke.os}`}
          isRevoking={revoking === pendingRevoke.id}
          onConfirm={handleConfirm}
          onCancel={() => setPendingRevoke(null)}
        />
      )}
    </>
  )
}