import { describe, expect, it } from 'vitest';
import { buildInvoiceFresaCatalogPath } from '../constants/fresaPdfParity.constants';
import {
  buildDashboardHref,
  buildJobTransportDocFormatsPath,
  isInvoiceRelatedReport,
  isTransportDocRelatedReport,
  transportDocFamilyForJobType,
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

  it('job BL / Airway Bill Formats opens dashboard for the transport family', () => {
    expect(transportDocFamilyForJobType('AIR_EXPORT')).toBe('air_docs');
    expect(transportDocFamilyForJobType('SEA_EXPORT_FCL')).toBe('sea_docs');

    const airHref = buildJobTransportDocFormatsPath(
      '11111111-2222-3333-4444-555555555555',
      'AIR_IMPORT',
    );
    expect(airHref.startsWith('/reports/dashboard?')).toBe(true);
    expect(airHref).toContain('context=job');
    expect(airHref).toContain('family=air_docs');
    expect(airHref).toContain('job_id=11111111-2222-3333-4444-555555555555');
    expect(airHref).toContain('layouts=all');

    const seaHref = buildJobTransportDocFormatsPath(
      '11111111-2222-3333-4444-555555555555',
      'SEA_EXPORT_LCL',
    );
    expect(seaHref).toContain('family=sea_docs');

    expect(
      isTransportDocRelatedReport(
        { code: 'HAWB_DRAFT_REPORT_FORMAT_2', family: 'air_docs' },
        'air_docs',
      ),
    ).toBe(true);
    expect(
      isTransportDocRelatedReport(
        { code: 'HAWB_DRAFT_REPORT_FORMAT_2', family: 'air_docs' },
        'sea_docs',
      ),
    ).toBe(false);
  });

  it('job Reports header opens dashboard (not catalog) with job families bound', () => {
    const href = buildDashboardHref({
      context: 'job',
      job_id: '11111111-2222-3333-4444-555555555555',
      quotation_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      shipment_id: '99999999-8888-7777-6666-555555555555',
      party_id: '12121212-3434-5656-7878-909090909090',
      families: ['air_docs', 'ops_list', 'commercial'],
      layouts: 'all',
    });
    expect(href.startsWith('/reports/dashboard?')).toBe(true);
    expect(href).not.toContain('/reports/catalog');
    expect(href).toContain('context=job');
    expect(href).toContain('job_id=11111111-2222-3333-4444-555555555555');
    expect(href).toContain('families=air_docs%2Cops_list%2Ccommercial');
    expect(href).toContain('layouts=all');
    expect(href).toContain('party_id=');
  });
});
