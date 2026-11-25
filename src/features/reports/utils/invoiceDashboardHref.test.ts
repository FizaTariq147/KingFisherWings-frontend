import { describe, expect, it } from 'vitest';
import { buildInvoiceFresaCatalogPath } from '../constants/fresaPdfParity.constants';
import {
  buildDashboardHref,
  isInvoiceRelatedReport,
} from './moduleCatalogFamily';

describe('invoice → reports dashboard deep links', () => {
  it('Formats path opens /reports/dashboard with invoice + job context', () => {
    const href = buildInvoiceFresaCatalogPath('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', {
      job_id: '11111111-2222-3333-4444-555555555555',
      party_id: '99999999-8888-7777-6666-555555555555',
    });
    expect(href.startsWith('/reports/dashboard?')).toBe(true);
    expect(href).toContain('invoice_id=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(href).toContain('job_id=11111111-2222-3333-4444-555555555555');
    expect(href).toContain('party_id=99999999-8888-7777-6666-555555555555');
    expect(href).toContain('context=invoice');
    expect(href).toContain('family=commercial');
  });

  it('buildDashboardHref keeps record ids for format hydrate', () => {
    const href = buildDashboardHref({
      invoice_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      job_id: '11111111-2222-3333-4444-555555555555',
      context: 'invoice',
    });
    expect(href).toMatch(/^\/reports\/dashboard\?/);
    expect(href).toContain('invoice_id=');
    expect(href).toContain('job_id=');
  });

  it('isInvoiceRelatedReport matches commercial invoice codes', () => {
    expect(
      isInvoiceRelatedReport({
        code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
        family: 'commercial',
        contexts: ['invoice'],
      }),
    ).toBe(true);
    expect(
      isInvoiceRelatedReport({
        code: 'FG_HBL_HKG',
        family: 'sea_docs',
        contexts: ['job'],
        name: 'HBL HKG',
      }),
    ).toBe(false);
  });
});
