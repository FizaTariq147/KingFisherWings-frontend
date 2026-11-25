import { describe, expect, it } from 'vitest';
import type { ReportTemplate } from '../types/reportCatalog.types';
import {
  fresaCatalogBandForTemplate,
  groupColumnIntoBands,
} from './fresaCatalogBand';

function tpl(
  partial: Partial<ReportTemplate> & Pick<ReportTemplate, 'code' | 'name' | 'family'>,
): ReportTemplate {
  return {
    id: partial.code,
    description: '',
    formats: ['PDF'],
    contexts: ['job'],
    ...partial,
  };
}

describe('fresaCatalogBandForTemplate', () => {
  it('maps HBL / HAWB / invoice / arrival codes to bands', () => {
    expect(fresaCatalogBandForTemplate(tpl({ code: 'FG_HBL_HKG', name: 'HBL', family: 'sea_docs' }))).toBe(
      'hbl',
    );
    expect(
      fresaCatalogBandForTemplate(
        tpl({ code: 'HAWB_DRAFT_REPORT_FORMAT_2', name: 'HAWB Draft 2', family: 'air_docs' }),
      ),
    ).toBe('hawb');
    expect(
      fresaCatalogBandForTemplate(
        tpl({
          code: 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
          name: 'Tax Invoice India',
          family: 'commercial',
        }),
      ),
    ).toBe('invoice');
    expect(
      fresaCatalogBandForTemplate(
        tpl({
          code: 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
          name: 'Arrival Notice',
          family: 'sea_docs',
        }),
      ),
    ).toBe('arrival');
  });

  it('orders sea bands HBL before arrival', () => {
    const bands = groupColumnIntoBands(
      'sea',
      [
        tpl({
          code: 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
          name: 'Arrival',
          family: 'sea_docs',
        }),
        tpl({ code: 'FG_HBL_HKG', name: 'HBL HKG', family: 'sea_docs' }),
      ],
      (a, b) => a.code.localeCompare(b.code),
    );
    expect(bands.map((b) => b.id)).toEqual(['hbl', 'arrival']);
  });
});
