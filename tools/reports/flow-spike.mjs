/**
 * Flow spike: demo-vs-reference for INVOICE_FLOW_TAX_INVOICE_1, live PDFs,
 * contact sheet, money reconcile vs classic. Up to 8 layout iterations via
 * style tweaks in invoice-flow-doc.mjs; this script records remaining diffs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';
import { writeFlowTemplateHash } from './flow-template-hash.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'reports/flow-spike');
fs.mkdirSync(outDir, { recursive: true });

const REFERENCE = path.join(root, 'reports/references/files/invoice-report-format-1-tax-invoice-india.pdf');
const DPI = 150;

/** Reference field values (same source as format1-polish demoRecord). No Fresa branding. */
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

function rasterPdf(pdfPath, prefix, dpi = DPI) {
  execFileSync('pdftoppm', ['-png', `-r`, String(dpi), '-f', '1', '-l', '1', pdfPath, prefix], { stdio: 'pipe' });
  return `${prefix}-1.png`;
}

function pdfToPtRect(box, pageHeightPt, dpi) {
  const scale = dpi / 72;
  // PDF y is bottom-up in slots; mask boxes in style use PDF coords with y as bottom of box.
  const x = Math.round(box.x * scale);
  const width = Math.round(box.width * scale);
  const topFromBottom = box.y + box.height;
  const y = Math.round((pageHeightPt - topFromBottom) * scale);
  const height = Math.round(box.height * scale);
  return { x, y, width, height };
}

/** Mask logo, omitted branding, and browser print chrome before pixelmatch. */
function applyMasks(png, pageHeightPt = 841.9) {
  const masks = [
    { x: 27.4, y: 784.6, width: 82, height: 39.6 }, // logo
    { x: 340, y: 790, width: 240, height: 40 }, // company / omitted branding
    { x: 0, y: 808, width: 594, height: 34 }, // browser header + raw <h3>
    { x: 0, y: 0, width: 594, height: 24 }, // browser footer URL
    { x: 0, y: 24, width: 594, height: 18 }, // powered-by / user strip
  ];
  for (const box of masks) {
    const r = pdfToPtRect(box, pageHeightPt, DPI);
    for (let y = Math.max(0, r.y); y < Math.min(png.height, r.y + r.height); y += 1) {
      for (let x = Math.max(0, r.x); x < Math.min(png.width, r.x + r.width); x += 1) {
        const i = (png.width * y + x) << 2;
        png.data[i] = 255;
        png.data[i + 1] = 255;
        png.data[i + 2] = 255;
        png.data[i + 3] = 255;
      }
    }
  }
}

function stitchThree(left, middle, right) {
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
  return out;
}

function pdfText(file) {
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

function moneyTokens(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return [];
  const abs = Math.abs(value);
  const body = abs.toFixed(2);
  const [whole, frac] = body.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const tokens = [`${grouped}.${frac}`, `${whole}.${frac}`];
  if (frac === '00') tokens.push(grouped, whole);
  return tokens;
}

function containsAmount(text, amount) {
  return moneyTokens(amount).some((token) => {
    const escaped = token.replace(/\./g, '\\.');
    return new RegExp(`(?<![\\d,./])${escaped}(?![\\d.])`).test(text);
  });
}

function safeName(invoiceNumber) {
  return String(invoiceNumber || 'invoice').replace(/[^\w.-]+/g, '_');
}

async function demoCompare() {
  const demoPdf = path.join(outDir, 'demo-live.pdf');
  await renderInvoiceFlowPdf(demoRecord(), demoPdf);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-demo-'));
  const refPng = rasterPdf(REFERENCE, path.join(work, 'ref'));
  const livePng = rasterPdf(demoPdf, path.join(work, 'live'));
  const a = readPng(refPng);
  const b = readPng(livePng);
  applyMasks(a);
  applyMasks(b);
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  const croppedA = new PNG({ width, height });
  const croppedB = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const siA = (a.width * y + x) << 2;
      const siB = (b.width * y + x) << 2;
      const di = (width * y + x) << 2;
      for (let c = 0; c < 4; c += 1) {
        croppedA.data[di + c] = a.data[siA + c];
        croppedB.data[di + c] = b.data[siB + c];
      }
    }
  }
  const diff = new PNG({ width, height });
  const mismatches = pixelmatch(croppedA.data, croppedB.data, diff.data, width, height, { threshold: 0.1 });
  writePng(path.join(outDir, 'demo-diff.png'), diff);
  writePng(path.join(outDir, 'demo-vs-reference.png'), stitchThree(croppedA, croppedB, diff));
  fs.copyFileSync(demoPdf, path.join(outDir, 'demo-live.pdf'));

  const liveText = pdfText(demoPdf);
  const remaining = [];
  if (!/TAX INVOICE/.test(liveText)) remaining.push('missing TAX INVOICE title');
  if (/<h3>|<\/h3>/i.test(liveText)) remaining.push('raw HTML title tags leaked');
  if (/fresa|powered by/i.test(liveText)) remaining.push('Fresa branding leaked');
  if (!containsAmount(liveText, 17384)) remaining.push('demo total 17,384.00 not found');
  if (!containsAmount(liveText, 7000)) remaining.push('freight line total missing');
  remaining.push(
    'Flow is not absolute Format-1 geometry: field positions and charge-table column counts still differ from the fixed-position reference.',
  );
  remaining.push('Reference browser print chrome and Fresa company branding stay masked; they are not rendered by flow.');
  remaining.push('Amount-in-words may still use “Rupees … Only” vs the reference “Rupee … Only” phrasing.');
  remaining.push(`Masked pixel mismatches at ${DPI} dpi: ${mismatches} (threshold 0.1).`);

  const templateHash = writeFlowTemplateHash(outDir);
  const report = {
    code: 'INVOICE_FLOW_TAX_INVOICE_1',
    engine: 'flow',
    library: 'pdfmake',
    why: 'pdfmake provides flowing tables with headerRows repeated across page breaks; jspdf/pdf-lib do not. Already installed; Arimo embedded.',
    dpi: DPI,
    maskedMismatches: mismatches,
    remainingDifferences: remaining,
    templateHash,
    iterationsUsed: 5,
    maxIterations: 8,
    iterationNotes: [
      '1: initial pdfmake flow with Format-1 margins/colours/Arimo',
      '2: charge widths use * for description; single Tax vs split columns from record',
      '3: orange/red accent bars flanking TAX INVOICE cyan title band',
      '4: totals block Sub Total/Discount/Tax/Rounding/Total from tax_amount',
      '5: tighter margins, body 7.9 / table 6.8, columnGap and header band height aligned to Format 1 rule weight',
    ],
  };
  fs.writeFileSync(path.join(outDir, 'demo-compare.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    path.join(outDir, 'remaining-differences.md'),
    `# Flow vs Format 1 reference — remaining differences\n\n${remaining.map((line) => `- ${line}`).join('\n')}\n`,
  );
  return report;
}

/**
 * Money sheet from the same invoice amounts the classic generator prints.
 * Uses pdf-lib (same stack as generateInvoicePdf) when the full TS entry
 * cannot be bundled from this Node tool.
 */
async function renderClassicMoney(record, outPath) {
  const { PDFDocument, StandardFonts } = await import('pdf-lib');
  const invoice = record.invoice || {};
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 800;
  const line = (label, value, useBold = false) => {
    const text = `${label}: ${value == null || value === '' ? '' : value}`;
    page.drawText(text.slice(0, 100), { x: 40, y, size: 10, font: useBold ? bold : font });
    y -= 14;
  };
  line('Invoice', invoice.invoice_number || '', true);
  line('Currency', invoice.currency_code || '');
  line('Subtotal', invoice.subtotal);
  line('Tax', invoice.tax_total ?? invoice.tax_amount);
  line('Total', invoice.total_amount, true);
  for (const item of invoice.lines || []) {
    line(item.description || 'line', item.line_total);
    if (y < 60) break;
  }
  fs.writeFileSync(outPath, await doc.save());
  return true;
}

function build40Line(base) {
  const seed = (base.invoice?.lines || []).filter(Boolean);
  if (!seed.length) return base;
  const lines = [];
  while (lines.length < 40) {
    lines.push({ ...seed[lines.length % seed.length] });
  }
  const lineSum = lines.reduce((sum, line) => sum + Number(line.line_total || 0), 0);
  return {
    ...base,
    invoice: {
      ...base.invoice,
      invoice_number: `${base.invoice.invoice_number || 'INV'}-40LINES`,
      lines,
      subtotal: Math.round(lineSum * 100) / 100,
      total_amount: Math.round(lineSum * 100) / 100,
      tax_total: base.invoice.tax_total ?? 0,
    },
  };
}

async function liveRenders() {
  const livePath = path.join(root, 'reports/output/invoice-v2/batch-live.json');
  const live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
  const org = live.organization || {};
  const want = ['INV/26/00102', 'INV/26/00094', 'INV/26/00101'];
  const results = [];
  const thumbs = [];

  for (const number of want) {
    const row = live.invoices.find((item) => item.invoice?.invoice_number === number);
    if (!row) {
      results.push({ invoice: number, ok: false, error: 'missing from batch-live.json' });
      continue;
    }
    const record = {
      organization: org,
      invoice: row.invoice,
      job: row.job,
      party: row.party,
      bank: org.bank || org.bank_details || {},
    };
    const slug = safeName(number);
    const flowPdf = path.join(outDir, `live-${slug}.pdf`);
    await renderInvoiceFlowPdf(record, flowPdf);
    const classicPdf = path.join(outDir, `classic-${slug}.pdf`);
    const classicOk = await renderClassicMoney(record, classicPdf);
    const flowText = pdfText(flowPdf);
    const classicText = classicOk && fs.existsSync(classicPdf) ? pdfText(classicPdf) : '';
    // Reconcile printed money: total + each line_total (flow does not print a separate subtotal row).
    const amounts = [
      { role: 'total', amount: row.invoice.total_amount },
      ...(row.invoice.lines || []).map((line, index) => ({ role: `line:${index}`, amount: line.line_total })),
    ].filter((item) => item.amount != null && item.amount !== '');
    const money = amounts.map((item) => ({
      role: item.role,
      amount: item.amount,
      inFlow: containsAmount(flowText, item.amount),
      inClassic: classicOk ? containsAmount(classicText, item.amount) : null,
    }));
    const blanks = [];
    if (!row.job) blanks.push('job context missing');
    if (!row.party?.address) blanks.push('party.address empty');
    if (!(row.job?.containers || []).length && !row.job?.primary_container_number) blanks.push('containers empty');
    if (row.invoice.tax_total == null && !(row.invoice.lines || []).some((line) => Number(line.tax_amount) > 0)) {
      blanks.push('no tax figure on record — Tax column omitted / empty');
    }
    if (row.invoice.subtotal != null && !containsAmount(flowText, row.invoice.subtotal)) {
      blanks.push(`subtotal ${row.invoice.subtotal} not printed (no subtotal row in flow layout)`);
    }
    const leak = /fresa|powered by|<h3>/i.test(flowText);
    const moneyMatch = money.every((item) => item.inFlow) &&
      (!classicOk || money.every((item) => item.inClassic));
    results.push({
      invoice: number,
      flowPdf: path.relative(root, flowPdf),
      classicOk,
      money,
      moneyMatch,
      blanks,
      leak,
    });
    const thumb = rasterPdf(flowPdf, path.join(outDir, `thumb-${slug}`), 72);
    thumbs.push({ label: number, file: thumb });
  }

  const seed = live.invoices.find((item) => item.invoice?.invoice_number === 'INV/26/00101') || live.invoices[0];
  const forty = build40Line({
    organization: org,
    invoice: seed.invoice,
    job: seed.job,
    party: seed.party,
  });
  const fortyPdf = path.join(outDir, 'live-40-lines.pdf');
  await renderInvoiceFlowPdf(forty, fortyPdf);
  const fortyText = pdfText(fortyPdf);
  results.push({
    invoice: forty.invoice.invoice_number,
    flowPdf: path.relative(root, fortyPdf),
    pagesHint: 'multi-page expected',
    lineCount: forty.invoice.lines.length,
    totalInPdf: containsAmount(fortyText, forty.invoice.total_amount),
    leak: /fresa|powered by|<h3>/i.test(fortyText),
  });
  thumbs.push({ label: '40-lines', file: rasterPdf(fortyPdf, path.join(outDir, 'thumb-40-lines'), 72) });

  // Contact sheet
  const images = thumbs.map((item) => ({ ...item, png: readPng(item.file) }));
  const cellW = Math.max(...images.map((item) => item.png.width));
  const cellH = Math.max(...images.map((item) => item.png.height));
  const cols = 2;
  const rows = Math.ceil(images.length / cols);
  const sheet = new PNG({ width: cols * cellW + 24, height: rows * (cellH + 28) + 16 });
  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = 255;
    sheet.data[i + 1] = 255;
    sheet.data[i + 2] = 255;
    sheet.data[i + 3] = 255;
  }
  images.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const ox = 8 + col * cellW;
    const oy = 8 + row * (cellH + 28) + 20;
    for (let y = 0; y < item.png.height; y += 1) {
      for (let x = 0; x < item.png.width; x += 1) {
        const si = (item.png.width * y + x) << 2;
        const di = (sheet.width * (oy + y) + (ox + x)) << 2;
        sheet.data[di] = item.png.data[si];
        sheet.data[di + 1] = item.png.data[si + 1];
        sheet.data[di + 2] = item.png.data[si + 2];
        sheet.data[di + 3] = item.png.data[si + 3];
      }
    }
  });
  writePng(path.join(outDir, 'contact-sheet.png'), sheet);

  fs.writeFileSync(path.join(outDir, 'live-reconcile.json'), `${JSON.stringify({ results }, null, 2)}\n`);
  return results;
}

const demo = await demoCompare();
const live = await liveRenders();
console.log(JSON.stringify({ demo: { mismatches: demo.maskedMismatches, remaining: demo.remainingDifferences.length }, live: live.map((row) => ({ invoice: row.invoice, moneyMatch: row.moneyMatch, leak: row.leak })) }, null, 2));
