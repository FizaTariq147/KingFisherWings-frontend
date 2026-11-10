import { isUuid } from '@/lib/isUuid';
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

/**
 * Prefer Parties-tab organization over job FK labels.
 * job.shipper_id is often the commercial client, not the SHIPPER org.
 */
export function resolveOrgPartyDisplay(
  org: JobOrgPartyRef | null | undefined,
  fallbackLabel?: string | null,
  fallbackPartyId?: string | null,
): { label: string; partyId?: string; href?: string } {
  const orgLabel = org?.label && org.label !== '—' ? org.label : '';
  const fb =
    fallbackLabel && fallbackLabel.trim() && fallbackLabel.trim() !== '—'
      ? fallbackLabel.trim()
      : '';
  const partyId =
    (org?.partyId && isUuid(org.partyId) ? org.partyId : undefined) ||
    (fallbackPartyId && isUuid(fallbackPartyId) ? fallbackPartyId : undefined);
  const label = orgLabel || fb || '—';
  return {
    label,
    partyId,
    href: partyId ? `/parties/${partyId}` : undefined,
  };
}
