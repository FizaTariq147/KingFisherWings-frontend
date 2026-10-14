import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { useJobDetailTab } from '../hooks/useJobs';
import type { Job } from '../types/job.types';
import { JobBarcodePanel } from './JobBarcodePanel';
import { JobChargesPanel } from './JobChargesPanel';
import { JobContainersPanel } from './JobContainersPanel';
import { JobDimensionsPanel } from './JobDimensionsPanel/JobDimensionsPanel';
import { JobOpsPanel } from './JobOpsPanel';
import { JobOverviewPanel } from './JobOverviewPanel';
import { JobPartyPanel } from './JobPartyPanel/JobPartyPanel';
import type { JobDetailTabKey } from '../api/job.api';
import { jobDetailTabLabel, normalizeJobDetailTabKey } from '../utils/jobDetailTabs';

export { jobDetailTabLabel };

function humanizeFieldLabel(key: string): string {
  const norm = key
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-.\s]+/g, '_')
    .replace(/(_id|_uuid|_name|_label|_code)$/i, '');
  if (norm === 'organization' || norm === 'organisation') return 'Party';
  if (norm === 'information' || norm === 'info') return 'Info';
  return norm
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function formatFormScalar(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (isUuid(value.trim())) return '—';
    return value;
  }
  return '—';
}

function FormFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-[#e8edf2] py-2 sm:grid-cols-[minmax(8rem,14rem)_1fr] sm:gap-4">
      <span className="text-[12px] font-medium text-[#64748b]">{label}</span>
      <span className="whitespace-pre-wrap break-words text-[13px] font-medium text-[#0f172a]">
        {value}
      </span>
    </div>
  );
}

const HIDDEN_DETAIL_KEYS = new Set([
  'raw',
  'id',
  'job_id',
  'tenant_id',
  'company_id',
  'created_by',
  'updated_by',
  'deleted_at',
  'actions',
  'tabs',
  'header',
  'links',
]);

function siblingNameLabel(key: string, data: Record<string, unknown>): string {
  const base = key.replace(/(_id|_uuid)$/i, '');
  const name = data[`${base}_name`] ?? data[`${base}_label`];
  if (typeof name === 'string' && name.trim() && !isUuid(name.trim())) {
    const code = data[`${base}_code`];
    if (typeof code === 'string' && code.trim() && !isUuid(code.trim())) {
      return `${code.trim()} — ${name.trim()}`;
    }
    return name.trim();
  }
  return '';
}

/**
 * Recursively render API tab payload as form fields.
 * Prefers *_name / *_label over UUID *_id fields — never dumps raw IDs.
 */
function FormFieldsFromPayload({
  data,
  depth = 0,
}: {
  data: unknown;
  depth?: number;
}) {
  if (data == null) {
    return <p className="text-[13px] text-[#64748b]">—</p>;
  }

  if (typeof data !== 'object') {
    return <FormFieldRow label="Value" value={formatFormScalar(data)} />;
  }

  if (Array.isArray(data)) {
    if (!data.length) {
      return <p className="text-[13px] text-[#64748b]">None</p>;
    }
    const allScalar = data.every(
      (item) => item == null || ['string', 'number', 'boolean'].includes(typeof item),
    );
    if (allScalar) {
      return (
        <FormFieldRow
          label="Items"
          value={data.map((item) => formatFormScalar(item)).join(', ')}
        />
      );
    }
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              Item {index + 1}
            </p>
            <FormFieldsFromPayload data={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  const rec = data as Record<string, unknown>;
  const keys = Object.keys(rec);
  const skip = new Set<string>();
  const rows: { key: string; label: string; value: string }[] = [];
  const nested: { key: string; label: string; value: unknown }[] = [];

  for (const key of keys) {
    if (skip.has(key) || HIDDEN_DETAIL_KEYS.has(key.toLowerCase())) continue;
    const lower = key.toLowerCase();

    if (lower.endsWith('_id') || lower.endsWith('_uuid')) {
      const named = siblingNameLabel(key, rec);
      if (named) {
        const base = key.replace(/(_id|_uuid)$/i, '');
        skip.add(`${base}_name`);
        skip.add(`${base}_label`);
        skip.add(`${base}_code`);
        rows.push({ key, label: humanizeFieldLabel(base), value: named });
      }
      continue;
    }

    const value = rec[key];
    if (value != null && typeof value === 'object') {
      nested.push({ key, label: humanizeFieldLabel(key), value });
      continue;
    }

    if (typeof value === 'string' && isUuid(value.trim())) continue;
    if (lower.endsWith('_name') || lower.endsWith('_label') || lower.endsWith('_code')) {
      // Prefer showing once via the matching *_id branch above when present.
      const idKey = `${key.replace(/(_name|_label|_code)$/i, '')}_id`;
      if (keys.includes(idKey) || keys.includes(`${key.replace(/(_name|_label|_code)$/i, '')}_uuid`)) {
        continue;
      }
    }

    rows.push({ key, label: humanizeFieldLabel(key), value: formatFormScalar(value) });
  }

  if (!rows.length && !nested.length) {
    return <p className="text-[13px] text-[#64748b]">No fields</p>;
  }

  return (
    <div className={depth > 0 ? 'space-y-1' : 'space-y-0'}>
      {rows.map((row) => (
        <FormFieldRow key={row.key} label={row.label} value={row.value} />
      ))}
      {nested.map((block) => (
        <div key={block.key} className="border-b border-[#e8edf2] py-2 last:border-0">
          <p className="mb-1 text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
            {block.label}
          </p>
          <div className="pl-0 sm:pl-2">
            <FormFieldsFromPayload data={block.value} depth={depth + 1} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Full GET /jobs/:id/detail/:tab payload as a form field layout (not JSON). */
function CompleteDetailTabPayload({
  tab,
  data,
  isLoading,
  isError,
}: {
  tab: string;
  data?: Record<string, unknown> | null;
  isLoading?: boolean;
  isError?: boolean;
}) {
  if (isLoading) {
    return (
      <p className="text-[13px] text-[#64748b]">
        Loading GET /jobs/…/detail/{tab}…
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-[13px] text-red-700">
        Could not load GET /jobs/…/detail/{tab}.
      </p>
    );
  }
  if (data == null || (typeof data === 'object' && !Object.keys(data).length)) {
    return (
      <p className="text-[13px] text-[#64748b]">
        No payload returned for detail/{tab}.
      </p>
    );
  }

  return (
    <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
      <div className="border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
        Complete detail — {jobDetailTabLabel(tab)}
      </div>
      <div className="max-h-[28rem] overflow-auto px-3 py-2">
        <FormFieldsFromPayload data={data} />
      </div>
    </div>
  );
}

function JobHistoryPanel({
  jobId,
  tabData,
}: {
  jobId: string;
  tabData?: Record<string, unknown> | null;
}) {
  const rows = Array.isArray(tabData?.items)
    ? (tabData!.items as unknown[])
    : Array.isArray(tabData?.history)
      ? (tabData!.history as unknown[])
      : Array.isArray(tabData?.entries)
        ? (tabData!.entries as unknown[])
        : null;

  if (rows?.length) {
    return (
      <ul className="space-y-2 text-[13px]">
        {rows.map((row, i) => {
          const rec =
            row && typeof row === 'object' && !Array.isArray(row)
              ? (row as Record<string, unknown>)
              : null;
          const label =
            (rec &&
              String(
                rec.summary ?? rec.message ?? rec.action ?? rec.event ?? rec.status ?? '',
              ).trim()) ||
            (typeof row === 'string' ? row : 'History entry');
          const when = rec
            ? String(rec.created_at ?? rec.timestamp ?? rec.at ?? '').trim()
            : '';
          return (
            <li
              key={`${jobId}-hist-${i}`}
              className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2"
            >
              <p className="font-medium text-[#0f172a]">{label}</p>
              {when ? <p className="mt-0.5 text-[12px] text-[#64748b]">{when}</p> : null}
            </li>
          );
        })}
      </ul>
    );
  }
  return null;
}

function JobShipmentsTabPanel({
  job,
  tabData,
}: {
  job: Job;
  tabData?: Record<string, unknown> | null;
}) {
  const list = Array.isArray(tabData?.shipments)
    ? (tabData!.shipments as unknown[])
    : Array.isArray(tabData?.items)
      ? (tabData!.items as unknown[])
      : null;

  if (list?.length) {
    return (
      <ul className="space-y-2 text-[13px]">
        {list.map((row, i) => {
          const rec =
            row && typeof row === 'object' && !Array.isArray(row)
              ? (row as Record<string, unknown>)
              : null;
          const sid = rec ? String(rec.id ?? '').trim() : '';
          const number =
            (rec &&
              String(
                rec.shipment_number ?? rec.shipmentNumber ?? rec.reference ?? '',
              ).trim()) ||
            (sid ? sid.slice(0, 8) : `Shipment ${i + 1}`);
          return (
            <li key={sid || i}>
              {sid && isUuid(sid) ? (
                <Link
                  className="font-medium text-[var(--color-primary-700)] hover:underline"
                  to={`/operations/shipments/${sid}`}
                >
                  {number}
                </Link>
              ) : (
                <span>{number}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (job.shipment_id && isUuid(job.shipment_id)) {
    return (
      <p className="text-[13px]">
        Linked shipment:{' '}
        <Link
          className="font-medium text-[var(--color-primary-700)] hover:underline"
          to={`/operations/shipments/${job.shipment_id}`}
        >
          {job.shipment_number || job.shipment_id.slice(0, 8)}
        </Link>
      </p>
    );
  }

  return <p className="text-[13px] text-[#64748b]">No linked shipments.</p>;
}

function ThinTabHint({ tabData }: { tabData?: Record<string, unknown> | null }) {
  const hints = tabData?.path_hints ?? tabData?.hints ?? tabData?.message;
  if (hints == null) return null;
  const text =
    typeof hints === 'string'
      ? hints
      : Array.isArray(hints)
        ? hints.map(String).join(' · ')
        : null;
  if (!text?.trim()) return null;
  return (
    <p className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-900">
      {text}
    </p>
  );
}

function InteractiveTabBody({
  tabKey,
  job,
  onChanged,
  tabData,
}: {
  tabKey: string;
  job: Job;
  onChanged?: () => void;
  tabData?: Record<string, unknown> | null;
}) {
  const key = tabKey as JobDetailTabKey | string;

  if (key === 'show_all' || key === 'info' || key === 'information') {
    return (
      <div className="space-y-4">
        <JobOverviewPanel job={job} />
        {key === 'info' || key === 'information' ? <JobBarcodePanel job={job} /> : null}
      </div>
    );
  }
  if (key === 'organization' || key === 'organisation') {
    return <JobPartyPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'dimensions') {
    return <JobDimensionsPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'planned_container' || key === 'actual_container') {
    return (
      <div className="space-y-3">
        <p className="text-[12px] text-[#64748b]">
          {key === 'planned_container' ? 'Planned containers' : 'Actual containers'} · job
          container APIs
        </p>
        <JobContainersPanel jobId={job.id} />
      </div>
    );
  }
  if (key === 'costing') {
    return <JobChargesPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'history') {
    return <JobHistoryPanel jobId={job.id} tabData={tabData} />;
  }
  if (key === 'booking_form') {
    return (
      <div className="space-y-3">
        <ThinTabHint tabData={tabData} />
        <JobOpsPanel job={job} />
      </div>
    );
  }
  if (key === 'shipments') {
    return <JobShipmentsTabPanel job={job} tabData={tabData} />;
  }
  if (
    key === 'department' ||
    key === 'ex_rate' ||
    key === 'routing' ||
    key === 'customs' ||
    key === 'shipping_bill_boe'
  ) {
    // Thin/stub tabs — API payload rendered below in Complete detail.
    return <ThinTabHint tabData={tabData} />;
  }
  return null;
}

/**
 * Job detail tab body for GET /jobs/:id/detail/:tab —
 * interactive workspace + complete API payload.
 */
export function JobDetailApiTabPanel({
  tabKey,
  job,
  onChanged,
}: {
  tabKey: string;
  job: Job;
  onChanged?: () => void;
}) {
  const apiKey = normalizeJobDetailTabKey(tabKey);
  const tabQuery = useJobDetailTab(job.id, apiKey);

  return (
    <div className="space-y-4">
      <InteractiveTabBody
        tabKey={apiKey}
        job={job}
        onChanged={onChanged}
        tabData={tabQuery.data}
      />
      <CompleteDetailTabPayload
        tab={apiKey}
        data={tabQuery.data}
        isLoading={tabQuery.isLoading}
        isError={tabQuery.isError}
      />
    </div>
  );
}
