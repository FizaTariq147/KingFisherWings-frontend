/**
 * Build a pdfmake docDefinition for engine=flow invoices.
 * Composed from reusable flow-blocks. Totals use tax_amount (never tax_total).
 */
import { amountInWords } from './amount-words.mjs';
import { flowInvoiceOptions, resolveChargeColumns } from './invoice-flow-options.mjs';
import { flowTotalsRows } from './invoice-flow-totals.mjs';
import {
  blockBankAndTerms,
  blockFieldGrid,
  blockFooter,
  blockHeader,
  blockTable,
  blockTitle,
  blockTwoColumnPartyMeta,
  blockWordsAndTotals,
  cell,
  createFlowStyle,
  flowDocument,
  headerCell,
} from './flow-blocks.mjs';

const STYLE = createFlowStyle();

const COLUMN_LABELS = {
  charges: 'Charges',
  sac: 'SAC',
  qty: 'Qty',
  rate: 'Rate',
  currency: 'Curr',
  exRate: 'Ex.Rate',
  fcy: 'FCY',
  taxable: 'Taxable',
  nonTax: 'Non Tax',
  pretax: 'Amount',
  tax: 'Tax',
  total: 'Total',
  sgstPct: 'SGST%',
  sgst: 'SGST',
  cgstPct: 'CGST%',
  cgst: 'CGST',
  iugstPct: 'I/UGST%',
  iugst: 'I/UGST',
};

const text = (value) => (value == null ? '' : String(value).trim());

function firstText(...values) {
  for (const value of values) {
    const cleaned = text(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function money(value) {
  if (value == null || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberText(value) {
  if (value == null || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return text(value);
  return String(number);
}

function joinParts(...parts) {
  return parts.map(text).filter(Boolean).join(', ');
}

function formatDate(value) {
  const raw = text(value);
  if (!raw) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!match) return raw;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[Number(match[2]) - 1] || match[2];
  return `${match[3]}-${month}-${match[1].slice(2)}`;
}

function lineHasSplitTax(line) {
  return [line?.sgst_amount, line?.cgst_amount, line?.igst_amount, line?.ugst_amount].some(
    (value) => value != null && value !== '' && Math.abs(Number(value)) > 0.0001,
  );
}

function resolveTaxMode(options, lines) {
  const mode = options.taxMode || 'auto';
  if (mode === 'none') return 'none';
  if (mode === 'split') return 'split';
  if (mode === 'single') return 'single';
  return (lines || []).some(lineHasSplitTax) ? 'split' : 'single';
}

function chargeColumnsForMode(baseColumns, taxMode) {
  const withoutTax = baseColumns.filter((key) => !['tax', 'sgstPct', 'sgst', 'cgstPct', 'cgst', 'iugstPct', 'iugst', 'pretax'].includes(key));
  if (taxMode === 'none') return withoutTax;
  if (taxMode === 'split') {
    const insertAt = withoutTax.indexOf('total');
    const split = ['sgstPct', 'sgst', 'cgstPct', 'cgst', 'iugstPct', 'iugst'];
    if (insertAt < 0) return [...withoutTax, ...split];
    return [...withoutTax.slice(0, insertAt), ...split, ...withoutTax.slice(insertAt)];
  }
  if (!withoutTax.includes('tax') && withoutTax.includes('total')) {
    const insertAt = withoutTax.indexOf('total');
    return [...withoutTax.slice(0, insertAt), 'tax', ...withoutTax.slice(insertAt)];
  }
  if (!withoutTax.includes('tax')) return [...withoutTax, 'tax'];
  return withoutTax.includes('tax') ? withoutTax : [...withoutTax, 'tax'];
}

function widthForColumn(key) {
  const map = {
    charges: '*',
    sac: 28,
    qty: 24,
    rate: 40,
    currency: 28,
    exRate: 34,
    fcy: 40,
    taxable: 42,
    nonTax: 42,
    pretax: 44,
    tax: 40,
    total: 48,
    sgstPct: 28,
    sgst: 34,
    cgstPct: 28,
    cgst: 34,
    iugstPct: 32,
    iugst: 34,
  };
  return map[key] ?? 36;
}

/** Pre-tax line amount: qty×rate when both present, else line_total − tax. */
export function linePreTaxAmount(line) {
  const qty = Number(line?.quantity);
  const rate = Number(line?.unit_price);
  if (Number.isFinite(qty) && Number.isFinite(rate) && line?.quantity !== '' && line?.unit_price !== '' && line?.quantity != null && line?.unit_price != null) {
    return Math.round(qty * rate * 100) / 100;
  }
  const total = Number(line?.line_total);
  const tax = Number(line?.tax_amount || 0);
  if (Number.isFinite(total)) return Math.round((total - (Number.isFinite(tax) ? tax : 0)) * 100) / 100;
  return 0;
}

function lineCellValue(key, line, currency) {
  switch (key) {
    case 'charges':
      return firstText(line.description, line.charge_code_name);
    case 'sac':
      return text(line.sac_code);
    case 'qty':
      return numberText(line.quantity);
    case 'rate':
      return money(line.unit_price);
    case 'currency':
      return firstText(line.currency_code, currency);
    case 'exRate':
      return line.exchange_rate == null || line.exchange_rate === '' ? '' : Number(line.exchange_rate).toFixed(5);
    case 'fcy':
      return money(line.unit_price);
    case 'taxable':
      return line.is_taxable === false
        ? ''
        : money(line.taxable_amount ?? Number(line.unit_price) * Number(line.quantity || 0));
    case 'nonTax':
      return line.is_taxable === false ? money(line.line_total) : money(line.non_taxable_amount);
    case 'pretax':
      return money(linePreTaxAmount(line));
    case 'tax':
      return money(line.tax_amount);
    case 'total':
      return money(line.line_total);
    case 'sgstPct':
      return line.sgst_rate == null ? '' : Number(line.sgst_rate).toFixed(2);
    case 'sgst':
      return money(line.sgst_amount);
    case 'cgstPct':
      return line.cgst_rate == null ? '' : Number(line.cgst_rate).toFixed(2);
    case 'cgst':
      return money(line.cgst_amount);
    case 'iugstPct':
      return line.igst_rate == null && line.ugst_rate == null
        ? ''
        : Number(line.igst_rate ?? line.ugst_rate).toFixed(2);
    case 'iugst':
      return money(line.igst_amount ?? line.ugst_amount);
    default:
      return '';
  }
}

function rightAligned(key) {
  return ['qty', 'rate', 'exRate', 'fcy', 'taxable', 'nonTax', 'pretax', 'tax', 'total', 'sgstPct', 'sgst', 'cgstPct', 'cgst', 'iugstPct', 'iugst'].includes(key);
}

function linesHaveTax(lines) {
  return (lines || []).some((line) => line?.tax_amount != null && line.tax_amount !== '' && Math.abs(Number(line.tax_amount)) > 0.0001);
}

/**
 * When lines carry tax, ensure Amount (pre-tax) + Tax + Total columns so
 * Sub Total + Tax = Total is visible in the charge table.
 */
function ensurePreTaxColumns(columns, lines) {
  if (!linesHaveTax(lines)) return columns;
  let next = [...columns];
  if (!next.includes('pretax')) {
    const taxAt = next.indexOf('tax');
    if (taxAt >= 0) next = [...next.slice(0, taxAt), 'pretax', ...next.slice(taxAt)];
    else {
      const totalAt = next.indexOf('total');
      next = totalAt >= 0 ? [...next.slice(0, totalAt), 'pretax', ...next.slice(totalAt)] : [...next, 'pretax'];
    }
  }
  if (!next.includes('tax')) {
    const totalAt = next.indexOf('total');
    next = totalAt >= 0 ? [...next.slice(0, totalAt), 'tax', ...next.slice(totalAt)] : [...next, 'tax'];
  }
  return next;
}

/**
 * @param {object} record - { organization, invoice, job, party, bank, session, logoBase64?, code? }
 * @param {object} [optionsOverride]
 */
export function buildInvoiceFlowDocDefinition(record = {}, optionsOverride = null) {
  const code = record.code || 'INVOICE_FLOW_TAX_INVOICE_1';
  const options = { ...(flowInvoiceOptions(code) || flowInvoiceOptions('INVOICE_FLOW_TAX_INVOICE_1')), ...(optionsOverride || {}) };
  const org = record.organization || {};
  const invoice = record.invoice || {};
  const job = record.job || {};
  const party = record.party || {};
  const bank = record.bank || org.bank || org.bank_details || {};
  const session = record.session || {};
  const ship = invoice.shipment || {};
  const sea = job.sea_fcl_details || job.sea_lcl_details || {};
  const air = job.air_details || {};
  const lines = invoice.lines || [];

  const companyName = firstText(org.display_name, org.name);
  const companyAddress = joinParts(org.address, org.city, org.country_code);
  const billToName = firstText(invoice.party_name, party.name);
  const billToAddress = joinParts(party.address, party.city, party.country_code);
  const billToGstin = firstText(party.vat_number, party.gstin, party.tax_number);
  const currency = text(options.currency) || text(invoice.currency_code);
  const total = invoice.total_amount;
  const words = firstText(
    invoice.amount_in_words,
    total == null || total === '' ? '' : amountInWords(total, currency),
  );

  const taxMode = resolveTaxMode(options, lines);
  const chargeKeys = ensurePreTaxColumns(
    chargeColumnsForMode(resolveChargeColumns(options), taxMode),
    lines,
  );
  const chargeWidths = chargeKeys.map(widthForColumn);
  const chargeBody = [
    chargeKeys.map((key) => headerCell(STYLE, COLUMN_LABELS[key] || key)),
    ...lines.map((line) =>
      chargeKeys.map((key) =>
        cell(STYLE, lineCellValue(key, line, currency), {
          alignment: rightAligned(key) ? 'right' : 'left',
          bold: key === 'total',
        }),
      ),
    ),
  ];

  const containers = [...(job.containers || [])];
  if (!containers.length && job.primary_container_number) {
    containers.push({
      container_number: job.primary_container_number,
      container_type_code: '',
      packages: job.pieces,
      gross_weight: job.gross_weight,
      cbm: job.volume_cbm,
    });
  }

  const containerBody = [
    ['Container No.', 'Type', 'No of Pcs', 'Gross Weight', 'Volume', 'Volume Weight'].map((label) => headerCell(STYLE, label)),
    ...(containers.length
      ? containers.map((item) => [
          cell(STYLE, firstText(item.container_number, item.number)),
          cell(STYLE, firstText(item.container_type_code, item.type)),
          cell(STYLE, firstText(item.packages, item.no_of_pcs, job.pieces)),
          cell(STYLE, firstText(item.gross_weight, job.gross_weight)),
          cell(STYLE, firstText(item.cbm, item.volume, job.volume_cbm)),
          cell(STYLE, firstText(item.volume_weight, item.vol_weight)),
        ])
      : [[cell(STYLE, ''), cell(STYLE, ''), cell(STYLE, ''), cell(STYLE, ''), cell(STYLE, ''), cell(STYLE, '')]]),
  ];

  const hbl = firstText(sea.hbl_number, ship.hbl_number, air.hawb_number, ship.hawb_number);
  const mbl = firstText(sea.mbl_number, ship.mbl_number, air.mawb_number, ship.mawb_number);
  const fieldRows = [
    ['Due Date', formatDate(invoice.due_date)],
    ['Shipper', firstText(job.shipper_name, billToName)],
    ['Consignee', firstText(job.consignee_name)],
    ['Job No.', joinParts(firstText(invoice.job_number, job.job_number), formatDate(job.job_date))],
    ['Shipment No.', joinParts(firstText(job.shipment_number, ship.shipment_number), formatDate(firstText(job.shipment_date, ship.shipment_date)))],
    ['MBL / MAWB No.', joinParts(mbl, formatDate(ship.mbl_date))],
    ['HBL / HAWB No.', joinParts(hbl, formatDate(ship.hbl_date))],
    ['Place of Receipt', firstText(sea.place_of_receipt, ship.place_of_receipt)],
    ['POR', firstText(ship.por, job.origin_port_code)],
    ['POL', firstText(job.origin_port_code, ship.pol)],
    ['POD', firstText(job.dest_port_code, ship.pod)],
    ['Place of Delivery', firstText(sea.place_of_delivery, ship.place_of_delivery)],
    ['Vessel / Voyage', joinParts(firstText(job.vessel_name, sea.vessel_name, ship.vessel_name), firstText(job.voyage_number, sea.voyage_number, ship.voyage_number))],
    ['ETD', formatDate(firstText(job.etd, sea.etd))],
    ['ETA', formatDate(firstText(job.eta, sea.eta))],
    ['Reference No.', joinParts(firstText(job.client_reference_no, ship.reference_no), formatDate(firstText(job.reference_date, ship.reference_date)))],
    ['Currency', currency ? `${currency}${invoice.exchange_rate != null && invoice.exchange_rate !== '' ? ` ${Number(invoice.exchange_rate).toFixed(6)}` : ''}` : ''],
    ['IGM No.', joinParts(ship.igm_number, formatDate(ship.igm_date))],
    ['INCO Terms', text(job.incoterms)],
    ['Narration', firstText(invoice.narration)],
    ['Remarks', firstText(invoice.remarks)],
  ];

  const content = [
    blockHeader(STYLE, {
      logoBase64: record.logoBase64,
      companyName,
      companyAddress,
      contactLine: [org.phone, org.email, org.website].map(text).filter(Boolean).join('  ') || ' ',
    }),
    blockTitle(STYLE, { title: options.title || 'TAX INVOICE' }),
    blockTwoColumnPartyMeta(STYLE, {
      leftStack: [
        { text: 'Bill To', bold: true, fontSize: STYLE.fonts.body, margin: [0, 0, 0, 3] },
        { text: billToName || ' ', fontSize: STYLE.fonts.body },
        { text: billToAddress || ' ', fontSize: STYLE.fonts.body, margin: [0, 1, 0, 0] },
        { text: billToGstin ? `GSTIN: ${billToGstin}` : ' ', fontSize: STYLE.fonts.body, margin: [0, 1, 0, 0] },
        { text: party.phone ? `Phone: ${party.phone}` : ' ', fontSize: STYLE.fonts.body, margin: [0, 1, 0, 0] },
      ],
      rightStack: [
        {
          text: [
            { text: 'Invoice No./Date: ', bold: true, fontSize: STYLE.fonts.body },
            {
              text: joinParts(
                text(invoice.invoice_number),
                formatDate(invoice.invoice_date),
                invoice.status ? `(${invoice.status})` : '',
              ) || ' ',
              fontSize: STYLE.fonts.body,
            },
          ],
          margin: [0, 0, 0, 3],
        },
        {
          text: [
            { text: 'Credit Term: ', bold: true, fontSize: STYLE.fonts.body },
            { text: firstText(invoice.credit_term, invoice.payment_term) || ' ', fontSize: STYLE.fonts.body },
          ],
        },
      ],
    }),
    blockFieldGrid(STYLE, fieldRows),
  ];

  if (options.showContainers !== false) {
    content.push(blockTable(STYLE, { widths: [100, 55, 55, 80, 55, 70], body: containerBody }));
  }

  content.push(blockTable(STYLE, { widths: chargeWidths, body: chargeBody }));
  content.push(blockWordsAndTotals(STYLE, { words, totalsRows: flowTotalsRows(invoice) }));

  const bankAndTerms = blockBankAndTerms(STYLE, {
    showBank: options.showBank !== false,
    showTerms: options.showTerms !== false,
    bankLines: [
      firstText(bank.account_name, bank.account_holder, companyName) ? `Beneficiary Name: ${firstText(bank.account_name, bank.account_holder, companyName)}` : ' ',
      firstText(bank.bank_name, bank.name) ? `Bank : ${firstText(bank.bank_name, bank.name)}` : ' ',
      firstText(bank.account_number, bank.account_no) ? `A/c No : ${firstText(bank.account_number, bank.account_no)}` : ' ',
      text(bank.iban) ? `IBAN Code : ${text(bank.iban)}` : ' ',
      firstText(bank.swift_code, bank.swift) ? `Swift Code : ${firstText(bank.swift_code, bank.swift)}` : ' ',
      firstText(bank.address, companyAddress) ? `Address : ${firstText(bank.address, companyAddress)}` : ' ',
    ],
    termsLines: [
      '1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt.',
      '2. Any discrepancy should be notified to us in writing within 15 days from the invoice date after which NONE will be accepted.',
    ],
  });
  if (bankAndTerms) content.push(bankAndTerms);

  content.push(blockFooter(STYLE, [
    firstText(session.createdBy, session.created_by, invoice.created_by_email, session.user)
      ? `User : ${firstText(session.createdBy, session.created_by, invoice.created_by_email, session.user)}`
      : '',
    firstText(session.printedAt, session.printed_at) || '',
  ].filter(Boolean).join('   ') || ' '));

  return flowDocument(STYLE, content);
}

export { STYLE as INVOICE_FLOW_STYLE_NODE };
