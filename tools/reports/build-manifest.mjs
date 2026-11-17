/**
 * Phase 0 — pin the Fresa sample page and cluster layouts.
 * Run: node tools/reports/build-manifest.mjs
 */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pageUrl = 'https://fresatechnologies.com/sample-report-formats/';
const outDir = path.join(root, 'reports/references');
const fileDir = path.join(outDir, 'files');
const textDir = path.join(outDir, 'text');
const pngDir = path.join(outDir, 'png');
const localPins = [
  path.join(root, 'src/features/reports/qa/fresa-references/pdfs'),
  path.join(root, 'src/features/reports/qa/fresa-references/xlsx'),
];
const registryFile = path.join(root, 'src/features/reports/data/fresaReportRegistry.generated.ts');
function resolveCode(url, fileName, urlMap, codes) {
  const named = slugCode(fileName || '').replace(/_+$/, '');
  if (named && codes.has(named)) return named;
  const mapped = urlMap.get(String(url).split('?')[0]) || '';
  if (mapped && codes.has(mapped)) return mapped;
  return mapped || named;
}
const IN_PROGRESS = new Set([
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA',
  'FCL_QUOTATION_REPORT_FORMAT',
  'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
  'ACTIVITY_COMPLETED_JOBS_LIST_REPORT_FORMAT',
]);

function csv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function slugCode(name) {
  return name
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function fileTypeOf(url) {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.pdf')) return 'pdf';
  if (clean.endsWith('.xlsx') || clean.endsWith('.xls')) return 'xlsx';
  return 'other';
}

function loadCodes() {
  const registry = fs.readFileSync(registryFile, 'utf8');
  return new Set([...registry.matchAll(/"code": "([^"]+)"/g)].map((match) => match[1]));
}

function loadUrlMap() {
  const best = new Map();
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.ts') || entry.name.endsWith('.json')) files.push(full);
    }
  }
  walk(path.join(root, 'src/features/reports'));
  function consider(url, code, distance) {
    if (!url || !code) return;
    const key = url.split('?')[0];
    const current = best.get(key);
    if (!current || distance < current.distance) best.set(key, { code, distance });
  }
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/https:\/\/fresatechnologies\.com\/[^"'\\\s]+/g)) {
      const url = match[0].replace(/\\u0026/g, '&');
      const beforeStart = Math.max(0, match.index - 1500);
      const before = text.slice(beforeStart, match.index);
      const found = [...before.matchAll(/"(?:code|freightnestCode)": "([^"]+)"/g)];
      if (found.length) {
        const last = found[found.length - 1];
        consider(url, last[1], match.index - (beforeStart + last.index));
      }
      const after = text.slice(match.index, match.index + match[0].length + 300);
      const afterCode = after.match(/"freightnestCode": "([^"]+)"/);
      if (afterCode) consider(url, afterCode[1], afterCode.index);
    }
  }
  return new Map([...best].map(([url, value]) => [url, value.code]));
}

function plain(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rememberLink(byUrl, href, linkText, section, specific) {
  let absolute = href.replace(/&amp;/g, '&');
  try {
    absolute = new URL(absolute, pageUrl).href.split('#')[0];
  } catch {
    return;
  }
  const fileType = fileTypeOf(absolute);
  if (fileType === 'other') return;
  const existing = byUrl.get(absolute);
  if (!existing) {
    byUrl.set(absolute, { section, linkText, sourceUrl: absolute, fileType });
    return;
  }
  if (specific && section) existing.section = section;
  if (!existing.linkText && linkText) existing.linkText = linkText;
}

function parsePage(html) {
  const byUrl = new Map();
  const table = html.match(/<table[\s\S]*?<\/table>/i);
  if (table) {
    let columns = [];
    for (const row of table[0].matchAll(/<tr[\s\S]*?<\/tr>/gi)) {
      const cells = [...row[0].matchAll(/<td[\s\S]*?<\/td>/gi)].map((cell) => cell[0]);
      const headings = cells.map((cell) => {
        const heading = cell.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
        return heading ? plain(heading[1]) : '';
      });
      if (headings.filter(Boolean).length >= 2 && !cells.some((cell) => /<a\b/i.test(cell))) {
        columns = headings;
        continue;
      }
      cells.forEach((cell, index) => {
        const section = headings[index] || columns[index] || '';
        if (/^s\.?\s*no\.?$/i.test(section)) return;
        for (const anchor of cell.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
          rememberLink(byUrl, anchor[1], plain(anchor[2]), section, false);
        }
      });
    }
  }
  for (const list of html.matchAll(
    /<h3[^>]*>((?:(?!<\/?h3)[\s\S])*?)<\/h3>\s*<ol class="report-list[\s\S]*?<\/ol>/gi,
  )) {
    const section = plain(list[1]);
    for (const anchor of list[0].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      rememberLink(byUrl, anchor[1], plain(anchor[2]), section, true);
    }
  }
  for (const anchor of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    rememberLink(byUrl, anchor[1], plain(anchor[2]), '', false);
  }
  return [...byUrl.values()];
}

function findLocal(fileName) {
  const wanted = fileName.toLowerCase();
  for (const dir of localPins) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (name.toLowerCase() === wanted) return path.join(dir, name);
    }
  }
  return null;
}

async function obtain(url, dest) {
  const base = path.basename(new URL(url).pathname);
  const safe = decodeURIComponent(base).replace(/[<>:"|?*]/g, '_');
  const target = path.join(dest, safe);
  if (fs.existsSync(target) && fs.statSync(target).size > 0) {
    return { path: target, source: 'already-pinned', error: '' };
  }
  const local = findLocal(safe);
  if (local) {
    fs.copyFileSync(local, target);
    return { path: target, source: 'local-pin', error: '' };
  }
  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) return { path: '', source: 'download', error: `HTTP ${response.status}` };
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) return { path: '', source: 'download', error: 'empty body' };
    fs.writeFileSync(target, bytes);
    return { path: target, source: 'download', error: '' };
  } catch (error) {
    return { path: '', source: 'download', error: error instanceof Error ? error.message : 'download failed' };
  }
}

function sha256(filePath) {
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function identityCtm() {
  return [1, 0, 0, 1, 0, 0];
}

function multiplyCtm(ctm, matrix) {
  const [a0, b0, c0, d0, e0, f0] = ctm;
  const [a, b, c, d, e, f] = matrix;
  return [
    a0 * a + c0 * b,
    b0 * a + d0 * b,
    a0 * c + c0 * d,
    b0 * c + d0 * d,
    a0 * e + c0 * f + e0,
    b0 * e + d0 * f + f0,
  ];
}

function mapPoint(ctm, x, y) {
  return [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]];
}

function matrixOf(args) {
  const raw = args && args.length === 6 ? args : args && args[0] && args[0].length === 6 ? args[0] : null;
  if (!raw) return null;
  return [0, 1, 2, 3, 4, 5].map((index) => Number(raw[index]) || 0);
}

function quant(value) {
  return Math.round(Number(value));
}

function pushBox(rects, lines, minX, minY, maxX, maxY) {
  const width = maxX - minX;
  const height = maxY - minY;
  if (width > 2 && height > 2) rects.push([quant(minX), quant(minY), quant(width), quant(height)]);
  else if (width > 4 && height >= 0.15 && height <= 2.5) {
    lines.push([quant(minX), quant(minY + height / 2), quant(maxX), quant(minY + height / 2)]);
  } else if (height > 4 && width >= 0.15 && width <= 2.5) {
    lines.push([quant(minX + width / 2), quant(minY), quant(minX + width / 2), quant(maxY)]);
  }
}

function shapesFromPath(ops, nums, ctm) {
  const rects = [];
  const lines = [];
  let j = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let points = [];
  function commit(closed) {
    if (points.length < 2) {
      points = [];
      return;
    }
    const mapped = points.map((point) => mapPoint(ctm, point[0], point[1]));
    if (closed) mapped.push(mapped[0]);
    const xs = mapped.map((point) => point[0]);
    const ys = mapped.map((point) => point[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const axis = mapped.every((point, index) => {
      if (index === 0) return true;
      const prev = mapped[index - 1];
      return Math.abs(point[0] - prev[0]) < 0.8 || Math.abs(point[1] - prev[1]) < 0.8;
    });
    if (closed && axis && mapped.length >= 4 && mapped.length <= 8) {
      pushBox(rects, lines, minX, minY, maxX, maxY);
    } else if (axis) {
      for (let index = 1; index < mapped.length; index += 1) {
        const prev = mapped[index - 1];
        const point = mapped[index];
        if (Math.hypot(point[0] - prev[0], point[1] - prev[1]) < 2) continue;
        lines.push([quant(prev[0]), quant(prev[1]), quant(point[0]), quant(point[1])]);
      }
    }
    points = [];
  }
  for (const op of ops) {
    if (op === 19) {
      commit(false);
      const rx = nums[j++];
      const ry = nums[j++];
      const width = nums[j++];
      const height = nums[j++];
      const corners = [
        mapPoint(ctm, rx, ry),
        mapPoint(ctm, rx + width, ry),
        mapPoint(ctm, rx, ry + height),
        mapPoint(ctm, rx + width, ry + height),
      ];
      pushBox(
        rects,
        lines,
        Math.min(...corners.map((point) => point[0])),
        Math.min(...corners.map((point) => point[1])),
        Math.max(...corners.map((point) => point[0])),
        Math.max(...corners.map((point) => point[1])),
      );
    } else if (op === 13) {
      commit(false);
      x = nums[j++];
      y = nums[j++];
      startX = x;
      startY = y;
      points = [[x, y]];
    } else if (op === 14) {
      x = nums[j++];
      y = nums[j++];
      points.push([x, y]);
    } else if (op === 15) {
      j += 6;
      x = nums[j - 2];
      y = nums[j - 1];
    } else if (op === 16 || op === 17) {
      j += 4;
      x = nums[j - 2];
      y = nums[j - 1];
    } else if (op === 18) {
      commit(true);
      x = startX;
      y = startY;
    }
  }
  commit(false);
  return { rects, lines };
}

function geometryKey(ops) {
  const rects = [];
  const lines = [];
  const stack = [identityCtm()];
  const fns = ops.fnArray || [];
  const args = ops.argsArray || [];
  for (let i = 0; i < fns.length; i += 1) {
    const fn = fns[i];
    if (fn === 10) stack.push(stack[stack.length - 1].slice());
    else if (fn === 11) stack.pop();
    else if (fn === 12) {
      const matrix = matrixOf(args[i]);
      if (matrix) stack[stack.length - 1] = multiplyCtm(stack[stack.length - 1], matrix);
    } else if (fn === 91 || fn === 19) {
      const raw = args[i];
      const pathOps = fn === 19 ? [19] : raw?.[0];
      const nums = fn === 19 ? raw : raw?.[1];
      if (!pathOps || !nums) continue;
      const shaped = shapesFromPath(pathOps, nums, stack[stack.length - 1] || identityCtm());
      rects.push(...shaped.rects);
      lines.push(...shaped.lines);
    }
  }
  const body = [
    ...rects.map((item) => `R${item.join(',')}`),
    ...lines.map((item) => `L${item.join(',')}`),
  ]
    .sort()
    .slice(0, 900);
  return { body: body.join(';'), shapes: rects.length + lines.length, rects, lines };
}

function detailRowYs(lines) {
  const ys = [
    ...new Set(
      lines.filter((line) => Math.abs(line[1] - line[3]) <= 1).map((line) => line[1]),
    ),
  ].sort((a, b) => a - b);
  const present = new Set(ys);
  const drop = new Set();
  for (let i = 0; i < ys.length; i += 1) {
    for (let j = i + 1; j < Math.min(ys.length, i + 8); j += 1) {
      const step = ys[j] - ys[i];
      if (step < 8 || step > 36) continue;
      const run = [ys[i]];
      let expected = ys[i] + step;
      while (expected <= ys[ys.length - 1] + step) {
        const hit = [expected - 1, expected, expected + 1].find((y) => present.has(y));
        if (hit == null) break;
        run.push(hit);
        expected = hit + step;
      }
      if (run.length >= 3) for (const y of run) drop.add(y);
    }
  }
  return drop;
}

/** Same geometry as the strict key, without repeating detail-row rules. */
export function normalizedGeometryBody(rects, lines) {
  const drop = detailRowYs(lines);
  const ys = [...drop];
  const minY = ys.length ? Math.min(...ys) : null;
  const maxY = ys.length ? Math.max(...ys) : null;
  const kept = lines.filter((line) => {
    const horizontal = Math.abs(line[1] - line[3]) <= 1;
    if (horizontal && drop.has(line[1])) return false;
    if (minY == null) return true;
    const y1 = Math.min(line[1], line[3]);
    const y2 = Math.max(line[1], line[3]);
    const vertical = Math.abs(line[0] - line[2]) <= 1;
    if (vertical && y1 >= minY - 1 && y2 <= maxY + 1) return false;
    return true;
  });
  return [
    ...rects.map((item) => `R${item.join(',')}`),
    ...kept.map((item) => `L${item.join(',')}`),
  ]
    .sort()
    .slice(0, 900)
    .join(';');
}

async function inspectPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const view = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();
  const labels = [];
  for (const item of content.items) {
    if (!('str' in item)) continue;
    const text = String(item.str || '').replace(/\s+/g, ' ').trim();
    if (text.length < 2 || text.length > 60) continue;
    if (!/[A-Za-z]/.test(text)) continue;
    if ((text.match(/\d/g) || []).length > 4) continue;
    labels.push(text);
  }
  const geometry = geometryKey(await page.getOperatorList());
  const uniqueLabels = [...new Set(labels)].sort();
  const fingerprint = createHash('sha256')
    .update(`${Math.round(view.width)}x${Math.round(view.height)}|${geometry.body}`)
    .digest('hex')
    .slice(0, 16);
  return {
    pages: doc.numPages,
    textItems: content.items.length,
    scanned: content.items.filter((item) => 'str' in item && String(item.str || '').trim()).length < 8,
    width: Math.round(view.width * 10) / 10,
    height: Math.round(view.height * 10) / 10,
    labels: uniqueLabels,
    fingerprint,
    shapes: geometry.shapes,
  };
}

function rasterize(pdfPath, stem) {
  const textOut = path.join(textDir, `${stem}.txt`);
  const hasPng = fs.readdirSync(pngDir).some((name) => name.startsWith(`${stem}-`) && name.endsWith('.png'));
  if (fs.existsSync(textOut) && fs.statSync(textOut).size > 0 && hasPng) return [];
  const pdftotext = spawnSync('pdftotext', ['-layout', pdfPath, textOut], {
    encoding: 'utf8',
  });
  const pdftoppm = spawnSync('pdftoppm', ['-png', '-r', '150', pdfPath, path.join(pngDir, stem)], {
    encoding: 'utf8',
  });
  const errors = [];
  if (pdftotext.error || pdftotext.status !== 0) {
    errors.push(`pdftotext ${pdftotext.error?.message || pdftotext.stderr || pdftotext.status}`);
  }
  if (pdftoppm.error || pdftoppm.status !== 0) {
    errors.push(`pdftoppm ${pdftoppm.error?.message || pdftoppm.stderr || pdftoppm.status}`);
  }
  return errors;
}

async function main() {
const codes = loadCodes();
const urlMap = loadUrlMap();
fs.mkdirSync(fileDir, { recursive: true });
fs.mkdirSync(textDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });

const html = await (await fetch(pageUrl)).text();
fs.writeFileSync(path.join(outDir, 'page-snapshot.html'), html);
const links = parsePage(html).filter((link) => !/Fresa_Gold_Profile/i.test(link.sourceUrl));
const failures = [];
const rows = [];
const downloadedAt = new Date().toISOString();

for (const link of links) {
  const got = await obtain(link.sourceUrl, fileDir);
  if (!got.path) {
    failures.push({ ...link, error: got.error });
    rows.push({
      ...link,
      code: resolveCode(link.sourceUrl, path.basename(link.sourceUrl), urlMap, codes),
      localPath: '',
      sha256: '',
      downloadedAt,
      status: 'download_failed',
      error: got.error,
    });
    console.error('FAIL', link.sourceUrl, got.error);
    continue;
  }
  const code = resolveCode(link.sourceUrl, path.basename(got.path), urlMap, codes);
  rows.push({
    ...link,
    code,
    localPath: path.relative(root, got.path).replace(/\\/g, '/'),
    sha256: sha256(got.path),
    downloadedAt,
    status: IN_PROGRESS.has(code) ? 'in_progress' : 'reference_only',
    source: got.source,
    error: '',
  });
  console.log(got.source, path.basename(got.path));
}

for (const row of rows) {
  if (row.fileType !== 'pdf' || !row.localPath) continue;
  const full = path.join(root, row.localPath);
  try {
    const info = await inspectPdf(full);
    row.pages = info.pages;
    row.fingerprint = info.fingerprint;
    row.labels = info.labels;
    row.shapes = info.shapes;
    row.pageSize = `${info.width}x${info.height}`;
    if (info.scanned) row.status = 'needs_manual';
    const stem = path.basename(full, path.extname(full)).replace(/[^\w.-]+/g, '_');
    row.rasterErrors = rasterize(full, stem).join(' | ');
    if (row.rasterErrors) failures.push({ sourceUrl: row.sourceUrl, error: row.rasterErrors });
  } catch (error) {
    row.status = 'needs_manual';
    row.rasterErrors = error instanceof Error ? error.message : 'inspect failed';
    failures.push({ sourceUrl: row.sourceUrl, error: row.rasterErrors });
  }
}

const manifestHeader = [
  'code',
  'section',
  'link_text',
  'source_url',
  'file_type',
  'local_path',
  'sha256',
  'downloaded_at',
  'status',
];
fs.writeFileSync(
  path.join(outDir, 'manifest.csv'),
  [
    manifestHeader.join(','),
    ...rows.map((row) =>
      [
        row.code,
        row.section,
        row.linkText,
        row.sourceUrl,
        row.fileType,
        row.localPath,
        row.sha256,
        row.downloadedAt,
        row.status,
      ]
        .map(csv)
        .join(','),
    ),
  ].join('\n'),
);

const matched = new Set(rows.filter((row) => codes.has(row.code)).map((row) => row.code));
const unmatched = [
  'direction,code,source_url,reason',
  ...rows
    .filter((row) => !codes.has(row.code))
    .map((row) => ['reference_without_code', row.code, row.sourceUrl, 'no registered catalogue code'].map(csv).join(',')),
  ...[...codes]
    .filter((code) => !matched.has(code))
    .map((code) => ['code_without_reference', code, '', 'no file on the sample page'].map(csv).join(',')),
];
fs.writeFileSync(path.join(outDir, 'unmatched.csv'), unmatched.join('\n'));

const clusters = new Map();
for (const row of rows) {
  if (!row.fingerprint) continue;
  if (!clusters.has(row.fingerprint)) clusters.set(row.fingerprint, []);
  clusters.get(row.fingerprint).push(row);
}
const layouts = [['layout_id', 'member_codes', 'member_files', 'delta', 'priority']];
let index = 1;
const priorityOf = (code) => {
  if (/INVOICE|PROFORMA/.test(code)) return '1-invoice';
  if (/JOB_CARD|PROFIT_AND_LOSS|JOB_PL/.test(code)) return '2-job';
  if (/QUOTATION/.test(code)) return '3-quotation';
  if (/ARRIVAL|DELIVERY|MANIFEST/.test(code)) return '4-arrival-do-manifest';
  if (/HBL|MAWB|HAWB/.test(code)) return '5-bl-awb';
  if (/VOUCHER|STATEMENT|LETTER/.test(code)) return '6-voucher-letter';
  if (/XLSX|LIST_REPORT/.test(code)) return '8-excel';
  return '7-other';
};
for (const [id, members] of [...clusters.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const labelSets = members.map((member) => new Set(member.labels || []));
  const shared = [...labelSets[0]].filter((label) => labelSets.every((set) => set.has(label)));
  const delta = [];
  members.forEach((member, memberIndex) => {
    const extra = (member.labels || []).filter((label) => !shared.includes(label)).slice(0, 8);
    if (extra.length) delta.push(`${member.code}: ${extra.join(' / ')}`);
    void memberIndex;
  });
  layouts.push([
    `L${String(index).padStart(3, '0')}-${id}`,
    members.map((member) => member.code).join('|'),
    members.map((member) => path.basename(member.localPath || '')).join('|'),
    delta.join(' || ') || 'same labels',
    priorityOf(members[0].code || ''),
  ].map(csv).join(','));
  index += 1;
}
fs.writeFileSync(path.join(outDir, 'layouts.csv'), layouts.join('\n'));
fs.writeFileSync(path.join(outDir, 'failures.log'), failures.map((item) => `${item.error} ${item.sourceUrl}`).join('\n'));

const pngNames = fs.readdirSync(pngDir);
let missingText = 0;
let missingPng = 0;
for (const row of rows) {
  if (row.fileType !== 'pdf' || !row.localPath) continue;
  const stem = path.basename(row.localPath, path.extname(row.localPath)).replace(/[^\w.-]+/g, '_');
  if (!fs.existsSync(path.join(textDir, `${stem}.txt`))) missingText += 1;
  if (!pngNames.some((name) => name.startsWith(`${stem}-`) && name.endsWith('.png'))) missingPng += 1;
}

const summary = {
  pageLinks: links.length,
  pinned: rows.filter((row) => row.sha256).length,
  downloadFailed: rows.filter((row) => row.status === 'download_failed').length,
  pdf: rows.filter((row) => row.fileType === 'pdf' && row.sha256).length,
  xlsx: rows.filter((row) => row.fileType === 'xlsx' && row.sha256).length,
  scanned: rows.filter((row) => row.status === 'needs_manual').length,
  uniqueLayouts: clusters.size,
  multiMemberLayouts: [...clusters.values()].filter((members) => members.length > 1).length,
  medianShapes: (() => {
    const counts = rows.map((row) => row.shapes).filter((value) => typeof value === 'number').sort((a, b) => a - b);
    return counts.length ? counts[Math.floor(counts.length / 2)] : 0;
  })(),
  catalogueCodes: codes.size,
  referenceWithoutCode: rows.filter((row) => !codes.has(row.code)).length,
  codeWithoutReference: [...codes].filter((code) => !matched.has(code)).length,
  missingText,
  missingPng,
};
fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
}

const invoked =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) await main();

export async function fingerprintPdf(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await getDocument({ data, disableWorker: true, useSystemFonts: true }).promise;
  const page = await doc.getPage(1);
  const view = page.getViewport({ scale: 1 });
  const geometry = geometryKey(await page.getOperatorList());
  const size = `${Math.round(view.width)}x${Math.round(view.height)}`;
  const hash = (body) =>
    createHash('sha256').update(`${size}|${body}`).digest('hex').slice(0, 16);
  return {
    strict: hash(geometry.body),
    detailNormalized: hash(normalizedGeometryBody(geometry.rects, geometry.lines)),
  };
}

export { parsePage };
