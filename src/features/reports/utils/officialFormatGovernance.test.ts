import { describe, expect, it } from 'vitest';
import {
  classifyHawbFormatStatus,
  isOfficialHawbFormatCode,
  shouldExposeHawbInPrimaryCatalogue,
} from './officialFormatGovernance';

describe('officialFormatGovernance (HAWB)', () => {
  it('marks the five official HAWB codes as verified', () => {
    expect(isOfficialHawbFormatCode('HAWB_DRAFT_REPORT_FORMAT_1')).toBe(true);
    expect(classifyHawbFormatStatus('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2')).toBe(
      'official_verified',
    );
    expect(shouldExposeHawbInPrimaryCatalogue('HAWB_DRAFT_REPORT_FORMAT')).toBe(true);
  });

  it('does not treat Format-3+ as official', () => {
    expect(isOfficialHawbFormatCode('HAWB_DRAFT_REPORT_FORMAT_3')).toBe(false);
    expect(classifyHawbFormatStatus('HAWB_DRAFT_REPORT_FORMAT_15')).toBe('unverified');
    expect(shouldExposeHawbInPrimaryCatalogue('HAWB_DRAFT_REPORT_FORMAT_15')).toBe(false);
  });

  it('does not classify shipment freight manifest as HAWB official', () => {
    expect(classifyHawbFormatStatus('SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT')).toBe(
      'unsupported',
    );
  });
});
