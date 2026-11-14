import { describe, expect, it } from 'vitest';
import {
  HAWB_FORMAT_CATALOG,
  getHawbFormatSpec,
  isHawbFormatCode,
  listHawbFormats,
} from './hawbFormatCatalog';
import { OFFICIAL_HAWB_FORMAT_CODES } from '../utils/officialFormatGovernance';

describe('HAWB official catalogue (user-facing)', () => {
  it('exposes exactly 5 official formats', () => {
    const listed = listHawbFormats();
    expect(listed).toHaveLength(5);
    expect(HAWB_FORMAT_CATALOG).toHaveLength(5);
    expect(listed.map((r) => r.code).sort()).toEqual([...OFFICIAL_HAWB_FORMAT_CODES].sort());
  });

  it('each official entry has a distinct sample PDF URL', () => {
    const urls = listHawbFormats().map((r) => r.samplePdfUrl);
    expect(new Set(urls).size).toBe(5);
    for (const row of listHawbFormats()) {
      expect(row.sampleIsFallback).toBeFalsy();
      expect(row.officialVerified).toBe(true);
      expect(row.samplePdfUrl).toMatch(/hawb-.*\.pdf$/i);
    }
  });

  it('keeps historical Format-3 resolvable but not listed', () => {
    expect(isHawbFormatCode('HAWB_DRAFT_REPORT_FORMAT_3')).toBe(true);
    expect(getHawbFormatSpec('HAWB_DRAFT_REPORT_FORMAT_3')?.sampleIsFallback).toBe(true);
    expect(listHawbFormats().some((r) => r.code === 'HAWB_DRAFT_REPORT_FORMAT_3')).toBe(false);
  });

  it('does not treat shipment freight manifest as HAWB', () => {
    expect(isHawbFormatCode('SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT')).toBe(false);
  });
});
