import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  MasterCodeDatalist,
  useMasterCodeOptions,
} from '@/features/masters/hooks/useMasterCodeOptions';
import { useJobSubresourceMutations } from '../../hooks/useJobSubresources';
import { useJobDetailTab } from '../../hooks/useJobs';
import type { AirMawbPayload, AirPalletLineDto, UpdateAirMawbDto } from '../../types/job.types';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { AIR_BOOKING_FORM_LIMITS, clipAirField } from '../../utils/airBookingFormLimits';

const AIR_PALLET_LIST_ID = 'kfw-air-mawb-pallet-types';

type MawbForm = {
  flight_no: string;
  flight_status: string;
  mawb_no: string;
  hawb_no: string;
  pallet_count: string;
  dimensions: string;
  weight: string;
  pallet_type: string;
  pallet_line_count: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  weight_kg: string;
};

type SavedMawbRow = {
  flight_no: string;
  flight_status: string;
  mawb_no: string;
  hawb_no: string;
  pallet_count: string;
  dimensions: string;
  weight: string;
  pallet_type: string;
};

function emptyForm(): MawbForm {
  return {
    flight_no: '',
    flight_status: '',
    mawb_no: '',
    hawb_no: '',
    pallet_count: '',
    dimensions: '',
    weight: '',
    pallet_type: '',
    pallet_line_count: '1',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    weight_kg: '',
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
    mawb_no: pickStr(nested.mawb_no, nested.mawb_number).slice(
      0,
      AIR_BOOKING_FORM_LIMITS.mawb_number,
    ),
    hawb_no: pickStr(nested.hawb_no, nested.hawb_number).slice(
      0,
      AIR_BOOKING_FORM_LIMITS.hawb_number,
    ),
    pallet_count: pickStr(nested.pallet_count),
    dimensions: pickStr(nested.dimensions, nested.volume_cbm),
    weight: pickStr(nested.weight, nested.gross_weight_kg, nested.gross_weight),
    pallet_type: pickStr(first?.pallet_type),
    pallet_line_count: pickStr(first?.count) || '1',
    length_cm: pickStr(first?.length_cm),
    width_cm: pickStr(first?.width_cm),
    height_cm: pickStr(first?.height_cm),
    weight_kg: pickStr(first?.weight_kg),
  };
}

function formToSavedRow(form: MawbForm): SavedMawbRow | null {
  const hasAny = [
    form.flight_no,
    form.flight_status,
    form.mawb_no,
    form.hawb_no,
    form.pallet_count,
    form.dimensions,
    form.weight,
    form.pallet_type,
  ].some((v) => v.trim());
  if (!hasAny) return null;
  return {
    flight_no: form.flight_no.trim(),
    flight_status: form.flight_status.trim(),
    mawb_no: form.mawb_no.trim(),
    hawb_no: form.hawb_no.trim(),
    pallet_count: form.pallet_count.trim(),
    dimensions: form.dimensions.trim(),
    weight: form.weight.trim(),
    pallet_type: form.pallet_type.trim(),
  };
}

interface JobAirMawbPanelProps {
  jobId: string;
}

/**
 * AIR_EXPORT / AIR_IMPORT planned-container tab — MAWB payload instead of sea containers.
 * GET /jobs/:id/detail/planned_container · PUT /jobs/:id/detail/mawb
 */
export function JobAirMawbPanel({ jobId }: JobAirMawbPanelProps) {
  const tabQuery = useJobDetailTab(jobId, 'planned_container', true);
  const mutations = useJobSubresourceMutations(jobId);
  const palletTypeOptions = useMasterCodeOptions('air-pallet-types', true);
  const [form, setForm] = useState<MawbForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!tabQuery.data) return;
    setForm(payloadToForm(tabQuery.data as AirMawbPayload));
  }, [tabQuery.data]);

  const savedRow = useMemo(() => formToSavedRow(form), [form]);

  const setField = (key: keyof MawbForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setError(null);
    setMsg(null);
    try {
      const dto: UpdateAirMawbDto = {
        flight_no: clipAirField(form.flight_no, AIR_BOOKING_FORM_LIMITS.flight_number),
        flight_status: clipAirField(
          form.flight_status,
          AIR_BOOKING_FORM_LIMITS.flight_status,
        ),
        mawb_no: clipAirField(form.mawb_no, AIR_BOOKING_FORM_LIMITS.mawb_number),
        hawb_no: clipAirField(form.hawb_no, AIR_BOOKING_FORM_LIMITS.hawb_number),
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
        const count = Number(form.pallet_line_count || '1');
        const line: AirPalletLineDto = {
          pallet_type: palletType.slice(0, AIR_BOOKING_FORM_LIMITS.pallet_type),
          count: Number.isFinite(count) && count > 0 ? count : 1,
        };
        if (form.length_cm.trim()) line.length_cm = Number(form.length_cm);
        if (form.width_cm.trim()) line.width_cm = Number(form.width_cm);
        if (form.height_cm.trim()) line.height_cm = Number(form.height_cm);
        if (form.weight_kg.trim()) line.weight_kg = Number(form.weight_kg);
        dto.air_pallet = [line];
      }
      await mutations.updateAirMawb.mutateAsync(dto);
      setMsg('MAWB details saved.');
      await tabQuery.refetch();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-[#64748b]">
        Flight, MAWB / HAWB, and air pallet details for this job.
      </p>
      {error ? (
        <p className="text-sm text-[var(--color-danger-600)]">{error}</p>
      ) : null}
      {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
      {tabQuery.isError ? (
        <p className="text-sm text-[var(--color-danger-600)]">
          {getErrorMessage(tabQuery.error)}
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>MAWB / flight</CardTitle>
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
            label="Air pallet count"
            type="number"
            value={form.pallet_count}
            onChange={(e) => setField('pallet_count', e.target.value)}
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
          <label className="block space-y-1 text-xs font-medium text-[var(--color-neutral-600)]">
            Pallet type
            <span className="ml-1 font-normal text-[var(--color-neutral-400)]">
              (master list or type your own)
            </span>
            <Input
              className="mt-1"
              maxLength={AIR_BOOKING_FORM_LIMITS.pallet_type}
              list={AIR_PALLET_LIST_ID}
              value={form.pallet_type}
              onChange={(e) => setField('pallet_type', e.target.value)}
              placeholder="Select or type"
            />
          </label>
          <MasterCodeDatalist id={AIR_PALLET_LIST_ID} options={palletTypeOptions} />
          <Input
            label="Pallet line count"
            type="number"
            value={form.pallet_line_count}
            onChange={(e) => setField('pallet_line_count', e.target.value)}
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
          <Input
            label="Pallet weight kg"
            type="number"
            value={form.weight_kg}
            onChange={(e) => setField('weight_kg', e.target.value)}
          />
          <div className="sm:col-span-2 lg:col-span-3">
            <Button
              type="button"
              disabled={mutations.updateAirMawb.isPending || tabQuery.isLoading}
              onClick={() => void save()}
            >
              {mutations.updateAirMawb.isPending ? 'Saving…' : 'Save MAWB'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved MAWB / flight</CardTitle>
        </CardHeader>
        <div className="px-4 pb-4 text-sm">
          {!savedRow ? (
            <p className="text-[var(--color-neutral-400)]">No MAWB / flight details yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-neutral-100)]">
              <li className="flex flex-wrap items-start justify-between gap-2 py-2">
                <div>
                  <p className="font-medium">
                    {savedRow.mawb_no
                      ? `MAWB ${savedRow.mawb_no}`
                      : savedRow.hawb_no
                        ? `HAWB ${savedRow.hawb_no}`
                        : 'Flight / MAWB'}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    Flight: {savedRow.flight_no || '—'}
                    {savedRow.flight_status ? ` · ${savedRow.flight_status}` : ''}
                    {savedRow.hawb_no && savedRow.mawb_no
                      ? ` · HAWB ${savedRow.hawb_no}`
                      : ''}
                  </p>
                  <p className="text-xs text-[var(--color-neutral-500)]">
                    Pallets: {savedRow.pallet_count || '—'}
                    {savedRow.pallet_type ? ` · ${savedRow.pallet_type}` : ''}
                    {savedRow.weight ? ` · ${savedRow.weight} kg` : ''}
                    {savedRow.dimensions ? ` · ${savedRow.dimensions} CBM` : ''}
                  </p>
                </div>
              </li>
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
