import { invoiceService } from '@/features/invoices/services/invoice.service';
import { jobService } from '@/features/jobs/services/job.service';
import { organizationService } from '@/features/organization/services/organization.service';
import type { OrganizationProfile } from '@/features/organization/types/organization.types';
import { fetchOrganizationLogoBytes } from '@/features/organization/utils/embedOrganizationPdfLogo';
import { partyService } from '@/features/parties/services/party.service';
import { isUuid } from '@/lib/isUuid';
import { renderInvoiceV2InBrowser } from '../engine/invoiceV2Gate';

export type ReportsV2Ids = {
  invoiceId?: string;
  jobId?: string;
  partyId?: string;
};

export type ReportsV2Source = {
  invoice: Awaited<ReturnType<typeof invoiceService.getById>> | null;
  job: Awaited<ReturnType<typeof jobService.getById>> | null;
  party: Awaited<ReturnType<typeof partyService.getById>> | null;
  organization: OrganizationProfile | null;
  logoBase64?: string;
};

export function hasReportsV2Record(ids: ReportsV2Ids): boolean {
  return [ids.invoiceId, ids.jobId, ids.partyId].some((id) => Boolean(id && isUuid(id)));
}

async function logoAsBase64(organization: OrganizationProfile | null): Promise<string | undefined> {
  const profile = organization as { logo_url?: string; logoUrl?: string } | null;
  const bytes = await fetchOrganizationLogoBytes(profile?.logo_url || profile?.logoUrl || null);
  if (!bytes) return undefined;
  const view = new Uint8Array(bytes);
  let binary = '';
  for (let index = 0; index < view.length; index += 0x8000) {
    binary += String.fromCharCode(...view.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

/** Load the open record and the organization profile. A missing part stays null; nothing is invented. */
export async function loadReportsV2Source(ids: ReportsV2Ids): Promise<ReportsV2Source> {
  const invoice = ids.invoiceId && isUuid(ids.invoiceId) ? await invoiceService.getById(ids.invoiceId) : null;
  const jobId = ids.jobId || invoice?.job_id || '';
  const partyId = ids.partyId || invoice?.party_id || '';
  const [job, party, organization] = await Promise.all([
    jobId && isUuid(jobId) ? jobService.getById(jobId).catch(() => null) : null,
    partyId && isUuid(partyId) ? partyService.getById(partyId).catch(() => null) : null,
    organizationService.getProfile().catch(() => null),
  ]);
  const profile = organization as OrganizationProfile | null;
  return { invoice, job, party, organization: profile, logoBase64: await logoAsBase64(profile) };
}

export async function renderReportsV2(code: string, source: ReportsV2Source): Promise<Blob> {
  return renderInvoiceV2InBrowser({
    code,
    invoice: source.invoice,
    job: source.job,
    party: source.party,
    organization: source.organization,
    logoBase64: source.logoBase64,
  });
}
