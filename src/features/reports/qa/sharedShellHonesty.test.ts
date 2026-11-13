import { describe, expect, it } from 'vitest';
import {
  getSharedLayoutSource,
  isDistinctLayoutCode,
} from '../data/sharedLayoutSource';
import { getReportEnrichment } from '../registry';
import { shouldPreferOfficialSamplePdf } from '../utils/preferOfficialSamplePdf';
import {
  listFresaP0LivePdfQueue,
  listP0VerifiedSampleCodes,
  summarizeFresaP0LivePdfQueue,
} from './fresaP0LivePdfQueue';
import { REPORT_GENERATE_PRIORITY, REPORT_SHARED_SHELL_POLICY } from '../constants/reportPreserveMatrix';

describe('shared shell honesty', () => {
  it('aliases Arrival Format-11 to the same Jasper Format-1 source as bare Format-1', () => {
    const f11 = getSharedLayoutSource('ARRIVAL_NOTICE_REPORT_FORMAT_11');
    const f1 = getSharedLayoutSource('ARRIVAL_NOTICE_REPORT_FORMAT_1');
    expect(f11?.isSharedLayout).toBe(true);
    expect(f1?.isSharedLayout).toBe(true);
    expect(f11?.layoutSourceCode).toBe(f1?.layoutSourceCode);
    expect(f11?.layoutSourceCode).toBe(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
    );
  });

  it('marks canonical Jasper Format-1 shell as distinct', () => {
    const jasper = getSharedLayoutSource(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
    );
    expect(jasper?.isSharedLayout).toBe(false);
    expect(isDistinctLayoutCode('ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER')).toBe(
      true,
    );
    expect(isDistinctLayoutCode('ARRIVAL_NOTICE_REPORT_FORMAT_11')).toBe(false);
  });

  it('aliases HBL Format-N extras (no unique JSON) to Format-11 shell', () => {
    // Format-3 has no unique JSON object; Format-11 is the canonical draft shell.
    const extra = getSharedLayoutSource('HBL_DRAFT_REPORT_FORMAT_3');
    const base = getSharedLayoutSource('HBL_DRAFT_REPORT_FORMAT_11');
    expect(extra?.isSharedLayout).toBe(true);
    expect(extra?.layoutSourceCode).toBe('HBL_DRAFT_REPORT_FORMAT_11');
    expect(base?.isSharedLayout).toBe(false);
  });

  it('aliases HAWB draft Format-N to base draft shell', () => {
    const extra = getSharedLayoutSource('HAWB_DRAFT_REPORT_FORMAT_12');
    expect(extra?.isSharedLayout).toBe(true);
    expect(extra?.layoutSourceCode).toBe('HAWB_DRAFT_REPORT_FORMAT');
  });

  it('enrichment exposes shared_shell for Arrival Format-11', () => {
    const e = getReportEnrichment('ARRIVAL_NOTICE_REPORT_FORMAT_11');
    expect(e?.isSharedLayout).toBe(true);
    expect(e?.implementationStatus).toBe('shared_shell');
    expect(e?.claimsFresaExactMatch).toBe(false);
    expect(e?.layoutSourceCode).toBe(
      'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
    );
  });

  it('entity-bound Generate still blocks CDN sample preference', () => {
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'PDF',
        entityBound: true,
      }),
    ).toBe(false);
    expect(
      shouldPreferOfficialSamplePdf({
        code: 'HAWB_DRAFT_REPORT_FORMAT_1',
        format: 'PDF',
        entityBound: false,
      }),
    ).toBe(true);
  });

  it('codifies generate priority and shared-shell policy', () => {
    expect(REPORT_GENERATE_PRIORITY).toEqual([
      'sample_browse',
      'backend_pack',
      'template_v2',
      'json_fallback',
    ]);
    expect(REPORT_SHARED_SHELL_POLICY.forbidNewJsonAliasesForCoverage).toBe(true);
  });

  it('P0 live PDF queue includes verified samples and excludes shared shells', () => {
    const samples = listP0VerifiedSampleCodes();
    expect(samples.length).toBeGreaterThan(0);
    const queue = listFresaP0LivePdfQueue();
    expect(queue.length).toBeGreaterThanOrEqual(samples.length);
    for (const row of queue) {
      if (row.reason === 'verified_sample') {
        expect((row.samplePdfUrl || '').trim().length).toBeGreaterThan(0);
      }
      const e = getReportEnrichment(row.code);
      if (e?.isSharedLayout) {
        // Should not happen — queue builder excludes shared shells for pack_bound;
        // verified samples are distinct CDN files.
        expect(row.reason).toBe('verified_sample');
      }
    }
    const summary = summarizeFresaP0LivePdfQueue();
    expect(summary.total).toBe(queue.length);
    expect(summary.byReason.verified_sample).toBeGreaterThan(0);
  });
});
