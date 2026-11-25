/**
 * One-shot classic Generate PDF renders for flow-spike real compares.
 * Runs only when FLOW_REAL_CLASSIC_DIR is set. Not part of classic-guard fixtures.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Quotation } from '@/features/quotations/types/quotation.types';
import { generateQuotationPdf } from '@/features/quotations/utils/generateQuotationPdf';
import { commercialNoteToPdfModel } from '@/features/invoices/utils/commercialNoteToPdfModel';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';

type LivePayload = {
  organization?: Record<string, unknown>;
  quotations?: Array<{ id: string; quotation: Quotation; party?: Record<string, unknown> | null }>;
  creditNotes?: Array<{
    id: string;
    creditNote: Record<string, unknown>;
    party?: Record<string, unknown> | null;
    job?: Record<string, unknown> | null;
  }>;
  debitNotes?: Array<{
    id: string;
    debitNote: Record<string, unknown>;
    party?: Record<string, unknown> | null;
    job?: Record<string, unknown> | null;
  }>;
};

function companyFromOrg(org: Record<string, unknown> | undefined) {
  if (!org) return undefined;
  return {
    name: String(org.display_name || org.name || ''),
    tagline: 'FREIGHT - LOGISTICS - GENERAL TRADING',
    phone: org.phone ? String(org.phone) : undefined,
    email: org.email ? String(org.email) : undefined,
    website: org.website ? String(org.website) : undefined,
    addressLines: [org.address, [org.city, org.country_code].filter(Boolean).join(', ')].filter(Boolean).map(String),
    logoUrl: org.logo_url ? String(org.logo_url) : undefined,
  };
}

describe('flow real classic Generate PDF', () => {
  it('writes classic PDFs for each live/synthetic record', async () => {
    const dir = process.env.FLOW_REAL_CLASSIC_DIR;
    const livePath = process.env.FLOW_REAL_LIVE_JSON;
    if (!dir || !livePath) return;
    const live = JSON.parse(fs.readFileSync(livePath, 'utf8')) as LivePayload;
    const company = companyFromOrg(live.organization);
    fs.mkdirSync(path.join(dir, 'quotation'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'credit-note'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'debit-note'), { recursive: true });

    for (const row of live.quotations || []) {
      const quotation = {
        ...row.quotation,
        customer_name:
          row.quotation.customer_name ||
          (row.party?.name as string | undefined) ||
          undefined,
      } as Quotation;
      const blob = await generateQuotationPdf({ quotation, company });
      fs.writeFileSync(
        path.join(dir, 'quotation', `${row.id}.pdf`),
        Buffer.from(await blob.arrayBuffer()),
      );
    }

    for (const row of live.creditNotes || []) {
      const blob = await generateInvoicePdf(
        commercialNoteToPdfModel(row.creditNote as never, 'credit', {
          company,
          party: row.party as never,
          job: row.job as never,
        }),
      );
      fs.writeFileSync(
        path.join(dir, 'credit-note', `${row.id}.pdf`),
        Buffer.from(await blob.arrayBuffer()),
      );
    }

    for (const row of live.debitNotes || []) {
      const blob = await generateInvoicePdf(
        commercialNoteToPdfModel(row.debitNote as never, 'debit', {
          company,
          party: row.party as never,
          job: row.job as never,
        }),
      );
      fs.writeFileSync(
        path.join(dir, 'debit-note', `${row.id}.pdf`),
        Buffer.from(await blob.arrayBuffer()),
      );
    }

    expect((live.quotations || []).length + (live.creditNotes || []).length + (live.debitNotes || []).length).toBeGreaterThan(0);
  });
});
