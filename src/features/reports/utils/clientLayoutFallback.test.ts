import { describe, expect, it } from 'vitest';
import { allowClientLayoutGenerate } from './clientLayoutFallback';

describe('allowClientLayoutGenerate', () => {
  it('never uses client shells when pack is ready', () => {
    expect(
      allowClientLayoutGenerate({
        packReady: true,
        templateActive: true,
        entityBound: false,
      }),
    ).toBe(false);
    expect(
      allowClientLayoutGenerate({
        packReady: true,
        templateActive: true,
        entityBound: true,
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
