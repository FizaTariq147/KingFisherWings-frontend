import { describe, expect, it } from 'vitest';
import { buildHtmlPilotPreviewBody, mapHtmlPilotPayload, overlayHtmlPilotPayload } from './htmlPilotPayload';

describe('html pilot preview payload', () => {
  it('drops company and tenant ids from the preview body', () => {
    const body = buildHtmlPilotPreviewBody(
      { invoice_id: 'inv-1', job_id: 'job-1' },
      { companyId: 'secret', company_id: 'secret', status: 'open', empty: '' },
    );
    expect(body).toEqual({
      context: { invoice_id: 'inv-1', job_id: 'job-1' },
      parameters: { status: 'open' },
    });
    expect(JSON.stringify(body)).not.toMatch(/company/i);
  });

  it('maps invoice lines and totals and leaves the GST split blank', () => {
    const data = mapHtmlPilotPayload({
      payload: {
        header: {
          invoice_number: 'INV/26/1',
          invoice_date: '2026-11-24',
          currency_code: 'INR',
        },
        lines: [
          { description: 'Freight', quantity: '1', unit_price: '100', line_total: '100', tax_amount: '18' },
        ],
        totals: { subtotal: '100', tax_total: '18', total_amount: '118', sgst: '9', cgst: '9' },
      },
    });
    expect(data?.invoiceNumber).toBe('INV/26/1');
    expect(data?.lines?.[0]).toMatchObject({
      description: 'Freight',
      qty: '1',
      rate: '100',
      amount: '100',
      taxAmount: '18',
    });
    expect(data?.tax).toBe('18');
    expect(data?.total).toBe('118');
    expect(JSON.stringify(data)).not.toMatch(/sgst|cgst|igst/i);
  });

  it('omits notify and net weight when the payload has neither', () => {
    const data = mapHtmlPilotPayload({
      parties: { shipper: { name: 'ACME' }, consignee: 'BETA' },
      routing: { pol: 'INMAA', pod: 'AEJEA', job_number: 'JOB-1' },
      cargo: { gross_weight: '1200', net_weight: '1100' },
    });
    expect(data?.shipperLines).toEqual(['ACME']);
    expect(data?.consigneeLines).toEqual(['BETA']);
    expect(data?.notifyLines).toBeUndefined();
    expect(data?.grossWeight).toBe('1200');
    expect(JSON.stringify(data)).not.toContain('1100');
  });

  it('keeps job values when the preview omits them', () => {
    const merged = overlayHtmlPilotPayload(
      { entityBound: true, jobNumber: 'J-9', pol: 'INMAA', shipperLines: ['ACME'] },
      { entityBound: true, pod: 'AEJEA', jobNumber: '' },
    );
    expect(merged.jobNumber).toBe('J-9');
    expect(merged.pol).toBe('INMAA');
    expect(merged.pod).toBe('AEJEA');
    expect(merged.shipperLines).toEqual(['ACME']);
  });

  it('maps job list rows onto the stable columns', () => {
    const data = mapHtmlPilotPayload({
      rows: [{ job_number: 'J-1', customer: 'ACME', pol: 'INMAA', pod: 'AEJEA', etd: '2026-11-01', status: 'Open' }],
    });
    expect(data?.tableHeaders).toEqual(['Job', 'Customer', 'POL', 'POD', 'ETD', 'Status']);
    expect(data?.tableRows).toEqual([['J-1', 'ACME', 'INMAA', 'AEJEA', '2026-11-01', 'Open']]);
  });
});
