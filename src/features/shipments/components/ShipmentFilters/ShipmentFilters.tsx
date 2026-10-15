import { useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useParties } from '@/features/parties/hooks/useParties';
import { isUuid } from '@/lib/isUuid';
import {
  JOB_TYPES,
  JOB_TYPE_LABELS,
  type JobType,
} from '@/features/jobs/constants/job.constants';
import {
  SHIPMENT_STATUSES,
  type ShipmentListParams,
} from '../../types/shipment.types';

const DEFAULT_SHIPMENT_PAGE_SIZE = 20;

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

export type ShipmentFilterDraft = {
  status: string;
  jobType: JobType | '';
  customerId: string;
  jobId: string;
  quotationId: string;
  shipmentNo: string;
  voyageNumber: string;
  vesselName: string;
  search: string;
  rows: number;
};

export function defaultShipmentFilterDraft(
  limit = DEFAULT_SHIPMENT_PAGE_SIZE,
): ShipmentFilterDraft {
  return {
    status: '',
    jobType: '',
    customerId: '',
    jobId: '',
    quotationId: '',
    shipmentNo: '',
    voyageNumber: '',
    vesselName: '',
    search: '',
    rows: limit,
  };
}

/** Map filter draft → GET /shipments OpenAPI query params. */
export function shipmentFilterDraftToListParams(
  draft: ShipmentFilterDraft,
  page = 1,
): ShipmentListParams {
  const search = draft.search.trim() || draft.shipmentNo.trim() || undefined;
  return {
    page,
    limit: draft.rows,
    search,
    status: draft.status || undefined,
    job_type: draft.jobType || undefined,
    customer_id:
      draft.customerId && isUuid(draft.customerId) ? draft.customerId : undefined,
    job_id: draft.jobId && isUuid(draft.jobId) ? draft.jobId : undefined,
    quotation_id:
      draft.quotationId && isUuid(draft.quotationId) ? draft.quotationId : undefined,
    voyage_number: draft.voyageNumber.trim() || undefined,
    vessel_name: draft.vesselName.trim() || undefined,
  };
}

interface ShipmentFiltersProps {
  draft: ShipmentFilterDraft;
  onDraftChange: (next: ShipmentFilterDraft) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Enquiry Sheet–style filters — permanently shown (Fresa MIS layout).
 * Values map to GET /shipments OpenAPI params only.
 */
export function ShipmentFilters({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
}: ShipmentFiltersProps) {
  const patch = (partial: Partial<ShipmentFilterDraft>) =>
    onDraftChange({ ...draft, ...partial });

  const { data: partiesResult } = useParties({
    page: 1,
    limit: 100,
    party_type: 'CUSTOMER',
    order: 'asc',
  });

  const allOpt = { value: '', label: 'All' };
  const customerOptions = [
    allOpt,
    ...(partiesResult?.parties ?? [])
      .filter((p) => isUuid(p.id))
      .map((p) => ({
        value: p.id,
        label: [p.code, p.name].filter(Boolean).join(' — ') || p.id.slice(0, 8),
      })),
  ];
  const statusOptions = [
    allOpt,
    ...SHIPMENT_STATUSES.map((s) => ({ value: s, label: s.replaceAll('_', ' ') })),
  ];
  const jobTypeOptions = [
    allOpt,
    ...JOB_TYPES.map((t) => ({ value: t, label: JOB_TYPE_LABELS[t] })),
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 p-5 md:grid-cols-3">
        <FilterField label="Customer">
          <SelectInput
            options={customerOptions}
            value={draft.customerId}
            onChange={(e) => patch({ customerId: e.target.value })}
          />
        </FilterField>

        <FilterField label="Job type">
          <SelectInput
            options={jobTypeOptions}
            value={draft.jobType}
            onChange={(e) => patch({ jobType: e.target.value as JobType | '' })}
          />
        </FilterField>

        <FilterField label="Shipment Status">
          <SelectInput
            options={statusOptions}
            value={draft.status}
            onChange={(e) => patch({ status: e.target.value })}
          />
        </FilterField>

        <FilterField label="Shipment No">
          <TextInput
            value={draft.shipmentNo}
            onChange={(e) => patch({ shipmentNo: e.target.value })}
          />
        </FilterField>

        <FilterField label="Job Id">
          <TextInput
            value={draft.jobId}
            onChange={(e) => patch({ jobId: e.target.value.trim() })}
            placeholder="Optional job UUID"
          />
        </FilterField>

        <FilterField label="Quotation Id">
          <TextInput
            value={draft.quotationId}
            onChange={(e) => patch({ quotationId: e.target.value.trim() })}
            placeholder="Optional quotation UUID"
          />
        </FilterField>

        <FilterField label="Voyage number">
          <TextInput
            value={draft.voyageNumber}
            onChange={(e) => patch({ voyageNumber: e.target.value })}
          />
        </FilterField>

        <FilterField label="Vessel name">
          <TextInput
            value={draft.vesselName}
            onChange={(e) => patch({ vesselName: e.target.value })}
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

export function useShipmentFilterDraft(initialLimit = DEFAULT_SHIPMENT_PAGE_SIZE) {
  const [draft, setDraft] = useState<ShipmentFilterDraft>(() =>
    defaultShipmentFilterDraft(initialLimit),
  );
  const [applied, setApplied] = useState<ShipmentFilterDraft>(() =>
    defaultShipmentFilterDraft(initialLimit),
  );

  const submit = () => {
    setApplied(draft);
  };

  return { draft, setDraft, applied, submit };
}
