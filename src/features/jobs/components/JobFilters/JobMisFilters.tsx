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
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  JOB_TYPES,
  type JobStatus,
  type JobType,
} from '../../constants/job.constants';
import { useJobStatusOptions } from '../../hooks/useJobs';
import type { JobListParams } from '../../types/job.types';

export type JobDateField = NonNullable<JobListParams['date_field']>;

export type JobMisFilterDraft = {
  datePreset: DateRangePreset;
  dateField: JobDateField | '';
  fromDate: string;
  toDate: string;
  branchId: string;
  shipperId: string;
  consigneeId: string;
  salespersonId: string;
  departmentId: string;
  jobType: '' | JobType;
  originPortId: string;
  destPortId: string;
  jobNo: string;
  createdBy: string;
  status: '' | JobStatus;
  category: string;
  search: string;
  mastersOnly: boolean;
  rows: number;
  order: 'asc' | 'desc';
};

export function defaultJobMisFilterDraft(limit = 20): JobMisFilterDraft {
  return {
    datePreset: 'custom',
    dateField: '',
    fromDate: '',
    toDate: '',
    branchId: '',
    shipperId: '',
    consigneeId: '',
    salespersonId: '',
    departmentId: '',
    jobType: '',
    originPortId: '',
    destPortId: '',
    jobNo: '',
    createdBy: '',
    status: '',
    category: '',
    search: '',
    mastersOnly: false,
    rows: limit,
    order: 'desc',
  };
}

/** Seed MIS filters from dashboard deep-links (`?status=` / `?category=`). */
export function jobMisDraftFromSearch(
  search: string,
  limit = 20,
): JobMisFilterDraft {
  const base = defaultJobMisFilterDraft(limit);
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  const statusRaw = params.get('status')?.trim().toUpperCase() ?? '';
  const categoryRaw = params.get('category')?.trim().toLowerCase() ?? '';
  const category =
    categoryRaw === 'completed' || categoryRaw === 'closed'
      ? 'completed,closed'
      : categoryRaw;
  const status = (JOB_STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as JobStatus)
    : '';
  if (!status && !category) return base;
  return {
    ...base,
    status,
    category: status ? '' : category,
  };
}

/** Map MIS filter draft → GET /jobs OpenAPI query params. */
export function jobMisFilterDraftToListParams(
  draft: JobMisFilterDraft,
  page = 1,
  opts?: { segmentJobTypes?: JobType[] },
): JobListParams {
  const search = draft.search.trim() || draft.jobNo.trim() || undefined;
  return {
    page,
    limit: draft.rows,
    search,
    status: draft.status || undefined,
    category: draft.category.trim() || undefined,
    job_type: draft.jobType || undefined,
    /** When no single job_type chosen, scope to segment types (Air Export, etc.). */
    job_types:
      !draft.jobType && opts?.segmentJobTypes?.length
        ? opts.segmentJobTypes
        : undefined,
    shipper_id: draft.shipperId || undefined,
    consignee_id: draft.consigneeId || undefined,
    salesperson_id: draft.salespersonId || undefined,
    branch_id: draft.branchId || undefined,
    department_id: draft.departmentId || undefined,
    created_by: draft.createdBy || undefined,
    origin_port_id: draft.originPortId || undefined,
    dest_port_id: draft.destPortId || undefined,
    date_field: draft.dateField || undefined,
    from_date: draft.fromDate || undefined,
    to_date: draft.toDate || undefined,
    masters_only: draft.mastersOnly || undefined,
    order: draft.order,
  };
}

interface JobMisFiltersProps {
  draft: JobMisFilterDraft;
  onDraftChange: (next: JobMisFilterDraft) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  /** Restrict job-type dropdown (e.g. NVOCC hub); default = OpenAPI job_type enum. */
  jobTypeOptions?: JobType[];
  jobTypeAllLabel?: string;
}

/**
 * Quotation / Enquiry Sheet–style filter grid for All Jobs-MIS.
 * Option lists load from masters / parties / users / status-options APIs.
 */
export function JobMisFilters({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
  jobTypeOptions = [...JOB_TYPES],
  jobTypeAllLabel = 'All',
}: JobMisFiltersProps) {
  const patch = (partial: Partial<JobMisFilterDraft>) =>
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

  const statusOptionsQuery = useJobStatusOptions(undefined, true);
  const { data: branches = [] } = useMasterOptions('branches', MASTER_PATHS.branches, true);
  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );
  const { data: ports = [] } = useMasterOptions('ports', MASTER_PATHS.ports, true);
  const { data: partiesResult } = useParties({
    page: 1,
    limit: 100,
    order: 'asc',
  });
  const { data: usersResult } = useUsers({
    tenantId: '',
    page: 1,
    limit: 100,
    order: 'asc',
  });

  const allOpt = { value: '', label: 'All' };

  const catalogStatuses = statusOptionsQuery.data?.length
    ? statusOptionsQuery.data.map((s) => ({
        value: s.value,
        label: s.label || JOB_STATUS_LABELS[s.value as JobStatus] || s.value,
      }))
    : [];
  const catalogValues = new Set(catalogStatuses.map((s) => s.value));
  const statusOptions = [
    allOpt,
    ...catalogStatuses,
    ...JOB_STATUSES.filter((s) => !catalogValues.has(s)).map((s) => ({
      value: s,
      label: JOB_STATUS_LABELS[s],
    })),
  ];

  const branchOptions = [
    allOpt,
    ...branches
      .filter((b) => isUuid(String(b.id)))
      .map((b) => ({
        value: String(b.id),
        label: String(b.name ?? b.code ?? b.id),
      })),
  ];

  const partyOptions = [
    allOpt,
    ...(partiesResult?.parties ?? [])
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

  const jobTypeSelectOptions = [
    { value: '', label: jobTypeAllLabel },
    ...jobTypeOptions.map((t) => ({ value: t, label: JOB_TYPE_LABELS[t] ?? t })),
  ];

  const dateFieldOptions = [
    { value: 'etd', label: 'ETD' },
    { value: 'eta', label: 'ETA' },
    { value: 'atd', label: 'ATD' },
    { value: 'ata', label: 'ATA' },
  ];

  return (
    <div>
      <EnquirySheetFilterGrid>
        <EnquirySheetFilterField label="Date Range">
          <div className="flex gap-2">
            <div className="w-24 shrink-0">
              <EnquirySheetSelect
                options={dateFieldOptions}
                value={draft.dateField || 'etd'}
                onChange={(e) =>
                  patch({ dateField: e.target.value as JobDateField })
                }
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
            options={partyOptions}
            value={draft.shipperId}
            onChange={(e) => patch({ shipperId: e.target.value })}
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

        <EnquirySheetFilterField label="Job No">
          <EnquirySheetTextInput
            value={draft.jobNo}
            onChange={(e) => patch({ jobNo: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Created User">
          <EnquirySheetSelect
            options={userOptions}
            value={draft.createdBy}
            onChange={(e) => patch({ createdBy: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Job Status">
          <EnquirySheetSelect
            options={statusOptions}
            value={draft.status}
            onChange={(e) =>
              patch({
                status: e.target.value as '' | JobStatus,
                category: e.target.value ? '' : draft.category,
              })
            }
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Category">
          <EnquirySheetSelect
            options={[
              { value: '', label: 'All' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'delayed', label: 'Delayed' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'completed,closed', label: 'Completed / closed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'hold', label: 'On hold' },
            ]}
            value={
              draft.category === 'completed' || draft.category === 'closed'
                ? 'completed,closed'
                : draft.category
            }
            onChange={(e) =>
              patch({
                category: e.target.value,
                status: e.target.value ? '' : draft.status,
              })
            }
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Job type">
          <EnquirySheetSelect
            options={jobTypeSelectOptions}
            value={draft.jobType}
            onChange={(e) => patch({ jobType: e.target.value as '' | JobType })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Consignee">
          <EnquirySheetSelect
            options={partyOptions}
            value={draft.consigneeId}
            onChange={(e) => patch({ consigneeId: e.target.value })}
          />
        </EnquirySheetFilterField>

        <EnquirySheetFilterField label="Masters only">
          <label className="flex h-[34px] items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.mastersOnly}
              onChange={(e) => patch({ mastersOnly: e.target.checked })}
            />
            Master jobs only
          </label>
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

export function useJobMisFilterDraft(
  initialLimit = 20,
  initialDraft?: JobMisFilterDraft | (() => JobMisFilterDraft),
) {
  const [draft, setDraft] = useState<JobMisFilterDraft>(() => {
    if (typeof initialDraft === 'function') return initialDraft();
    return initialDraft ?? defaultJobMisFilterDraft(initialLimit);
  });
  const [applied, setApplied] = useState<JobMisFilterDraft>(() => {
    if (typeof initialDraft === 'function') return initialDraft();
    return initialDraft ?? defaultJobMisFilterDraft(initialLimit);
  });

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

  return { draft, setDraft, applied, setApplied, submit };
}
