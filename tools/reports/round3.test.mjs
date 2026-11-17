import assert from 'node:assert/strict';
import test from 'node:test';
import { mapFont } from './font-map.mjs';
import { regressions } from './diff-pilot.mjs';

test('Arial Unicode maps to Arimo, not Noto', () => {
  const mapped = mapFont('RHQBFJ+ArialUnicodeMS');
  assert.equal(mapped.bundle, 'Arimo');
  assert.equal(mapped.family, 'Arimo');
});

test('a regression is a worse layer, not a still-failing layer', () => {
  const current = {
    code: 'PILOT',
    page: { pass: true },
    geometry: { pass: false, unmatchedLines: 2, unmatchedRects: 0, unmatchedPaths: 1, uncaptured: 4 },
    staticText: { pass: false, failures: [{ id: 'a' }] },
    dynamicText: { pass: false, failures: [{ id: 'b' }, { id: 'c' }] },
    raster: { ratio: 0.02 },
    pagination: { pass: false },
  };
  const baseline = {
    page: { pass: true },
    geometry: { pass: false, unmatchedLines: 2, unmatchedRects: 0, unmatchedPaths: 1, uncaptured: 4 },
    staticText: { pass: false, failures: 1 },
    dynamicText: { pass: false, failures: 2 },
    raster: { ratio: 0.02 },
    pagination: { pass: false },
  };
  assert.deepEqual(regressions(current, baseline), []);
  assert.equal(regressions({ ...current, raster: { ratio: 0.03 } }, baseline).length, 1);
  assert.ok(regressions({ ...current, page: { pass: false } }, baseline).some((line) => line.includes('page')));
});
