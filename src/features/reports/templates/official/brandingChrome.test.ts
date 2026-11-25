import { describe, expect, it } from 'vitest';
import {
  ensureReportBrandingChrome,
  getReportBrandingSlots,
} from './brandingSlots';

describe('report branding chrome', () => {
  it('aliases booking / ASN / delivery-order codes to measured slots', () => {
    const booking = getReportBrandingSlots(
      'BOOKING_CONFIRMATION_REPORT_FORMAT_1_BOOKING_CONFIRMATION',
    );
    expect(booking?.logo).toBeTruthy();
    expect(booking?.company).toBeTruthy();
    expect(booking?.footer?.printedByValue || booking?.footer?.printedByLabel).toBeTruthy();

    const asn = getReportBrandingSlots('ADVANCE_SHIPPING_NOTE_LOCATION_SUMMARY');
    expect(asn?.logo).toBeTruthy();

    const loadPlan = getReportBrandingSlots('CONTAINER_LOAD_PLAN_REPORT_20FORMAT');
    expect(loadPlan?.logo || loadPlan?.company).toBeTruthy();
  });

  it('synthesizes logo+company+footer for non-HBL faces without slots', () => {
    const chrome = ensureReportBrandingChrome(undefined, {
      code: 'SOME_UNKNOWN_INVOICE_FACE',
      widthPt: 595,
      heightPt: 842,
      rotateDeg: 0,
    });
    expect(chrome.logo).toBeTruthy();
    expect(chrome.logo!.width).toBeGreaterThanOrEqual(54);
    expect(chrome.logo!.height).toBeGreaterThanOrEqual(28);
    expect(chrome.company).toBeTruthy();
    expect(chrome.company!.align).toBe('right');
    expect(chrome.footer.printedByValue).toBeTruthy();
    expect(chrome.footer.printedDateValue).toBeTruthy();
    expect(chrome.footer.pageLabel).toBeTruthy();
  });

  it('never invents a top-left logo for ocean HBL', () => {
    const chrome = ensureReportBrandingChrome(undefined, {
      code: 'FG_HBL_FORMAT_20',
      widthPt: 595,
      heightPt: 842,
      rotateDeg: 0,
    });
    expect(chrome.logo).toBeNull();
  });
});
