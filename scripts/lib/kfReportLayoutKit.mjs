/**
 * Shared KingFisher layout kit for FRESA catalog PDF previews.
 * Matches theme/branding used by Invoice/Accounts/WMS/Other build scripts.
 */
export const BRAND = {
  company: 'KingFisher Logistic',
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'info@kingfisherwingsgroup.com',
  logo: 'kingfisher',
};

export const THEME = {
  primary: '#0F4D96',
  accent: '#2286C8',
  fill: '#F3F3F3',
  panel: '#EBF0F4',
  orange: '#F7A21C',
  red: '#DE1F26',
  cyan: '#9AD7FF',
  ink: '#101010',
  gray: '#656565',
  white: '#FFFFFF',
};

export const SHIPPER = {
  title: 'Shipper',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'CHENNAI TAMIL NADU 600084 INDIA',
  ],
};

export const CONSIGNEE = {
  title: 'Consignee',
  lines: ['AL NASER TRADING COMPANY LLC', '30 AL MAKTHOOM BUILDING', 'SHARJAH UAE'],
};

export const NOTIFY = {
  title: 'Notify Party',
  lines: CONSIGNEE.lines,
};

export const SEA_META = [
  { k: 'Job / Shipment', v: 'B/EXP/19/0254' },
  { k: 'MBL No.', v: 'MBLCOPY87667888' },
  { k: 'HBL No.', v: 'PLMAAJEA00081' },
  { k: 'Vessel / Voyage', v: 'EVERGREEN MARINE / 9887' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '07-FEB-19' },
];

export const AIR_META = [
  { k: 'HAWB No.', v: 'PLMAAJEA00081' },
  { k: 'MAWB No.', v: '176-12345678' },
  { k: 'Airport of Departure', v: 'CHENNAI (MAA)' },
  { k: 'Airport of Destination', v: 'DUBAI (DXB)' },
  { k: 'Flight / Date', v: 'EK-512 / 29-JAN-19' },
  { k: 'Pieces', v: '125' },
  { k: 'Gross Weight', v: '18,000.0 K' },
  { k: 'Chargeable Weight', v: '18,000.0 K' },
];

export const LIST_HEADERS = ['#', 'Job No.', 'Customer', 'Status', 'ETD', 'ETA'];
export const LIST_ROWS = [
  ['1', 'B/EXP/19/0251', '4G LOGISTICS', 'Pending', '29-JAN-19', '07-FEB-19'],
  ['2', 'B/EXP/19/0252', 'AL NASER TRADING', 'In Transit', '30-JAN-19', '08-FEB-19'],
  ['3', 'B/EXP/19/0253', 'GULF FREIGHT', 'Delivered', '28-JAN-19', '06-FEB-19'],
];

const HEADER_ROTATION = ['primary', 'accent', 'fill', 'orange', 'cyan'];

export function layout(partial) {
  return {
    paper: partial.paper || 'A4',
    rtl: false,
    theme: THEME,
    branding: BRAND,
    demo: partial.demo,
    blocks: partial.blocks,
  };
}

export function titleFromName(name) {
  return String(name || 'REPORT')
    .replace(/\s+Report Format.*$/i, '')
    .replace(/\s+List Report Format.*$/i, '')
    .trim()
    .toUpperCase();
}

export function badgeFromName(name, formatNumber) {
  const n = Number(formatNumber);
  if (Number.isFinite(n) && n > 0) return `Format-${n}`;
  return String(name || 'Report').slice(0, 42);
}

/** Document-style layout (sea/air/commercial/other) — matches Other Reports opsDoc. */
export function opsDoc(docTitle, opts = {}) {
  const {
    headerColor = 'primary',
    badge,
    letterBody,
    extraGrid = [],
    meta = SEA_META,
    paper = 'A4',
    termsExtra,
  } = opts;
  const blocks = [
    { type: 'companyHeader', showContact: true },
    ...(badge ? [{ type: 'formatBadge' }] : []),
    { type: 'docTitle', text: docTitle, align: 'center', band: true },
  ];
  if (letterBody) blocks.push({ type: 'letterBody' });
  blocks.push(
    { type: 'partyTriple' },
    { type: 'fieldGrid', cols: 2 },
    { type: 'chargeTable', headerColor },
    { type: 'containerStrip' },
    { type: 'termsBank' },
    { type: 'signatureRow' },
    { type: 'colorfulFooter' },
  );
  return layout({
    paper,
    demo: {
      invoiceNo: 'B/EXP/19/0254',
      invoiceDate: '28-JAN-19',
      letterBody,
      partyLeft: SHIPPER,
      partyMid: CONSIGNEE,
      partyNotify: NOTIFY,
      fieldGrid: [...meta, ...extraGrid],
      tableHeaders: ['Container No.', 'Type', 'Seal', 'Pkgs', 'Weight', 'Volume'],
      tableRows: [['ABCU9877666', "20' DC", 'SL988888', '125', '18,000.000', '24.000']],
      termsLines: [
        'KingFisher layout preview — FRESA Gold report format sample.',
        ...(termsExtra ? [termsExtra] : []),
        'STC: VALVE MATERIALS FOR MACHINERY PARTS',
      ],
      remarks: badge,
    },
    blocks,
  });
}

/** List / ops analytics layout — table-first like Accounts list reports. */
export function listDoc(docTitle, opts = {}) {
  const { headerColor = 'primary', badge, extraGrid = [], paper = 'A4' } = opts;
  return layout({
    paper,
    demo: {
      invoiceNo: 'LIST-001',
      invoiceDate: '10-FEB-19',
      billToName: 'All Branches',
      fieldGrid: [
        { k: 'As Of', v: '10-FEB-19' },
        { k: 'Branch', v: 'Dubai' },
        { k: 'Prepared By', v: 'Operations' },
        ...extraGrid,
      ],
      tableHeaders: LIST_HEADERS,
      tableRows: LIST_ROWS,
      termsLines: ['Computer generated operations list — sample preview data.'],
      remarks: badge,
    },
    blocks: [
      { type: 'companyHeader', showContact: true },
      ...(badge ? [{ type: 'formatBadge' }] : []),
      { type: 'docTitle', text: docTitle, align: 'center', band: true },
      { type: 'fieldGrid', cols: 3 },
      { type: 'chargeTable', headerColor },
      { type: 'colorfulFooter' },
    ],
  });
}

/** Quotation commercial layout — variants share companyHeader + colorfulFooter. */
export function quotationDoc(docTitle, opts = {}) {
  const { headerColor = 'primary', badge, formatNumber = 1 } = opts;
  const n = Number(formatNumber) || 1;
  const header = [
    { type: 'companyHeader', showContact: true },
    ...(badge ? [{ type: 'formatBadge' }] : []),
  ];
  const footer = [{ type: 'colorfulFooter' }];
  const qtn = `QTN-19-${String(n).padStart(4, '0')}`;
  const baseDemo = {
    invoiceNo: qtn,
    invoiceDate: '28-JAN-19',
    dueDate: '28-FEB-19',
    quotationNo: qtn,
    billToName: 'AL NASER TRADING COMPANY LLC',
    billToAddress: '30 AL MAKTHOOM BUILDING, SHARJAH UAE',
    currency: 'USD',
    partyLeft: SHIPPER,
    partyMid: CONSIGNEE,
    subtotal: '1,380.00',
    tax: '0.00',
    total: '1,380.00',
    words: 'USD One Thousand Three Hundred Eighty Only',
    remarks: badge || `Format-${n}`,
    fieldGrid: [
      { k: 'POL', v: 'CHENNAI, INDIA' },
      { k: 'POD', v: 'JEBEL ALI, UAE' },
      { k: 'Incoterm', v: 'FOB' },
      { k: 'Validity', v: '30 Days' },
      { k: 'Layout', v: badge || docTitle },
    ],
    tableHeaders: ['#', 'Charge', 'Qty', 'Rate', 'Currency', 'Amount'],
    tableRows: [
      ['1', 'Ocean Freight', '1', '1,250.00', 'USD', '1,250.00'],
      ['2', 'THC Origin', '1', '85.00', 'USD', '85.00'],
      ['3', 'Documentation', '1', '45.00', 'USD', '45.00'],
    ],
    termsLines: [
      'Rates are subject to carrier space and equipment availability.',
      'This quotation is a KingFisher layout preview (FRESA format).',
    ],
  };

  const mod = n % 5;
  if (mod === 1) {
    return layout({
      demo: {
        ...baseDemo,
        letterBody: 'Thank you for your enquiry. Please find our quotation below.',
      },
      blocks: [
        ...header,
        { type: 'docTitle', text: docTitle, align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...footer,
      ],
    });
  }
  if (mod === 2) {
    return layout({
      demo: baseDemo,
      blocks: [
        ...header,
        { type: 'docTitle', text: docTitle, align: 'center', band: true },
        { type: 'fieldGrid', cols: 3 },
        { type: 'chargeTable', headerColor },
        { type: 'partyTriple' },
        { type: 'wordsAndTotal' },
        { type: 'signatureRow' },
        { type: 'termsBank' },
        ...footer,
      ],
    });
  }
  if (mod === 3) {
    return layout({
      paper: 'Letter',
      demo: { ...baseDemo, fieldGrid: [...baseDemo.fieldGrid, { k: 'Paper', v: 'Letter' }] },
      blocks: [
        ...header,
        { type: 'docTitle', text: docTitle, align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor },
        { type: 'fieldGrid', cols: 2 },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        ...footer,
      ],
    });
  }
  if (mod === 4) {
    return layout({
      demo: {
        ...baseDemo,
        letterBody: 'Please confirm acceptance to proceed with booking.',
        agingHeaders: ['Freight', 'Local', 'Docs', 'Total'],
        agingRow: ['1,250.00', '85.00', '45.00', '1,380.00'],
      },
      blocks: [
        ...header,
        { type: 'docTitle', text: docTitle, align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor },
        { type: 'agingSummary' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        ...footer,
      ],
    });
  }
  return layout({
    demo: baseDemo,
    blocks: [
      ...header,
      { type: 'docTitle', text: docTitle, align: 'center', band: true },
      { type: 'partyTriple' },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor },
      { type: 'wordsAndTotal' },
      { type: 'termsBank' },
      { type: 'signatureRow' },
      ...footer,
    ],
  });
}

/** Finance / accounts letter or statement style. */
export function financeDoc(docTitle, opts = {}) {
  const { headerColor = 'primary', badge, letterBody, aging = false } = opts;
  const blocks = [
    { type: 'companyHeader', showContact: true },
    ...(badge ? [{ type: 'formatBadge' }] : []),
    { type: 'docTitle', text: docTitle, align: 'center', band: true },
  ];
  if (letterBody) blocks.push({ type: 'letterBody' });
  blocks.push(
    { type: 'fieldGrid', cols: 2 },
    { type: 'chargeTable', headerColor },
  );
  if (aging) blocks.push({ type: 'agingSummary' });
  blocks.push({ type: 'termsBank' }, { type: 'signatureRow' }, { type: 'colorfulFooter' });
  return layout({
    demo: {
      invoiceNo: 'FIN-001',
      invoiceDate: '10-FEB-19',
      billToName: '4G LOGISTICS INDIA PVT LTD',
      billToAddress: 'CHENNAI, INDIA',
      letterBody:
        letterBody ||
        'Please find below the statement details. Kindly settle outstanding balances at the earliest.',
      fieldGrid: [
        { k: 'Currency', v: 'INR' },
        { k: 'As Of', v: '10-FEB-19' },
        { k: 'Branch', v: 'Chennai' },
        { k: 'Layout', v: badge || docTitle },
      ],
      tableHeaders: ['Invoice No.', 'Date', 'Due Date', 'Amount', 'Paid', 'Balance'],
      tableRows: [
        ['INV-190251', '01-JAN-19', '31-JAN-19', '17,384.00', '0.00', '17,384.00'],
        ['INV-190252', '15-JAN-19', '14-FEB-19', '8,200.00', '2,000.00', '6,200.00'],
      ],
      agingHeaders: ['Current', '1-30', '31-60', '61-90', '90+'],
      agingRow: ['6,200.00', '17,384.00', '0.00', '0.00', '0.00'],
      total: '23,584.00',
      termsLines: ['Accounts layout preview — FRESA Gold finance format.'],
      remarks: badge,
    },
    blocks,
  });
}

/** WMS warehouse style. */
export function wmsDoc(docTitle, opts = {}) {
  const { headerColor = 'primary', badge } = opts;
  return layout({
    demo: {
      invoiceNo: 'ASN-19001',
      invoiceDate: '28-JAN-19',
      fieldGrid: [
        { k: 'Warehouse', v: 'DXB-WH-01' },
        { k: 'Customer', v: 'AL NASER TRADING' },
        { k: 'Reference', v: 'PO-77821' },
        { k: 'Layout', v: badge || docTitle },
      ],
      tableHeaders: ['#', 'SKU', 'Description', 'Qty', 'UOM', 'Location'],
      tableRows: [
        ['1', '112541AASD52', 'WD EXTERNAL HDD', '500', 'BOX', 'AB0001'],
        ['2', '2253465', 'HP LAPTOP', '4', 'BOX', 'AB0001'],
        ['3', '5251255220', 'NVIDIA GPU', '600', 'BOX', 'GOODS_RECEIPT'],
      ],
      termsLines: ['WMS layout preview — FRESA Gold warehouse format.'],
      remarks: badge,
    },
    blocks: [
      { type: 'companyHeader', showContact: true },
      ...(badge ? [{ type: 'formatBadge' }] : []),
      { type: 'docTitle', text: docTitle, align: 'center', band: true },
      { type: 'fieldGrid', cols: 2 },
      { type: 'chargeTable', headerColor },
      { type: 'colorfulFooter' },
    ],
  });
}

export function headerColorForIndex(i) {
  return HEADER_ROTATION[i % HEADER_ROTATION.length];
}

export function buildStoredLayout(code, name, formatNumber, family, index) {
  const badge = badgeFromName(name, formatNumber);
  const title = titleFromName(name);
  const headerColor = headerColorForIndex(index);
  const upper = code.toUpperCase();
  const extraGrid = [{ k: 'Layout', v: name }];

  let base;
  if (family === 'quotation' || /QUOTATION/.test(upper)) {
    base = quotationDoc(title || 'QUOTATION', { headerColor, badge, formatNumber });
  } else if (family === 'ops_list' || /_LIST(_|$)|LIST_REPORT/.test(upper)) {
    base = listDoc(title || 'OPERATIONS LIST', { headerColor, badge, extraGrid });
  } else if (family === 'finance' || /OUTSTANDING|PROFIT|TRIAL|VOUCHER|AGING|GL_|STATEMENT/.test(upper)) {
    base = financeDoc(title || 'ACCOUNTS REPORT', {
      headerColor,
      badge,
      aging: /AGING|OUTSTANDING/.test(upper),
      letterBody: /OUTSTANDING|LETTER/.test(upper)
        ? 'Please find outstanding details below and arrange settlement.'
        : undefined,
    });
  } else if (family === 'wms' || /ASN|SHIPPING_NOTE|WMS_|STOCK|WAREHOUSE/.test(upper)) {
    base = wmsDoc(title || 'WMS REPORT', { headerColor, badge });
  } else if (family === 'air_docs' || /HAWB|MAWB|AIR_/.test(upper)) {
    base = opsDoc(title || 'AIR DOCUMENT', {
      headerColor,
      badge,
      meta: AIR_META,
      extraGrid,
      letterBody: /PRE_ALERT|PREALERT/.test(upper) ? 'Air pre-alert for the shipment referenced below.' : undefined,
    });
  } else if (family === 'commercial' || /PROFORMA|DEBIT_NOTE|CREDIT_NOTE|INVOICE/.test(upper)) {
    base = quotationDoc(title || 'COMMERCIAL DOCUMENT', { headerColor, badge, formatNumber });
  } else {
    base = opsDoc(title || 'REPORT', {
      headerColor,
      badge,
      extraGrid,
      letterBody: /BOOKING|CONFIRM|PRE_ALERT|LETTER/.test(upper)
        ? 'Please find the details for your reference as below.'
        : undefined,
    });
  }

  return {
    code,
    formatNumber: Number(formatNumber) || index + 1,
    name,
    paper: base.paper || 'A4',
    rtl: false,
    theme: base.theme,
    branding: base.branding,
    demo: base.demo,
    blocks: base.blocks,
  };
}
