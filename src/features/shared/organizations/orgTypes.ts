/**
 * Fallback AddJobOrganizationDto.org_type values when the organizations API
 * does not return an org-type catalog. Prefer `resolveOrgTypeOptions(...)`.
 * CLIENT (commercial client) and CUSTOMER (deal customer) are separate roles.
 */
export const JOB_ORG_TYPES = [
  'CLIENT',
  'CUSTOMER',
  'SHIPPER',
  'CONSIGNEE',
  'NOTIFY',
  'BILLING_PARTY',
  'AGENT',
  'OVERSEAS_AGENT',
  'VENDOR',
] as const;

export type JobOrgType = (typeof JOB_ORG_TYPES)[number];

/** Client-reference / party_role options — CLIENT ≠ CUSTOMER. */
export const JOB_PARTY_ROLES = [
  'CLIENT',
  'CUSTOMER',
  'SHIPPER',
  'CONSIGNEE',
  'NOTIFY',
  'BILLING_PARTY',
  'AGENT',
  'OVERSEAS_AGENT',
  'VENDOR',
] as const;

export type JobPartyRole = (typeof JOB_PARTY_ROLES)[number];
