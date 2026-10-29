import fs from 'node:fs';

const jsonPath = 'src/features/reports/data/hblFormatUiLayouts.json';
const genPath = 'src/features/reports/data/hblFormatUiLayouts.generated.ts';
const layouts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const row = layouts.find((r) => r.code === 'HBL_DRAFT_REPORT_FORMAT_11');
if (!row) throw new Error('missing HBL-11');

const before = row.blocks.map((b) => b.type).join('>');

// Upper shell: replace open party/field/cargo stack with Fresa boxed BL shell.
// Keep companyHeader (Batch 2 KF logo), signature cluster (Batch 3), plain footer.
row.blocks = [
  { type: 'companyHeader', showContact: true },
  { type: 'hblBlShell' },
  { type: 'hblFreightSignature', variant: 'blClosing' },
  { type: 'colorfulFooter', variant: 'plain' },
];

row.demo = {
  ...row.demo,
  hblBlTitle: 'Bill of Lading FOR COMBINED TRANSPORT OR PORT TO PORT SHIPMENT',
  hblOriginals: '1(ONE)',
  hblRegisteredNo: 'MTO/DGS/1182/APR/2019',
  hblDeliveryAgent: {
    title: 'APPLICATION FOR DELIVERY AT DESTINATION MUST BE MADE TO:',
    lines: [
      'KingFisher Wings Dubai LLC',
      'DUBAI UNITED ARAB EMIRATES',
      'TEL: +971 55 5355 286',
      'EMAIL: inquiry@kingfishertec.com',
    ],
  },
  partyLeft: {
    title: 'SHIPPER',
    lines: row.demo.partyLeft?.lines ?? [],
  },
  partyMid: {
    title: 'CONSIGNEE OR ORDER',
    lines: row.demo.partyMid?.lines ?? [],
  },
  partyNotify: {
    title: 'NOTIFY ADDRESS (Carrier not responsible for failure to notify)',
    lines: row.demo.partyNotify?.lines ?? [],
  },
  // Align vessel demo with Fresa sample pairing used in reference PDF.
  fieldGrid: (row.demo.fieldGrid ?? []).map((f) => {
    if (f.k === 'Vessel / Voyage') return { ...f, v: 'CMA CGM / 9887' };
    if (f.k === 'Place of Receipt') return f;
    return f;
  }),
  hblCargoHeaders: [
    'Container Nos, Seal Nos, Mark and Nos',
    'Number and kind of packages : description of goods',
    'Gross Weight(Kg)',
    'Volume',
  ],
  hblCargoRows: [
    [
      "ABCU9877666 / SEAL NO. : SL345566 /\n20' DC X 1\nNIL MARKS",
      'STC: VALVE MATERIALS FOR MACHINERY PARTS\nFREIGHT PREPAID\nALL DESTINATION CHARGES ARE CONSIGNEE\'S ACCOUNT',
      '18,000.000 KGS',
      '24.000 CBM',
    ],
  ],
};

// Ensure Place of Receipt exists for shell mapping.
if (!(row.demo.fieldGrid ?? []).some((f) => f.k === 'Place of Receipt')) {
  const pol = (row.demo.fieldGrid ?? []).find((f) => f.k === 'Port of Loading');
  row.demo.fieldGrid = [
    ...(row.demo.fieldGrid ?? []),
    { k: 'Place of Receipt', v: pol?.v || 'CHENNAI (EX MADRAS), INDIA' },
  ];
}

const after = row.blocks.map((b) => b.type + (b.variant ? `:${b.variant}` : '')).join('>');
fs.writeFileSync(jsonPath, `${JSON.stringify(layouts, null, 2)}\n`);
const body = `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\nexport const HBL_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`;
fs.writeFileSync(genPath, body);
console.log('before', before);
console.log('after', after);
