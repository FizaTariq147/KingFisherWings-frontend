import { ChevronDown, Calendar } from 'lucide-react';
import type { PropsWithChildren, ReactNode } from 'react';

export function FilterField({ label, children }: PropsWithChildren<{ label: ReactNode }>) {
  return (
    <div className="flex items-start gap-3">
      <label className="w-28 shrink-0 text-sm text-gray-700 pt-2 text-right">{label}</label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function SelectInput({ options = [], defaultValue }: { options?: string[]; defaultValue?: string }) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="w-full appearance-none border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm text-gray-700
                   focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F] bg-white"
      >
        {options.map((opt, i) => (
          <option key={i}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function TextInput({ placeholder }: { placeholder?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700
                 focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
    />
  );
}

export function DateInput({ value }: { value?: string }) {
  return (
    <div className="relative">
      <input
        type="text"
        defaultValue={value}
        className="w-full border border-gray-300 rounded px-3 py-1.5 pr-9 text-sm text-gray-700
                   focus:outline-none focus:ring-1 focus:ring-[#FF751F] focus:border-[#FF751F]"
      />
      <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  );
}