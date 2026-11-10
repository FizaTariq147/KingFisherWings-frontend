import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobDetailTab } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job, UpsertJobCustomsRefDto } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickStr(...vals: unknown[]): string {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function refRows(tabData: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!tabData) return [];
  for (const key of ['items', 'refs', 'customs_refs', 'data']) {
    if (Array.isArray(tabData[key])) {
      return (tabData[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

function extractJobHold(tabData: Record<string, unknown> | undefined) {
  if (!tabData) return null;
  const hold =
    asRecord(tabData.job_hold) ??
    asRecord(tabData.jobHold) ??
    asRecord(tabData.ops_hold) ??
    asRecord(tabData.hold);
  if (!hold) return null;
  return {
    on_hold:
      hold.on_hold === true ||
      hold.onHold === true ||
      String(hold.status ?? '').toUpperCase() === 'ON_HOLD',
    status: pickStr(hold.status),
    hold_reason: pickStr(hold.hold_reason, hold.holdReason, hold.reason),
    held_at: pickStr(hold.held_at, hold.heldAt),
    expected_release_at: pickStr(
      hold.expected_release_at,
      hold.expectedReleaseAt,
    ),
    resume_reason: pickStr(hold.resume_reason, hold.resumeReason),
    resumed_at: pickStr(hold.resumed_at, hold.resumedAt),
  };
}

/** Customs / Shipping bill · BOE — POST/PATCH/DELETE /customs-refs */
export function JobCustomsRefsPanel({
  job,
  onChanged,
  tabKey = 'customs',
}: {
  job: Job;
  onChanged?: () => void;
  tabKey?: string;
}) {
  const resources = useJobTabResourceMutations(job.id);
  const tabQuery = useJobDetailTab(job.id, tabKey);
  const [sbNumber, setSbNumber] = useState('');
  const [boeNumber, setBoeNumber] = useState('');
  const [customsHouse, setCustomsHouse] = useState('');
  const [customsStatus, setCustomsStatus] = useState('');
  const [onHold, setOnHold] = useState(false);
  const [heldAt, setHeldAt] = useState('');
  const [inspectionAt, setInspectionAt] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [releasedAt, setReleasedAt] = useState('');
  const [remarks, setRemarks] = useState('');
  const [editRefId, setEditRefId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => refRows(tabQuery.data), [tabQuery.data]);
  const jobHold = useMemo(() => extractJobHold(tabQuery.data), [tabQuery.data]);

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setError(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
      onChanged?.();
      void tabQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resetForm = () => {
    setEditRefId('');
    setSbNumber('');
    setBoeNumber('');
    setCustomsHouse('');
    setCustomsStatus('');
    setOnHold(false);
    setHeldAt('');
    setInspectionAt('');
    setInspectionNotes('');
    setReleasedAt('');
    setRemarks('');
  };

  const dto = (): UpsertJobCustomsRefDto => ({
    sb_number: sbNumber.trim() || undefined,
    boe_number: boeNumber.trim() || undefined,
    customs_house: customsHouse.trim() || undefined,
    customs_status: customsStatus.trim() || undefined,
    on_hold: onHold,
    held_at: heldAt.trim() || null,
    inspection_at: inspectionAt.trim() || null,
    inspection_notes: inspectionNotes.trim() || null,
    released_at: releasedAt.trim() || null,
    remarks: remarks.trim() || undefined,
  });

  const loadRow = (row: Record<string, unknown>, id: string) => {
    setEditRefId(id);
    setSbNumber(String(row.sb_number ?? ''));
    setBoeNumber(String(row.boe_number ?? ''));
    setCustomsHouse(String(row.customs_house ?? ''));
    setCustomsStatus(String(row.customs_status ?? ''));
    setOnHold(row.on_hold === true || row.onHold === true);
    setHeldAt(pickStr(row.held_at, row.heldAt).slice(0, 16));
    setInspectionAt(pickStr(row.inspection_at, row.inspectionAt).slice(0, 16));
    setInspectionNotes(String(row.inspection_notes ?? row.inspectionNotes ?? ''));
    setReleasedAt(pickStr(row.released_at, row.releasedAt).slice(0, 16));
    setRemarks(String(row.remarks ?? ''));
  };

  const pending =
    resources.addCustomsRef.isPending ||
    resources.updateCustomsRef.isPending ||
    resources.deleteCustomsRef.isPending;

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      {jobHold ? (
        <div
          className={`rounded-sm border px-3 py-2 text-[13px] ${
            jobHold.on_hold
              ? 'border-[var(--color-warning-200,#FDE68A)] bg-[var(--color-warning-50,#FFFBEB)]'
              : 'border-[var(--fresa-border,#C9D3DF)] bg-white'
          }`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
            Job hold (ops)
          </p>
          <p className="mt-1 font-medium text-[#0f172a]">
            {jobHold.on_hold
              ? `On hold${jobHold.hold_reason ? ` — ${jobHold.hold_reason}` : ''}`
              : jobHold.status || 'Not on hold'}
          </p>
          <p className="mt-0.5 text-[12px] text-[#64748b]">
            {[
              jobHold.held_at ? `Held ${jobHold.held_at}` : null,
              jobHold.expected_release_at
                ? `Expected release ${jobHold.expected_release_at}`
                : null,
              jobHold.resumed_at ? `Resumed ${jobHold.resumed_at}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || '—'}
          </p>
        </div>
      ) : null}

      {tabQuery.isLoading ? (
        <p className="text-[13px] text-[#64748b]">Loading customs refs…</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-[#64748b]">No customs refs in detail/{tabKey} yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) => {
            const id = String(row.id ?? row.ref_id ?? '').trim();
            const sb = String(row.sb_number ?? '—');
            const boe = String(row.boe_number ?? '—');
            const hold =
              row.on_hold === true || row.onHold === true ? ' · On hold' : '';
            return (
              <li
                key={id || i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] px-2.5 py-2"
              >
                <div className="min-w-0">
                  <span className="font-medium">
                    SB {sb} · BOE {boe}
                    {hold}
                  </span>
                  {(row.inspection_at || row.released_at || row.customs_status) && (
                    <p className="truncate text-[12px] text-[#64748b]">
                      {[
                        row.customs_status,
                        row.inspection_at
                          ? `Inspection ${String(row.inspection_at)}`
                          : null,
                        row.released_at ? `Released ${String(row.released_at)}` : null,
                      ]
                        .filter(Boolean)
                        .map(String)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!id}
                    onClick={() => loadRow(row, id)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={pending || !id || !isUuid(id)}
                    onClick={() =>
                      void run(
                        () => resources.deleteCustomsRef.mutateAsync(id),
                        'Customs ref deleted.',
                      )
                    }
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input label="SB number" value={sbNumber} onChange={(e) => setSbNumber(e.target.value)} />
        <Input
          label="BOE number"
          value={boeNumber}
          onChange={(e) => setBoeNumber(e.target.value)}
        />
        <Input
          label="Customs house"
          value={customsHouse}
          onChange={(e) => setCustomsHouse(e.target.value)}
        />
        <Input
          label="Customs status"
          value={customsStatus}
          onChange={(e) => setCustomsStatus(e.target.value)}
        />
        <label className="flex items-center gap-2 text-[13px] sm:col-span-2">
          <input
            type="checkbox"
            checked={onHold}
            onChange={(e) => setOnHold(e.target.checked)}
          />
          On hold (customs)
        </label>
        <Input
          label="Held at"
          type="datetime-local"
          value={heldAt}
          onChange={(e) => setHeldAt(e.target.value)}
        />
        <Input
          label="Inspection at"
          type="datetime-local"
          value={inspectionAt}
          onChange={(e) => setInspectionAt(e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Inspection notes"
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
          />
        </div>
        <Input
          label="Released at"
          type="datetime-local"
          value={releasedAt}
          onChange={(e) => setReleasedAt(e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="create"
          disabled={pending || (!sbNumber.trim() && !boeNumber.trim())}
          onClick={() =>
            void run(async () => {
              await resources.addCustomsRef.mutateAsync(dto());
              resetForm();
            }, 'Customs ref added.')
          }
        >
          Add ref
        </Button>
        <Button
          type="button"
          size="sm"
          variant="edit"
          disabled={pending || !editRefId}
          onClick={() =>
            void run(
              () =>
                resources.updateCustomsRef.mutateAsync({
                  refId: editRefId,
                  dto: dto(),
                }),
              'Customs ref updated.',
            )
          }
        >
          Update ref
        </Button>
        {editRefId ? (
          <Button type="button" size="sm" variant="secondary" onClick={resetForm}>
            Cancel edit
          </Button>
        ) : null}
      </div>
    </div>
  );
}
