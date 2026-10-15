import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isUuid } from '@/lib/isUuid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useJobDetailTab, useJobShipmentsList, useJobShowAll } from '../hooks/useJobs';
import { useJobTabResourceMutations } from '../hooks/useJobTabResources';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { JobBarcodePanel } from './JobBarcodePanel';
import { JobChargesPanel } from './JobChargesPanel';
import { JobContainersPanel } from './JobContainersPanel';
import { JobCustomsRefsPanel } from './JobCustomsRefsPanel/JobCustomsRefsPanel';
import { JobDepartmentPanel } from './JobDepartmentPanel/JobDepartmentPanel';
import { JobDimensionsPanel } from './JobDimensionsPanel/JobDimensionsPanel';
import { JobExchangeRatesPanel } from './JobExchangeRatesPanel/JobExchangeRatesPanel';
import { JobOpsPanel } from './JobOpsPanel';
import { JobOverviewPanel } from './JobOverviewPanel';
import { JobPartyPanel } from './JobPartyPanel/JobPartyPanel';
import { JobRoutingLegsPanel } from './JobRoutingLegsPanel/JobRoutingLegsPanel';
import type { JobDetailTabKey } from '../api/job.api';
import {
  isJobShowAllTab,
  jobDetailTabLabel,
  normalizeJobDetailTabKey,
} from '../utils/jobDetailTabs';

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
  // Backend stub metadata — not for end-user display
  'path_hints',
  'pathhints',
  'hints',
  'path_hint',
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
    if (Array.isArray(value)) {
      if (value.length) nested.push({ key, label: humanizeFieldLabel(key), value });
      continue;
    }
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

/** True when detail/{tab} has something FormFieldsFromPayload would actually render. */
function detailPayloadHasRenderableFields(data: unknown, depth = 0): boolean {
  if (data == null) return false;
  if (typeof data !== 'object') return true;
  if (Array.isArray(data)) {
    if (!data.length) return false;
    return data.some((item) => detailPayloadHasRenderableFields(item, depth + 1));
  }
  const rec = data as Record<string, unknown>;
  const keys = Object.keys(rec);
  const skip = new Set<string>();
  for (const key of keys) {
    if (skip.has(key) || HIDDEN_DETAIL_KEYS.has(key.toLowerCase())) continue;
    const lower = key.toLowerCase();
    if (lower.endsWith('_id') || lower.endsWith('_uuid')) {
      if (siblingNameLabel(key, rec)) return true;
      continue;
    }
    const value = rec[key];
    if (Array.isArray(value)) {
      if (value.length && detailPayloadHasRenderableFields(value, depth + 1)) return true;
      continue;
    }
    if (value != null && typeof value === 'object') {
      if (detailPayloadHasRenderableFields(value, depth + 1)) return true;
      continue;
    }
    if (typeof value === 'string' && isUuid(value.trim())) continue;
    if (lower.endsWith('_name') || lower.endsWith('_label') || lower.endsWith('_code')) {
      const base = key.replace(/(_name|_label|_code)$/i, '');
      if (keys.includes(`${base}_id`) || keys.includes(`${base}_uuid`)) continue;
    }
    if (value != null && value !== '') return true;
  }
  return false;
}

/** Full GET /jobs/:id/detail/:tab payload as form fields (never raw JSON). */
function CompleteDetailTabPayload({
  tab,
  data,
  isLoading,
  isError,
  title,
}: {
  tab: string;
  data?: Record<string, unknown> | null;
  isLoading?: boolean;
  isError?: boolean;
  title?: string;
}) {
  if (isLoading) {
    return (
      <p className="text-[13px] text-[#64748b]">
        Loading detail/{tab}…
      </p>
    );
  }
  if (isError) {
    return (
      <p className="text-[13px] text-red-700">
        Could not load detail/{tab}.
      </p>
    );
  }
  const visibleKeys =
    data && typeof data === 'object' && !Array.isArray(data)
      ? Object.keys(data).filter((k) => !HIDDEN_DETAIL_KEYS.has(k.toLowerCase()))
      : [];
  if (data == null || (typeof data === 'object' && !Array.isArray(data) && !visibleKeys.length)) {
    return (
      <p className="text-[13px] text-[#64748b]">
        No payload returned for detail/{tab}.
      </p>
    );
  }

  return (
    <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
      <div className="border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
        {title ?? jobDetailTabLabel(tab)}
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

function shipmentRowsFromUnknown(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw
      .map((row) =>
        row && typeof row === 'object' && !Array.isArray(row)
          ? (row as Record<string, unknown>)
          : null,
      )
      .filter((r): r is Record<string, unknown> => Boolean(r));
  }
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    for (const key of ['shipments', 'items', 'data', 'results', 'linked_shipments']) {
      if (Array.isArray(rec[key])) return shipmentRowsFromUnknown(rec[key]);
    }
  }
  return [];
}

/** Shipments tab — GET /jobs/:id/shipments (+ attach) with detail/shipments fallback. */
function JobShipmentsTabPanel({
  job,
  tabData,
  onChanged,
}: {
  job: Job;
  tabData?: Record<string, unknown> | null;
  onChanged?: () => void;
}) {
  const listQuery = useJobShipmentsList(job.id);
  const resources = useJobTabResourceMutations(job.id);
  const [attachId, setAttachId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fromApi = shipmentRowsFromUnknown(listQuery.data);
  const fromTab = shipmentRowsFromUnknown(tabData);
  const rows =
    fromApi.length > 0
      ? fromApi
      : fromTab.length > 0
        ? fromTab
        : job.shipment_id && isUuid(job.shipment_id)
          ? [
              {
                id: job.shipment_id,
                shipment_number: job.shipment_number,
              },
            ]
          : [];

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void listQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3 text-[13px]">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      <p className="text-[12px] text-[#64748b]">
        GET /jobs/:id/shipments · POST /jobs/:id/shipments/attach
      </p>
      {listQuery.isLoading ? (
        <p className="text-[#64748b]">Loading shipments…</p>
      ) : rows.length === 0 ? (
        <p className="text-[#64748b]">
          {typeof tabData?.message === 'string' && tabData.message.trim()
            ? tabData.message.trim()
            : 'No linked shipments.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((rec, i) => {
            const sid = String(rec.id ?? '').trim();
            const number =
              String(
                rec.shipment_number ?? rec.shipmentNumber ?? rec.reference ?? '',
              ).trim() || (sid ? sid.slice(0, 8) : `Shipment ${i + 1}`);
            return (
              <li
                key={sid || i}
                className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white px-3 py-2"
              >
                {sid && isUuid(sid) ? (
                  <Link
                    className="font-medium text-[var(--color-primary-700)] hover:underline"
                    to={`/operations/shipments/${sid}`}
                  >
                    {number}
                  </Link>
                ) : (
                  <span className="font-medium">{number}</span>
                )}
                {rec.status != null ? (
                  <span className="ml-2 text-[12px] text-[#64748b]">
                    {String(rec.status)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <Input
          label="Attach shipment ID"
          value={attachId}
          onChange={(e) => setAttachId(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          variant="create"
          disabled={
            resources.attachExistingShipments.isPending || !isUuid(attachId.trim())
          }
          onClick={() =>
            void run(
              async () => {
                const body = { shipment_ids: [attachId.trim()] };
                try {
                  await resources.attachExistingShipments.mutateAsync(body);
                } catch {
                  // OpenAPI also allows POST /jobs/:id/shipments with shipment_ids.
                  await resources.createLinkShipments.mutateAsync(body);
                }
              },
              'Shipment attached.',
            )
          }
        >
          Attach existing
        </Button>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-white">
      <div className="border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
        {title}
      </div>
      <div className="max-h-[28rem] overflow-auto px-3 py-2">{children}</div>
    </div>
  );
}

function JobShowAllPanel({
  jobId,
  siblingTabKeys,
}: {
  jobId: string;
  siblingTabKeys: string[];
}) {
  const query = useJobShowAll(jobId, siblingTabKeys, true);

  if (query.isLoading) {
    return (
      <p className="text-[13px] text-[#64748b]">Loading Show All from detail tabs…</p>
    );
  }
  if (query.isError) {
    return (
      <p className="text-[13px] text-red-700">Could not load Show All detail tabs.</p>
    );
  }

  const { sections = [], arrays = [] } = query.data ?? {};
  if (!sections.length && !arrays.length) {
    return (
      <p className="text-[13px] text-[#64748b]">
        No Show All data returned from job detail APIs.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard key={section.key} title={section.title}>
          <FormFieldsFromPayload data={section.data} />
        </SectionCard>
      ))}
      {arrays.map((block) => (
        <SectionCard key={block.key} title={block.title}>
          <FormFieldsFromPayload data={block.rows} />
        </SectionCard>
      ))}
    </div>
  );
}

/**
 * Interactive workspace for known DETAIL_TABS keys.
 * Every tab also loads GET /jobs/:id/detail/:tab (CompleteDetailTabPayload / Show All).
 */
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

  if (key === 'info' || key === 'information') {
    return (
      <div className="space-y-4">
        <JobOverviewPanel job={job} />
        <JobBarcodePanel job={job} />
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
          {key === 'planned_container' ? 'Planned containers' : 'Actual containers'} ·{' '}
          GET /jobs/:id/containers
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
    return <JobOpsPanel job={job} />;
  }
  if (key === 'shipments') {
    return <JobShipmentsTabPanel job={job} tabData={tabData} onChanged={onChanged} />;
  }
  if (key === 'department') {
    return <JobDepartmentPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'ex_rate') {
    return <JobExchangeRatesPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'routing') {
    return <JobRoutingLegsPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'customs' || key === 'shipping_bill_boe') {
    return <JobCustomsRefsPanel job={job} onChanged={onChanged} tabKey={key} />;
  }
  return null;
}

function SingleJobDetailTabPanel({
  apiKey,
  job,
  onChanged,
}: {
  apiKey: string;
  job: Job;
  onChanged?: () => void;
}) {
  const tabQuery = useJobDetailTab(job.id, apiKey);
  const hasInteractive = [
    'info',
    'information',
    'organization',
    'organisation',
    'dimensions',
    'planned_container',
    'actual_container',
    'costing',
    'history',
    'booking_form',
    'shipments',
    'department',
    'ex_rate',
    'routing',
    'customs',
    'shipping_bill_boe',
  ].includes(apiKey);

  // Shipments tab uses GET /jobs/:id/shipments — never mirror empty detail/shipments.
  // Other interactive tabs: only show detail/{tab} when it has real fields (not "No fields").
  const showApiEnvelope =
    apiKey === 'shipments'
      ? false
      : hasInteractive
        ? tabQuery.isError ||
          (!tabQuery.isLoading && detailPayloadHasRenderableFields(tabQuery.data))
        : true;

  return (
    <div className="space-y-4">
      <InteractiveTabBody
        tabKey={apiKey}
        job={job}
        onChanged={onChanged}
        tabData={tabQuery.data}
      />
      {showApiEnvelope ? (
        <CompleteDetailTabPayload
          tab={apiKey}
          data={tabQuery.data}
          isLoading={!hasInteractive && tabQuery.isLoading}
          isError={tabQuery.isError}
          title={hasInteractive ? `API · ${jobDetailTabLabel(apiKey)}` : jobDetailTabLabel(apiKey)}
        />
      ) : null}
    </div>
  );
}

/**
 * Job detail tab body for GET /jobs/:id/detail/:tab —
 * interactive workspace (when known) + API payload as form fields.
 * Show All aggregates sibling keys from GET /jobs/:id/detail via detail/:tab.
 */
export function JobDetailApiTabPanel({
  tabKey,
  job,
  onChanged,
  siblingTabKeys = [],
}: {
  tabKey: string;
  job: Job;
  onChanged?: () => void;
  /** Other tab keys from GET /jobs/:id/detail — used by Show All aggregation. */
  siblingTabKeys?: string[];
}) {
  const apiKey = normalizeJobDetailTabKey(tabKey);

  if (isJobShowAllTab(apiKey)) {
    return <JobShowAllPanel jobId={job.id} siblingTabKeys={siblingTabKeys} />;
  }

  return <SingleJobDetailTabPanel apiKey={apiKey} job={job} onChanged={onChanged} />;
}
