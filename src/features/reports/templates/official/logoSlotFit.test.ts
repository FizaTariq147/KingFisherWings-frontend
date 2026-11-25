import { describe, expect, it } from 'vitest';
import { getReportBrandingSlots } from './brandingSlots';

/**
 * Logo must stay inside the measured Fresa box. Drawer uses ~78% inset and
 * never upscales past native pixels so marks do not crowd borders or text.
 */
describe('measured logo slots fit Fresa boxes', () => {
  it.each([
    'FG_HBL_HKG',
    'FG_HBL_FORMAT_1',
    'FG_HBL_MAGICLOGISYS',
    'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
    'INVOICE_REPORT_FORMAT_2_TAX_INVOICE_INDIA',
    'INVOICE_REPORT_FORMAT_4_STANDARD_TAX_INVOICE',
  ])('%s logo slot has positive box inside page', (code) => {
    const slots = getReportBrandingSlots(code);
    expect(slots).toBeTruthy();
    if (!slots?.logo) return;
    expect(slots.logo.width).toBeGreaterThan(12);
    expect(slots.logo.height).toBeGreaterThan(8);
    // HKG agent box is large (~155×75); still a measured slot, not shipper chrome.
    expect(slots.logo.width).toBeLessThanOrEqual(220);
    expect(slots.logo.height).toBeLessThanOrEqual(120);
    // HBL/air: logo must not sit in the top-left shipper band.
    if (/^(HBL_|FG_HBL_)/i.test(code)) {
      const inShipper =
        slots.logo.x < 200 && slots.logo.y + slots.logo.height > 780;
      expect(inShipper).toBe(false);
    }
  });
});
