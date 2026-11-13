import { describe, expect, it } from 'vitest';
import {
  hasOfficialSamplePdf,
  shouldPreferOfficialSamplePdf,
} from './preferOfficialSamplePdf';

describe('preferOfficialSamplePdf', () => {
  it('detects verified HAWB / DO / WMS sample formats', () => {
    expect(hasOfficialSamplePdf('HAWB_DRAFT_REPORT_FORMAT_1')).toBe(true);
    expect(hasOfficialSamplePdf('HAWB_DRAFT_REPORT_FORMAT_2')).toBe(true);
    expect(hasOfficialSamplePdf('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')).toBe(true);
    expect(hasOfficialSamplePdf('DELIVERY_ORDER_REPORT_FORMAT_17')).toBe(true);
    expect(hasOfficialSamplePdf('ADVANCE_SHIPPING_NOTE')).toBe(true);
  });

  it('prefers sample PDF over shared pack for catalogue generate', () => {
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'PDF',
      }),
    ).toBe(true);
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'XLSX',
      }),
    ).toBe(false);
  });

  it('never prefers CDN sample when a live entity is bound', () => {
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'PDF',
        entityBound: true,
      }),
    ).toBe(false);
  });
});
