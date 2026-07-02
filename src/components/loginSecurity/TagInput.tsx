import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface TagInputProps {
  label:       string
  placeholder: string
  values:      string[]
  disabled?:   boolean
  validate:    (v: string) => string | null
  normalize?:  (v: string) => string
  onChange:    (values: string[]) => void
}

export function TagInput({
  label, placeholder, values, disabled, validate, normalize, onChange,
}: TagInputProps) {
  const [input, setInput]   = useState('')
  const [error, setError]   = useState<string | null>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  const add = () => {
    const raw = input.trim()
    if (!raw) return
    const err = validate(raw)
    if (err) { setError(err); return }
    const normalized = normalize ? normalize(raw) : raw
    if (values.includes(normalized)) {
      setError('Already added')
      return
    }
    onChange([...values, normalized])
    setInput('')
    setError(null)
    inputRef.current?.focus()
  }

  const remove = (v: string) => onChange(values.filter((x) => x !== v))

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === 'Escape') { setInput(''); setError(null) }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-neutral-600)] mb-2">
        {label}
      </label>

      {/* Tags */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border"
              style={{
                background: 'var(--color-primary-50)',
                borderColor: 'var(--color-primary-200)',
                color: 'var(--color-primary-700)',
              }}
            >
              {v}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(v)}
                  aria-label={`Remove ${v}`}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input row */}
      {!disabled && (
        <>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(null) }}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className={[
                'flex-1 h-9 rounded-lg border px-3 text-sm font-mono text-[var(--color-neutral-900)]',
                'outline-none transition-all placeholder-[var(--color-neutral-300)]',
                error
                  ? 'border-[var(--color-danger-300)] ring-1 ring-[var(--color-danger-100)]'
                  : 'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-100)]',
              ].join(' ')}
            />
            <button
              type="button"
              onClick={add}
              aria-label={`Add ${label}`}
              className="h-9 px-3 rounded-lg border text-sm font-medium flex items-center gap-1.5 transition-colors"
              style={{
                borderColor: 'var(--color-primary-500)',
                color: 'var(--color-primary-600)',
                background: 'var(--color-primary-50)',
              }}
            >
              <Plus size={13} aria-hidden="true" />
              Add
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-1 text-xs" style={{ color: 'var(--color-danger-600)' }}>
              {error}
            </p>
          )}
        </>
      )}

      {values.length === 0 && disabled && (
        <p className="text-xs text-[var(--color-neutral-400)]">None configured</p>
      )}
    </div>
  )
}