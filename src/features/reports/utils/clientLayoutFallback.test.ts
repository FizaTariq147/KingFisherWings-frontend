import { describe, expect, it } from 'vitest';
import { allowClientLayoutGenerate } from './clientLayoutFallback';

describe('allowClientLayoutGenerate', () => {
  it('Phase 3: official sample availability does not override pack-ready Generate', () => {
    expect(
      allowClientLayoutGenerate({
        packReady: true,
        templateActive: true,
        entityBound: false,
        hasOfficialSample: true,
      }),
    ).toBe(false);
  });

  it('never uses generic client shells when pack is ready', () => {
    expect(
      allowClientLayoutGenerate({
        packReady: true,
        templateActive: true,
        entityBound: false,
        hasOfficialSample: false,
      }),
    ).toBe(false);
  });

  it('allows client fallback when pack is not ready', () => {
    expect(
      allowClientLayoutGenerate({
        packReady: false,
        templateActive: false,
        entityBound: false,
      }),
    ).toBe(true);
  });
});
