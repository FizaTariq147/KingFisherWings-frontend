import { describe, expect, it } from 'vitest';
import { buildHblJasperHtmlPilot } from './HBL_DRAFT_REPORT_FORMAT_JASPER/buildHtml';
import { buildInvoiceIndiaHtmlPilot } from './INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/buildHtml';
import { buildJobListSummaryHtmlPilot } from './JOB_LIST_SUMMARY_REPORT_FORMAT/buildHtml';

describe('HTML pilot buildHtml smoke', () => {
  it('builds HBL Jasper HTML without Fresa identity and escapes values', () => {
    const html = buildHblJasperHtmlPilot({
      entityBound: true,
      companyName: 'KingFisher Wings Logistics',
      companyAddress: 'Dubai',
      shipperLines: ['<ACME>', 'CHENNAI'],
      consigneeLines: ['BETA'],
      hblNo: 'HBL-1',
      jobNumber: 'JOB-1',
    });
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('KingFisher Wings Logistics');
    expect(html).toContain('&lt;ACME&gt;');
    expect(html).not.toMatch(/fresa/i);
  });

  it('builds invoice HTML with blank optional fields', () => {
    const html = buildInvoiceIndiaHtmlPilot({
      entityBound: true,
      companyName: 'KingFisher Wings Logistics',
      invoiceNumber: 'INV/26/00001',
      lines: [{ description: 'Freight', qty: '1', rate: '100.00', amount: '100.00' }],
      subtotal: '100.00',
      tax: '',
      total: '100.00',
    });
    expect(html).toContain('Tax Invoice');
    expect(html).toContain('INV/26/00001');
    expect(html).toContain('Freight');
    expect(html).not.toMatch(/fresa/i);
  });

  it('builds job list HTML with table rows', () => {
    const html = buildJobListSummaryHtmlPilot({
      entityBound: true,
      companyName: 'KingFisher Wings Logistics',
      tableHeaders: ['Job', 'Customer', 'POL', 'POD', 'ETD', 'Status'],
      tableRows: [
        ['JOB-1', 'Acme', 'INMAA', 'AEDXB', '2026-02-01', 'Open'],
        ['JOB-2', 'Beta', 'INMAA', 'AESHJ', '', ''],
      ],
    });
    expect(html).toContain('Job List Summary');
    expect(html).toContain('JOB-1');
    expect(html).toContain('297mm');
    expect(html).not.toMatch(/fresa/i);
  });

  it('refuses Fresa organization identity', () => {
    expect(() =>
      buildInvoiceIndiaHtmlPilot({ companyName: 'Fresa Technologies' }),
    ).toThrow(/Fresa/i);
  });
});
