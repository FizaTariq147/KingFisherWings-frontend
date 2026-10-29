import { describe, expect, it } from 'vitest';
import { shouldAppendCustomerTermsPage } from './shouldAppendCustomerTermsPage';
import { resolveCustomerTermsKind } from './resolveCustomerTermsKind';

describe('resolveCustomerTermsKind', () => {
  it('maps BL / HBL / MBL codes to bl', () => {
    expect(resolveCustomerTermsKind('HBL_DRAFT_REPORT_FORMAT_11')).toBe('bl');
    expect(resolveCustomerTermsKind('FG_HBL_HKG')).toBe('bl');
    expect(resolveCustomerTermsKind('MBL_DRAFT_REPORT_FORMAT_1')).toBe('bl');
    expect(resolveCustomerTermsKind('FG_HBL_ORIGINAL_FORMAT_87')).toBe('bl');
  });

  it('maps HAWB / MAWB / AWB codes to airway', () => {
    expect(resolveCustomerTermsKind('HAWB_DRAFT_REPORT_FORMAT_1')).toBe('airway');
    expect(resolveCustomerTermsKind('MAWB_DRAFT_REPORT_FORMAT_1')).toBe('airway');
  });

  it('does not append for ASN, invoice, DO, or lists', () => {
    expect(resolveCustomerTermsKind('ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA')).toBe(
      null,
    );
    expect(resolveCustomerTermsKind('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA')).toBe(null);
    expect(resolveCustomerTermsKind('DELIVERY_ORDER_REPORT_FORMAT_1')).toBe(null);
    expect(resolveCustomerTermsKind('CARGO_MANIFEST_REPORT_FORMAT')).toBe(null);
  });
});

describe('shouldAppendCustomerTermsPage', () => {
  it('honors explicit override over heuristics', () => {
    expect(shouldAppendCustomerTermsPage('HBL_DRAFT_REPORT_FORMAT_11', { override: false })).toBe(
      false,
    );
    expect(
      shouldAppendCustomerTermsPage('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA', {
        override: true,
      }),
    ).toBe(true);
  });

  it('appends only for BL and airway bill codes', () => {
    expect(shouldAppendCustomerTermsPage('HBL_DRAFT_REPORT_FORMAT_11')).toBe(true);
    expect(shouldAppendCustomerTermsPage('HAWB_DRAFT_REPORT_FORMAT_1')).toBe(true);
    expect(shouldAppendCustomerTermsPage('ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA')).toBe(
      false,
    );
    expect(shouldAppendCustomerTermsPage('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE')).toBe(false);
    expect(shouldAppendCustomerTermsPage('AP_AGING_SUMMARY_REPORT_FORMAT')).toBe(false);
  });

  it('ignores legacy layoutFlag (T&C is code-driven only)', () => {
    expect(
      shouldAppendCustomerTermsPage('ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA', {
        layoutFlag: true,
      }),
    ).toBe(false);
    expect(shouldAppendCustomerTermsPage('HBL_DRAFT_REPORT_FORMAT_11', { layoutFlag: false })).toBe(
      true,
    );
  });
});
