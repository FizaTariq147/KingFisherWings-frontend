import assert from 'node:assert/strict';
import test from 'node:test';
import { characterSpacingFor } from './render-spec.mjs';
import { parseAllowedDifferences } from './diff-pilot.mjs';

test('Consolas advance uses Tc and does not scale the glyphs', () => {
  const span = { font: 'Consolas', size: 7.9, charSpacing: 0, hScale: 100 };
  const spacing = characterSpacingFor(span, false);
  assert.ok(spacing < 0);
  assert.equal(Number(spacing.toFixed(4)), Number((((1126 - 1229) / 2048) * 7.9).toFixed(4)));
  assert.equal(characterSpacingFor(span, true), 0);
  assert.equal(characterSpacingFor({ font: 'Arial', size: 9, charSpacing: 0.2 }), 0.2);
});

test('allowed-difference boxes come only from the listed code and page', () => {
  const text = [
    '| code | page | x | y | width | height | reason |',
    '| INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA | 1 | 10 | 20 | 30 | 40 | address |',
    '| OTHER_CODE | 1 | 1 | 2 | 3 | 4 | skip |',
    '* 2 5 6 7 8 shared',
  ].join('\n');
  const boxes = parseAllowedDifferences(text, 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA', 1);
  assert.equal(boxes.length, 1);
  assert.equal(boxes[0].width, 30);
  assert.equal(parseAllowedDifferences(text, 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA', 2)[0].kind, 'allowed');
});
