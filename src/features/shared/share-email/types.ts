/**
 * Part 7 share body (staff → customer/vendor and vendor → admin).
 * Omit `to` so the API can resolve party / portal / vendor / admin inboxes.
 */
export interface ShareEmailDto {
  to?: string[];
  cc?: string[];
  message?: string;
  include_pdf?: boolean;
}

export interface ShareEmailResult {
  success: boolean;
  pdf_attached?: boolean;
  message?: string;
  raw?: unknown;
}

export interface ShareEmailFormValues {
  /** One email per line (or comma/semicolon separated). Leave empty to use API defaults. */
  to_text: string;
  cc_text: string;
  message: string;
  include_pdf: boolean;
}
