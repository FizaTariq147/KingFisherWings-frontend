/**
 * Phase 1 — Discover Fresa sample-report-formats references.
 *
 * - Fetches https://fresatechnologies.com/sample-report-formats/
 * - Extracts report names (table cells) + PDF/asset hrefs
 * - Probes known upload URL patterns for each named report
 * - Downloads accessible PDFs into tmp/fresa-references/
 * - Writes machine-readable inventory with access status
 *
 * Usage: node scripts/discover-fresa-sample-reports.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { blockSignature } from './lib/fresaLayoutDiversity.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'tmp/fresa-references');
const invDir = path.join(root, 'src/features/reports/data');
const PAGE_URL = 'https://fresatechnologies.com/sample-report-formats/';
const UPLOAD_BASE = 'https://fresatechnologies.com/wp-content/uploads/report-formats/';
const SAMPLE_BASE =
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, 'pdfs'), { recursive: true });

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent':
            'KingFisherWings-ReportDiscovery/1.0 (+local; layout parity audit)',
          Accept: 'text/html,application/pdf,*/*',
        },
        timeout: 45000,
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          redirects < 8
        ) {
          const next = new URL(res.headers.location, url).href;
          res.resume();
          fetchText(next, redirects + 1).then(resolve, reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
            finalUrl: url,
          });
        });
      },
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`timeout ${url}`));
    });
  });
}

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

function candidatePdfUrls(name) {
  const slug = slugify(name);
  const variants = new Set([
    `${UPLOAD_BASE}${slug}.pdf`,
    `${UPLOAD_BASE}${slug.replace(/-report-format/, '-report-fomat')}.pdf`, // known Fresa typo (jasper)
    `${UPLOAD_BASE}${slug.replace(/format-/, 'format')}.pdf`,
  ]);
  // Invoice pattern already uses long slug
  if (/invoice report format/i.test(name)) {
    variants.add(`${UPLOAD_BASE}${slug}.pdf`);
  }
  if (/hbl draft report format jasper/i.test(name)) {
    variants.add(`${UPLOAD_BASE}hbl-draft-report-fomat-jasper.pdf`);
  }
  return [...variants];
}

function inferCategory(name) {
  const n = name.toLowerCase();
  if (/hbl|bill of lading|fg hbl|fcr|sailing|stuffing|shipping instruction|prealert|isf|ams|igm|vgm|rider|guarantee|tally|carting|pickup confirmation|terminal departure|surrendered/i.test(n))
    return 'sea_docs';
  if (/hawb|mawb|air |awb|barcode awb|booking confirmation air|cargo manifest air|air quotation|air freight|air shipment/i.test(n))
    return 'air_docs';
  if (/invoice|debit note|proforma|journal voucher|payment voucher/i.test(n))
    return 'commercial';
  if (/outstanding|aging|trial balance|profit and loss|statement of accounts|gl |ap |ar |bank cash|cheque/i.test(n))
    return 'finance';
  if (/advance shipping|asn|wms|warehouse/i.test(n)) return 'wms';
  if (/quotation|fcl quotation/i.test(n)) return 'quotation';
  if (/arrival notice|delivery order|cargo arrival|delivery confirmation/i.test(n))
    return /air/i.test(n) ? 'air_docs' : 'sea_docs';
  if (/list report|pending |shipments with|job ata|daily status|dsr|manifest not|nomination/i.test(n))
    return 'ops_list';
  return 'other';
}

/** Names from marketing page dump (WebFetch / HTML text). */
function extractNamesFromHtml(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, ' ');
  const lines = text
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const chrome = new Set(
    [
      'Sample Report Formats',
      'MY REPORTS',
      'WMS – ASN',
      'WMS - ASN',
      'U.A.E',
      'Privacy Policy',
      'Fresa Technologies',
      "Let's get into it",
      'Fresa makes it easy',
    ].map((s) => s.toLowerCase()),
  );

  const keep =
    /Report|Invoice|Format|Notice|Quotation|Manifest|HAWB|HBL|MAWB|ASN|WMS|Voucher|Aging|Trial|Outstanding|Stuffing|Prealert|ISF|AMS|FCR|TDR|GL |AP |AR /i;

  const names = [];
  const seen = new Set();
  for (const line of lines) {
    if (line.length < 8 || line.length > 140) continue;
    if (/^\d+\.?$/.test(line)) continue;
    if (chrome.has(line.toLowerCase())) continue;
    if (!keep.test(line)) continue;
    if (/fresatechnologies|sales@|\+91|copyright/i.test(line)) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(line);
  }
  return names;
}

function extractHrefPdfs(html) {
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]);
  return [
    ...new Set(
      hrefs
        .filter((h) => /\.pdf($|\?)/i.test(h) || /report-formats|sample_reports/i.test(h))
        .map((h) => new URL(h, PAGE_URL).href),
    ),
  ];
}

async function probeAndDownload(name, urls) {
  const result = {
    name,
    category: inferCategory(name),
    candidateUrls: urls,
    accessStatus: 'not_found',
    downloadedPath: null,
    httpStatus: null,
    contentType: null,
    byteSize: 0,
    sha256: null,
    error: null,
    referenceVerified: false,
  };

  for (const url of urls) {
    try {
      const res = await fetchText(url);
      result.httpStatus = res.status;
      result.contentType = String(res.headers['content-type'] || '');
      const isPdf =
        res.status === 200 &&
        (result.contentType.includes('pdf') ||
          res.body.slice(0, 5).toString('utf8') === '%PDF-');
      if (!isPdf) {
        if (res.status === 404) continue;
        result.error = `non-pdf status=${res.status} type=${result.contentType}`;
        continue;
      }
      const fileName = `${slugify(name) || 'report'}.pdf`;
      const dest = path.join(outDir, 'pdfs', fileName);
      fs.writeFileSync(dest, res.body);
      result.accessStatus = 'downloaded';
      result.downloadedPath = path.relative(root, dest).replace(/\\/g, '/');
      result.byteSize = res.body.length;
      result.sha256 = createHash('sha256').update(res.body).digest('hex');
      result.referenceVerified = true;
      result.resolvedUrl = res.finalUrl || url;
      return result;
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    }
  }
  if (result.accessStatus === 'not_found' && !result.error) {
    result.error = 'No candidate URL returned a PDF';
  }
  result.accessStatus = result.httpStatus === 403 ? 'forbidden' : 'unavailable';
  return result;
}

function loadLocalLayouts() {
  const files = fs
    .readdirSync(path.join(root, 'src/features/reports/data'))
    .filter((f) => f.endsWith('FormatUiLayouts.json'));
  const byName = new Map();
  const byCode = new Map();
  for (const f of files) {
    const rows = JSON.parse(
      fs.readFileSync(path.join(root, 'src/features/reports/data', f), 'utf8'),
    );
    for (const row of rows) {
      byCode.set(String(row.code || '').toUpperCase(), { ...row, store: f });
      const key = String(row.name || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      if (key && !byName.has(key)) byName.set(key, { ...row, store: f });
    }
  }
  return { byName, byCode };
}

function matchLocal(name, local) {
  const key = name.toLowerCase().replace(/\s+/g, ' ').trim();
  if (local.byName.has(key)) return local.byName.get(key);
  // fuzzy: strip trailing punctuation / spacing diffs
  for (const [k, row] of local.byName) {
    if (k.includes(key) || key.includes(k)) return row;
  }
  return null;
}

// ——— main ———
const pageRes = await fetchText(PAGE_URL);
fs.writeFileSync(path.join(outDir, 'page.html'), pageRes.body);
const html = pageRes.body.toString('utf8');
const pageNames = extractNamesFromHtml(html);
const pagePdfs = extractHrefPdfs(html);

const local = loadLocalLayouts();

/** Also merge curated names from prior audit when HTML scrape is thin. */
const curatedPath = path.join(root, 'scripts/audit-fresa-format-diversity.mjs');
let curated = [];
if (fs.existsSync(curatedPath)) {
  const src = fs.readFileSync(curatedPath, 'utf8');
  const m = src.match(/FRESA_SAMPLE_NAMES\s*=\s*\[([\s\S]*?)\];/);
  if (m) {
    curated = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  }
}

const allNames = [];
const seenName = new Set();
for (const n of [...pageNames, ...curated]) {
  const k = n.toLowerCase();
  if (seenName.has(k)) continue;
  seenName.add(k);
  allNames.push(n);
}

const inventory = {
  sourceUrl: PAGE_URL,
  discoveredAt: new Date().toISOString(),
  pageFetchStatus: pageRes.status,
  pageNameCount: pageNames.length,
  curatedNameCount: curated.length,
  uniqueNameCount: allNames.length,
  pageDirectPdfLinks: pagePdfs,
  reports: [],
  summary: {},
};

console.log(
  `Page status=${pageRes.status} names_from_html=${pageNames.length} curated=${curated.length} unique=${allNames.length} href_pdfs=${pagePdfs.length}`,
);

// Prefer direct page PDF links first (map by filename slug → name later)
const hrefJobs = pagePdfs.map((url) => ({
  name: decodeURIComponent(path.basename(url).replace(/\.pdf$/i, '')).replace(/-/g, ' '),
  urls: [url],
  fromPageHref: true,
}));

const nameJobs = allNames.map((name) => ({
  name,
  urls: candidatePdfUrls(name),
  fromPageHref: false,
}));

const jobs = [...hrefJobs, ...nameJobs];
const reports = [];
let i = 0;
for (const job of jobs) {
  i += 1;
  process.stdout.write(`[${i}/${jobs.length}] ${job.name.slice(0, 60)}… `);
  const row = await probeAndDownload(job.name, job.urls);
  const matched = matchLocal(job.name, local);
  row.fromPageHref = job.fromPageHref;
  row.localCode = matched?.code || null;
  row.localStore = matched?.store || null;
  row.localBlockSignature = matched ? blockSignature(matched.blocks) : null;
  row.implementationStatus = matched
    ? 'has_local_layout'
    : 'missing_local_layout';
  reports.push(row);
  console.log(row.accessStatus, row.byteSize || row.error || '');
  // polite pacing
  await new Promise((r) => setTimeout(r, 80));
}

// Dedupe reports by resolved URL or name
const byKey = new Map();
for (const r of reports) {
  const key = (r.resolvedUrl || r.name).toLowerCase();
  if (!byKey.has(key)) byKey.set(key, r);
}
inventory.reports = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));

const downloaded = inventory.reports.filter((r) => r.accessStatus === 'downloaded');
const unavailable = inventory.reports.filter((r) => r.accessStatus !== 'downloaded');
const withLocal = inventory.reports.filter((r) => r.localCode);
const missingLocal = inventory.reports.filter((r) => !r.localCode);

// Structural uniqueness among local layouts that match page names
const sigGroups = new Map();
for (const r of withLocal) {
  const sig = r.localBlockSignature || 'none';
  if (!sigGroups.has(sig)) sigGroups.set(sig, []);
  sigGroups.get(sig).push(r.localCode);
}

inventory.summary = {
  totalDiscoveredNames: allNames.length,
  totalInventoryRows: inventory.reports.length,
  downloadedReferences: downloaded.length,
  unavailableReferences: unavailable.length,
  matchedLocalLayouts: withLocal.length,
  missingLocalLayouts: missingLocal.length,
  uniqueLocalSignaturesAmongMatched: sigGroups.size,
  duplicateLocalSignatureGroups: [...sigGroups.entries()]
    .filter(([, codes]) => codes.length > 1)
    .map(([sig, codes]) => ({ signature: sig.slice(0, 80), codes })),
};

const invJson = path.join(invDir, 'FRESA_REFERENCE_INVENTORY.json');
fs.writeFileSync(invJson, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(outDir, 'FRESA_REFERENCE_INVENTORY.json'),
  `${JSON.stringify(inventory, null, 2)}\n`,
  'utf8',
);

const md = [
  '# Fresa reference discovery inventory',
  '',
  `Source: ${PAGE_URL}`,
  `Discovered at: ${inventory.discoveredAt}`,
  '',
  '## Summary',
  '',
  `- Names (unique): **${inventory.summary.totalDiscoveredNames}**`,
  `- Inventory rows: **${inventory.summary.totalInventoryRows}**`,
  `- Downloaded PDFs: **${inventory.summary.downloadedReferences}**`,
  `- Unavailable / unverified: **${inventory.summary.unavailableReferences}**`,
  `- Matched local layouts: **${inventory.summary.matchedLocalLayouts}**`,
  `- Missing local layouts: **${inventory.summary.missingLocalLayouts}**`,
  `- Unique local block signatures (matched): **${inventory.summary.uniqueLocalSignaturesAmongMatched}**`,
  `- Duplicate signature groups: **${inventory.summary.duplicateLocalSignatureGroups.length}**`,
  '',
  '## Downloaded (verified reference asset)',
  '',
  ...downloaded.map(
    (r) =>
      `- **${r.name}** → \`${r.downloadedPath}\` (${r.byteSize} bytes)${r.localCode ? ` · local \`${r.localCode}\`` : ' · **no local layout**'}`,
  ),
  '',
  '## Unavailable / unverified (do not invent layouts)',
  '',
  ...unavailable.map(
    (r) =>
      `- **${r.name}** — ${r.accessStatus}${r.error ? `: ${r.error}` : ''}${r.localCode ? ` · local \`${r.localCode}\` (unverified vs reference)` : ''}`,
  ),
  '',
  '## Duplicate local signatures (identical structure risk)',
  '',
  ...(inventory.summary.duplicateLocalSignatureGroups.length
    ? inventory.summary.duplicateLocalSignatureGroups.map(
        (g) => `- ${g.codes.join(', ')}`,
      )
    : ['- none']),
  '',
];
fs.writeFileSync(path.join(outDir, 'FRESA_REFERENCE_INVENTORY.md'), md.join('\n'), 'utf8');
fs.writeFileSync(path.join(invDir, 'FRESA_REFERENCE_INVENTORY.md'), md.join('\n'), 'utf8');

console.log('\n=== SUMMARY ===');
console.log(JSON.stringify(inventory.summary, null, 2));
console.log(`Wrote ${invJson}`);
