/**
 * Builds Fresa ↔ Kingfisher format map from pinned inventory + measured faces.
 * Output: reports/references/fresa-system-format-map.csv
 *         docs/reports/FRESA_SYSTEM_FORMAT_MAP.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const require = createRequire(import.meta.url);

async function loadTs(rel) {
  const href = pathToFileURL(path.join(root, rel)).href;
  return import(href);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function familyBucket(family) {
  const key = String(family || '').toLowerCase();
  if (key === 'hbl' || key === 'arrival_notice' || key === 'delivery_order' || key === 'sea_docs') {
    return 'Sea Freight';
  }
  if (key === 'hawb' || key === 'mawb' || key === 'air_docs') return 'Air Freight';
  if (key === 'invoice' || key === 'accounts' || key === 'commercial' || key === 'finance') {
    return 'Accounts';
  }
  if (key === 'quotation') return 'Accounts';
  if (key === 'wms_asn' || key === 'wms') return 'My Reports';
  if (key === 'my_reports' || key === 'ops_list') return 'My Reports';
  return 'My Reports';
}

function generatePath(row) {
  if (row.referenceAccurate) return 'reference_accurate';
  if (row.measured) return 'measured_fresa_face';
  if (row.hasLayout) return 'json_shell_fallback';
  if (row.hasReference) return 'reference_pinned_no_face';
  return 'unmapped';
}

const {
  MEASURED_OFFICIAL_FACES,
} = await loadTs('src/features/reports/templates/official/measuredFaces.generated.ts');
const { listAllRegisteredFormatCatalogEntries } = await loadTs(
  'src/features/reports/data/resolveAnyFormatUiLayout.ts',
);
const { REFERENCE_ACCURATE_PDF_CODES } = await loadTs(
  'src/features/reports/templates/referenceAccurate/index.ts',
);

const codeMapLines = fs
  .readFileSync(path.join(root, 'reports/references/code-map.csv'), 'utf8')
  .trim()
  .split(/\r?\n/)
  .slice(1);

const codeMap = new Map();
for (const line of codeMapLines) {
  // code,reference_file,confidence,method,notes
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  const [code, referenceFile, confidence, method, notes] = parts;
  if (!code) continue;
  codeMap.set(code.toUpperCase(), {
    code,
    referenceFile: referenceFile || '',
    confidence: confidence || '',
    method: method || '',
    notes: notes || '',
  });
}

const measuredByCode = new Map(
  MEASURED_OFFICIAL_FACES.map((face) => [face.code.toUpperCase(), face]),
);
const listed = listAllRegisteredFormatCatalogEntries();
const listedByCode = new Map(listed.map((row) => [row.code.toUpperCase(), row]));
const accurate = new Set(
  REFERENCE_ACCURATE_PDF_CODES.map((code) => String(code).toUpperCase()),
);

const allCodes = new Set([
  ...codeMap.keys(),
  ...measuredByCode.keys(),
  ...listedByCode.keys(),
]);

const rows = [...allCodes]
  .sort()
  .map((key) => {
    const map = codeMap.get(key);
    const face = measuredByCode.get(key);
    const listedRow = listedByCode.get(key);
    const hasReference = Boolean(map?.referenceFile);
    const measured = Boolean(face);
    const hasLayout = Boolean(listedRow);
    const family = face?.family || listedRow?.family || '';
    const name = face?.name || listedRow?.name || key;
    const row = {
      code: map?.code || face?.code || listedRow?.code || key,
      name,
      fresaColumn: familyBucket(family),
      family,
      hasReference,
      referenceFile: map?.referenceFile || face?.referenceFile || '',
      mapMethod: map?.method || (face ? 'measured_face' : hasLayout ? 'layout_only' : ''),
      measured,
      referenceAccurate: accurate.has(key),
      hasLayout,
      listedOnDashboard: hasLayout || measured,
      samplePdfUrl: face?.samplePdfUrl || '',
    };
    return {
      ...row,
      generatePath: generatePath(row),
    };
  });

const csvHeader = [
  'code',
  'name',
  'fresa_column',
  'family',
  'has_reference',
  'reference_file',
  'map_method',
  'measured_face',
  'reference_accurate',
  'has_json_layout',
  'listed_on_dashboard',
  'generate_path',
  'sample_pdf_url',
];

const csvBody = rows
  .map((row) =>
    [
      row.code,
      row.name,
      row.fresaColumn,
      row.family,
      row.hasReference ? 'yes' : 'no',
      row.referenceFile,
      row.mapMethod,
      row.measured ? 'yes' : 'no',
      row.referenceAccurate ? 'yes' : 'no',
      row.hasLayout ? 'yes' : 'no',
      row.listedOnDashboard ? 'yes' : 'no',
      row.generatePath,
      row.samplePdfUrl,
    ]
      .map(csvEscape)
      .join(','),
  )
  .join('\n');

fs.writeFileSync(
  path.join(root, 'reports/references/fresa-system-format-map.csv'),
  `${csvHeader.join(',')}\n${csvBody}\n`,
);

const counts = {
  total: rows.length,
  withReference: rows.filter((r) => r.hasReference).length,
  measured: rows.filter((r) => r.measured).length,
  referenceAccurate: rows.filter((r) => r.referenceAccurate).length,
  jsonFallback: rows.filter((r) => r.generatePath === 'json_shell_fallback').length,
  unmapped: rows.filter((r) => r.generatePath === 'unmapped').length,
  byColumn: {},
  byGeneratePath: {},
};
for (const row of rows) {
  counts.byColumn[row.fresaColumn] = (counts.byColumn[row.fresaColumn] || 0) + 1;
  counts.byGeneratePath[row.generatePath] = (counts.byGeneratePath[row.generatePath] || 0) + 1;
}

const md = `# Fresa ↔ Kingfisher format map

Source page: https://fresatechnologies.com/sample-report-formats/  
Pinned inventory: \`reports/references/manifest.csv\` + \`code-map.csv\`  
Machine map: \`reports/references/fresa-system-format-map.csv\`

## Rule

Generated PDFs must keep **Fresa layout / colours / table geometry**.  
Only these slots are dynamic from Kingfisher:

- Organization logo
- Company name / address / phone / email (header)
- Live record field values
- Footer print metadata (user / date) when present

Fresa branding and demo party/bank numbers are never the final product identity.

## Counts

| Metric | Value |
|---|---|
| Catalogue / map rows | ${counts.total} |
| With pinned reference file | ${counts.withReference} |
| Measured Fresa face (generate path) | ${counts.measured} |
| Reference-accurate dedicated builders | ${counts.referenceAccurate} |
| JSON shell fallback (approximate) | ${counts.jsonFallback} |
| Unmapped (no face / layout / pin) | ${counts.unmapped} |

### By Fresa column

${Object.entries(counts.byColumn)
  .map(([k, v]) => `- **${k}:** ${v}`)
  .join('\n')}

### By generate path

${Object.entries(counts.byGeneratePath)
  .map(([k, v]) => `- **${k}:** ${v}`)
  .join('\n')}

## Path meanings

| Path | Meaning |
|---|---|
| \`measured_fresa_face\` | Draws pinned geometry (lines/rects/labels) with org logo + company header |
| \`reference_accurate\` | Hand-tuned measured builder (pilots) |
| \`json_shell_fallback\` | Shared JSON/React shell — **not** pixel Fresa; queued for measured face |
| \`reference_pinned_no_face\` | Sample pinned but no measured redraw yet |
| \`unmapped\` | No pin and no FE layout |

## Priority to close visual gaps

1. Every \`json_shell_fallback\` / \`reference_pinned_no_face\` code needs a measured face (or promotion from \`reports/specs/<code>.json\`).
2. Do not mark accepted until raster compare passes (see MASTER_PROMPT).
3. Logo + company are always taken from organization profile when generating.

Generated by \`node tools/reports/build-fresa-system-format-map.mjs\`.
`;

fs.writeFileSync(path.join(root, 'docs/reports/FRESA_SYSTEM_FORMAT_MAP.md'), md);
console.log(JSON.stringify(counts, null, 2));
void require;
