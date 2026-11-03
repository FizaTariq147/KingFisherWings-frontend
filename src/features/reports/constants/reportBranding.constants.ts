/**
 * KingFisher branding for Fresa-parity report packs.
 * Packs must inject KF / tenant logo — never Fresa logos from sample PDFs.
 *
 * Backend: resolve org profile logo (URL or base64) into every Puppeteer/Excel pack header.
 * Frontend: client layout fallback uses the same asset when enabled.
 */
import logoUrl from '@/assets/logo.png';

export const REPORT_BRANDING = {
  /** Product brand shown in header/footer chrome (not Fresa). */
  brandName: 'KingFisher Wings',
  /**
   * Catalogue samples use the same Fresa layout/colors/footer bars with this logo.
   * Dummy/demo field data comes from each format’s JSON `demo` (Fresa sample content).
   */
  sampleDataMode: 'fresa-dummy-with-kf-logo' as const,
  /** Default FE logo asset — packs should prefer tenant org logo when present. */
  defaultLogoUrl: typeof logoUrl === 'string' ? logoUrl : '',
  /** Branding keys expected on BE generate context / org profile. */
  orgFields: [
    'legal_name',
    'trade_name',
    'address',
    'phone',
    'email',
    'web',
    'tax_id',
    'vat_number',
    'gstin',
    'logo_url',
    'logo_base64',
  ] as const,
  /**
   * Layout JSON `branding.logo` token used in *FormatUiLayouts — always kingfisher.
   * Do not introduce fresa / third-party logo tokens.
   */
  layoutLogoToken: 'kingfisher' as const,
} as const;

/** Resolve logo URL for client layout PDFs (tenant/org → KF asset). */
export function resolveReportLogoUrl(tenantLogoUrl?: string | null): string | undefined {
  // Lazy import avoided — keep this module light; mirror branding resolver.
  const fromTenant = String(tenantLogoUrl ?? '').trim();
  if (fromTenant) return fromTenant;
  return REPORT_BRANDING.defaultLogoUrl || undefined;
}
