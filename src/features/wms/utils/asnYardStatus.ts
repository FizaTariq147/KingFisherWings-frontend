/** Shared ASN yard status helpers — matches backend DRAFT→…→UNLOADED flow. */

export const ASN_YARD_STEPS = [
  'DRAFT',
  'CONFIRMED',
  'PICKED',
  'UNLOADING',
  'UNLOADED',
] as const;

export type AsnYardStep = (typeof ASN_YARD_STEPS)[number];

export function normalizeAsnStatus(status?: string | null): string {
  return String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
}

/** Map API status to yard step index (-1 if cancelled / unknown). */
export function asnYardStepIndex(status?: string | null): number {
  const key = normalizeAsnStatus(status);
  if (key === 'CANCELLED' || key === 'CANCELED') return -2;
  // Legacy manual GRN post
  if (key === 'RECEIVED') return ASN_YARD_STEPS.indexOf('UNLOADED');
  const idx = ASN_YARD_STEPS.indexOf(key as AsnYardStep);
  return idx;
}

export function asnHasPartyAndJob(doc?: {
  party_id?: string | null;
  job_id?: string | null;
} | null): boolean {
  const party = String(doc?.party_id ?? '').trim();
  const job = String(doc?.job_id ?? '').trim();
  return Boolean(party) && Boolean(job);
}
