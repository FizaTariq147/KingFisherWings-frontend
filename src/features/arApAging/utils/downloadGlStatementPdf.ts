import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { triggerBlobDownload } from '@/features/files/utils/triggerBlobDownload';
import { resolveInvoicePdfCompany } from '@/features/invoices/utils/resolveInvoicePdfCompany';
import { organizationService } from '@/features/organization/services/organization.service';
import { generateAccountStatementPdf } from '@/features/shared/account-statement/generateAccountStatementPdf';
import type { StatementReportResult } from '../types/arApAging.types';

export type GlStatementPdfKind = 'ar' | 'ap';

/**
 * Download a KingFisher-branded account-statement PDF from a loaded GL AR/AP statement.
 * Header/footer match invoice Generate PDF; ledger body stays landscape.
 */
export async function downloadGlStatementPdf(
  report: StatementReportResult,
  kind: GlStatementPdfKind,
  options?: { companyName?: string },
): Promise<void> {
  const asOf = report.as_of || new Date().toISOString().slice(0, 10);
  const partyLabel = kind === 'ar' ? 'Customer' : 'Vendor';
  const title = kind === 'ar' ? 'Customer Statement' : 'Vendor Statement';
  const subtitle =
    kind === 'ar'
      ? 'Invoices, receipts, and running balance'
      : 'Purchase invoices, payments, and running balance';

  const partyDisplay = (report.party_name || report.party_id || 'party').trim();
  const safeParty = partyDisplay
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 48);
  const filename = `${kind === 'ar' ? 'Customer' : 'Vendor'}-Statement-${safeParty}-${asOf}.pdf`;

  let profile = null;
  try {
    profile = await organizationService.getProfile();
  } catch {
    profile = null;
  }

  const blob = await generateAccountStatementPdf({
    title,
    subtitle: [subtitle, report.currency_code || null, `${report.lines.length} transaction(s)`]
      .filter(Boolean)
      .join(' · '),
    partyName: partyDisplay,
    partyLabel,
    asOf,
    currencyCode: report.currency_code,
    openingBalance: report.opening_balance,
    closingBalance: report.closing_balance,
    lines: report.lines.map((line) => ({
      date: line.date,
      type: line.type,
      reference: line.reference || line.document_number,
      description: line.description,
      debit: line.debit,
      credit: line.credit,
      balance: line.balance,
    })),
    company: resolveInvoicePdfCompany({
      profile,
      companyName: options?.companyName,
    }),
  });

  const typed = new Blob([await blob.arrayBuffer()], { type: 'application/pdf' });
  if (!(await blobLooksLikePdf(typed))) {
    throw new Error('Failed to generate statement PDF.');
  }

  // Self-contained KingFisher chrome — do not stamp a second header/footer.
  triggerBlobDownload(typed, filename);
}
