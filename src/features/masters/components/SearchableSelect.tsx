import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  name: string;
  label: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  /** When true, a typed UUID that is not in the list is still accepted. */
  allowManualUuid?: boolean;
  /**
   * When true, any non-empty typed value is accepted (pick from list OR write your own).
   * Prefer matching an option by label/value when possible.
   */
  allowManualValue?: boolean;
  emptyMessage?: string;
  hint?: string;
}

/**
 * Combobox: pick from the full option list or type to filter.
 * Selecting an option stores its `value` (usually a UUID).
 */
export function SearchableSelect({
  name,
  label,
  value,
  options,
  onChange,
  placeholder = 'Type to search or select…',
  error,
  required,
  allowManualUuid = true,
  allowManualValue = false,
  emptyMessage = 'No matching options',
  hint,
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const [query, setQuery] = useState(selected?.label ?? value ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const match = options.find((o) => o.value === value);
    if (match) {
      setQuery(match.label);
    } else if (!value) {
      setQuery('');
    } else {
      setQuery(value);
    }
  }, [value, options]);

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
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

  const commitQuery = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      onChange('');
      setQuery('');
      return;
    }
    const byLabel = options.find(
      (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (byLabel) {
      onChange(byLabel.value);
      setQuery(byLabel.label);
      return;
    }
    const byValue = options.find(
      (o) => o.value.toLowerCase() === trimmed.toLowerCase(),
    );
    if (byValue) {
      onChange(byValue.value);
      setQuery(byValue.label);
      return;
    }
    if (allowManualUuid && /^[0-9a-f-]{36}$/i.test(trimmed)) {
      onChange(trimmed);
      setQuery(trimmed);
      return;
    }
    if (allowManualValue) {
      onChange(trimmed);
      setQuery(trimmed);
      return;
    }
    // Keep typed text visible but clear invalid selection so validation can catch it.
    onChange('');
    setQuery(trimmed);
  };

  const errorClass = error
    ? 'border-[var(--color-danger-500)] focus:border-[var(--color-danger-500)]'
    : 'border-[var(--color-neutral-200)] focus:border-[var(--color-primary-500)]';

  const helperHint =
    hint ??
    (allowManualValue
      ? 'Pick from the dropdown or type your own value.'
      : allowManualUuid
        ? 'Choose from the list or type to search. You can also paste a department ID if needed.'
        : 'Choose from the list or type to search.');

  return (
    <div className="space-y-1" ref={rootRef}>
      <label className="text-xs font-medium text-[var(--color-neutral-500)]">
        {label}
        {required ? ' *' : ''}
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          data-field={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className={`h-9 w-full rounded-md border bg-white px-3 pr-8 text-sm text-[var(--color-neutral-800)] focus:outline-none ${errorClass}`}
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange('');
          }}
          onBlur={() => {
            // Defer so option click can run first.
            window.setTimeout(() => commitQuery(query), 120);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              return;
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              const trimmed = query.trim().toLowerCase();
              const exact = filtered.find(
                (o) =>
                  o.label.toLowerCase() === trimmed ||
                  o.value.toLowerCase() === trimmed,
              );
              if (exact) {
                onChange(exact.value);
                setQuery(exact.label);
                setOpen(false);
                return;
              }
              if (allowManualValue) {
                commitQuery(query);
                setOpen(false);
                return;
              }
              const first = filtered[0];
              if (first) {
                onChange(first.value);
                setQuery(first.label);
                setOpen(false);
              } else {
                commitQuery(query);
                setOpen(false);
              }
            }
          }}
        />
        {(query || value) && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-600)]"
            aria-label="Clear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              setQuery('');
              setOpen(true);
            }}
          >
            ×
          </button>
        )}
        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--color-neutral-200)] bg-white py-1 shadow-md"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-[var(--color-neutral-400)]">
                {allowManualValue && query.trim()
                  ? `Press Enter to use “${query.trim()}”`
                  : emptyMessage}
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value} role="option" aria-selected={opt.value === value}>
                  <button
                    type="button"
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-[var(--color-neutral-50)] ${
                      opt.value === value
                        ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                        : 'text-[var(--color-neutral-800)]'
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(opt.value);
                      setQuery(opt.label);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-[var(--color-danger-500)]">{error}</p>}
      {!error && (
        <p className="text-[11px] text-[var(--color-neutral-400)]">{helperHint}</p>
      )}
    </div>
  );
}
