/**
 * Phase 1 — Fresa sample-report-formats reference collector.
 * Does NOT modify application source. Writes only under tmp/fresa-references/.
 *
 * Usage: node scripts/fresa-phase1-collect-references.mjs
 *
 * Env:
 *   FRESA_SKIP_DOWNLOAD=1  — discover + map existing files only
 *   FRESA_MAX_DOWNLOADS=N  — cap new downloads (testing)
 *   FRESA_DELAY_MS=400     — pause between HTTP requests
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_URL = 'https://fresatechnologies.com/sample-report-formats/';
const UPLOAD_BASE = 'https://fresatechnologies.com/wp-content/uploads/report-formats/';
const outRoot = path.join(root, 'tmp/fresa-references');
const pdfDir = path.join(outRoot, 'pdfs');
const otherDir = path.join(outRoot, 'other');
const DELAY_MS = Number(process.env.FRESA_DELAY_MS || 400);
const SKIP_DOWNLOAD = process.env.FRESA_SKIP_DOWNLOAD === '1';
const MAX_DOWNLOADS =
  process.env.FRESA_MAX_DOWNLOADS != null
    ? Number(process.env.FRESA_MAX_DOWNLOADS)
    : Infinity;

fs.mkdirSync(pdfDir, { recursive: true });
fs.mkdirSync(otherDir, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugifyFilename(name) {
  return String(name || 'unnamed')
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 180);
}

function guessCandidatesFromName(name) {
  const base = slugifyFilename(name)
    .replace(/\.pdf$/i, '')
    .replace(/\.xlsx?$/i, '');
  const variants = new Set([
    `${base}.pdf`,
    `${base}.xlsx`,
    `${base.replace(/-format$/, '-report-format')}.pdf`,
    `${base.replace(/report-format$/, 'report-fomat')}.pdf`, // known Fresa typo
  ]);
  // numeric format pads
  const m = base.match(/^(.*?)-(\d+)$/);
  if (m) {
    variants.add(`${m[1]}-${m[2]}.pdf`);
    variants.add(`${m[1]}-report-format-${m[2]}.pdf`);
  }
  return [...variants].map((f) => `${UPLOAD_BASE}${f}`);
}

function extractLinksAndNames(html) {
  const hrefs = new Set();
  const names = new Set();
  const hrefRe = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html))) {
    let u = m[1].replace(/&amp;/g, '&').trim();
    if (u.startsWith('//')) u = `https:${u}`;
    if (u.startsWith('/')) u = `https://fresatechnologies.com${u}`;
    if (/fresatechnologies\.com/i.test(u) && /\.(pdf|xlsx?)(\?|#|$)/i.test(u)) {
      hrefs.add(u.split('#')[0]);
    }
  }
  // Visible list-ish names from anchors / list items
  const textRe =
    />([^<]{4,160}?(?:Report Format|List Report|Invoice|HAWB|HBL|Quotation|Manifest|Arrival|Delivery)[^<]{0,80})</gi;
  while ((m = textRe.exec(html))) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t.length >= 4 && t.length < 160) names.add(t);
  }
  return { hrefs: [...hrefs], names: [...names] };
}

function categorize(name, url) {
  const s = `${name} ${url}`.toLowerCase();
  if (/invoice/.test(s)) return 'invoice';
  if (/hawb|mawb|air waybill/.test(s)) return 'hawb_air';
  if (/\bhbl\b|bill of lading|sea/.test(s)) return 'hbl_sea';
  if (/arrival/.test(s)) return 'arrival_notice';
  if (/delivery order|\bdo\b/.test(s)) return 'delivery_order';
  if (/quotation|quote/.test(s)) return 'quotation';
  if (/wms|warehouse|grn|gate/.test(s)) return 'wms';
  if (/list report|\.xlsx/.test(s)) return 'ops_list';
  if (/trial balance|ledger|voucher|aging|gl |accounts/.test(s)) return 'accounts';
  return 'other';
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'KingFisherWings-FresaCollector/1.0 (+local reference archive; respectful crawl)',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  const text = await res.text();
  return { status: res.status, text, contentType: res.headers.get('content-type') || '' };
}

async function downloadBinary(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'KingFisherWings-FresaCollector/1.0 (+local reference archive; respectful crawl)',
      Accept: 'application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,*/*',
    },
    redirect: 'follow',
  });
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get('content-type') || '';
  const okPdf =
    res.ok &&
    (ct.includes('pdf') ||
      buf.slice(0, 5).toString() === '%PDF-' ||
      /\.pdf(\?|$)/i.test(url));
  const okXlsx =
    res.ok &&
    (ct.includes('spreadsheet') ||
      ct.includes('excel') ||
      /\.xlsx?(\?|$)/i.test(url));
  if (!res.ok || (!okPdf && !okXlsx) || buf.length < 500) {
    return {
      ok: false,
      status: res.status,
      contentType: ct,
      byteSize: buf.length,
      error:
        !res.ok
          ? `HTTP ${res.status}`
          : buf.length < 500
            ? 'Response too small (likely HTML error page)'
            : `Unexpected content-type ${ct || 'unknown'}`,
    };
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  return {
    ok: true,
    status: res.status,
    contentType: ct,
    byteSize: buf.length,
    sha256,
    localPath: path.relative(root, destPath).replace(/\\/g, '/'),
  };
}

function basenameFromUrl(url) {
  try {
    const u = new URL(url);
    return decodeURIComponent(path.basename(u.pathname)) || 'download.bin';
  } catch {
    return 'download.bin';
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  console.log(`[phase1] Fetching ${SOURCE_URL}`);
  const page = await fetchText(SOURCE_URL);
  if (page.status !== 200) {
    throw new Error(`Page fetch failed: HTTP ${page.status}`);
  }
  await sleep(DELAY_MS);

  const { hrefs, names } = extractLinksAndNames(page.text);
  const pagePdfLinks = hrefs.filter((u) => /\.pdf(\?|#|$)/i.test(u));
  const pageXlsxLinks = hrefs.filter((u) => /\.xlsx?(\?|#|$)/i.test(u));

  /** @type {Map<string, { name: string, category: string, candidateUrls: string[], fromPageHref: boolean }>} */
  const byKey = new Map();

  function upsert(name, urls, fromPageHref) {
    const key = name.trim().toLowerCase();
    if (!key) return;
    const existing = byKey.get(key);
    const category = categorize(name, urls[0] || '');
    if (!existing) {
      byKey.set(key, {
        name: name.trim(),
        category,
        candidateUrls: [...new Set(urls)],
        fromPageHref: Boolean(fromPageHref),
      });
      return;
    }
    existing.candidateUrls = [...new Set([...existing.candidateUrls, ...urls])];
    existing.fromPageHref = existing.fromPageHref || Boolean(fromPageHref);
  }

  for (const url of hrefs) {
    const file = basenameFromUrl(url);
    const pretty = file
      .replace(/\.(pdf|xlsx?)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    upsert(pretty || file, [url], true);
  }

  for (const name of names) {
    upsert(name, guessCandidatesFromName(name), false);
  }

  const reports = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  console.log(
    `[phase1] Discovered ${reports.length} unique names; page hrefs pdf=${pagePdfLinks.length} xlsx=${pageXlsxLinks.length}`,
  );

  let downloadsAttempted = 0;
  let downloaded = 0;
  let reused = 0;
  let failed = 0;
  const errors = [];

  const inventory = [];

  for (const row of reports) {
    const entry = {
      name: row.name,
      category: row.category,
      candidateUrls: row.candidateUrls,
      fromPageHref: row.fromPageHref,
      accessStatus: 'pending',
      downloadedPath: null,
      httpStatus: null,
      contentType: null,
      byteSize: 0,
      sha256: null,
      fileType: null,
      error: null,
      referenceVerified: false,
    };

    // Prefer existing local file matching basename of any candidate
    let localHit = null;
    for (const url of row.candidateUrls) {
      const base = basenameFromUrl(url);
      const pdfPath = path.join(pdfDir, base);
      const otherPath = path.join(otherDir, base);
      if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size >= 500) {
        localHit = { path: pdfPath, url, type: path.extname(base).slice(1).toLowerCase() };
        break;
      }
      if (fs.existsSync(otherPath) && fs.statSync(otherPath).size >= 500) {
        localHit = { path: otherPath, url, type: path.extname(base).slice(1).toLowerCase() };
        break;
      }
    }

    if (localHit && (SKIP_DOWNLOAD || true)) {
      // Always reuse valid local files; only download missing
      const buf = fs.readFileSync(localHit.path);
      const looksPdf = buf.slice(0, 5).toString() === '%PDF-';
      const stub = buf.length < 10_000 && looksPdf === false;
      if (looksPdf || /\.xlsx?$/i.test(localHit.path) || buf.length >= 10_000) {
        entry.accessStatus = 'downloaded';
        entry.downloadedPath = path.relative(root, localHit.path).replace(/\\/g, '/');
        entry.byteSize = buf.length;
        entry.sha256 = crypto.createHash('sha256').update(buf).digest('hex');
        entry.fileType = looksPdf ? 'pdf' : localHit.type || 'bin';
        entry.referenceVerified = looksPdf ? buf.length >= 10_000 : buf.length >= 500;
        entry.httpStatus = 200;
        entry.contentType = looksPdf ? 'application/pdf' : 'application/octet-stream';
        reused += 1;
        inventory.push(entry);
        continue;
      }
    }

    if (SKIP_DOWNLOAD) {
      entry.accessStatus = 'unavailable';
      entry.error = 'No local file and FRESA_SKIP_DOWNLOAD=1';
      failed += 1;
      errors.push({ name: row.name, error: entry.error });
      inventory.push(entry);
      continue;
    }

    if (downloadsAttempted >= MAX_DOWNLOADS) {
      entry.accessStatus = 'unavailable';
      entry.error = 'Skipped: FRESA_MAX_DOWNLOADS reached';
      failed += 1;
      errors.push({ name: row.name, error: entry.error });
      inventory.push(entry);
      continue;
    }

    let success = false;
    for (const url of row.candidateUrls) {
      downloadsAttempted += 1;
      const base = basenameFromUrl(url);
      const isPdf = /\.pdf(\?|$)/i.test(url);
      const dest = path.join(isPdf ? pdfDir : otherDir, base);
      console.log(`[phase1] GET ${url}`);
      await sleep(DELAY_MS);
      const result = await downloadBinary(url, dest);
      if (result.ok) {
        entry.accessStatus = 'downloaded';
        entry.downloadedPath = result.localPath;
        entry.httpStatus = result.status;
        entry.contentType = result.contentType;
        entry.byteSize = result.byteSize;
        entry.sha256 = result.sha256;
        entry.fileType = isPdf ? 'pdf' : path.extname(base).slice(1).toLowerCase() || 'bin';
        entry.referenceVerified = isPdf ? result.byteSize >= 10_000 : result.byteSize >= 500;
        entry.error = null;
        downloaded += 1;
        success = true;
        break;
      }
      entry.httpStatus = result.status;
      entry.contentType = result.contentType;
      entry.byteSize = result.byteSize;
      entry.error = `${url} → ${result.error}`;
    }

    if (!success) {
      entry.accessStatus = 'unavailable';
      failed += 1;
      errors.push({ name: row.name, error: entry.error || 'All candidates failed' });
    }
    inventory.push(entry);
  }

  const summary = {
    sourceUrl: SOURCE_URL,
    startedAt,
    finishedAt: new Date().toISOString(),
    pageFetchStatus: page.status,
    uniqueNameCount: reports.length,
    pageDirectPdfLinks: pagePdfLinks.length,
    pageDirectXlsxLinks: pageXlsxLinks.length,
    inventoryRows: inventory.length,
    downloadedNew: downloaded,
    reusedLocal: reused,
    downloadedTotal: inventory.filter((r) => r.accessStatus === 'downloaded').length,
    unavailable: inventory.filter((r) => r.accessStatus === 'unavailable').length,
    verifiedPdfish: inventory.filter((r) => r.referenceVerified && r.fileType === 'pdf').length,
    errorCount: errors.length,
  };

  const manifest = {
    ...summary,
    definitions: {
      downloaded:
        'Local file saved or reused under tmp/fresa-references/ (PDF or spreadsheet).',
      unavailable: 'No usable file after candidate attempts or skip rules.',
      referenceVerified:
        'PDF ≥10KB with %PDF- header, or non-PDF ≥500B — not a claim of visual fidelity.',
    },
    reports: inventory,
    errors,
  };

  const manifestPath = path.join(outRoot, 'REFERENCE_MANIFEST.json');
  const summaryMd = path.join(outRoot, 'REFERENCE_MANIFEST.md');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const md = `# Fresa reference manifest (Phase 1)

Source: ${SOURCE_URL}  
Generated: ${summary.finishedAt}

| Metric | Count |
|--------|------:|
| Unique report names | ${summary.uniqueNameCount} |
| Page PDF hrefs | ${summary.pageDirectPdfLinks} |
| Page XLSX hrefs | ${summary.pageDirectXlsxLinks} |
| Downloaded / reused | ${summary.downloadedTotal} |
| New downloads this run | ${summary.downloadedNew} |
| Reused existing local files | ${summary.reusedLocal} |
| Unavailable / failed | ${summary.unavailable} |
| Verified PDF-sized files | ${summary.verifiedPdfish} |

## Errors (first 40)

${errors
  .slice(0, 40)
  .map((e) => `- **${e.name}**: ${e.error}`)
  .join('\n') || '_None_'}

${errors.length > 40 ? `\n_…and ${errors.length - 40} more in REFERENCE_MANIFEST.json_\n` : ''}

Artifacts: \`tmp/fresa-references/pdfs/\`, \`tmp/fresa-references/other/\`, this manifest.
`;
  fs.writeFileSync(summaryMd, md);

  console.log(JSON.stringify(summary, null, 2));
  console.log(`[phase1] Wrote ${path.relative(root, manifestPath)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
