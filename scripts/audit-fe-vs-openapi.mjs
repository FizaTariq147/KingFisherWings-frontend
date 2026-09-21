/**
 * Compare live Nest docs-json vs frontend API path constants / string literals.
 * Usage: node scripts/audit-fe-vs-openapi.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const openapi = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/_live-docs-json.json'), 'utf8'));

function normalizePath(p) {
  return p
    .replace(/\{[^}]+\}/g, ':id')
    .replace(/\/:([A-Za-z0-9_]+)/g, '/:id')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

function opKey(method, p) {
  return `${method.toUpperCase()} ${normalizePath(p)}`;
}

/** Collect OpenAPI operations */
const beOps = new Map(); // key -> { tag, summary, path, method }
for (const [rawPath, methods] of Object.entries(openapi.paths || {})) {
  for (const [method, op] of Object.entries(methods)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    const key = opKey(method, rawPath);
    beOps.set(key, {
      method: method.toUpperCase(),
      path: rawPath,
      tag: (op.tags && op.tags[0]) || 'untagged',
      summary: op.summary || op.operationId || '',
    });
  }
}

/** Walk FE source for path-like strings */
const feFiles = [];
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist' || ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs)$/.test(ent.name)) feFiles.push(full);
  }
}
walk(path.join(ROOT, 'src'));

const pathRe =
  /['"`](\/(?:auth|users|roles|tenants|companies|parties|jobs|quotations|invoices|reports|portal|vendor|nvocc|masters|gl|wms|hr|crm|files|notifications|search|locale|organization|awb|vouchers|cheques|debit|credit|purchase|payment|tariffs|zip|public|tools|documentation|management|transport)[^'"`]*)['"`]/g;

const fePaths = new Set();
const feMentions = new Map(); // normalized path -> count

for (const file of feFiles) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  const re = new RegExp(pathRe.source, 'g');
  while ((m = re.exec(text))) {
    let p = m[1];
    // skip route-only UI paths that aren't API (heuristic: allow known API roots)
    p = p.split('?')[0];
    const n = normalizePath(p.replace(/\$\{[^}]+\}/g, ':id').replace(/`.*$/, ''));
    // Also normalize template literals leftovers
    const clean = n.replace(/\$\{[^}]+\}/g, ':id');
    fePaths.add(clean);
    feMentions.set(clean, (feMentions.get(clean) || 0) + 1);
  }
}

/** Also pull from *api.ts object string values more carefully */
const apiDirFiles = feFiles.filter((f) => /[\\/]api[\\/].*\.ts$/.test(f) || /[\\/].*\.api\.ts$/.test(f));
for (const file of apiDirFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /['"`](\/[a-zA-Z][^'"`]*)['"`]/g;
  let m;
  while ((m = re.exec(text))) {
    let p = m[1];
    if (p.includes('${')) p = p.replace(/\$\{[^}]+\}/g, ':id');
    if (!p.startsWith('/')) continue;
    // skip pure SPA routes without API shape
    if (
      /^\/(login|dashboard|settings|sales|management|customer-service|masters\/[^/]+$)/.test(p) &&
      !p.includes('masters/')
    ) {
      /* keep masters API */
    }
    const n = normalizePath(p);
    if (n.split('/').length < 2) continue;
    fePaths.add(n);
  }
}

/** Match BE ops to FE by path only (method-agnostic coverage) */
const beByNormPath = new Map();
for (const [key, op] of beOps) {
  const np = normalizePath(op.path);
  if (!beByNormPath.has(np)) beByNormPath.set(np, []);
  beByNormPath.get(np).push(op);
}

function feHasPath(np) {
  if (fePaths.has(np)) return true;
  // fuzzy: replace trailing segments
  for (const fp of fePaths) {
    if (fp === np) return true;
    // allow :id vs :requestId already normalized
    if (fp.replace(/:id/g, 'X') === np.replace(/:id/g, 'X')) return true;
  }
  return false;
}

const missingOnFe = [];
const present = [];
for (const [np, ops] of beByNormPath) {
  if (feHasPath(np)) present.push({ path: np, ops });
  else missingOnFe.push({ path: np, ops });
}

/** Group missing by tag */
const missingByTag = {};
for (const row of missingOnFe) {
  const tag = row.ops[0]?.tag || 'untagged';
  if (!missingByTag[tag]) missingByTag[tag] = [];
  missingByTag[tag].push({
    path: row.ops[0].path,
    methods: row.ops.map((o) => o.method).join('|'),
    summary: row.ops.map((o) => o.summary).filter(Boolean).slice(0, 2).join(' / '),
  });
}

const tagStats = Object.entries(missingByTag)
  .map(([tag, rows]) => ({ tag, missingPaths: rows.length, samples: rows.slice(0, 8) }))
  .sort((a, b) => b.missingPaths - a.missingPaths);

/** Reports catalog ops */
const reportOps = [...beOps.values()].filter((o) => (o.tag || '').startsWith('Reports'));
const reportFe = reportOps.filter((o) => feHasPath(normalizePath(o.path)));

const summary = {
  bePaths: beByNormPath.size,
  beOperations: beOps.size,
  fePathLiteralsApprox: fePaths.size,
  coveredBePaths: present.length,
  missingBePaths: missingOnFe.length,
  coveragePct: Math.round((present.length / beByNormPath.size) * 1000) / 10,
  reportsCatalogOps: reportOps.length,
  reportsCatalogFeHits: reportFe.length,
  topMissingTags: tagStats.slice(0, 40),
};

fs.writeFileSync(
  path.join(ROOT, 'scripts/_fe-vs-openapi-report.json'),
  JSON.stringify({ summary, missingByTag }, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
console.log('\nWrote scripts/_fe-vs-openapi-report.json');
