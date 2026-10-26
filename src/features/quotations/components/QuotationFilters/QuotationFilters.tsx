import { useEffect, useState } from 'react';
import {
  EnquirySheetDateInput,
  EnquirySheetDatePresetSelect,
  EnquirySheetFilterField,
  EnquirySheetFilterGrid,
  EnquirySheetSearchToolbar,
  EnquirySheetSelect,
  EnquirySheetTextInput,
} from '@/components/erp';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { useParties } from '@/features/parties/hooks/useParties';
import { useUsers } from '@/features/users/hooks/useUsers';
import { isUuid } from '@/lib/isUuid';
import {
  DATE_RANGE_PRESETS,
  resolveDateRangePreset,
  type DateRangePreset,
} from '@/features/management/utils/managementFilters';
import {
  JOB_TYPE_LABELS,
  JOB_TYPES,
  QUOTATION_STATUS_FILTERS,
  STATUS_LABELS,
  type JobType,
  type QuotationStatus,
} from '../../constants/quotation.constants';
import type { QuotationListParams } from '../../types/quotation.types';

export type QuotationFilterDraft = {
  datePreset: DateRangePreset;
  fromDate: string;
  toDate: string;
  branchId: string;
  customerId: string;
  salespersonId: string;
  departmentId: string;
  jobType: JobType | 'all';
  originPortId: string;
  destPortId: string;
  quotationNo: string;
  createdBy: string;
  status: QuotationStatus | 'all';
  search: string;
  rows: number;
  order: 'asc' | 'desc';
};

export function defaultQuotationFilterDraft(
  limit = 20,
): QuotationFilterDraft {
  const range = resolveDateRangePreset('this_month');
  return {
    datePreset: 'this_month',
    fromDate: range?.from_date ?? '',
    toDate: range?.to_date ?? '',
    branchId: '',
    customerId: '',
    salespersonId: '',
    departmentId: '',
    jobType: 'all',
    originPortId: '',
    destPortId: '',
    quotationNo: '',
    createdBy: '',
    status: 'all',
    search: '',
    rows: limit,
    order: 'desc',
  };
}

/** Map enquiry-sheet-style draft → GET /quotations query params. */
export function quotationFilterDraftToListParams(
  draft: QuotationFilterDraft,
  page = 1,
): QuotationListParams {
  const search = draft.search.trim() || draft.quotationNo.trim() || undefined;
  return {
    page,
    limit: draft.rows,
    search,
    status: draft.status === 'all' ? undefined : draft.status,
    job_type: draft.jobType === 'all' ? undefined : draft.jobType,
    department_id: draft.departmentId || undefined,
    customer_id: draft.customerId || undefined,
    salesperson_id: draft.salespersonId || undefined,
    branch_id: draft.branchId || undefined,
    origin_port_id: draft.originPortId || undefined,
    dest_port_id: draft.destPortId || undefined,
    created_by: draft.createdBy || undefined,
    from_date: draft.fromDate || undefined,
    to_date: draft.toDate || undefined,
    order: draft.order,
  };
}

interface QuotationFiltersProps {
  draft: QuotationFilterDraft;
  onDraftChange: (next: QuotationFilterDraft) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Enquiry Sheet–style filter grid; values map to OpenAPI GET /quotations params.
 */
export function QuotationFilters({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
}: QuotationFiltersProps) {
  const patch = (partial: Partial<QuotationFilterDraft>) =>
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

  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: customersResult } = useParties({
    page: 1,
    limit: 100,
    party_type: 'CUSTOMER',
    order: 'asc',
  });
  const { data: usersResult } = useUsers({
    tenantId: '',
    page: 1,
    limit: 100,
    order: 'asc',
  });

  const allOpt = { value: '', label: 'All' };
  const branchOptions = [
    allOpt,
    ...branches
      .filter((b) => isUuid(String(b.id)))
      .map((b) => ({
        value: String(b.id),
        label: String(b.name ?? b.code ?? b.id),
      })),
  ];
  const clientOptions = [
    allOpt,
    ...(customersResult?.parties ?? [])
      .filter((p) => isUuid(p.id))
      .map((p) => ({
        value: p.id,
        label: [p.code, p.name].filter(Boolean).join(' — ') || p.id.slice(0, 8),
      })),
  ];
  const userOptions = [
    allOpt,
    ...(usersResult?.users ?? [])
      .filter((u) => isUuid(u.id))
      .map((u) => ({
        value: u.id,
        label:
          u.full_name ||
          [u.first_name, u.last_name].filter(Boolean).join(' ') ||
          u.email ||
          u.id.slice(0, 8),
      })),
  ];
  const departmentOptions = [
    allOpt,
    ...departments
      .filter((d) => isUuid(String(d.id)))
      .map((d) => ({
        value: String(d.id),
        label: String(d.name ?? d.code ?? d.id),
      })),
  ];
  const portOptions = [
    allOpt,
    ...ports
      .filter((p) => isUuid(String(p.id)))
      .map((p) => {
        const code = String(p.un_locode ?? p.code ?? '').trim();
        const name = String(p.name ?? '').trim();
        const label =
          code && name && code !== name ? `${code} — ${name}` : name || code || String(p.id);
        return { value: String(p.id), label };
      }),
  ];
  const jobTypeOptions = [
    { value: 'all', label: 'All' },
    ...JOB_TYPES.map((t) => ({ value: t, label: JOB_TYPE_LABELS[t] })),
  ];
  const statusOptions = [
    { value: 'all', label: 'All' },
    ...QUOTATION_STATUS_FILTERS.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
  ];

  return (
    <div>
      <EnquirySheetFilterGrid>
        <EnquirySheetFilterField label="Date Range">
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <EnquirySheetSelect
                options={[{ value: 'quotation', label: 'Quote' }]}
                value="quotation"
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

        <EnquirySheetFilterField label="Branch">
          <EnquirySheetSelect
            options={branchOptions}
            value={draft.branchId}
            onChange={(e) => patch({ branchId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Client">
          <EnquirySheetSelect
            options={clientOptions}
            value={draft.customerId}
            onChange={(e) => patch({ customerId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Sales Person">
          <EnquirySheetSelect
            options={userOptions}
            value={draft.salespersonId}
            onChange={(e) => patch({ salespersonId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Department">
          <EnquirySheetSelect
            options={departmentOptions}
            value={draft.departmentId}
            onChange={(e) => patch({ departmentId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Origin">
          <EnquirySheetSelect
            options={portOptions}
            value={draft.originPortId}
            onChange={(e) => patch({ originPortId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Destination">
          <EnquirySheetSelect
            options={portOptions}
            value={draft.destPortId}
            onChange={(e) => patch({ destPortId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Quotation No">
          <EnquirySheetTextInput
            value={draft.quotationNo}
            onChange={(e) => patch({ quotationNo: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Created User">
          <EnquirySheetSelect
            options={userOptions}
            value={draft.createdBy}
            onChange={(e) => patch({ createdBy: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Quotation Status">
          <EnquirySheetSelect
            options={statusOptions}
            value={draft.status}
            onChange={(e) =>
              patch({ status: e.target.value as QuotationStatus | 'all' })
            }
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Job type">
          <EnquirySheetSelect
            options={jobTypeOptions}
            value={draft.jobType}
            onChange={(e) =>
              patch({ jobType: e.target.value as JobType | 'all' })
            }
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
        extraLeft={
          <select
            value={draft.order}
            onChange={(e) => patch({ order: e.target.value as 'asc' | 'desc' })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
            aria-label="Sort order"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        }
      />
    </div>
  );
}

/** Initialize this-month dates once on mount (enquiry-sheet parity). */
export function useQuotationFilterDraft(initialLimit = 20) {
  const [draft, setDraft] = useState<QuotationFilterDraft>(() =>
    defaultQuotationFilterDraft(initialLimit),
  );
  const [applied, setApplied] = useState<QuotationFilterDraft>(() =>
    defaultQuotationFilterDraft(initialLimit),
  );

  useEffect(() => {
    const range = resolveDateRangePreset('this_month');
    if (!range) return;
    setDraft((prev) => ({
      ...prev,
      datePreset: 'this_month',
      fromDate: range.from_date,
      toDate: range.to_date,
    }));
    setApplied((prev) => ({
      ...prev,
      datePreset: 'this_month',
      fromDate: range.from_date,
      toDate: range.to_date,
    }));
  }, []);

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

  const applyPatch = (partial: Partial<QuotationFilterDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      setApplied(next);
      return next;
    });
  };

  return { draft, setDraft, applied, submit, applyPatch };
}
