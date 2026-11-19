/**
 * Fixed classic Generate PDF fixtures. The guard rasters these bytes at 150 dpi.
 * This file is not part of the classic generator.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Quotation } from '@/features/quotations/types/quotation.types';
import { generateQuotationPdf } from '@/features/quotations/utils/generateQuotationPdf';
import type { Invoice } from '../types/invoice.types';
import { commercialNoteToPdfModel } from './commercialNoteToPdfModel';
import { generateInvoicePdf } from './generateInvoicePdf';
import { invoiceToPdfModel } from './invoiceToPdfModel';

const company = {
  name: 'Northwind Logistics',
  tagline: 'Freight',
  phone: '+97140000000',
  email: 'accounts@northwind.example',
  website: 'https://northwind.example',
};

const invoice = {
  id: 'inv-fixture-1',
  invoice_number: 'INV-1001',
  status: 'POSTED',
  party_id: 'party-1',
  party_name: 'Harbor Trading LLC',
  currency_code: 'AED',
  invoice_date: '2026-01-15',
  due_date: '2026-02-15',
  job_id: 'JOB-100',
  subtotal: 1000,
  tax_total: 50,
  total_amount: 1050,
  paid_amount: 0,
  outstanding_balance: 1050,
  lines: [
    {
      id: 'line-1',
      description: 'Ocean freight',
      quantity: 1,
      unit_price: 1000,
      line_total: 1000,
    },
  ],
} as Invoice;

describe('classic Generate PDF fixtures', () => {
  it('writes one PDF per document type', async () => {
    const dir = process.env.CLASSIC_FIXTURE_DIR;
    if (!dir) return;
    fs.mkdirSync(dir, { recursive: true });
    const invoiceBlob = await generateInvoicePdf(
      invoiceToPdfModel(invoice, { company, attn: 'Amina Hassan' }),
    );
    const quotationBlob = await generateQuotationPdf({
      quotation: {
        id: 'quo-fixture-1',
        quotation_number: 'QUO-1001',
        status: 'SENT',
        customer_name: 'Harbor Trading LLC',
        currency_code: 'AED',
        quotation_date: '2026-01-15',
        valid_until: '2026-02-15',
        job_type: 'SEA_FCL',
        subtotal: 800,
        tax_total: 40,
        total_amount: 840,
        lines: [
          {
            id: 'q1',
            description: 'FCL freight',
            quantity: 1,
            unit_price: 800,
            is_cost: false,
          },
        ],
      } as Quotation,
      company,
    });
    const note = {
      id: 'note-fixture-1',
      invoice_number: 'INV-1001',
      party_name: 'Harbor Trading LLC',
      currency_code: 'AED',
      invoice_date: '2026-01-20',
      due_date: '2026-02-20',
      subtotal: 100,
      tax_total: 5,
      total_amount: 105,
      lines: [{ description: 'Freight adjustment', quantity: 1, unit_price: 100, line_total: 100 }],
    };
    const creditBlob = await generateInvoicePdf(
      commercialNoteToPdfModel({ ...note, credit_note_number: 'CN-1001' }, 'credit', { company }),
    );
    const debitBlob = await generateInvoicePdf(
      commercialNoteToPdfModel({ ...note, debit_note_number: 'DN-1001' }, 'debit', { company }),
    );
    const files: Array<[string, Blob]> = [
      ['invoice.pdf', invoiceBlob],
      ['quotation.pdf', quotationBlob],
      ['credit-note.pdf', creditBlob],
      ['debit-note.pdf', debitBlob],
    ];
    for (const [name, blob] of files) {
      fs.writeFileSync(path.join(dir, name), Buffer.from(await blob.arrayBuffer()));
    }
    expect(files).toHaveLength(4);
  });
});
