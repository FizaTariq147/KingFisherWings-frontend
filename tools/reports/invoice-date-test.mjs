import assert from 'node:assert/strict';
import { formatReportDate } from './invoice-bindings.mjs';

assert.equal(formatReportDate('2026-10-31T00:00:00.000Z'), '31-OCT-26');
assert.equal(formatReportDate('2019-01-28'), '28-JAN-19');
assert.equal(formatReportDate('28-JAN-19'), '28-JAN-19');
assert.equal(formatReportDate(''), '');
console.log('formatReportDate ok');
