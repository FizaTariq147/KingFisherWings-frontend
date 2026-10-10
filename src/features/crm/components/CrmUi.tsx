import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ReportsPageBackLink } from '@/features/reports/components/ReportsPageBackLink';
import { Button } from '@/components/ui/Button';
import { appType, erpTable } from '@/lib/erpTypography';
import { erpForm } from '@/lib/erpForm';

export const inputClass = erpForm.input;

export function CrmPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <ReportsPageBackLink fallbackTo="/sales" fallbackLabel="Back to Sales" />
        <h1 className={`mt-1 ${appType.pageTitle}`}>{title}</h1>
        <div className={appType.pageSubtitle}>{description}</div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className={`mb-1 block ${erpForm.labelInline}`}>
        {label}
        {required ? <span className="text-[var(--color-danger-600)]"> *</span> : null}
      </span>
      {children}
      {error ? <p className={erpForm.fieldError}>{error}</p> : null}
    </label>
  );
}
export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
export const SelectInput = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={`${inputClass} ${props.className ?? ''}`} />;
export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${erpForm.textarea} ${props.className ?? ''}`} />
);
export function CrmAlert({ children, success = false }: { children: ReactNode; success?: boolean }) {
  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`rounded-sm border px-3 py-2 text-[13px] ${
        success
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {children}
    </div>
  );
}
export function CrmEmpty({ loading, error, onRetry, children = 'No records found.' }: { loading?: boolean; error?: string; onRetry?: () => void; children?: ReactNode }) {
  if (loading) return <div className="py-10 text-center text-sm text-[var(--color-neutral-400)]">Loading…</div>;
  if (error) return <div className="space-y-2 py-8 text-sm text-red-600"><p>{error}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Retry</Button>}</div>;
  return <div className="py-10 text-center text-sm text-[var(--color-neutral-400)]">{children}</div>;
}
export function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (page: number) => void }) {
  return <div className="flex items-center justify-between border-t border-[var(--color-neutral-100)] px-3 py-3 text-sm"><span className="text-[var(--color-neutral-500)]">{total} record(s)</span><div className="flex gap-2"><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><span className="px-2 py-1.5">Page {page} of {totalPages}</span><Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button></div></div>;
}
export const thClass = erpTable.th;
export const tdClass = erpTable.td;
