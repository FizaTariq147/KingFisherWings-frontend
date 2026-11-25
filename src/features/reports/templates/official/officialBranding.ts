import { REPORT_BRANDING_RULES } from '../../engines/pdf/documentBrandingContract';

const FRESA_IDENTITY = /fresa|fresatechnologies\.com/i;
/** Sample placeholders that must not ship; swap for org company when drawing. */
const SAMPLE_COMPANY_PLACEHOLDER = /\byour company name\b|fresa\s*demo\b/i;

/** Drop sample letterhead identity. Geometry and field labels stay. */
export function isFresaIdentityText(value: string): boolean {
  return FRESA_IDENTITY.test(value || '');
}

/** True when the span is a Fresa/demo company placeholder (bank beneficiary, etc.). */
export function isSampleCompanyPlaceholder(value: string): boolean {
  return SAMPLE_COMPANY_PLACEHOLDER.test(value || '');
}

/** Swap demo company placeholders inside a label (e.g. Beneficiary Name: YOUR COMPANY NAME). */
export function replaceSampleCompanyPlaceholder(
  value: string,
  companyName: string | undefined,
): string {
  if (!isSampleCompanyPlaceholder(value)) return value;
  return value.replace(SAMPLE_COMPANY_PLACEHOLDER, officialCompanyName(companyName));
}

export function assertNoFresaIdentity(values: string[], context: string): void {
  if (REPORT_BRANDING_RULES.allowFresaIdentity) {
    throw new Error('Official faces require allowFresaIdentity to stay false');
  }
  for (const value of values) {
    if (isFresaIdentityText(value)) {
      throw new Error(`${context} still contains Fresa identity: ${value.slice(0, 80)}`);
    }
  }
}

export function officialCompanyName(name: string | undefined): string {
  const trimmed = (name || '').trim();
  if (!trimmed || isFresaIdentityText(trimmed)) return 'Company';
  return trimmed;
}
