import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { isUuid } from '@/lib/isUuid';
import { useJobActions } from '../../hooks/useJobActions';
import { useJobDetailTab } from '../../hooks/useJobs';
import { useJobTabResourceMutations } from '../../hooks/useJobTabResources';
import type { Job } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function legRows(tabData: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!tabData) return [];
  for (const key of ['items', 'legs', 'routing_legs', 'data']) {
    if (Array.isArray(tabData[key])) {
      return (tabData[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

/** Routing tab — POST /routing-legs · PATCH/DELETE /routing-legs/:legId */
export function JobRoutingLegsPanel({
  job,
  onChanged,
}: {
  job: Job;
  onChanged?: () => void;
}) {
  const resources = useJobTabResourceMutations(job.id);
  const actions = useJobActions(job.id);
  const tabQuery = useJobDetailTab(job.id, 'routing');
  const [legSequence, setLegSequence] = useState('1');
  const [transportMode, setTransportMode] = useState('SEA');
  const [originPortId, setOriginPortId] = useState('');
  const [destPortId, setDestPortId] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [editLegId, setEditLegId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => legRows(tabQuery.data), [tabQuery.data]);

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
    leg_sequence: legSequence === '' ? undefined : Number(legSequence),
    transport_mode: transportMode.trim() || undefined,
    ...(isUuid(originPortId.trim()) ? { origin_port_id: originPortId.trim() } : {}),
    ...(isUuid(destPortId.trim()) ? { dest_port_id: destPortId.trim() } : {}),
    vessel_name: vesselName.trim() || undefined,
    voyage_number: voyageNumber.trim() || undefined,
  });

  const pending =
    resources.addRoutingLeg.isPending ||
    resources.updateRoutingLeg.isPending ||
    resources.deleteRoutingLeg.isPending ||
    actions.pushRoutingLegsToSubjobs.isPending;

  return (
    <div className="space-y-3 text-sm">
      {error ? <p className="text-[var(--color-danger-600)]">{error}</p> : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}
      <p className="text-[12px] text-[#64748b]">
        POST /jobs/:id/routing-legs · PATCH/DELETE /jobs/:id/routing-legs/:legId ·
        POST …/push-to-subjobs
      </p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          void run(
            () => actions.pushRoutingLegsToSubjobs.mutateAsync({}),
            'Routing legs pushed to sub-jobs.',
          )
        }
      >
        Push to sub-jobs
      </Button>

      {tabQuery.isLoading ? (
        <p className="text-[13px] text-[#64748b]">Loading routing legs…</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-[#64748b]">No routing legs in detail/routing yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) => {
            const id = String(row.id ?? row.leg_id ?? '').trim();
            const seq = String(row.leg_sequence ?? i + 1);
            const mode = String(row.transport_mode ?? '—');
            return (
              <li
                key={id || i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] px-2.5 py-2"
              >
                <span className="font-medium">
                  #{seq} · {mode} · {String(row.vessel_name ?? row.voyage_number ?? '—')}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!id}
                    onClick={() => {
                      setEditLegId(id);
                      setLegSequence(String(row.leg_sequence ?? seq));
                      setTransportMode(String(row.transport_mode ?? 'SEA'));
                      setOriginPortId(String(row.origin_port_id ?? ''));
                      setDestPortId(String(row.dest_port_id ?? ''));
                      setVesselName(String(row.vessel_name ?? ''));
                      setVoyageNumber(String(row.voyage_number ?? ''));
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={pending || !id}
                    onClick={() =>
                      void run(
                        () => resources.deleteRoutingLeg.mutateAsync(id),
                        'Leg deleted.',
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Input
          label="Sequence"
          value={legSequence}
          onChange={(e) => setLegSequence(e.target.value)}
        />
        <Input
          label="Transport mode"
          value={transportMode}
          onChange={(e) => setTransportMode(e.target.value)}
        />
        <Input
          label="Origin port ID"
          value={originPortId}
          onChange={(e) => setOriginPortId(e.target.value)}
        />
        <Input
          label="Dest port ID"
          value={destPortId}
          onChange={(e) => setDestPortId(e.target.value)}
        />
        <Input
          label="Vessel"
          value={vesselName}
          onChange={(e) => setVesselName(e.target.value)}
        />
        <Input
          label="Voyage"
          value={voyageNumber}
          onChange={(e) => setVoyageNumber(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="create"
          disabled={pending}
          onClick={() =>
            void run(() => resources.addRoutingLeg.mutateAsync(dto()), 'Leg added.')
          }
        >
          Add leg
        </Button>
        <Button
          type="button"
          size="sm"
          variant="edit"
          disabled={pending || !editLegId}
          onClick={() =>
            void run(
              () =>
                resources.updateRoutingLeg.mutateAsync({
                  legId: editLegId,
                  dto: dto(),
                }),
              'Leg updated.',
            )
          }
        >
          Update leg
        </Button>
      </div>
    </div>
  );
}
