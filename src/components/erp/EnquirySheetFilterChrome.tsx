import type { ReactNode } from 'react';
import { ChevronDown, Maximize2, Search } from 'lucide-react';

/** Shared label + control stack matching Enquiry Sheet list filters. */
export function EnquirySheetFilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}

export function EnquirySheetSelect({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  'aria-label'?: string;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
    >
      {options.map((opt) => (
        <option key={`${opt.value}-${opt.label}`} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function EnquirySheetTextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      type="text"
      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
      {...props}
    />
  );
}

export function EnquirySheetDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
    />
  );
}

/** 3-column filter grid — same padding/gaps as Enquiry Sheet. */
export function EnquirySheetFilterGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-5 md:grid-cols-3">
      {children}
    </div>
  );
}

interface EnquirySheetSearchToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  rows: number;
  onRowsChange: (rows: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  /** Extra controls between Rows and Submit (e.g. sort order). */
  extraLeft?: ReactNode;
  onFullscreen?: () => void;
  rowOptions?: number[];
}

/**
 * Grey search strip under the filter grid — Search / Rows / Options / Submit
 * matching `/customer-service/enquiry-sheet`.
 */
export function EnquirySheetSearchToolbar({
  search,
  onSearchChange,
  rows,
  onRowsChange,
  onSubmit,
  isSubmitting,
  extraLeft,
  onFullscreen,
  rowOptions = [5, 10, 25, 50],
}: EnquirySheetSearchToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-t border-gray-200 bg-[#F5F7FA] px-5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-600"
          aria-hidden
        >
          <Search size={13} />
          <ChevronDown size={12} />
        </button>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          className="w-56 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-[#FF751F] focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded border border-gray-300 bg-gray-100 px-4 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
        >
          Search
        </button>
        <span className="ml-2 text-sm text-gray-500">Rows</span>
        <select
          value={String(rows)}
          onChange={(e) => onRowsChange(Number(e.target.value) || rowOptions[0] || 10)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
        >
          {rowOptions.map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600"
        >
          Options
          <ChevronDown size={12} />
        </button>
        {extraLeft}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-primary-bg)] px-5 py-1.5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]"
        >
          <span className="text-[#FF751F]">➜</span>
          Submit
        </button>
        {onFullscreen ? (
          <button
            type="button"
            onClick={onFullscreen}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Fullscreen table"
          >
            <Maximize2 size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Date-range preset select with chevron — Enquiry Sheet style. */
export function EnquirySheetDatePresetSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded border border-gray-300 px-3 py-1.5 pr-8 text-sm text-gray-700"
      >
        {options.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}
