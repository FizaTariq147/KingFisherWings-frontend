import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/features/masters/components/SearchableSelect';
import { useMasterCodeOptions } from '@/features/masters/hooks/useMasterCodeOptions';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobDetailTab } from '../../hooks/useJobs';
import type { AirMawbPayload, AirPalletLineDto, UpdateAirMawbDto } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { AIR_BOOKING_FORM_LIMITS, clipAirField } from '../../utils/airBookingFormLimits';

type MawbForm = {
  flight_no: string;
  flight_status: string;
  flight_date: string;
  shipment_date: string;
  mawb_no: string;
  hawb_no: string;
  pallet_count: string;
  dimensions: string;
  weight: string;
  pallet_type: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
};

type SavedMawbRow = {
  id: string;
  flight_no: string;
  flight_status: string;
  flight_date: string;
  shipment_date: string;
  mawb_no: string;
  hawb_no: string;
  pallet_count: string;
  dimensions: string;
  weight: string;
  pallet_type: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
};

function emptyForm(): MawbForm {
  return {
    flight_no: '',
    flight_status: '',
    flight_date: '',
    shipment_date: '',
    mawb_no: '',
    hawb_no: '',
    pallet_count: '',
    dimensions: '',
    weight: '',
    pallet_type: '',
    length_cm: '',
    width_cm: '',
    height_cm: '',
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickStr(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  }
  return '';
}

function payloadToForm(raw: unknown): MawbForm {
  const root = asRecord(raw) ?? {};
  const nested =
    asRecord(root.mawb) ??
    asRecord(root.air_mawb) ??
    asRecord(root.planned_container) ??
    asRecord(root.actual_container) ??
    root;
  const pallets =
    (nested.air_pallet as AirPalletLineDto[] | undefined) ??
    (nested.pallets as AirPalletLineDto[] | undefined) ??
    [];
  const first = Array.isArray(pallets) ? pallets[0] : undefined;
  return {
    flight_no: pickStr(nested.flight_no, nested.flight_number).slice(
      0,
      AIR_BOOKING_FORM_LIMITS.flight_number,
    ),
    flight_status: pickStr(nested.flight_status).slice(
      0,
      AIR_BOOKING_FORM_LIMITS.flight_status,
    ),
    flight_date: pickStr(nested.flight_date, nested.flightDate).slice(0, 10),
    shipment_date: pickStr(nested.shipment_date, nested.shipmentDate).slice(0, 10),
    mawb_no: pickStr(nested.mawb_no, nested.mawb_number).slice(
      0,
      AIR_BOOKING_FORM_LIMITS.mawb_number,
    ),
    hawb_no: pickStr(nested.hawb_no, nested.hawb_number).slice(
      0,
      AIR_BOOKING_FORM_LIMITS.hawb_number,
    ),
    pallet_count:
      pickStr(nested.pallet_count) || pickStr(first?.count),
    dimensions: pickStr(nested.dimensions, nested.volume_cbm),
    weight: pickStr(nested.weight, nested.gross_weight_kg, nested.gross_weight),
    pallet_type: pickStr(first?.pallet_type),
    length_cm: pickStr(first?.length_cm),
    width_cm: pickStr(first?.width_cm),
    height_cm: pickStr(first?.height_cm),
  };
}

function formHasValues(form: MawbForm): boolean {
  return [
    form.flight_no,
    form.flight_status,
    form.flight_date,
    form.shipment_date,
    form.mawb_no,
    form.hawb_no,
    form.pallet_count,
    form.dimensions,
    form.weight,
    form.pallet_type,
  ].some((v) => v.trim());
}

function formToSavedRow(form: MawbForm, id?: string): SavedMawbRow {
  return {
    id: id ?? `mawb-${Date.now()}`,
    flight_no: form.flight_no.trim(),
    flight_status: form.flight_status.trim(),
    flight_date: form.flight_date.trim().slice(0, 10),
    shipment_date: form.shipment_date.trim().slice(0, 10),
    mawb_no: form.mawb_no.trim(),
    hawb_no: form.hawb_no.trim(),
    pallet_count: form.pallet_count.trim(),
    dimensions: form.dimensions.trim(),
    weight: form.weight.trim(),
    pallet_type: form.pallet_type.trim(),
    length_cm: form.length_cm.trim(),
    width_cm: form.width_cm.trim(),
    height_cm: form.height_cm.trim(),
  };
}

function savedRowToForm(row: SavedMawbRow): MawbForm {
  return {
    flight_no: row.flight_no,
    flight_status: row.flight_status,
    flight_date: row.flight_date,
    shipment_date: row.shipment_date,
    mawb_no: row.mawb_no,
    hawb_no: row.hawb_no,
    pallet_count: row.pallet_count,
    dimensions: row.dimensions,
    weight: row.weight,
    pallet_type: row.pallet_type,
    length_cm: row.length_cm,
    width_cm: row.width_cm,
    height_cm: row.height_cm,
  };
}

function buildMawbDto(form: MawbForm, clear = false): UpdateAirMawbDto {
  if (clear) {
    return {
      flight_no: '',
      flight_status: '',
      flight_date: null,
      shipment_date: null,
      mawb_no: '',
      hawb_no: '',
      pallet_count: 0,
      air_pallet: [],
      dimensions: 0,
      weight: 0,
    };
  }
  const dto: UpdateAirMawbDto = {
    flight_no: clipAirField(form.flight_no, AIR_BOOKING_FORM_LIMITS.flight_number) ?? '',
    flight_status:
      clipAirField(form.flight_status, AIR_BOOKING_FORM_LIMITS.flight_status) ?? '',
    flight_date: form.flight_date.trim().slice(0, 10) || null,
    shipment_date: form.shipment_date.trim().slice(0, 10) || null,
    mawb_no: clipAirField(form.mawb_no, AIR_BOOKING_FORM_LIMITS.mawb_number) ?? '',
    hawb_no: clipAirField(form.hawb_no, AIR_BOOKING_FORM_LIMITS.hawb_number) ?? '',
  };
  if (form.pallet_count.trim()) {
    const n = Number(form.pallet_count);
    if (!Number.isFinite(n) || n < 0) throw new Error('Pallet count must be ≥ 0.');
    dto.pallet_count = n;
  }
  if (form.dimensions.trim()) {
    const n = Number(form.dimensions);
    if (!Number.isFinite(n) || n < 0) throw new Error('Dimensions / CBM must be ≥ 0.');
    dto.dimensions = n;
  }
  if (form.weight.trim()) {
    const n = Number(form.weight);
    if (!Number.isFinite(n) || n < 0) throw new Error('Weight must be ≥ 0.');
    dto.weight = n;
  }
  const palletType = form.pallet_type.trim();
  if (palletType) {
    const count = Number(form.pallet_count || '1');
    const line: AirPalletLineDto = {
      pallet_type: palletType.slice(0, AIR_BOOKING_FORM_LIMITS.pallet_type),
      count: Number.isFinite(count) && count > 0 ? count : 1,
    };
    if (form.length_cm.trim()) line.length_cm = Number(form.length_cm);
    if (form.width_cm.trim()) line.width_cm = Number(form.width_cm);
    if (form.height_cm.trim()) line.height_cm = Number(form.height_cm);
    dto.air_pallet = [line];
  }
  return dto;
}

interface JobAirMawbPanelProps {
  jobId: string;
}

/**
 * AIR_EXPORT / AIR_IMPORT containers tab — MAWB payload (planned tab removed).
 * GET/PUT /jobs/:id/detail/mawb (falls back to container tabs for older payloads).
 */
export function JobAirMawbPanel({ jobId }: JobAirMawbPanelProps) {
  const mawbQuery = useJobDetailTab(jobId, 'mawb', true);
  // Fallback for tenants that still nest MAWB under container detail tabs.
  const actualQuery = useJobDetailTab(jobId, 'actual_container', true);
  const plannedQuery = useJobDetailTab(jobId, 'planned_container', true);
  const mutations = useJobSubresourceMutations(jobId);
  const palletTypeOptions = useMasterCodeOptions('air-pallet-types', true);
  const palletSelectOptions = useMemo(
    () =>
      palletTypeOptions.map((o) => ({
        value: o.code,
        label: o.name && o.name !== o.code ? `${o.code} — ${o.name}` : o.code,
      })),
    [palletTypeOptions],
  );

  const [form, setForm] = useState<MawbForm>(emptyForm);
  const [savedRows, setSavedRows] = useState<SavedMawbRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const tabData = mawbQuery.data ?? actualQuery.data ?? plannedQuery.data;
  const tabLoading =
    mawbQuery.isLoading || actualQuery.isLoading || plannedQuery.isLoading;

  useEffect(() => {
    if (hydrated) return;
    if (tabLoading) return;
    if (!tabData) {
      setHydrated(true);
      return;
    }
    const next = payloadToForm(tabData as AirMawbPayload);
    if (formHasValues(next)) {
      setSavedRows([formToSavedRow(next, 'mawb-current')]);
    } else {
      setSavedRows([]);
    }
    setForm(emptyForm());
    setHydrated(true);
  }, [tabData, tabLoading, hydrated]);

  const setField = (key: keyof MawbForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      if (!formHasValues(form)) {
        throw new Error('Enter at least one MAWB / flight field before saving.');
      }
      await mutations.updateAirMawb.mutateAsync(buildMawbDto(form));
      const row = formToSavedRow(form, editingId ?? 'mawb-current');
      setSavedRows([row]);
      setForm(emptyForm());
      setEditingId(null);
      setMsg('MAWB details saved.');
      await Promise.all([
        mawbQuery.refetch(),
        actualQuery.refetch(),
        plannedQuery.refetch(),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEdit = (row: SavedMawbRow) => {
    setForm(savedRowToForm(row));
    setEditingId(row.id);
    setMsg(null);
    setError(null);
  };

  const removeRow = async (row: SavedMawbRow) => {
    setError(null);
    setMsg(null);
    try {
      await mutations.updateAirMawb.mutateAsync(buildMawbDto(emptyForm(), true));
      setSavedRows((prev) => prev.filter((r) => r.id !== row.id));
      if (editingId === row.id) {
        setForm(emptyForm());
        setEditingId(null);
      }
      setMsg('MAWB details removed.');
      await Promise.all([
        mawbQuery.refetch(),
        actualQuery.refetch(),
        plannedQuery.refetch(),
      ]);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const pending =
    mutations.updateAirMawb.isPending ||
    actualQuery.isLoading ||
    plannedQuery.isLoading;

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-[#64748b]">
        Flight, MAWB / HAWB, and air pallet details for this job.
      </p>
      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit MAWB / flight' : 'Add MAWB / flight'}</CardTitle>
        </CardHeader>
        <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Flight number"
            maxLength={AIR_BOOKING_FORM_LIMITS.flight_number}
            value={form.flight_no}
            onChange={(e) => setField('flight_no', e.target.value)}
          />
          <Input
            label="Flight status"
            maxLength={AIR_BOOKING_FORM_LIMITS.flight_status}
            value={form.flight_status}
            onChange={(e) => setField('flight_status', e.target.value)}
          />
          <Input
            label="Flight date"
            type="date"
            value={form.flight_date}
            onChange={(e) => setField('flight_date', e.target.value)}
          />
          <Input
            label="Shipment date"
            type="date"
            value={form.shipment_date}
            onChange={(e) => setField('shipment_date', e.target.value)}
          />
          <Input
            label="MAWB number"
            maxLength={AIR_BOOKING_FORM_LIMITS.mawb_number}
            value={form.mawb_no}
            onChange={(e) => setField('mawb_no', e.target.value)}
          />
          <Input
            label="HAWB number"
            maxLength={AIR_BOOKING_FORM_LIMITS.hawb_number}
            value={form.hawb_no}
            onChange={(e) => setField('hawb_no', e.target.value)}
          />
          <Input
            label="Dimensions / volume CBM"
            type="number"
            value={form.dimensions}
            onChange={(e) => setField('dimensions', e.target.value)}
          />
          <Input
            label="Weight kg"
            type="number"
            value={form.weight}
            onChange={(e) => setField('weight', e.target.value)}
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <SearchableSelect
              name="pallet_type"
              label="Air pallet type"
              value={form.pallet_type}
              options={palletSelectOptions}
              onChange={(value) => setField('pallet_type', value)}
              allowManualValue
              placeholder="Search or type pallet type…"
              emptyMessage="No air pallet types in masters — type your own."
              hint="Pick from masters or enter a custom type."
            />
          </div>
          <Input
            label="No of bags / pallets"
            type="number"
            value={form.pallet_count}
            onChange={(e) => setField('pallet_count', e.target.value)}
          />
          <Input
            label="Length cm"
            type="number"
            value={form.length_cm}
            onChange={(e) => setField('length_cm', e.target.value)}
          />
          <Input
            label="Width cm"
            type="number"
            value={form.width_cm}
            onChange={(e) => setField('width_cm', e.target.value)}
          />
          <Input
            label="Height cm"
            type="number"
            value={form.height_cm}
            onChange={(e) => setField('height_cm', e.target.value)}
          />
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
            <Button type="button" disabled={pending} onClick={() => void save()}>
              {mutations.updateAirMawb.isPending
                ? 'Saving…'
                : editingId
                  ? 'Update MAWB'
                  : 'Save MAWB'}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  setForm(emptyForm());
                  setEditingId(null);
                }}
              >
                Cancel edit
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved MAWB / flight</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 text-sm">
          {savedRows.length === 0 ? (
            <p className="text-[var(--color-neutral-400)]">No MAWB / flight details yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              {savedRows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-start justify-between gap-2 py-2"
                >
                  <div>
                    <p className="font-medium">
                      {row.mawb_no
                        ? `MAWB ${row.mawb_no}`
                        : row.hawb_no
                          ? `HAWB ${row.hawb_no}`
                          : 'Flight / MAWB'}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      Flight: {row.flight_no || '—'}
                      {row.flight_status ? ` · ${row.flight_status}` : ''}
                      {row.flight_date ? ` · Flight date ${row.flight_date}` : ''}
                      {row.shipment_date ? ` · Shipment ${row.shipment_date}` : ''}
                      {row.hawb_no && row.mawb_no ? ` · HAWB ${row.hawb_no}` : ''}
                    </p>
                    <p className="text-xs text-[var(--color-neutral-500)]">
                      Pallets: {row.pallet_count || '—'}
                      {row.pallet_type ? ` · ${row.pallet_type}` : ''}
                      {row.weight ? ` · ${row.weight} kg` : ''}
                      {row.dimensions ? ` · ${row.dimensions} CBM` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => startEdit(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      disabled={pending}
                      onClick={() => void removeRow(row)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
