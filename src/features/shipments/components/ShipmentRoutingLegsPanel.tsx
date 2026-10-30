import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MasterPlaceSelect } from '@/features/masters/components/MasterPlaceSelect';
import {
  pickCarrierDisplay,
  pickRoutingPlaceDisplay,
} from '@/features/shared/routing/routingPlace';
import { isUuid } from '@/lib/isUuid';
import {
  useAddShipmentRoutingLeg,
  useUpdateShipmentRoutingLeg,
} from '../hooks/useShipmentTabMutations';
import { useShipmentDetailTab } from '../hooks/useShipments';
import { getErrorMessage } from '../utils/getErrorMessage';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function legRows(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) {
    return raw.map(asRecord).filter((r): r is Record<string, unknown> => Boolean(r));
  }
  const rec = asRecord(raw);
  if (!rec) return [];
  for (const key of ['items', 'legs', 'routing_legs', 'data', 'results']) {
    if (Array.isArray(rec[key])) {
      return (rec[key] as unknown[])
        .map(asRecord)
        .filter((r): r is Record<string, unknown> => Boolean(r));
    }
  }
  return [];
}

/**
 * Routing tab — POST /shipments/:id/routing-legs (+ PATCH when editing).
 * Sends name/code fields preferred by BE; UUID remains optional when selected.
 */
export function ShipmentRoutingLegsPanel({
  shipmentId,
  tabKey = 'routing',
  onChanged,
}: {
  shipmentId: string;
  tabKey?: string;
  onChanged?: () => void;
}) {
  const tabQuery = useShipmentDetailTab(shipmentId, tabKey);
  const addLeg = useAddShipmentRoutingLeg(shipmentId);
  const updateLeg = useUpdateShipmentRoutingLeg(shipmentId);

  const [legSequence, setLegSequence] = useState('1');
  const [transportMode, setTransportMode] = useState('SEA');
  const [originPortId, setOriginPortId] = useState('');
  const [originPortName, setOriginPortName] = useState('');
  const [originPortCode, setOriginPortCode] = useState('');
  const [destPortId, setDestPortId] = useState('');
  const [destPortName, setDestPortName] = useState('');
  const [destPortCode, setDestPortCode] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [editLegId, setEditLegId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const rows = useMemo(() => legRows(tabQuery.data), [tabQuery.data]);
  const pending = addLeg.isPending || updateLeg.isPending;

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

  const dto = (): Record<string, unknown> => {
    const originName = originPortName.trim();
    const originCode = originPortCode.trim().toUpperCase();
    const destName = destPortName.trim();
    const destCode = destPortCode.trim().toUpperCase();
    const carrier = carrierName.trim();
    return {
      leg_sequence: legSequence === '' ? undefined : Number(legSequence),
      transport_mode: transportMode.trim() || undefined,
      ...(isUuid(originPortId.trim()) ? { origin_port_id: originPortId.trim() } : {}),
      ...(originName ? { origin_port_name: originName } : {}),
      ...(originCode ? { origin_port_code: originCode } : {}),
      ...(isUuid(destPortId.trim()) ? { dest_port_id: destPortId.trim() } : {}),
      ...(destName ? { dest_port_name: destName } : {}),
      ...(destCode ? { dest_port_code: destCode } : {}),
      ...(carrier ? { carrier_name: carrier } : {}),
      vessel_name: vesselName.trim() || undefined,
      voyage_number: voyageNumber.trim() || undefined,
    };
  };

  const clearForm = () => {
    setLegSequence(String(rows.length + 1));
    setTransportMode('SEA');
    setOriginPortId('');
    setOriginPortName('');
    setOriginPortCode('');
    setDestPortId('');
    setDestPortName('');
    setDestPortCode('');
    setCarrierName('');
    setVesselName('');
    setVoyageNumber('');
    setEditLegId('');
  };

  const loadRow = (row: Record<string, unknown>, seq: string) => {
    const id = String(row.id ?? row.leg_id ?? '').trim();
    setEditLegId(id);
    setLegSequence(String(row.leg_sequence ?? seq));
    setTransportMode(String(row.transport_mode ?? 'SEA'));
    setOriginPortId(String(row.origin_port_id ?? '').trim());
    setOriginPortName(String(row.origin_port_name ?? '').trim());
    setOriginPortCode(String(row.origin_port_code ?? '').trim());
    setDestPortId(String(row.dest_port_id ?? '').trim());
    setDestPortName(String(row.dest_port_name ?? '').trim());
    setDestPortCode(String(row.dest_port_code ?? '').trim());
    setCarrierName(pickCarrierDisplay(row));
    setVesselName(String(row.vessel_name ?? ''));
    setVoyageNumber(String(row.voyage_number ?? ''));
  };

  return (
    <div className="space-y-4 p-3 text-sm">
      {error ? (
        <p className="rounded-sm border border-[var(--color-danger-200,#fecaca)] bg-[var(--color-danger-50,#fef2f2)] px-3 py-2 text-[var(--color-danger-600)]">
          {error}
        </p>
      ) : null}
      {msg ? <p className="text-[var(--color-success-700)]">{msg}</p> : null}

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          Routing legs
        </p>
        {tabQuery.isLoading ? (
          <p className="text-[13px] text-[#64748b]">Loading routing legs…</p>
        ) : tabQuery.isError ? (
          <p className="text-[var(--color-danger-600)]">
            {getErrorMessage(tabQuery.error) || 'Failed to load routing legs.'}
          </p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-[#64748b]">No routing legs yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row, i) => {
              const id = String(row.id ?? row.leg_id ?? '').trim();
              const seq = String(row.leg_sequence ?? i + 1);
              const mode = String(row.transport_mode ?? '—');
              const origin = pickRoutingPlaceDisplay(row, 'origin');
              const dest = pickRoutingPlaceDisplay(row, 'dest');
              const carrier = pickCarrierDisplay(row);
              const routeBits = [origin || null, dest || null].filter(Boolean).join(' → ');
              return (
                <li
                  key={id || i}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-[#e8edf2] bg-white px-2.5 py-2"
                >
                  <span className="font-medium text-[#0f172a]">
                    #{seq} · {mode}
                    {routeBits ? ` · ${routeBits}` : ''}
                    {carrier ? ` · ${carrier}` : ''}
                    {!routeBits && !carrier
                      ? ` · ${String(row.vessel_name ?? row.voyage_number ?? '—')}`
                      : ''}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!id}
                    onClick={() => loadRow(row, seq)}
                  >
                    Edit
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[var(--fresa-header-text,#0A2942)]">
          {editLegId ? 'Update routing leg' : 'Add routing leg'}
        </p>
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
            label="Carrier name"
            value={carrierName}
            onChange={(e) => setCarrierName(e.target.value)}
            placeholder="Carrier / shipping line name"
          />
          <MasterPlaceSelect
            name="shipment_routing_origin_port_id"
            label="Origin port"
            value={originPortId}
            onChange={setOriginPortId}
            onPlaceChange={(place) => {
              if (!place) return;
              if (place.name) setOriginPortName(place.name);
              if (place.code) setOriginPortCode(place.code);
            }}
            allowCreate={false}
          />
          <Input
            label="Origin port name"
            value={originPortName}
            onChange={(e) => setOriginPortName(e.target.value)}
            placeholder="Manual location name"
          />
          <Input
            label="Origin port code"
            value={originPortCode}
            onChange={(e) => setOriginPortCode(e.target.value)}
            placeholder="e.g. USNYC"
          />
          <MasterPlaceSelect
            name="shipment_routing_dest_port_id"
            label="Destination port"
            value={destPortId}
            onChange={setDestPortId}
            onPlaceChange={(place) => {
              if (!place) return;
              if (place.name) setDestPortName(place.name);
              if (place.code) setDestPortCode(place.code);
            }}
            excludeId={originPortId || undefined}
            allowCreate={false}
          />
          <Input
            label="Destination port name"
            value={destPortName}
            onChange={(e) => setDestPortName(e.target.value)}
            placeholder="Manual location name"
          />
          <Input
            label="Destination port code"
            value={destPortCode}
            onChange={(e) => setDestPortCode(e.target.value)}
            placeholder="e.g. SGSIN"
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="create"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                await addLeg.mutateAsync(dto());
                clearForm();
              }, 'Routing leg added.')
            }
          >
            {addLeg.isPending ? 'Adding…' : 'Add leg'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="edit"
            disabled={pending || !editLegId || !isUuid(editLegId)}
            onClick={() =>
              void run(async () => {
                await updateLeg.mutateAsync({ legId: editLegId, body: dto() });
                clearForm();
              }, 'Routing leg updated.')
            }
          >
            Update leg
          </Button>
          {editLegId ? (
            <Button type="button" size="sm" variant="secondary" onClick={clearForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
