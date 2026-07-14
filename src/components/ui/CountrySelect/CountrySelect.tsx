import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { countryFlag, getCountry, getCountryOptions } from '@/lib/countries';

export interface CountrySelectProps {
  label?: string;
  value: string;
  onChange: (iso2: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  allowEmpty?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export function CountrySelect({
  label = 'Country',
  value,
  onChange,
  error,
  hint,
  required,
  allowEmpty = true,
  disabled,
  id,
  name,
  className,
}: CountrySelectProps) {
  const listId = useId();
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const rootRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => getCountryOptions(), []);
  const selected = getCountry(value);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open, value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.iso2.toLowerCase().includes(q) ||
        o.dial.includes(q.replace(/^\+/, '')),
    );
  }, [options, query]);

  const display = selected
    ? `${countryFlag(selected.iso2)} ${selected.name}`
    : allowEmpty
      ? 'Select country…'
      : 'Select country…';

  return (
    <div className={cn('flex flex-col gap-1', className)} ref={rootRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[var(--color-neutral-600)]"
        >
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <input type="hidden" name={name} value={value ?? ''} data-field={name} />
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'h-9 w-full rounded-md border bg-white px-3 text-left text-sm text-[var(--color-neutral-800)] transition-colors',
          'border-[var(--color-neutral-200)]',
          'focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]',
          error && 'border-[var(--color-danger-500)] focus:ring-[var(--color-danger-500)]',
          disabled && 'bg-[var(--color-neutral-50)] opacity-60 cursor-not-allowed',
          !selected && 'text-[var(--color-neutral-400)]',
        )}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{display}</span>
          <span className="text-[var(--color-neutral-400)] text-xs">{selected?.iso2 ?? ''}</span>
        </span>
      </button>

      {open && (
        <div
          className="relative z-30"
          role="listbox"
          id={listId}
        >
          <div className="absolute left-0 right-0 top-1 overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-white shadow-lg">
            <div className="border-b border-[var(--color-neutral-100)] p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or dial code…"
                className="h-8 w-full rounded border border-[var(--color-neutral-200)] px-2 text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {allowEmpty && (
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--color-neutral-500)] hover:bg-[var(--color-neutral-50)]"
                    onClick={() => {
                      onChange('');
                      setOpen(false);
                    }}
                  >
                    Clear
                  </button>
                </li>
              )}
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-[var(--color-neutral-400)]">No matches</li>
              )}
              {filtered.map((c) => (
                <li key={c.iso2}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.iso2 === value}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-neutral-50)]',
                      c.iso2 === value && 'bg-[var(--color-primary-50)]',
                    )}
                    onClick={() => {
                      onChange(c.iso2);
                      setOpen(false);
                    }}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-xs text-[var(--color-neutral-400)]">
                      {c.iso2}
                    </span>
                    <span className="font-mono text-xs text-[var(--color-neutral-500)]">
                      +{c.dial}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-neutral-400)]">{hint}</p>}
    </div>
  );
}
