import { isAirwayBillJobType } from './jobDetailTabs';

export type JobTransportMode = 'AIR' | 'SEA' | 'OTHER';

type TransportFlagsSource = {
  job_type?: string | null;
  service_type?: string | null;
  transport_mode?: string | null;
  actions?: {
    can_edit_air_fields?: boolean;
    can_edit_sea_fields?: boolean;
  } | null;
};

function rawTransportMode(
  source: TransportFlagsSource | null | undefined,
): string {
  return String(
    source?.transport_mode ||
      source?.actions &&
        (source.actions as { transport_mode?: string }).transport_mode ||
      '',
  )
    .trim()
    .toUpperCase();
}

/** Prefer BE `transport_mode`, else infer from job_type. */
export function resolveJobTransportMode(
  source: TransportFlagsSource | null | undefined,
): JobTransportMode {
  const mode = rawTransportMode(source);
  if (mode === 'AIR' || mode.startsWith('AIR')) return 'AIR';
  if (mode === 'SEA' || mode.startsWith('SEA') || mode.includes('NVOCC')) {
    return 'SEA';
  }
  const jt = String(source?.job_type || source?.service_type || '')
    .trim()
    .toUpperCase();
  if (isAirwayBillJobType(jt)) return 'AIR';
  if (jt.includes('SEA') || jt.includes('NVOCC')) return 'SEA';
  return 'OTHER';
}

/** Show All / MAWB — air fields editable when BE says so, else air job types. */
export function canEditAirFields(
  source: TransportFlagsSource | null | undefined,
): boolean {
  if (typeof source?.actions?.can_edit_air_fields === 'boolean') {
    return source.actions.can_edit_air_fields;
  }
  return resolveJobTransportMode(source) === 'AIR';
}

/** Show All / containers — sea fields editable when BE says so, else sea/NVOCC. */
export function canEditSeaFields(
  source: TransportFlagsSource | null | undefined,
): boolean {
  if (typeof source?.actions?.can_edit_sea_fields === 'boolean') {
    return source.actions.can_edit_sea_fields;
  }
  return resolveJobTransportMode(source) === 'SEA';
}
