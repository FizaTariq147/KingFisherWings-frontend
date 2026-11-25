/**
 * Format 1 polish: demo-vs-reference, coverage, live blank outlines.
 * Live path only (fillInvoiceSpans + renderSpec with values). Never invents GST.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { fillInvoiceSpans, nearestLabel, normalizeLabel, bindingForLabel, loadDictionary, aliasBinding } from './invoice-bindings.mjs';
import { renderSpec } from './render-spec.mjs';
import { diffPilot } from './diff-pilot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const code = 'INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA';
const outDir = path.join(root, 'reports/format1');
fs.mkdirSync(outDir, { recursive: true });

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.00';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Record rebuilt from the pinned Format 1 reference text and golden sample cells. */
function demoRecord() {
  return {
    organization: {
      display_name: 'Demo Logistics India Pvt Ltd',
      name: 'Demo Logistics India Pvt Ltd',
      address: 'Sample Street 1',
      city: 'Chennai',
      country_code: 'IN',
      phone: '+91 44 0000 0000',
      email: 'ops@example.com',
      website: 'https://example.com',
      vat_number: 'ORGSTIN9988776655',
      pan: 'AAACD1234F',
    },
    bank: {
      account_name: 'Demo Logistics India Pvt Ltd',
      bank_name: 'HDFC',
      account_number: 'XXXXXXXXXXX',
      iban: 'ABA:XXXXXX',
      swift_code: 'XXXXXX',
      address: 'CHENNAI.',
    },
    session: {
      createdBy: 'demo.user@example.com',
      printedAt: '28-Jan-19 01:58:PM Asia/Kolkata',
    },
    party: {
      name: '4G LOGISTICS INDIA PVT LTD',
      address: '10, DBS CENTRE, NUNGAMBAKKAM HIGH ROAD, NUNGAMBAKKAM, CHENNAI, TAMIL NADU, INDIA, 600084',
      city: 'CHENNAI',
      phone: 'N/A',
      vat_number: 'GSTNO9876666554',
    },
    invoice: {
      invoice_number: 'MAAINV1900717',
      invoice_date: '2019-01-28',
      due_date: '2019-01-28',
      status: 'CREATED',
      currency_code: 'INR',
      exchange_rate: '1',
      subtotal: 15800,
      tax_total: 1584,
      non_taxable_amount: 7000,
      total_amount: 17384,
      remarks: '1X20: SHIPMENT TO JEBEL ALI - CMA CGM - PO NO. 9877777 DATE: 17/01/2019',
      narration: 'B/EXP/19/0251 MBL NO. MBLC9878909999 / HBL NO. PLMAAJEA00080 / JOB NO.CEXP190148',
      job_number: 'CEXP190148',
      created_by_email: 'demo.user@example.com',
      shipment: {
        hbl_number: 'PLMAAJEA00080',
        hbl_date: '2019-01-23',
        mbl_number: 'MBLC9878909999',
        mbl_date: '2019-01-21',
        place_of_receipt: 'CHENNAI',
        place_of_delivery: 'JEBEL ALI FZE',
        por: 'INMAA',
        pol: 'INMAA',
        pod: 'AEJEA',
        shipment_number: 'B/EXP/19/0251',
        shipment_date: '2019-01-22',
        reference_no: 'REFE NO. 987890',
        reference_date: '2019-01-22',
        igm_number: '8987777',
        igm_date: '2019-01-25',
      },
      lines: [
        {
          description: 'FREIGHT CHARGE',
          charge_code_name: 'FREIGHT CHARGE',
          quantity: 1,
          unit_price: 100,
          currency_code: 'USD',
          exchange_rate: 70,
          tax_amount: 0,
          line_total: 7000,
          is_taxable: false,
          sac_code: '',
        },
        {
          description: 'TERMINAL HANDLING CHARGES 20"GP',
          charge_code_name: 'TERMINAL HANDLING CHARGES 20"GP',
          quantity: 1,
          unit_price: 5500,
          currency_code: 'INR',
          exchange_rate: 1,
          tax_amount: 990,
          line_total: 6490,
          is_taxable: true,
          sac_code: '',
          sgst_rate: 9,
          sgst_amount: 495,
          cgst_rate: 9,
          cgst_amount: 495,
        },
        {
          description: 'SEAL FEE',
          charge_code_name: 'SEAL FEE',
          quantity: 1,
          unit_price: 300,
          currency_code: 'INR',
          exchange_rate: 1,
          tax_amount: 54,
          line_total: 354,
          is_taxable: true,
          sgst_rate: 9,
          sgst_amount: 27,
          cgst_rate: 9,
          cgst_amount: 27,
        },
        {
          description: 'BILL OF LADING',
          charge_code_name: 'BILL OF LADING',
          quantity: 1,
          unit_price: 3000,
          currency_code: 'INR',
          exchange_rate: 1,
          tax_amount: 540,
          line_total: 3540,
          is_taxable: true,
          sgst_rate: 9,
          sgst_amount: 270,
          cgst_rate: 9,
          cgst_amount: 270,
        },
      ],
    },
    job: {
      job_number: 'CEXP190148',
      job_date: '2019-01-28',
      shipper_name: '4G LOGISTICS INDIA PVT LTD',
      consignee_name: 'AL NASER TRADING COMPANY LLC',
      shipment_number: 'B/EXP/19/0251',
      shipment_date: '2019-01-22',
      origin_port_code: 'INMAA',
      dest_port_code: 'AEJEA',
      vessel_name: 'MSC MARINA',
      voyage_number: '876',
      etd: '2019-01-28',
      eta: '2019-02-05',
      incoterms: 'CFR',
      client_reference_no: 'REFE NO. 987890',
      reference_date: '2019-01-22',
      pieces: 125,
      gross_weight: 18000,
      volume_cbm: 20,
      primary_container_number: 'TCNU9876543',
      containers: [{
        container_number: 'TCNU9876543',
        container_type_code: "20' DC",
        type: "20' DC",
        packages: 125,
        gross_weight: '18,000.000 K',
        cbm: '20.000',
      }],
      sea_fcl_details: {
        hbl_number: 'PLMAAJEA00080',
        mbl_number: 'MBLC9878909999',
        place_of_receipt: 'CHENNAI',
        place_of_delivery: 'JEBEL ALI FZE',
        por_code: 'INMAA',
        pol_code: 'INMAA',
        pod_code: 'AEJEA',
        vessel_name: 'MSC MARINA',
        voyage_number: '876',
        etd: '2019-01-28',
        eta: '2019-02-05',
      },
    },
  };
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function writePng(file, png) {
  fs.writeFileSync(file, PNG.sync.write(png));
}

function stitchThree(left, middle, right, labels = ['reference', 'live', 'diff']) {
  const gap = 16;
  const labelH = 28;
  const width = left.width + middle.width + right.width + gap * 2;
  const height = Math.max(left.height, middle.height, right.height) + labelH;
  const out = new PNG({ width, height });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = 255;
    out.data[i + 1] = 255;
    out.data[i + 2] = 255;
    out.data[i + 3] = 255;
  }
  const place = (src, ox) => {
    for (let y = 0; y < src.height; y += 1) {
      for (let x = 0; x < src.width; x += 1) {
        const si = (src.width * y + x) << 2;
        const di = (out.width * (y + labelH) + (x + ox)) << 2;
        out.data[di] = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = src.data[si + 3];
      }
    }
  };
  place(left, 0);
  place(middle, left.width + gap);
  place(right, left.width + gap + middle.width + gap);
  void labels;
  return out;
}

function rasterPdf(pdfPath, prefix) {
  execFileSync('pdftoppm', ['-png', '-r', '100', '-f', '1', '-l', '1', pdfPath, prefix], { stdio: 'pipe' });
  return `${prefix}-1.png`;
}

async function renderLive(record, logoPath, outPdf) {
  const spec = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const filled = fillInvoiceSpans(spec, record);
  const logoBytes = logoPath && fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;
  await renderSpec(code, {
    spec,
    values: filled.values,
    logoBytes,
    organization: {
      name: record.organization?.display_name || record.organization?.name || '',
      address: [record.organization?.address, record.organization?.city, record.organization?.country_code].filter(Boolean).join(', '),
      phone: record.organization?.phone || '',
      email: record.organization?.email || '',
      website: record.organization?.website || '',
    },
    quietArtifacts: true,
    outputPath: outPdf,
  });
  return filled;
}

async function demoCompare() {
  const demo = demoRecord();
  const logo = path.join(root, 'public/kingfisher-logo.png');
  const livePdf = path.join(outDir, 'demo-live.pdf');
  const filled = await renderLive(demo, logo, livePdf);
  const referencePdf = path.join(root, 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf');
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'format1-demo-'));
  const result = await diffPilot(code, {
    renderedPath: livePdf,
    workDir: work,
    tag: 'format1-demo',
    writeHeatmap: true,
    skipDeviation: true,
  });
  const refPng = rasterPdf(referencePdf, path.join(outDir, 'demo-ref'));
  const livePng = rasterPdf(livePdf, path.join(outDir, 'demo-live'));
  const a = readPng(refPng);
  const b = readPng(livePng);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const diff = new PNG({ width, height });
  const mismatches = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.1 });
  writePng(path.join(outDir, 'demo-diff.png'), diff);
  writePng(path.join(outDir, 'demo-vs-reference.png'), stitchThree(a, b, diff));

  const painted = new Set(Object.values(filled.values).map((value) => String(value || '').replace(/\s+/g, ' ').trim()).filter(Boolean));
  const expected = [
    '4G LOGISTICS INDIA PVT LTD',
    'GSTNO9876666554',
    'MAAINV1900717',
    '28-JAN-19',
    'AL NASER TRADING COMPANY LLC',
    'CEXP190148',
    'B/EXP/19/0251',
    'PLMAAJEA00080',
    'MBLC9878909999',
    'INMAA',
    'AEJEA',
    'CHENNAI',
    'JEBEL ALI FZE',
    'MSC MARINA',
    '876',
    'TCNU9876543',
    'FREIGHT CHARGE',
    'TERMINAL HANDLING',
    'SEAL FEE',
    'BILL OF LADING',
    '7,000.00',
    '6,490.00',
    '354.00',
    '3,540.00',
    '17,384.00',
    '495.00',
    '27.00',
    '270.00',
    '792.00',
    'HDFC',
  ];
  const missingExpected = expected.filter((token) => ![...painted].some((value) => value.includes(token) || value.replace(/,/g, '').includes(token.replace(/,/g, ''))));
  const fresa = [...painted].filter((value) => /fresa|powered by/i.test(value));
  const defects = [];
  if (!result.page?.pass && result.pagePass === false) defects.push({ layer: 'page', cause: 'renderer', detail: 'page size/count' });
  // diffPilot return shape
  const pagePass = result.page?.pass ?? result.summary?.pagePass;
  const layers = {
    page: result.pagePass ?? pagePass ?? (result.pages ? true : undefined),
    geometry: result.geometry?.pass,
    staticText: result.static?.pass,
    dynamicText: result.dynamic?.pass,
    raster: result.raster?.pass,
    pagination: result.pagination?.pass ?? 'single-page',
  };
  // Read from known fields on result
  const report = {
    layers: {
      page: result.page?.pass ?? true,
      geometry: (result.geometry?.unmatchedLines ?? 0) === 0 && (result.geometry?.unmatchedRects ?? 0) === 0,
      staticText: (result.static?.failures ?? result.staticFailures ?? []).length === 0,
      dynamicText: (result.dynamic?.failures ?? result.dynamicFailures ?? []).length === 0,
      raster: result.raster?.pass,
      pagination: 'single-page',
      rasterRatio: result.raster?.ratio,
      rasterMismatches: result.raster?.mismatches,
      pixelmatchMismatches: mismatches,
    },
    missingExpected,
    fresaLeaks: fresa,
    paintedCount: painted.size,
  };
  fs.writeFileSync(path.join(outDir, 'demo-compare.json'), `${JSON.stringify(report, null, 2)}\n`);
  return { report, filled, defects, missingExpected, layers: report.layers };
}

function resolveBinding(label, dictionary) {
  const key = normalizeLabel(label);
  return aliasBinding(key) || bindingForLabel(label, dictionary) || '';
}

function coverageTable(liveInvoices) {
  const disk = JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8'));
  const dictionary = loadDictionary();
  const spans = (disk.pages || []).flatMap((page) => page.spans || []).filter((span) => span.role === 'dynamic');
  const fills = liveInvoices.map((row) => fillInvoiceSpans(JSON.parse(JSON.stringify(disk)), {
    invoice: row.invoice,
    job: row.job || {},
    party: row.party || {},
    organization: liveInvoices.organization || {},
    bank: liveInvoices.bank,
    session: { createdBy: row.invoice?.created_by_email || row.invoice?.created_by || '', printedAt: '' },
  }));
  const rows = [];
  for (const span of spans) {
    const label = nearestLabel(span, disk.pages[0].spans)?.text || '';
    const sample = String(span.text || '').replace(/\s+/g, ' ').trim();
    const chargeBand = span.y > 300 && span.y < 520 && /^[\d,]+\.\d+/.test(sample);
    let binding = resolveBinding(label, dictionary) || span.binding || '';
    if (!binding && chargeBand) binding = 'invoice.lines (column role)';
    if (!binding && /rupee|only$/i.test(label)) binding = 'invoice.amountWords / invoice.total';
    const gstCell = /\b(sgst|cgst|igst|ugst)\b/i.test(label) || /\b(sgst|cgst|igst)\b/i.test(binding);
    const statuses = fills.map((filled) => {
      const value = String(filled.values[span.id] || '').trim();
      if (value) return 'filled';
      if (gstCell) return 'needs GST breakdown';
      const blank = (filled.blanks || []).find((item) => item.span === span.id);
      if (blank?.why === 'empty in the record') return 'empty in the record';
      if (blank?.why === 'wrong path') return 'source exists but not bound';
      if (!binding) return 'no source';
      return blank?.why === 'no source' ? 'no source' : 'empty in the record';
    });
    const counts = {
      filled: statuses.filter((item) => item === 'filled').length,
      empty: statuses.filter((item) => item === 'empty in the record').length,
      unbound: statuses.filter((item) => item === 'source exists but not bound').length,
      none: statuses.filter((item) => item === 'no source').length,
      gst: statuses.filter((item) => item === 'needs GST breakdown').length,
    };
    let status = 'no source';
    if (gstCell && counts.filled === 0) status = 'needs GST breakdown';
    else if (counts.filled === liveInvoices.length) status = 'filled';
    else if (counts.filled > 0) status = `filled on ${counts.filled}/10; empty in the record on ${counts.empty}`;
    else if (counts.empty > 0) status = 'empty in the record';
    else if (counts.unbound > 0) status = 'source exists but not bound';
    rows.push({ id: span.id, label: String(label).replace(/\s+/g, ' ').trim(), sample: sample.slice(0, 48), binding, status });
  }
  const lines = [
    '# Format 1 dynamic field coverage',
    '',
    'Statuses are across the 10 real invoices. GST split cells stay blank until the API stores per-line SGST/CGST/IGST; that is not inferred.',
    '',
    '| Span | Label | Sample | Binding | Status on 10 real invoices |',
    '|---|---|---|---|---|',
    ...rows.map((row) => `| ${row.id} | ${row.label || '—'} | ${row.sample || '—'} | ${row.binding || '—'} | ${row.status} |`),
    '',
  ];
  fs.writeFileSync(path.join(outDir, 'coverage.md'), `${lines.join('\n')}\n`);
  return rows;
}

async function liveBlankSheet(invoiceNumber, live) {
  const row = live.invoices.find((item) => item.invoice?.invoice_number === invoiceNumber);
  if (!row) throw new Error(`missing ${invoiceNumber}`);
  const record = {
    invoice: row.invoice,
    job: row.job || {},
    party: row.party || {},
    organization: live.organization || {},
    bank: live.bank || live.organization?.default_bank,
    session: { createdBy: row.invoice?.created_by_email || row.invoice?.created_by || '', printedAt: new Date().toISOString() },
  };
  const logo = path.join(root, 'public/kingfisher-logo.png');
  const livePdf = path.join(outDir, `live-${invoiceNumber.replaceAll('/', '-')}.pdf`);
  const filled = await renderLive(record, logo, livePdf);
  const referencePdf = path.join(root, 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf');
  const refPngPath = rasterPdf(referencePdf, path.join(outDir, `ref-${invoiceNumber.replaceAll('/', '-')}`));
  const livePngPath = rasterPdf(livePdf, path.join(outDir, `live-${invoiceNumber.replaceAll('/', '-')}`));
  const a = readPng(refPngPath);
  const b = readPng(livePngPath);
  const annotated = new PNG({ width: b.width, height: b.height });
  annotated.data = Buffer.from(b.data);
  const scaleX = b.width / 594;
  const scaleY = b.height / 842;
  const blanks = (filled.blanks || []).filter((item) => !String(filled.values[item.span] || '').trim());
  const pageSpans = (JSON.parse(fs.readFileSync(path.join(root, 'reports/specs', `${code}.json`), 'utf8')).pages[0].spans || []);
  const reasons = [];
  for (const blank of blanks.slice(0, 40)) {
    const span = pageSpans.find((item) => item.id === blank.span)
      || pageSpans.find((item) => blank.span.endsWith(item.id));
    if (!span) continue;
    const x = Math.round(span.x * scaleX);
    const y = Math.round((842 - span.y - (span.size || 8)) * scaleY);
    const w = Math.max(8, Math.round((span.width || 20) * scaleX));
    const h = Math.max(8, Math.round(((span.size || 8) + 2) * scaleY));
    for (let px = x; px < x + w && px < annotated.width; px += 1) {
      for (const py of [y, y + h - 1]) {
        if (py < 0 || py >= annotated.height) continue;
        const i = (annotated.width * py + px) << 2;
        annotated.data[i] = 220;
        annotated.data[i + 1] = 20;
        annotated.data[i + 2] = 20;
      }
    }
    for (let py = y; py < y + h && py < annotated.height; py += 1) {
      for (const px of [x, x + w - 1]) {
        if (px < 0 || px >= annotated.width) continue;
        const i = (annotated.width * py + px) << 2;
        annotated.data[i] = 220;
        annotated.data[i + 1] = 20;
        annotated.data[i + 2] = 20;
      }
    }
    reasons.push({
      span: blank.span,
      label: blank.label,
      why: blank.why || 'no source',
      binding: blank.binding || '',
    });
  }
  const reasonPng = new PNG({ width: 520, height: Math.max(b.height, 40 + reasons.length * 18) });
  for (let i = 0; i < reasonPng.data.length; i += 4) {
    reasonPng.data[i] = 255;
    reasonPng.data[i + 1] = 255;
    reasonPng.data[i + 2] = 255;
    reasonPng.data[i + 3] = 255;
  }
  // Reason panel is textual via sidecar JSON; PNG is reference | live annotated | spacer.
  writePng(path.join(outDir, `live-blanks-${invoiceNumber.replaceAll('/', '-')}.png`), annotated);
  fs.writeFileSync(path.join(outDir, `live-blanks-${invoiceNumber.replaceAll('/', '-')}.json`), `${JSON.stringify(reasons, null, 2)}\n`);
  const sheet = stitchThree(a, annotated, reasonPng);
  const outName = `live-vs-reference-${invoiceNumber.replaceAll('/', '-')}.png`;
  writePng(path.join(outDir, outName), sheet);
  return { invoiceNumber, blankCount: reasons.length, reasons: reasons.slice(0, 25), outName, sheet };
}

const livePath = path.join(root, 'reports/output/invoice-v2/batch-live.json');
if (!fs.existsSync(livePath)) {
  console.error('missing reports/output/invoice-v2/batch-live.json');
  process.exit(1);
}
const live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
const real = live.invoices.filter((row) => row.invoice?.invoice_number && !String(row.id || '').startsWith('syn-') && !String(row.id || '').startsWith('extra-'));
real.organization = live.organization;
real.bank = live.bank;

const demo = await demoCompare();
const coverage = coverageTable(real);
const sheet102 = await liveBlankSheet('INV/26/00102', live);
const sheet094 = await liveBlankSheet('INV/26/00094', live);

// Combined live-vs-reference: 00102 on top, 00094 below.
if (sheet102.sheet && sheet094.sheet) {
  const gap = 24;
  const combined = new PNG({
    width: Math.max(sheet102.sheet.width, sheet094.sheet.width),
    height: sheet102.sheet.height + gap + sheet094.sheet.height,
  });
  for (let i = 0; i < combined.data.length; i += 4) {
    combined.data[i] = 255;
    combined.data[i + 1] = 255;
    combined.data[i + 2] = 255;
    combined.data[i + 3] = 255;
  }
  const blit = (src, oy) => {
    for (let y = 0; y < src.height; y += 1) {
      for (let x = 0; x < src.width; x += 1) {
        const si = (src.width * y + x) << 2;
        const di = (combined.width * (y + oy) + x) << 2;
        combined.data[di] = src.data[si];
        combined.data[di + 1] = src.data[si + 1];
        combined.data[di + 2] = src.data[si + 2];
        combined.data[di + 3] = src.data[si + 3];
      }
    }
  };
  blit(sheet102.sheet, 0);
  blit(sheet094.sheet, sheet102.sheet.height + gap);
  writePng(path.join(outDir, 'live-vs-reference.png'), combined);
}

const summary = {
  demoMissingExpected: demo.missingExpected,
  demoLayers: demo.layers,
  coverageRows: coverage.length,
  unbound: coverage.filter((row) => row.status.includes('not bound')).map((row) => row.id),
  gst: coverage.filter((row) => row.status.includes('GST')).length,
  sheets: [sheet102, sheet094].map((row) => ({ invoice: row.invoiceNumber, blanks: row.blankCount, file: row.outName })),
};
fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
