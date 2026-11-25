/**
 * Numerals, dates, currency codes, short tokens, and punctuation are not exempt.
 */
import assert from 'node:assert/strict';
import { leaksOnEmptyRecord } from './allowlist.mjs';

const supplied = new Set(['0.00']);
assert.equal(leaksOnEmptyRecord('0.00', supplied), false);
assert.equal(leaksOnEmptyRecord('10', supplied), true);
assert.equal(leaksOnEmptyRecord('275.000', supplied), true);
assert.equal(leaksOnEmptyRecord('01-JAN-19', supplied), true);
assert.equal(leaksOnEmptyRecord('USD', supplied), true);
assert.equal(leaksOnEmptyRecord(':', supplied), true);
assert.equal(leaksOnEmptyRecord('X', supplied), true);
assert.equal(leaksOnEmptyRecord('Qty', supplied), false);
console.log('leak rules ok');
