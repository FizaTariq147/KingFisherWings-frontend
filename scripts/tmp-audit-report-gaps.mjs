import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'src', 'features', 'reports');

const jsonPath = path.join(root, 'data', 'fresaReportRegistry.json');
const items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log('registry', items.length);

const byStatus = {};
const byFamily = {};
const byPhase = {};
for (const t of items) {
  byStatus[t.gapStatus] = (byStatus[t.gapStatus] || 0) + 1;
  byFamily[t.family] = (byFamily[t.family] || 0) + 1;
  byPhase[t.rolloutPhase] = (byPhase[t.rolloutPhase] || 0) + 1;
}
console.log('byStatus', byStatus);
console.log('byFamily', byFamily);
console.log('byPhase', byPhase);

const layoutCodes = new Set();
const layoutByStore = {};
const dataDir = path.join(root, 'data');
for (const f of fs.readdirSync(dataDir).filter((x) => x.endsWith('FormatUiLayouts.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  const codes = [];
  const collect = (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }
    if (typeof node === 'object') {
      if (typeof node.code === 'string') codes.push(node.code.toUpperCase());
      for (const v of Object.values(node)) collect(v);
    }
  };
  collect(j);
  if (j && typeof j === 'object' && !Array.isArray(j)) {
    for (const k of Object.keys(j)) {
      if (/^[A-Z0-9_]+$/i.test(k) && k.length > 5) codes.push(k.toUpperCase());
    }
  }
  const unique = [...new Set(codes)];
  layoutByStore[f] = unique.length;
  unique.forEach((c) => layoutCodes.add(c));
}
console.log('layout stores', layoutByStore);
console.log('layout unique', layoutCodes.size);

const regCodes = new Set(items.map((t) => String(t.code).toUpperCase()));
const missingLayout = [...regCodes].filter((c) => !layoutCodes.has(c)).sort();
const extraLayout = [...layoutCodes].filter((c) => !regCodes.has(c)).sort();
console.log('registry missing FE layout', missingLayout.length);
console.log('MISSING_LAYOUT_SAMPLE');
console.log(missingLayout.slice(0, 80).join('\n'));
console.log('layouts not in registry', extraLayout.length);
console.log('EXTRA_LAYOUT_SAMPLE');
console.log(extraLayout.slice(0, 40).join('\n'));

const netNew = items.filter((t) => t.gapStatus === 'net_new');
const partialDoc = items.filter((t) => t.gapStatus === 'partial_document_pdf');
const partialAnalytics = items.filter((t) => t.gapStatus === 'partial_analytics');
const covered = items.filter((t) => t.gapStatus === 'covered' || t.gapStatus === 'complete');

console.log('net_new', netNew.length);
console.log('partial_document_pdf', partialDoc.length);
console.log('partial_analytics', partialAnalytics.length);
console.log('covered-ish', covered.length);

const nnf = {};
for (const t of netNew) nnf[t.family] = (nnf[t.family] || 0) + 1;
console.log('net_new by family', nnf);

const pdf = {};
for (const t of partialDoc) pdf[t.family] = (pdf[t.family] || 0) + 1;
console.log('partial_document_pdf by family', pdf);

const pa = {};
for (const t of partialAnalytics) pa[t.family] = (pa[t.family] || 0) + 1;
console.log('partial_analytics by family', pa);

function dumpFamily(list, family, n = 15) {
  const rows = list.filter((t) => t.family === family);
  console.log(`\n=== ${family} (${rows.length}) ===`);
  for (const t of rows.slice(0, n)) {
    console.log(`${t.code} | ${t.name} | ${t.gapStatus} | phase ${t.rolloutPhase}`);
  }
  if (rows.length > n) console.log(`... +${rows.length - n} more`);
}

for (const fam of Object.keys(byFamily).sort()) {
  dumpFamily(netNew, fam, 12);
}

// Catalog constants vs registry
const constDir = path.join(root, 'constants');
const catalogFiles = fs.readdirSync(constDir).filter((f) => /FormatCatalog/.test(f) && f.endsWith('.ts') && !f.includes('.generated'));
console.log('\ncatalog constant files', catalogFiles);

// reports menu tiles that are NOT format catalog
const menuPath = path.join(root, 'config', 'reportsMenu.ts');
const menuSrc = fs.readFileSync(menuPath, 'utf8');
const tileMatches = [...menuSrc.matchAll(/title:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
const pathMatches = [...menuSrc.matchAll(/to:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
console.log('\nmenu titles', tileMatches.length);
console.log(tileMatches.join('\n'));
console.log('\nmenu paths');
console.log(pathMatches.join('\n'));

// Write full missing lists to tmp
const out = {
  summary: {
    registry: items.length,
    layouts: layoutCodes.size,
    byStatus,
    byFamily,
    registryMissingLayout: missingLayout.length,
    layoutsNotInRegistry: extraLayout.length,
  },
  netNewByFamily: nnf,
  partialDocByFamily: pdf,
  partialAnalyticsByFamily: pa,
  registryMissingLayout: missingLayout,
  netNew: netNew.map((t) => ({ code: t.code, name: t.name, family: t.family })),
  partialDocumentPdf: partialDoc.map((t) => ({ code: t.code, name: t.name, family: t.family })),
  partialAnalytics: partialAnalytics.map((t) => ({ code: t.code, name: t.name, family: t.family })),
};
fs.writeFileSync(path.join(__dirname, 'tmp-report-gap-audit.json'), JSON.stringify(out, null, 2));
console.log('\nwrote scripts/tmp-report-gap-audit.json');
