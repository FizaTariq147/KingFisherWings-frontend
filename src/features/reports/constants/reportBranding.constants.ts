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

/**
 * Resolve registered organization logo URL for client layout PDFs.
 * Returns undefined when no org logo is registered — do not substitute a
 * product placeholder as if it were the tenant logo.
 */
export function resolveReportLogoUrl(tenantLogoUrl?: string | null): string | undefined {
  const fromTenant = String(tenantLogoUrl ?? '').trim();
  return fromTenant || undefined;
}

/** Product asset for non-report UI only — not a registered-company substitute. */
export function resolveProductFallbackLogoUrl(): string | undefined {
  return REPORT_BRANDING.defaultLogoUrl || undefined;
}
