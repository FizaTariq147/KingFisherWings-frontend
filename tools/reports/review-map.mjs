/**
 * Phase 0.5 cleanup: ignore-file check, family/section review, no-reference groups.
 * Run: node tools/reports/review-map.mjs
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fingerprintPdf } from './build-manifest.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const refDir = path.join(root, 'reports/references');

function csv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

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

function writeCsv(file, header, records) {
  const lines = [header.join(',')];
  for (const record of records) lines.push(header.map((key) => csv(record[key])).join(','));
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
}

function sha256(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function loadRegistry() {
  const text = fs.readFileSync(
    path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts'),
    'utf8',
  );
  const entries = new Map();
  for (const chunk of text.split('\n  {\n').slice(1)) {
    const code = chunk.match(/"code": "([^"]+)"/);
    const name = chunk.match(/"name": "([^"]+)"/);
    const family = chunk.match(/"family": "([^"]+)"/);
    const moduleName = chunk.match(/"layoutBucket": "([^"]+)"/);
    if (!code) continue;
    entries.set(code[1], {
      code: code[1],
      name: name?.[1] || '',
      family: family?.[1] || '',
      module: moduleName?.[1] || '',
    });
  }
  return entries;
}

const FAMILY_OK = {
  finance: ['Accounts other Formats', 'ACCOUNTS', 'MY REPORTS'],
  commercial: ['Invoice Formats', 'ACCOUNTS', 'Accounts other Formats'],
  air_docs: ['AIR FREIGHT', 'HAWB', 'Arrival Notice', 'Delivery order', 'Other Reports'],
  sea_docs: ['SEA FREIGHT', 'HBL', 'Arrival Notice', 'Delivery order', 'Other Reports'],
  ops_list: ['MY REPORTS', 'Other Reports'],
  wms: ['WMS – ASN', 'WMS - ASN'],
  quotation: ['SEA FREIGHT', 'AIR FREIGHT', 'Other Reports'],
  other: ['Other Reports', 'SEA FREIGHT', 'AIR FREIGHT', 'ACCOUNTS', 'MY REPORTS'],
};

const MODULE_OK = {
  invoice: ['Invoice Formats', 'ACCOUNTS'],
  accounts: ['Accounts other Formats', 'ACCOUNTS', 'MY REPORTS'],
  hbl: ['HBL', 'SEA FREIGHT'],
  hawb: ['HAWB', 'AIR FREIGHT'],
  arrival: ['Arrival Notice', 'SEA FREIGHT', 'AIR FREIGHT'],
  delivery: ['Delivery order', 'SEA FREIGHT', 'AIR FREIGHT'],
  wms: ['WMS – ASN', 'WMS - ASN'],
  quotation: ['SEA FREIGHT', 'AIR FREIGHT', 'Other Reports'],
  ops_list: ['MY REPORTS', 'Other Reports'],
  other: ['Other Reports', 'SEA FREIGHT', 'AIR FREIGHT', 'ACCOUNTS', 'MY REPORTS'],
  sea_air: ['SEA FREIGHT', 'AIR FREIGHT', 'Other Reports', 'HBL', 'HAWB', 'Arrival Notice', 'Delivery order'],
  leftover: ['Invoice Formats', 'HBL', 'HAWB', 'Arrival Notice', 'Delivery order', 'Other Reports', 'ACCOUNTS', 'Accounts other Formats'],
  commercial: ['Invoice Formats', 'ACCOUNTS', 'Accounts other Formats'],
};

const registry = loadRegistry();
const manifest = parseCsv(fs.readFileSync(path.join(refDir, 'manifest.csv'), 'utf8'));
const byPath = new Map(manifest.map((row) => [row.local_path, row]));
const codeMap = parseCsv(fs.readFileSync(path.join(refDir, 'code-map.csv'), 'utf8'));
const byCode = new Map(codeMap.map((row) => [row.code, row]));
const ignores = parseCsv(fs.readFileSync(path.join(refDir, 'references-without-code.csv'), 'utf8')).filter(
  (row) => row.triage === 'ignore',
);

const duplicates = [];
const variants = [];
for (const row of ignores) {
  const mapped = byCode.get(row.proposed_code);
  const mappedPath = mapped?.reference_file || '';
  if (!row.proposed_code || !mappedPath) {
    duplicates.push({
      local_path: row.local_path,
      link_text: row.link_text,
      code: row.proposed_code,
      mapped_file: '',
      sha256: '',
      mapped_sha256: '',
      fingerprint: '',
      mapped_fingerprint: '',
      class: 'no_mapped_file',
      notes: 'No catalogue file is mapped to this row. The brochure is not a report.',
    });
    continue;
  }
  const left = path.join(root, row.local_path);
  const right = path.join(root, mappedPath);
  const leftSha = fs.existsSync(left) ? sha256(left) : '';
  const rightSha = fs.existsSync(right) ? sha256(right) : '';
  const record = {
    local_path: row.local_path,
    link_text: row.link_text,
    code: row.proposed_code,
    mapped_file: mappedPath,
    sha256: leftSha,
    mapped_sha256: rightSha,
    fingerprint: '',
    mapped_fingerprint: '',
    class: '',
    notes: '',
  };
  if (leftSha && leftSha === rightSha) {
    record.class = 'duplicate_of_mapped';
    record.notes = row.local_path === mappedPath
      ? 'Same path and same SHA-256 as the mapped reference. Fingerprint skipped.'
      : 'Different path, same SHA-256. Fingerprint skipped.';
    duplicates.push(record);
    continue;
  }
  let sameLayout = false;
  if (left.toLowerCase().endsWith('.pdf') && right.toLowerCase().endsWith('.pdf') && fs.existsSync(left) && fs.existsSync(right)) {
    const leftPrint = await fingerprintPdf(left);
    const rightPrint = await fingerprintPdf(right);
    record.fingerprint = leftPrint.strict;
    record.mapped_fingerprint = rightPrint.strict;
    sameLayout = leftPrint.strict === rightPrint.strict;
  }
  if (sameLayout) {
    record.class = 'duplicate_of_mapped';
    record.notes = 'SHA-256 differs and the strict geometry fingerprint matches.';
    duplicates.push(record);
  } else {
    record.class = 'variant_layout';
    record.notes = 'SHA-256 differs and the strict geometry fingerprint differs.';
    variants.push(record);
  }
}

writeCsv(
  path.join(refDir, 'ignore-duplicates.csv'),
  ['local_path', 'link_text', 'code', 'mapped_file', 'sha256', 'mapped_sha256', 'fingerprint', 'mapped_fingerprint', 'class', 'notes'],
  duplicates.filter((row) => row.class === 'duplicate_of_mapped'),
);
writeCsv(
  path.join(refDir, 'ignore-variants.csv'),
  ['local_path', 'link_text', 'code', 'mapped_file', 'sha256', 'mapped_sha256', 'fingerprint', 'mapped_fingerprint', 'class', 'notes'],
  variants,
);

const review = [];
for (const row of codeMap) {
  if (row.method !== 'normalized_name' && row.method !== 'rpm_ref') continue;
  if (!row.reference_file) continue;
  const meta = registry.get(row.code);
  const section = byPath.get(row.reference_file)?.section || '';
  const familyOk = FAMILY_OK[meta?.family || ''] || [];
  const moduleOk = MODULE_OK[meta?.module || ''] || [];
  const agrees = familyOk.includes(section) || moduleOk.includes(section);
  if (!agrees) {
    review.push({
      code: row.code,
      family: meta?.family || '',
      module: meta?.module || '',
      method: row.method,
      section,
      reference_file: row.reference_file,
      reason: 'family_section_disagreement',
      notes: `family ${meta?.family || '?'} / module ${meta?.module || '?'} does not sit in section "${section}"`,
    });
  }
}

const nameMatches = codeMap.filter((row) => row.method === 'normalized_name' && row.reference_file);
let seed = 20261117;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
const pool = [...nameMatches];
const sample = [];
while (sample.length < 30 && pool.length) {
  const index = Math.floor(random() * pool.length);
  sample.push(pool.splice(index, 1)[0]);
}
for (const row of sample) {
  const meta = registry.get(row.code);
  review.push({
    code: row.code,
    family: meta?.family || '',
    module: meta?.module || '',
    method: row.method,
    section: byPath.get(row.reference_file)?.section || '',
    reference_file: row.reference_file,
    reason: 'name_match_sample',
    notes: 'Seeded sample of 30 normalized-name matches for visual check.',
  });
}
writeCsv(
  path.join(refDir, 'map-review.csv'),
  ['code', 'family', 'module', 'method', 'section', 'reference_file', 'reason', 'notes'],
  review,
);

function namePrefix(code) {
  return code
    .replace(/_LIST_REPORT_FORMAT(?:_.*)?$/, '')
    .replace(/_REPORT_FORMAT(?:_.*)?$/, '')
    .replace(/_FORMAT_\d+$/, '')
    .replace(/_\d+$/, '');
}

const groups = new Map();
const noRef = parseCsv(fs.readFileSync(path.join(refDir, 'codes-without-reference.csv'), 'utf8')).filter(
  (row) => row.triage === 'no_reference',
);
for (const row of noRef) {
  const meta = registry.get(row.code) || { family: '', module: '' };
  const prefix = namePrefix(row.code);
  const key = `${meta.family}|${meta.module}|${prefix}`;
  if (!groups.has(key)) {
    groups.set(key, { family: meta.family, module: meta.module, name_prefix: prefix, count: 0, example_codes: [] });
  }
  const group = groups.get(key);
  group.count += 1;
  if (group.example_codes.length < 6) group.example_codes.push(row.code);
}
const groupRows = [...groups.values()]
  .sort((a, b) => b.count - a.count || a.family.localeCompare(b.family))
  .map((group) => ({ ...group, example_codes: group.example_codes.join('|') }));
writeCsv(
  path.join(refDir, 'no-reference-groups.csv'),
  ['family', 'module', 'name_prefix', 'count', 'example_codes'],
  groupRows,
);

const summary = {
  ignoreRows: ignores.length,
  duplicate_of_mapped: duplicates.filter((row) => row.class === 'duplicate_of_mapped').length,
  no_mapped_file: duplicates.filter((row) => row.class === 'no_mapped_file').length,
  variant_layout: variants.length,
  familySectionDisagreements: review.filter((row) => row.reason === 'family_section_disagreement').length,
  nameMatchSample: sample.length,
  noReferenceCodes: noRef.length,
  noReferenceGroups: groupRows.length,
};
fs.writeFileSync(path.join(refDir, 'review-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
