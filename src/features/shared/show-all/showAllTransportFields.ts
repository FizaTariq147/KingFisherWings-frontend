import type { PatchShowAllDto } from '@/features/jobs/types/job.types';

/** Sea / NVOCC-only show_all keys (rejected on air PATCH). */
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

/** Air-only show_all keys (rejected on sea/NVOCC PATCH). */
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
  'shipment_date',
  'pallet_count',
  'dimensions',
  'weight',
  'air_pallet',
  'mawb',
] as const satisfies readonly (keyof PatchShowAllDto)[];

export type ShowAllTransportEditMode = 'air' | 'sea' | 'all';

export function showAllFieldAllowed(
  key: keyof PatchShowAllDto,
  mode: ShowAllTransportEditMode,
): boolean {
  if (mode === 'all') return true;
  if (mode === 'air') {
    return !(SHOW_ALL_SEA_KEYS as readonly string[]).includes(key);
  }
  return !(SHOW_ALL_AIR_KEYS as readonly string[]).includes(key);
}

/** Strip transport fields the mode must not PATCH. */
export function filterShowAllPayloadForTransport(
  dto: PatchShowAllDto,
  mode: ShowAllTransportEditMode,
): PatchShowAllDto {
  if (mode === 'all') return dto;
  const out: PatchShowAllDto = { ...dto };
  const ban =
    mode === 'air'
      ? (SHOW_ALL_SEA_KEYS as readonly (keyof PatchShowAllDto)[])
      : (SHOW_ALL_AIR_KEYS as readonly (keyof PatchShowAllDto)[]);
  for (const key of ban) {
    delete out[key];
  }
  return out;
}
