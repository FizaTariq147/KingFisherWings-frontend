/**
 * Writes classic Generate PDF bytes for the live invoices used by the v2 sheets.
 * Skips unless LIVE_INVOICE_DIR is set. Does not change the generator.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateInvoicePdf } from '@/features/invoices/utils/generateInvoicePdf';
import { invoiceToPdfModel } from '@/features/invoices/utils/invoiceToPdfModel';
import type { Invoice } from '@/features/invoices/types/invoice.types';
import type { Job } from '@/features/jobs/types/job.types';
import type { Party } from '@/features/parties/types/party.types';

describe('classic invoices for v2 comparison', () => {
  it('writes one classic PDF per live invoice', async () => {
    const dir = process.env.LIVE_INVOICE_DIR;
    if (!dir) return;
    const fileName = fs.existsSync(path.join(dir, 'batch-live.json')) ? 'batch-live.json' : 'live.json';
    const live = JSON.parse(fs.readFileSync(path.join(dir, fileName), 'utf8')) as {
      organization?: { display_name?: string; name?: string; phone?: string; email?: string; website?: string; logo_url?: string };
      invoices: Array<{ id: string; invoice: Invoice; job?: Job | null; party?: Party | null }>;
    };
    const org = live.organization || {};
    const company = {
      name: org.display_name || org.name,
      phone: org.phone,
      email: org.email,
      website: org.website,
      logoUrl: org.logo_url,
    };
    fs.mkdirSync(path.join(dir, 'classic'), { recursive: true });
    for (const row of live.invoices) {
      const blob = await generateInvoicePdf(
        invoiceToPdfModel(row.invoice, { party: row.party, job: row.job, company }),
      );
      fs.writeFileSync(path.join(dir, 'classic', `${row.id}.pdf`), Buffer.from(await blob.arrayBuffer()));
    }
    expect(live.invoices.length).toBeGreaterThan(0);
  }, 120000);
});
