import type { ReactNode } from 'react';
import { FieldError } from '@/components/ui/FieldError/FieldError';

export function NvoccFormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm text-gray-700">
      <span>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-0.5 text-xs text-gray-500">{hint}</p> : null}
      <FieldError message={error} />
    </label>
  );
}

export function NvoccFormActions({
  onClear,
  submitLabel,
  pending,
}: {
  onClear?: () => void;
  submitLabel: string;
  pending?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#0A2942] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
