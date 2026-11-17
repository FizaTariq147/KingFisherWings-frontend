/**
 * Map each catalogue code to one pinned reference.
 * Run: node tools/reports/build-code-map.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const registryFile = path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts');
const manifestFile = path.join(root, 'reports/references/manifest.csv');
const layoutsFile = path.join(root, 'reports/references/layouts.csv');
const overridesFile = path.join(root, 'reports/references/code-map.overrides.csv');
const outMap = path.join(root, 'reports/references/code-map.csv');
const outCodes = path.join(root, 'reports/references/codes-without-reference.csv');
const outRefs = path.join(root, 'reports/references/references-without-code.csv');

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
  for (const record of records) {
    lines.push(header.map((key) => csv(record[key])).join(','));
  }
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/fomat/g, 'format')
    .replace(/rpm[_ ]?ref[_ ]?\d+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value) {
  const stop = new Set(['report', 'format', 'list', 'the', 'of', 'and', 'for', 'with', 'a', 'to']);
  return new Set(normalizeName(value).split(' ').filter((token) => token && !stop.has(token)));
}

function jaccard(left, right) {
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / (left.size + right.size - shared);
}

function rpmId(value) {
  const match = String(value || '').match(/rpm_ref_(\d+)/i);
  return match ? match[1] : '';
}

function loadRegistry() {
  const text = fs.readFileSync(registryFile, 'utf8');
  const codes = [];
  for (const match of text.matchAll(/"code": "([^"]+)"[\s\S]{0,120}?"name": "([^"]+)"/g)) {
    codes.push({ code: match[1], name: match[2] });
  }
  return codes;
}

function loadSampleUrls() {
  const byCode = new Map();
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|json)$/.test(entry.name)) files.push(full);
    }
  }
  walk(path.join(root, 'src/features/reports'));
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/https:\/\/fresatechnologies\.com\/[^"'\\\s]+/g)) {
      const url = match[0].replace(/\\u0026/g, '&').split('?')[0];
      const start = Math.max(0, match.index - 2500);
      const before = text.slice(start, match.index);
      let depth = 0;
      let objectStart = before.length;
      for (let i = before.length - 1; i >= 0; i -= 1) {
        if (before[i] === '}') depth += 1;
        else if (before[i] === '{') {
          if (depth === 0) {
            objectStart = i;
            break;
          }
          depth -= 1;
        }
      }
      const after = text.slice(match.index, Math.min(text.length, match.index + 2500));
      depth = 0;
      let objectEnd = after.length;
      for (let i = 0; i < after.length; i += 1) {
        if (after[i] === '{') depth += 1;
        else if (after[i] === '}') {
          if (depth === 0) {
            objectEnd = i;
            break;
          }
          depth -= 1;
        }
      }
      const slice = `${before.slice(objectStart)}${after.slice(0, objectEnd)}`;
      const code = slice.match(/"(?:code|freightnestCode)": "([^"]+)"/);
      if (!code) continue;
      if (!byCode.has(code[1])) byCode.set(code[1], new Set());
      byCode.get(code[1]).add(url);
    }
  }
  return byCode;
}

const registry = loadRegistry();
const registryCodes = new Set(registry.map((entry) => entry.code));
const sampleUrls = loadSampleUrls();
const manifest = parseCsv(fs.readFileSync(manifestFile, 'utf8')).filter(
  (row) => !/Fresa_Gold_Profile/i.test(row.source_url || row.local_path || ''),
);
const files = manifest.map((row) => ({
  ...row,
  norm: normalizeName(`${row.link_text} ${path.basename(row.local_path || '')}`),
  fileNorm: normalizeName(path.basename(row.local_path || '')),
  linkNorm: normalizeName(row.link_text || ''),
  rpm: rpmId(row.source_url) || rpmId(row.local_path),
  tokenSet: tokens(`${row.link_text} ${path.basename(row.local_path || '')}`),
}));

if (!fs.existsSync(overridesFile)) {
  fs.writeFileSync(
    overridesFile,
    [
      'code,reference_file,notes',
      'ADVANCE_SHIPPING_NOTE_LOCATION_WISE,reports/references/files/ADVANCE_SHIPPING_NOTE_LOCATION_WISE.pdf,Base file only. Location Wise- 1 is a separate pin.',
      'ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1,reports/references/files/ADVANCE_SHIPPING_NOTE_LOCATION_WISE_.pdf,Proposed new code. Not in the 852-code registry. Link text is Advance Shipping Note Location Wise- 1.',
      '',
    ].join('\n'),
  );
}
const overrides = parseCsv(fs.readFileSync(overridesFile, 'utf8'));
const byPath = new Map(files.map((file) => [file.local_path, file]));
const assigned = new Map();
const used = new Set();

function assign(code, filePath, confidence, method, notes) {
  if (!code || !filePath || assigned.has(code) || used.has(filePath)) return false;
  if (!byPath.has(filePath)) return false;
  assigned.set(code, { reference_file: filePath, confidence, method, notes });
  used.add(filePath);
  return true;
}

for (const override of overrides) {
  assign(override.code, override.reference_file, 'manual', 'override', override.notes || 'manual override');
}

const filesByRpm = new Map();
for (const file of files) {
  if (!file.rpm || used.has(file.local_path)) continue;
  if (!filesByRpm.has(file.rpm)) filesByRpm.set(file.rpm, []);
  filesByRpm.get(file.rpm).push(file);
}
const codesByRpm = new Map();
for (const entry of registry) {
  if (assigned.has(entry.code)) continue;
  const ids = new Set();
  for (const url of sampleUrls.get(entry.code) || []) {
    const id = rpmId(url);
    if (id) ids.add(id);
  }
  for (const id of ids) {
    if (!codesByRpm.has(id)) codesByRpm.set(id, []);
    codesByRpm.get(id).push(entry.code);
  }
}
for (const [id, codeList] of codesByRpm) {
  const fileList = filesByRpm.get(id) || [];
  if (codeList.length === 1 && fileList.length === 1) {
    assign(codeList[0], fileList[0].local_path, 'high', 'rpm_ref', `rpm_ref_${id}`);
  }
}

function termPrefix(text, prefix) {
  if (!prefix || !text.startsWith(prefix)) return false;
  return text.length === prefix.length || text[prefix.length] === ' ';
}

for (const entry of registry) {
  if (assigned.has(entry.code)) continue;
  const codeNorm = normalizeName(entry.code);
  const nameNorm = normalizeName(entry.name);
  const hits = files.filter(
    (file) => !used.has(file.local_path) && (file.fileNorm === codeNorm || file.fileNorm === nameNorm),
  );
  if (hits.length === 1) {
    assign(entry.code, hits[0].local_path, 'high', 'normalized_name', 'filename matches the code or catalogue name');
  }
}

for (const file of files) {
  if (used.has(file.local_path)) continue;
  const hits = registry
    .filter((entry) => !assigned.has(entry.code) && termPrefix(file.fileNorm, normalizeName(entry.code)))
    .sort((a, b) => normalizeName(b.code).length - normalizeName(a.code).length);
  if (!hits.length) continue;
  if (hits.length === 1 || normalizeName(hits[0].code).length > normalizeName(hits[1].code).length) {
    assign(hits[0].code, file.local_path, 'high', 'normalized_name', 'filename starts with the code');
  }
}

for (const entry of registry) {
  if (assigned.has(entry.code)) continue;
  const nameNorm = normalizeName(entry.name);
  const codeNorm = normalizeName(entry.code);
  const hits = files.filter(
    (file) => !used.has(file.local_path) && (file.linkNorm === nameNorm || file.linkNorm === codeNorm),
  );
  if (hits.length === 1) {
    assign(entry.code, hits[0].local_path, 'high', 'normalized_name', 'link text matches the catalogue name');
  }
}

const codeRows = [];
for (const entry of registry) {
  const hit = assigned.get(entry.code);
  codeRows.push({
    code: entry.code,
    reference_file: hit?.reference_file || '',
    confidence: hit?.confidence || '',
    method: hit?.method || '',
    notes: hit?.notes || '',
  });
}
for (const [code, hit] of assigned) {
  if (registryCodes.has(code)) continue;
  codeRows.push({
    code,
    reference_file: hit.reference_file,
    confidence: hit.confidence,
    method: hit.method,
    notes: hit.notes,
  });
}
writeCsv(outMap, ['code', 'reference_file', 'confidence', 'method', 'notes'], codeRows);

const phase0Codes = registry.filter((entry) => !manifest.some((row) => row.code === entry.code));
const codeTriage = [];
for (const entry of phase0Codes) {
  const hit = assigned.get(entry.code);
  if (hit) {
    codeTriage.push({
      code: entry.code,
      triage: 'name_mismatch',
      proposed_reference: hit.reference_file,
      confidence: hit.confidence,
      notes: `${hit.method}: ${hit.notes}`,
    });
    continue;
  }
  const scored = files
    .filter((file) => !used.has(file.local_path))
    .map((file) => ({
      file,
      score: Math.max(jaccard(tokens(entry.name), file.tokenSet), jaccard(tokens(entry.code), file.tokenSet)),
    }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  const second = scored[1];
  const shared = best ? [...tokens(entry.name)].filter((token) => best.file.tokenSet.has(token)).length : 0;
  let triage = 'no_reference';
  let proposed = '';
  let confidence = '';
  let notes = 'no pinned file has a close name';
  if (best && best.score >= 0.5 && shared >= 3) {
    const close = second && best.score - second.score < 0.08 && second.score >= 0.5;
    if (close) {
      triage = 'unknown';
      proposed = best.file.local_path;
      confidence = 'low';
      notes = `also close to ${second.file.local_path}`;
    } else {
      triage = 'name_mismatch';
      proposed = best.file.local_path;
      confidence = best.score >= 0.75 ? 'medium' : 'low';
      notes = `name overlap ${best.score.toFixed(2)} with ${path.basename(best.file.local_path)}`;
    }
  }
  codeTriage.push({
    code: entry.code,
    triage,
    proposed_reference: proposed,
    confidence,
    notes,
  });
}
writeCsv(
  outCodes,
  ['code', 'triage', 'proposed_reference', 'confidence', 'notes'],
  codeTriage,
);

const phase0Refs = manifest.filter((row) => row.code && !registryCodes.has(row.code));
if (!phase0Refs.some((row) => /Fresa_Gold_Profile/i.test(row.local_path || ''))) {
  phase0Refs.push({
    local_path: 'reports/references/files/Fresa_Gold_Profile_20260727.pdf',
    link_text: 'Fresa Gold ERP Brochure',
    code: 'FRESA_GOLD_PROFILE_20260727',
  });
}
const refTriage = [];
for (const row of phase0Refs) {
  const owner = [...assigned.entries()].find(
    ([code, hit]) => registryCodes.has(code) && hit.reference_file === row.local_path,
  );
  const brochure = /Fresa_Gold_Profile|brochure/i.test(`${row.local_path} ${row.link_text}`);
  if (brochure) {
    refTriage.push({
      local_path: row.local_path,
      link_text: row.link_text,
      triage: 'ignore',
      proposed_code: '',
      notes: 'Fresa Gold brochure. Removed from the report list. Scanned, needs_manual.',
    });
  } else if (owner) {
    refTriage.push({
      local_path: row.local_path,
      link_text: row.link_text,
      triage: 'ignore',
      proposed_code: owner[0],
      notes: `same file is the reference for registered code ${owner[0]}`,
    });
  } else {
    const proposed = [...assigned.entries()].find(
      ([code, hit]) => !registryCodes.has(code) && hit.reference_file === row.local_path,
    );
    refTriage.push({
      local_path: row.local_path,
      link_text: row.link_text,
      triage: 'should_register',
      proposed_code: proposed ? proposed[0] : '',
      notes: proposed ? 'proposed code, not in the registry' : 'pinned sample has no catalogue code',
    });
  }
}
writeCsv(
  outRefs,
  ['local_path', 'link_text', 'triage', 'proposed_code', 'notes'],
  refTriage,
);

const summary = {
  catalogueCodes: registry.length,
  mappedToReference: registry.filter((entry) => assigned.has(entry.code)).length,
  byMethod: {
    override: codeRows.filter((row) => row.method === 'override' && registryCodes.has(row.code)).length,
    rpm_ref: codeRows.filter((row) => row.method === 'rpm_ref').length,
    normalized_name: codeRows.filter((row) => row.method === 'normalized_name').length,
  },
  proposedCodes: codeRows.filter((row) => !registryCodes.has(row.code)).map((row) => row.code),
  codesWithoutReference: {
    total: codeTriage.length,
    name_mismatch: codeTriage.filter((row) => row.triage === 'name_mismatch').length,
    no_reference: codeTriage.filter((row) => row.triage === 'no_reference').length,
    unknown: codeTriage.filter((row) => row.triage === 'unknown').length,
  },
  referencesWithoutCode: {
    total: refTriage.length,
    should_register: refTriage.filter((row) => row.triage === 'should_register').length,
    ignore: refTriage.filter((row) => row.triage === 'ignore').length,
  },
};
fs.writeFileSync(path.join(root, 'reports/references/code-map-summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

const layouts = fs.readFileSync(layoutsFile, 'utf8').split(/\r?\n/).filter((line) => line && !/Fresa_Gold_Profile/i.test(line));
fs.writeFileSync(layoutsFile, `${layouts.join('\n')}\n`);
const kept = parseCsv(fs.readFileSync(manifestFile, 'utf8'))
  .filter((row) => !/Fresa_Gold_Profile/i.test(`${row.source_url} ${row.local_path} ${row.code}`))
  .map((row) => {
    if (row.local_path.endsWith('ADVANCE_SHIPPING_NOTE_LOCATION_WISE_.pdf')) {
      return { ...row, code: 'ADVANCE_SHIPPING_NOTE_LOCATION_WISE_1' };
    }
    return row;
  });
writeCsv(
  manifestFile,
  ['code', 'section', 'link_text', 'source_url', 'file_type', 'local_path', 'sha256', 'downloaded_at', 'status'],
  kept,
);
