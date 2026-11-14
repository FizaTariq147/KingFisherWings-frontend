import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { OpsContinuumPanel } from '@/features/ops-activity';
import { isUuid } from '@/lib/isUuid';
import { erpForm } from '@/lib/erpForm';
import { erpTable } from '@/lib/erpTypography';
import { Button } from '@/components/ui/Button';
import { ShipmentSearchSelect } from '@/features/shared/entity-search';
import { ShowAllEditModal } from '@/features/shared/show-all/ShowAllEditModal';
import { mergeShowAllSavedOverlay } from '@/features/shared/show-all/extractPatchShowAllDefaults';
import { useShipment, useShipments } from '@/features/shipments/hooks/useShipments';
import {
  useJob,
  useJobDetailTab,
  useJobShipmentsList,
  useJobShowAll,
  usePatchJobShowAll,
} from '../hooks/useJobs';
import { useJobTabResourceMutations } from '../hooks/useJobTabResources';
import type { Job, PatchShowAllDto } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { JobBarcodePanel } from './JobBarcodePanel';
import { JobChargesPanel } from './JobChargesPanel';
import { JobAirMawbPanel } from './JobAirMawbPanel';
import { JobContainersPanel } from './JobContainersPanel';
import { JobLedgerPanel } from './JobLedgerPanel';
import { JobCustomsRefsPanel } from './JobCustomsRefsPanel/JobCustomsRefsPanel';
import { JobDepartmentPanel } from './JobDepartmentPanel/JobDepartmentPanel';
import { JobDimensionsPanel } from './JobDimensionsPanel/JobDimensionsPanel';
import { JobExchangeRatesPanel } from './JobExchangeRatesPanel/JobExchangeRatesPanel';
import { JobAcknowledgementPanel } from './JobAcknowledgementPanel';
import { JobOpsPanel } from './JobOpsPanel';
import { JobOverviewPanel } from './JobOverviewPanel';
import { JobPartyPanel } from './JobPartyPanel/JobPartyPanel';
import { JobRoutingLegsPanel } from './JobRoutingLegsPanel/JobRoutingLegsPanel';
import type { JobDetailTabKey } from '../api/job.api';
import {
  isAirwayBillJobType,
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
  if (norm === 'location_terminal' || norm === 'locationterminal') {
    return 'Location / Terminal';
  }
  return norm
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function tryParseJsonString(value: string): unknown | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function formatFormScalar(value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (isUuid(value.trim())) return '—';
    const parsed = tryParseJsonString(value);
    if (parsed != null && typeof parsed === 'object') {
      if (Array.isArray(parsed)) {
        return parsed.length
          ? `${parsed.length} item${parsed.length === 1 ? '' : 's'}`
          : '—';
      }
      return `${Object.keys(parsed as object).length} fields`;
    }
    return value;
  }
  return '—';
}

/** Fresa-style Label: value cell — used inside a 3-column Show All grid. */
function FormFieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-[13px] leading-5">
      <span className="shrink-0 font-semibold text-[var(--fresa-header-text,#0A2942)]">
        {label}:
      </span>
      <span className="min-w-0 whitespace-pre-wrap break-words text-[#0f172a]">{value}</span>
    </div>
  );
}

/** Normalized (lowercase, no _/-) keys stripped from detail form payloads. */
const HIDDEN_DETAIL_KEYS = new Set([
  'raw',
  'id',
  'jobid',
  'tenantid',
  'companyid',
  'createdby',
  'updatedby',
  'deletedat',
  'actions',
  'tabs',
  'header',
  'links',
  // Continuum / hints — right rail only, never on detail form
  'pathhints',
  'pathhint',
  'hints',
  'opscontinuum',
  'continuum',
  'canopscontinuum',
  // Catalog dumps — not useful on Show All overview
  'partytype',
  'partytypes',
  'partytypeid',
  'orgtype',
  'orgtypes',
  'organizationtype',
  'organizationtypes',
  'organisationtype',
  'organisationtypes',
]);

function normalizeDetailKey(key: string): string {
  return key.trim().toLowerCase().replace(/[-_\s]/g, '');
}

function isHiddenDetailKey(key: string): boolean {
  const n = normalizeDetailKey(key);
  if (HIDDEN_DETAIL_KEYS.has(n)) return true;
  // Hide party-type / org-type catalog blocks from Show All payloads.
  if (n.includes('partytype') || n.includes('orgtype') || n.includes('organizationtype')) {
    return true;
  }
  return false;
}

function isPartyTypesSection(key: string, title?: string): boolean {
  const blob = `${key} ${title ?? ''}`.toLowerCase().replace(/[-_\s]+/g, ' ');
  return (
    /\bparty types?\b/.test(blob) ||
    /\borg(?:anisation|anization)? types?\b/.test(blob) ||
    normalizeDetailKey(key).includes('partytype') ||
    normalizeDetailKey(key).includes('orgtype')
  );
}

function nestedEntityLabel(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const row = value as Record<string, unknown>;
  const codeRaw = row.code ?? row.un_locode ?? row.unLocode;
  const nameRaw =
    row.name ?? row.display_name ?? row.displayName ?? row.full_name ?? row.fullName;
  const code =
    typeof codeRaw === 'string' && codeRaw.trim() && !isUuid(codeRaw.trim())
      ? codeRaw.trim()
      : '';
  const name =
    typeof nameRaw === 'string' && nameRaw.trim() && !isUuid(nameRaw.trim())
      ? nameRaw.trim()
      : '';
  if (code && name) return `${code} — ${name}`;
  return name || code;
}

/**
 * Best-effort label for catalog / type rows from the API (org types, party types, etc.).
 * Never invents values — only surfaces non-UUID strings the backend already sent.
 */
function catalogRowLabel(row: Record<string, unknown>): string {
  const preferred = nestedEntityLabel(row);
  if (preferred) return preferred;
  for (const key of Object.keys(row)) {
    const lower = key.toLowerCase();
    if (lower === 'id' || lower.endsWith('_id') || lower.endsWith('_uuid')) continue;
    const v = row[key];
    if (typeof v === 'string' && v.trim() && !isUuid(v.trim())) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

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
  return nestedEntityLabel(data[base]);
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
    const labeled = data
      .map((item, index) => {
        const rec = item && typeof item === 'object' && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : null;
        const label = rec ? catalogRowLabel(rec) : '';
        return { index, item, label };
      });
    const allHaveLabels = labeled.every((row) => Boolean(row.label));
    if (allHaveLabels) {
      return (
        <ul className="space-y-1.5">
          {labeled.map((row) => (
            <li
              key={row.index}
              className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[13px] font-medium text-[#0f172a]"
            >
              {row.label}
            </li>
          ))}
        </ul>
      );
    }
    const anyLabel = labeled.some((row) => Boolean(row.label));
    if (!anyLabel) {
      return (
        <p className="text-[13px] text-[#64748b]">
          {data.length} row{data.length === 1 ? '' : 's'} returned, but only ids without names
          (backend).
        </p>
      );
    }
    return (
      <div className="space-y-3">
        {labeled.map((row) => (
          <div
            key={row.index}
            className="rounded-sm border border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2"
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
              {row.label || `Item ${row.index + 1}`}
            </p>
            <FormFieldsFromPayload data={row.item} depth={depth + 1} />
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
    if (skip.has(key) || isHiddenDetailKey(key)) continue;
    const lower = key.toLowerCase();

    if (lower.endsWith('_id') || lower.endsWith('_uuid')) {
      const base = key.replace(/(_id|_uuid)$/i, '');
      const named = siblingNameLabel(key, rec);
      if (named) {
        skip.add(`${base}_name`);
        skip.add(`${base}_label`);
        skip.add(`${base}_code`);
        rows.push({ key, label: humanizeFieldLabel(base), value: named });
      } else {
        // Ops codes (e.g. line_code) with only an id sibling — still show the code.
        const codeRaw = rec[`${base}_code`];
        if (
          typeof codeRaw === 'string' &&
          codeRaw.trim() &&
          !isUuid(codeRaw.trim())
        ) {
          skip.add(`${base}_code`);
          rows.push({
            key: `${base}_code`,
            label: humanizeFieldLabel(`${base}_code`),
            value: codeRaw.trim(),
          });
        }
      }
      continue;
    }

    let value = rec[key];
    if (typeof value === 'string') {
      const parsed = tryParseJsonString(value);
      if (parsed != null && typeof parsed === 'object') {
        value = parsed;
      }
    }
    if (Array.isArray(value)) {
      if (value.length) nested.push({ key, label: humanizeFieldLabel(key), value });
      continue;
    }
    if (value != null && typeof value === 'object') {
      const entityLabel = nestedEntityLabel(value);
      if (entityLabel) {
        if (keys.includes(`${key}_id`) || keys.includes(`${key}_uuid`)) {
          skip.add(`${key}_id`);
          skip.add(`${key}_uuid`);
          skip.add(`${key}_name`);
          skip.add(`${key}_label`);
          skip.add(`${key}_code`);
        }
        rows.push({ key, label: humanizeFieldLabel(key), value: entityLabel });
        continue;
      }
      nested.push({ key, label: humanizeFieldLabel(key), value });
      continue;
    }

    if (typeof value === 'string' && isUuid(value.trim())) continue;
    if (lower.endsWith('_name') || lower.endsWith('_label') || lower.endsWith('_code')) {
      // Prefer showing once via the matching *_id branch above when present.
      const base = key.replace(/(_name|_label|_code)$/i, '');
      const idKey = `${base}_id`;
      if (keys.includes(idKey) || keys.includes(`${base}_uuid`)) {
        continue;
      }
      if (nestedEntityLabel(rec[base])) continue;
    }

    rows.push({ key, label: humanizeFieldLabel(key), value: formatFormScalar(value) });
  }

  if (!rows.length && !nested.length) {
    const fallback = catalogRowLabel(rec);
    if (fallback) {
      return <FormFieldRow label="Name" value={fallback} />;
    }
    return (
      <p className="text-[13px] text-[#64748b]">
        No displayable fields.
      </p>
    );
  }

  return (
    <div className={depth > 0 ? 'space-y-3' : 'space-y-3'}>
      {rows.length ? (
        <div className={erpForm.grid3}>
          {rows.map((row) => (
            <FormFieldRow key={row.key} label={row.label} value={row.value} />
          ))}
        </div>
      ) : null}
      {nested.map((block) => (
        <div key={block.key} className="space-y-2 border-t border-[#e8edf2] pt-3 first:border-0 first:pt-0">
          <p className="text-[12px] font-semibold text-[var(--fresa-header-text,#0A2942)]">
            {block.label}
          </p>
          <FormFieldsFromPayload data={block.value} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
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
      ? Object.keys(data).filter((k) => !isHiddenDetailKey(k))
      : [];
  if (data == null || (typeof data === 'object' && !Array.isArray(data) && !visibleKeys.length)) {
    return (
      <p className="text-[13px] text-[#64748b]">
        No payload returned for detail/{tab}.
      </p>
    );
  }

  return (
    <div className="rounded-sm bg-white">
      <div className="border-b border-[var(--fresa-border,#C9D3DF)] bg-[var(--fresa-page-bg,#F4F6F9)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
        {title ?? jobDetailTabLabel(tab)}
      </div>
      <div className="max-h-[28rem] overflow-auto px-3 py-2">
        <FormFieldsFromPayload data={data} />
      </div>
    </div>
  );
}

/** History tab — same lifecycle-hosted continuum History as the right rail. */
function JobHistoryPanel({ job }: { job: Job }) {
  return (
    <OpsContinuumPanel
      entityType="JOB"
      entityId={job.id}
      opsContinuum={job.ops_continuum}
      links={{
        enquiryId: job.enquiry_id,
        quotationId: job.quotation_id,
        shipmentId: job.shipment_id,
        jobId: job.id,
      }}
      defaultTab="history"
      hideTabBar
      compact
    />
  );
}

function shipmentRowsFromUnknown(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw
      .map((row) => {
        if (typeof row === 'string' && isUuid(row.trim())) {
          return { id: row.trim() };
        }
        if (row && typeof row === 'object' && !Array.isArray(row)) {
          return row as Record<string, unknown>;
        }
        return null;
      })
      .filter((r): r is Record<string, unknown> => Boolean(r));
  }
  if (raw && typeof raw === 'object') {
    const rec = raw as Record<string, unknown>;
    for (const key of ['shipments', 'items', 'data', 'results', 'linked_shipments']) {
      const val = rec[key];
      if (Array.isArray(val)) return shipmentRowsFromUnknown(val);
      // Nested envelope e.g. { data: { shipments: [...] } }
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const nested = shipmentRowsFromUnknown(val);
        if (nested.length) return nested;
      }
    }
    // Single shipment object
    if (rec.id || rec.shipment_id || rec.shipment_number) {
      return [rec];
    }
  }
  return [];
}

/**
 * Shipments tab — API-only merge (no hardcode):
 * 1) GET /jobs/:id/shipments
 * 2) GET /jobs/:id/detail/shipments
 * 3) GET /shipments?job_id= (jobs created from a shipment)
 * 4) Linked shipment_id on GET /jobs/:id when present
 */
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
  const byJobQuery = useShipments({
    page: 1,
    limit: 200,
    job_id: job.id,
  });
  // When job was created from a shipment, detail may only expose shipment_id.
  const linkedId =
    job.shipment_id && isUuid(job.shipment_id) ? job.shipment_id : '';
  const linkedQuery = useShipment(linkedId);
  const resources = useJobTabResourceMutations(job.id);
  const [attachId, setAttachId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => {
    const merged = new Map<string, Record<string, unknown>>();
    const push = (row: Record<string, unknown>) => {
      const sid = String(row.id ?? row.shipment_id ?? '').trim();
      const key =
        sid ||
        String(
          row.shipment_number ?? row.shipmentNumber ?? row.reference ?? '',
        ).trim() ||
        JSON.stringify(row);
      const prev = merged.get(key);
      merged.set(key, prev ? { ...prev, ...row } : row);
    };
    for (const row of shipmentRowsFromUnknown(listQuery.data)) push(row);
    for (const row of shipmentRowsFromUnknown(tabData)) push(row);
    for (const s of byJobQuery.data?.shipments ?? []) {
      push({
        id: s.id,
        shipment_number: s.shipment_number,
        status: s.status,
        shipment_type: s.job_type,
        hbl_number: s.hbl_number,
        job_id: s.job_id,
      });
    }
    if (linkedQuery.data) {
      const s = linkedQuery.data;
      push({
        id: s.id,
        shipment_number: s.shipment_number,
        status: s.status,
        shipment_type: s.job_type,
        hbl_number: s.hbl_number,
        job_id: s.job_id,
      });
    } else if (linkedId) {
      push({
        id: linkedId,
        shipment_number: job.shipment_number,
      });
    }
    return Array.from(merged.values());
  }, [
    listQuery.data,
    tabData,
    byJobQuery.data?.shipments,
    linkedQuery.data,
    linkedId,
    job.shipment_number,
  ]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void Promise.all([
        listQuery.refetch(),
        byJobQuery.refetch(),
        linkedId ? linkedQuery.refetch() : Promise.resolve(),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loading =
    listQuery.isLoading ||
    byJobQuery.isLoading ||
    (Boolean(linkedId) && linkedQuery.isLoading);

  return (
    <div className="space-y-3 text-[13px]">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      {(listQuery.isError || byJobQuery.isError) && rows.length === 0 ? (
        <p className="text-[var(--color-danger-600)]">
          {getErrorMessage(listQuery.error ?? byJobQuery.error) ||
            'Could not load shipments.'}
        </p>
      ) : null}
      {loading ? (
        <p className="text-[#64748b]">Loading shipments…</p>
      ) : rows.length === 0 ? (
        <p className="text-[#64748b]">
          {typeof tabData?.message === 'string' && tabData.message.trim()
            ? tabData.message.trim()
            : 'No linked shipments.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-[var(--fresa-border,#C9D3DF)]">
          <table className="min-w-full text-left text-[13px]">
            <thead>
              <tr>
                <th className={erpTable.th}>Shipment</th>
                <th className={erpTable.th}>Status</th>
                <th className={erpTable.th}>Type</th>
                <th className={erpTable.th}>BL / ref</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((rec, i) => {
                const sid = String(rec.id ?? rec.shipment_id ?? '').trim();
                const number =
                  String(
                    rec.shipment_number ??
                      rec.shipmentNumber ??
                      rec.reference ??
                      '',
                  ).trim() || (sid ? sid.slice(0, 8) : `Shipment ${i + 1}`);
                const status = String(rec.status ?? rec.shipment_status ?? '').trim();
                const type = String(
                  rec.shipment_type ?? rec.job_type ?? rec.mode ?? '',
                ).trim();
                const bl = String(
                  rec.hbl_number ??
                    rec.mbl_number ??
                    rec.bl_number ??
                    rec.house_bl ??
                    rec.master_bl ??
                    '',
                ).trim();
                return (
                  <tr
                    key={sid || i}
                    className="border-t border-[var(--fresa-border,#C9D3DF)] bg-white"
                  >
                    <td className="px-3 py-2">
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
                    </td>
                    <td className="px-3 py-2 text-[#64748b]">{status || '—'}</td>
                    <td className="px-3 py-2 text-[#64748b]">
                      {type ? type.replaceAll('_', ' ') : '—'}
                    </td>
                    <td className="px-3 py-2 text-[#64748b]">{bl || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <ShipmentSearchSelect
          name="attach_shipment_id"
          label="Attach shipment"
          value={attachId}
          onChange={setAttachId}
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
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={
            resources.createLinkShipments.isPending ||
            !job.job_type ||
            !isUuid(job.shipper_id || job.billing_party_id || '')
          }
          onClick={() =>
            void run(
              async () => {
                const customerId = job.shipper_id || job.billing_party_id || '';
                await resources.createLinkShipments.mutateAsync({
                  create: {
                    job_type: job.job_type,
                    customer_id: customerId,
                    ...(job.company_id && isUuid(job.company_id)
                      ? { company_id: job.company_id }
                      : {}),
                    ...(job.branch_id && isUuid(job.branch_id)
                      ? { branch_id: job.branch_id }
                      : {}),
                    ...(job.quotation_id && isUuid(job.quotation_id)
                      ? { quotation_id: job.quotation_id }
                      : {}),
                  },
                });
              },
              'Shipment created and linked to this job.',
            )
          }
        >
          {resources.createLinkShipments.isPending
            ? 'Creating…'
            : 'Create shipment on job'}
        </Button>
      </div>
      <p className="text-[11px] text-[#64748b]">
        Prorate to shipments needs at least one linked shipment on this master job.
      </p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={erpForm.section}>
      <div className={erpForm.sectionHeader}>{title}</div>
      <div className="max-h-[28rem] overflow-auto px-3 py-3">{children}</div>
    </div>
  );
}

/** Non-empty PatchShowAllDto values (incl. nested warehouse/transport/mawb) for read view. */
function showAllOverlayRecord(overlay: PatchShowAllDto): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(overlay)) {
    if (value == null) continue;
    if (key === 'warehouse' || key === 'transport' || key === 'mawb') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nested = showAllOverlayRecord(value as PatchShowAllDto);
        if (Object.keys(nested).length) out[key] = nested;
      }
      continue;
    }
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) out[key] = trimmed;
      continue;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }
    if (typeof value === 'boolean') out[key] = value;
  }
  return out;
}

function setIfPresent(
  out: Record<string, unknown>,
  key: string,
  value: unknown,
): void {
  if (value == null) return;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) out[key] = trimmed;
    return;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    out[key] = value;
  }
}

/** Job header / mode-detail fallbacks when show_all GET omits saved fields. */
function showAllJobOpsFallback(job?: Job | null): Record<string, unknown> {
  if (!job) return {};
  const out: Record<string, unknown> = {};
  const sea = job.sea_fcl_details;
  const seaLcl = job.sea_lcl_details;
  const air = job.air_details;
  const land = job.land_details;

  setIfPresent(out, 'commodity', job.commodity);
  setIfPresent(out, 'commodity_description', job.commodity_description);
  setIfPresent(out, 'pieces', job.pieces);
  setIfPresent(out, 'gross_weight', job.gross_weight);
  setIfPresent(out, 'chargeable_weight', job.chargeable_weight);
  setIfPresent(out, 'chargeable_units', job.chargeable_units);
  setIfPresent(out, 'volume_cbm', job.volume_cbm);
  setIfPresent(out, 'freight_payable_at', job.freight_payable_at);
  setIfPresent(out, 'service_scope', job.service_scope);
  setIfPresent(out, 'service_type', job.job_type);
  setIfPresent(out, 'job_date', job.job_date);
  setIfPresent(out, 'etd', job.etd || sea?.etd || seaLcl?.etd);
  setIfPresent(out, 'eta', job.eta || sea?.eta || seaLcl?.eta);
  setIfPresent(
    out,
    'mbl_number',
    sea?.mbl_number || seaLcl?.mbl_number,
  );
  setIfPresent(
    out,
    'hbl_number',
    sea?.hbl_number || seaLcl?.hbl_number,
  );
  setIfPresent(out, 'bl_number', job.bl_number);
  setIfPresent(out, 'rotation_number', job.rotation_number);
  setIfPresent(out, 'location_terminal', job.location_terminal);
  setIfPresent(out, 'container_number', job.primary_container_number);
  setIfPresent(
    out,
    'container_status',
    job.primary_container_status || job.primary_container_status_code,
  );
  setIfPresent(
    out,
    'vessel_name',
    job.vessel_name || sea?.vessel_name || seaLcl?.vessel_name,
  );
  setIfPresent(out, 'vessel_number', job.vessel_number);
  setIfPresent(
    out,
    'voyage_number',
    job.voyage_number || sea?.voyage_number || seaLcl?.voyage_number,
  );
  setIfPresent(out, 'line_code', job.line_code || job.line_no);
  setIfPresent(out, 'line_no', job.line_no || job.line_code);
  setIfPresent(out, 'company_code', job.company_code || job.edi_company_code);
  setIfPresent(out, 'origin_port_code', job.origin_port_code);
  setIfPresent(out, 'dest_port_code', job.dest_port_code);
  setIfPresent(out, 'shipper_name', job.shipper_name);
  setIfPresent(out, 'consignee_name', job.consignee_name);
  setIfPresent(out, 'billing_party_name', job.billing_party_name);
  setIfPresent(out, 'agent_name', job.agent_name);
  setIfPresent(out, 'customer_name', job.client_name);
  setIfPresent(out, 'flight_no', air?.flight_number);
  setIfPresent(out, 'flight_number', air?.flight_number);
  setIfPresent(out, 'flight_status', air?.flight_status);
  setIfPresent(out, 'flight_date', air?.flight_date);
  setIfPresent(out, 'mawb_no', air?.mawb_number);
  setIfPresent(out, 'mawb_number', air?.mawb_number);
  setIfPresent(out, 'hawb_no', air?.hawb_number);
  setIfPresent(out, 'hawb_number', air?.hawb_number);
  setIfPresent(out, 'shipment_date', air?.shipment_date);

  const transport: Record<string, unknown> = {};
  setIfPresent(transport, 'vehicle_number', land?.vehicle_number);
  setIfPresent(transport, 'driver_name', land?.driver_name);
  setIfPresent(transport, 'driver_license', land?.driver_license);
  setIfPresent(transport, 'origin_city_country', land?.origin_city_country);
  setIfPresent(
    transport,
    'destination_city_country',
    land?.destination_city_country,
  );
  setIfPresent(transport, 'freight_terms', land?.freight_terms);
  if (Object.keys(transport).length) out.transport = transport;

  return out;
}

function isShowAllSectionKey(key: string): boolean {
  return (
    isJobShowAllTab(key) ||
    /show.?all/i.test(key) ||
    key.startsWith('api-show')
  );
}

function JobShowAllPanel({
  jobId,
  siblingTabKeys,
  footer,
}: {
  jobId: string;
  siblingTabKeys: string[];
  /** Rendered after all Show All sections (e.g. Track & Trace). */
  footer?: ReactNode;
}) {
  const jobQuery = useJob(jobId);
  const query = useJobShowAll(jobId, siblingTabKeys, true);
  const patchShowAll = usePatchJobShowAll(jobId);
  const [editOpen, setEditOpen] = useState(false);
  const [savedOverlay, setSavedOverlay] = useState<PatchShowAllDto>({});
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const saveShowAll = async (dto: PatchShowAllDto) => {
    const refreshed = await patchShowAll.mutateAsync(dto);
    setSavedOverlay((prev) => mergeShowAllSavedOverlay(prev, dto, refreshed));
    await Promise.all([query.refetch(), jobQuery.refetch()]);
    setSaveMsg('Show All changes saved.');
    window.setTimeout(() => setSaveMsg(null), 5000);
  };

  const { sections = [], arrays = [] } = query.data ?? {};
  const opsFallback = useMemo(
    () => showAllJobOpsFallback(jobQuery.data),
    [jobQuery.data],
  );
  const overlayRecord = useMemo(
    () => showAllOverlayRecord(savedOverlay),
    [savedOverlay],
  );
  const apiShowAllSection = sections.find((s) => isShowAllSectionKey(s.key));
  /** One merged card: job fallback < API show_all < just-saved overlay (all modal fields). */
  const mergedShowAllData = useMemo(
    () => ({
      ...opsFallback,
      ...(apiShowAllSection?.data ?? {}),
      ...overlayRecord,
    }),
    [opsFallback, apiShowAllSection?.data, overlayRecord],
  );
  const hasMergedShowAll = Object.keys(mergedShowAllData).length > 0;
  const otherSections = sections.filter(
    (section) =>
      !isPartyTypesSection(section.key, section.title) &&
      !isShowAllSectionKey(section.key),
  );
  // Hooks must run before any conditional return (React #310).
  const editSources = useMemo(
    () => [
      savedOverlay,
      opsFallback,
      mergedShowAllData,
      query.data,
      ...sections.map((s) => s.data),
    ],
    [savedOverlay, opsFallback, mergedShowAllData, query.data, sections],
  );
  const transportEditMode = useMemo(() => {
    const job = jobQuery.data;
    if (!job) return 'all' as const;
    if (job.actions?.can_edit_air_fields === true) return 'air' as const;
    if (job.actions?.can_edit_sea_fields === true) return 'sea' as const;
    const mode = String(job.transport_mode || '').toUpperCase();
    if (mode.startsWith('AIR') || isAirwayBillJobType(job.job_type)) return 'air' as const;
    if (mode.startsWith('SEA') || /SEA|NVOCC/i.test(job.job_type || '')) {
      return 'sea' as const;
    }
    return 'all' as const;
  }, [jobQuery.data]);

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-[#64748b]">Loading Show All from detail tabs…</p>
        {footer}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-red-700">Could not load Show All detail tabs.</p>
        {footer}
      </div>
    );
  }

  const openEditShowAll = () => {
    setSaveMsg(null);
    setEditOpen(true);
  };

  const editModal = (
    <ShowAllEditModal
      open={editOpen}
      onClose={() => setEditOpen(false)}
      title="Edit job Show All"
      sources={editSources}
      pending={patchShowAll.isPending}
      onSubmit={saveShowAll}
      transportEditMode={transportEditMode}
    />
  );

  const showAllToolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {saveMsg ? (
        <p className="text-[13px] font-medium text-[var(--color-success-700)]">
          {saveMsg}
        </p>
      ) : (
        <span />
      )}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        leftIcon={<Pencil className="h-3.5 w-3.5" />}
        onClick={openEditShowAll}
      >
        Edit Show All
      </Button>
    </div>
  );

  if (
    !hasMergedShowAll &&
    !otherSections.length &&
    !arrays.length &&
    !footer
  ) {
    return (
      <div className="space-y-3">
        {showAllToolbar}
        <p className="text-[13px] text-[#64748b]">
          No Show All data returned from job detail APIs.
        </p>
        {editModal}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showAllToolbar}
      {hasMergedShowAll ? (
        <SectionCard title="Show All">
          <FormFieldsFromPayload data={mergedShowAllData} />
        </SectionCard>
      ) : null}
      {otherSections.map((section) => {
        const sectionKey = normalizeJobDetailTabKey(section.key);
        const isDepartment =
          sectionKey === 'department' || sectionKey === 'departments';
        return (
          <SectionCard key={section.key} title={section.title}>
            {isDepartment && jobQuery.data ? (
              <JobDepartmentPanel
                job={jobQuery.data}
                tabData={
                  section.data && typeof section.data === 'object' && !Array.isArray(section.data)
                    ? (section.data as Record<string, unknown>)
                    : null
                }
                onChanged={() => {
                  void jobQuery.refetch();
                  void query.refetch();
                }}
              />
            ) : (
              <FormFieldsFromPayload data={section.data} />
            )}
          </SectionCard>
        );
      })}
      {arrays
        .filter((block) => !isPartyTypesSection(block.key, block.title))
        .map((block) => (
        <SectionCard key={block.key} title={block.title}>
          <FormFieldsFromPayload data={block.rows} />
        </SectionCard>
      ))}
      {footer}
      {editModal}
    </div>
  );
}

/**
 * Interactive workspace for known DETAIL_TABS keys.
 * Known tabs render dedicated UI only — no raw API envelope underneath.
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
  if (key === 'mawb') {
    if (isAirwayBillJobType(job.job_type)) {
      return <JobAirMawbPanel jobId={job.id} />;
    }
    return null;
  }
  if (key === 'planned_container' || key === 'actual_container') {
    // Planned tab is hidden — one Containers/MAWB surface on actual_container.
    if (key === 'planned_container') return null;
    if (isAirwayBillJobType(job.job_type)) {
      return <JobAirMawbPanel jobId={job.id} />;
    }
    return (
      <div className="space-y-3">
        <p className="text-[12px] text-[#64748b]">Containers</p>
        <JobContainersPanel jobId={job.id} containerKind="ACTUAL" />
      </div>
    );
  }
  if (key === 'costing') {
    return <JobChargesPanel job={job} onChanged={onChanged} />;
  }
  if (key === 'history') {
    return <JobHistoryPanel job={job} />;
  }
  if (key === 'booking_form') {
    return <JobOpsPanel job={job} />;
  }
  if (key === 'acknowledgement') {
    return <JobAcknowledgementPanel jobId={job.id} />;
  }
  if (key === 'ledger') {
    return (
      <JobLedgerPanel
        jobId={job.id}
        partyId={job.shipper_id || job.billing_party_id}
      />
    );
  }
  if (key === 'shipments') {
    return <JobShipmentsTabPanel job={job} tabData={tabData} onChanged={onChanged} />;
  }
  if (key === 'department') {
    return <JobDepartmentPanel job={job} tabData={tabData} onChanged={onChanged} />;
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
  // ledger is FE-owned (GET /jobs/:id/ledger) — do not hit detail/:tab.
  const tabQuery = useJobDetailTab(job.id, apiKey, apiKey !== 'ledger');
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
    'acknowledgement',
    'ledger',
    'shipments',
    'department',
    'ex_rate',
    'routing',
    'customs',
    'shipping_bill_boe',
  ].includes(apiKey);

  // Interactive tabs own the UI — never dump raw detail/{tab} API envelopes underneath.
  const showApiEnvelope = !hasInteractive;

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
          isLoading={tabQuery.isLoading}
          isError={tabQuery.isError}
          title={jobDetailTabLabel(apiKey)}
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
