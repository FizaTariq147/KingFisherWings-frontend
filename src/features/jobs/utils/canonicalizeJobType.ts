import { JOB_TYPES, type JobType } from '../constants/job.constants';

/** Normalize API / UI job_type tokens to canonical JobType enums. */
export function canonicalizeJobTypeToken(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

/**
 * Map API job_type aliases → canonical JobType.
 * Unknown values stay as-is when already a known enum; otherwise best-effort family map.
 */
export function canonicalizeJobType(value: unknown, fallback: JobType = 'AIR_EXPORT'): JobType {
  const raw = canonicalizeJobTypeToken(value);
  if (!raw) return fallback;
  if ((JOB_TYPES as readonly string[]).includes(raw)) return raw as JobType;

  const aliases: Record<string, JobType> = {
    AIR: 'AIR_EXPORT',
    AIR_EXP: 'AIR_EXPORT',
    AIR_IMP: 'AIR_IMPORT',
    NVOCC: 'NVOCC_EXPORT',
    NVOCC_EXP: 'NVOCC_EXPORT',
    NVOCC_IMP: 'NVOCC_IMPORT',
    SEA_EXPORT: 'SEA_FCL_EXPORT',
    SEA_IMPORT: 'SEA_FCL_IMPORT',
    SEA_FCL: 'SEA_FCL_EXPORT',
    SEA_LCL: 'SEA_LCL_EXPORT',
    FCL_EXPORT: 'SEA_FCL_EXPORT',
    FCL_IMPORT: 'SEA_FCL_IMPORT',
    LCL_EXPORT: 'SEA_LCL_EXPORT',
    LCL_IMPORT: 'SEA_LCL_IMPORT',
    ROAD: 'ROAD_FREIGHT',
    ROADFREIGHT: 'ROAD_FREIGHT',
    ROAD_TRANSPORT: 'ROAD_FREIGHT',
    TRUCK: 'ROAD_FREIGHT',
    TRUCKING: 'ROAD_FREIGHT',
  };
  if (aliases[raw]) return aliases[raw];

  if (raw.startsWith('AIR_')) {
    return raw.includes('IMP') ? 'AIR_IMPORT' : 'AIR_EXPORT';
  }
  if (raw.startsWith('NVOCC_')) {
    return raw.includes('IMP') ? 'NVOCC_IMPORT' : 'NVOCC_EXPORT';
  }
  if (raw.startsWith('ROAD')) return 'ROAD_FREIGHT';
  if (raw === 'LAND_FREIGHT' || raw === 'LAND_TRANSPORT') return 'LAND';

  return fallback;
}
