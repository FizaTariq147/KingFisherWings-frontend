/**
 * Audit OpenAPI paths vs frontend route string literals.
 *
 * Usage:
 *   node scripts/audit-api-coverage.mjs
 *   node scripts/audit-api-coverage.mjs --file path/to/docs-json.json
 *   API_SCHEMA_URL=https://host/docs-json node scripts/audit-api-coverage.mjs
 *
 * Writes docs/api-coverage-report.md
 */
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_URL = 'https://kingfisherwings-backend.onrender.com/docs-json';
const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const OUT_MD = path.join(ROOT, 'docs', 'api-coverage-report.md');
const OUT_JSON = path.join(ROOT, 'scripts', '_api-coverage.json');

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete']);

/** Focus tags for actionable triage (full inventory still listed). */
const PRIORITY_TAG_RE =
  /^(Jobs|Quotations|Portal|Notifications|NVOCC|Vendor Notifications)/i;

async function loadSpec() {
  const fileIdx = process.argv.indexOf('--file');
  if (fileIdx > -1) {
    return JSON.parse(fs.readFileSync(process.argv[fileIdx + 1], 'utf8'));
  }
  const url = process.env.API_SCHEMA_URL || DEFAULT_URL;
  const res = await fetch(url, { signal: AbortSignal.timeout(180_000) });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
      walkFiles(full, out);
    } else if (/\.(ts|tsx|js|mjs)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/** Collect `/path` and `/path/${…}` style route strings from frontend sources. */
function collectFrontendRoutes(files) {
  const routes = new Set();
  const pathRe =
    /['"`](\/(?:jobs|quotations|portal|notifications|nvocc|masters|auth|vendor|wms|hr|gl|crm|companies|organization|invoices|payment|files|search|tools|public|super-admin|reports|documentation|awb|transport|credit|debit|purchase)[^'"`]*)['"`]/gi;
  const genericRe = /['"`](\/[a-z][a-z0-9_\-/{}$.{}]*)['"`]/gi;

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of [pathRe, genericRe]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        let p = m[1]
          .replace(/\$\{[^}]+\}/g, '{id}')
          .replace(/\/:[A-Za-z_][\w]*/g, '/{id}')
          .replace(/\/\/+/g, '/')
          .split('?')[0];
        if (!p.startsWith('/')) continue;
        if (p.length < 2) continue;
        if (p.includes(' ')) continue;
        // Drop relative imports mistaken as paths
        if (/\.(ts|tsx|js|css|png|svg)$/.test(p)) continue;
        routes.add(p.replace(/\/$/, '') || '/');
      }
    }
  }
  return routes;
}

function normalizeOpenApiPath(p) {
  return p
    .replace(/\{[^}]+\}/g, '{id}')
    .replace(/\/$/, '') || '/';
}

function openApiOps(spec) {
  const ops = [];
  for (const [rawPath, methods] of Object.entries(spec.paths || {})) {
    const norm = normalizeOpenApiPath(rawPath);
    for (const [method, op] of Object.entries(methods || {})) {
      if (!METHODS.has(method)) continue;
      const tags = Array.isArray(op.tags) ? op.tags : ['untagged'];
      ops.push({
        method: method.toUpperCase(),
        path: rawPath,
        norm,
        tag: tags[0] || 'untagged',
        operationId: op.operationId || '',
      });
    }
  }
  return ops;
}

function isCovered(normPath, frontendRoutes) {
  if (frontendRoutes.has(normPath)) return true;
  // Prefix / segment match (e.g. `/jobs` covers `/jobs/{id}`)
  for (const fr of frontendRoutes) {
    if (fr === normPath) return true;
    if (normPath.startsWith(fr + '/') || fr.startsWith(normPath + '/')) return true;
    // Compare without trailing id segments
    const a = normPath.replace(/\/\{id\}/g, '');
    const b = fr.replace(/\/\{id\}/g, '');
    if (a && b && (a === b || a.startsWith(b + '/') || b.startsWith(a + '/'))) return true;
  }
  return false;
}

const spec = await loadSpec();
const files = walkFiles(SRC);
const frontendRoutes = collectFrontendRoutes(files);
const ops = openApiOps(spec);

const missing = [];
const covered = [];
for (const op of ops) {
  if (isCovered(op.norm, frontendRoutes)) covered.push(op);
  else missing.push(op);
}

const priorityMissing = missing.filter((o) => PRIORITY_TAG_RE.test(o.tag));
const byTag = {};
for (const op of missing) {
  byTag[op.tag] = byTag[op.tag] || [];
  byTag[op.tag].push(op);
}

const report = {
  generatedAt: new Date().toISOString(),
  openApiTitle: spec.info?.title,
  openApiVersion: spec.info?.version,
  openApiOps: ops.length,
  frontendRouteLiterals: frontendRoutes.size,
  coveredOps: covered.length,
  missingOps: missing.length,
  priorityMissingOps: priorityMissing.length,
  missingByTag: Object.fromEntries(
    Object.entries(byTag)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([tag, list]) => [
        tag,
        list.map((o) => `${o.method} ${o.path}`),
      ]),
  ),
  priorityMissing: priorityMissing.map((o) => `${o.method} ${o.path} [${o.tag}]`),
};

fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

const md = [
  '# API coverage report',
  '',
  `Generated: ${report.generatedAt}`,
  `OpenAPI: **${report.openApiTitle}** v${report.openApiVersion}`,
  '',
  `| Metric | Count |`,
  `| --- | ---: |`,
  `| OpenAPI operations | ${report.openApiOps} |`,
  `| Frontend route literals | ${report.frontendRouteLiterals} |`,
  `| Covered (heuristic) | ${report.coveredOps} |`,
  `| Missing in frontend | ${report.missingOps} |`,
  `| Priority missing (Jobs/Quotations/Portal/Notifications/NVOCC) | ${report.priorityMissingOps} |`,
  '',
  '## Priority gaps',
  '',
  ...(report.priorityMissing.length
    ? report.priorityMissing.map((l) => `- \`${l}\``)
    : ['- None']),
  '',
  '## Missing by tag',
  '',
  ...Object.entries(report.missingByTag).flatMap(([tag, list]) => [
    `### ${tag} (${list.length})`,
    '',
    ...list.slice(0, 40).map((l) => `- \`${l}\``),
    ...(list.length > 40 ? [`- …and ${list.length - 40} more`] : []),
    '',
  ]),
  '',
  '_Heuristic match: string literals in `src/` vs OpenAPI paths with `{param}` → `{id}`. Masters CRUD often uses a shared client with basePath constants — verify those before treating as truly missing._',
  '',
].join('\n');

fs.writeFileSync(OUT_MD, md);
console.log(
  `Wrote ${path.relative(ROOT, OUT_MD)} and ${path.relative(ROOT, OUT_JSON)} ` +
    `(${report.coveredOps}/${report.openApiOps} covered; ${report.priorityMissingOps} priority gaps).`,
);
