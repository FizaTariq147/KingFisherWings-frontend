/**
 * Reusable pdfmake blocks for engine=flow documents (invoice, quotation, CN, DN).
 * Visual helpers only — callers supply already-resolved text and row data.
 */
import { money2 } from './invoice-flow-totals.mjs';

export function createFlowStyle(overrides = {}) {
  const base = {
    page: { width: 594, height: 841.9 },
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
  return {
    ...base,
    ...overrides,
    page: { ...base.page, ...(overrides.page || {}) },
    colors: { ...base.colors, ...(overrides.colors || {}) },
    fonts: { ...base.fonts, ...(overrides.fonts || {}) },
    margins: overrides.margins || base.margins,
  };
}

export function thinLayout(style) {
  return {
    hLineWidth: () => style.rule,
    vLineWidth: () => style.rule,
    hLineColor: () => style.colors.gray,
    vLineColor: () => style.colors.gray,
    paddingLeft: () => 2,
    paddingRight: () => 2,
    paddingTop: () => 1,
    paddingBottom: () => 1,
  };
}

export function cell(style, value, opts = {}) {
  return {
    text: value == null || value === '' ? ' ' : String(value),
    fontSize: opts.fontSize ?? style.fonts.table,
    bold: Boolean(opts.bold),
    alignment: opts.alignment || 'left',
    color: opts.color || style.colors.ink,
    margin: [1, 1, 1, 1],
  };
}

export function headerCell(style, label) {
  return {
    text: label,
    fontSize: style.fonts.table,
    bold: true,
    color: style.colors.ink,
    fillColor: style.colors.headerFill,
    margin: [1, 2, 1, 2],
  };
}

/** Header band: logo + company name / address / contact. */
export function blockHeader(style, { logoBase64, companyName, companyAddress, contactLine }) {
  const logoBlock = logoBase64
    ? { image: `data:image/png;base64,${logoBase64}`, width: 82, height: 40, margin: [0, 0, 10, 0] }
    : { text: ' ', width: 82, height: 40, margin: [0, 0, 10, 0] };
  return {
    columns: [
      logoBlock,
      {
        width: '*',
        stack: [
          { text: companyName || ' ', fontSize: style.fonts.company, bold: true, alignment: 'right', color: style.colors.ink },
          { text: companyAddress || ' ', fontSize: style.fonts.body, alignment: 'right', color: style.colors.ink, margin: [0, 1, 0, 0] },
          {
            text: contactLine || ' ',
            fontSize: style.fonts.small,
            alignment: 'right',
            color: style.colors.gray,
            margin: [0, 1, 0, 0],
          },
        ],
      },
    ],
    columnGap: 8,
    margin: [0, 0, 0, 8],
  };
}

/** Title band with optional accent bars. */
export function blockTitle(style, { title, showAccents = true }) {
  const band = {
    width: '*',
    table: {
      widths: ['*'],
      body: [[{
        text: title || ' ',
        alignment: 'center',
        bold: true,
        fontSize: style.fonts.title,
        color: style.colors.ink,
        fillColor: style.colors.headerFill,
        margin: [0, 5, 0, 5],
      }]],
    },
    layout: thinLayout(style),
  };
  if (!showAccents) {
    return { ...band, margin: [0, 0, 0, 8] };
  }
  return {
    columns: [
      { width: 6, canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 24, color: style.colors.accentOrange }] },
      band,
      { width: 6, canvas: [{ type: 'rect', x: 0, y: 0, w: 6, h: 24, color: style.colors.accentRed }] },
    ],
    columnGap: 0,
    margin: [0, 0, 0, 8],
  };
}

/** Two-column party (left) and meta (right) stacks. */
export function blockTwoColumnPartyMeta(style, { leftStack, rightStack, leftWidth = '48%', rightWidth = '52%' }) {
  return {
    columns: [
      { width: leftWidth, stack: leftStack },
      { width: rightWidth, stack: rightStack },
    ],
    columnGap: 12,
    margin: [0, 0, 0, 8],
  };
}

/** Two-column field grid from [label, value] pairs. */
export function blockFieldGrid(style, fieldRows) {
  const leftFields = fieldRows.filter((_, index) => index % 2 === 0);
  const rightFields = fieldRows.filter((_, index) => index % 2 === 1);
  const toStack = (rows) =>
    rows.map(([label, value]) => ({
      text: [
        { text: `${label}: `, bold: true, fontSize: style.fonts.body },
        { text: value || ' ', fontSize: style.fonts.body },
      ],
      margin: [0, 0, 0, 2],
    }));
  return {
    columns: [
      { width: '50%', stack: toStack(leftFields) },
      { width: '50%', stack: toStack(rightFields) },
    ],
    columnGap: 10,
    margin: [0, 0, 0, 8],
  };
}

/** Generic table with header row (charge / container / etc.). */
export function blockTable(style, { widths, body, marginBottom = 8 }) {
  return {
    table: {
      headerRows: 1,
      widths,
      body,
      dontBreakRows: true,
    },
    layout: thinLayout(style),
    margin: [0, 0, 0, marginBottom],
  };
}

/** Amount in words + totals table. */
export function blockWordsAndTotals(style, { words, totalsRows }) {
  const totalsBody = totalsRows.map((row) => [
    {
      text: row.label,
      fontSize: style.fonts.body,
      bold: row.key === 'total',
      alignment: 'left',
      margin: [2, 2, 2, 2],
    },
    {
      text: money2(row.amount),
      fontSize: style.fonts.body,
      bold: row.key === 'total',
      alignment: 'right',
      margin: [2, 2, 2, 2],
    },
  ]);
  return {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: [
              { text: 'Amount in words: ', bold: true, fontSize: style.fonts.body },
              { text: words || ' ', fontSize: style.fonts.body },
            ],
          },
        ],
      },
      {
        width: 160,
        table: { widths: ['*', 70], body: totalsBody },
        layout: thinLayout(style),
      },
    ],
    columnGap: 12,
    margin: [0, 0, 0, 10],
  };
}

export function blockBank(style, lines) {
  return {
    stack: [
      { text: 'Bank Details', bold: true, fontSize: style.fonts.body, margin: [0, 0, 0, 3] },
      ...lines.map((line) => ({
        text: line || ' ',
        fontSize: style.fonts.small,
        margin: [0, 0, 0, 1],
      })),
    ],
  };
}

export function blockTerms(style, lines) {
  return {
    stack: [
      { text: 'Terms', bold: true, fontSize: style.fonts.body, margin: [0, 0, 0, 3] },
      ...lines.map((line) => ({
        text: line || ' ',
        fontSize: style.fonts.small,
        margin: [0, 0, 0, 2],
      })),
    ],
  };
}

export function blockBankAndTerms(style, { bankLines, termsLines, showBank = true, showTerms = true }) {
  if (!showBank && !showTerms) return null;
  return {
    columns: [
      showBank ? { width: '55%', ...blockBank(style, bankLines) } : { width: '55%', text: ' ' },
      showTerms ? { width: '45%', ...blockTerms(style, termsLines) } : { width: '45%', text: ' ' },
    ],
    columnGap: 12,
    margin: [0, 0, 0, 8],
  };
}

export function blockFooter(style, textLine) {
  return {
    text: textLine || ' ',
    fontSize: style.fonts.small,
    color: style.colors.gray,
    margin: [0, 4, 0, 0],
  };
}

export function flowDocument(style, content) {
  return {
    pageSize: { width: style.page.width, height: style.page.height },
    pageMargins: style.margins,
    defaultStyle: { font: 'Arimo', fontSize: style.fonts.body, color: style.colors.ink },
    content: content.filter(Boolean),
  };
}
