import { DAYS_OF_WEEK, type OfficeHoursDay } from '@/types/loginSecurity.types'
import { validateTimeRange } from './validators'

interface OfficeHoursEditorProps {
  hours:    OfficeHoursDay[]
  disabled: boolean
  onChange: (hours: OfficeHoursDay[]) => void
}

export function OfficeHoursEditor({ hours, disabled, onChange }: OfficeHoursEditorProps) {
  const update = (day: OfficeHoursDay['day'], patch: Partial<OfficeHoursDay>) => {
    onChange(hours.map((h) => h.day === day ? { ...h, ...patch } : h))
  }

  const inputClass = [
    'h-8 rounded-lg border px-2 text-xs text-[var(--color-neutral-800)]',
    'outline-none transition-all',
    'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-100)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ')

  return (
    <div className="space-y-2">
      {DAYS_OF_WEEK.map(({ day, label }) => {
        const h    = hours.find((x) => x.day === day)!
        const err  = h.enabled ? validateTimeRange(h.start, h.end) : null
        const isOn = h.enabled

        return (
          <div
            key={day}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
              isOn
                ? 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)]'
                : 'border-[var(--color-neutral-200)] bg-white'
            }`}
          >
            {/* Day toggle */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => update(day, { enabled: !h.enabled })}
              aria-pressed={isOn}
              aria-label={`${isOn ? 'Disable' : 'Enable'} ${label}`}
              className="relative w-9 h-5 rounded-full transition-colors shrink-0 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]"
              style={{
                background: isOn ? 'var(--color-primary-500)' : 'var(--color-neutral-200)',
                height: '20px',
              }}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  isOn ? 'translate-x-4' : 'translate-x-0'
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Day label */}
            <span
              className={`w-8 text-xs font-semibold shrink-0 ${
                isOn ? 'text-[var(--color-primary-700)]' : 'text-[var(--color-neutral-400)]'
              }`}
            >
              {day.slice(0, 3)}
            </span>

            {/* Time inputs */}
            {isOn ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={h.start}
                  disabled={disabled}
                  onChange={(e) => update(day, { start: e.target.value })}
                  aria-label={`${label} start time`}
                  className={inputClass}
                />
                <span className="text-xs text-[var(--color-neutral-400)]">to</span>
                <input
                  type="time"
                  value={h.end}
                  disabled={disabled}
                  onChange={(e) => update(day, { end: e.target.value })}
                  aria-label={`${label} end time`}
                  className={inputClass}
                />
                {err && (
                  <span className="text-[10px] ml-1" style={{ color: 'var(--color-danger-600)' }}>
                    {err}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-[var(--color-neutral-300)] flex-1">
                Not restricted
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}