import { describe, expect, it } from 'vitest';
import { resolveReportPaperGeometry } from './reportPaperGeometry';

describe('resolveReportPaperGeometry', () => {
  it('maps A4 portrait to exact CSS px and jsPDF a4 portrait', () => {
    const g = resolveReportPaperGeometry('A4', 'portrait');
    expect(g.cssWidth).toBe(794);
    expect(g.cssHeight).toBe(1123);
    expect(g.jsPdfOrientation).toBe('portrait');
    expect(g.jsPdfFormat).toBe('a4');
  });

  it('swaps A4 dimensions for landscape', () => {
    const g = resolveReportPaperGeometry('A4', 'landscape');
    expect(g.cssWidth).toBe(1123);
    expect(g.cssHeight).toBe(794);
    expect(g.jsPdfOrientation).toBe('landscape');
  });

  it('defaults unknown orientation to portrait', () => {
    const g = resolveReportPaperGeometry('Letter', undefined);
    expect(g.orientation).toBe('portrait');
    expect(g.cssWidth).toBe(816);
    expect(g.cssHeight).toBe(1056);
  });
});
