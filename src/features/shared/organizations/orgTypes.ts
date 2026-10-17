/**
 * AddJobOrganizationDto.org_type — also used by POST /shipments/:id/organizations.
 * Includes Vendor (PartyType / org role VENDOR).
 */
export const JOB_ORG_TYPES = [
  'CLIENT',
  'SHIPPER',
  'CONSIGNEE',
  'NOTIFY',
  'BILLING_PARTY',
  'AGENT',
  'OVERSEAS_AGENT',
  'VENDOR',
] as const;

export type JobOrgType = (typeof JOB_ORG_TYPES)[number];

/** Client-reference / party_role options (includes Vendor). */
export const JOB_PARTY_ROLES = [
  'CLIENT',
  'SHIPPER',
  'CONSIGNEE',
  'NOTIFY',
  'BILLING_PARTY',
  'AGENT',
  'OVERSEAS_AGENT',
  'VENDOR',
] as const;

export type JobPartyRole = (typeof JOB_PARTY_ROLES)[number];
