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

function colorOf(args) {
  const raw =
    args && typeof args.length === 'number' && args.length >= 3 && typeof args[0] === 'number'
      ? args
      : args && args[0] && args[0].length >= 3
        ? args[0]
        : null;
  if (!raw) {
    const gray = typeof args === 'number' ? args : args && typeof args[0] === 'number' ? args[0] : 0;
    const v = Math.round((gray <= 1 ? gray : gray / 255) * 255);
    return [v, v, v];
  }
  const scale = raw[0] <= 1 && raw[1] <= 1 && raw[2] <= 1 ? 255 : 1;
  return [0, 1, 2].map((index) => Math.round(raw[index] * scale));
}

function nearWhite(color) {
  return color[0] > 245 && color[1] > 245 && color[2] > 245;
}

function identityCtm() {
  return [1, 0, 0, 1, 0, 0];
}

/** PDF cm: new CTM = current × matrix (matrix applies to the point first). */
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

function ctmScale(ctm) {
  const sx = Math.hypot(ctm[0], ctm[1]);
  const sy = Math.hypot(ctm[2], ctm[3]);
  return (sx + sy) / 2 || 1;
}

function matrixOf(args) {
  const raw = args && args.length === 6 ? args : args && args[0] && args[0].length === 6 ? args[0] : null;
  if (!raw) return null;
  return [0, 1, 2, 3, 4, 5].map((index) => Number(raw[index]) || 0);
}

function pushBox(rects, lines, minX, minY, maxX, maxY) {
  const width = maxX - minX;
  const height = maxY - minY;
  if (width > 2 && height > 2) rects.push([minX, minY, width, height]);
  else if (width > 4 && height >= 0.15 && height <= 2.5) {
    lines.push([minX, minY + height / 2, maxX, minY + height / 2, height]);
  } else if (height > 4 && width >= 0.15 && width <= 2.5) {
    lines.push([minX + width / 2, minY, minX + width / 2, maxY, width]);
  }
}

/**
 * Turn a constructPath into page-space boxes and rules.
 * Jasper paths are in the current CTM (often scaled and Y-flipped), not page points.
 */
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
        lines.push([prev[0], prev[1], point[0], point[1]]);
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

function paintKind(fn) {
  if (fn === 20 || fn === 21) return 'stroke';
  if (fn === 22 || fn === 23) return 'fill';
  if (fn === 24 || fn === 25 || fn === 26 || fn === 27) return 'both';
  return null;
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
    const pageArea = viewport.width * viewport.height;
    const rects = [];
    const lines = [];
    const seenLines = new Set();
    const op = await page.getOperatorList();
    let stroke = [20, 20, 24];
    let fill = [255, 255, 255];
    let lineWidth = 0.6;
    let ctm = identityCtm();
    const ctmStack = [];
    const hitsPage = (x1, y1, x2, y2) => {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return maxX >= -8 && minX <= viewport.width + 8 && maxY >= -8 && minY <= viewport.height + 8;
    };
    for (let i = 0; i < op.fnArray.length; i += 1) {
      const fn = op.fnArray[i];
      const args = op.argsArray[i];
      if (fn === 2) lineWidth = Number(Array.isArray(args) ? args[0] : args) || 0.6;
      else if (fn === 10) ctmStack.push(ctm);
      else if (fn === 11) ctm = ctmStack.pop() || identityCtm();
      else if (fn === 12) {
        const matrix = matrixOf(args);
        if (matrix) ctm = multiplyCtm(ctm, matrix);
      } else if (fn === 58) stroke = colorOf(args);
      else if (fn === 59) fill = colorOf(args);
      else if (fn === 56 || fn === 57) {
        const gray = colorOf(args);
        if (fn === 56) stroke = gray;
        else fill = gray;
      } else if (fn === 91 && args && args[0] && args[1]) {
        let next = i + 1;
        while (next < op.fnArray.length && ![20, 21, 22, 23, 24, 25, 26, 27, 28, 29].includes(op.fnArray[next])) {
          next += 1;
        }
        const kind = paintKind(op.fnArray[next]);
        if (!kind || op.fnArray[next] === 29) continue;
        const shapes = shapesFromPath(args[0], args[1], ctm);
        const scale = ctmScale(ctm);
        const doFill = kind === 'fill' || kind === 'both';
        const doStroke = kind === 'stroke' || kind === 'both';
        for (const [x, y, w, h] of shapes.rects) {
          if (rects.length >= 520) break;
          if (w * h > pageArea * 0.9) continue;
          if (!hitsPage(x, y, x + w, y + h)) continue;
          const chunkyBlack = fill[0] < 40 && fill[1] < 40 && fill[2] < 40 && Math.min(w, h) > 3.5;
          if (doFill && !nearWhite(fill) && !chunkyBlack) {
            rects.push([round(x), round(y), round(w), round(h), fill[0], fill[1], fill[2], 1]);
          }
          if (doStroke) rects.push([round(x), round(y), round(w), round(h), stroke[0], stroke[1], stroke[2], 0]);
        }
        const ruleColor = doFill && !nearWhite(fill) ? fill : stroke;
        const strokeThickness = Math.max(0.35, Math.min((lineWidth || 0.6) * scale, 2.2));
        for (const [x1, y1, x2, y2, hairline] of shapes.lines) {
          if (lines.length >= 900) break;
          if (!hitsPage(x1, y1, x2, y2)) continue;
          const key = [round(x1), round(y1), round(x2), round(y2)].join(',');
          if (seenLines.has(key)) continue;
          seenLines.add(key);
          lines.push([
            round(x1),
            round(y1),
            round(x2),
            round(y2),
            ruleColor[0],
            ruleColor[1],
            ruleColor[2],
            round(hairline || strokeThickness),
          ]);
        }
      }
    }
    const texts = [];
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!item || !item.str || !item.str.trim()) continue;
      if (/fresa/i.test(item.str)) continue;
      if (texts.length >= 420) break;
      const transform = item.transform || [8, 0, 0, 8, 0, 0];
      const size = round(Math.abs(transform[3]) || Math.abs(transform[0]) || 8);
      const bold = /bold/i.test(item.fontName || '') || size >= 12 ? 1 : 0;
      texts.push([
        item.str.trim().replace(/\s+/g, ' ').slice(0, 120),
        round(transform[4]),
        round(transform[5]),
        size,
        bold,
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
