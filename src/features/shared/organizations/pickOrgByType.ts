import {
  normalizeOrganizationRows,
  orgPartyLabel,
} from './orgDisplay';

export type JobOrgPartyRef = {
  orgType: string;
  partyId?: string;
  label: string;
};

/** Find a job/shipment organization row by org_type (CLIENT, SHIPPER, BILLING_PARTY, …). */
export function pickOrgByType(
  raw: unknown,
  orgType: string,
): JobOrgPartyRef | null {
  const want = orgType.trim().toUpperCase();
  if (!want) return null;
  for (const row of normalizeOrganizationRows(raw)) {
    const info = orgPartyLabel(row);
    if (info.orgType.trim().toUpperCase() !== want) continue;
    return {
      orgType: info.orgType,
      partyId: info.partyId && info.partyId !== '—' ? info.partyId : undefined,
      label: info.primary !== '—' ? info.primary : info.name || info.code || '—',
    };
  }
  return null;
}
