/**
 * Real-record classic | flow compare for quotations, credit notes, debit notes.
 * Reads reports/output/flow-real/live.json, renders classic (Generate PDF via
 * vitest) and flow PDFs, writes side-by-side compare PNGs under
 * reports/flow-spike/real/<type>/<id>-compare.png, reconciles money, blanks,
 * quotation field matrix, CN sign/tax report, and stress/fallback checks.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { renderInvoiceFlowPdf } from './invoice-flow-render.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const livePath = path.join(root, 'reports/output/flow-real/live.json');
const outRoot = path.join(root, 'reports/flow-spike/real');
const classicDir = path.join(root, 'reports/output/flow-real/classic');
/** Mirrors src/features/reports/engine/invoiceV2Gate.ts INVOICE_V2_FALLBACK_NOTICE */
const FALLBACK_NOTICE = 'Showing the classic invoice. The selected format could not be built.';

async function generateWithFallback(input) {
  if (!input.attemptV2) {
    return { blob: await input.renderClassic(), notice: null };
  }
  try {
    return { blob: await input.renderV2(), notice: null };
  } catch {
    return { blob: await input.renderClassic(), notice: FALLBACK_NOTICE };
  }
}

function moneyTokens(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return [];
  const body = Math.abs(value).toFixed(2);
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

function pdfText(file) {
  if (!fs.existsSync(file)) return '';
  return execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
}

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function writePng(file, png) {
  fs.writeFileSync(file, PNG.sync.write(png));
}

function raster(pdfPath, prefix) {
  execFileSync('pdftoppm', ['-png', '-r', '72', '-f', '1', '-l', '1', pdfPath, prefix], { stdio: 'pipe' });
  return `${prefix}-1.png`;
}

function sideBySide(classicPngPath, flowPngPath, outPath, labelClassic = 'classic', labelFlow = 'flow') {
  const left = readPng(classicPngPath);
  const right = readPng(flowPngPath);
  const gap = 16;
  const header = 28;
  const width = left.width + right.width + gap + 24;
  const height = Math.max(left.height, right.height) + header + 16;
  const sheet = new PNG({ width, height });
  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = 255;
    sheet.data[i + 1] = 255;
    sheet.data[i + 2] = 255;
    sheet.data[i + 3] = 255;
  }
  const blit = (src, ox, oy) => {
    for (let y = 0; y < src.height; y += 1) {
      for (let x = 0; x < src.width; x += 1) {
        const si = (src.width * y + x) << 2;
        const di = (sheet.width * (oy + y) + (ox + x)) << 2;
        sheet.data[di] = src.data[si];
        sheet.data[di + 1] = src.data[si + 1];
        sheet.data[di + 2] = src.data[si + 2];
        sheet.data[di + 3] = src.data[si + 3];
      }
    }
  };
  blit(left, 8, header);
  blit(right, 8 + left.width + gap, header);
  writePng(outPath, sheet);
  return { labelClassic, labelFlow, outPath };
}

function num(value) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function filled(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  return true;
}

function renderClassicBatch() {
  fs.mkdirSync(classicDir, { recursive: true });
  execFileSync(
    process.execPath,
    [
      path.join(root, 'node_modules/vitest/vitest.mjs'),
      'run',
      '--project',
      'unit',
      'src/features/reports/flow/flowRealClassicRender.test.ts',
    ],
    {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        FLOW_REAL_CLASSIC_DIR: classicDir,
        FLOW_REAL_LIVE_JSON: livePath,
        TZ: 'UTC',
      },
    },
  );
}

function moneyReconcile(doc, classicText, flowText, { classicTaxField = 'tax_total', flowTaxField = 'tax_amount' } = {}) {
  // Classic commercial notes / quotations read tax_total only (no tax_amount fallback).
  const classicTax = num(doc[classicTaxField]);
  const flowTax = num(doc[flowTaxField]) ?? num(doc.tax_amount) ?? num(doc.tax_total);
  const taxNote =
    classicTax !== flowTax
      ? `classic uses ${classicTaxField}=${classicTax ?? 'null'} (prints ${classicTax ?? 0}); flow uses ${flowTaxField} cascade=${flowTax ?? 'null'}`
      : null;
  const rows = [
    { key: 'subtotal', record: num(doc.subtotal) },
    { key: 'discount', record: num(doc.discount ?? doc.discount_amount) ?? 0 },
    {
      key: 'tax',
      record: flowTax,
      classicRecord: classicTax ?? 0,
      classicCheckAmount: classicTax ?? 0,
      flowCheckAmount: flowTax,
      note: taxNote,
    },
    { key: 'rounding', record: num(doc.rounding) ?? 0 },
    { key: 'total', record: num(doc.total_amount) },
    ...(doc.lines || []).map((line, index) => ({
      key: `line:${index}`,
      record: num(line.line_total),
      description: line.description,
    })),
  ];
  const differences = [];
  const checks = rows.map((row) => {
    const amount = row.record;
    const classicAmount = row.classicCheckAmount != null ? row.classicCheckAmount : amount;
    const flowAmount = row.flowCheckAmount != null ? row.flowCheckAmount : amount;
    const inClassic = classicAmount == null ? null : containsAmount(classicText, classicAmount) || (classicAmount === 0 && !taxNote);
    const inFlow = flowAmount == null ? null : containsAmount(flowText, flowAmount) || (flowAmount === 0 && !/Tax/i.test(flowText) === false);
    if (row.note) differences.push({ key: row.key, cause: row.note });
    if (row.key === 'tax' && taxNote) {
      // Field-mapping difference already recorded; skip duplicate "not found" noise when classic has no tax_total.
    } else if (inClassic === false && classicAmount !== 0) {
      differences.push({
        key: row.key,
        amount: classicAmount,
        cause: 'amount on record not found in classic PDF text extract',
      });
    }
    if (inFlow === false && flowAmount !== 0) {
      differences.push({
        key: row.key,
        amount: flowAmount,
        cause: 'amount on record not found in flow PDF text extract',
      });
    }
    return { ...row, inClassic, inFlow, classicAmount, flowAmount };
  });
  return { checks, differences };
}

function orgPayload(organization) {
  return {
    organization,
    bank: organization?.bank || organization?.bank_details || {},
  };
}

async function renderFlow(type, record, outPdf) {
  const code = type === 'quotation' ? 'QUOTATION_FLOW_1' : type === 'credit-note' ? 'CREDIT_NOTE_FLOW_1' : 'DEBIT_NOTE_FLOW_1';
  await renderInvoiceFlowPdf({ ...record, code }, outPdf);
  return code;
}

function quotationFieldMatrix(rows) {
  const fields = [
    { key: 'valid_until', aliases: ['valid_until'], classic: 'dueDate / Valid Until label', flow: 'Valid Until' },
    { key: 'transit_time_days', aliases: ['transit_time_days'], classic: 'shipment.etdEta (Transit N day(s))', flow: 'not printed' },
    { key: 'incoterm', aliases: ['incoterm', 'incoterms'], classic: 'remarks (Incoterm: …)', flow: 'Incoterms grid (reads quotation.incoterms)' },
    { key: 'airline / carrier', aliases: ['carrier_name', 'carrier_preference', 'carrier_id'], classic: 'shipment.vesselFlight', flow: 'Carrier grid' },
    { key: 'flight / voyage', aliases: ['voyage_number', 'vessel_name'], classic: 'not printed', flow: 'not printed' },
    { key: 'gross_weight', aliases: ['gross_weight'], classic: 'shipment.grossWtCbm', flow: 'not printed' },
    { key: 'volume_cbm', aliases: ['volume_cbm'], classic: 'shipment.grossWtCbm', flow: 'not printed' },
    { key: 'container_count / type', aliases: ['container_count', 'container_type_id'], classic: 'shipment.containerNo', flow: 'not printed' },
    { key: 'terms', aliases: ['terms_and_conditions', 'terms'], classic: 'not as dedicated terms block', flow: 'termsLines from quotation.terms' },
    { key: 'remarks', aliases: ['remarks', 'special_requirements'], classic: 'remarks block', flow: 'Remarks grid + terms' },
  ];

  const byBucket = { air: [], fcl: [], lcl: [], other: [] };
  for (const row of rows) {
    const q = row.quotation || {};
    const held = {};
    for (const field of fields) {
      held[field.key] = field.aliases.some((alias) => filled(q[alias]));
    }
    byBucket[row.bucket || 'other'].push({
      id: row.id,
      number: q.quotation_number,
      job_type: q.job_type,
      held,
      values: Object.fromEntries(
        fields.flatMap((field) => field.aliases.map((alias) => [alias, q[alias] ?? null])),
      ),
    });
  }

  const bindExistingNotPrinted = [
    {
      source: 'quotation.transit_time_days',
      classic: 'printed via shipment.etdEta',
      flow: 'held on record, not bound in QUOTATION_FLOW_1',
      action: 'bind into flow field grid',
    },
    {
      source: 'quotation.gross_weight / volume_cbm',
      classic: 'printed via shipment.grossWtCbm',
      flow: 'held on record, not bound in QUOTATION_FLOW_1',
      action: 'bind into flow field grid',
    },
    {
      source: 'quotation.container_count / container_type_id',
      classic: 'printed via shipment.containerNo (+ optional label)',
      flow: 'held on record, not bound in QUOTATION_FLOW_1',
      action: 'bind into flow field grid',
    },
    {
      source: 'quotation.incoterm (singular)',
      classic: 'printed in remarks',
      flow: 'reads quotation.incoterms (plural) — mapping miss when only incoterm is set',
      action: 'bind quotation.incoterm as fallback in flow Incoterms cell',
    },
    {
      source: 'quotation.terms_and_conditions',
      classic: 'not a dedicated print slot',
      flow: 'reads quotation.terms only',
      action: 'bind terms_and_conditions as fallback',
    },
    {
      source: 'quotation.voyage_number / vessel_name',
      classic: 'not printed',
      flow: 'not printed',
      action: 'backend/UI already store; print decision needed',
    },
  ];

  const backendRequirements = [
    'airline name as a dedicated field when carrier_name is empty for air jobs',
    'flight number distinct from voyage_number for air jobs',
    'resolved container type label (container_type_id alone is an id)',
    'structured validity / transit display units if free-text is insufficient',
  ];

  return { fields, byBucket, bindExistingNotPrinted, backendRequirements };
}

function blanksForQuotation(row) {
  const q = row.quotation || {};
  const party = row.party || {};
  const boxes = [
    { box: 'Bill To name', reason: filled(q.customer_name) || filled(party.name) ? null : 'empty in the record' },
    { box: 'Bill To address', reason: filled(party.address) || filled(q.customer_address) ? null : 'empty in the record' },
    { box: 'Valid Until', reason: filled(q.valid_until) ? null : 'empty in the record' },
    { box: 'Incoterms (flow)', reason: filled(q.incoterms) || filled(q.incoterm) ? (filled(q.incoterms) ? null : 'record has incoterm; flow looks for incoterms — no source for flow cell') : 'empty in the record' },
    { box: 'POL', reason: filled(q.origin_port_code) || filled(q.origin_port_name) ? null : 'empty in the record' },
    { box: 'POD', reason: filled(q.dest_port_code) || filled(q.dest_port_name) ? null : 'empty in the record' },
    { box: 'Carrier', reason: filled(q.carrier_name) || filled(q.carrier_preference) ? null : 'empty in the record' },
    { box: 'Transit time (flow)', reason: filled(q.transit_time_days) ? 'held on record; no source binding in flow template' : 'empty in the record' },
    { box: 'Weight / volume (flow)', reason: filled(q.gross_weight) || filled(q.volume_cbm) ? 'held on record; no source binding in flow template' : 'empty in the record' },
    { box: 'Containers (flow)', reason: filled(q.container_count) || filled(q.container_type_id) ? 'held on record; no source binding in flow template' : 'empty in the record' },
    { box: 'Terms (flow)', reason: filled(q.terms) || filled(q.terms_and_conditions) ? (filled(q.terms) ? null : 'record has terms_and_conditions; flow looks for terms — no source for flow cell') : 'empty in the record' },
    { box: 'Remarks', reason: filled(q.remarks) || filled(q.special_requirements) ? null : 'empty in the record' },
    { box: 'Lines', reason: (q.lines || []).length ? null : 'empty in the record' },
    { box: 'Job context', reason: row.job ? null : 'empty in the record' },
  ];
  return boxes.filter((item) => item.reason);
}

function blanksForNote(row, kind) {
  const doc = kind === 'credit' ? row.creditNote : row.debitNote;
  const party = row.party || {};
  const boxes = [
    { box: 'Bill To name', reason: filled(doc.party_name) || filled(party.name) ? null : 'empty in the record' },
    { box: 'Bill To address', reason: filled(party.address) ? null : 'empty in the record' },
    { box: 'Original invoice', reason: filled(doc.credited_invoice_number) || filled(row.invoice?.invoice_number) ? null : 'empty in the record' },
    { box: 'Tax', reason: doc.tax_amount != null || doc.tax_total != null || (doc.lines || []).some((line) => Number(line.tax_amount) > 0) ? null : 'empty in the record' },
    { box: 'Job', reason: filled(doc.job_number) || row.job ? null : 'empty in the record' },
    { box: 'Remarks', reason: filled(doc.remarks) ? null : 'empty in the record' },
    { box: 'Lines', reason: (doc.lines || []).length ? null : 'empty in the record' },
  ];
  return boxes.filter((item) => item.reason);
}

function fieldFillShare(objects, keys) {
  if (!objects.length) return { filled: 0, total: 0, share: 0 };
  let filledCount = 0;
  let total = 0;
  for (const obj of objects) {
    for (const key of keys) {
      total += 1;
      if (filled(obj[key])) filledCount += 1;
    }
  }
  return { filled: filledCount, total, share: total ? filledCount / total : 0 };
}

async function processType(type, rows, live) {
  const dir = path.join(outRoot, type);
  fs.mkdirSync(dir, { recursive: true });
  const results = [];
  for (const row of rows) {
    const doc = type === 'quotation' ? row.quotation : type === 'credit-note' ? row.creditNote : row.debitNote;
    const id = row.id;
    const record = {
      ...orgPayload(live.organization),
      party: row.party,
      job: row.job,
      invoice: row.invoice,
      quotation: row.quotation,
      creditNote: row.creditNote,
      debitNote: row.debitNote,
    };
    const flowPdf = path.join(dir, `${id}-flow.pdf`);
    const classicPdf = path.join(classicDir, type, `${id}.pdf`);
    await renderFlow(type, record, flowPdf);
    const classicText = pdfText(classicPdf);
    const flowText = pdfText(flowPdf);
    const money = moneyReconcile(doc, classicText, flowText, {
      classicTaxField: type === 'quotation' ? 'tax_total' : 'tax_total',
      flowTaxField: 'tax_amount',
    });
    const classicPng = raster(classicPdf, path.join(dir, `${id}-classic`));
    const flowPng = raster(flowPdf, path.join(dir, `${id}-flow`));
    const comparePath = path.join(dir, `${id}-compare.png`);
    sideBySide(classicPng, flowPng, comparePath);

    const sign = type === 'credit-note' || type === 'debit-note'
      ? {
          amountsPositive: (doc.lines || []).every((line) => num(line.line_total) == null || num(line.line_total) >= 0)
            && (num(doc.total_amount) == null || num(doc.total_amount) >= 0),
          total_amount: doc.total_amount,
          tax_total: doc.tax_total,
          tax_amount: doc.tax_amount,
          originalInvoice: doc.credited_invoice_number || row.invoice?.invoice_number || null,
          classicWording: {
            documentTitle: type === 'credit-note' ? 'CREDIT NOTE' : 'DEBIT NOTE',
            documentSubtitle: type === 'credit-note' ? 'CREDIT NOTE / STATEMENT OF CHARGES' : 'DEBIT NOTE / STATEMENT OF CHARGES',
            relatedInvoiceLabel: 'Related Invoice',
            source: 'src/features/invoices/utils/commercialNoteToPdfModel.ts labelsFor()',
          },
          flowWording: {
            title: type === 'credit-note' ? 'CREDIT NOTE' : 'DEBIT NOTE',
            originalInvoiceLabel: 'Original Invoice:',
            termsLine: type === 'credit-note'
              ? 'This credit note adjusts the original invoice. Please apply it against the outstanding balance.'
              : 'This debit note adjusts the original invoice. Payment is due as per the terms of the original invoice.',
            source: 'tools/reports/flow-doc.mjs buildCreditOrDebit()',
          },
        }
      : null;

    results.push({
      id,
      number: doc.quotation_number || doc.credit_note_number || doc.debit_note_number,
      synthetic: Boolean(row.synthetic),
      bucket: row.bucket || null,
      compare: path.relative(root, comparePath).replace(/\\/g, '/'),
      money,
      blanks: type === 'quotation' ? blanksForQuotation(row) : blanksForNote(row, type === 'credit-note' ? 'credit' : 'debit'),
      sign,
      leak: /fresa|powered by|<h3>/i.test(flowText) || /fresa|powered by|<h3>/i.test(classicText),
    });
  }
  return results;
}

async function stressAndFallback(live) {
  const dir = path.join(outRoot, 'stress');
  fs.mkdirSync(dir, { recursive: true });
  const org = live.organization || {};
  const seedQuote = live.quotations?.[0]?.quotation || {};
  const seedLine = (seedQuote.lines || [])[0] || {
    description: 'Charge',
    quantity: 1,
    unit_price: 10,
    tax_amount: 0,
    line_total: 10,
  };

  const longName = `${'Very Long Customer Name '.repeat(8)}LLC`;
  const longAddress = `${'1234 Extremely Long Address Boulevard Suite 999 Floor 12 Building Alpha Wing B '.repeat(3)}District`;

  const cases = [];

  // 40-line quotation
  const fortyLines = Array.from({ length: 40 }, (_, index) => ({
    ...seedLine,
    description: `Charge line ${index + 1} ${seedLine.description || ''}`.trim(),
    id: `stress-line-${index + 1}`,
  }));
  const fortyQuote = {
    organization: org,
    party: { name: longName, address: longAddress, city: 'Dubai' },
    quotation: {
      ...seedQuote,
      quotation_number: 'QT/STRESS/40',
      customer_name: longName,
      lines: fortyLines,
      subtotal: fortyLines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_price || 0), 0),
      tax_amount: fortyLines.reduce((sum, line) => sum + Number(line.tax_amount || 0), 0),
      total_amount: fortyLines.reduce((sum, line) => sum + Number(line.line_total || 0), 0),
    },
  };
  const fortyPdf = path.join(dir, 'quotation-40-lines.pdf');
  await renderInvoiceFlowPdf({ ...fortyQuote, code: 'QUOTATION_FLOW_1' }, fortyPdf);
  const fortyText = pdfText(fortyPdf);
  const fortyPages = execFileSync('pdfinfo', [fortyPdf], { encoding: 'utf8' });
  const pageMatch = /Pages:\s+(\d+)/.exec(fortyPages);
  cases.push({
    case: 'quotation-40-lines',
    pages: pageMatch ? Number(pageMatch[1]) : null,
    lastLineInText: containsAmount(fortyText, fortyLines[39].line_total) || /Charge line 40/.test(fortyText),
    silentlyClipped: !(containsAmount(fortyText, fortyLines[39].line_total) || /Charge line 40/.test(fortyText)),
  });

  // Long names CN
  const longCn = {
    organization: org,
    party: { name: longName, address: longAddress },
    creditNote: {
      credit_note_number: 'CN/STRESS/LONG',
      invoice_date: '2026-01-01',
      currency_code: 'USD',
      party_name: longName,
      credited_invoice_number: 'INV/STRESS/1',
      subtotal: 100,
      tax_amount: 5,
      tax_total: 5,
      total_amount: 105,
      lines: [{ description: 'Adjustment', quantity: 1, unit_price: 100, tax_amount: 5, line_total: 105 }],
    },
  };
  const longCnPdf = path.join(dir, 'credit-note-long-name.pdf');
  await renderInvoiceFlowPdf({ ...longCn, code: 'CREDIT_NOTE_FLOW_1' }, longCnPdf);
  const longCnText = pdfText(longCnPdf);
  cases.push({
    case: 'credit-note-long-name',
    namePresent: longCnText.includes(longName.slice(0, 40)),
    silentlyClipped: !longCnText.includes(longName.slice(0, 20)),
  });

  // Multi-currency DN
  const multi = {
    organization: org,
    party: { name: 'Multi Currency Party' },
    debitNote: {
      debit_note_number: 'DN/STRESS/FX',
      invoice_date: '2026-01-01',
      currency_code: 'EUR',
      party_name: 'Multi Currency Party',
      credited_invoice_number: 'INV/STRESS/2',
      subtotal: 200,
      tax_amount: 0,
      tax_total: 0,
      total_amount: 200,
      lines: [{ description: 'EUR charge', quantity: 1, unit_price: 200, tax_amount: 0, line_total: 200 }],
    },
  };
  const multiPdf = path.join(dir, 'debit-note-multi-currency.pdf');
  await renderInvoiceFlowPdf({ ...multi, code: 'DEBIT_NOTE_FLOW_1' }, multiPdf);
  const multiText = pdfText(multiPdf);
  cases.push({
    case: 'debit-note-multi-currency',
    currencyInPdf: /EUR/.test(multiText),
    totalInPdf: containsAmount(multiText, 200),
  });

  // Missing party / missing job quotation
  const missing = {
    organization: org,
    party: null,
    job: null,
    quotation: {
      quotation_number: 'QT/STRESS/MISSING',
      quotation_date: '2026-01-01',
      currency_code: 'AED',
      subtotal: 50,
      tax_amount: 0,
      total_amount: 50,
      lines: [{ description: 'Only charge', quantity: 1, unit_price: 50, tax_amount: 0, line_total: 50 }],
    },
  };
  const missingPdf = path.join(dir, 'quotation-missing-party-job.pdf');
  await renderInvoiceFlowPdf({ ...missing, code: 'QUOTATION_FLOW_1' }, missingPdf);
  cases.push({
    case: 'quotation-missing-party-job',
    rendered: fs.existsSync(missingPdf),
    leak: /fresa/i.test(pdfText(missingPdf)),
  });

  // Fallback: flow render throws → classic + notice
  const classicBlob = new Blob([Buffer.from('%PDF-1.4 classic-fallback')]);
  const fallback = await generateWithFallback({
    attemptV2: true,
    renderV2: async () => {
      throw new Error('forced flow failure');
    },
    renderClassic: async () => classicBlob,
  });
  cases.push({
    case: 'fallback-on-flow-failure',
    notice: fallback.notice,
    noticeMatches: fallback.notice === FALLBACK_NOTICE,
    classicReturned: Boolean(fallback.blob),
  });

  fs.writeFileSync(path.join(dir, 'stress.json'), `${JSON.stringify({ cases }, null, 2)}\n`);
  return cases;
}

function writeBlanksMd(quotationResults, creditResults, debitResults, live) {
  const qKeys = [
    'quotation_number', 'quotation_date', 'valid_until', 'currency_code', 'job_type', 'incoterm', 'incoterms',
    'origin_port_code', 'dest_port_code', 'carrier_name', 'transit_time_days', 'gross_weight', 'volume_cbm',
    'container_count', 'container_type_id', 'terms', 'terms_and_conditions', 'remarks', 'subtotal', 'tax_amount', 'total_amount',
  ];
  const nKeys = [
    'credit_note_number', 'debit_note_number', 'invoice_date', 'currency_code', 'party_name',
    'credited_invoice_number', 'subtotal', 'tax_total', 'tax_amount', 'total_amount', 'remarks',
  ];
  const qShare = fieldFillShare((live.quotations || []).map((row) => row.quotation || {}), qKeys);
  const cShare = fieldFillShare((live.creditNotes || []).map((row) => row.creditNote || {}), nKeys.filter((k) => k !== 'debit_note_number'));
  const dShare = fieldFillShare((live.debitNotes || []).map((row) => row.debitNote || {}), nKeys.filter((k) => k !== 'credit_note_number'));

  const section = (title, share, results) => {
    const lines = [
      `## ${title}`,
      '',
      `Fill share (selected print-relevant keys): **${share.filled}/${share.total}** (${(share.share * 100).toFixed(1)}%).`,
      '',
    ];
    for (const row of results) {
      lines.push(`### ${row.number || row.id}${row.synthetic ? ' (synthetic)' : ''}`);
      if (!row.blanks.length) {
        lines.push('- (no empty boxes recorded)');
      } else {
        for (const blank of row.blanks) {
          lines.push(`- **${blank.box}**: ${blank.reason}`);
        }
      }
      lines.push('');
    }
    return lines.join('\n');
  };

  const md = [
    '# Real-record blanks — quotation / credit note / debit note',
    '',
    `Fetched at: ${live.fetchedAt}`,
    '',
    'Credit notes real count: '
      + `${live.notes?.creditNotes?.realCount ?? 0} via \`GET /credit-notes\` `
      + (live.notes?.creditNotes?.belowFive ? '(below 5 — synthetic anonymized copies from real invoices used)' : ''),
    '',
    'Debit notes real count: '
      + `${live.notes?.debitNotes?.realCount ?? 0} via \`GET /debit-notes\` `
      + (live.notes?.debitNotes?.belowFive ? '(below 5 — synthetic anonymized copies from real invoices used)' : ''),
    '',
    section('Quotation', qShare, quotationResults),
    section('Credit note', cShare, creditResults),
    section('Debit note', dShare, debitResults),
  ].join('\n');

  fs.writeFileSync(path.join(outRoot, 'blanks.md'), `${md}\n`);
}

const live = JSON.parse(fs.readFileSync(livePath, 'utf8'));
fs.mkdirSync(outRoot, { recursive: true });
renderClassicBatch();

const quotationResults = await processType('quotation', live.quotations || [], live);
const creditResults = await processType('credit-note', live.creditNotes || [], live);
const debitResults = await processType('debit-note', live.debitNotes || [], live);
const quotationFields = quotationFieldMatrix(live.quotations || []);
const stress = await stressAndFallback(live);
writeBlanksMd(quotationResults, creditResults, debitResults, live);

const cnReport = {
  realCount: live.notes?.creditNotes?.realCount ?? 0,
  endpoint: live.endpoints?.creditNotes,
  syntheticUsed: (live.creditNotes || []).filter((row) => row.synthetic).length,
  signConvention: creditResults.map((row) => ({
    id: row.id,
    number: row.number,
    amountsPositive: row.sign?.amountsPositive,
    total_amount: row.sign?.total_amount,
    tax_total: row.sign?.tax_total,
    tax_amount: row.sign?.tax_amount,
    originalInvoice: row.sign?.originalInvoice,
  })),
  classicPrintsAmountsAsStored: true,
  classicTaxField: 'tax_total (commercialNoteToPdfModel vatAmount = note.tax_total)',
  flowTaxField: 'tax_amount ?? tax_total (flow-doc noteTotals)',
  wording: creditResults[0]?.sign
    ? {
        classic: creditResults[0].sign.classicWording,
        flow: creditResults[0].sign.flowWording,
        jurisdictionDecision: 'not decided — listed wording only',
      }
    : null,
  differences: creditResults.flatMap((row) => (row.money.differences || []).map((diff) => ({ id: row.id, ...diff }))),
};

const summary = {
  endpoints: live.endpoints,
  notes: live.notes,
  quotation: {
    count: quotationResults.length,
    buckets: {
      air: quotationResults.filter((row) => row.bucket === 'air').length,
      fcl: quotationResults.filter((row) => row.bucket === 'fcl').length,
      lcl: quotationResults.filter((row) => row.bucket === 'lcl').length,
    },
    differences: quotationResults.flatMap((row) => (row.money.differences || []).map((diff) => ({ id: row.id, number: row.number, ...diff }))),
    fieldMatrix: quotationFields,
  },
  creditNote: cnReport,
  debitNote: {
    realCount: live.notes?.debitNotes?.realCount ?? 0,
    endpoint: live.endpoints?.debitNotes,
    syntheticUsed: (live.debitNotes || []).filter((row) => row.synthetic).length,
    differences: debitResults.flatMap((row) => (row.money.differences || []).map((diff) => ({ id: row.id, number: row.number, ...diff }))),
  },
  stress,
  compares: {
    quotation: quotationResults.map((row) => row.compare),
    creditNote: creditResults.map((row) => row.compare),
    debitNote: debitResults.map((row) => row.compare),
  },
};

fs.writeFileSync(path.join(outRoot, 'reconcile.json'), `${JSON.stringify({ quotationResults, creditResults, debitResults, summary }, null, 2)}\n`);
fs.writeFileSync(path.join(outRoot, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outRoot, 'quotation-fields.md'),
  [
    '# Quotation fields — air / FCL / LCL',
    '',
    '## Held vs printed',
    '',
    ...quotationFields.fields.map((field) => `- **${field.key}**: classic — ${field.classic}; flow — ${field.flow}`),
    '',
    '## Bind existing sources not printed on flow',
    '',
    ...quotationFields.bindExistingNotPrinted.map((item) => `- \`${item.source}\`: ${item.flow}. Action: ${item.action}.`),
    '',
    '## Backend requirements (not on record / not resolved)',
    '',
    ...quotationFields.backendRequirements.map((item) => `- ${item}`),
    '',
    '## Sample held flags by bucket',
    '',
    '```json',
    JSON.stringify(
      Object.fromEntries(
        Object.entries(quotationFields.byBucket).map(([bucket, rows]) => [
          bucket,
          rows.map((row) => ({ number: row.number, job_type: row.job_type, held: row.held })),
        ]),
      ),
      null,
      2,
    ),
    '```',
    '',
  ].join('\n'),
);

fs.writeFileSync(
  path.join(outRoot, 'credit-note-sign.md'),
  [
    '# Credit note — sign, original invoice, tax, wording',
    '',
    `Real records via \`GET /credit-notes\`: **${cnReport.realCount}** (below 5 → synthetic anonymized copies from real invoices).`,
    '',
    '## Sign convention',
    '',
    '- Record amounts on synthetic copies (and any future real notes) are stored **positive** as on the source invoice (`subtotal`, `tax_*`, `total_amount`, line `line_total` ≥ 0).',
    '- Classic prints amounts as stored (`commercialNoteToPdfModel` → `generateInvoicePdf`); no sign flip.',
    '- Flow prints amounts as stored via `tax_amount ?? tax_total`.',
    '',
    '## Tax fields',
    '',
    `- Classic VAT: \`${cnReport.classicTaxField}\``,
    `- Flow tax: \`${cnReport.flowTaxField}\``,
    '',
    '## Wording (listed only — no jurisdiction decision)',
    '',
    '```json',
    JSON.stringify(cnReport.wording, null, 2),
    '```',
    '',
    '## Per-record original invoice + tax',
    '',
    '```json',
    JSON.stringify(cnReport.signConvention, null, 2),
    '```',
    '',
    '## Differences vs classic / record',
    '',
    cnReport.differences.length
      ? cnReport.differences.map((diff) => `- ${diff.id} ${diff.key}: ${diff.cause}`).join('\n')
      : '- (none recorded)',
    '',
  ].join('\n'),
);

console.log(JSON.stringify({
  quotations: quotationResults.length,
  creditNotes: creditResults.length,
  debitNotes: debitResults.length,
  quotationDiffs: summary.quotation.differences.length,
  creditDiffs: summary.creditNote.differences.length,
  debitDiffs: summary.debitNote.differences.length,
  stressOk: stress.every((item) => item.silentlyClipped !== true && item.noticeMatches !== false),
  outRoot: path.relative(root, outRoot),
}, null, 2));
