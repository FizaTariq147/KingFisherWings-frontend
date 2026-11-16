import { REPORT_BRANDING_RULES } from '../../engines/pdf/documentBrandingContract';

const FRESA_IDENTITY = /fresa|fresatechnologies\.com/i;

/** Drop sample letterhead identity. Geometry and field labels stay. */
export function isFresaIdentityText(value: string): boolean {
  return FRESA_IDENTITY.test(value || '');
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
