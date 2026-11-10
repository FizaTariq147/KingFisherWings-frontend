import { describe, expect, it } from 'vitest';
import { suggestReportPackKey } from './suggestReportPackKey';

const renderers = [
  { key: 'sea.hbl_draft' },
  { key: 'sea.hbl_original' },
  { key: 'air.hawb_draft' },
  { key: 'air.hawb_final' },
  { key: 'air.mawb' },
];

describe('suggestReportPackKey', () => {
  it('picks sea.hbl_original for original HBL codes', () => {
    expect(
      suggestReportPackKey('FG_HBL_ORIGINAL_FORMAT_87', 'sea_docs', renderers),
    ).toBe('sea.hbl_original');
    expect(
      suggestReportPackKey('HBL_DRAFT_REPORT_FORMAT_11', 'sea_docs', renderers),
    ).toBe('sea.hbl_draft');
  });

  it('picks air.hawb_final for original/pre-printed HAWB codes', () => {
    expect(
      suggestReportPackKey(
        'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
        'air_docs',
        renderers,
      ),
    ).toBe('air.hawb_final');
    expect(
      suggestReportPackKey('HAWB_DRAFT_REPORT_FORMAT_1', 'air_docs', renderers),
    ).toBe('air.hawb_draft');
  });

  it('falls back to air.hawb_draft when final pack is missing', () => {
    const draftOnly = renderers.filter((r) => r.key !== 'air.hawb_final');
    expect(
      suggestReportPackKey(
        'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
        'air_docs',
        draftOnly,
      ),
    ).toBe('air.hawb_draft');
  });
});
