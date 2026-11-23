/**
 * Build a pdfmake docDefinition for engine=flow invoices.
 * Options come from invoice-flow-options.mjs. Empty values stay empty in
 * field grids; totals always print Sub Total / Discount / Tax / Rounding /
 * Total using tax_amount (never tax_total).
 */
import { amountInWords } from './amount-words.mjs';
import { flowInvoiceOptions, resolveChargeColumns } from './invoice-flow-options.mjs';
import { flowTotalsRows, money2 } from './invoice-flow-totals.mjs';

const STYLE = {
  page: { width: 594, height: 841.9 },
  /** Format 1 content margins (~16.6 left from span census). */
  margins: [16, 14, 16, 26],
  colors: {
    ink: '#101010',
    gray: '#656565',
    headerFill: '#9AD7FF',
    panelFill: '#FCFCFC',
    white: '#FFFFFF',
    accentOrange: '#F7A21C',
    accentRed: '#DE1F26',
  },
  rule: 0.5653,
  fonts: { body: 7.9, title: 11.9, company: 15.8, small: 6.8, table: 6.8 },
};

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
  return money2(number);
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

function cell(value, opts = {}) {
  return {
    text: value == null || value === '' ? ' ' : String(value),
    fontSize: opts.fontSize ?? STYLE.fonts.table,
    bold: Boolean(opts.bold),
    alignment: opts.alignment || 'left',
    color: opts.color || STYLE.colors.ink,
    margin: [1, 1, 1, 1],
  };
}

function headerCell(label) {
  return {
    text: label,
    fontSize: STYLE.fonts.table,
    bold: true,
    color: STYLE.colors.ink,
    fillColor: STYLE.colors.headerFill,
    margin: [1, 2, 1, 2],
  };
}

function thinLayout() {
  return {
    hLineWidth: () => STYLE.rule,
    vLineWidth: () => STYLE.rule,
    hLineColor: () => STYLE.colors.gray,
    vLineColor: () => STYLE.colors.gray,
    paddingLeft: () => 2,
    paddingRight: () => 2,
    paddingTop: () => 1,
    paddingBottom: () => 1,
  };
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
  const withoutTax = baseColumns.filter((key) => !['tax', 'sgstPct', 'sgst', 'cgstPct', 'cgst', 'iugstPct', 'iugst'].includes(key));
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
  return ['qty', 'rate', 'exRate', 'fcy', 'taxable', 'nonTax', 'tax', 'total', 'sgstPct', 'sgst', 'cgstPct', 'cgst', 'iugstPct', 'iugst'].includes(key);
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
  const chargeKeys = chargeColumnsForMode(resolveChargeColumns(options), taxMode);
  const chargeWidths = chargeKeys.map(widthForColumn);
  const chargeBody = [
    chargeKeys.map((key) => headerCell(COLUMN_LABELS[key] || key)),
    ...lines.map((line) =>
      chargeKeys.map((key) =>
        cell(lineCellValue(key, line, currency), {
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
    ['Container No.', 'Type', 'No of Pcs', 'Gross Weight', 'Volume', 'Volume Weight'].map(headerCell),
    ...(containers.length
      ? containers.map((item) => [
          cell(firstText(item.container_number, item.number)),
          cell(firstText(item.container_type_code, item.type)),
          cell(firstText(item.packages, item.no_of_pcs, job.pieces)),
          cell(firstText(item.gross_weight, job.gross_weight)),
          cell(firstText(item.cbm, item.volume, job.volume_cbm)),
          cell(firstText(item.volume_weight, item.vol_weight)),
        ])
      : [[cell(''), cell(''), cell(''), cell(''), cell(''), cell('')]]),
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

  const leftFields = fieldRows.filter((_, index) => index % 2 === 0);
  const rightFields = fieldRows.filter((_, index) => index % 2 === 1);

  const logoBlock = record.logoBase64
    ? { image: `data:image/png;base64,${record.logoBase64}`, width: 82, height: 40, margin: [0, 0, 10, 0] }
    : { text: ' ', width: 82, height: 40, margin: [0, 0, 10, 0] };

  const totalsRows = flowTotalsRows(invoice);
  const totalsBody = totalsRows.map((row) => [
    {
      text: row.label,
      fontSize: STYLE.fonts.body,
      bold: row.key === 'total',
      alignment: 'left',
      margin: [2, 2, 2, 2],
    },
    {
      text: money2(row.amount),
      fontSize: STYLE.fonts.body,
      bold: row.key === 'total',
      alignment: 'right',
      margin: [2, 2, 2, 2],
    },
  ]);

  const content = [
    {
      columns: [
        logoBlock,
        {
          width: '*',
          stack: [
            { text: companyName || ' ', fontSize: STYLE.fonts.company, bold: true, alignment: 'right', color: STYLE.colors.ink },
            { text: companyAddress || ' ', fontSize: STYLE.fonts.body, alignment: 'right', color: STYLE.colors.ink, margin: [0, 1, 0, 0] },
            {
              text: [org.phone, org.email, org.website].map(text).filter(Boolean).join('  ') || ' ',
              fontSize: STYLE.fonts.small,
              alignment: 'right',
              color: STYLE.colors.gray,
              margin: [0, 1, 0, 0],
            },
          ],
        },
      ],
      columnGap: 8,
      margin: [0, 0, 0, 8],
    },
    {
      columns: [
        { width: 6, canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 24, color: STYLE.colors.accentOrange }] },
        {
          width: '*',
          table: {
            widths: ['*'],
            body: [[{
              text: options.title || 'TAX INVOICE',
              alignment: 'center',
              bold: true,
              fontSize: STYLE.fonts.title,
              color: STYLE.colors.ink,
              fillColor: STYLE.colors.headerFill,
              margin: [0, 5, 0, 5],
            }]],
          },
          layout: thinLayout(),
        },
        { width: 6, canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 24, color: STYLE.colors.accentRed }] },
      ],
      columnGap: 0,
      margin: [0, 0, 0, 8],
    },
    {
      columns: [
        {
          width: '48%',
          stack: [
            { text: 'Bill To', bold: true, fontSize: STYLE.fonts.body, margin: [0, 0, 0, 3] },
            { text: billToName || ' ', fontSize: STYLE.fonts.body },
            { text: billToAddress || ' ', fontSize: STYLE.fonts.body, margin: [0, 1, 0, 0] },
            { text: billToGstin ? `GSTIN: ${billToGstin}` : ' ', fontSize: STYLE.fonts.body, margin: [0, 1, 0, 0] },
            { text: party.phone ? `Phone: ${party.phone}` : ' ', fontSize: STYLE.fonts.body, margin: [0, 1, 0, 0] },
          ],
        },
        {
          width: '52%',
          stack: [
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
        },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 8],
    },
    {
      columns: [
        {
          width: '50%',
          stack: leftFields.map(([label, value]) => ({
            text: [
              { text: `${label}: `, bold: true, fontSize: STYLE.fonts.body },
              { text: value || ' ', fontSize: STYLE.fonts.body },
            ],
            margin: [0, 0, 0, 2],
          })),
        },
        {
          width: '50%',
          stack: rightFields.map(([label, value]) => ({
            text: [
              { text: `${label}: `, bold: true, fontSize: STYLE.fonts.body },
              { text: value || ' ', fontSize: STYLE.fonts.body },
            ],
            margin: [0, 0, 0, 2],
          })),
        },
      ],
      columnGap: 10,
      margin: [0, 0, 0, 8],
    },
  ];

  if (options.showContainers !== false) {
    content.push({
      table: {
        headerRows: 1,
        widths: [100, 55, 55, 80, 55, 70],
        body: containerBody,
        dontBreakRows: true,
      },
      layout: thinLayout(),
      margin: [0, 0, 0, 8],
    });
  }

  content.push({
    table: {
      headerRows: 1,
      widths: chargeWidths,
      body: chargeBody,
      dontBreakRows: true,
    },
    layout: thinLayout(),
    margin: [0, 0, 0, 8],
  });

  content.push({
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: 'Amount in words: ', bold: true, fontSize: STYLE.fonts.body },
              { text: words || ' ', fontSize: STYLE.fonts.body },
            ],
          },
        ],
      },
      {
        width: 160,
        table: {
          widths: ['*', 70],
          body: totalsBody,
        },
        layout: thinLayout(),
      },
    ],
    columnGap: 12,
    margin: [0, 0, 0, 10],
  });

  if (options.showBank !== false || options.showTerms !== false) {
    content.push({
      columns: [
        options.showBank !== false
          ? {
              width: '55%',
              stack: [
                { text: 'Bank Details', bold: true, fontSize: STYLE.fonts.body, margin: [0, 0, 0, 3] },
                { text: firstText(bank.account_name, bank.account_holder, companyName) ? `Beneficiary Name: ${firstText(bank.account_name, bank.account_holder, companyName)}` : ' ', fontSize: STYLE.fonts.small, margin: [0, 0, 0, 1] },
                { text: firstText(bank.bank_name, bank.name) ? `Bank : ${firstText(bank.bank_name, bank.name)}` : ' ', fontSize: STYLE.fonts.small, margin: [0, 0, 0, 1] },
                { text: firstText(bank.account_number, bank.account_no) ? `A/c No : ${firstText(bank.account_number, bank.account_no)}` : ' ', fontSize: STYLE.fonts.small, margin: [0, 0, 0, 1] },
                { text: text(bank.iban) ? `IBAN Code : ${text(bank.iban)}` : ' ', fontSize: STYLE.fonts.small, margin: [0, 0, 0, 1] },
                { text: firstText(bank.swift_code, bank.swift) ? `Swift Code : ${firstText(bank.swift_code, bank.swift)}` : ' ', fontSize: STYLE.fonts.small, margin: [0, 0, 0, 1] },
                { text: firstText(bank.address, companyAddress) ? `Address : ${firstText(bank.address, companyAddress)}` : ' ', fontSize: STYLE.fonts.small },
              ],
            }
          : { width: '55%', text: ' ' },
        options.showTerms !== false
          ? {
              width: '45%',
              stack: [
                { text: 'Terms', bold: true, fontSize: STYLE.fonts.body, margin: [0, 0, 0, 3] },
                { text: '1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt.', fontSize: STYLE.fonts.small, margin: [0, 0, 0, 2] },
                { text: '2. Any discrepancy should be notified to us in writing within 15 days from the invoice date after which NONE will be accepted.', fontSize: STYLE.fonts.small },
              ],
            }
          : { width: '45%', text: ' ' },
      ],
      columnGap: 12,
      margin: [0, 0, 0, 8],
    });
  }

  content.push({
    text: [
      firstText(session.createdBy, session.created_by, invoice.created_by_email, session.user)
        ? `User : ${firstText(session.createdBy, session.created_by, invoice.created_by_email, session.user)}`
        : '',
      firstText(session.printedAt, session.printed_at) || '',
    ].filter(Boolean).join('   ') || ' ',
    fontSize: STYLE.fonts.small,
    color: STYLE.colors.gray,
    margin: [0, 4, 0, 0],
  });

  return {
    pageSize: { width: STYLE.page.width, height: STYLE.page.height },
    pageMargins: STYLE.margins,
    defaultStyle: { font: 'Arimo', fontSize: STYLE.fonts.body, color: STYLE.colors.ink },
    content,
  };
}

export { STYLE as INVOICE_FLOW_STYLE_NODE };
