/**
 * Build reports/status.json from reports/signoff.csv.
 * A complete sign-off row is accepted. A code with no reviewer is in_progress.
 * Every other catalogue code is reference_only.
 * Run: node tools/reports/build-status.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registryFile = path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts');
const signoffFile = path.join(root, 'reports/signoff.csv');
const statusFile = path.join(root, 'reports/status.json');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') cell += char;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((value) => value !== '')) rows.push(row);
  }
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] ?? ''])));
}

const codes = [...fs.readFileSync(registryFile, 'utf8').matchAll(/"code": "([^"]+)"/g)].map((match) => match[1]);
const status = Object.fromEntries(codes.map((code) => [code, 'reference_only']));
const signoff = fs.existsSync(signoffFile) ? parseCsv(fs.readFileSync(signoffFile, 'utf8')) : [];
let accepted = 0;
let inProgress = 0;
for (const row of signoff) {
  const code = String(row.code || '').trim().toUpperCase();
  if (!code) continue;
  const complete = [row.reviewer, row.date, row.reference_hash].every((value) => String(value || '').trim());
  if (complete) {
    status[code] = 'accepted';
    accepted += 1;
  } else {
    status[code] = 'in_progress';
    inProgress += 1;
  }
}
fs.writeFileSync(statusFile, `${JSON.stringify(status, null, 2)}\n`);
console.log(JSON.stringify({ codes: codes.length, accepted, inProgress, reference_only: Object.values(status).filter((value) => value === 'reference_only').length }, null, 2));
