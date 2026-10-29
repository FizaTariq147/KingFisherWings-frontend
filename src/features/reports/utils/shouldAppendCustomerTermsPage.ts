import { resolveCustomerTermsKind } from './resolveCustomerTermsKind';

export type AppendCustomerTermsOptions = {
  /**
   * Explicit override from the generate call (highest priority).
   * Used by validation harnesses and callers that need layout-only PDFs.
   */
  override?: boolean;
  /**
   * @deprecated Ignored — T&C append is only driven by BL / airway bill codes.
   */
  layoutFlag?: boolean;
};

/**
 * Append Terms & Conditions only for Bill of Lading (BL) and Airway Bill (HAWB/MAWB/AWB).
 * All other report families (invoice, ASN, DO, finance, etc.) never get T&C pages.
 *
 * Priority:
 * 1. `options.override` when boolean
 * 2. code resolves to BL or airway bill via `resolveCustomerTermsKind`
 */
export function shouldAppendCustomerTermsPage(
  code: string,
  options: AppendCustomerTermsOptions = {},
): boolean {
  if (typeof options.override === 'boolean') return options.override;
  return resolveCustomerTermsKind(code) !== null;
}
