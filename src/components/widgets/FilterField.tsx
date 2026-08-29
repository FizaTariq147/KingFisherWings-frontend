import { ChevronDown, Calendar } from 'lucide-react';
import type { ChangeEvent, PropsWithChildren, ReactNode } from 'react';
import type { CustomerFilterOption } from '@/features/customers/types/customerFilter.types';

export type SelectInputOption = string | CustomerFilterOption;

function normalizeSelectOptions(options: SelectInputOption[] = []): CustomerFilterOption[] {
  return options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
}

export function FilterField({ label, children }: PropsWithChildren<{ label: ReactNode }>) {
  return (
    <label className="flex items-start gap-3">
      <span className="w-28 shrink-0 text-sm text-gray-700 pt-2 text-right">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}

export function SelectInput({
  options = [],
  defaultValue,
  value,
  onChange,
  className,
}: {
  options?: SelectInputOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) {
  const normalized = normalizeSelectOptions(options);
  const controlled = value !== undefined;
  return (
    <div className="relative">
      <select
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : defaultValue}
        onChange={onChange}
        className={
          className ??
          'w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white'
        }
      >
        {normalized.map((opt) => (
          <option key={`${opt.value}-${opt.label}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function TextInput({
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  className,
  maxLength,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      maxLength={maxLength}
      className={
        className ??
        'w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]'
      }
    />
  );
}

export function DateInput({
  value,
  onChange,
  onBlur,
  type = 'date',
}: {
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'date' | 'text';
}) {
  if (type === 'date') {
    return (
      <input
        type="date"
        value={value ?? ''}
        onChange={onChange}
        onBlur={onBlur}
        className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
      />
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value ?? ''}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-1.5 pr-9 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
      />
      <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
