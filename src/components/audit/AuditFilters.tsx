import { useForm } from 'react-hook-form'
import { Search, RotateCcw } from 'lucide-react'
import type { AuditAction, AuditEntity, AuditLogFilters } from '@/types/audit.types'

const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: 'CREATE',             label: 'Create' },
  { value: 'EDIT',               label: 'Edit' },
  { value: 'DELETE',             label: 'Delete' },
  { value: 'LOGIN',              label: 'Login' },
  { value: 'LOGOUT',             label: 'Logout' },
  { value: 'LOGIN_FAILED',       label: 'Login Failed' },
  { value: 'DOCUMENT_GENERATED', label: 'Doc Generated' },
  { value: 'DOCUMENT_EMAILED',   label: 'Doc Emailed' },
  { value: 'SETTINGS_CHANGED',   label: 'Settings Changed' },
  { value: 'PASSWORD_CHANGED',   label: 'Password Changed' },
  { value: 'PERMISSION_CHANGED', label: 'Permission Changed' },
]

const ENTITY_OPTIONS: { value: AuditEntity; label: string }[] = [
  { value: 'USER',       label: 'User' },
  { value: 'ROLE',       label: 'Role' },
  { value: 'JOB',        label: 'Job' },
  { value: 'QUOTATION',  label: 'Quotation' },
  { value: 'CUSTOMER',   label: 'Customer' },
  { value: 'INVOICE',    label: 'Invoice' },
  { value: 'PAYMENT',    label: 'Payment' },
  { value: 'DOCUMENT',   label: 'Document' },
  { value: 'SETTINGS',   label: 'Settings' },
  { value: 'SESSION',    label: 'Session' },
  { value: 'PERMISSION', label: 'Permission' },
]

interface AuditFiltersProps {
  current:   AuditLogFilters
  onChange:  (f: AuditLogFilters) => void
}

interface FormValues {
  search:   string
  action:   string
  entity:   string
  dateFrom: string
  dateTo:   string
}

export function AuditFilters({ current, onChange }: AuditFiltersProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      search:   current.search   ?? '',
      action:   current.action   ?? '',
      entity:   current.entity   ?? '',
      dateFrom: current.dateFrom ?? '',
      dateTo:   current.dateTo   ?? '',
    },
  })

  const onSubmit = (values: FormValues) => {
    onChange({
      ...(values.search   && { search:   values.search }),
      ...(values.action   && { action:   values.action   as AuditAction }),
      ...(values.entity   && { entity:   values.entity   as AuditEntity }),
      ...(values.dateFrom && { dateFrom: values.dateFrom }),
      ...(values.dateTo   && { dateTo:   values.dateTo }),
    })
  }

  const handleReset = () => {
    reset({ search: '', action: '', entity: '', dateFrom: '', dateTo: '' })
    onChange({})
  }

  const inputClass = [
    'h-8 rounded-lg border border-[var(--color-neutral-200)] px-3 text-xs',
    'text-[var(--color-neutral-800)] bg-white outline-none',
    'focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-100)]',
    'transition-colors placeholder-[var(--color-neutral-300)]',
  ].join(' ')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-xl border border-[var(--color-neutral-200)]"
    >
      {/* Search */}
      <div className="flex flex-col gap-1 min-w-[180px] flex-1">
        <label className="text-[10px] font-medium text-[var(--color-neutral-500)] uppercase tracking-wider">
          Search
        </label>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)]" />
          <input {...register('search')} placeholder="User, record, IP…" className={`${inputClass} pl-7 w-full`} />
        </div>
      </div>

      {/* Action */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-[var(--color-neutral-500)] uppercase tracking-wider">
          Action
        </label>
        <select {...register('action')} className={`${inputClass} pr-8`}>
          <option value="">All actions</option>
          {ACTION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Entity */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-[var(--color-neutral-500)] uppercase tracking-wider">
          Module
        </label>
        <select {...register('entity')} className={`${inputClass} pr-8`}>
          <option value="">All modules</option>
          {ENTITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Date from */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-[var(--color-neutral-500)] uppercase tracking-wider">
          From
        </label>
        <input type="date" {...register('dateFrom')} className={inputClass} />
      </div>

      {/* Date to */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-medium text-[var(--color-neutral-500)] uppercase tracking-wider">
          To
        </label>
        <input type="date" {...register('dateTo')} className={inputClass} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="h-8 px-4 rounded-lg text-xs font-medium text-white transition-colors"
          style={{ background: 'var(--color-primary-600)' }}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="h-8 px-3 rounded-lg border border-[var(--color-neutral-200)] text-xs text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)] transition-colors flex items-center gap-1.5"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>
    </form>
  )
}