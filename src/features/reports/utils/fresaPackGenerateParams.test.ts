import { describe, expect, it } from 'vitest';
import {
  buildFresaPackGenerateParams,
  preferredHblHawbPackKeyHint,
} from './fresaPackGenerateParams';

describe('fresaPackGenerateParams', () => {
  it('marks HBL original vs draft with template_code', () => {
    const draft = buildFresaPackGenerateParams('HBL_DRAFT_REPORT_FORMAT_11');
    expect(draft.template_code).toBe('HBL_DRAFT_REPORT_FORMAT_11');
    expect(draft.document_kind).toBe('hbl_draft');
    expect(draft.template_variant).toBeTruthy();

    const orig = buildFresaPackGenerateParams('FG_HBL_ORIGINAL_FORMAT_87');
    expect(orig.document_kind).toBe('hbl_original');
    expect(preferredHblHawbPackKeyHint('FG_HBL_ORIGINAL_FORMAT_87')).toBe('hbl_original');
    expect(preferredHblHawbPackKeyHint('HBL_DRAFT_REPORT_FORMAT_2')).toBe('hbl_draft');
  });

  it('maps HAWB original/pre-printed to hawb_final pack hint', () => {
    const draft = buildFresaPackGenerateParams('HAWB_DRAFT_REPORT_FORMAT_1');
    expect(draft.document_kind).toBe('hawb_draft');
    expect(draft.template_variant).toBe('draft1');

    const original = buildFresaPackGenerateParams(
      'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    );
    expect(original.document_kind).toBe('hawb_final');
    expect(original.template_variant).toBe('original2');
    expect(preferredHblHawbPackKeyHint('HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1')).toBe(
      'hawb_final',
    );
  });
});
