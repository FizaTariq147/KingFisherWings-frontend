import { describe, expect, it } from 'vitest';
import type { ReportTemplate } from '../types/reportCatalog.types';
import {
  filterCatalogStripsByFamily,
  filterCatalogStripsPartition,
  partitionCatalogStrips,
} from './partitionCatalogStrips';
import { isReportsV2Code } from '../engine/reportsV2Gate';
import { invoiceV2SpecCodes } from '../engine/invoiceV2Codes';

function tpl(
  partial: Partial<ReportTemplate> & Pick<ReportTemplate, 'code' | 'name' | 'family'>,
): ReportTemplate {
  return {
    id: partial.code,
    contexts: ['invoice'],
    formats: ['PDF'],
    gapStatus: 'covered_document_pdf',
    rolloutPhase: 1,
    defaultParams: [],
    ...partial,
  };
}

describe('partitionCatalogStrips', () => {
  it('puts v2-capable suitable codes in Recommended', () => {
    const wired = [...invoiceV2SpecCodes].find((c) => isReportsV2Code(c));
    expect(wired).toBeTruthy();
    const items = [
      tpl({ code: wired!, name: 'Wired Invoice', family: 'commercial' }),
      tpl({
        code: 'SOME_BROWSE_ONLY_FORMAT_XYZ',
        name: 'Browse Only',
        family: 'commercial',
      }),
    ];
    const part = partitionCatalogStrips(items, { invoiceCurrency: null });
    expect(part.recommended.some((r) => r.template.code === wired)).toBe(true);
    expect(part.otherByFamily.some((g) => g.items.some((r) => r.template.code === 'SOME_BROWSE_ONLY_FORMAT_XYZ'))).toBe(
      true,
    );
  });

  it('exposes a one-line unsuitable reason for arithmetic mismatch', () => {
    const code = 'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE';
    const items = [tpl({ code, name: 'Tax layout', family: 'commercial' })];
    /** INV/26/00094 — tax on lines but Format-4 does not print tax. */
    const invoice00094 = {
      currency_code: 'AED',
      subtotal: 152567,
      tax_total: null,
      tax_amount: 7628.35,
      total_amount: 160195.35,
      lines: [
        { quantity: 1, unit_price: 152000, tax_amount: 7600, line_total: 159600 },
        { quantity: 1, unit_price: 567, tax_amount: 28.35, line_total: 595.35 },
      ],
    };
    const part = partitionCatalogStrips(items, { invoiceCurrency: invoice00094 });
    expect(part.notSuitable).toHaveLength(1);
    expect(part.notSuitable[0]!.unsuitableReason).toBe(
      'not suitable for this invoice: the tax is not printed',
    );
    expect(part.notSuitable[0]!.unsuitableReason!.includes('\n')).toBe(false);
  });

  it('filters by search across sections', () => {
    const items = [
      tpl({ code: 'AAA_ONE', name: 'Alpha Invoice', family: 'commercial' }),
      tpl({ code: 'BBB_TWO', name: 'Beta Quotation', family: 'quotation' }),
    ];
    const part = partitionCatalogStrips(items);
    const filtered = filterCatalogStripsPartition(part, 'alpha');
    expect(filtered.recommended.concat(...filtered.otherByFamily.map((g) => g.items)).map((r) => r.template.code)).toEqual(
      expect.arrayContaining(['AAA_ONE']),
    );
    expect(
      filtered.recommended
        .concat(...filtered.otherByFamily.map((g) => g.items))
        .some((r) => r.template.code === 'BBB_TWO'),
    ).toBe(false);
  });

  it('filters by family', () => {
    const items = [
      tpl({ code: 'C1', name: 'Inv', family: 'commercial' }),
      tpl({ code: 'Q1', name: 'Quote', family: 'quotation' }),
    ];
    const part = partitionCatalogStrips(items);
    const onlyQ = filterCatalogStripsByFamily(part, 'quotation');
    const codes = [
      ...onlyQ.recommended,
      ...onlyQ.otherByFamily.flatMap((g) => g.items),
      ...onlyQ.notSuitable,
    ].map((r) => r.template.code);
    expect(codes).toEqual(['Q1']);
  });
});
