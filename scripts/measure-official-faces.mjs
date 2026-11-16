/**
 * Measure local (and missing catalogue) Fresa samples into native face specs.
 * HAWB PDFs are skipped — those five faces stay hand-built.
 *
 * Run: node scripts/measure-official-faces.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF_DIR = path.join(root, 'src/features/reports/qa/fresa-references/pdfs');
const XLSX_DIR = path.join(root, 'src/features/reports/qa/fresa-references/xlsx');
const SRC = path.join(root, 'src/features/reports');
const HAWB_LOCK = new Set([
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
]);

const LABEL_KEYS = [
  [/shipper/i, 'shipper'],
  [/consignee/i, 'consignee'],
  [/notify party|^notify\b/i, 'notify'],
  [/job\s*(no|number)/i, 'jobNumber'],
  [/invoice\s*(no|number)/i, 'invoiceNumber'],
  [/h\.?a\.?w\.?b|house air/i, 'hawbNo'],
  [/h\.?b\.?l|bill of lading|b\/l no/i, 'hblNo'],
  [/m\.?a\.?w\.?b/i, 'mawbNo'],
  [/reference/i, 'referenceNo'],
];

function round(n) {
  return Math.round(Number(n) * 10) / 10;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|md|txt)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function normFile(name) {
  return decodeURIComponent(name).replace(/\s+/g, ' ').trim().toLowerCase();
}

function slugCode(name) {
  return name
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/%20/g, ' ')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
    .slice(0, 80);
}

function familyFor(code) {
  const c = code.toUpperCase();
  if (/HBL/.test(c)) return 'hbl';
  if (/DELIVERY|PROOF_OF_DELIVERY|^DO_/.test(c)) return 'delivery_order';
  if (/ADVANCE_SHIPPING|^WMS_/.test(c)) return 'wms_asn';
  if (/ARRIVAL|CARGO_ARRIVAL/.test(c)) return 'arrival_notice';
  if (/INVOICE|PROFORMA|DEBIT_NOTE|CREDIT_NOTE|PURCHASE_INVOICE/.test(c)) return 'invoice';
  if (/VOUCHER|TRIAL_BALANCE|PROFIT_AND_LOSS|^GL_|OUTSTANDING|AGING|STATEMENT_OF_ACCOUNTS/.test(c))
    return 'accounts';
  if (/QUOTATION/.test(c)) return 'quotation';
  if (/MAWB/.test(c)) return 'mawb';
  if (/LIST_REPORT|DAILY_STATUS|JOB_LIST|SHIPMENTS_WITH|PENDING_/.test(c)) return 'my_reports';
  return 'other';
}

function loadRegistryNames() {
  const text = fs.readFileSync(
    path.join(SRC, 'data/fresaReportRegistry.generated.ts'),
    'utf8',
  );
  const byName = new Map();
  const re = /"code": "([^"]+)",\s*"name": "([^"]+)"/g;
  for (const match of text.matchAll(re)) {
    byName.set(match[2].trim().toLowerCase(), match[1]);
  }
  return byName;
}

function loadUrlCodes() {
  const map = new Map();
  const files = walk(SRC);
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const re =
      /code:\s*['"]([A-Z0-9_]+)['"][\s\S]{0,400}?samplePdfUrl:\s*(?:`([^`]+)`|'([^']+)'|"([^"]+)")/g;
    for (const match of text.matchAll(re)) {
      const url = match[2] || match[3] || match[4] || '';
      const base = normFile(path.basename(url.split('?')[0]));
      if (base.endsWith('.pdf') || base.endsWith('.xlsx')) map.set(base, match[1]);
    }
    const re2 =
      /"code": "([A-Z0-9_]+)"[\s\S]{0,500}?"samplePdfUrl": "([^"]+)"/g;
    for (const match of text.matchAll(re2)) {
      const base = normFile(path.basename(match[2].split('?')[0]));
      if (!map.has(base)) map.set(base, match[1]);
    }
  }
  return map;
}

function fresaPageLinks() {
  const candidates = [
    path.join(
      process.env.USERPROFILE || '',
      '.cursor/projects/d-KingFisherWings-frontend/agent-tools',
    ),
  ];
  const links = [];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith('.txt')) continue;
      const text = fs.readFileSync(path.join(dir, name), 'utf8');
      const re = /\[([^\]]+)\]\((https:\/\/fresatechnologies\.com\/[^)]+\.(?:pdf|xlsx))\)/gi;
      for (const match of text.matchAll(re)) {
        links.push({ name: match[1].replace(/\s+/g, ' ').trim(), url: match[2] });
      }
    }
  }
  return links;
}

function unzip(buf) {
  const files = {};
  let offset = 0;
  while (offset + 30 < buf.length) {
    if (buf.readUInt32LE(offset) !== 0x04034b50) break;
    const flags = buf.readUInt16LE(offset + 6);
    const method = buf.readUInt16LE(offset + 8);
    let compSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const name = buf.slice(offset + 30, offset + 30 + nameLen).toString('utf8');
    const start = offset + 30 + nameLen + extraLen;
    if (flags & 0x08 && compSize === 0) break;
    const comp = buf.slice(start, start + compSize);
    let data = comp;
    if (method === 8) data = zlib.inflateRawSync(comp);
    files[name] = data;
    offset = start + compSize;
  }
  return files;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function xlsxHeaders(buf) {
  const files = unzip(buf);
  const shared = files['xl/sharedStrings.xml']?.toString('utf8') || '';
  const strings = [...shared.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map((match) => decodeXml(match[1]));
  const sheetName =
    (files['xl/workbook.xml']?.toString('utf8').match(/sheet name="([^"]+)"/) || [])[1] ||
    'Report';
  const sheet = Object.keys(files).find((name) => /xl\/worksheets\/sheet1\.xml$/.test(name));
  const xml = sheet ? files[sheet].toString('utf8') : '';
  const row =
    xml.match(/<row\b[^>]*\br="1"[^>]*>([\s\S]*?)<\/row>/) ||
    xml.match(/<row\b[^>]*>([\s\S]*?)<\/row>/);
  if (!row) return { sheetName, headers: strings.slice(0, 24).filter(Boolean) };
  const headers = [];
  for (const cell of row[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
    const attrs = cell[1];
    const body = cell[2];
    const inline = body.match(/<t[^>]*>([^<]*)<\/t>/);
    if (inline) {
      headers.push(decodeXml(inline[1]));
      continue;
    }
    const value = body.match(/<v>(\d+)<\/v>/);
    if (value && /t="s"/.test(attrs)) headers.push(strings[Number(value[1])] || '');
    else if (value && !/t="s"/.test(attrs)) headers.push(value[1]);
  }
  return { sheetName, headers: headers.map((header) => header.trim()).filter(Boolean) };
}

async function measurePdf(buf) {
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;
  const pageCount = doc.numPages;
  const pages = [];
  let widthPt = 595;
  let heightPt = 842;
  for (let index = 1; index <= Math.min(pageCount, 2); index += 1) {
    const page = await doc.getPage(index);
    const viewport = page.getViewport({ scale: 1 });
    if (index === 1) {
      widthPt = round(viewport.width);
      heightPt = round(viewport.height);
    }
    const rects = [];
    const lines = [];
    const op = await page.getOperatorList();
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < op.fnArray.length; i += 1) {
      const fn = op.fnArray[i];
      const args = op.argsArray[i];
      if (fn === 19 && args && rects.length < 220) {
        const [x, y, w, h] = args;
        if (Math.abs(w) > 1 && Math.abs(h) > 1 && Math.abs(w) < viewport.width && Math.abs(h) < viewport.height) {
          rects.push([round(x), round(y), round(Math.abs(w)), round(Math.abs(h))]);
        }
      } else if (fn === 13 && args) {
        cx = args[0];
        cy = args[1];
      } else if (fn === 14 && args && lines.length < 180) {
        lines.push([round(cx), round(cy), round(args[0]), round(args[1])]);
        cx = args[0];
        cy = args[1];
      }
    }
    const texts = [];
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!item || !item.str || !item.str.trim()) continue;
      if (/fresa/i.test(item.str)) continue;
      if (texts.length >= 260) break;
      const transform = item.transform || [8, 0, 0, 8, 0, 0];
      texts.push([
        item.str.trim().replace(/\s+/g, ' ').slice(0, 120),
        round(transform[4]),
        round(transform[5]),
        round(Math.abs(transform[3]) || Math.abs(transform[0]) || 8),
      ]);
    }
    pages.push({ rects, lines, texts });
    page.cleanup();
  }
  await doc.destroy();
  return { pageCount, widthPt, heightPt, pages };
}

function brandingSlot(pages, heightPt) {
  const texts = pages[0]?.texts || [];
  const top = [...texts].sort((a, b) => b[2] - a[2]).slice(0, 8);
  const hit = top.find((run) => run[0].length > 4) || top[0];
  if (!hit) return { x: 36, y: round(heightPt - 48), size: 11 };
  return { x: Math.max(24, hit[1]), y: hit[2], size: Math.max(9, Math.min(hit[3], 14)) };
}

function fieldSlots(pages) {
  const slots = [];
  const seen = new Set();
  for (const [text, x, y, size] of pages[0]?.texts || []) {
    for (const [pattern, key] of LABEL_KEYS) {
      if (seen.has(key) || !pattern.test(text)) continue;
      seen.add(key);
      slots.push({ key, x: round(x + 70), y, size: Math.min(size || 8, 9) });
    }
  }
  return slots;
}

async function download(url, dest) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const buf = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf;
}

async function mapPool(items, limit, worker) {
  const queue = items.slice();
  const runners = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

function writeTs(file, importLine, exportName, value) {
  const body = JSON.stringify(value);
  fs.writeFileSync(
    file,
    `${importLine}\n\nexport const ${exportName} = ${body};\n`,
  );
}

async function main() {
  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(XLSX_DIR, { recursive: true });
  const byName = loadRegistryNames();
  const byFile = loadUrlCodes();
  const pageLinks = fresaPageLinks();
  for (const link of pageLinks) {
    const base = normFile(path.basename(link.url.split('?')[0]));
    const code = byName.get(link.name.toLowerCase()) || byFile.get(base);
    if (code && !byFile.has(base)) byFile.set(base, code);
    else if (!byFile.has(base)) byFile.set(base, slugCode(base));
  }

  const localPdfs = fs.readdirSync(REF_DIR).filter((name) => name.toLowerCase().endsWith('.pdf'));
  const have = new Set(localPdfs.map((name) => normFile(name)));

  const catalogUrls = [];
  for (const file of walk(SRC)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/https:\/\/fresatechnologies\.com\/[^"'`\s)]+\.(?:pdf|xlsx)/gi)) {
      catalogUrls.push(match[0]);
    }
  }
  const missing = [];
  for (const url of [...pageLinks.map((link) => link.url), ...catalogUrls]) {
    const base = path.basename(decodeURIComponent(url.split('?')[0]));
    if (have.has(normFile(base))) continue;
    if (/^hawb-/i.test(base)) continue;
    if (missing.some((item) => normFile(item.base) === normFile(base))) continue;
    missing.push({ url, base });
    have.add(normFile(base));
  }
  console.log(`local pdfs ${localPdfs.length}; page links ${pageLinks.length}; missing ${missing.length}`);
  await mapPool(missing, 6, async (item) => {
    const dest = path.join(item.url.toLowerCase().includes('.xlsx') ? XLSX_DIR : REF_DIR, item.base);
    if (fs.existsSync(dest)) return;
    try {
      await download(item.url, dest);
      console.log('downloaded', item.base);
    } catch (error) {
      console.warn('skip', item.base, error instanceof Error ? error.message : error);
    }
  });

  const faces = [];
  const used = new Set();
  const pdfs = fs.readdirSync(REF_DIR).filter((name) => name.toLowerCase().endsWith('.pdf'));
  for (const fileName of pdfs) {
    if (/^hawb-/i.test(fileName)) continue;
    let code = byFile.get(normFile(fileName)) || slugCode(fileName);
    if (HAWB_LOCK.has(code) || /^HAWB_/i.test(code)) continue;
    if (used.has(code)) code = `${code}_REF`;
    if (used.has(code)) continue;
    used.add(code);
    try {
      const measured = await measurePdf(fs.readFileSync(path.join(REF_DIR, fileName)));
      const sample = [...byFile.entries()].find(([, value]) => value === code);
      faces.push({
        code,
        name: code.replace(/_/g, ' '),
        family: familyFor(code),
        referenceFile: fileName,
        samplePdfUrl: null,
        pageCount: measured.pageCount,
        widthPt: measured.widthPt,
        heightPt: measured.heightPt,
        branding: brandingSlot(measured.pages, measured.heightPt),
        fieldSlots: fieldSlots(measured.pages),
        pages: measured.pages,
      });
      if (sample) {
        /* url retained only when the catalogue map stored a full URL — basename map does not. */
      }
      if (faces.length % 25 === 0) console.log('measured', faces.length);
    } catch (error) {
      console.warn('measure failed', fileName, error instanceof Error ? error.message : error);
    }
  }

  const linkByCode = new Map();
  for (const link of pageLinks) {
    const base = normFile(path.basename(link.url.split('?')[0]));
    const code = byFile.get(base);
    if (code) linkByCode.set(code, link.url);
  }
  for (const face of faces) {
    face.samplePdfUrl = linkByCode.get(face.code) || null;
    const named = [...byName.entries()].find(([, code]) => code === face.code);
    if (named) face.name = named[0].replace(/\b\w/g, (ch) => ch.toUpperCase());
  }

  const reports = [];
  if (fs.existsSync(XLSX_DIR)) {
    for (const fileName of fs.readdirSync(XLSX_DIR)) {
      if (!fileName.toLowerCase().endsWith('.xlsx')) continue;
      let code = byFile.get(normFile(fileName)) || slugCode(fileName);
      if (used.has(code)) code = `${code}_XLSX`;
      used.add(code);
      try {
        const parsed = xlsxHeaders(fs.readFileSync(path.join(XLSX_DIR, fileName)));
        const headers = parsed.headers.filter((header) => !/fresa/i.test(header));
        if (headers.length === 0) continue;
        reports.push({
          code,
          name: code.replace(/_/g, ' '),
          referenceFile: fileName,
          sheetName: parsed.sheetName || 'Report',
          headers,
        });
      } catch (error) {
        console.warn('xlsx failed', fileName, error instanceof Error ? error.message : error);
      }
    }
  }

  const faceFile = path.join(SRC, 'templates/official/measuredFaces.generated.ts');
  writeTs(
    faceFile,
    "import type { OfficialMeasuredFace } from './officialFace.types';",
    'MEASURED_OFFICIAL_FACES: OfficialMeasuredFace[]',
    faces,
  );
  const reportFile = path.join(SRC, 'templates/official/myReportColumns.generated.ts');
  writeTs(
    reportFile,
    "import type { MyReportColumnSpec } from './officialFace.types';",
    'MY_REPORT_COLUMNS: MyReportColumnSpec[]',
    reports,
  );

  const extracted = faces
    .filter((face) => face.samplePdfUrl && face.family !== 'hbl' && face.family !== 'delivery_order' && face.family !== 'wms_asn')
    .map((face) => ({
      section:
        face.family === 'invoice'
          ? 'invoice'
          : face.family === 'accounts'
            ? 'accounts'
            : face.family === 'arrival_notice'
              ? 'arrival_notice'
              : 'other',
      fresaName: face.name,
      samplePdfUrl: face.samplePdfUrl,
      verificationStatus: 'url_verified',
      pageCount: face.pageCount,
      freightnestCode: face.code,
    }));
  fs.writeFileSync(
    path.join(SRC, 'data/fresaExtractedSampleEntries.generated.ts'),
    `import type { FresaOfficialSampleEntry } from './fresaOfficialSampleCatalogue';\n\nexport const FRESA_EXTRACTED_SAMPLE_ENTRIES: FresaOfficialSampleEntry[] = ${JSON.stringify(extracted, null, 2)};\n`,
  );

  const byFamily = {};
  for (const face of faces) byFamily[face.family] = (byFamily[face.family] || 0) + 1;
  console.log(JSON.stringify({ faces: faces.length, reports: reports.length, byFamily, extracted: extracted.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
