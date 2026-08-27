import { useMemo } from 'react';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useWmsCurrencyOptions } from '../hooks/useWmsCurrencyOptions';

interface WmsCurrencyFieldProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
  error?: string | null;
}

function normalizeCurrencyCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
}

export function WmsCurrencyField({ label, value, onChange, required, error }: WmsCurrencyFieldProps) {
  const { data: currencyOptions = [], isLoading } = useWmsCurrencyOptions();
  const normalized = normalizeCurrencyCode(value);

  const options = useMemo(() => {
    const opts = [...currencyOptions];
    if (normalized && !opts.some((o) => o.value === normalized)) {
      opts.unshift({ value: normalized, label: normalized });
    }
    return opts;
  }, [currencyOptions, normalized]);

  return (
    <SearchableSelect
      name="currency_code"
      label={label}
      required={required}
      value={normalized}
      options={options}
      onChange={(next) => onChange(normalizeCurrencyCode(next))}
      placeholder={isLoading ? 'Loading currencies…' : 'Select or type currency code…'}
      emptyMessage="No matches — type a 3-letter code and press Enter"
      allowManualUuid={false}
      allowManualValue
      error={error ?? undefined}
      hint={error ? undefined : 'Pick from the dropdown or type your own 3-letter ISO currency code'}
    />
  );
}
