/**
 * Phase 1 branding contract for Freightnest report PDFs.
 *
 * Authoritative company identity: registered organization profile
 * (`resolveReportCompanyBranding` / GET /organization/profile).
 *
 * Never inject Fresa Technologies logos, trade names, or letterhead.
 * Sample PDF URLs may be Fresa-hosted references for layout comparison only —
 * they are not branding sources.
 */

export const REPORT_BRANDING_SOURCE = 'organization_profile' as const;

export const REPORT_BRANDING_RULES = {
  source: REPORT_BRANDING_SOURCE,
  allowFresaIdentity: false,
  allowHardcodedCompanyLetterhead: false,
  resolverModule: 'src/features/reports/utils/resolveReportCompanyBranding.ts',
} as const;
