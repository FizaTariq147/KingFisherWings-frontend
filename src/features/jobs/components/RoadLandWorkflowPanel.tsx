import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MASTER_PATHS } from '@/features/masters/api/masterPaths';
import { useMasterOptions } from '@/features/masters/hooks/useMasterResource';
import type { Job } from '../types/job.types';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  isRoadOrLandJobType,
  useRoadLandJobActions,
  type RoadLandMode,
} from '../hooks/useRoadLandJob';
import { canonicalizeJobType } from '../utils/canonicalizeJobType';

const VEHICLE_TYPES = ['TRUCK', 'TRAILER', 'VAN'] as const;
const FREIGHT_TERMS = ['Prepaid', 'Collect', 'Third Party'] as const;

function modeForJob(job: Job): RoadLandMode | null {
  if (!isRoadOrLandJobType(job.job_type)) return null;
  return canonicalizeJobType(job.job_type) === 'LAND' ? 'LAND' : 'ROAD_FREIGHT';
}

/** ROAD_FREIGHT lifecycle (LAND-parity) — details, trucker, pickup, border, POD, booking form. */
export function RoadLandWorkflowPanel({ job }: { job: Job }) {
  const mode = modeForJob(job);
  if (!mode) return null;
  return <RoadLandWorkflowPanelInner job={job} mode={mode} />;
}

function RoadLandWorkflowPanelInner({ job, mode }: { job: Job; mode: RoadLandMode }) {
  const isRoad = mode === 'ROAD_FREIGHT';
  const details = isRoad ? job.road_freight_details : job.land_details;
  const actions = useRoadLandJobActions(job.id, mode);
  const { data: truckers = [] } = useMasterOptions('truckers', MASTER_PATHS.truckers, true);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [truckerId, setTruckerId] = useState(details?.trucker_id ?? '');
  const [vehicleType, setVehicleType] = useState(details?.vehicle_type ?? 'TRUCK');
  const [vehicleNumber, setVehicleNumber] = useState(details?.vehicle_number ?? '');
  const [trailerNumber, setTrailerNumber] = useState(
    isRoad ? (job.road_freight_details?.trailer_number ?? '') : '',
  );
  const [driverName, setDriverName] = useState(details?.driver_name ?? '');
  const [driverLicense, setDriverLicense] = useState(details?.driver_license ?? '');
  const [origin, setOrigin] = useState(details?.origin_city_country ?? '');
  const [destination, setDestination] = useState(details?.destination_city_country ?? '');
  const [routeNotes, setRouteNotes] = useState(
    isRoad ? (job.road_freight_details?.route_notes ?? '') : '',
  );
  const [etd, setEtd] = useState(details?.etd?.slice(0, 16) ?? '');
  const [eta, setEta] = useState(details?.eta?.slice(0, 16) ?? '');
  const [incoterms, setIncoterms] = useState(details?.incoterms ?? '');
  const [freightTerms, setFreightTerms] = useState(details?.freight_terms ?? '');
  const [crossBorderRequired, setCrossBorderRequired] = useState(
    details?.cross_border_docs_required === true,
  );
  const [borderOrigin, setBorderOrigin] = useState(details?.border_origin_country ?? '');
  const [borderDest, setBorderDest] = useState(details?.border_destination_country ?? '');
  const [borderDecl, setBorderDecl] = useState(details?.border_declaration_number ?? '');
  const [borderCommodity, setBorderCommodity] = useState(details?.border_commodity ?? '');
  const [borderHs, setBorderHs] = useState(details?.border_hs_code ?? '');
  const [borderValue, setBorderValue] = useState(
    details?.border_declared_value != null ? String(details.border_declared_value) : '',
  );
  const [borderMilestone, setBorderMilestone] = useState<'AT_BORDER' | 'CUSTOMS_CLEARED_BORDER'>(
    'AT_BORDER',
  );
  const [podDate, setPodDate] = useState('');
  const [podReceivedBy, setPodReceivedBy] = useState('');
  const [podDeliveredBy, setPodDeliveredBy] = useState('');
  const [podRemarks, setPodRemarks] = useState('');

  const run = async (fn: () => Promise<unknown>, success: string) => {
    setErr(null);
    setMsg(null);
    try {
      await fn();
      setMsg(success);
    } catch (e) {
      setErr(getErrorMessage(e));
    }
  };

  const detailsPayload = () => ({
    trucker_id: truckerId.trim() || undefined,
    vehicle_type: vehicleType || undefined,
    vehicle_number: vehicleNumber.trim() || undefined,
    ...(isRoad ? { trailer_number: trailerNumber.trim() || undefined } : {}),
    driver_name: driverName.trim() || undefined,
    driver_license: driverLicense.trim() || undefined,
    origin_city_country: origin.trim() || undefined,
    destination_city_country: destination.trim() || undefined,
    ...(isRoad ? { route_notes: routeNotes.trim() || undefined } : {}),
    etd: etd || undefined,
    eta: eta || undefined,
    incoterms: incoterms.trim() || undefined,
    freight_terms: freightTerms || undefined,
    cross_border_docs_required: crossBorderRequired,
    border_origin_country: borderOrigin.trim().toUpperCase() || undefined,
    border_destination_country: borderDest.trim().toUpperCase() || undefined,
    border_declaration_number: borderDecl.trim() || undefined,
    border_commodity: borderCommodity.trim() || undefined,
    border_hs_code: borderHs.trim() || undefined,
    border_declared_value: borderValue ? Number(borderValue) : undefined,
  });

  const title = isRoad ? 'Road Freight workflow' : 'Land workflow';

  return (
    <div className="space-y-4">
      {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
      {msg ? <p className="text-sm text-[var(--color-success-700)]">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <p className="text-xs text-[var(--color-neutral-400)]">
            {isRoad
              ? 'PATCH …/road-freight-details · assign/pickup/border/POD under /jobs/:id/road-freight/*'
              : 'PATCH …/land-details · assign/pickup/border/POD under /jobs/:id/land/*'}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Trucker</span>
              <select
                className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                value={truckerId}
                onChange={(e) => setTruckerId(e.target.value)}
              >
                <option value="">Select trucker…</option>
                {truckers.map((t) => {
                  const id = String(t.id ?? '');
                  if (!id) return null;
                  const label = String(t.name ?? t.code ?? id);
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Vehicle type</span>
              <select
                className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Vehicle number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
            {isRoad ? (
              <Input
                label="Trailer number"
                value={trailerNumber}
                onChange={(e) => setTrailerNumber(e.target.value)}
              />
            ) : null}
            <Input
              label="Driver name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
            <Input
              label="Driver license"
              value={driverLicense}
              onChange={(e) => setDriverLicense(e.target.value)}
            />
            <Input label="Origin city/country" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            <Input
              label="Destination city/country"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            {isRoad ? (
              <Input
                label="Route notes"
                value={routeNotes}
                onChange={(e) => setRouteNotes(e.target.value)}
              />
            ) : null}
            <Input
              label="ETD"
              type="datetime-local"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
            />
            <Input
              label="ETA"
              type="datetime-local"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
            <Input
              label="Incoterms"
              value={incoterms}
              onChange={(e) => setIncoterms(e.target.value)}
              maxLength={10}
            />
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Freight terms</span>
              <select
                className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                value={freightTerms}
                onChange={(e) => setFreightTerms(e.target.value)}
              >
                <option value="">—</option>
                {FREIGHT_TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={actions.updateDetails.isPending}
              onClick={() =>
                void run(() => actions.updateDetails.mutateAsync(detailsPayload()), 'Details saved.')
              }
            >
              Save details
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.assignTrucker.isPending || !truckerId.trim()}
              onClick={() =>
                void run(
                  () =>
                    actions.assignTrucker.mutateAsync({
                      trucker_id: truckerId.trim(),
                      vehicle_type: vehicleType || undefined,
                      vehicle_number: vehicleNumber.trim() || undefined,
                      ...(isRoad
                        ? { trailer_number: trailerNumber.trim() || undefined }
                        : {}),
                      driver_name: driverName.trim() || undefined,
                      driver_license: driverLicense.trim() || undefined,
                    }),
                  'Trucker assigned (PICKUP_SCHEDULED).',
                )
              }
            >
              Assign trucker
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={actions.pickup.isPending}
              onClick={() =>
                void run(() => actions.pickup.mutateAsync({}), 'Pickup recorded.')
              }
            >
              Record pickup
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cross-border</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={crossBorderRequired}
              onChange={(e) => setCrossBorderRequired(e.target.checked)}
            />
            Cross-border docs required
          </label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Border origin (ISO-2)"
              value={borderOrigin}
              onChange={(e) => setBorderOrigin(e.target.value.toUpperCase())}
              maxLength={2}
            />
            <Input
              label="Border dest (ISO-2)"
              value={borderDest}
              onChange={(e) => setBorderDest(e.target.value.toUpperCase())}
              maxLength={2}
            />
            <Input
              label="Declaration number"
              value={borderDecl}
              onChange={(e) => setBorderDecl(e.target.value)}
            />
            <Input
              label="Border commodity"
              value={borderCommodity}
              onChange={(e) => setBorderCommodity(e.target.value)}
            />
            <Input
              label="Border HS code"
              value={borderHs}
              onChange={(e) => setBorderHs(e.target.value)}
            />
            <Input
              label="Declared value"
              type="number"
              min={0}
              value={borderValue}
              onChange={(e) => setBorderValue(e.target.value)}
            />
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-[var(--color-neutral-600)]">Crossing milestone</span>
              <select
                className="h-9 rounded-md border border-[var(--color-neutral-200)] px-2 text-sm"
                value={borderMilestone}
                onChange={(e) =>
                  setBorderMilestone(e.target.value as 'AT_BORDER' | 'CUSTOMS_CLEARED_BORDER')
                }
              >
                <option value="AT_BORDER">AT_BORDER</option>
                <option value="CUSTOMS_CLEARED_BORDER">CUSTOMS_CLEARED_BORDER</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={actions.crossBorder.isPending}
              onClick={() =>
                void run(
                  () => actions.crossBorder.mutateAsync(detailsPayload()),
                  'Cross-border fields saved.',
                )
              }
            >
              Save cross-border
            </Button>
            <Button
              type="button"
              disabled={actions.borderCrossing.isPending}
              onClick={() =>
                void run(
                  () =>
                    actions.borderCrossing.mutateAsync({
                      milestone: borderMilestone,
                      border_declaration_number: borderDecl.trim() || undefined,
                    }),
                  'Border crossing recorded.',
                )
              }
            >
              Record border crossing
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proof of delivery</CardTitle>
        </CardHeader>
        <div className="space-y-3 px-4 pb-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Actual delivery date *"
              type="datetime-local"
              value={podDate}
              onChange={(e) => setPodDate(e.target.value)}
            />
            <Input
              label="Delivered by"
              value={podDeliveredBy}
              onChange={(e) => setPodDeliveredBy(e.target.value)}
            />
            <Input
              label="Received by"
              value={podReceivedBy}
              onChange={(e) => setPodReceivedBy(e.target.value)}
            />
            <Input
              label="Remarks"
              value={podRemarks}
              onChange={(e) => setPodRemarks(e.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={actions.pod.isPending || !podDate}
            onClick={() =>
              void run(
                () =>
                  actions.pod.mutateAsync({
                    actual_delivery_date: podDate,
                    delivered_by: podDeliveredBy.trim() || undefined,
                    received_by: podReceivedBy.trim() || undefined,
                    remarks: podRemarks.trim() || undefined,
                  }),
                'POD recorded.',
              )
            }
          >
            Record POD
          </Button>
        </div>
      </Card>
    </div>
  );
}
