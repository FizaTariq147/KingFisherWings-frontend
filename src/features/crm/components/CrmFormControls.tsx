import { CountrySelect } from '@/components/ui/CountrySelect';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { cn } from '@/lib/utils';
import { useCrmCurrencyOptions } from '../hooks/useCrmCurrencyOptions';
import { useCrmSalespeople } from '../hooks/useCrmSalespeople';
import { Field, SelectInput } from './CrmUi';

const selectClass =
  'h-9 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 text-sm';

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
