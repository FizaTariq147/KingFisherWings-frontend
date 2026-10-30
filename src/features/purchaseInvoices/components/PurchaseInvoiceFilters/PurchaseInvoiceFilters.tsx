import { useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useParties } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import {
  DEFAULT_PURCHASE_INVOICE_PAGE_SIZE,
  PURCHASE_INVOICE_STATUSES,
  PURCHASE_INVOICE_STATUS_LABELS,
  PURCHASE_INVOICE_TYPES,
  PURCHASE_INVOICE_TYPE_LABELS,
  type PurchaseInvoiceStatus,
  type PurchaseInvoiceType,
} from '../../constants/purchaseInvoice.constants';
import type { PurchaseInvoiceListParams } from '../../types/purchaseInvoice.types';

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function SelectInput({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
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

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
      {...props}
    />
  );
}

function DateInput({
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

export type PurchaseInvoiceFilterDraft = {
  datePreset: DateRangePreset;
  fromDate: string;
  toDate: string;
  partyId: string;
  jobId: string;
  invoiceNo: string;
  status: PurchaseInvoiceStatus | 'all';
  invoiceType: PurchaseInvoiceType | 'all';
  search: string;
  rows: number;
};

export function defaultPurchaseInvoiceFilterDraft(
  limit = DEFAULT_PURCHASE_INVOICE_PAGE_SIZE,
): PurchaseInvoiceFilterDraft {
  return {
    datePreset: 'custom',
    fromDate: '',
    toDate: '',
    partyId: '',
    jobId: '',
    invoiceNo: '',
    status: 'all',
    invoiceType: 'all',
    search: '',
    rows: limit,
  };
}

export function purchaseInvoiceFilterDraftToListParams(
  draft: PurchaseInvoiceFilterDraft,
  page = 1,
): PurchaseInvoiceListParams {
  const search = draft.search.trim() || draft.invoiceNo.trim() || undefined;
  return {
    page,
    limit: draft.rows,
    search,
    status: draft.status === 'all' ? undefined : draft.status,
    invoice_type: draft.invoiceType === 'all' ? undefined : draft.invoiceType,
    party_id: draft.partyId || undefined,
    job_id: draft.jobId && isUuid(draft.jobId) ? draft.jobId : undefined,
    from_date: draft.fromDate || undefined,
    to_date: draft.toDate || undefined,
  };
}

interface PurchaseInvoiceFiltersProps {
  draft: PurchaseInvoiceFilterDraft;
  onDraftChange: (next: PurchaseInvoiceFilterDraft) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function PurchaseInvoiceFilters({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
}: PurchaseInvoiceFiltersProps) {
  const patch = (partial: Partial<PurchaseInvoiceFilterDraft>) =>
    onDraftChange({ ...draft, ...partial });

  const applyPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      patch({ datePreset: preset });
      return;
    }
    const range = resolveDateRangePreset(preset);
    patch({
      datePreset: preset,
      fromDate: range?.from_date ?? '',
      toDate: range?.to_date ?? '',
    });
  };

  const { data: partiesResult } = useParties({
    page: 1,
    limit: 100,
    order: 'asc',
  });

  const allOpt = { value: '', label: 'All' };
  const partyOptions = [
    allOpt,
    ...(partiesResult?.parties ?? [])
      .filter((p) => isUuid(p.id))
      .map((p) => ({
        value: p.id,
        label: [p.code, p.name].filter(Boolean).join(' — ') || p.id.slice(0, 8),
      })),
  ];
  const statusOptions = [
    { value: 'all', label: 'All' },
    ...PURCHASE_INVOICE_STATUSES.map((s) => ({
      value: s,
      label: PURCHASE_INVOICE_STATUS_LABELS[s],
    })),
  ];
  const typeOptions = [
    { value: 'all', label: 'All' },
    ...PURCHASE_INVOICE_TYPES.map((t) => ({
      value: t,
      label: PURCHASE_INVOICE_TYPE_LABELS[t],
    })),
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-5 md:grid-cols-3">
        <FilterField label="Date Range">
          <div className="relative flex-1">
            <select
              value={draft.datePreset}
              onChange={(e) => applyPreset(e.target.value as DateRangePreset)}
              className="w-full appearance-none rounded border border-gray-300 px-3 py-1.5 pr-8 text-sm text-gray-700"
            >
              {DATE_RANGE_PRESETS.map((preset) => (
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
        </FilterField>

        <FilterField label="From Date">
          <DateInput
            value={draft.fromDate}
            onChange={(e) => patch({ fromDate: e.target.value, datePreset: 'custom' })}
          />
        </FilterField>

        <FilterField label="To Date">
          <DateInput
            value={draft.toDate}
            onChange={(e) => patch({ toDate: e.target.value, datePreset: 'custom' })}
          />
        </FilterField>

        <FilterField label="Vendor">
          <SelectInput
            options={partyOptions}
            value={draft.partyId}
            onChange={(e) => patch({ partyId: e.target.value })}
          />
        </FilterField>

        <FilterField label="Invoice Type">
          <SelectInput
            options={typeOptions}
            value={draft.invoiceType}
            onChange={(e) =>
              patch({ invoiceType: e.target.value as PurchaseInvoiceType | 'all' })
            }
          />
        </FilterField>

        <FilterField label="Invoice Status">
          <SelectInput
            options={statusOptions}
            value={draft.status}
            onChange={(e) =>
              patch({ status: e.target.value as PurchaseInvoiceStatus | 'all' })
            }
          />
        </FilterField>

        <FilterField label="Invoice No">
          <TextInput
            value={draft.invoiceNo}
            onChange={(e) => patch({ invoiceNo: e.target.value })}
          />
        </FilterField>

        <FilterField label="Job number">
          <TextInput
            value={draft.jobId}
            onChange={(e) => patch({ jobId: e.target.value.trim() })}
            placeholder="Search by job number…"
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-t border-gray-200 bg-[#F5F7FA] px-5 py-3">
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
            value={draft.search}
            onChange={(e) => patch({ search: e.target.value })}
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
            value={String(draft.rows)}
            onChange={(e) => patch({ rows: Number(e.target.value) || 20 })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[var(--btn-primary-bg)] px-5 py-1.5 text-sm font-medium text-[var(--btn-primary-text)] transition-colors hover:bg-[var(--btn-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--btn-primary-ring)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-[var(--btn-disabled-opacity,0.45)]"
        >
          <span className="text-[#FF751F]">➜</span>
          Submit
        </button>
      </div>
    </div>
  );
}

export function usePurchaseInvoiceFilterDraft(
  initialLimit = DEFAULT_PURCHASE_INVOICE_PAGE_SIZE,
) {
  const [draft, setDraft] = useState<PurchaseInvoiceFilterDraft>(() =>
    defaultPurchaseInvoiceFilterDraft(initialLimit),
  );
  const [applied, setApplied] = useState<PurchaseInvoiceFilterDraft>(() =>
    defaultPurchaseInvoiceFilterDraft(initialLimit),
  );

  const submit = () => {
    let next = draft;
    if (!draft.fromDate && !draft.toDate && draft.datePreset !== 'custom') {
      const range = resolveDateRangePreset(draft.datePreset);
      if (range) {
        next = { ...draft, fromDate: range.from_date, toDate: range.to_date };
        setDraft(next);
      }
    }
    setApplied(next);
  };

  return { draft, setDraft, applied, submit };
}
