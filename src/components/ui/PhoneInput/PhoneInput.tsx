import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  countryFlag,
  digitsOnly,
  formatInternationalPhone,
  getCountry,
  getCountryOptions,
  parsePhone,
} from '@/lib/countries';

export interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  /** Preferred dialing country (ISO2). Synced when provided. */
  countryIso?: string;
  onCountryChange?: (iso2: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
}

export function PhoneInput({
  label = 'Phone',
  value,
  onChange,
  countryIso,
  onCountryChange,
  error,
  hint,
  required,
  disabled,
  id,
  name,
  className,
  placeholder,
}: PhoneInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => getCountryOptions(), []);

  const initial = parsePhone(value || '', countryIso || 'AE');
  const [iso2, setIso2] = useState(countryIso || initial.iso2 || 'AE');
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const country = getCountry(iso2) ?? getCountry('AE')!;

  // Prefer external country when parent country selector changes.
  useEffect(() => {
    if (!countryIso) return;
    const next = getCountry(countryIso);
    if (!next || next.iso2 === iso2) return;
    setIso2(next.iso2);
    const nextValue = formatInternationalPhone(next.iso2, national);
    if (nextValue !== value) onChange(nextValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional sync on countryIso only
  }, [countryIso]);

  // Re-parse when parent resets the stored value (e.g. form reset).
  useEffect(() => {
    const parsed = parsePhone(value || '', countryIso || iso2);
    const expected = formatInternationalPhone(iso2, national);
    if ((value || '') === expected) return;
    if (parsed.iso2) setIso2(parsed.iso2);
    setNational(parsed.national);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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

  const commitCountry = (nextIso: string) => {
    setIso2(nextIso);
    onCountryChange?.(nextIso);
    const nextValue = formatInternationalPhone(nextIso, national);
    onChange(nextValue);
    setOpen(false);
    setQuery('');
  };

  const commitNational = (raw: string) => {
    let digits = digitsOnly(raw);
    if (digits.startsWith('0')) digits = digits.slice(1);
    const meta = getCountry(iso2) ?? country;
    if (digits.length > meta.phoneMax) digits = digits.slice(0, meta.phoneMax);
    setNational(digits);
    onChange(formatInternationalPhone(iso2, digits));
  };

  const lengthHint =
    country.phoneMin === country.phoneMax
      ? `${country.phoneMin} digits`
      : `${country.phoneMin}–${country.phoneMax} digits`;

  const example = country.example
    ? `e.g. ${country.example}`
    : undefined;

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

      <div
        className={cn(
          'flex h-9 w-full overflow-hidden rounded-md border bg-white transition-colors',
          'border-[var(--color-neutral-200)]',
          'focus-within:border-[var(--color-primary-500)] focus-within:ring-1 focus-within:ring-[var(--color-primary-500)]',
          error &&
            'border-[var(--color-danger-500)] focus-within:ring-[var(--color-danger-500)]',
          disabled && 'bg-[var(--color-neutral-50)] opacity-60',
        )}
      >
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          title={`${country.name} (+${country.dial})`}
          onClick={() => !disabled && setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 border-r border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-2.5 text-sm hover:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none">{countryFlag(country.iso2)}</span>
          <span className="font-mono text-xs text-[var(--color-neutral-600)]">
            +{country.dial}
          </span>
          <span className="text-[10px] text-[var(--color-neutral-400)]">▾</span>
        </button>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          value={national}
          placeholder={placeholder ?? example ?? lengthHint}
          onChange={(e) => commitNational(e.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--color-neutral-800)] placeholder:text-[var(--color-neutral-400)] focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {open && (
        <div className="relative z-30">
          <div
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-1 overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-white shadow-lg"
          >
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
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-xs text-[var(--color-neutral-400)]">No matches</li>
              )}
              {filtered.map((c) => (
                <li key={c.iso2}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.iso2 === iso2}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--color-neutral-50)]',
                      c.iso2 === iso2 && 'bg-[var(--color-primary-50)]',
                    )}
                    onClick={() => commitCountry(c.iso2)}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
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
      {!error && (
        <p className="text-xs text-[var(--color-neutral-400)]">
          {hint ??
            `E.164 · +${country.dial} · national ${lengthHint}${
              country.example ? ` · e.g. ${country.example}` : ''
            }`}
        </p>
      )}
    </div>
  );
}
