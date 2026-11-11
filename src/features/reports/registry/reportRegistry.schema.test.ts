import { describe, expect, it } from 'vitest';
import { FRESA_REPORT_REGISTRY } from '../data/fresaReportRegistry';
import { enrichReportMeta } from './enrichReportMeta';
import {
  getReportEnrichment,
  listReportRegistryV2,
  summarizeReportRegistryV2,
} from './reportRegistryV2';
import { assertNoFalseFresaClaim } from './reportRegistry.schema';

describe('report registry v2 enrichment', () => {
  it('enriches every registry code without throwing', () => {
    expect(FRESA_REPORT_REGISTRY.length).toBe(852);
    expect(listReportRegistryV2()).toHaveLength(852);
    for (const meta of FRESA_REPORT_REGISTRY) {
      const e = enrichReportMeta(meta);
      assertNoFalseFresaClaim(e);
      expect(e.code).toBe(meta.code);
      expect(e.templateType.length).toBeGreaterThan(0);
      expect(e.dataMappingKey.length).toBeGreaterThan(0);
    }
  });

  it('marks verified HAWB sample formats correctly', () => {
    const e = getReportEnrichment('HAWB_DRAFT_REPORT_FORMAT_1');
    expect(e?.verificationStatus).toBe('verified_sample');
    expect(e?.templateFamily).toBe('hawb');
    expect(e?.claimsFresaExactMatch).toBe(true);
  });

  it('summarizes inventory', () => {
    const s = summarizeReportRegistryV2();
    expect(s.reports).toBe(852);
    expect(s.bySuggestedPackKey['sea.hbl_draft']).toBeGreaterThan(0);
    expect(s.byTemplateFamily.hbl).toBeGreaterThan(0);
  });
});
