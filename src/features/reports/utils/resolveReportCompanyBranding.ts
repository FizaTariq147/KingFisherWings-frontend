/**
 * Centralized report company branding resolver.
 * Authoritative source: GET /organization/profile (tenant org registration).
 * Do not invent endpoints or hardcode company identity.
 */
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import {
  chromeFromOrganizationProfile,
  resolveReportOrgChrome,
  type ReportOrgChrome,
} from './resolveReportOrgChrome';
import type { InvoiceFormatPdfData } from './invoiceFormatToInvoicePdfModel';

export type ReportCompanyBranding = {
  companyName: string;
  companyAddress: string;
  companyWeb: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  profileLoaded: boolean;
  legalName: string;
  tradeName: string;
  vatNumber: string;
};

export function reportOrgChromeToBranding(chrome: ReportOrgChrome): ReportCompanyBranding {
  return {
    companyName: chrome.company || '',
    companyAddress: chrome.address || '',
    companyWeb: chrome.web || '',
    companyPhone: chrome.phone || '',
    companyEmail: chrome.email || '',
    logoUrl: chrome.logoUrl || '',
    profileLoaded: chrome.profileLoaded,
    legalName: chrome.packFields.legal_name || chrome.company || '',
    tradeName: chrome.packFields.trade_name || chrome.company || '',
    vatNumber: chrome.packFields.vat_number || chrome.packFields.tax_id || '',
  };
}

/** Sync resolve from an already-loaded organization profile (React Query). */
export function resolveReportCompanyBrandingFromProfile(
  profile: OrganizationProfile | null | undefined,
): ReportCompanyBranding {
  return reportOrgChromeToBranding(chromeFromOrganizationProfile(profile ?? null));
}

/** Async resolve for PDF capture / Generate (no React Query). */
export async function resolveReportCompanyBranding(): Promise<ReportCompanyBranding> {
  const chrome = await resolveReportOrgChrome();
  return reportOrgChromeToBranding(chrome);
}

/** Merge branding onto catalogue PDF data without inventing fields. */
export function applyReportCompanyBrandingToPdfData(
  data: InvoiceFormatPdfData,
  branding: ReportCompanyBranding,
): InvoiceFormatPdfData {
  return {
    ...data,
    companyName: data.companyName || branding.companyName,
    companyAddress: data.companyAddress || branding.companyAddress,
    companyWeb: data.companyWeb || branding.companyWeb,
    companyPhone: data.companyPhone || branding.companyPhone,
    companyEmail: data.companyEmail || branding.companyEmail,
    logoUrl: data.logoUrl || branding.logoUrl,
  };
}
