/**
 * Arrival Notice formats from Fresa sample PDFs (names as on samples).
 * Usage: node scripts/build-arrival-notice-format-ui-layouts.mjs
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

/** [code, name, kind, sortOrder] — synced with arrivalNoticeFormatCatalog.ts */
const CATALOG = [
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
    'Arrival Notice Report Format-1 Cargo Arrival Notice Jasper',
    'format1_jasper',
    1,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_2_CARGO_ARRIVAL_NOTICE_JASPER',
    'Arrival Notice Report Format-2 Cargo Arrival Notice Jasper',
    'format2_jasper',
    2,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_3_ARRIVAL_NOTICE_USA',
    'Arrival Notice Report Format-3 Arrival Notice USA',
    'format3_usa',
    3,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA',
    'Arrival Notice Report Format-4 Arrival Notice USA',
    'format4_usa',
    4,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_5_CARGO_ARRIVAL_NOTICE_SEA',
    'Arrival Notice Report Format-5 Cargo Arrival Notice SEA',
    'cargo_arrival_notice_sea',
    5,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_6_CARGO_ARRIVAL_NOTICE_SEA',
    'Arrival Notice Report Format-6 Cargo Arrival Notice SEA',
    'cargo_arrival_notice_sea_format6',
    6,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_7_CARGO_ARRIVAL_NOTICE_SEA',
    'Arrival Notice Report Format-7 Cargo Arrival Notice SEA',
    'cargo_arrival_notice_sea_format7',
    7,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_8_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES',
    'Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges',
    'cargo_arrival_notice_sea_without_charges',
    8,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_9_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES',
    'Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges',
    'cargo_arrival_notice_sea_without_charges_format9',
    9,
  ],
  [
    'ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM',
    'Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam',
    'sea_arrival_notice_fcl_vietnam',
    10,
  ],
  ['ARRIVAL_CONFIRMATION', 'Arrival Confirmation Report Format', 'arrival_confirmation', 11],
  [
    'CARGO_ARRIVAL_NOTICE_AIR_REPORT_FORMAT',
    'Cargo Arrival Notice Air Report Format',
    'cargo_arrival_notice_air',
    12,
  ],
  ['ARRIVAL_CONFIRMATION_FORMAT_1', 'Arrival Confirmation Format-1', 'arrival_confirmation_format1', 13],
  ['ARRIVAL_INFORMATION', 'Arrival Information', 'arrival_information', 14],
  ['FG_ARRIVAL_INFORMATION', 'FG Arrival Information', 'fg_arrival_information', 15],
  ['FG_ARRIVAL_NOTICE', 'FG Arrival Notice', 'fg_arrival_notice', 16],
  ['FG_ARRIVAL_NOTICE_FORMAT_2', 'FG Arrival Notice Format-2', 'fg_arrival_notice_format2', 17],
  [
    'FG_ARRIVAL_NOTICE_WITHOUT_CHARGES',
    'FG Arrival Notice Without Charges',
    'fg_arrival_notice_without_chg',
    18,
  ],
  ['FG_ARRIVAL_NOTICE_FORMAT_3', 'FG Arrival Notice Format-3', 'fg_arrival_notice_format3', 19],
  [
    'CARGO_ARRIVAL_NOTICE_AIR_WITHOUT_CHARGES_REPORT_FORMAT',
    'Cargo Arrival Notice Air Without Charges Report Format',
    'cargo_arrival_notice_air_without_charges',
    20,
  ],
  ['FG_CARGO_ARRIVAL_NOTICE', 'FG Cargo Arrival Notice', 'fg_cargo_arrival_notice', 21],
  [
    'FG_CARGO_ARRIVAL_NOTICE_FORMAT_1',
    'FG Cargo Arrival Notice Format-1',
    'fg_cargo_arrival_notice_format1',
    22,
  ],
  ['FG_CARGO_ARRIVAL_NOTICE_SEA', 'FG Cargo Arrival Notice SEA', 'fg_cargo_arrival_notice_sea', 23],
  [
    'CARGO_ARRIVAL_NOTICE_SEA_FORMAT_2',
    'Cargo Arrival Notice SEA Format-2',
    'cargo_arrival_notice_sea_format2',
    24,
  ],
  [
    'CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3',
    'Cargo Arrival Notice SEA Format-3',
    'cargo_arrival_notice_sea_format3',
    25,
  ],
  [
    'CARGO_ARRIVAL_NOTICE_SEA_FORMAT_1',
    'Cargo Arrival Notice SEA Format-1',
    'cargo_arrival_notice_sea_format1',
    26,
  ],
  [
    'CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES_FORMAT_1',
    'Cargo Arrival Notice SEA Without Charges Format-1',
    'cargo_arrival_notice_sea_without_charges_format1',
    27,
  ],
  [
    'SEA_ARRIVAL_NOTICE_LCL_VIETNAM',
    'SEA Arrival Notice LCL Vietnam',
    'sea_arrival_notice_lcl_vietnam',
    28,
  ],
  [
    'FG_CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3',
    'FG Cargo Arrival Notice SEA Format-3',
    'fg_cargo_arrival_notice_sea_format3',
    29,
  ],
];

const TERMS_LONG = [
  '********* AMOUNT WILL BE ACCEPTED IN CASH ONLY *********',
  'PLEASE CHECK WITH US FOR THE READINESS OF DELIVERY ORDER PRIOR TO COLLECTION OF SAME.',
  'Please present your original B/L duly endorsed (Except for Express Release) and collect the Line B/L - Delivery Order on payment of the following charges at the earliest to avoid Demurrage / Storage.',
  'FOR GENERAL CARGO, 5 DAYS FREE TIME FOR STORAGE FROM THE DATE OF VESSEL ARRIVAL.',
  'NO FREE STORAGE PERIOD FOR IMCO/HAZ CARGO, CHEMICAL, MEDICINE, FOOD STUFF.',
  'We thank you for giving us an opportunity to serve you and look forward for your continued support.',
];

const TERMS_SHORT = [
  '1. Kindly contact our Imports Department/Customer Service for Actual Arrival.',
  '2. D.O Counter Timings – 10.00am to 01.00pm & 02.00pm to 4.30pm.',
  '3. Cheque in favor of “KingFisher Logistic”.',
  '4. Partial Payments are not acceptable.',
  '5. Free Days FCL– 5 Days (NON-DG), 3 Days (DG or IMCO)/ LCL – 5 Days Free Days.',
  '6. After Free days storage charges applicable.',
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

const NOTIFY = {
  title: 'Notify Party',
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE',
    'AL NABHA SHARJAH UAE',
  ],
};

const AGENT = {
  title: 'Agent',
  lines: ['KingFisher Logistic', 'Dubai, United Arab Emirates', 'PHONE: +971 55 5355 286'],
};

const SEA_META = [
  { k: 'MBL No', v: 'MBLCOPY87667888 / 28-JAN-19' },
  { k: 'HBL No', v: 'PLMAAJEA00081 / 28-JAN-19' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '07-FEB-19' },
  { k: 'Vessel / Voyage', v: 'CMA CGM / 9887' },
  { k: 'Shipment No', v: 'B/EXP/19/0254 / 23-JAN-19' },
  { k: 'Job No', v: 'CEXP190150 / 29-JAN-19' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Carrier', v: 'CMA CGM' },
  { k: 'Movement Type', v: 'FCL' },
  { k: 'PP/CC', v: 'PREPAID' },
];

const AIR_META = [
  { k: 'Job No.', v: 'CEXP190150 / 29-JAN-19' },
  { k: 'MAWB No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
  { k: 'HAWB No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Port of Final Destination', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '07-FEB-19' },
  { k: 'Airline', v: 'CMA CGM' },
  { k: 'Flight Name / No.', v: 'CMA CGM / 9887' },
  { k: 'Freight', v: 'PREPAID' },
];

const CONTAINER_HEADERS = [
  'Container',
  'Type',
  'No. of Pkgs',
  'Goods Description',
  'Gross Weight',
  'Volume',
];

const CONTAINER_ROWS = [
  [
    'ABCU9877666',
    "20' DC",
    '125 PACKAGES',
    'STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID ALL DESTINATION CHARGES ARE CONSIGNEE\'S ACCOUNT',
    '18,000.000 KGS',
    '24.000',
  ],
];

const CHARGE_HEADERS = [
  'Charge',
  'Unit',
  'Qty',
  'Currency',
  'Ex.Rate',
  'Amount',
  'Tax',
  'Tax Amt',
  'Total',
];

const CHARGE_ROWS = [
  [
    'OTHER CHARGES - PALLET REWORK',
    'PER SHIPMENT',
    '1',
    'INR',
    '1.00000',
    '225.00',
    'GST18',
    '40.50',
    '265.50',
  ],
  ['TOTAL', '', '', '', '', '', '', '', '265.50'],
];

const GOODS_AIR_HEADERS = ['Goods Description', 'No. of Pkgs', 'Gross Weight', 'Volume Weight'];
const GOODS_AIR_ROWS = [
  [
    'STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID ALL DESTINATION CHARGES ARE CONSIGNEE\'S ACCOUNT',
    '125',
    '18,000.000',
    '18,000.000',
  ],
];

const FG_CNTR_HEADERS = [
  'Container No. / Type',
  'Seal',
  'Commodity Desc',
  'No of Pcs',
  'G.Wt (KGS)',
  'Vol (CBM)',
];
const FG_CNTR_ROWS = [
  [
    "ABCU9877666 20' DC",
    'SL345566',
    'STC: VALVE MATERIALS FOR MACHINERY PARTS',
    '125',
    '18,000.000',
    '24.000',
  ],
  ['Total :', '', '', '125', '18,000.000', '24.000'],
];

/** Official Format-1..10 sample: import PLJEAMAA00001 (Jebel Ali → Chennai) */
const IMP_SHIPPER = {
  title: 'Shipper',
  lines: [
    'AL NASER TRADING COMPANY LLC',
    '30 AL MAKTHOOM BUILDING NEAR MUBARAK CENTRE ROUND ABOUT',
    'AL NABHA SHARJAH SHARJAH UNITED ARAB EMIRATES',
  ],
};
const IMP_CONSIGNEE = {
  title: 'Consignee',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA',
    'EMAIL: ram@fresatechnologies.com',
  ],
};
const IMP_NOTIFY = {
  title: 'Notify1',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA',
  ],
};
const IMP_CLIENT = {
  billToLabel: 'Client',
  billToName: '4G LOGISTICS INDIA PVT LTD',
  billToAddress:
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD NUNGAMBAKKAM CHENNAI TAMIL NADU 600084 INDIA',
};
const IMP_SEA_META = [
  { k: 'Job No.', v: 'CSFI190012 / 25-JAN-19' },
  { k: 'Shipment No.', v: 'B/SFI/19/0166 / 22-JAN-19' },
  { k: 'MBL No.', v: 'MBLCOPY87666666 / 16-JAN-19' },
  { k: 'HBL No.', v: 'PLJEAMAA00001 / 16-JAN-19' },
  { k: 'Place of Receipt', v: 'DUBAI' },
  { k: 'Port of Loading', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Port of Discharge', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Final Destination', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Place of Delivery', v: 'CHENNAI' },
  { k: 'ETD', v: '16-JAN-19' },
  { k: 'ETA', v: '25-JAN-19' },
  { k: 'Carrier', v: 'CMA CGM' },
  { k: 'Vessel / Voyage', v: 'MSC MELINA / 987' },
  { k: 'Service Type', v: 'FCL/FCL' },
  { k: 'Freight', v: 'PREPAID' },
  { k: 'IGM No.', v: '98778798 / 10-JAN-19' },
  { k: 'Line / Subline No.', v: '1234 / 128' },
];
const IMP_CNTR_HEADERS = [
  'Container',
  'Type',
  'Goods Description',
  'No. of Pkgs',
  'Volume',
  'Gross Weight',
];
const IMP_CNTR_ROWS = [
  ['TENU9876666', "20' DC", 'STC: VALVE MATERIALS', '100', '20.00', '18,000.00'],
];
const IMP_CHARGE_ROWS = [
  [
    'TERMINAL HANDLING CHARGES',
    "20' DRY CONTAINER",
    '1',
    'INR',
    '1.00000',
    '5,000.00',
    'GST18',
    '900.00',
    '5,900.00',
  ],
  [
    'DELIVERY ORDER FEE',
    'PER SHIPMENT',
    '1',
    'INR',
    '1.00000',
    '3,000.00',
    'GST18',
    '540.00',
    '3,540.00',
  ],
  [
    'ALL INCL - FCL IMPORT',
    'PER SHIPMENT',
    '1',
    'INR',
    '1.00000',
    '756.50',
    'GST18',
    '136.17',
    '892.67',
  ],
  ['TOTAL', '', '', '', '', '', '', '', '10,332.67'],
];
const IMP_JASPER_META = [
  { k: 'MBL No.', v: 'MBLCOPY87666666 / 16-JAN-19' },
  { k: 'HBL No.', v: 'PLJEAMAA00001 / 16-JAN-19' },
  { k: 'ETD / ETA', v: '16-JAN-19 / 25-JAN-19' },
  { k: 'Vessel / Voyage No.', v: 'MSC MELINA / 987' },
  { k: 'Port of Loading', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'Port of Discharge', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Final Destination', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Gross Weight', v: '18,000.00 KGS' },
  { k: 'Measurement', v: '20.000 CBM' },
  { k: 'No. of Pcs', v: '100' },
  { k: 'Freight', v: 'PREPAID' },
  { k: 'BL Status', v: 'CREATED' },
  { k: 'Shipment No.', v: 'B/SFI/19/0166 / 22-JAN-19' },
  { k: 'Goods Available At', v: '—' },
];
const AIR_OFFICIAL_META = [
  { k: 'Job No.', v: 'CAI190005 / 19-FEB-19' },
  { k: 'MAWB No.', v: 'MAWB98777777 / 18-FEB-19' },
  { k: 'HAWB No.', v: 'AWB91384768 / 18-FEB-19' },
  { k: 'Place of Receipt', v: 'DUBAI' },
  { k: 'Port of Loading', v: 'DUBAI INTERNATIONAL AIRPORT, UNITED ARAB EMIRATES' },
  { k: 'Port of Discharge', v: 'CHENNAI, INDIA' },
  { k: 'Port of Final Destination', v: 'CHENNAI, INDIA' },
  { k: 'Place of Delivery', v: 'CHENNAI AIRPORT' },
  { k: 'ETD', v: '18-FEB-19' },
  { k: 'ETA', v: '19-FEB-19' },
  { k: 'Airline', v: 'EMIRATES' },
  { k: 'Flight Name / No.', v: 'EK / 176' },
  { k: 'Freight', v: 'PREPAID' },
  { k: 'IGM No.', v: '9876777 / 19-FEB-19' },
  { k: 'Line / Subline No.', v: '1289 / 127' },
];
const AIR_CLIENT = {
  title: 'Consignee',
  lines: ['BABU SECTOR PTLTD', '144/8 NALLATHAMBI STREET, NEELANKARAI', 'CHENNAI TAMIL NADU INDIA'],
};

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

const KINDS = {
  /** Format-1 Jasper — ARRIVAL NOTICE + parties + charges (PLJEAMAA00001) */
  format1_jasper: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        currency: 'INR',
        total: '10,332.67',
        totalLabel: 'Total :',
        letterBody:
          'Attention: Ocean Import - Shipping Dept.\nPlease come before 12:30pm or after 2:00pm',
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        partyNotify: IMP_NOTIFY,
        fieldGrid: IMP_JASPER_META,
        tableHeaders: [
          'Container No. / Type',
          'Seal',
          'Commodity Desc',
          'No of Pcs',
          'G.Weight',
          'Volume',
        ],
        tableRows: [
          ['TENU9876666 20\' DC', 'SL988888', 'STC: VALVE MATERIALS', '100', '18,000.000', '20.000'],
          ['Total :', '', '', '100', '18,000.000', '20.000'],
        ],
        osTableTitle: 'Charges',
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: IMP_CHARGE_ROWS,
        termsLines: TERMS_SHORT,
        remarks: 'Marks: CM MARKS NO.2',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-2 Jasper — CARGO ARRIVAL NOTICE (extra service/CFS fields + charges) */
  format2_jasper: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        currency: 'INR',
        total: '10,332.67',
        totalLabel: 'Total :',
        letterBody:
          'Attention: Ocean Import - Shipping Dept.\nPlease come before 12:30pm or after 2:00pm',
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        partyNotify: IMP_NOTIFY,
        fieldGrid: [
          { k: 'MBL No.', v: 'MBLCOPY87666666 / 16-JAN-19' },
          { k: 'HBL No.', v: 'PLJEAMAA00001 / 16-JAN-19' },
          { k: 'ETD', v: '16-JAN-19' },
          { k: 'ETA', v: '25-JAN-19' },
          { k: 'Vessel / Voyage No.', v: 'MSC MELINA / 987' },
          { k: 'Port of Loading', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Port of Discharge', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Final Destination', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Gross Weight', v: '18000 KGS' },
          { k: 'Measurement', v: '20 CBM' },
          { k: 'No. of Pcs', v: '100 PACKAGES' },
          { k: 'Freight', v: 'PREPAID' },
          { k: 'BL Status', v: 'CREATED' },
          { k: 'Service Type', v: 'FCL/FCL' },
          { k: 'Shipment No.', v: 'B/SFI/19/0166 / 22-JAN-19' },
          { k: 'Item / Line No.', v: '987777 / 1234' },
          { k: 'CFS', v: 'DUBAI PORT - FCL' },
        ],
        tableHeaders: [
          'Container No. / Type',
          'Seal',
          'Commodity Desc',
          'No of Pcs',
          'G.Weight',
          'Volume',
        ],
        tableRows: [
          ['TENU9876666 20\' DC', 'SL988888', 'STC: VALVE MATERIALS', '100', '18,000.000', '20.000'],
          ['Total :', '', '', '100', '18,000.000', '20.000'],
        ],
        osTableTitle: 'Charges',
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: IMP_CHARGE_ROWS,
        termsLines: [
          ...TERMS_SHORT,
          'This is a computer generated document and hence requires no signature',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-3 USA — ARRIVAL NOTICE / FREIGHT BILL */
  format3_usa: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        currency: 'USD',
        total: '8,756.50',
        totalLabel: '*** TOTAL DUE ( USD )***',
        words: 'USD Eight Thousand Seven Hundred Fifty-Six and Cents Fifty Only',
        partyLeft: { title: 'Shipper', lines: IMP_SHIPPER.lines },
        partyMid: { title: 'To / Consignee', lines: IMP_CONSIGNEE.lines },
        partyNotify: { title: 'Notify Party', lines: IMP_NOTIFY.lines },
        fieldGrid: [
          { k: 'House B/L No.', v: 'PLJEAMAA00001' },
          { k: 'Export Manifest No.', v: 'CSFI190012' },
          { k: 'Import House Doc. No.', v: 'B/SFI/19/0166' },
          { k: 'Import File No.', v: 'CSFI190012' },
          { k: 'Master B/L No.', v: 'MBLCOPY87666666' },
          { k: 'AMS Ref No.', v: 'AMSREF11234' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel / Voyage', v: 'MSC MELINA / 987' },
          { k: 'Place of Receipt', v: 'DUBAI' },
          { k: 'Port of Loading', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Port of Discharge', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'ETD', v: '16-JAN-19' },
          { k: 'ETA POD', v: '25-JAN-19' },
          { k: 'Final Place of Delivery', v: 'CHENNAI' },
          { k: 'Service Type', v: 'FCL/FCL' },
          { k: 'Delivery Mode', v: 'FCL' },
          { k: 'Terms', v: 'Freight PREPAID / CREATED' },
          { k: 'Remarks', v: 'CHENNAI ARRIVAL 1X20' },
        ],
        tableHeaders: [
          'Container No. / Type',
          'Seal',
          'Commodity Desc',
          'No of Pcs',
          'G.Wt (KGS)',
          'G.Wt (LBS)',
          'Vol (CBM)',
          'Vol (CFT)',
        ],
        tableRows: [
          [
            "TENU9876666 20' DC",
            'SL988888',
            'STC: VALVE MATERIALS',
            '100',
            '18,000.000',
            '39,683.207',
            '20.000',
            '706.293',
          ],
          ['Total :', '', '', '100', '18,000.000', '39,683.20', '20.000', '706.293'],
        ],
        taxAmountLines: [
          'TERMINAL HANDLING CHARGES  5,000.00',
          'DELIVERY ORDER FEE  3,000.00',
          'ALL INCL - FCL IMPORT  756.50',
        ],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL NOTICE / FREIGHT BILL',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'taxAmountBox' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-4 USA — ARRIVAL NOTICE & INVOICE */
  format4_usa: () =>
    layout({
      demo: {
        invoiceNo: 'CSFI190012',
        invoiceDate: '25-JAN-19',
        currency: 'USD',
        total: '8,756.50',
        totalLabel: '*** TOTAL DUE ( USD )***',
        partyLeft: { title: 'Shipper (s)', lines: IMP_SHIPPER.lines },
        partyMid: { title: 'To (or Consignee)', lines: IMP_CONSIGNEE.lines },
        partyNotify: { title: 'Notify Party or Broker', lines: IMP_NOTIFY.lines },
        fieldGrid: [
          { k: 'Invoice No.', v: 'CSFI190012' },
          { k: 'Prepared By', v: 'RAM' },
          { k: 'MBL No. (or Carrier BL)', v: 'MBLCOPY87666666' },
          { k: 'File No.', v: 'CSFI190012' },
          { k: 'HBL No.(s)', v: 'PLJEAMAA00001' },
          { k: 'AMS No.(s)', v: 'AMSREF11234' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel Name (arriving)', v: 'MSC MELINA' },
          { k: 'Voyage Number', v: '987' },
          { k: 'Port of Loading (Origin)', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Place of Receipt (Origin)', v: 'DUBAI' },
          { k: 'Port of Discharge', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'ETA Port of Discharge', v: '25-JAN-19' },
          { k: 'Custom Clearance Location', v: 'DUBAI PORT - FCL' },
          { k: 'Final Place of Delivery', v: 'CHENNAI' },
          { k: 'Service Type', v: 'FCL/FCL' },
          { k: 'Freight Terms', v: 'Freight PREPAID' },
          { k: 'BL Requirements', v: 'CREATED' },
          {
            k: 'Tracking Website',
            v: 'https://www.hapag-lloyd.com/en/online-business/tracing/',
          },
          { k: 'Important Remarks', v: 'CHENNAI ARRIVAL 1X20' },
        ],
        tableHeaders: [
          'Description of Goods',
          'No. of Packages',
          'Marks & Nos / Container No.(s)',
          'Gross Weight',
          'Measurement',
        ],
        tableRows: [
          [
            'STC: VALVE MATERIALS',
            '100',
            "TENU9876666-20' DC SEAL NO: SL988888",
            '18,000.000',
            '20.000',
          ],
          ['Total :', '100', '', '18,000.000', '20.000'],
        ],
        taxAmountLines: [
          'TERMINAL HANDLING CHARGES  5,000.00',
          'DELIVERY ORDER FEE  3,000.00',
          'ALL INCL - FCL IMPORT  756.50',
        ],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL NOTICE & INVOICE',
          align: 'center',
          band: true,
        },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'taxAmountBox' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** arrival_confirmation — official air confirmation AWB91384768 */
  arrival_confirmation: () =>
    layout({
      demo: {
        invoiceNo: 'AWB91384768',
        jobNo: 'CAI190005',
        shipmentNo: 'B/AI/19/0041',
        letterBody:
          'Dear Sir,\nWe are pleased to announce the arrival of your shipment in CHENNAI, INDIA on transit clearance formalities, surrender progress and we will revert with dispatch details soon.',
        metaRows: [
          { k: 'MBL No', v: 'MAWB98777777 / 18-FEB-19' },
          { k: 'HBL No', v: 'AWB91384768 / 18-FEB-19' },
          { k: 'ETD', v: '18-FEB-19' },
          { k: 'ETA', v: '19-FEB-19' },
          { k: 'Container', v: '—' },
          { k: 'Vessel / Voyage', v: 'EK / 176' },
          { k: 'Shipment No', v: 'B/AI/19/0041 / 18-FEB-19' },
          { k: 'Job No', v: 'CAI190005 / 19-FEB-19' },
          { k: 'Place of Receipt', v: 'DUBAI' },
          { k: 'Port of Loading', v: 'DUBAI INTERNATIONAL AIRPORT, UNITED ARAB EMIRATES' },
          { k: 'Port of Discharge', v: 'CHENNAI, INDIA' },
          { k: 'Place of Delivery', v: 'CHENNAI AIRPORT' },
          { k: 'Carrier', v: 'EMIRATES' },
          { k: 'Movement Type', v: 'PORT TO PORT' },
          { k: 'PP/CC', v: 'PREPAID' },
        ],
        fieldGrid: [
          { k: 'MBL No', v: 'MAWB98777777 / 18-FEB-19' },
          { k: 'HBL No', v: 'AWB91384768 / 18-FEB-19' },
          { k: 'ETD', v: '18-FEB-19' },
          { k: 'ETA', v: '19-FEB-19' },
          { k: 'Vessel / Voyage', v: 'EK / 176' },
          { k: 'Shipment No', v: 'B/AI/19/0041 / 18-FEB-19' },
          { k: 'Job No', v: 'CAI190005 / 19-FEB-19' },
          { k: 'Port of Loading', v: 'DUBAI INTERNATIONAL AIRPORT, UAE' },
          { k: 'Port of Discharge', v: 'CHENNAI, INDIA' },
          { k: 'Place of Delivery', v: 'CHENNAI AIRPORT' },
          { k: 'Carrier', v: 'EMIRATES' },
          { k: 'PP/CC', v: 'PREPAID' },
        ],
        partyLeft: { title: 'Attention', lines: ['Air Import / Consignee'] },
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL CONFIRMATION / BL NO - AWB91384768',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'letterBody' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** arrival_confirmation_format1_rpm_ref_732.pdf */
  arrival_confirmation_format1: () =>
    layout({
      demo: {
        invoiceNo: 'PLMAAJEA00081',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        metaRows: SEA_META,
        fieldGrid: SEA_META,
        tableHeaders: [
          'Container',
          'Type',
          'CFS Point',
          'Description',
          'No of Pcs',
          'Gross Weight',
          'Volume',
        ],
        tableRows: [
          [
            'ABCU9877666',
            "20' DC",
            '—',
            'STC: VALVE MATERIALS FOR MACHINERY PARTS FREIGHT PREPAID',
            '125',
            '18,000.00',
            '24.00',
          ],
        ],
        remarks: 'Remarks :',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'partyTriple' },
        {
          type: 'docTitle',
          text: 'ARRIVAL CONFIRMATION / BL NO - PLMAAJEA00081',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** arrival_information_rpm_ref_839.pdf */
  arrival_information: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        partyThird: AGENT,
        partyNotify: NOTIFY,
        fieldGrid: SEA_META,
        metaRows: SEA_META,
        tableHeaders: CONTAINER_HEADERS,
        tableRows: CONTAINER_ROWS,
        termsLines: TERMS_LONG,
        bankLines: [
          'ACCOUNT NAME: KingFisher Logistic',
          'BANK NAME - EMIRATES NBD',
          'A/C NO - 10 1235 8982 502',
          'SWIFT CODE - EBILAEAD',
          'IBAN: AE96 0260 0010 1235 8982 502',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ARRIVAL INFORMATION', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_arrival_information_rpm_ref_871.pdf */
  fg_arrival_information: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        partyNotify: NOTIFY,
        partyThird: AGENT,
        fieldGrid: [
          { k: 'Job No.', v: 'CEXP190150 / 29-JAN-19' },
          { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'Booking No.', v: 'B/EXP/19/0254' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Vessel / Voyage', v: 'EVERGREEN MARINE / 9887' },
          { k: 'ETD', v: '29-JAN-19' },
          { k: 'ETA', v: '07-FEB-19' },
          { k: 'PP / CC', v: 'PREPAID' },
          { k: 'Movement Type', v: 'FCL' },
        ],
        tableHeaders: [
          'Container',
          'Size',
          'No. of Pkgs',
          'Description of Goods',
          'Net Weight',
          'Gross Weight',
          'Volume',
        ],
        tableRows: [
          [
            'ABCU9877666',
            "20' DC",
            '125 PACKAGES',
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '17000 KGS',
            '18000 KGS',
            '24.000',
          ],
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ARRIVAL INFORMATION', align: 'center', band: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_arrival_notice_rpm_ref_399.pdf — ARRIVAL NOTICE / FREIGHT BILL */
  fg_arrival_notice: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        total: '225.00',
        totalLabel: '*** TOTAL DUE ( INR )***',
        currency: 'INR',
        words: 'Rupee Two Hundred Twenty-Five Only',
        partyLeft: { title: 'Shipper', lines: SHIPPER.lines },
        partyMid: { title: 'To / Consignee', lines: CONSIGNEE.lines },
        partyNotify: { title: 'Notify Party', lines: NOTIFY.lines },
        fieldGrid: [
          { k: 'House B/L No.', v: 'PLMAAJEA00081' },
          { k: 'Master B/L No.', v: 'MBLCOPY87667888' },
          { k: 'Import File No.', v: 'CEXP190150' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel / Voyage', v: 'EVERGREEN MARINE / 9887' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Final Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'ETD', v: '29-JAN-19' },
          { k: 'ETA POD', v: '07-FEB-19' },
          { k: 'Delivery Mode', v: 'FCL' },
          { k: 'Terms', v: 'Freight PREPAID' },
        ],
        tableHeaders: FG_CNTR_HEADERS,
        tableRows: FG_CNTR_ROWS,
        termsLines: TERMS_SHORT,
        taxAmountLines: ['OTHER CHARGES - PALLET REWORK  225.00'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL NOTICE / FREIGHT BILL',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'taxAmountBox' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_arrival_notice_format2 — ARRIVAL NOTICE & INVOICE */
  fg_arrival_notice_format2: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        invoiceDate: '07-FEB-19',
        total: '125 pkgs',
        totalLabel: 'Total :',
        partyLeft: { title: 'Shipper (s)', lines: SHIPPER.lines },
        partyMid: { title: 'To (or Consignee)', lines: CONSIGNEE.lines },
        partyNotify: { title: 'Notify Party or Broker', lines: NOTIFY.lines },
        fieldGrid: [
          { k: 'Invoice No.', v: 'CEXP190150' },
          { k: 'MBL No. (or Carrier BL)', v: 'MBLCOPY87667888' },
          { k: 'HBL No.(s)', v: 'PLMAAJEA00081' },
          { k: 'File No.', v: 'CEXP190150' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel Name (arriving)', v: 'EVERGREEN MARINE' },
          { k: 'Voyage Number', v: '9887' },
          { k: 'Port of Loading (Origin)', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'ETA Port of Discharge', v: '07-FEB-19' },
          { k: 'Delivery Type', v: 'FCL' },
          { k: 'Freight Terms', v: 'Freight PREPAID' },
          { k: 'BL Requirements', v: 'DRAFT' },
          {
            k: 'Tracking Website',
            v: 'https://www.hapag-lloyd.com/en/online-business/tracing/',
          },
        ],
        tableHeaders: [
          'Description of Goods',
          'No. of Packages',
          'Marks & Nos / Container No.(s)',
          'Gross Weight',
          'Measurement',
        ],
        tableRows: [
          [
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '125',
            "ABCU9877666-20' DC SEAL NO: SL345566",
            '18,000.000',
            '24.000',
          ],
          ['Total :', '125', '', '18,000.000', '24.000'],
        ],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL NOTICE & INVOICE',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_arrivalnotice_without_chg — same shell, no charge lines */
  fg_arrival_notice_without_chg: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        invoiceDate: '07-FEB-19',
        partyLeft: { title: 'Shipper (s)', lines: SHIPPER.lines },
        partyMid: { title: 'To (or Consignee)', lines: CONSIGNEE.lines },
        partyNotify: { title: 'Notify Party or Broker', lines: NOTIFY.lines },
        fieldGrid: [
          { k: 'Invoice No.', v: 'CEXP190150' },
          { k: 'MBL No. (or Carrier BL)', v: 'MBLCOPY87667888' },
          { k: 'HBL No.(s)', v: 'PLMAAJEA00081' },
          { k: 'File No.', v: 'CEXP190150' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel Name (arriving)', v: 'EVERGREEN MARINE' },
          { k: 'Voyage Number', v: '9887' },
          { k: 'Port of Loading (Origin)', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'ETA Port of Discharge', v: '07-FEB-19' },
          { k: 'Delivery Type', v: 'FCL' },
          { k: 'Freight Terms', v: 'Freight PREPAID' },
        ],
        tableHeaders: [
          'Description of Goods',
          'No. of Packages',
          'Marks & Nos / Container No.(s)',
          'Gross Weight',
          'Measurement',
        ],
        tableRows: [
          [
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '125',
            "ABCU9877666-20' DC SEAL NO: SL345566",
            '18,000.000',
            '24.000',
          ],
          ['Total :', '125', '', '18,000.000', '24.000'],
        ],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL NOTICE & INVOICE',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_arrival_notice_format3 */
  fg_arrival_notice_format3: () =>
    layout({
      demo: {
        invoiceNo: 'CEXP190150',
        total: '225.00',
        totalLabel: 'PLEASE PAY THIS AMOUNT — TOTAL DUE INR',
        currency: 'INR',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        partyNotify: NOTIFY,
        fieldGrid: [
          { k: 'Master B/L No', v: 'MBLCOPY87667888' },
          { k: 'House B/L No.', v: 'PLMAAJEA00081' },
          { k: 'Filing No.', v: 'CEXP190150' },
          { k: 'Vessel Info.', v: 'EVERGREEN MARINE/9887' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'ETD', v: '01/29/2019' },
          { k: 'ETA', v: '02/07/2019' },
          { k: 'Freight', v: 'FREIGHT PREPAID' },
          { k: 'Service', v: 'FCL' },
          { k: 'BL Required', v: 'No BL Required' },
        ],
        tableHeaders: [
          'Container No./Seal No.',
          'No. of Packages',
          'Description of Goods',
          'Weight',
          'Measurement',
        ],
        tableRows: [
          [
            "ABCU9877666-20' DC SEAL NO: SL345566",
            '125 PACKAGES',
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '18,000.000',
            '24.000',
          ],
        ],
        taxAmountLines: ['OTHER CHARGES - PALLET REWORK  225.00'],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'taxAmountBox' },
        { type: 'wordsAndTotal' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** cargo_arrival_notice_air — official HAWB AWB91384768 */
  cargo_arrival_notice_air: () =>
    layout({
      demo: {
        invoiceNo: 'AWB91384768',
        currency: 'INR',
        total: '2,950.00',
        totalLabel: 'TOTAL :',
        words: 'Rupee Two Thousand Nine Hundred Fifty Only',
        billToLabel: 'Client',
        billToName: 'BABU SECTOR PTLTD',
        billToAddress: '144/8 NALLATHAMBI STREET, NEELANKARAI CHENNAI TAMIL NADU INDIA',
        partyLeft: IMP_SHIPPER,
        partyMid: AIR_CLIENT,
        partyNotify: { title: 'Notify1', lines: AIR_CLIENT.lines },
        fieldGrid: AIR_OFFICIAL_META,
        tableHeaders: GOODS_AIR_HEADERS,
        tableRows: [['STC: VALVE MATERIALS', '5', '375.000', '375.000']],
        osTableTitle: 'Charges',
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: [
          [
            'DELIVERY ORDER FEE',
            'PER SHIPMENT',
            '1',
            'INR',
            '1.00000',
            '2,500.00',
            'GST18',
            '450.00',
            '2,950.00',
          ],
          ['TOTAL', '', '', '', '', '', '', '', '2,950.00'],
        ],
        termsLines: TERMS_SHORT,
        remarks: 'VALVES',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CARGO ARRIVAL NOTICE / HAWB - AWB91384768',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** cargo_arrival_notice_air_without_charges — official HAWB sample without charge table */
  cargo_arrival_notice_air_without_charges: () =>
    layout({
      demo: {
        invoiceNo: 'AWB91384768',
        billToLabel: 'Client',
        billToName: 'BABU SECTOR PTLTD',
        billToAddress: '144/8 NALLATHAMBI STREET, NEELANKARAI CHENNAI TAMIL NADU INDIA',
        partyLeft: IMP_SHIPPER,
        partyMid: AIR_CLIENT,
        partyNotify: { title: 'Notify1', lines: AIR_CLIENT.lines },
        fieldGrid: AIR_OFFICIAL_META,
        tableHeaders: ['Goods Description', 'No. of Pkgs', 'Gross Weight', 'Volume Weight'],
        tableRows: [['STC: VALVE MATERIALS', '5', '375.000', '375.000']],
        remarks: 'VALVES',
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CARGO ARRIVAL NOTICE / HAWB - AWB91384768',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_cargo_arrival_notice_rpm_ref_233.pdf */
  fg_cargo_arrival_notice: () =>
    layout({
      demo: {
        invoiceNo: 'PLMAAJEA00081',
        docSubtitle: 'Attention: Ocean Import - Shipping Dept. Please come before 12:30pm or after 2:00pm',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        partyNotify: { title: 'Notify 1', lines: NOTIFY.lines },
        fieldGrid: [
          { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'ETD / ETA', v: '29-JAN-19 / 07-FEB-19' },
          { k: 'Vessel / Voyage No.', v: 'EVERGREEN MARINE / 9887' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Final Destination', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Gross Weight', v: '18,000.00 KGS' },
          { k: 'Measurement', v: '24.000 CBM' },
          { k: 'No. of Pcs', v: '125' },
          { k: 'Freight', v: 'PREPAID' },
          { k: 'BL Status', v: 'DRAFT' },
        ],
        letterBody:
          'Attention: Ocean Import - Shipping Dept.\nPlease come before 12:30pm or after 2:00pm',
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'letterBody' },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_cargo_arrival_notice_format1 — sample file is Export Container Release Order shell */
  fg_cargo_arrival_notice_format1: () =>
    layout({
      demo: {
        invoiceNo: 'B/EXP/19/0254',
        invoiceDate: '23-JAN-19',
        docSubtitle: 'SUB: CONTAINER RELEASE ORDER',
        partyLeft: { title: 'TO / SHIPPER', lines: SHIPPER.lines },
        partyMid: {
          title: 'BOOKING PARTY',
          lines: ['AL NASER TRADING COMPANY LLC'],
        },
        fieldGrid: [
          { k: 'REF / CRO NO.', v: 'B/EXP/19/0254' },
          { k: 'Date', v: '23-JAN-19' },
          { k: 'Commodity', v: 'STC: VALVE MATERIALS FOR MACHINERY PARTS' },
          { k: 'Weight', v: '18000 KGS' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Final Destination', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Vessel / Voy', v: 'EVERGREEN MARINE / 9887' },
          { k: 'ETA', v: '07-FEB-19' },
          { k: 'ETD', v: '29-JAN-19' },
          { k: 'Container No.', v: "ABCU9877666 (20' DC) / SL345566" },
        ],
        letterBody:
          'Dear Sir,\nSUB: CONTAINER RELEASE ORDER\nLoaded containers must be returned in safe and sound condition at our nominated site within stipulated free time (7 days), failing which detention / advancement fee will be levied.',
        tableHeaders: ['Size', '1-7 Days', '8-14 Days', '15-21 Days', '22-28 Days', '29+ Days'],
        tableRows: [
          ["20' GP", '$0.00', '$10.00', '$20.00', '$40.00', '$80.00'],
          ['40\' HC', '$0.00', '$20.00', '$40.00', '$80.00', '$160.00'],
        ],
        termsLines: [
          '1) Please allot clean good container only.',
          '2) Ensure that empty containers received from our Yard are clean and sound in condition.',
          '3) Any Loss and/or damage to the container while in custody of Shipper shall be fully indemnified.',
          '4) Vessel ETA/ETD subject to change without prior notice.',
          'THIS IS A SYSTEM GENERATED DOCUMENT AND DOES NOT REQUIRE ANY SIGNATURE.',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'EXPORT CONTAINER RELEASE ORDER',
          align: 'center',
          band: true,
        },
        { type: 'fieldGrid', cols: 2 },
        { type: 'partyTriple' },
        { type: 'letterBody' },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-5 SEA — CARGO ARRIVAL NOTICE / HBL with client + full parties + charges */
  cargo_arrival_notice_sea: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        currency: 'INR',
        total: '10,332.67',
        totalLabel: 'TOTAL :',
        words: 'Rupee Ten Thousand Three Hundred Thirty-Two and Sixty-Seven PAISA Only',
        ...IMP_CLIENT,
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        partyNotify: IMP_NOTIFY,
        partyThird: {
          title: 'Forwarder',
          lines: [
            'FRESA DEMO INDIA PVT LTD',
            'NO. 178, 2ND STREET, MOORE STREET',
            'CHENNAI TAMIL NADU 600001 INDIA',
          ],
        },
        fieldGrid: IMP_SEA_META,
        tableHeaders: IMP_CNTR_HEADERS,
        tableRows: IMP_CNTR_ROWS,
        osTableTitle: 'Charges',
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: IMP_CHARGE_ROWS,
        termsLines: TERMS_SHORT,
        remarks: 'CHENNAI ARRIVAL 1X20',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CARGO ARRIVAL NOTICE / HBL No. - PLJEAMAA00001',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-6 SEA — shipper + consignee only (no notify/client), same charges */
  cargo_arrival_notice_sea_format6: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        currency: 'INR',
        total: '10,332.67',
        totalLabel: 'TOTAL :',
        words: 'Rupee Ten Thousand Three Hundred Thirty-Two and Sixty-Seven PAISA Only',
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        fieldGrid: IMP_SEA_META,
        tableHeaders: IMP_CNTR_HEADERS,
        tableRows: IMP_CNTR_ROWS,
        osTableTitle: 'Charges',
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: IMP_CHARGE_ROWS,
        termsLines: TERMS_SHORT,
        remarks: 'CHENNAI ARRIVAL 1X20',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-7 SEA — shipper/consignee/notify + clearance note */
  cargo_arrival_notice_sea_format7: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        currency: 'INR',
        total: '10,332.67',
        totalLabel: 'TOTAL :',
        words: 'Rupee Ten Thousand Three Hundred Thirty-Two and Sixty-Seven PAISA Only',
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        partyNotify: IMP_NOTIFY,
        fieldGrid: IMP_SEA_META.filter((r) => r.k !== 'Line / Subline No.'),
        tableHeaders: IMP_CNTR_HEADERS,
        tableRows: IMP_CNTR_ROWS,
        osTableTitle: 'Charges',
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: IMP_CHARGE_ROWS,
        termsLines: [
          'Note: Should you need our service to clear the cargoes on your behalf, please do not hesitate to contact the undermentioned.',
          ...TERMS_SHORT,
        ],
        remarks: 'CHENNAI ARRIVAL 1X20',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** fg_cargo_arrival_notice_sea */
  fg_cargo_arrival_notice_sea: () =>
    layout({
      demo: {
        invoiceNo: 'PLMAAJEA00081',
        currency: 'INR',
        total: '265.50',
        totalLabel: 'TOTAL :',
        billToLabel: 'Client',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD CHENNAI 600084',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        partyNotify: { title: 'Notify1', lines: NOTIFY.lines },
        fieldGrid: [
          { k: 'Job No.', v: 'CEXP190150 / 29-JAN-19' },
          { k: 'Shipment No.', v: 'B/EXP/19/0254 / 23-JAN-19' },
          { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Service Type', v: 'FCL' },
          { k: 'ETD', v: '29-JAN-19' },
          { k: 'ETA', v: '07-FEB-19' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel / Voyage', v: 'CMA CGM / 9887' },
          { k: 'Freight', v: 'PREPAID' },
        ],
        tableHeaders: [
          'Container',
          'Type',
          'Goods Description',
          'No. of Pkgs',
          'Volume',
          'Net Weight',
          'Gross Weight',
        ],
        tableRows: [
          [
            'ABCU9877666',
            "20' DC",
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '125',
            '24.000',
            '17,000.000',
            '18,000.000',
          ],
        ],
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: CHARGE_ROWS,
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CARGO ARRIVAL NOTICE / HBL NO. - PLMAAJEA00081',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  cargo_arrival_notice_sea_format2: () =>
    layout({
      demo: {
        invoiceNo: 'PLMAAJEA00081',
        currency: 'INR',
        total: '265.50',
        totalLabel: 'TOTAL :',
        words: 'Rupee Two Hundred Sixty-Five and PAISA Fifty Only',
        partyLeft: SHIPPER,
        partyMid: CONSIGNEE,
        fieldGrid: [
          { k: 'Job No.', v: 'CEXP190150 / 29-JAN-19' },
          { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Place of Delivery', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'ETD', v: '29-JAN-19' },
          { k: 'ETA', v: '07-FEB-19' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel / Voyage', v: 'CMA CGM / 9887' },
          { k: 'Service Type', v: 'FCL' },
          { k: 'Freight', v: 'PREPAID' },
        ],
        tableHeaders: [
          'Container',
          'Type',
          'Goods Description',
          'No. of Pkgs',
          'Volume',
          'Net Weight',
          'Gross Weight',
        ],
        tableRows: [
          [
            'ABCU9877666',
            "20' DC",
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '125',
            '24.00',
            '17,000.00',
            '18,000.00',
          ],
        ],
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: CHARGE_ROWS,
        termsLines: TERMS_LONG,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  cargo_arrival_notice_sea_format3: () =>
    layout({
      demo: {
        invoiceNo: 'PLMAAJEA00081',
        currency: 'INR',
        total: '265.50',
        totalLabel: 'TOTAL :',
        words: 'Rupee Two Hundred Sixty-Five and PAISA Fifty Only',
        billToLabel: 'Client',
        billToName: '4G LOGISTICS INDIA PVT LTD',
        billToAddress: '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD CHENNAI 600084',
        partyLeft: CONSIGNEE,
        partyMid: { title: 'Notify1', lines: NOTIFY.lines },
        fieldGrid: [
          { k: 'Job No.', v: 'CEXP190150 / 29-JAN-19' },
          { k: 'Shipment No.', v: 'B/EXP/19/0254 / 23-JAN-19' },
          { k: 'MBL No.', v: 'MBLCOPY87667888 / 28-JAN-19' },
          { k: 'HBL No.', v: 'PLMAAJEA00081 / 28-JAN-19' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Service Type', v: 'FCL' },
          { k: 'ETD', v: '29-JAN-19' },
          { k: 'ETA', v: '07-FEB-19' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel / Voyage', v: 'CMA CGM / 9887' },
          { k: 'Freight', v: 'PREPAID' },
        ],
        tableHeaders: [
          'Container',
          'Type',
          'Goods Description',
          'No. of Pkgs',
          'Volume',
          'Net Weight',
          'Gross Weight',
        ],
        tableRows: [
          [
            'ABCU9877666',
            "20' DC",
            'STC: VALVE MATERIALS FOR MACHINERY PARTS',
            '125',
            '24.00',
            '17,000.00',
            '18,000.00',
          ],
          ['No. of Container', 'Type', '', '', '', '', ''],
          ['1', "20' DC", '', '', '', '', ''],
        ],
        osTableHeaders: CHARGE_HEADERS,
        osTableRows: CHARGE_ROWS,
        termsLines: TERMS_LONG,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'primary' },
        { type: 'outstandingTable' },
        { type: 'wordsAndTotal' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  cargo_arrival_notice_sea_format1: () =>
    layout({
      demo: {
        invoiceNo: 'BOMMAADXB0332',
        partyLeft: { title: 'Shipper', lines: ['—'] },
        partyMid: { title: 'Consignee', lines: ['—'] },
        partyNotify: { title: 'Notify1', lines: ['—'] },
        fieldGrid: [
          { k: 'Job No.', v: 'CBOMEXP230787 / 18-MAY-23' },
          { k: 'MBL No.', v: '/' },
          { k: 'HBL No.', v: 'BOMMAADXB0332 /' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS)' },
          { k: 'Port of Discharge', v: 'DUBAI' },
          { k: 'Place of Delivery', v: 'DUBAI' },
          { k: 'ETD', v: '18-MAY-23' },
          { k: 'ETA', v: '31-MAY-23' },
        ],
        tableHeaders: [
          'Container',
          'Type',
          'Goods Description',
          'No. of Pkgs',
          'Volume',
          'Net Weight',
          'Gross Weight',
        ],
        tableRows: [['—', '—', '—', '45', '400.00', '—', '500.00']],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-8 SEA without charges (no client header) */
  cargo_arrival_notice_sea_without_charges: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        partyNotify: IMP_NOTIFY,
        fieldGrid: [
          { k: 'Job No', v: 'CSFI190012 / 25-JAN-19' },
          { k: 'MBL No', v: 'MBLCOPY87666666 / 16-JAN-19' },
          { k: 'HBL No', v: 'PLJEAMAA00001 / 16-JAN-19' },
          { k: 'Place of Receipt', v: 'DUBAI' },
          { k: 'Port of Loading', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'Port of Discharge', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Port of Final Destination', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'Place of Delivery', v: 'CHENNAI' },
          { k: 'ETD', v: '16-JAN-19' },
          { k: 'ETA', v: '25-JAN-19' },
          { k: 'Carrier', v: 'CMA CGM' },
          { k: 'Vessel / Voyage', v: 'MSC MELINA / 987' },
          { k: 'Service Type', v: 'FCL/FCL' },
          { k: 'PP / CC', v: 'PREPAID' },
          { k: 'IGM No.', v: '98778798 / 10-JAN-19' },
        ],
        tableHeaders: IMP_CNTR_HEADERS,
        tableRows: IMP_CNTR_ROWS,
        termsLines: [
          'Note: Should you need our service to clear the cargoes on your behalf, please do not hesitate to contact the undermentioned.',
          ...TERMS_SHORT,
        ],
        remarks: 'CHENNAI ARRIVAL 1X20',
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-9 SEA without charges — includes Client + HBL title */
  cargo_arrival_notice_sea_without_charges_format9: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        ...IMP_CLIENT,
        partyLeft: IMP_SHIPPER,
        partyMid: IMP_CONSIGNEE,
        partyNotify: IMP_NOTIFY,
        fieldGrid: IMP_SEA_META,
        tableHeaders: IMP_CNTR_HEADERS,
        tableRows: IMP_CNTR_ROWS,
        remarks: 'CHENNAI ARRIVAL 1X20',
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CARGO ARRIVAL NOTICE / HBL No. - PLJEAMAA00001',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  cargo_arrival_notice_sea_without_charges_format1: () =>
    layout({
      demo: {
        invoiceNo: 'BOMMAADXB0332',
        partyLeft: { title: 'Shipper', lines: ['—'] },
        partyMid: { title: 'Consignee', lines: ['—'] },
        partyNotify: { title: 'Notify1', lines: ['—'] },
        fieldGrid: [
          { k: 'Job No', v: 'CBOMEXP230787 / 18-MAY-23' },
          { k: 'HBL No', v: 'BOMMAADXB0332 /' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS)' },
          { k: 'Port of Discharge', v: 'DUBAI' },
          { k: 'Place of Delivery', v: 'DUBAI' },
          { k: 'ETD', v: '18-MAY-23' },
          { k: 'ETA', v: '31-MAY-23' },
        ],
        tableHeaders: [
          'Container',
          'Type',
          'Goods Description',
          'No of Pkgs',
          'Volume',
          'Net Weight',
          'Gross Weight',
        ],
        tableRows: [['—', '—', '—', '45', '400.00', '—', '500.00']],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'CARGO ARRIVAL NOTICE', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  /** Format-10 SEA Arrival Notice FCL Vietnam */
  sea_arrival_notice_fcl_vietnam: () =>
    layout({
      demo: {
        invoiceNo: 'PLJEAMAA00001',
        docSubtitle: 'ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN)',
        partyLeft: {
          title: 'Kính gửi / Messrs',
          lines: [
            '4G LOGISTICS INDIA PVT LTD',
            '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
            'NUNGAMBAKKAM CHENNAI TAMILNADU 600084 INDIA',
            'Attn: Import Department',
          ],
        },
        partyMid: {
          title: 'NGƯỜI GỬI / SHIPPER',
          lines: ['AL NASER TRADING COMPANY LLC'],
        },
        fieldGrid: [
          { k: 'CẢNG XẾP / POL', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
          { k: 'CẢNG DỠ / POD', v: 'CHENNAI (EX MADRAS), INDIA' },
          { k: 'TÊN TÀU / VESSEL', v: 'MSC MELINA / 987' },
          { k: 'NGÀY VỀ / ETA', v: '25-JAN-2019' },
          { k: 'JOB', v: 'CSFI190012 / 25-JAN-19' },
          { k: 'SỐ MBL / HBL', v: 'MBLCOPY87666666 / PLJEAMAA00001' },
        ],
        tableHeaders: ['CONT/SEAL', 'PKG', 'M3', 'KGS', 'COMM', 'VOL', "BILL'S STATUS"],
        tableRows: [
          [
            'TENU9876666 / SL988888',
            '100 PACKAGES',
            '20.000',
            '18,000.000',
            'AS PER BILL',
            "1 X 20' DC",
            'CREATED',
          ],
        ],
        osTableTitle: 'ALL CHARGES HAVE TO PAY BEFORE PICK UP D/O ( Các phí cần thanh toán trước khi lấy lệnh )',
        osTableHeaders: [
          'NO.',
          'DESCRIPTION',
          'QTY',
          'UNIT',
          'CUR',
          'UNIT PRICE',
          'TAX',
          'TOTAL USD',
          'TOTAL VND',
        ],
        osTableRows: [
          [
            '1',
            'TERMINAL HANDLING CHARGES',
            '1',
            "20' DRY CONTAINER",
            'INR',
            '5,000.00',
            'GST18',
            '88.500',
            '5,900',
          ],
          [
            '2',
            'DELIVERY ORDER FEE',
            '1',
            'PER SHIPMENT',
            'INR',
            '3,000.00',
            'GST18',
            '53.100',
            '3,540',
          ],
          ['3', 'ALL INCL', '1', 'PER SHIPMENT', 'INR', '756.50', 'GST18', '13.391', '893'],
          ['', 'TOTAL :', '', '', '', '', '', '154.991', '10,333'],
        ],
        termsLines: [
          'ALL CHARGES HAVE TO PAY BEFORE PICK UP D/O ( Các phí cần thanh toán trước khi lấy lệnh )',
        ],
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        { type: 'docTitle', text: 'ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN)', align: 'center', band: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  sea_arrival_notice_lcl_vietnam: () =>
    layout({
      demo: {
        invoiceNo: 'BOMMAADXB0332',
        docSubtitle: 'ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN) — LCL',
        partyLeft: { title: 'Kính gửi / Messrs', lines: ['Import Department'] },
        partyMid: { title: 'NGƯỜI GỬI / SHIPPER', lines: ['—'] },
        fieldGrid: [
          { k: 'CẢNG XẾP / POL', v: 'CHENNAI (EX MADRAS)' },
          { k: 'CẢNG DỠ / POD', v: 'DUBAI' },
          { k: 'TÊN TÀU / VESSEL', v: '/' },
          { k: 'NGÀY VỀ / ETA', v: '31-MAY-2023' },
          { k: 'JOB', v: 'CBOMEXP230787 / 18-MAY-23' },
          { k: 'SỐ MBL / HBL', v: '/ BOMMAADXB0332' },
        ],
        tableHeaders: [
          'A PART OF CONT/SEAL',
          'PKG',
          'M3',
          'KGS',
          'COMM',
          'WAREHOUSE',
          "BILL'S STATUS",
        ],
        tableRows: [['—', '45', '400.000', '—', 'AS PER BILL', '—', 'CREATED']],
        osTableHeaders: [
          'NO.',
          'DESCRIPTION',
          'QTY',
          'UNIT',
          'CUR',
          'UNIT PRICE',
          'TAX',
          'TOTAL USD',
          'TOTAL VND',
        ],
        osTableRows: [['', 'TOTAL :', '', '', '', '', '', '', '']],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'ARRIVAL NOTICE (THÔNG BÁO HÀNG ĐẾN) — LCL',
          align: 'center',
          band: true,
        },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'outstandingTable' },
        { type: 'termsBank' },
        { type: 'colorfulFooter' },
      ],
    }),

  fg_cargo_arrival_notice_sea_format3: () =>
    layout({
      demo: {
        invoiceNo: 'BOMMAADXB0332',
        billToLabel: 'Client',
        billToName: 'DUBAI LOGISTICS',
        billToAddress: '9 ABC BUILDING AL HUSSINE STREET DUBAI',
        partyLeft: { title: 'Shipper', lines: ['—'] },
        partyMid: { title: 'Consignee', lines: ['—'] },
        partyThird: AGENT,
        fieldGrid: [
          { k: 'Job No.', v: 'CBOMEXP230787 / 18-MAY-23' },
          { k: 'Shipment No.', v: 'BOM/EXP/23/05/B/0719 / 17-MAY-23' },
          { k: 'HBL No.', v: 'BOMMAADXB0332 /' },
          { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS)' },
          { k: 'Port of Discharge', v: 'DUBAI' },
          { k: 'Place of Delivery', v: 'DUBAI' },
          { k: 'ETD', v: '18-MAY-23' },
          { k: 'ETA', v: '31-MAY-23' },
        ],
        tableHeaders: [
          'Container',
          'Type',
          'Goods Description',
          'No. of Pkgs',
          'Volume',
          'Gross Weight',
        ],
        tableRows: [['—', '—', '—', '45', '400.000', '—']],
        termsLines: TERMS_SHORT,
      },
      blocks: [
        { type: 'companyHeader', showContact: true },
        {
          type: 'docTitle',
          text: 'CARGO ARRIVAL NOTICE / HBL NO. - BOMMAADXB0332',
          align: 'center',
          band: true,
        },
        { type: 'twoColumn', showBillTo: true },
        { type: 'partyTriple' },
        { type: 'fieldGrid', cols: 2 },
        { type: 'chargeTable', headerColor: 'fill' },
        { type: 'termsBank' },
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
const outJson = path.join(root, 'src/features/reports/data/arrivalNoticeFormatUiLayouts.json');
const outTs = path.join(
  root,
  'src/features/reports/data/arrivalNoticeFormatUiLayouts.generated.ts',
);
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated Arrival Notice formats — run: node scripts/build-arrival-notice-format-ui-layouts.mjs */\n` +
    `export const ARRIVAL_NOTICE_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} Arrival Notice layouts matched to Fresa sample PDFs`);
