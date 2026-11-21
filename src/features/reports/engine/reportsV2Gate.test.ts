import { describe, expect, it } from 'vitest';
import { BREADTH_WIRED_CODES, breadthBrowseReason, isBreadthWired } from './breadthCodes';
import {
  INVOICE_V2_FALLBACK_NOTICE,
  REPORTS_V2_FALLBACK_NOTICE,
  generateReportsV2WithFallback,
  isReportsV2Code,
  reportsV2BadgeText,
  reportsV2BrowseHint,
  reportsV2HardBlocked,
  reportsV2ListRank,
  shouldUseReportsV2,
} from './reportsV2Gate';

const INVOICE_CODE = 'INVOICE_REPORT_FORMAT_10_STANDARD_INVOICE';
const NOT_WIRED = 'NOT_A_REAL_REPORT_CODE';
const breadthOnly = BREADTH_WIRED_CODES.find((code) => !code.includes('INVOICE')) ?? BREADTH_WIRED_CODES[0];

describe('reports v2 wired detection', () => {
  it('treats invoice v2 spec codes as wired', () => {
    expect(isReportsV2Code(INVOICE_CODE)).toBe(true);
  });

  it('treats every breadth code as wired and nothing else', () => {
    expect(BREADTH_WIRED_CODES.length).toBeGreaterThan(0);
    for (const code of BREADTH_WIRED_CODES) {
      expect(isBreadthWired(code)).toBe(true);
      expect(isReportsV2Code(code)).toBe(true);
    }
    expect(isBreadthWired(NOT_WIRED)).toBe(false);
    expect(isReportsV2Code(NOT_WIRED)).toBe(false);
    expect(isReportsV2Code('')).toBe(false);
  });
});

describe('reports v2 list rank', () => {
  it('lists wired codes before everything else', () => {
    expect(reportsV2ListRank(INVOICE_CODE)).toBe(0);
    expect(reportsV2ListRank(breadthOnly)).toBe(0);
    expect(reportsV2ListRank(NOT_WIRED)).toBe(2);
    const sorted = [NOT_WIRED, breadthOnly, INVOICE_CODE].sort((a, b) => reportsV2ListRank(a) - reportsV2ListRank(b));
    expect(sorted[sorted.length - 1]).toBe(NOT_WIRED);
  });
});

describe('reports v2 gate', () => {
  it('soft gate never blocks and leaves an unaccepted wired code available', () => {
    for (const code of [INVOICE_CODE, breadthOnly, NOT_WIRED]) {
      expect(reportsV2HardBlocked({ gate: 'soft', code, status: 'in_progress' })).toBe(false);
    }
    expect(shouldUseReportsV2({ engine: 'v2', entry: 'formats', code: breadthOnly, gate: 'soft', status: 'reference_only' })).toBe(true);
    expect(shouldUseReportsV2({ engine: 'v2', entry: 'reports', code: INVOICE_CODE, gate: 'soft', status: 'in_progress' })).toBe(true);
  });

  it('hard gate offers a wired code only when it is accepted', () => {
    for (const code of [INVOICE_CODE, breadthOnly]) {
      expect(reportsV2HardBlocked({ gate: 'hard', code, status: 'in_progress' })).toBe(true);
      expect(reportsV2HardBlocked({ gate: 'hard', code, status: 'reference_only' })).toBe(true);
      expect(reportsV2HardBlocked({ gate: 'hard', code, status: 'accepted' })).toBe(false);
      expect(shouldUseReportsV2({ engine: 'v2', entry: 'formats', code, gate: 'hard', status: 'in_progress' })).toBe(false);
      expect(shouldUseReportsV2({ engine: 'v2', entry: 'formats', code, gate: 'hard', status: 'accepted' })).toBe(true);
    }
    expect(reportsV2HardBlocked({ gate: 'hard', code: NOT_WIRED, status: 'in_progress' })).toBe(false);
  });

  it('keeps legacy engine and non-wired codes on classic', () => {
    expect(shouldUseReportsV2({ engine: 'legacy', entry: 'formats', code: breadthOnly })).toBe(false);
    expect(shouldUseReportsV2({ engine: 'v2', entry: 'formats', code: NOT_WIRED })).toBe(false);
  });

  it('Generate runs v2 only when the style names the wired code', () => {
    expect(shouldUseReportsV2({ engine: 'v2', entry: 'generate', code: breadthOnly, style: 'classic' })).toBe(false);
    expect(shouldUseReportsV2({ engine: 'v2', entry: 'generate', code: breadthOnly, style: '' })).toBe(false);
    expect(shouldUseReportsV2({ engine: 'v2', entry: 'generate', code: breadthOnly, style: breadthOnly, gate: 'soft' })).toBe(true);
  });

  it('falls back to classic with the document notice when v2 throws', async () => {
    let classicCalls = 0;
    const failed = await generateReportsV2WithFallback({
      attemptV2: true,
      renderV2: async () => {
        throw new Error('forced v2 failure');
      },
      renderClassic: async () => {
        classicCalls += 1;
        return new Blob(['classic']);
      },
    });
    expect(classicCalls).toBe(1);
    expect(failed.notice).toBe(REPORTS_V2_FALLBACK_NOTICE);
    expect(REPORTS_V2_FALLBACK_NOTICE).toBe('Showing the classic document. The selected format could not be built.');
    expect(INVOICE_V2_FALLBACK_NOTICE).toBe('Showing the classic invoice. The selected format could not be built.');
    expect(await failed.blob.text()).toBe('classic');

    const ok = await generateReportsV2WithFallback({
      attemptV2: true,
      renderV2: async () => new Blob(['v2']),
      renderClassic: async () => new Blob(['classic']),
    });
    expect(ok.notice).toBeNull();
    expect(await ok.blob.text()).toBe('v2');

    const skipped = await generateReportsV2WithFallback({
      attemptV2: false,
      renderV2: async () => {
        throw new Error('must not run');
      },
      renderClassic: async () => new Blob(['classic']),
    });
    expect(skipped.notice).toBeNull();
  });
});

describe('reports v2 badge and browse hint', () => {
  it('never labels an unaccepted code as accepted', () => {
    expect(reportsV2BadgeText('in_progress')).toBe('approximate, not final');
    expect(reportsV2BadgeText('reference_only')).toBe('approximate, not final');
    expect(reportsV2BadgeText('accepted')).toBe('Accepted');
  });

  it('gives a browse-only hint with a reason for a code that is not wired', () => {
    const hint = reportsV2BrowseHint(NOT_WIRED);
    expect(hint).toBe(`Browse-only · ${breadthBrowseReason(NOT_WIRED)}`);
    expect(hint).toMatch(/^Browse-only · .+/);
    expect(reportsV2BrowseHint(INVOICE_CODE)).toBeNull();
    expect(reportsV2BrowseHint(breadthOnly)).toBeNull();
    expect(breadthBrowseReason(breadthOnly)).toBe('');
  });
});
