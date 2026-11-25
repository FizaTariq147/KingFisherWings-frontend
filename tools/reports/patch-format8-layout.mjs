import fs from 'node:fs';

const paths = [
  'src/features/reports/data/invoiceFormatUiLayouts.json',
  'src/features/reports/data/invoiceFormatUiLayouts.generated.ts',
];

const replacement = {
  code: 'INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC',
  formatNumber: 8,
  name: 'Invoice Report Format-8 Standard Invoice Arabic',
  paper: 'A4',
  rtl: false,
  theme: {
    primary: '#000000',
    accent: '#0F4D96',
    fill: '#EBEFF0',
    panel: '#F5F5F5',
    orange: '#F7A21C',
    red: '#DE1F26',
    cyan: '#9AD7FF',
    ink: '#101010',
    gray: '#656565',
    white: '#FFFFFF',
  },
  branding: {
    company: 'KingFisher Logistic',
    address: 'Dubai, United Arab Emirates',
    web: 'www.kingfisherwingsgroup.com',
    phone: '+971 55 5355 286',
    email: 'inquiry@kingfishertec.com',
    logo: 'kingfisher',
  },
  demo: {
    invoiceNo: 'INV1800564',
    invoiceDate: '27-NOV-18',
    dueDate: '27-NOV-18',
    creditTerm: 'CASH',
    billToLabel: 'Customer',
    billToName: 'DEMO CUSTOMER LLC',
    billToAddress: 'AL NABHA, DUBAI',
    billToPhone: '04-233456',
    billToGstin: '29760737473',
    vatNo: '100234567890003',
    currency: 'AED',
    words: 'Dirham Seven Hundred Fifty-Six and Sixteen Fils Only',
    subtotal: '721.10',
    tax: '35.06',
    total: '756.16',
    totalLabel: 'Total AED',
    tableHeaders: [
      'Charge Description / وصف الرسوم',
      '.Curr',
      'Rate Per Unit',
      'Unit',
      'Curr. Amount',
      '/ROE',
      'Total Price excl. VAT',
      'VAT%',
      'VAT Amount',
      'Total AED',
    ],
    tableRows: [
      ['DELIVERY ORDER CHARGES', 'AED', '150.00', '1', '150.00', '1.00000', '150.00', '5', '7.50', '157.50'],
      ['THC CHARGES', 'AED', '250.00', '1', '250.00', '1.00000', '250.00', '5', '12.50', '262.50'],
      ['DOCUMENTATION CHARGES', 'AED', '100.00', '1', '100.00', '1.00000', '100.00', '5', '5.00', '105.00'],
      ['HANDLING CHARGES', 'AED', '221.10', '1', '221.10', '1.00000', '221.10', '5', '11.06', '232.16'],
    ],
    containerHeaders: [
      'Container No.',
      'Type',
      'No. of Pcs',
      'Pack Type',
      'G.Weight',
      'Unit',
      'Volume',
      'V.Weight',
      'C.Weight',
    ],
    containerRow: ['TCNU1234567', "40' HC", '10', 'CARTONS', '12,500.000', 'KGS', '45.000', '', ''],
    fieldGrid: [
      { k: 'Shipper', v: 'DEMO SHIPPER LLC' },
      { k: 'Job Number', v: 'JOB1800456' },
      { k: 'Consignee', v: 'DEMO CONSIGNEE LLC' },
      { k: 'Job Date', v: '20-NOV-18' },
      { k: 'Notify Name', v: 'DEMO NOTIFY LLC' },
      { k: 'Master Number', v: 'MBL123456' },
      { k: 'Place of Origin', v: 'JEBEL ALI, UAE' },
      { k: 'House Number', v: 'HBL987654' },
      { k: 'Final destination', v: 'AL NABHA, DUBAI' },
      { k: 'Number of Packs', v: '10' },
      { k: 'Vessel / Flight', v: 'DEMO VESSEL' },
      { k: 'Weight in Kgs', v: '12,500.000' },
      { k: 'Voyage / Flight No.', v: '001W' },
      { k: 'Volume in CBM', v: '45.000' },
      { k: 'Shipper Ref No.', v: '' },
      { k: 'ETD', v: '22-NOV-18' },
      { k: 'Customer P/O No.', v: '' },
      { k: 'ETA', v: '25-NOV-18' },
      { k: 'Customer VAT No.', v: '100234567890003' },
      { k: 'Invoice No. / Date', v: 'INV1800564 / 27-NOV-18' },
    ],
    metaRows: [
      { k: 'Payment Due Date', v: '27-NOV-18' },
      { k: 'Credit Term', v: 'CASH' },
    ],
    termsLines: [
      'Payment shall be made for full amount on or prior to due date, free of charges, without any deductions',
      'All bank charges are for the account of the paying remitter',
      'Payment before Delivery of Bill of Lading (Export) or containers (Import)',
    ],
    bankLines: [
      'ELECTRONIC AND WIRE TRANSFER INFORMATION',
      'Bank Name: DEMO BANK',
      'Account Number: XXXXXXXXXXX',
      'SWIFT: XXXXXXXX',
      'IBAN: AE000000000000000000000',
    ],
  },
  blocks: [
    { type: 'companyHeader' },
    {
      type: 'docTitle',
      text: 'TAX INVOICE / فاتورة ضريبية',
      align: 'center',
      band: true,
      bandStyle: 'rules',
    },
    { type: 'fieldGrid', cols: 2 },
    { type: 'chargeTable', headerColor: 'fill', chrome: 'grid' },
    { type: 'wordsAndTotal' },
    { type: 'containerStrip', headerColor: 'fill', chrome: 'grid' },
    { type: 'termsBank' },
  ],
};

for (const path of paths) {
  const raw = fs.readFileSync(path, 'utf8');
  const startMarker = '"code": "INVOICE_REPORT_FORMAT_8_STANDARD_INVOICE_ARABIC"';
  const endMarker = '"code": "INVOICE_REPORT_FORMAT_9_STANDARD_INVOICE_USA"';
  const startIdx = raw.indexOf(startMarker);
  const endIdx = raw.indexOf(endMarker);
  if (startIdx < 0 || endIdx < 0) {
    throw new Error(`markers not found in ${path}`);
  }
  let brace = startIdx;
  while (brace > 0 && raw[brace] !== '{') brace -= 1;
  let endBrace = endIdx;
  while (endBrace > 0 && raw[endBrace] !== '{') endBrace -= 1;
  const before = raw.slice(0, brace);
  const after = raw.slice(endBrace);
  const body = JSON.stringify(replacement, null, 2)
    .split('\n')
    .map((line, index) => (index === 0 ? line : `  ${line}`))
    .join('\n');
  const next = `${before}${body},\n  ${after.trimStart()}`;
  fs.writeFileSync(path, next);
  console.log(`patched ${path}`);
}
