import { describe, expect, it } from 'vitest';
import {
  CLASSIC_BL_DRAFT_DOCUMENT_KEYS,
  resolveJobDocumentFormatCode,
} from './resolveJobDocumentFormatCode';

describe('resolveJobDocumentFormatCode', () => {
  it('maps from-job HBL draft / BL draft to FG_HBL_FORMAT_1 (HBL Draft Jasper 1)', () => {
    expect(resolveJobDocumentFormatCode('hbl-draft')).toBe('FG_HBL_FORMAT_1');
    expect(resolveJobDocumentFormatCode('bl-draft')).toBe('FG_HBL_FORMAT_1');
    expect(resolveJobDocumentFormatCode('bl_draft')).toBe('FG_HBL_FORMAT_1');
  });

  it('maps from-job HAWB / airway bill draft to HAWB_DRAFT_REPORT_FORMAT', () => {
    expect(resolveJobDocumentFormatCode('hawb')).toBe('HAWB_DRAFT_REPORT_FORMAT');
    expect(resolveJobDocumentFormatCode('hawb-draft')).toBe('HAWB_DRAFT_REPORT_FORMAT');
    expect(resolveJobDocumentFormatCode('hawb-draft-gated')).toBe(
      'HAWB_DRAFT_REPORT_FORMAT',
    );
    expect(resolveJobDocumentFormatCode('hawb-final-gated')).toBe(
      'HAWB_DRAFT_REPORT_FORMAT_1',
    );
  });

  it('keeps Documents HBL / Express Release on classic FG_HBL_HKG', () => {
    expect(resolveJobDocumentFormatCode('hbl')).toBe('FG_HBL_HKG');
    expect(resolveJobDocumentFormatCode('hbl-er')).toBe('FG_HBL_HKG');
    expect(CLASSIC_BL_DRAFT_DOCUMENT_KEYS.has('hbl')).toBe(true);
    expect(CLASSIC_BL_DRAFT_DOCUMENT_KEYS.has('hbl-draft')).toBe(false);
    expect(CLASSIC_BL_DRAFT_DOCUMENT_KEYS.has('bl-draft')).toBe(false);
  });
});
