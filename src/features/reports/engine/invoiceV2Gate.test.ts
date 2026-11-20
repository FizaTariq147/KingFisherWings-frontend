import { describe, expect, it } from 'vitest';
import { generateInvoicePdfChoice, generateWithFallback, INVOICE_V2_FALLBACK_NOTICE, shouldUseInvoiceV2 } from './invoiceV2Gate';
import { readDefaultPdfStyle } from './reportsEngine';
import type { Invoice } from '@/features/invoices/types/invoice.types';
import { valueForInvoiceBinding } from './invoiceReportContract';

describe('invoice v2 gate', () => {
  it('keeps Generate PDF on classic unless a company style code is set', () => {
    expect(shouldUseInvoiceV2({
      engine: 'v2',
      entry: 'generate',
      document: 'invoice',
      style: readDefaultPdfStyle({}),
    })).toBe(false);
    expect(shouldUseInvoiceV2({
      engine: 'v2',
      entry: 'formats',
      document: 'invoice',
      style: 'classic',
    })).toBe(true);
    expect(shouldUseInvoiceV2({
      engine: 'legacy',
      entry: 'reports',
      document: 'invoice',
      style: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    })).toBe(false);
  });

  it('does not route credit notes, debit notes, or quotations to v2', () => {
    for (const document of ['credit_note', 'debit_note', 'quotation'] as const) {
      expect(shouldUseInvoiceV2({
        engine: 'v2',
        entry: 'formats',
        document,
        style: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
      })).toBe(false);
    }
  });

  it('Generate PDF falls back to classic and shows a notice when the selected style throws', async () => {
    const style = 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE';
    let classicCalls = 0;
    const result = await generateInvoicePdfChoice({
      engine: 'v2',
      style,
      renderV2: async () => {
        throw new Error('forced v2 failure');
      },
      renderClassic: async () => {
        classicCalls += 1;
        return new Blob(['classic-pdf']);
      },
    });
    expect(classicCalls).toBe(1);
    expect(result.notice).toBe(INVOICE_V2_FALLBACK_NOTICE);
    expect(await result.blob.text()).toBe('classic-pdf');
    const skipped = await generateInvoicePdfChoice({
      engine: 'v2',
      style: 'classic',
      renderV2: async () => {
        throw new Error('must not run');
      },
      renderClassic: async () => new Blob(['still-classic']),
    });
    expect(skipped.notice).toBeNull();
    expect(await skipped.blob.text()).toBe('still-classic');
  });

  it('falls back to classic and returns a notice when v2 throws', async () => {
    const classic = new Blob(['classic-pdf']);
    let classicCalls = 0;
    const result = await generateWithFallback({
      attemptV2: true,
      renderV2: async () => {
        throw new Error('missing charge field');
      },
      renderClassic: async () => {
        classicCalls += 1;
        return classic;
      },
    });
    expect(classicCalls).toBe(1);
    expect(result.notice).toBe('Showing the classic invoice. The selected format could not be built.');
    expect(await result.blob.text()).toBe('classic-pdf');
  });

  it('leaves a missing notify party and net weight blank', () => {
    const sources = {
      invoice: {
        id: '1',
        status: 'POSTED' as const,
        party_id: 'p',
        party_name: 'Harbor Trading LLC',
        currency_code: 'USD',
        invoice_number: 'INV-9',
        subtotal: 10,
        tax_total: 0,
        total_amount: 10,
      } as Invoice,
      organization: {
        name: 'Northwind Logistics',
        display_name: 'Northwind',
        address: '1 Dock Road',
        city: 'Dubai',
        country_code: 'AE',
        phone: '+97140000000',
        email: 'accounts@northwind.example',
        website: 'https://northwind.example',
        logo_url: '',
      },
    };
    expect(valueForInvoiceBinding('company.name', sources)).toBe('Northwind');
    expect(valueForInvoiceBinding('party.notify', sources)).toBe('');
    expect(valueForInvoiceBinding('cargo.netWeight', sources)).toBe('');
    expect(valueForInvoiceBinding('invoice.number', sources)).toBe('INV-9');
    expect(valueForInvoiceBinding('company.name', sources)).not.toMatch(/fresa/i);
  });
});
