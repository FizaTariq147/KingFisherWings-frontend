import { useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import { isUuid } from '@/lib/isUuid';
import {
  CRM_PAGE_SIZE,
  ENQUIRY_STATUSES,
  SERVICE_TYPES,
  crmLabel,
  type EnquiryStatus,
  type ServiceType,
} from '../../constants/crm.constants';
import { CrmSalespersonSelect } from '../CrmFormControls';
import type { EnquiryListParams } from '../../types/crm.types';

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

export type CrmEnquiryFilterDraft = {
  status: EnquiryStatus | '';
  serviceType: ServiceType | '';
  salespersonId: string;
  departmentId: string;
  search: string;
  rows: number;
};

export function defaultCrmEnquiryFilterDraft(
  limit = CRM_PAGE_SIZE,
): CrmEnquiryFilterDraft {
  return {
    status: '',
    serviceType: '',
    salespersonId: '',
    departmentId: '',
    search: '',
    rows: limit,
  };
}

/** Map draft → GET /crm/enquiries OpenAPI params (+ client service_type filter). */
export function crmEnquiryFilterDraftToListParams(
  draft: CrmEnquiryFilterDraft,
  page = 1,
): EnquiryListParams & { service_type?: ServiceType } {
  return {
    page,
    limit: draft.rows,
    status: draft.status || undefined,
    salesperson_id: draft.salespersonId || undefined,
    department_id:
      draft.departmentId && isUuid(draft.departmentId)
        ? draft.departmentId
        : undefined,
    search: draft.search.trim() || undefined,
    service_type: draft.serviceType || undefined,
  };
}

interface CrmEnquiryFiltersProps {
  draft: CrmEnquiryFilterDraft;
  onDraftChange: (next: CrmEnquiryFilterDraft) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/** Permanently shown Fresa / Enquiry Sheet filter panel for CRM enquiries. */
export function CrmEnquiryFilters({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
}: CrmEnquiryFiltersProps) {
  const patch = (partial: Partial<CrmEnquiryFilterDraft>) =>
    onDraftChange({ ...draft, ...partial });

  const { data: departments = [] } = useMasterOptions(
    'departments',
    MASTER_PATHS.departments,
    true,
  );

  const allOpt = { value: '', label: 'All' };
  const statusOptions = [
    allOpt,
    ...ENQUIRY_STATUSES.map((s) => ({ value: s, label: crmLabel(s) })),
  ];
  const serviceOptions = [
    allOpt,
    ...SERVICE_TYPES.map((t) => ({ value: t, label: crmLabel(t) })),
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

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-5 md:grid-cols-3">
        <FilterField label="Enquiry Status">
          <SelectInput
            options={statusOptions}
            value={draft.status}
            onChange={(e) =>
              patch({ status: e.target.value as EnquiryStatus | '' })
            }
          />
        </FilterField>

        <FilterField label="Service / Department type">
          <SelectInput
            options={serviceOptions}
            value={draft.serviceType}
            onChange={(e) =>
              patch({ serviceType: e.target.value as ServiceType | '' })
            }
          />
        </FilterField>

        <FilterField label="Department">
          <SelectInput
            options={departmentOptions}
            value={draft.departmentId}
            onChange={(e) => patch({ departmentId: e.target.value })}
          />
        </FilterField>

        <FilterField label="Sales Person">
          <div className="[&_label>span]:sr-only [&_label]:block">
            <CrmSalespersonSelect
              label="Salesperson"
              placeholder="All salespeople"
              value={draft.salespersonId}
              onChange={(v) => patch({ salespersonId: v })}
            />
          </div>
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
            onChange={(e) => patch({ rows: Number(e.target.value) || CRM_PAGE_SIZE })}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FF751F]"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="50">50</option>
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

export function useCrmEnquiryFilterDraft(initialLimit = CRM_PAGE_SIZE) {
  const [draft, setDraft] = useState<CrmEnquiryFilterDraft>(() =>
    defaultCrmEnquiryFilterDraft(initialLimit),
  );
  const [applied, setApplied] = useState<CrmEnquiryFilterDraft>(() =>
    defaultCrmEnquiryFilterDraft(initialLimit),
  );

  const submit = () => setApplied(draft);

  const applyPatch = (partial: Partial<CrmEnquiryFilterDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      setApplied(next);
      return next;
    });
  };

  return { draft, setDraft, applied, submit, applyPatch };
}
