/**
 * OpenAPI vs frontend API path coverage (read-only analysis).
 * Usage: node docs/scripts/openapi-fe-coverage.mjs <openapi.json> <srcRoot> <outMd>
 */
import fs from 'fs';
import path from 'path';

const [openapiPath, srcRoot, outPath] = process.argv.slice(2);
if (!openapiPath || !srcRoot || !outPath) {
  console.error('Usage: node openapi-fe-coverage.mjs <openapi.json> <srcRoot> <outMd>');
  process.exit(1);
}

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);

/** @param {string} p */
function normalizePath(p) {
  if (!p || typeof p !== 'string') return '';
  let s = p.split('?')[0].trim();
  if (!s.startsWith('/')) {
    const m = s.match(/(\/[a-zA-Z0-9_\-./{}:$]+)/);
    if (!m) return '';
    s = m[1];
  }
  s = s.replace(/\/+$/, '') || '/';
  // Template ${x} before OpenAPI {param} (avoid `$` + `{id}` → `$:id`)
  s = s.replace(/\$\{[^}]+\}/g, ':id');
  s = s.replace(/\{[^}]+\}/g, ':id');
  s = s.replace(/:\w+\([^)]*\)/g, ':id');
  s = s.replace(/\/:[a-zA-Z_][a-zA-Z0-9_]*/g, '/:id');
  return s;
}

/** @param {object} spec */
function extractOpenApiEndpoints(spec) {
  /** @type {{ method: string, path: string, norm: string, tags: string[], summary: string }[]} */
  const endpoints = [];
  const paths = spec.paths || {};
  for (const [rawPath, item] of Object.entries(paths)) {
    if (!item || typeof item !== 'object') continue;
    for (const [method, op] of Object.entries(item)) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue;
      const tags = Array.isArray(op?.tags) ? op.tags : ['(untagged)'];
      const summary = (op?.summary || op?.operationId || '').trim();
      endpoints.push({
        method: method.toUpperCase(),
        path: rawPath,
        norm: normalizePath(rawPath),
        tags,
        summary,
      });
    }
  }
  return endpoints;
}

const API_PREFIXES = [
  '/shipments',
  '/operations',
  '/jobs',
  '/quotations',
  '/crm',
  '/organization',
  '/documentation',
  '/portal',
  '/public',
  '/health',
  '/tenants',
  '/users',
  '/parties',
  '/customers',
  '/invoices',
  '/vouchers',
  '/nvocc',
  '/wms',
  '/transport',
  '/customs',
  '/management',
  '/hr',
  '/files',
  '/search',
  '/locale',
  '/auth',
  '/vendor',
  '/vendors',
  '/gl',
  '/chart',
  '/debit',
  '/credit',
  '/payment',
  '/tariff',
  '/awb',
  '/companies',
  '/favourites',
  '/notifications',
  '/online-payments',
  '/platform',
  '/billing',
  '/super-admin',
  '/superadmin',
];

const SPA_ROUTE_PREFIXES = [
  '/dashboard',
  '/login',
  '/operations/shipments',
  '/customer-service/shipments',
  '/quotations/all',
  '/portal/login',
];

/** @param {string} norm */
function looksLikeApiPath(norm) {
  if (!norm.startsWith('/')) return false;
  if (SPA_ROUTE_PREFIXES.some((p) => norm === p || norm.startsWith(p + '/'))) {
    // Still allow if it's clearly an API path under operations (e.g. /operations/foo API)
    if (norm.startsWith('/operations/shipments')) return false;
  }
  return API_PREFIXES.some((pre) => norm === pre || norm.startsWith(pre + '/'));
}

/** Walk src and collect path strings */
function walkDir(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      walkDir(full, files);
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      files.push(full);
    }
  }
  return files;
}

/** @param {string} content @param {string} file */
function extractFePaths(content, file) {
  const found = new Set();
  const isApiLikeFile =
    /api/i.test(file) ||
    /service/i.test(file) ||
    /Client\.ts$/i.test(file) ||
    file.includes(`${path.sep}lib${path.sep}axios`);

  // Quoted paths starting with /
  const strRe = /(['"`])(\/(?:[^'"`\\]|\\.)*?)\1/g;
  let m;
  while ((m = strRe.exec(content)) !== null) {
    const raw = m[2].replace(/\\`/g, '`').replace(/\\'/g, "'");
    if (raw.includes('\n')) continue;
    collectPath(raw, found, isApiLikeFile);
  }

  // Template literals with /path/${var}/...
  const tplRe = /`(\/(?:[^`\\$]|\\.|(?:\$\{[^}]+\}))+)`/g;
  while ((m = tplRe.exec(content)) !== null) {
    collectPath(m[1], found, true);
  }

  // axios / apiClient method calls with string first arg
  const axiosRe =
    /\.(?:get|post|put|patch|delete|request)\s*\(\s*([`'"])(\/?(?:[^'"`\\]|\\.)*?)\1/gi;
  while ((m = axiosRe.exec(content)) !== null) {
    collectPath(m[2], found, true);
  }

  return found;
}

/** @param {string} raw @param {Set<string>} found @param {boolean} relaxed */
function collectPath(raw, found, relaxed) {
  if (!raw || raw.length > 512) return;
  if (raw.includes('://')) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return;
    }
  }
  if (!raw.startsWith('/')) raw = `/${raw}`;
  const norm = normalizePath(raw);
  if (!norm.startsWith('/')) return;
  if (relaxed || looksLikeApiPath(norm)) {
    found.add(norm);
  } else if (/^\/[a-z][a-z0-9-]*(\/|:id|$)/.test(norm) && !norm.includes('.')) {
    // Heuristic: multi-segment paths likely API
    const segs = norm.split('/').filter(Boolean);
    if (segs.length >= 2) found.add(norm);
  }
}

function endpointCovered(norm, fePaths) {
  if (fePaths.has(norm)) return true;
  // Some FE files use shorter constants; check if any FE path equals or ends with same segments
  for (const fp of fePaths) {
    if (fp === norm) return true;
    // Prefix coverage only for collection endpoints (single segment after root module)
    if (norm.endsWith(fp) && fp.length > 10) return true;
  }
  return false;
}

function primaryTag(tags) {
  return tags[0] || '(untagged)';
}

function tagPriority(tag) {
  const t = tag.toLowerCase();
  if (t.includes('shipment')) return 1;
  if (t.includes('job')) return 2;
  if (t.includes('quotation')) return 3;
  if (t.includes('crm') || t.includes('enquir')) return 4;
  if (t.includes('documentation') || t.includes('document')) return 5;
  if (t.includes('operation')) return 6;
  if (t.includes('organization') || t.includes('org')) return 7;
  if (t.includes('master')) return 8;
  if (t.includes('invoice')) return 9;
  if (t.includes('portal')) return 90;
  if (t.includes('public')) return 91;
  if (t.includes('health')) return 99;
  return 50;
}

function isDeemphasizedTag(tag) {
  const t = tag.toLowerCase();
  return t.includes('portal') || t.includes('public') || t.includes('health');
}

// --- main ---
const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
const endpoints = extractOpenApiEndpoints(spec);

const fePaths = new Set();
const files = walkDir(srcRoot);
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const p of extractFePaths(content, file)) fePaths.add(p);
}

const openapiNormSet = new Set(endpoints.map((e) => `${e.method} ${e.norm}`));

/** @type {Map<string, typeof endpoints>} */
const missingByTag = new Map();
let missingCount = 0;
let coveredCount = 0;

for (const ep of endpoints) {
  if (endpointCovered(ep.norm, fePaths)) {
    coveredCount++;
    continue;
  }
  missingCount++;
  const tag = primaryTag(ep.tags);
  if (!missingByTag.has(tag)) missingByTag.set(tag, []);
  missingByTag.get(tag).push(ep);
}

// FE paths not in OpenAPI
const openapiPathsNorm = new Set(endpoints.map((e) => e.norm));
/** @type {string[]} */
const feOnly = [];
for (const fp of fePaths) {
  if (!looksLikeApiPath(fp)) continue;
  if (!openapiPathsNorm.has(fp)) {
    // method-agnostic: path might exist with different param naming already normalized
    feOnly.push(fp);
  }
}
feOnly.sort();

const sortedTags = [...missingByTag.keys()].sort((a, b) => {
  const pa = tagPriority(a);
  const pb = tagPriority(b);
  if (pa !== pb) return pa - pb;
  return (missingByTag.get(b)?.length || 0) - (missingByTag.get(a)?.length || 0);
});

const staffTags = sortedTags.filter((t) => !isDeemphasizedTag(t));
const otherTags = sortedTags.filter((t) => isDeemphasizedTag(t));

const lines = [];
lines.push('# API coverage gaps (OpenAPI vs FE)');
lines.push('');
lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push('Compares backend OpenAPI operations to normalized API path strings found under `src/` (*api*.ts, services, axios calls, and common `/shipments`, `/jobs`, etc. prefixes). Path params normalized to `:id`.');
lines.push('');
lines.push('## Summary counts');
lines.push('');
lines.push(`| Metric | Count |`);
lines.push(`| --- | ---: |`);
lines.push(`| OpenAPI operations | ${endpoints.length} |`);
lines.push(`| Unique normalized FE paths | ${fePaths.size} |`);
lines.push(`| Operations with FE path match | ${coveredCount} (${((coveredCount / endpoints.length) * 100).toFixed(1)}%) |`);
lines.push(`| **Operations with no FE mention** | **${missingCount}** |`);
lines.push(`| FE API-like paths not in OpenAPI (path only) | ${feOnly.length} |`);
lines.push('');
lines.push('Path-level match (normalized `:id`); a path string in FE counts as coverage for every HTTP method on that OpenAPI path. SPA routes (`/dashboard`, `/login`, `/operations/shipments/*` UI) are excluded from FE extraction heuristics.');
lines.push('');
const allTags = new Set(endpoints.map((e) => primaryTag(e.tags)));
const highlightZeroGap = [
  'Shipments',
  'Operations',
  'CRM Enquiries',
  'CRM Leads',
  'Invoices',
  'Documentation — EDI',
  'Documentation — All Jobs',
  'NVOCC — Jobs',
  'Jobs — Air Workflow',
  'Jobs — Customs Clearance',
].filter((t) => allTags.has(t) && !missingByTag.has(t));
lines.push(
  '**Priority ERP tags with no missing paths:** ' +
    (highlightZeroGap.length ? highlightZeroGap.join(', ') : '(see tag sections below)'),
);
lines.push('');
lines.push('### Top tags by missing operations (staff modules first)');
lines.push('');
for (const tag of staffTags.slice(0, 15)) {
  lines.push(`- **${tag}**: ${missingByTag.get(tag)?.length ?? 0} missing`);
}
if (otherTags.length) {
  lines.push('');
  lines.push('*(Portal / public / health tags listed in separate section below.)*');
}
lines.push('');
lines.push('## Missing by tag (METHOD path — summary)');
lines.push('');

function renderTagSection(tag) {
  const eps = missingByTag.get(tag) || [];
  eps.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  lines.push(`### ${tag} (${eps.length})`);
  lines.push('');
  for (const ep of eps) {
    const sum = ep.summary ? ` — ${ep.summary}` : '';
    lines.push(`- **${ep.method}** \`${ep.path}\`${sum}`);
  }
  lines.push('');
}

for (const tag of staffTags) renderTagSection(tag);

if (otherTags.length) {
  lines.push('---');
  lines.push('');
  lines.push('## Portal, public, and health (de-emphasized)');
  lines.push('');
  for (const tag of otherTags) renderTagSection(tag);
}

lines.push('## FE paths not found in OpenAPI (optional)');
lines.push('');
lines.push('Normalized paths referenced in the frontend that do not match any OpenAPI path (may be deprecated, typo, composite client paths, or method-specific gaps). Limited to API-like prefixes.');
lines.push('');
const feOnlyShow = feOnly.slice(0, 120);
for (const p of feOnlyShow) {
  lines.push(`- \`${p}\``);
}
if (feOnly.length > feOnlyShow.length) {
  lines.push(`- … and ${feOnly.length - feOnlyShow.length} more`);
}
lines.push('');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

console.log(JSON.stringify({
  openapiOperations: endpoints.length,
  fePaths: fePaths.size,
  covered: coveredCount,
  missing: missingCount,
  feOnly: feOnly.length,
  topMissingTags: staffTags.slice(0, 10).map((t) => ({ tag: t, count: missingByTag.get(t)?.length })),
}, null, 2));
