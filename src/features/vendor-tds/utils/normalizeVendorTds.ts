import { asRecord, pickString, unwrapData } from '@/features/vendor-shared/normalize';
import type { VendorTdsResult } from '../types/vendorTds.types';

export function normalizeTds(raw: unknown): VendorTdsResult {
  const d = asRecord(unwrapData(raw)) ?? asRecord(raw) ?? {};
  const available = d.available === true;
  return {
    available,
    phase: pickString(d.phase) || (available ? undefined : 'india_phase_3'),
    message: pickString(d.message) || undefined,
  };
}
