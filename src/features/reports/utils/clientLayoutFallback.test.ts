import { describe, expect, it } from 'vitest';
import { allowClientLayoutGenerate } from './clientLayoutFallback';

describe('allowClientLayoutGenerate', () => {
  it('prefers official sample even when pack is ready', () => {
    expect(
      allowClientLayoutGenerate({
        packReady: true,
        templateActive: true,
        entityBound: false,
        hasOfficialSample: true,
      }),
    ).toBe(true);
  });

  it('never uses generic client shells when pack is ready and no sample', () => {
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
