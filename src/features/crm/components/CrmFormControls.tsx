import { Link } from 'react-router-dom';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useParties } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import { cn } from '@/lib/utils';
import { useCrmCurrencyOptions } from '../hooks/useCrmCurrencyOptions';
import { useCrmSalespeople } from '../hooks/useCrmSalespeople';
import { Field, SelectInput } from './CrmUi';

export function CrmSalespersonSelect({
  label,
  value,
  onChange,
  error,
  required,
  allowEmpty = true,
  placeholder = 'Select salesperson…',
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  error?: string;
  required?: boolean;
  allowEmpty?: boolean;
  placeholder?: string;
}) {
  const { data: options = [], isLoading } = useCrmSalespeople();
  return (
    <Field label={label} required={required} error={error}>
      <SelectInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(error && 'border-red-400')}
        disabled={isLoading}
      >
        {allowEmpty && <option value="">{isLoading ? 'Loading…' : placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}

export function CrmCurrencySelect({
  label,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  error?: string;
  required?: boolean;
}) {
  const { data: options = [], isLoading } = useCrmCurrencyOptions();
  return (
    <Field label={label} required={required} error={error}>
      <SelectInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(error && 'border-red-400')}
        disabled={isLoading}
      >
        {!value && <option value="">{isLoading ? 'Loading…' : 'Select currency…'}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}

export function CrmCountryField({
  label = 'Country',
  value,
  onChange,
  error,
  required,
  allowEmpty = true,
}: {
  label?: string;
  value: string;
  onChange: (iso2: string) => void;
  error?: string;
  required?: boolean;
  allowEmpty?: boolean;
}) {
  return (
    <CountrySelect
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      allowEmpty={allowEmpty}
    />
  );
}

export function CrmPhoneField({
  label = 'Phone',
  value,
  onChange,
  countryIso,
  onCountryChange,
  error,
  required,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  countryIso?: string;
  onCountryChange?: (iso2: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <PhoneInput
      label={label}
      value={value}
      onChange={onChange}
      countryIso={countryIso}
      onCountryChange={onCountryChange}
      error={error}
      required={required}
    />
  );
}

/** Reuses Party list API — same pattern as QuotationForm customer select. */
export function CrmPartySelect({
  label = 'Party',
  value,
  onChange,
  error,
  required,
  allowEmpty = true,
  placeholder = 'Select party…',
}: {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  error?: string;
  required?: boolean;
  allowEmpty?: boolean;
  placeholder?: string;
}) {
  const { data, isLoading, isError } = useParties({
    page: 1,
    limit: 100,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const parties = (data?.parties ?? []).filter((p) => isUuid(p.id));
  const selected = parties.find((p) => p.id === value);

  return (
    <div className="space-y-1">
      <Field label={label} required={required} error={error}>
        <SelectInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && 'border-red-400')}
          disabled={isLoading}
        >
          {allowEmpty && (
            <option value="">{isLoading ? 'Loading…' : isError ? 'Failed to load parties' : placeholder}</option>
          )}
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.code ? ` (${p.code})` : ''}
            </option>
          ))}
        </SelectInput>
      </Field>
      {selected && (
        <p className="text-xs text-[var(--color-neutral-500)]">
          {selected.city ? `${selected.city} · ` : ''}
          {selected.country_code ?? ''}
          {selected.email ? ` · ${selected.email}` : ''}
          {' · '}
          <Link className="font-medium underline" to={`/parties/${selected.id}`}>
            View party
          </Link>
        </p>
      )}
      <p className="text-xs text-[var(--color-neutral-400)]">
        Need a new customer?{' '}
        <Link className="font-medium underline" to="/parties/new">
          Create party
        </Link>
      </p>
    </div>
  );
}
