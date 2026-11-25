import assert from 'node:assert/strict';
import { amountInWords } from './amount-words.mjs';

assert.equal(amountInWords(17384, 'INR'), 'Rupees Seventeen Thousand Three Hundred Eighty-Four Only');
assert.equal(amountInWords(100000, 'INR'), 'Rupees One Lakh Only');
assert.equal(amountInWords(12.5, 'INR'), 'Rupees Twelve and Fifty Paise Only');

assert.equal(amountInWords(160195.35, 'AED'), 'Dirhams One Hundred Sixty Thousand One Hundred Ninety-Five and Thirty-Five Fils Only');
assert.equal(amountInWords(94.5, 'AED'), 'Dirhams Ninety-Four and Fifty Fils Only');

assert.equal(amountInWords(59628.45, 'PKR'), 'Rupees Fifty-Nine Thousand Six Hundred Twenty-Eight and Forty-Five Paise Only');
assert.equal(amountInWords(100000, 'PKR'), 'Rupees One Lakh Only');

assert.equal(amountInWords(1831, 'USD'), 'Dollars One Thousand Eight Hundred Thirty-One Only');
assert.equal(amountInWords(10.05, 'USD'), 'Dollars Ten and Five Cents Only');

assert.equal(amountInWords(110, 'EUR'), 'Euros One Hundred Ten Only');
assert.equal(amountInWords(1.2, 'EUR'), 'Euros One and Twenty Cents Only');

assert.equal(amountInWords(205.04, 'GBP'), 'Pounds Two Hundred Five and Four Pence Only');
assert.equal(amountInWords(1000000, 'GBP'), 'Pounds One Million Only');

assert.equal(amountInWords(NaN, 'USD'), '');
assert.equal(amountInWords(-12, 'USD'), 'Minus Dollars Twelve Only');

console.log(JSON.stringify({ ok: true, cases: 14 }));
