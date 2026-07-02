import { useEffect, useState } from 'react'
import { Shield, CheckCircle2, Loader2 } from 'lucide-react'
import { useLoginSecurity } from '@/hooks/useLoginSecurity'
import { TagInput } from './TagInput'
import { OfficeHoursEditor } from './OfficeHoursEditor'
import { validateIpRange, validateMac, normalizeMac } from './validators'
import type { LoginSecurityPayload, OfficeHoursDay } from '@/types/loginSecurity.types'

// ── Section wrapper ────────────────────────────────────────────────────────
interface SectionProps {
  title:       string
  description: string
  enabled:     boolean
  onToggle:    () => void
  children:    React.ReactNode
}

function Section({ title, description, enabled, onToggle, children }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-neutral-200)] overflow-hidden">
      <div className="flex items-start justify-between px-5 py-4 border-b border-[var(--color-neutral-100)]">
        <div className="flex-1 min-w-0 mr-4">
          <p className="text-sm font-semibold text-[var(--color-neutral-900)]">{title}</p>
          <p className="text-xs text-[var(--color-neutral-400)] mt-0.5 leading-relaxed">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${title}`}
          className="relative shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
          style={{ width: 40, height: 22, background: enabled ? 'var(--color-primary-500)' : 'var(--color-neutral-200)' }}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {enabled && (
        <div className="px-5 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ── IANA timezone list (abbreviated — expand as needed) ────────────────────
const TIMEZONES = [
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Kuala_Lumpur',
  'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Africa/Dar_es_Salaam',
  'UTC',
]

// ── Form ───────────────────────────────────────────────────────────────────
interface LoginSecurityFormProps {
  userId:   string
  userName: string
}

export function LoginSecurityForm({ userId, userName }: LoginSecurityFormProps) {
  const { config, isLoading, isSaving, error, saved, save } = useLoginSecurity(userId)

  // Local form state — mirrors config, edited locally before save
  const [ipEnabled,    setIpEnabled]    = useState(false)
  const [ipRanges,     setIpRanges]     = useState<string[]>([])
  const [macEnabled,   setMacEnabled]   = useState(false)
  const [macAddresses, setMacAddresses] = useState<string[]>([])
  const [hoursEnabled, setHoursEnabled] = useState(false)
  const [officeHours,  setOfficeHours]  = useState<OfficeHoursDay[]>([])
  const [timezone,     setTimezone]     = useState('Asia/Dubai')
  const [multiLogin,   setMultiLogin]   = useState(true)

  // Sync from fetched config
  useEffect(() => {
    if (!config) return
    setIpEnabled(config.ipRestrictionEnabled)
    setIpRanges(config.allowedIpRanges)
    setMacEnabled(config.macRestrictionEnabled)
    setMacAddresses(config.allowedMacAddresses)
    setHoursEnabled(config.officeHoursEnabled)
    setOfficeHours(config.officeHours)
    setTimezone(config.timezone)
    setMultiLogin(config.multiLoginAllowed)
  }, [config])

  const handleSave = async () => {
    const payload: LoginSecurityPayload = {
      ipRestrictionEnabled:  ipEnabled,
      allowedIpRanges:       ipEnabled  ? ipRanges     : [],
      macRestrictionEnabled: macEnabled,
      allowedMacAddresses:   macEnabled ? macAddresses : [],
      officeHoursEnabled:    hoursEnabled,
      officeHours:           hoursEnabled ? officeHours : config?.officeHours ?? [],
      timezone,
      multiLoginAllowed:     multiLogin,
    }
    await save(payload)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-[var(--color-neutral-100)]" />
        ))}
      </div>
    )
  }

  const inputClass = [
    'h-9 rounded-lg border px-3 text-sm text-[var(--color-neutral-800)] bg-white w-full',
    'outline-none transition-all',
    'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-100)]',
  ].join(' ')

  return (
    <div className="flex flex-col gap-4">

      {/* IP restriction */}
      <Section
        title="IP Address Restriction"
        description="Restrict login to specific IP addresses or CIDR ranges only."
        enabled={ipEnabled}
        onToggle={() => setIpEnabled((v) => !v)}
      >
        <TagInput
          label="Allowed IP addresses / ranges"
          placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
          values={ipRanges}
          validate={validateIpRange}
          onChange={setIpRanges}
        />
      </Section>

      {/* MAC restriction */}
      <Section
        title="MAC Address Restriction"
        description="Restrict login to specific device MAC addresses only."
        enabled={macEnabled}
        onToggle={() => setMacEnabled((v) => !v)}
      >
        <TagInput
          label="Allowed MAC addresses"
          placeholder="e.g. AA:BB:CC:DD:EE:FF"
          values={macAddresses}
          validate={validateMac}
          normalize={normalizeMac}
          onChange={setMacAddresses}
        />
      </Section>

      {/* Office hours */}
      <Section
        title="Office Hours Restriction"
        description="Block login outside of configured working hours. Times are in the user's timezone."
        enabled={hoursEnabled}
        onToggle={() => setHoursEnabled((v) => !v)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-1.5">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={inputClass}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <OfficeHoursEditor
            hours={officeHours}
            disabled={false}
            onChange={setOfficeHours}
          />
        </div>
      </Section>

      {/* Multi-login */}
      <div className="bg-white rounded-xl border border-[var(--color-neutral-200)] px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--color-neutral-900)]">
            Allow simultaneous logins
          </p>
          <p className="text-xs text-[var(--color-neutral-400)] mt-0.5">
            When disabled, logging in from a new device will invalidate all other sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMultiLogin((v) => !v)}
          aria-pressed={multiLogin}
          aria-label={multiLogin ? 'Disable simultaneous logins' : 'Allow simultaneous logins'}
          className="relative shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
          style={{ width: 40, height: 22, background: multiLogin ? 'var(--color-primary-500)' : 'var(--color-neutral-200)' }}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${multiLogin ? 'translate-x-[18px]' : 'translate-x-0'}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl text-sm border"
          style={{ background: 'var(--color-danger-100)', borderColor: '#FECACA', color: 'var(--color-danger-700)' }}
        >
          {error}
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-[var(--color-neutral-400)]">
          Configuring login security for <strong>{userName}</strong>
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
          style={{ background: 'var(--color-primary-600)' }}
        >
          {isSaving
            ? <><Loader2 size={13} className="animate-spin" />Saving…</>
            : saved
              ? <><CheckCircle2 size={13} />Saved</>
              : 'Save settings'
          }
        </button>
      </div>
    </div>
  )
}