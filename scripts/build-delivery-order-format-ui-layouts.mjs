/**
 * Delivery Order formats from Fresa sample PDFs.
 * Usage: node scripts/build-delivery-order-format-ui-layouts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BRAND = {
  company: 'KingFisher Logistic',
  address: 'Dubai, United Arab Emirates',
  web: 'www.kingfisherwingsgroup.com',
  phone: '+971 55 5355 286',
  email: 'info@kingfisherwingsgroup.com',
  logo: 'kingfisher',
};

const THEME = {
  primary: '#0A2942',
  accent: '#0A2942',
  fill: '#F3F3F3',
  panel: '#EBF0F4',
  orange: '#F7A21C',
  red: '#DE1F26',
  cyan: '#0A2942',
  ink: '#101010',
  gray: '#656565',
  white: '#FFFFFF',
};

/** [code, name, kind, sortOrder] — synced with deliveryOrderFormatCatalog.ts */
const CATALOG = [
  ['DELIVERY_CONFIRMATION_REPORT_FORMAT', 'Delivery Confirmation Report Format', 'delivery_confirmation', 1],
  ['DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT', 'Delivery Confirmation OSA Report Format', 'delivery_confirmation_osa', 2],
  ['DELIVERY_ORDER_REPORT_FORMAT_17', 'Delivery Order Report Format-17', 'delivery_order_format_17', 3],
  ['DELIVERY_ORDER_REPORT_FORMAT_FCL_VIETNAM', 'Delivery Order FCL Vietnam', 'do_fcl_vietnam', 4],
  [
    'DELIVERY_ORDER_REPORT_FORMAT_LCL_VIETNAM_WITHOUT_STAMP',
    'Delivery Order LCL Vietnam Without Stamp',
    'do_lcl_vietnam_no_stamp',
    5,
  ],
  ['FG_DELIVERY_NOTE', 'FG Delivery Note', 'fg_delivery_note', 6],
  ['FG_DELIVERY_NOTE_FORMAT_1', 'FG Delivery Note Format-1', 'fg_delivery_note_format_1', 7],
  ['FG_DELIVERY_NOTE_FORMAT_UK', 'FG Delivery Note Format UK', 'fg_delivery_note_format_uk', 8],
  ['FG_CONSIGNMENT_DELIVERY_NOTE', 'FG Consignment Delivery Note', 'fg_consignment_delivery_note', 9],
  [
    'FG_CONSIGNMENT_DELIVERY_NOTE_FORMAT_1',
    'FG Consignment Delivery Note Format-1',
    'fg_consignment_delivery_note_format_1',
    10,
  ],
  ['FG_DELIVERY_NOC_LETTER', 'FG Delivery NOC Letter', 'fg_delivery_noc_letter', 11],
  [
    'DELIVERY_ORDER_REPORT_FORMAT_16',
    'Delivery Order Report Format-16 (House)',
    'delivery_order_format_16_house',
    12,
  ],
  ['FG_DELIVERY_ORDER_ABU_DHABI', 'FG Delivery Order Abu Dhabi', 'fg_delivery_order_abudhabi', 13],
  [
    'DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT',
    'Delivery Order AIR Jasper Report Format',
    'fg_delivery_order_air',
    14,
  ],
  ['FG_DELIVERY_ORDER_AIR_FORMAT_1', 'FG Delivery Order Air Format-1', 'fg_delivery_order_air_format_1', 15],
  ['FG_DELIVERY_ORDER_AIR_FORMAT_2', 'FG Delivery Order Air Format-2', 'fg_delivery_order_air_format_2', 16],
  ['DELIVERY_ORDER_REPORT_FORMAT_8', 'Delivery Order Report Format-8 (FG SEA)', 'do_sea_format_8', 17],
  ['DELIVERY_ORDER_REPORT_FORMAT_10', 'Delivery Order Report Format-10', 'delivery_order_format_10', 18],
  [
    'FG_DELIVERY_ORDER_SEA_FORMAT_10',
    'FG Delivery Order SEA Format-10',
    'fg_delivery_order_sea_format_10',
    19,
  ],
  ['FG_DELIVERY_ORDER_SEA_FORMAT_3', 'FG Delivery Order SEA Format-3', 'fg_delivery_order_sea_format_3', 20],
  ['FG_DELIVERY_ORDER_SEA_FORMAT_5', 'FG Delivery Order SEA Format-5', 'fg_delivery_order_sea_format_5', 21],
  ['FG_DELIVERY_ORDER_SEA_FORMAT_6', 'FG Delivery Order SEA Format-6', 'fg_delivery_order_sea_format_6', 22],
  ['FG_DELIVERY_ORDER_SEA_FORMAT_7', 'FG Delivery Order SEA Format-7', 'fg_delivery_order_sea_format_7', 23],
  ['FG_DELIVERY_ORDER_FORMAT_8', 'FG Delivery Order Format-8', 'fg_delivery_order_format_8', 24],
  ['DELIVERY_ORDER_REPORT_FORMAT_9', 'Delivery Order Report Format-9', 'delivery_order_format_9', 25],
  ['DELIVERY_ORDER_REPORT_FORMAT_13', 'Delivery Order Report Format-13', 'delivery_order_format_13', 26],
  ['DELIVERY_ORDER_REPORT_FORMAT_14', 'Delivery Order Report Format-14', 'delivery_order_format_14', 27],
  ['DELIVERY_ORDER_REPORT_FORMAT_15', 'Delivery Order Report Format-15', 'delivery_order_format_15', 28],
  ['FG_DELIVERY_ORDER_FORMAT_16', 'FG Delivery Order Format-16', 'fg_delivery_order_format_16', 29],
  ['DELIVERY_ORDER_REPORT_FORMAT_18', 'Delivery Order Report Format-18', 'delivery_order_format_18', 30],
  ['FG_DELIVERY_ORDER_SEA_FORMAT_1', 'FG Delivery Order SEA Format-1', 'fg_delivery_order_sea_format_1', 31],
  ['DELIVERY_ORDER_REPORT_FORMAT_3', 'Delivery Order Report Format-3', 'delivery_order_format_3', 32],
  ['FG_DELIVERY_ORDER_AIR_USA', 'FG Delivery Order Air USA', 'fg_delivery_order_air_usa', 33],
  ['FG_DELIVERY_ORDER_FOR_TRUCKER', 'FG Delivery Order For Trucker', 'fg_delivery_order_for_trucker', 34],
  ['FG_E_DELIVERY_ORDER', 'FG E-Delivery Order', 'fg_e_delivery_order', 35],
  [
    'FG_E_DELIVERY_ORDER_SEA_FORMAT_1',
    'FG E-Delivery Order SEA Format-1',
    'fg_e_delivery_order_sea_format_1',
    36,
  ],
  ['FG_EXPORT_DELIVERY_ORDER', 'FG Export Delivery Order', 'fg_export_delivery_order', 37],
  ['FG_NOTICE_OF_DELIVERY', 'FG Notice Of Delivery', 'fg_notice_of_delivery', 38],
  ['PROOF_OF_DELIVERY_REPORT_FORMAT', 'Proof Of Delivery Report Format', 'proof_of_delivery', 39],
  ['FG_PROOF_OF_DELIVERY', 'FG Proof Of Delivery / HBL PLMAAJEA00081', 'proof_of_delivery_fg', 40],
  ['PROOF_OF_DELIVERY_RPM_SAMPLE', 'Proof Of Delivery (RPM Sample)', 'proof_of_delivery_rpm', 41],
];

const SHIPPER = {
  title: 'Shipper',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA',
  ],
};

const CONSIGNEE = {
  title: 'Consignee',
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE',
    'AL NABHA SHARJAH UAE',
  ],
};

const CLIENT = {
  title: 'Client',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'NUNGAMBAKKAM CHENNAI TAMIL NADU 600084',
  ],
};

const DO_META = [
  { k: 'Job Ref.', v: 'CEXP190150 / 29-JAN-19' },
  { k: 'Shipment Ref.', v: 'B/EXP/19/0254 / 23-JAN-19' },
  { k: 'B/E NO.', v: '—' },
  { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
  { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '07-FEB-19' },
  { k: 'Carrier', v: 'CMA CGM' },
  { k: 'Vessel / Voyage', v: 'EVERGREEN MARINE / 9887' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'BOE No', v: 'SBILLNO767 / 27-JAN-19' },
  { k: 'Declaration No.', v: 'DECNO9812345 / 26-JAN-19' },
];

const CONTAINER_HEADERS = [
  'Container',
  'Type',
  'Pkgs',
  'Volume',
  'Net Weight',
  'Gross Weight',
  'Description',
  'Remarks',
];

const CONTAINER_ROW = [
  'ABCU9877666',
  "20' DC",
  '125',
  '24.000',
  '17,000.000',
  '18,000.000',
  'STC: VALVE MATERIALS FOR MACHINERY PARTS',
  'FREIGHT PREPAID',
];

function layout(partial) {
  return {
    paper: partial.paper || 'A4',
    rtl: false,
    theme: THEME,
    branding: BRAND,
    demo: partial.demo,
    blocks: partial.blocks,
  };
}

const AIR_META = [
  { k: 'MAWB No.', v: '176-12345678 / 28-JAN-19' },
  { k: 'HAWB No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
  { k: 'Flight No.', v: 'EK-512 / 29-JAN-19' },
  { k: 'Origin', v: 'CHENNAI (MAA)' },
  { k: 'Destination', v: 'DUBAI (DXB)' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '29-JAN-19' },
  { k: 'Pieces', v: '125' },
  { k: 'Gross Weight', v: '18,000.000 KGS' },
  { k: 'Chargeable Weight', v: '18,000.000 KGS' },
];

/** Shared sea/air delivery order body (dynamic header/footer via branding blocks). */
function standardDeliveryOrder(title, opts = {}) {
  const {
    fieldGrid = DO_META,
    tableHeaders = CONTAINER_HEADERS,
    tableRows = [CONTAINER_ROW],
    headerColor = 'primary',
    extraBlocks = [],
    letterBody,
    remarks,
  } = opts;
  const blocks = [
    { type: 'companyHeader', showContact: true },
    { type: 'docTitle', text: title, align: 'center', band: true },
  ];
  if (letterBody) blocks.push({ type: 'letterBody' });
  blocks.push(
    { type: 'twoColumn', showBillTo: true },
    { type: 'partyTriple' },
    { type: 'fieldGrid', cols: 2 },
    { type: 'chargeTable', headerColor },
    { type: 'termsBank' },
    { type: 'signatureRow' },
    ...extraBlocks,
    { type: 'colorfulFooter' },
  );
  return layout({
    demo: {
      invoiceNo: 'DO-CEXP190150',
      letterBody,
      partyLeft: CLIENT,
      partyMid: CONSIGNEE,
      partyNotify: SHIPPER,
      fieldGrid,
      tableHeaders,
      tableRows,
      remarks,
      termsLines: remarks ? [remarks] : ['Present endorsed documents and pay applicable charges.'],
    },
    blocks,
  });
}

const KINDS = {
  delivery_confirmation: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        invoiceDate: '07-FEB-19',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
          { k: 'Delivery Date', v: '08-FEB-19' },
          { k: 'Place', v: 'JEBEL ALI, UAE' },
        ],
        tableHeaders: ['Description', 'Qty', 'Condition'],
        tableRows: [
          ['STC: VALVE MATERIALS FOR MACHINERY PARTS', '125 PKGS', 'Received in good order'],
        ],
        termsLines: [
          'We confirm receipt of the above shipment in full and good order.',
          'This is a computer generated document.',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY CONFIRMATION', align: 'center', band: true },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  delivery_confirmation_osa: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        invoiceDate: '07-FEB-19',
        letterBody:
          'OSA Delivery Confirmation — cargo delivered to consignee premises as per attached job details.',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Job No.', v: 'CEXP190150' },
          { k: 'HBL No.', v: 'PLMAAJEA00081' },
          { k: 'Delivery Date & Time', v: '08-FEB-19 14:30' },
          { k: 'Driver / Vehicle', v: 'Ahmed / DXB-98765' },
        ],
        tableHeaders: ['Particulars', 'Remarks'],
        tableRows: [['125 PACKAGES — VALVE MATERIALS', 'No damage noted']],
        termsLines: ['Signed on behalf of operations.'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY CONFIRMATION (OSA)', align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'stampSignature' },
        { type: 'colorfulFooter' },
      ],
    }),

  delivery_order_format_17: () =>
    layout({
      demo: {
        invoiceNo: 'DO-CEXP190150',
        partyLeft: CLIENT,
        partyMid: CONSIGNEE,
        partyNotify: SHIPPER,
        fieldGrid: DO_META,
        tableHeaders: CONTAINER_HEADERS,
        tableRows: [CONTAINER_ROW],
        remarks: 'Received the above goods in good condition.',
        termsLines: [
          'Truck No: ___________  Driver name: ___________',
          'Delivery Date: ___________  Cargo Received By: ___________',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY ORDER', align: 'center', band: true },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  do_fcl_vietnam: () =>
    layout({
      demo: {
        invoiceNo: 'DO-FCL-VN-411',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        fieldGrid: [
          ...DO_META,
          { k: 'Service Type', v: 'FCL' },
          { k: 'Stamp', v: 'Official stamp on document' },
        ],
        tableHeaders: CONTAINER_HEADERS,
        tableRows: [CONTAINER_ROW],
        termsLines: [
          'Delivery Order — FCL Vietnam sample layout.',
          'Present original endorsed B/L and pay local charges prior to release.',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY ORDER (FCL VIETNAM)', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'stampSignature' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  do_lcl_vietnam_no_stamp: () =>
    layout({
      demo: {
        invoiceNo: 'DO-LCL-VN-427',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        fieldGrid: [
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'Service Type', v: 'LCL' },
          { k: 'CFS', v: 'HO CHI MINH CFS' },
          { k: 'ETD / ETA', v: '29-JAN-19 / 07-FEB-19' },
        ],
        tableHeaders: ['Marks & Nos', 'Description', 'Pkgs', 'Weight', 'Volume'],
        tableRows: [
          ['CM MARKS', 'STC: VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000.000', '24.000'],
        ],
        termsLines: ['LCL Vietnam — without stamp variant.'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY ORDER (LCL VIETNAM)', align: 'center', band: true },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_delivery_note: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        invoiceDate: '29-JAN-19',
        fieldGrid: [
          { k: 'Date', v: '29-JAN-19' },
          { k: 'M/S', v: 'AL NASER TRADING COMPANY LLC' },
          { k: 'Driver Name', v: '—' },
          { k: 'Vehicle No.', v: '—' },
          { k: 'Job Number', v: 'CEXP190150' },
          { k: 'Contact No.', v: '—' },
        ],
        tableHeaders: ['Qty', 'Type Description', 'Weight/Vol', 'Remarks'],
        tableRows: [
          [
            '125',
            'STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID',
            '18000',
            'B/L No. PLMAAJEA00081',
          ],
        ],
        termsLines: [
          'RECEIVED ABOVE SHIPMENT IN FULL & GOOD ORDER',
          "Receiver's Signature | Operation Dept. Remarks | Transporter Sign",
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY NOTE', align: 'center', band: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_delivery_note_format_1: () =>
    layout({
      demo: {
        invoiceNo: 'DN-F1-1337',
        invoiceDate: '29-JAN-19',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Delivery Note No.', v: 'DN-1337' },
          { k: 'Job Ref.', v: 'CEXP190150' },
          { k: 'HBL', v: 'PLMAAJEA00081' },
        ],
        tableHeaders: ['S.No', 'Description', 'Pkgs', 'G.Wt', 'Remarks'],
        tableRows: [['1', 'VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000.000', '—']],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY NOTE — FORMAT 1', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_delivery_note_format_uk: () =>
    layout({
      demo: {
        invoiceNo: 'DN-UK-1305',
        invoiceDate: '29-JAN-19',
        partyLeft: { title: 'Deliver To', lines: CONSIGNEE.lines },
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Delivery Note Ref', v: 'UK-1305' },
          { k: 'Job', v: 'CEXP190150' },
          { k: 'VAT Reg', v: 'GB123456789' },
        ],
        tableHeaders: ['Item', 'Description', 'Qty', 'Weight'],
        tableRows: [['1', 'VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000 KGS']],
        termsLines: ['United Kingdom delivery note format.'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY NOTE (UK)', align: 'center', band: true },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_consignment_delivery_note: () =>
    layout({
      demo: {
        invoiceNo: 'CDN-1379',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Consignment Note No.', v: 'CDN-1379' },
          { k: 'Job', v: 'CEXP190150' },
          { k: 'HBL', v: 'PLMAAJEA00081' },
        ],
        tableHeaders: ['Consignment', 'Goods', 'Pkgs', 'Weight'],
        tableRows: [['1', 'VALVE MATERIALS', '125', '18,000.000']],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CONSIGNMENT DELIVERY NOTE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_consignment_delivery_note_format_1: () =>
    layout({
      demo: {
        invoiceNo: 'CDN-F1-1445',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Note Ref.', v: 'CDN-F1-1445' },
          { k: 'Transporter', v: 'KingFisher Logistic' },
        ],
        tableHeaders: ['Line', 'Description', 'Qty', 'Condition'],
        tableRows: [['1', 'VALVE MATERIALS FOR MACHINERY PARTS', '125', 'Good']],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CONSIGNMENT DELIVERY NOTE — FORMAT 1',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_delivery_noc_letter: () =>
    layout({
      demo: {
        invoiceNo: 'NOC-1320',
        invoiceDate: '29-JAN-19',
        letterBody:
          'To Whom It May Concern,\n\nWe hereby confirm No Objection for release / delivery of the captioned shipment to the consignee named below, subject to presentation of all original documents and settlement of applicable charges.\n\nJob Ref: CEXP190150 | HBL: PLMAAJEA00081',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Reference', v: 'NOC-1320' },
          { k: 'Valid Until', v: '15-FEB-19' },
        ],
        termsLines: ['Authorized signatory — KingFisher Logistic'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'DELIVERY NOC LETTER', align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'stampSignature' },
        { type: 'colorfulFooter' },
      ],
    }),

  delivery_order_format_16_house: () =>
    standardDeliveryOrder('DELIVERY ORDER — HOUSE B/L', {
      fieldGrid: [
        { k: 'House B/L No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
        { k: 'Master B/L No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
        ...DO_META.slice(0, 8),
      ],
      headerColor: 'accent',
      remarks: 'House delivery order — release against house bill of lading.',
    }),

  fg_delivery_order_abudhabi: () =>
    standardDeliveryOrder('DELIVERY ORDER — ABU DHABI', {
      fieldGrid: [
        { k: 'Place of Delivery', v: 'ABU DHABI, UAE' },
        { k: 'CFS / Terminal', v: 'KHALIFA PORT CFS' },
        ...DO_META,
      ],
      headerColor: 'fill',
      remarks: 'Abu Dhabi delivery order sample layout.',
    }),

  fg_delivery_order_air: () =>
    standardDeliveryOrder('DELIVERY ORDER — AIR', {
      fieldGrid: AIR_META,
      tableHeaders: ['HAWB', 'Description', 'Pkgs', 'Weight', 'Remarks'],
      tableRows: [
        ['PLMAAJEA00081', 'STC: VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000.000', '—'],
      ],
      headerColor: 'primary',
    }),

  fg_delivery_order_air_format_1: () =>
    standardDeliveryOrder('DELIVERY ORDER — AIR FORMAT 1', {
      fieldGrid: [...AIR_META, { k: 'Format', v: 'Air Format-1' }],
      tableHeaders: ['Particulars', 'Qty', 'Weight', 'Remarks'],
      tableRows: [['VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000.000', 'As per HAWB']],
      headerColor: 'cyan',
    }),

  fg_delivery_order_air_format_2: () =>
    standardDeliveryOrder('DELIVERY ORDER — AIR FORMAT 2', {
      fieldGrid: [...AIR_META, { k: 'Format', v: 'Air Format-2' }],
      tableHeaders: ['Line', 'Goods Description', 'Pkgs', 'G.Wt'],
      tableRows: [['1', 'VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000.000']],
      headerColor: 'orange',
      extraBlocks: [{ type: 'stampSignature' }],
    }),

  do_sea_format_8: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 8', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-8' }],
      headerColor: 'primary',
    }),

  delivery_order_format_10: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 10', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '10' }],
      headerColor: 'accent',
    }),

  fg_delivery_order_sea_format_10: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 10', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-10' }],
      headerColor: 'fill',
    }),

  fg_delivery_order_sea_format_3: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 3', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-3' }],
      headerColor: 'primary',
    }),

  fg_delivery_order_sea_format_5: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 5', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-5' }],
      headerColor: 'accent',
    }),

  fg_delivery_order_sea_format_6: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 6', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-6' }],
      headerColor: 'fill',
      extraBlocks: [{ type: 'stampSignature' }],
    }),

  fg_delivery_order_sea_format_7: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 7', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-7' }],
      headerColor: 'primary',
    }),

  fg_delivery_order_format_8: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 8', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '8 (FG sample 777)' }],
      headerColor: 'accent',
    }),

  delivery_order_format_9: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 9', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '9' }],
      headerColor: 'fill',
    }),

  delivery_order_format_13: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 13', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '13' }],
      headerColor: 'primary',
    }),

  delivery_order_format_14: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 14', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '14' }],
      headerColor: 'accent',
    }),

  delivery_order_format_15: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 15', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '15' }],
      headerColor: 'fill',
    }),

  fg_delivery_order_format_16: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 16', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '16 (FG sample 1306)' }],
      headerColor: 'primary',
    }),

  delivery_order_format_18: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 18', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '18' }],
      headerColor: 'accent',
      extraBlocks: [{ type: 'stampSignature' }],
    }),

  fg_delivery_order_sea_format_1: () =>
    standardDeliveryOrder('DELIVERY ORDER — SEA FORMAT 1', {
      fieldGrid: [...DO_META, { k: 'Layout', v: 'FG SEA Format-1' }],
      headerColor: 'fill',
    }),

  delivery_order_format_3: () =>
    standardDeliveryOrder('DELIVERY ORDER — FORMAT 3', {
      fieldGrid: [...DO_META, { k: 'Format No.', v: '3' }],
      headerColor: 'primary',
    }),

  fg_delivery_order_air_usa: () =>
    standardDeliveryOrder('DELIVERY ORDER — AIR USA', {
      fieldGrid: [
        ...AIR_META,
        { k: 'Region', v: 'USA' },
        { k: 'IATA / Agent', v: 'USA Import Agent' },
      ],
      tableHeaders: ['HAWB', 'Description', 'Pkgs', 'Weight', 'Remarks'],
      tableRows: [
        ['PLMAAJEA00081', 'STC: VALVE MATERIALS FOR MACHINERY PARTS', '125', '18,000.000', 'USA air DO'],
      ],
      headerColor: 'cyan',
      letterBody: 'USA air delivery order — present ID and pay applicable terminal charges.',
    }),

  fg_delivery_order_for_trucker: () =>
    standardDeliveryOrder('DELIVERY ORDER — TRUCKER COPY', {
      fieldGrid: [
        { k: 'Truck No.', v: 'DXB-98765' },
        { k: 'Driver Name', v: 'Ahmed Hassan' },
        { k: 'Contact', v: '+971 50 000 0000' },
        { k: 'Job Ref.', v: 'CEXP190150' },
        { k: 'HBL No.', v: 'PLMAAJEA00081' },
        { k: 'Pickup / Delivery', v: 'JEBEL ALI CFS → Consignee' },
      ],
      tableHeaders: ['Qty', 'Description', 'Weight', 'Remarks'],
      tableRows: [['125', 'VALVE MATERIALS FOR MACHINERY PARTS', '18,000.000', 'Trucker release copy']],
      headerColor: 'orange',
      remarks: 'For transporter use — present at gate with valid ID.',
    }),

  fg_e_delivery_order: () =>
    standardDeliveryOrder('E-DELIVERY ORDER', {
      fieldGrid: [
        { k: 'e-DO Ref.', v: 'EDO-837' },
        { k: 'Job Ref.', v: 'CEXP190150' },
        { k: 'HBL No.', v: 'PLMAAJEA00081' },
        { k: 'Release Token', v: 'QR / OTP verified' },
      ],
      headerColor: 'accent',
      letterBody: 'Electronic delivery order — valid when released in Fresa Gold with digital authorization.',
    }),

  fg_e_delivery_order_sea_format_1: () =>
    standardDeliveryOrder('E-DELIVERY ORDER — SEA FORMAT 1', {
      fieldGrid: [
        { k: 'Layout', v: 'E-DO SEA Format-1' },
        { k: 'Job Ref.', v: 'CEXP190150' },
        ...DO_META.slice(0, 6),
      ],
      headerColor: 'primary',
    }),

  fg_export_delivery_order: () =>
    standardDeliveryOrder('EXPORT DELIVERY ORDER', {
      fieldGrid: [
        { k: 'Shipment Type', v: 'EXPORT' },
        { k: 'Job Ref.', v: 'CEXP190150' },
        { k: 'SB No.', v: 'SBILLNO767 / 27-JAN-19' },
        ...DO_META.slice(2, 10),
      ],
      headerColor: 'fill',
      remarks: 'Export delivery order — customs export release.',
    }),

  fg_notice_of_delivery: () =>
    layout({
      demo: {
        invoiceNo: 'NOD-905',
        invoiceDate: '08-FEB-19',
        letterBody:
          'Notice of Delivery\n\nPlease be advised that the captioned shipment is ready for delivery / has been scheduled for delivery to the consignee address below.',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'HBL No.', v: 'PLMAAJEA00081' },
          { k: 'Delivery Window', v: '08-FEB-19 09:00–17:00' },
        ],
        termsLines: ['This notice does not replace the delivery order or proof of delivery.'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'NOTICE OF DELIVERY', align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'colorfulFooter' },
      ],
    }),

  proof_of_delivery: () =>
    layout({
      demo: {
        invoiceNo: 'POD-CEXP190150',
        invoiceDate: '08-FEB-19',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'HBL No.', v: 'PLMAAJEA00081' },
          { k: 'Delivered Date', v: '08-FEB-19 14:30' },
          { k: 'Received By', v: 'Consignee representative' },
        ],
        tableHeaders: ['Description', 'Qty', 'Condition'],
        tableRows: [['VALVE MATERIALS FOR MACHINERY PARTS', '125', 'Good']],
        termsLines: ['Proof of delivery — official report format sample.'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'PROOF OF DELIVERY', align: 'center', band: true },
        { type: 'twoColumn', showBillTo: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'signatureRow' },
        { type: 'stampSignature' },
        { type: 'colorfulFooter' },
      ],
    }),

  proof_of_delivery_fg: () =>
    layout({
      demo: {
        invoiceNo: 'PLMAAJEA00081',
        invoiceDate: '08-FEB-19',
        partyLeft: CLIENT,
        partyMid: CONSIGNEE,
        partyNotify: {
          title: 'Notify',
          lines: CONSIGNEE.lines,
        },
        fieldGrid: [
          { k: 'Deliver To', v: 'AL NASER TRADING COMPANY LLC' },
          { k: 'B/E No.', v: 'SBILLNO767 / 27-JAN-19' },
          ...DO_META,
          { k: 'BOE No', v: 'SBILLNO767 / 27-JAN-19' },
        ],
        tableHeaders: CONTAINER_HEADERS,
        tableRows: [CONTAINER_ROW],
        remarks:
          'Received the above goods in good condition — same quantity as mentioned above received in good condition.',
        termsLines: [
          'Delivery Received By: Consignee | Cargo Received: AL NASER TRADING COMPANY LLC',
          'Truck No: ______  Driver name: ______  Delivery Date: ______',
          'REFERENCE NO: POD-847',
          'WAREHOUSE SUPERVISOR SIGN | ACCOUNTANT SIGN',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'PROOF OF DELIVERY / HBL NO - PLMAAJEA00081',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'termsBank' },
        { type: 'signatureRow' },
        { type: 'stampSignature' },
        { type: 'colorfulFooter' },
      ],
    }),

  proof_of_delivery_rpm: () =>
    layout({
      demo: {
        invoiceNo: 'POD-275',
        invoiceDate: '08-FEB-19',
        partyLeft: CONSIGNEE,
        partyMid: SHIPPER,
        fieldGrid: [
          { k: 'Reference', v: 'RPM-275' },
          { k: 'HBL', v: 'PLMAAJEA00081' },
        ],
        tableHeaders: ['Goods', 'Pkgs', 'Status'],
        tableRows: [['VALVE MATERIALS', '125', 'Delivered']],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'PROOF OF DELIVERY', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'accent' },
        { type: 'signatureRow' },
        { type: 'colorfulFooter' },
      ],
    }),
};

function buildRow([code, name, kind, n]) {
  const factory = KINDS[kind];
  if (!factory) throw new Error(`Missing kind ${kind}`);
  const base = factory();
  return {
    code,
    formatNumber: n,
    name,
    paper: base.paper || 'A4',
    rtl: false,
    theme: base.theme,
    branding: base.branding,
    demo: base.demo,
    blocks: base.blocks,
  };
}

const layouts = CATALOG.map(buildRow);
const outJson = path.join(root, 'src/features/reports/data/deliveryOrderFormatUiLayouts.json');
const outTs = path.join(
  root,
  'src/features/reports/data/deliveryOrderFormatUiLayouts.generated.ts',
);
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated Delivery Order formats — run: node scripts/build-delivery-order-format-ui-layouts.mjs */\n` +
    `export const DELIVERY_ORDER_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} Delivery Order layouts matched to Fresa sample PDFs`);
