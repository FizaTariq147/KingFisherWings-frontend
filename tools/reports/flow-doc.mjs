/**
 * Generic engine=flow document builders for invoice, quotation, credit note,
 * and debit note. Blocks come from flow-blocks.mjs; values from the record /
 * buildDocumentContext. Nothing is invented.
 */
import { amountInWords } from './amount-words.mjs';
import { buildDocumentContext } from './document-context.mjs';
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
import { flowInvoiceOptions } from './invoice-flow-options.mjs';
import { flowTaxAmount, flowTotalsRows, money2 } from './invoice-flow-totals.mjs';
import { buildInvoiceFlowDocDefinition, linePreTaxAmount } from './invoice-flow-doc.mjs';

const text = (value) => (value == null ? '' : String(value).trim());
function firstText(...values) {
  for (const value of values) {
    const cleaned = text(value);
    if (cleaned) return cleaned;
  }
  return '';
}
function joinParts(...parts) {
  return parts.map(text).filter(Boolean).join(', ');
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
function formatDate(value) {
  const raw = text(value);
  if (!raw) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!match) return raw;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${match[3]}-${months[Number(match[2]) - 1] || match[2]}-${match[1].slice(2)}`;
}

/** Styles measured from Fresa reference specs. */
export const FLOW_STYLES = {
  invoice: createFlowStyle(),
  quotation: createFlowStyle({
    // FCL quotation: Arimo ~7.9 body, cyan-ish header fill kept
    fonts: { body: 7.9, title: 11.9, company: 15.8, small: 6.8, table: 7.9 },
    colors: {
      ink: '#101010',
      gray: '#656565',
      headerFill: '#B8D4E8',
      panelFill: '#FCFCFC',
      white: '#FFFFFF',
      accentOrange: '#F7A21C',
      accentRed: '#DE1F26',
    },
    rule: 0.5,
  }),
  credit_note: createFlowStyle({
    // No dedicated credit-note reference PDF — share debit/overseas note look.
    fonts: { body: 8, title: 14, company: 14, small: 7, table: 8 },
    colors: {
      ink: '#101010',
      gray: '#555555',
      headerFill: '#D9E8F5',
      panelFill: '#FCFCFC',
      white: '#FFFFFF',
      accentOrange: '#F7A21C',
      accentRed: '#C62828',
    },
    rule: 0.5,
  }),
  debit_note: createFlowStyle({
    // FG overseas debit note / Format-19: ~8pt body, 14pt title
    fonts: { body: 8, title: 14, company: 14, small: 7, table: 8 },
    page: { width: 595, height: 842 },
    colors: {
      ink: '#101010',
      gray: '#555555',
      headerFill: '#CFE8F6',
      panelFill: '#FCFCFC',
      white: '#FFFFFF',
      accentOrange: '#F7A21C',
      accentRed: '#C62828',
    },
    rule: 0.5,
  }),
};

function orgBits(record) {
  const org = record.organization || {};
  return {
    org,
    companyName: firstText(org.display_name, org.name),
    companyAddress: joinParts(org.address, org.city, org.country_code),
    contactLine: [org.phone, org.email, org.website].map(text).filter(Boolean).join('  ') || ' ',
  };
}

function chargeTable(style, lines, currency) {
  const hasTax = (lines || []).some((line) => Math.abs(Number(line.tax_amount || 0)) > 0.0001);
  const headers = hasTax
    ? ['Charges', 'Qty', 'Rate', 'Amount', 'Tax', 'Total']
    : ['Charges', 'Qty', 'Rate', 'Total'];
  const widths = hasTax ? ['*', 36, 48, 56, 48, 56] : ['*', 40, 56, 64];
  const body = [
    headers.map((label) => headerCell(style, label)),
    ...(lines || []).map((line) => {
      const pretax = linePreTaxAmount(line);
      const row = [
        cell(style, firstText(line.description, line.charge_code, line.charge_code_name)),
        cell(style, numberText(line.quantity), { alignment: 'right' }),
        cell(style, money(line.unit_price), { alignment: 'right' }),
      ];
      if (hasTax) {
        row.push(cell(style, money(pretax), { alignment: 'right' }));
        row.push(cell(style, money(line.tax_amount), { alignment: 'right' }));
      }
      row.push(cell(style, money(line.line_total), { alignment: 'right', bold: true }));
      return row;
    }),
  ];
  void currency;
  return blockTable(style, { widths, body });
}

function noteTotals(doc) {
  return flowTotalsRows({
    subtotal: doc.subtotal,
    tax_amount: doc.tax_amount ?? doc.tax_total,
    discount: doc.discount,
    rounding: doc.rounding,
    total_amount: doc.total_amount,
    lines: doc.lines,
  });
}

function listBlanks(paths, context) {
  return paths.filter((path) => !text(context[path]));
}

/**
 * Quotation flow — validity, terms, charges from the quotation record.
 */
export function buildQuotationFlowDocDefinition(record = {}) {
  const style = FLOW_STYLES.quotation;
  const options = flowInvoiceOptions('QUOTATION_FLOW_1') || { title: 'QUOTATION', showBank: true, showTerms: true };
  const quotation = record.quotation || {};
  const party = record.party || {};
  const { org, companyName, companyAddress, contactLine } = orgBits(record);
  const context = buildDocumentContext(record);
  const currency = firstText(quotation.currency_code, quotation.currency, context['quotation.currency']);
  const lines = quotation.lines || [];
  const total = quotation.total_amount ?? quotation.total;
  const words = firstText(quotation.amount_in_words, total == null || total === '' ? '' : amountInWords(total, currency));
  const blanks = listBlanks(
    ['company.name', 'party.billTo', 'quotation.number', 'quotation.date', 'quotation.validUntil', 'quotation.terms', 'quotation.total'],
    {
      ...context,
      'party.billTo': firstText(quotation.party_name, party.name, context['party.billTo']),
    },
  );

  const content = [
    blockHeader(style, { logoBase64: record.logoBase64, companyName, companyAddress, contactLine }),
    blockTitle(style, { title: options.title || 'QUOTATION' }),
    blockTwoColumnPartyMeta(style, {
      leftStack: [
        { text: 'Bill To', bold: true, fontSize: style.fonts.body, margin: [0, 0, 0, 3] },
        { text: firstText(quotation.party_name, party.name, context['party.billTo']) || ' ', fontSize: style.fonts.body },
        { text: joinParts(party.address, party.city) || ' ', fontSize: style.fonts.body, margin: [0, 1, 0, 0] },
      ],
      rightStack: [
        { text: [{ text: 'Quotation No.: ', bold: true, fontSize: style.fonts.body }, { text: firstText(quotation.quotation_number, quotation.number, context['quotation.number']) || ' ', fontSize: style.fonts.body }], margin: [0, 0, 0, 2] },
        { text: [{ text: 'Date: ', bold: true, fontSize: style.fonts.body }, { text: formatDate(firstText(quotation.quotation_date, quotation.date, context['quotation.date'])) || ' ', fontSize: style.fonts.body }], margin: [0, 0, 0, 2] },
        { text: [{ text: 'Valid Until: ', bold: true, fontSize: style.fonts.body }, { text: formatDate(firstText(quotation.valid_until, context['quotation.validUntil'])) || ' ', fontSize: style.fonts.body }], margin: [0, 0, 0, 2] },
        { text: [{ text: 'Currency: ', bold: true, fontSize: style.fonts.body }, { text: currency || ' ', fontSize: style.fonts.body }] },
      ],
    }),
    blockFieldGrid(style, [
      ['Job / Service', firstText(quotation.job_type, quotation.service_type, context['job.department'])],
      ['Incoterms', firstText(quotation.incoterms, context['job.incoterms'])],
      ['POL', firstText(quotation.origin_port_code, context['shipment.pol'])],
      ['POD', firstText(quotation.dest_port_code, context['shipment.pod'])],
      ['Carrier', firstText(quotation.carrier_name, context['shipment.carrier'])],
      ['Remarks', firstText(quotation.remarks, quotation.notes)],
    ]),
    chargeTable(style, lines, currency),
    blockWordsAndTotals(style, {
      words,
      totalsRows: noteTotals({
        subtotal: quotation.subtotal,
        tax_amount: quotation.tax_amount ?? quotation.tax_total,
        discount: quotation.discount,
        rounding: quotation.rounding,
        total_amount: total,
        lines,
      }),
    }),
    blockBankAndTerms(style, {
      showBank: options.showBank !== false,
      showTerms: options.showTerms !== false,
      bankLines: [
        context['bank.accountName'] ? `Beneficiary Name: ${context['bank.accountName']}` : ' ',
        context['bank.name'] ? `Bank : ${context['bank.name']}` : ' ',
        context['bank.accountNo'] ? `A/c No : ${context['bank.accountNo']}` : ' ',
        context['bank.iban'] ? `IBAN Code : ${context['bank.iban']}` : ' ',
        context['bank.swift'] ? `Swift Code : ${context['bank.swift']}` : ' ',
      ],
      termsLines: [
        firstText(quotation.terms, context['quotation.terms']) || ' ',
      ],
    }),
    blockFooter(style, firstText(context['session.user'], context['session.printedAt']) || ' '),
  ];

  return { definition: flowDocument(style, content), blanks, context };
}

function buildCreditOrDebit(record, kind) {
  const style = FLOW_STYLES[kind];
  const code = kind === 'credit_note' ? 'CREDIT_NOTE_FLOW_1' : 'DEBIT_NOTE_FLOW_1';
  const options = flowInvoiceOptions(code) || {
    title: kind === 'credit_note' ? 'CREDIT NOTE' : 'DEBIT NOTE',
    showBank: true,
    showTerms: true,
  };
  const doc = kind === 'credit_note' ? (record.creditNote || record.credit_note || {}) : (record.debitNote || record.debit_note || {});
  const party = record.party || {};
  const { companyName, companyAddress, contactLine } = orgBits(record);
  const context = buildDocumentContext({
    ...record,
    invoice: {
      ...(record.invoice || {}),
      invoice_number: firstText(doc.credit_note_number, doc.debit_note_number, doc.invoice_number),
      invoice_date: doc.invoice_date,
      currency_code: doc.currency_code,
      subtotal: doc.subtotal,
      tax_total: doc.tax_total,
      tax_amount: doc.tax_amount ?? doc.tax_total,
      total_amount: doc.total_amount,
      remarks: doc.remarks,
      party_name: doc.party_name,
      lines: doc.lines,
    },
  });
  const currency = firstText(doc.currency_code, context['invoice.currency']);
  const lines = doc.lines || [];
  const total = doc.total_amount;
  const words = firstText(doc.amount_in_words, total == null || total === '' ? '' : amountInWords(total, currency));
  const originalInvoice = firstText(doc.credited_invoice_number, record.invoice?.invoice_number, context['invoice.number']);
  const blanks = [
    !companyName ? 'company.name' : null,
    !firstText(doc.party_name, party.name) ? 'party.billTo' : null,
    !firstText(doc.credit_note_number, doc.debit_note_number, doc.invoice_number) ? 'document.number' : null,
    !originalInvoice ? 'original.invoice' : null,
    !currency ? 'currency' : null,
    total == null || total === '' ? 'total' : null,
  ].filter(Boolean);

  const content = [
    blockHeader(style, { logoBase64: record.logoBase64, companyName, companyAddress, contactLine }),
    blockTitle(style, { title: options.title }),
    blockTwoColumnPartyMeta(style, {
      leftStack: [
        { text: 'Bill To', bold: true, fontSize: style.fonts.body, margin: [0, 0, 0, 3] },
        { text: firstText(doc.party_name, party.name) || ' ', fontSize: style.fonts.body },
        { text: joinParts(party.address, party.city) || ' ', fontSize: style.fonts.body, margin: [0, 1, 0, 0] },
      ],
      rightStack: [
        {
          text: [
            { text: kind === 'credit_note' ? 'Credit Note No.: ' : 'Debit Note No.: ', bold: true, fontSize: style.fonts.body },
            { text: firstText(doc.credit_note_number, doc.debit_note_number, doc.invoice_number) || ' ', fontSize: style.fonts.body },
          ],
          margin: [0, 0, 0, 2],
        },
        {
          text: [
            { text: 'Date: ', bold: true, fontSize: style.fonts.body },
            { text: formatDate(doc.invoice_date) || ' ', fontSize: style.fonts.body },
          ],
          margin: [0, 0, 0, 2],
        },
        {
          text: [
            { text: 'Original Invoice: ', bold: true, fontSize: style.fonts.body },
            { text: originalInvoice || ' ', fontSize: style.fonts.body },
          ],
          margin: [0, 0, 0, 2],
        },
        {
          text: [
            { text: 'Currency: ', bold: true, fontSize: style.fonts.body },
            { text: currency || ' ', fontSize: style.fonts.body },
          ],
        },
      ],
    }),
    blockFieldGrid(style, [
      ['Status', text(doc.status)],
      ['Job', firstText(doc.job_number, context['job.number'])],
      ['Due Date', formatDate(doc.due_date)],
      ['Remarks', firstText(doc.remarks, doc.description)],
    ]),
    chargeTable(style, lines, currency),
    blockWordsAndTotals(style, {
      words,
      totalsRows: noteTotals({
        subtotal: doc.subtotal,
        tax_amount: doc.tax_amount ?? doc.tax_total,
        discount: doc.discount,
        rounding: doc.rounding,
        total_amount: total,
        lines,
      }),
    }),
    blockBankAndTerms(style, {
      showBank: options.showBank !== false,
      showTerms: options.showTerms !== false,
      bankLines: [
        context['bank.accountName'] ? `Beneficiary Name: ${context['bank.accountName']}` : ' ',
        context['bank.name'] ? `Bank : ${context['bank.name']}` : ' ',
        context['bank.accountNo'] ? `A/c No : ${context['bank.accountNo']}` : ' ',
      ],
      termsLines: [
        kind === 'credit_note'
          ? 'This credit note adjusts the original invoice. Please apply it against the outstanding balance.'
          : 'This debit note adjusts the original invoice. Payment is due as per the terms of the original invoice.',
      ],
    }),
    blockFooter(style, firstText(context['session.user'], context['session.printedAt']) || ' '),
  ];

  return { definition: flowDocument(style, content), blanks, context, originalInvoice, tax: flowTaxAmount({ tax_amount: doc.tax_amount ?? doc.tax_total, lines }) };
}

export function buildCreditNoteFlowDocDefinition(record = {}) {
  return buildCreditOrDebit(record, 'credit_note');
}

export function buildDebitNoteFlowDocDefinition(record = {}) {
  return buildCreditOrDebit(record, 'debit_note');
}

export function buildFlowDocDefinition(code, record = {}) {
  const key = String(code || '').toUpperCase();
  if (key === 'QUOTATION_FLOW_1') return buildQuotationFlowDocDefinition(record).definition;
  if (key === 'CREDIT_NOTE_FLOW_1') return buildCreditNoteFlowDocDefinition(record).definition;
  if (key === 'DEBIT_NOTE_FLOW_1') return buildDebitNoteFlowDocDefinition(record).definition;
  return buildInvoiceFlowDocDefinition({ ...record, code: key || 'INVOICE_FLOW_TAX_INVOICE_1' });
}
