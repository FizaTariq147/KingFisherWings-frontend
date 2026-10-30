import { useState } from 'react';
import {
  EnquirySheetDateInput,
  EnquirySheetDatePresetSelect,
  EnquirySheetFilterField,
  EnquirySheetFilterGrid,
  EnquirySheetSearchToolbar,
  EnquirySheetSelect,
  EnquirySheetTextInput,
} from '@/components/erp';
import { useParties } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import {
  DEFAULT_INVOICE_PAGE_SIZE,
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPES,
  INVOICE_TYPE_LABELS,
  type InvoiceStatus,
  type InvoiceType,
} from '../../constants/invoice.constants';
import type { InvoiceListParams } from '../../types/invoice.types';

export type InvoiceFilterDraft = {
  datePreset: DateRangePreset;
  fromDate: string;
  toDate: string;
  partyId: string;
  jobId: string;
  invoiceNo: string;
  status: InvoiceStatus | 'all';
  invoiceType: InvoiceType | 'all';
  search: string;
  rows: number;
};

export function defaultInvoiceFilterDraft(
  limit = DEFAULT_INVOICE_PAGE_SIZE,
): InvoiceFilterDraft {
  // No default date window — a this_month filter (plus UTC date bugs) was hiding
  // newly created invoices from the list.
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

/** Map filter draft → GET /invoices OpenAPI query params. */
export function invoiceFilterDraftToListParams(
  draft: InvoiceFilterDraft,
  page = 1,
): InvoiceListParams {
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

interface InvoiceFiltersProps {
  draft: InvoiceFilterDraft;
  onDraftChange: (next: InvoiceFilterDraft) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Enquiry Sheet / Quotation–style filters for finance invoices.
 * Options from parties API; params match GET /invoices.
 */
export function InvoiceFilters({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
}: InvoiceFiltersProps) {
  const patch = (partial: Partial<InvoiceFilterDraft>) =>
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
    party_type: 'CUSTOMER',
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
    ...INVOICE_STATUSES.map((s) => ({ value: s, label: INVOICE_STATUS_LABELS[s] })),
  ];
  const typeOptions = [
    { value: 'all', label: 'All' },
    ...INVOICE_TYPES.map((t) => ({ value: t, label: INVOICE_TYPE_LABELS[t] })),
  ];

  return (
    <div>
      <EnquirySheetFilterGrid>
        <EnquirySheetFilterField label="Date Range">
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <EnquirySheetSelect
                options={[{ value: 'invoice', label: 'Invoice' }]}
                value="invoice"
                onChange={() => undefined}
              />
            </div>
            <EnquirySheetDatePresetSelect
              value={draft.datePreset}
              options={DATE_RANGE_PRESETS.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              onChange={(v) => applyPreset(v as DateRangePreset)}
            />
          </div>
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="From Date">
          <EnquirySheetDateInput
            value={draft.fromDate}
            onChange={(e) => patch({ fromDate: e.target.value, datePreset: 'custom' })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="To Date">
          <EnquirySheetDateInput
            value={draft.toDate}
            onChange={(e) => patch({ toDate: e.target.value, datePreset: 'custom' })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Client">
          <EnquirySheetSelect
            options={partyOptions}
            value={draft.partyId}
            onChange={(e) => patch({ partyId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Invoice Type">
          <EnquirySheetSelect
            options={typeOptions}
            value={draft.invoiceType}
            onChange={(e) =>
              patch({ invoiceType: e.target.value as InvoiceType | 'all' })
            }
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Invoice Status">
          <EnquirySheetSelect
            options={statusOptions}
            value={draft.status}
            onChange={(e) =>
              patch({ status: e.target.value as InvoiceStatus | 'all' })
            }
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Invoice No">
          <EnquirySheetTextInput
            value={draft.invoiceNo}
            onChange={(e) => patch({ invoiceNo: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Job number">
          <EnquirySheetTextInput
            value={draft.jobId}
            onChange={(e) => patch({ jobId: e.target.value.trim() })}
            placeholder="Search by job number…"
          />
        </EnquirySheetFilterField>
      </EnquirySheetFilterGrid>

      <EnquirySheetSearchToolbar
        search={draft.search}
        onSearchChange={(search) => patch({ search })}
        rows={draft.rows}
        onRowsChange={(rows) => patch({ rows })}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        rowOptions={[5, 10, 20, 25, 50, 100]}
      />
    </div>
  );
}

export function useInvoiceFilterDraft(initialLimit = DEFAULT_INVOICE_PAGE_SIZE) {
  const [draft, setDraft] = useState<InvoiceFilterDraft>(() =>
    defaultInvoiceFilterDraft(initialLimit),
  );
  const [applied, setApplied] = useState<InvoiceFilterDraft>(() =>
    defaultInvoiceFilterDraft(initialLimit),
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
