/**
 * Browser pdfmake renderer for INVOICE_FLOW_TAX_INVOICE_1.
 * Uses the same doc definition rules as the Node spike tool.
 */
import { INVOICE_FLOW_STYLE } from './invoiceFlowStyle';

export type InvoiceFlowRecord = {
  organization?: Record<string, unknown> | null;
  invoice?: Record<string, unknown> | null;
  job?: Record<string, unknown> | null;
  party?: Record<string, unknown> | null;
  bank?: Record<string, unknown> | null;
  session?: Record<string, unknown> | null;
  logoBase64?: string;
};

type PdfMakeApi = {
  setUrlAccessPolicy: (fn: () => boolean) => void;
  setLocalAccessPolicy: (fn: () => boolean) => void;
  addFonts: (fonts: Record<string, Record<string, string>>) => void;
  createPdf: (def: unknown) => { getBlob: () => Promise<Blob> };
};

let fontsReady = false;

async function loadFontDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font load failed: ${url}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return `data:font/ttf;base64,${btoa(binary)}`;
}

async function ensureBrowserFonts(pdfmake: PdfMakeApi): Promise<void> {
  if (fontsReady) return;
  pdfmake.setUrlAccessPolicy(() => false);
  pdfmake.setLocalAccessPolicy(() => true);
  const regular = await loadFontDataUrl('/reports-fonts/Arimo-Regular.ttf');
  const bold = await loadFontDataUrl('/reports-fonts/Arimo-Bold.ttf');
  pdfmake.addFonts({
    Arimo: {
      normal: regular,
      bold,
      italics: regular,
      bolditalics: bold,
    },
  });
  fontsReady = true;
}

/** Amount in words — mirrors tools/reports/amount-words.mjs for INR/others. */
function amountInWords(amount: unknown, currency: string): string {
  const number = Number(amount);
  if (!Number.isFinite(number)) return '';
  const abs = Math.abs(number);
  const whole = Math.floor(abs + 1e-8);
  const minor = Math.round((abs - whole) * 100);
  const code = String(currency || '').toUpperCase();
  const under100 = (value: number): string => {
    const small = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (value < 20) return small[value];
    const ten = Math.floor(value / 10);
    const rest = value % 10;
    return rest ? `${tens[ten]}-${small[rest]}` : tens[ten];
  };
  const under1000 = (value: number): string => {
    if (value < 100) return under100(value);
    const hundred = Math.floor(value / 100);
    const rest = value % 100;
    return rest ? `${under100(hundred)} Hundred ${under100(rest)}` : `${under100(hundred)} Hundred`;
  };
  const indian = (value: number): string => {
    if (value === 0) return 'Zero';
    const crore = Math.floor(value / 10_000_000);
    const lakh = Math.floor((value % 10_000_000) / 100_000);
    const thousand = Math.floor((value % 100_000) / 1_000);
    const rest = value % 1_000;
    const parts: string[] = [];
    if (crore) parts.push(`${under1000(crore)} Crore`);
    if (lakh) parts.push(`${under100(lakh)} Lakh`);
    if (thousand) parts.push(`${under1000(thousand)} Thousand`);
    if (rest) parts.push(under1000(rest));
    return parts.join(' ');
  };
  const english = (value: number): string => {
    if (value === 0) return 'Zero';
    const scales: Array<[number, string]> = [
      [1_000_000_000, 'Billion'],
      [1_000_000, 'Million'],
      [1_000, 'Thousand'],
    ];
    const parts: string[] = [];
    let left = value;
    for (const [size, name] of scales) {
      if (left >= size) {
        parts.push(`${under1000(Math.floor(left / size))} ${name}`);
        left %= size;
      }
    }
    if (left) parts.push(under1000(left));
    return parts.join(' ');
  };
  const units: Record<string, [string, string]> = {
    INR: ['Rupees', 'Paise'],
    USD: ['Dollars', 'Cents'],
    AED: ['Dirhams', 'Fils'],
    EUR: ['Euros', 'Cents'],
    GBP: ['Pounds', 'Pence'],
  };
  const [major, minorName] = units[code] || ['Units', 'Cents'];
  const words = code === 'INR' ? indian(whole) : english(whole);
  const sign = number < 0 ? 'Minus ' : '';
  if (!minor) return `${sign}${major} ${words} Only`;
  const minorWords = code === 'INR' ? indian(minor) : english(minor);
  return `${sign}${major} ${words} and ${minorWords} ${minorName} Only`;
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const cleaned = text(value);
    if (cleaned) return cleaned;
  }
  return '';
}

function money(value: unknown): string {
  if (value == null || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberText(value: unknown): string {
  if (value == null || value === '') return '';
  const number = Number(value);
  if (!Number.isFinite(number)) return text(value);
  return String(number);
}

function joinParts(...parts: unknown[]): string {
  return parts.map(text).filter(Boolean).join(', ');
}

function formatDate(value: unknown): string {
  const raw = text(value);
  if (!raw) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!match) return raw;
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[Number(match[2]) - 1] || match[2];
  return `${match[3]}-${month}-${match[1].slice(2)}`;
}

function cell(value: unknown, opts: { bold?: boolean; alignment?: string; fontSize?: number } = {}) {
  return {
    text: value == null || value === '' ? ' ' : String(value),
    fontSize: opts.fontSize ?? INVOICE_FLOW_STYLE.table.fontSize,
    bold: Boolean(opts.bold),
    alignment: opts.alignment || 'left',
    color: INVOICE_FLOW_STYLE.colors.ink,
    margin: [1, 1, 1, 1],
  };
}

function headerCell(label: string) {
  return {
    text: label,
    fontSize: INVOICE_FLOW_STYLE.table.fontSize,
    bold: true,
    color: INVOICE_FLOW_STYLE.colors.ink,
    fillColor: INVOICE_FLOW_STYLE.colors.headerFill,
    margin: [1, 2, 1, 2],
  };
}

function thinLayout() {
  const w = INVOICE_FLOW_STYLE.rules.weight;
  const c = INVOICE_FLOW_STYLE.colors.gray;
  return {
    hLineWidth: () => w,
    vLineWidth: () => w,
    hLineColor: () => c,
    vLineColor: () => c,
    paddingLeft: () => 2,
    paddingRight: () => 2,
    paddingTop: () => 1,
    paddingBottom: () => 1,
  };
}

function buildDocDefinition(record: InvoiceFlowRecord) {
  const org = (record.organization || {}) as Record<string, unknown>;
  const invoice = (record.invoice || {}) as Record<string, unknown>;
  const job = (record.job || {}) as Record<string, unknown>;
  const party = (record.party || {}) as Record<string, unknown>;
  const bank = ((record.bank || org.bank || org.bank_details || {}) as Record<string, unknown>);
  const session = (record.session || {}) as Record<string, unknown>;
  const ship = (invoice.shipment || {}) as Record<string, unknown>;
  const sea = ((job.sea_fcl_details || job.sea_lcl_details || {}) as Record<string, unknown>);
  const air = (job.air_details || {}) as Record<string, unknown>;
  const lines = (Array.isArray(invoice.lines) ? invoice.lines : []) as Array<Record<string, unknown>>;

  const companyName = firstText(org.display_name, org.name);
  const companyAddress = joinParts(org.address, org.city, org.country_code);
  const billToName = firstText(invoice.party_name, party.name);
  const billToAddress = joinParts(party.address, party.city, party.country_code);
  const billToGstin = firstText(party.vat_number, party.gstin, party.tax_number);
  const currency = text(invoice.currency_code);
  const total = invoice.total_amount;
  const words = firstText(
    invoice.amount_in_words,
    total == null || total === '' ? '' : amountInWords(total, currency),
  );

  const lineHasSplit = (line: Record<string, unknown>) =>
    [line.sgst_amount, line.cgst_amount, line.igst_amount, line.ugst_amount].some(
      (value) => value != null && value !== '' && Math.abs(Number(value)) > 0.0001,
    );
  const useSplit = lines.some(lineHasSplit);
  const useTaxCol =
    !useSplit &&
    ((invoice.tax_total != null && Math.abs(Number(invoice.tax_total)) > 0.0001) ||
      (invoice.tax_amount != null && invoice.tax_amount !== '' && Math.abs(Number(invoice.tax_amount)) > 0.0001) ||
      lines.some((line) => line.tax_amount != null && line.tax_amount !== '' && Math.abs(Number(line.tax_amount)) > 0.0001));

  const chargeHeaders = useSplit
    ? ['Charges', 'SAC', 'Qty', 'Rate', 'Curr', 'Ex.Rate', 'FCY', 'Taxable', 'Non Tax', 'SGST%', 'SGST', 'CGST%', 'CGST', 'I/UGST%', 'I/UGST', 'Total']
    : useTaxCol
      ? ['Charges', 'SAC', 'Qty', 'Rate', 'Curr', 'Ex.Rate', 'FCY', 'Taxable', 'Non Tax', 'Tax', 'Total']
      : ['Charges', 'SAC', 'Qty', 'Rate', 'Curr', 'Ex.Rate', 'FCY', 'Taxable', 'Non Tax', 'Total'];

  const chargeWidths = useSplit
    ? ['*', 24, 20, 32, 24, 28, 32, 34, 34, 24, 32, 24, 32, 28, 32, 40]
    : useTaxCol
      ? ['*', 32, 24, 40, 30, 36, 40, 44, 44, 40, 50]
      : ['*', 36, 28, 44, 32, 40, 44, 48, 48, 54];

  const chargeBody = [
    chargeHeaders.map(headerCell),
    ...lines.map((line) => {
      const qty = numberText(line.quantity);
      const rate = money(line.unit_price);
      const lineCurrency = firstText(line.currency_code, currency);
      const exRate =
        line.exchange_rate == null || line.exchange_rate === ''
          ? ''
          : Number(line.exchange_rate).toFixed(5);
      const fcy = money(line.unit_price);
      const taxable =
        line.is_taxable === false
          ? ''
          : money(line.taxable_amount ?? Number(line.unit_price) * Number(line.quantity || 0));
      const nonTax = line.is_taxable === false ? money(line.line_total) : money(line.non_taxable_amount);
      const totalCell = money(line.line_total);
      const base = [
        cell(firstText(line.description, line.charge_code_name)),
        cell(text(line.sac_code)),
        cell(qty, { alignment: 'right' }),
        cell(rate, { alignment: 'right' }),
        cell(lineCurrency),
        cell(exRate, { alignment: 'right' }),
        cell(fcy, { alignment: 'right' }),
        cell(line.is_taxable === false ? '' : taxable, { alignment: 'right' }),
        cell(nonTax, { alignment: 'right' }),
      ];
      if (useSplit) {
        return [
          ...base,
          cell(line.sgst_rate == null ? '' : Number(line.sgst_rate).toFixed(2), { alignment: 'right' }),
          cell(money(line.sgst_amount), { alignment: 'right' }),
          cell(line.cgst_rate == null ? '' : Number(line.cgst_rate).toFixed(2), { alignment: 'right' }),
          cell(money(line.cgst_amount), { alignment: 'right' }),
          cell(
            line.igst_rate == null && line.ugst_rate == null
              ? ''
              : Number(line.igst_rate ?? line.ugst_rate).toFixed(2),
            { alignment: 'right' },
          ),
          cell(money(line.igst_amount ?? line.ugst_amount), { alignment: 'right' }),
          cell(totalCell, { alignment: 'right', bold: true }),
        ];
      }
      if (useTaxCol) {
        return [
          ...base,
          cell(money(line.tax_amount), { alignment: 'right' }),
          cell(totalCell, { alignment: 'right', bold: true }),
        ];
      }
      return [...base, cell(totalCell, { alignment: 'right', bold: true })];
    }),
  ];

  const containers = [...((job.containers as Array<Record<string, unknown>>) || [])];
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
  const fieldRows: Array<[string, string]> = [
    ['Due Date', formatDate(invoice.due_date)],
    ['Shipper', firstText(job.shipper_name, billToName)],
    ['Consignee', firstText(job.consignee_name)],
    ['Job No.', joinParts(firstText(invoice.job_number, job.job_number), formatDate(job.job_date))],
    [
      'Shipment No.',
      joinParts(
        firstText(job.shipment_number, ship.shipment_number),
        formatDate(firstText(job.shipment_date, ship.shipment_date)),
      ),
    ],
    ['MBL / MAWB No.', joinParts(mbl, formatDate(ship.mbl_date))],
    ['HBL / HAWB No.', joinParts(hbl, formatDate(ship.hbl_date))],
    ['Place of Receipt', firstText(sea.place_of_receipt, ship.place_of_receipt)],
    ['POR', firstText(ship.por, job.origin_port_code)],
    ['POL', firstText(job.origin_port_code, ship.pol)],
    ['POD', firstText(job.dest_port_code, ship.pod)],
    ['Place of Delivery', firstText(sea.place_of_delivery, ship.place_of_delivery)],
    [
      'Vessel / Voyage',
      joinParts(
        firstText(job.vessel_name, sea.vessel_name, ship.vessel_name),
        firstText(job.voyage_number, sea.voyage_number, ship.voyage_number),
      ),
    ],
    ['ETD', formatDate(firstText(job.etd, sea.etd))],
    ['ETA', formatDate(firstText(job.eta, sea.eta))],
    [
      'Reference No.',
      joinParts(
        firstText(job.client_reference_no, ship.reference_no),
        formatDate(firstText(job.reference_date, ship.reference_date)),
      ),
    ],
    [
      'Currency',
      currency
        ? `${currency}${
            invoice.exchange_rate != null && invoice.exchange_rate !== ''
              ? ` ${Number(invoice.exchange_rate).toFixed(6)}`
              : ''
          }`
        : '',
    ],
    ['IGM No.', joinParts(ship.igm_number, formatDate(ship.igm_date))],
    ['INCO Terms', text(job.incoterms)],
    ['Narration', firstText(invoice.narration)],
    ['Remarks', firstText(invoice.remarks)],
  ];

  const leftFields = fieldRows.filter((_, index) => index % 2 === 0);
  const rightFields = fieldRows.filter((_, index) => index % 2 === 1);

  const logoBlock = record.logoBase64
    ? {
        image: `data:image/png;base64,${record.logoBase64}`,
        width: INVOICE_FLOW_STYLE.logo.width,
        height: INVOICE_FLOW_STYLE.logo.height,
        margin: [0, 0, 8, 0],
      }
    : { text: ' ', width: INVOICE_FLOW_STYLE.logo.width, height: INVOICE_FLOW_STYLE.logo.height, margin: [0, 0, 8, 0] };

  return {
    pageSize: {
      width: INVOICE_FLOW_STYLE.page.width,
      height: INVOICE_FLOW_STYLE.page.height,
    },
    pageMargins: [
      INVOICE_FLOW_STYLE.margins.left,
      INVOICE_FLOW_STYLE.margins.top,
      INVOICE_FLOW_STYLE.margins.right,
      INVOICE_FLOW_STYLE.margins.bottom,
    ],
    defaultStyle: {
      font: INVOICE_FLOW_STYLE.fonts.family,
      fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body,
      color: INVOICE_FLOW_STYLE.colors.ink,
    },
    content: [
      {
        columns: [
          logoBlock,
          {
            width: '*',
            stack: [
              {
                text: companyName || ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.company,
                bold: true,
                alignment: 'right',
              },
              {
                text: companyAddress || ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body,
                alignment: 'right',
              },
              {
                text: [org.phone, org.email, org.website].map(text).filter(Boolean).join('  ') || ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
                alignment: 'right',
                color: INVOICE_FLOW_STYLE.colors.gray,
              },
            ],
          },
        ],
        margin: [0, 0, 0, 6],
      },
      {
        columns: [
          {
            width: 8,
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: 8,
                h: 22,
                color: INVOICE_FLOW_STYLE.colors.accentOrange,
              },
            ],
          },
          {
            width: '*',
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    text: 'TAX INVOICE',
                    alignment: 'center',
                    bold: true,
                    fontSize: INVOICE_FLOW_STYLE.fonts.sizes.title,
                    fillColor: INVOICE_FLOW_STYLE.colors.headerFill,
                    margin: [0, 4, 0, 4],
                  },
                ],
              ],
            },
            layout: thinLayout(),
          },
          {
            width: 8,
            canvas: [
              {
                type: 'rect',
                x: 0,
                y: 0,
                w: 8,
                h: 22,
                color: INVOICE_FLOW_STYLE.colors.accentRed,
              },
            ],
          },
        ],
        margin: [0, 0, 0, 6],
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Bill To', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body, margin: [0, 0, 0, 2] },
              { text: billToName || ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
              { text: billToAddress || ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
              { text: billToGstin ? `GSTIN: ${billToGstin}` : ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
              { text: party.phone ? `Phone: ${text(party.phone)}` : ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
            ],
          },
          {
            width: '50%',
            stack: [
              {
                text: [
                  { text: 'Invoice No./Date: ', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                  {
                    text:
                      joinParts(
                        text(invoice.invoice_number),
                        formatDate(invoice.invoice_date),
                        invoice.status ? `(${text(invoice.status)})` : '',
                      ) || ' ',
                    fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body,
                  },
                ],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 6],
      },
      {
        columns: [
          {
            width: '50%',
            stack: leftFields.map(([label, value]) => ({
              text: [
                { text: `${label}: `, bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                { text: value || ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
              ],
              margin: [0, 0, 0, 1],
            })),
          },
          {
            width: '50%',
            stack: rightFields.map(([label, value]) => ({
              text: [
                { text: `${label}: `, bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                { text: value || ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
              ],
              margin: [0, 0, 0, 1],
            })),
          },
        ],
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: [90, 50, 55, 70, 55, 70],
          body: containerBody,
          dontBreakRows: true,
        },
        layout: thinLayout(),
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: chargeWidths,
          body: chargeBody,
          dontBreakRows: true,
        },
        layout: thinLayout(),
        margin: [0, 0, 0, 6],
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              {
                text: [
                  { text: 'Amount in words: ', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                  { text: words || ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                ],
              },
              ...(useTaxCol
                ? [
                    {
                      text: [
                        { text: 'Tax: ', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                        {
                          text: money(invoice.tax_total ?? invoice.tax_amount) || ' ',
                          fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body,
                        },
                      ],
                      margin: [0, 4, 0, 0],
                    },
                  ]
                : []),
            ],
          },
          {
            width: 140,
            stack: [
              {
                text: [
                  { text: 'Total: ', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body },
                  { text: money(total) || ' ', fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body, bold: true },
                ],
                alignment: 'right',
              },
            ],
          },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          {
            width: '55%',
            stack: [
              { text: 'Bank Details', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body, margin: [0, 0, 0, 2] },
              {
                text: firstText(bank.account_name, bank.account_holder, companyName)
                  ? `Beneficiary Name: ${firstText(bank.account_name, bank.account_holder, companyName)}`
                  : ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
              {
                text: firstText(bank.bank_name, bank.name) ? `Bank : ${firstText(bank.bank_name, bank.name)}` : ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
              {
                text: firstText(bank.account_number, bank.account_no)
                  ? `A/c No : ${firstText(bank.account_number, bank.account_no)}`
                  : ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
              {
                text: text(bank.iban) ? `IBAN Code : ${text(bank.iban)}` : ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
              {
                text: firstText(bank.swift_code, bank.swift)
                  ? `Swift Code : ${firstText(bank.swift_code, bank.swift)}`
                  : ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
              {
                text: firstText(bank.address, companyAddress)
                  ? `Address : ${firstText(bank.address, companyAddress)}`
                  : ' ',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
            ],
          },
          {
            width: '45%',
            stack: [
              { text: 'Terms', bold: true, fontSize: INVOICE_FLOW_STYLE.fonts.sizes.body, margin: [0, 0, 0, 2] },
              {
                text: '1. Payment to be made by cash. The company is not responsible for any cash settlement without an official receipt.',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
              {
                text: '2. Any discrepancy should be notified to us in writing within 15 days from the invoice date after which NONE will be accepted.',
                fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
              },
            ],
          },
        ],
      },
      {
        text:
          [
            firstText(session.createdBy, session.created_by, invoice.created_by_email, session.user)
              ? `User : ${firstText(session.createdBy, session.created_by, invoice.created_by_email, session.user)}`
              : '',
            firstText(session.printedAt, session.printed_at) || '',
          ]
            .filter(Boolean)
            .join('   ') || ' ',
        fontSize: INVOICE_FLOW_STYLE.fonts.sizes.small,
        color: INVOICE_FLOW_STYLE.colors.gray,
        margin: [0, 8, 0, 0],
      },
    ],
  };
}

export async function renderInvoiceFlowPdf(record: InvoiceFlowRecord): Promise<Blob> {
  const mod = await import('pdfmake/build/pdfmake');
  const pdfmake = (mod.default || mod) as unknown as PdfMakeApi;
  await ensureBrowserFonts(pdfmake);
  const doc = pdfmake.createPdf(buildDocDefinition(record));
  return doc.getBlob();
}
