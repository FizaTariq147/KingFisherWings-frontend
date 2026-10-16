import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobDetailTab } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
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
  const [remarks, setRemarks] = useState('');
  const [editRefId, setEditRefId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => refRows(tabQuery.data), [tabQuery.data]);

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

  const dto = () => ({
    sb_number: sbNumber.trim() || undefined,
    boe_number: boeNumber.trim() || undefined,
    customs_house: customsHouse.trim() || undefined,
    customs_status: customsStatus.trim() || undefined,
    remarks: remarks.trim() || undefined,
  });

  const pending =
    resources.addCustomsRef.isPending ||
    resources.updateCustomsRef.isPending ||
    resources.deleteCustomsRef.isPending;

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

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
            return (
              <li
                key={id || i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] px-2.5 py-2"
              >
                <span className="font-medium">
                  SB {sb} · BOE {boe}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!id}
                    onClick={() => {
                      setEditRefId(id);
                      setSbNumber(String(row.sb_number ?? ''));
                      setBoeNumber(String(row.boe_number ?? ''));
                      setCustomsHouse(String(row.customs_house ?? ''));
                      setCustomsStatus(String(row.customs_status ?? ''));
                      setRemarks(String(row.remarks ?? ''));
                    }}
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
            void run(() => resources.addCustomsRef.mutateAsync(dto()), 'Customs ref added.')
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
      </div>
    </div>
  );
}
