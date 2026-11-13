import type { PatchShowAllDto } from '@/features/jobs/types/job.types';

/** Sea / NVOCC-only show_all keys (rejected on air PATCH when real values). */
export const SHOW_ALL_SEA_KEYS = [
  'mbl_number',
  'hbl_number',
  'bl_number',
  'rotation_number',
  'container_number',
  'container_status',
  'vessel_name',
  'vessel_number',
  'voyage_number',
  'line_code',
  'line_no',
] as const satisfies readonly (keyof PatchShowAllDto)[];

/**
 * Air / MAWB-only show_all keys for PATCH.
 * Shared aliases (shipment_date, weight, dimensions) stay out — BE maps them
 * for sea/shipments without tripping the air-only gate.
 */
export const SHOW_ALL_AIR_KEYS = [
  'airline_name',
  'flight_no',
  'flight_number',
  'arrival_flight_number',
  'flight_status',
  'flight_date',
  'mawb_no',
  'mawb_number',
  'hawb_no',
  'hawb_number',
  'pallet_count',
  'air_pallet',
  'mawb',
] as const satisfies readonly (keyof PatchShowAllDto)[];

/**
 * Extra keys hidden on sea edit UI (still allowed on the wire as shared aliases).
 * Sea editors use job_date / gross_weight / volume_cbm instead.
 */
const SHOW_ALL_AIR_UI_EXTRA = [
  'shipment_date',
  'weight',
  'dimensions',
] as const satisfies readonly (keyof PatchShowAllDto)[];

export type ShowAllTransportEditMode = 'air' | 'sea' | 'all';

function isEmptyPatchValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

export function showAllFieldAllowed(
  key: keyof PatchShowAllDto,
  mode: ShowAllTransportEditMode,
): boolean {
  if (mode === 'all') return true;
  if (mode === 'air') {
    return !(SHOW_ALL_SEA_KEYS as readonly string[]).includes(key);
  }
  return !(
    (SHOW_ALL_AIR_KEYS as readonly string[]).includes(key) ||
    (SHOW_ALL_AIR_UI_EXTRA as readonly string[]).includes(key)
  );
}

/**
 * Strip opposite-mode fields the mode must not PATCH.
 * Empty null/"" echoes are dropped (BE ignores them; FE should not send).
 * Shared aliases like shipment_date are kept on sea payloads.
 */
export function filterShowAllPayloadForTransport(
  dto: PatchShowAllDto,
  mode: ShowAllTransportEditMode,
): PatchShowAllDto {
  const out: PatchShowAllDto = { ...dto };
  if (mode === 'all') {
    for (const key of [
      ...(SHOW_ALL_SEA_KEYS as readonly (keyof PatchShowAllDto)[]),
      ...(SHOW_ALL_AIR_KEYS as readonly (keyof PatchShowAllDto)[]),
    ]) {
      if (isEmptyPatchValue(out[key])) delete out[key];
    }
    return out;
  }
  const ban =
    mode === 'air'
      ? (SHOW_ALL_SEA_KEYS as readonly (keyof PatchShowAllDto)[])
      : (SHOW_ALL_AIR_KEYS as readonly (keyof PatchShowAllDto)[]);
  for (const key of ban) {
    delete out[key];
  }
  return out;
}
