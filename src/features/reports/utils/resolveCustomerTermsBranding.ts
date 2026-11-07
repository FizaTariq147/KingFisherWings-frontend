import {
  resolveReportOrgChrome,
  type ReportOrgChrome,
} from './resolveReportOrgChrome';

export type CustomerTermsBranding = {
  /** Same asset Page 1 report layouts use (org logo_url or KF default). */
  logoUrl: string;
  /** Company name for the T&C footer — from organization profile when available. */
  companyName: string;
};

/**
 * Org display name + logo for shared report chrome (headers/footers).
 * Appended BL/Airway Terms PDFs are copied as-is and do not use this branding.
 * Prefer `resolveReportOrgChrome()` for full address/phone/email chrome.
 */
export async function resolveCustomerTermsBranding(): Promise<CustomerTermsBranding> {
  const chrome: ReportOrgChrome = await resolveReportOrgChrome();
  return {
    logoUrl: chrome.logoUrl,
    companyName: chrome.company,
  };
}
