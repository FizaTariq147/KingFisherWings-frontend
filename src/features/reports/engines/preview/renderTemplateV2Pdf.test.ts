import { describe, expect, it } from 'vitest';
import { supportsTemplateV2 } from './renderTemplateV2Pdf';

describe('supportsTemplateV2', () => {
  it('supports HBL HAWB arrival invoice ops families', () => {
    expect(supportsTemplateV2('HAWB_DRAFT_REPORT_FORMAT_1')).toBe(true);
    expect(supportsTemplateV2('HBL_DRAFT_REPORT_FORMAT_11')).toBe(true);
    expect(supportsTemplateV2('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA')).toBe(true);
  });
});
