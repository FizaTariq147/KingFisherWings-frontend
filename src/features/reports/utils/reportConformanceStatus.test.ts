import { describe, expect, it } from 'vitest';
import {
  reportConformanceLabel,
  reportConformanceStatus,
} from './reportConformanceStatus';

describe('report conformance status', () => {
  it('keeps every code unaccepted and marks only the six pilots in progress', () => {
    expect(reportConformanceStatus('HAWB_DRAFT_REPORT_FORMAT_2')).toBe('in_progress');
    expect(reportConformanceStatus('HBL_DRAFT_REPORT_FORMAT_JASPER')).toBe('in_progress');
    expect(reportConformanceStatus('INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA')).toBe(
      'in_progress',
    );
    expect(reportConformanceStatus('FCL_QUOTATION_REPORT_FORMAT')).toBe('in_progress');
    expect(
      reportConformanceStatus('ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER'),
    ).toBe('in_progress');
    expect(reportConformanceStatus('ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT')).toBe(
      'in_progress',
    );
    expect(reportConformanceStatus('INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE')).toBe(
      'reference_only',
    );
    expect(reportConformanceLabel('accepted')).toBe('Accepted');
    expect(reportConformanceStatus('HAWB_DRAFT_REPORT_FORMAT_2')).not.toBe('accepted');
  });
});
