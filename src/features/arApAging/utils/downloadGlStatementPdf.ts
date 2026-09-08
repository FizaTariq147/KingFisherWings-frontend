import { blobLooksLikePdf } from '@/features/files/utils/blobLooksLikePdf';
import { statementPdfBranding } from '@/features/files/utils/pdfBranding';
import { triggerBrandedPdfDownload } from '@/features/files/utils/triggerBlobDownload';
import { generateAccountStatementPdf } from '@/features/shared/account-statement/generateAccountStatementPdf';
import type { StatementReportResult } from '../types/arApAging.types';

export type GlStatementPdfKind = 'ar' | 'ap';

/**
 * Download a branded account-statement PDF from a loaded GL AR/AP statement report.
 * Matches the on-screen StatementTable columns (date, type, reference, description, debit/credit/balance).
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
  // Keep branding header/footer labels short to avoid collisions with logo/company text.
  const reference = `${kind === 'ar' ? 'AR' : 'AP'}-STMT-${safeParty}-${asOf}`;
  const filename = `${kind === 'ar' ? 'Customer' : 'Vendor'}-Statement-${safeParty}-${asOf}.pdf`;

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
  });

  const typed = new Blob([await blob.arrayBuffer()], { type: 'application/pdf' });
  if (!(await blobLooksLikePdf(typed))) {
    throw new Error('Failed to generate statement PDF.');
  }

  await triggerBrandedPdfDownload(typed, filename, {
    filename,
    branding: statementPdfBranding(reference, asOf, {
      companyName: options?.companyName,
    }),
  });
}
