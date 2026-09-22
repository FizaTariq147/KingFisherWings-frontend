/**
 * Other Reports formats from Fresa official report-format PDFs.
 * Usage: node scripts/build-other-reports-format-ui-layouts.mjs
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

/** [code, name, kind, sortOrder] — synced with otherReportsFormatCatalog.ts */
const CATALOG = [
  ['CARGO_MANIFEST_REPORT_FORMAT', 'Cargo Manifest Report Format', 'cargo_manifest', 1],
  ['CONTAINER_LOAD_PLAN_REPORT_FORMAT', 'Container Load Plan Report Format', 'container_load_plan', 2],
  [
    'FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT',
    'Freight Manifest For Groupage Imports LCL Report Format',
    'freight_manifest_groupage_imports_lcl',
    3,
  ],
  ['TRANSSHIPMENT_LIST_REPORT_FORMAT', 'Transshipment List Report Format', 'transshipment_list', 4],
  [
    'BOOKING_CONFIRMATION_REPORT_FORMAT_1',
    'Booking Confirmation Report Format-1',
    'booking_confirmation_1',
    5,
  ],
  [
    'BOOKING_CONFIRMATION_REPORT_FORMAT_2',
    'Booking Confirmation Report Format-2',
    'booking_confirmation_2',
    6,
  ],
  [
    'CARGO_RECEIPT_NOTE_FOR_EXPORT_CFS_REPORT_FORMAT',
    'Cargo Receipt Note For Export CFS Report Format',
    'cargo_receipt_note_export_cfs',
    7,
  ],
  ['CONTAINER_OUTTURN_REPORT_FORMAT', 'Container Outturn Report Format', 'container_outturn', 8],
  [
    'CONTAINER_UNLOAD_PLAN_REPORT_FORMAT',
    'Container Unload Plan Report Format',
    'container_unload_plan',
    9,
  ],
  [
    'FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT',
    'Freight Manifest LCL Exports Report Format',
    'freight_manifest_lcl_exports',
    10,
  ],
  ['SAILING_CONFIRMATION_REPORT_FORMAT', 'Sailing Confirmation Report Format', 'sailing_confirmation', 11],
  [
    'CONSOL_IGM_FILLING_LETTER_JASPER_REPORT_FORMAT',
    'Consol IGM Filling Letter Jasper Report Format',
    'consol_igm_filling_letter_jasper',
    12,
  ],
  [
    'CONTAINER_MOVEMENT_FACILITATION_CELL_NOTE_REPORT_FORMAT',
    'Container Movement Facilitation Cell Note Report Format',
    'container_movement_facilitation_cell_note',
    13,
  ],
  [
    'EXCHANGE_LETTER_TO_CARRIER_AGENT_REPORT_FORMAT',
    'Exchange Letter To Carrier Agent Report Format',
    'exchange_letter_to_carrier_agent',
    14,
  ],
  ['IMPORT_CARGO_MANIFEST_REPORT_FORMAT', 'Import Cargo Manifest Report Format', 'import_cargo_manifest', 15],
  ['IMPORT_TALLY_SHEET_REPORT_FORMAT', 'Import Tally Sheet Report Format', 'import_tally_sheet', 16],
  ['LETTER_OF_GUARANTEE_REPORT_FORMAT', 'Letter OF Guarantee Report Format', 'letter_of_guarantee', 17],
  [
    'RIDER_SHEET_FOR_EXPORT_MANIFEST_REPORT_FORMAT',
    'Rider Sheet For Export Manifest Report Format',
    'rider_sheet_export_manifest',
    18,
  ],
  [
    'SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT',
    'Shipment Profit And Loss Report Format',
    'shipment_profit_and_loss',
    19,
  ],
  [
    'SHIPMENT_STATUS_CONFIRMATION_REPORT_FORMAT',
    'Shipment Status Confirmation Report Format',
    'shipment_status_confirmation',
    20,
  ],
  [
    'TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT',
    'Truck Cargo Pickup Request Report Format',
    'truck_cargo_pickup_request',
    21,
  ],
  ['CARTING_CONFIRMATION_REPORT_FORMAT', 'Carting Confirmation Report Format', 'carting_confirmation', 22],
  ['CONTAINER_VGM_FORM_REPORT_FORMAT', 'Container VGM Form Report Format', 'container_vgm_form', 23],
  ['FCL_QUOTATION_REPORT_FORMAT', 'FCL Quotation Report Format', 'fcl_quotation', 24],
  ['FCR_DOCUMENT_REPORT_FORMAT', 'FCR Document Report Format', 'fcr_document', 25],
  [
    'IMPORT_SECURITY_FILLING_JASPER_AMS_REPORT_FORMAT',
    'Import Security Filling Jasper AMS Report Format',
    'import_security_filling_jasper_ams',
    26,
  ],
  ['ISF_FILING_DOCUMENT_REPORT_FORMAT', 'ISF Filing Document Report Format', 'isf_filing_document', 27],
  ['LOADING_CONFIRMATION_REPORT_FORMAT', 'Loading Confirmation Report Format', 'loading_confirmation', 28],
  ['PICKUP_CONFIRMATION_REPORT_FORMAT', 'Pickup Confirmation Report Format', 'pickup_confirmation', 29],
  ['PRE_ALERT_TO_CLIENT_REPORT_FORMAT', 'Pre Alert To Client Report Format', 'pre_alert_to_client', 30],
  ['PREALERT_USA_JASPER_REPORT_FORMAT', 'Prealert USA Jasper Report Format', 'prealert_usa_jasper', 31],
  ['SHIPPING_INSTRUCTION_REPORT_FORMAT', 'Shipping Instruction Report Format', 'shipping_instruction', 32],
  ['STUFFING_REPORT_FORMAT', 'Stuffing Report Format', 'stuffing_report', 33],
  [
    'STUFFING_REPORT_JASPER_REPORT_FORMAT',
    'Stuffing Report Jasper Report Format',
    'stuffing_report_jasper',
    34,
  ],
  ['SURRENDERED_LETTER_REPORT_FORMAT', 'Surrendered Letter Report Format', 'surrendered_letter', 35],
  [
    'TERMINAL_DEPARTURE_REPORT_TDR_REPORT_FORMAT',
    'Terminal Departure Report (TDR) Report Format',
    'terminal_departure_tdr',
    36,
  ],
  ['DAILY_STATUS_REPORT_FORMAT_1', 'Daily Status Report Format-1', 'daily_status_1', 37],
  ['DAILY_STATUS_REPORT_FORMAT_2', 'Daily Status Report Format-2', 'daily_status_2', 38],
  ['JOB_CARD_REPORT_FORMAT', 'Job Card Report Format', 'job_card', 39],
  ['AIR_QUOTATION_REPORT_FORMAT', 'Air Quotation Report Format', 'air_quotation', 40],
  [
    'AIR_QUOTATION_WITH_AIRLINE_REPORT_FORMAT',
    'Air Quotation With Airline Report Format',
    'air_quotation_with_airline',
    41,
  ],
  [
    'AIR_FREIGHT_ATD_CONFIRMATION_REPORT_FORMAT',
    'Air Freight ATD Confirmation Report Format',
    'air_freight_atd_confirmation',
    42,
  ],
  ['BARCODE_AWB_REPORT_FORMAT', 'Barcode AWB Report Format', 'barcode_awb', 43],
  [
    'BOOKING_CONFIRMATION_AIR_REPORT_FORMAT',
    'Booking Confirmation Air Report Format',
    'booking_confirmation_air',
    44,
  ],
  [
    'CARGO_MANIFEST_AIR_HOUSE_REPORT_FORMAT',
    'Cargo Manifest Air House Report Format',
    'cargo_manifest_air_house',
    45,
  ],
  [
    'CARGO_MANIFEST_AIR_JASPER_REPORT_FORMAT',
    'Cargo Manifest Air Jasper Report format',
    'cargo_manifest_air_jasper',
    46,
  ],
  [
    'CARGO_MANIFEST_AIR_LC_JASPER_REPORT_FORMAT',
    'Cargo Manifest Air LC Jasper Report Format',
    'cargo_manifest_air_lc_jasper',
    47,
  ],
  [
    'SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT',
    'Shipment Freight Manifest Report Format',
    'shipment_freight_manifest',
    48,
  ],
  [
    'AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT',
    'Air Shipment Profit And Loss Report Format',
    'air_shipment_profit_and_loss',
    49,
  ],
  [
    'AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT_1',
    'Air Shipment Profit And Loss Report Format-1',
    'air_shipment_profit_and_loss_1',
    50,
  ],
  [
    'JOB_HOUSE_RECORD_LIST_REPORT_FORMAT',
    'Job House Record List Report Format',
    'job_house_record_list',
    51,
  ],
  ['MAWB_DRAFT_REPORT_FORMAT', 'MAWB Draft Report Format', 'mawb_draft', 52],
  [
    'MAWB_ORIGINAL_PREPRINTED_KC_REPORT_FORMAT',
    'MAWB Original Preprinted KC Report Format',
    'mawb_original_preprinted_kc',
    53,
  ],
  ['PRE_ALERT_AIR_REPORT_FORMAT', 'Pre Alert Air Report Format', 'pre_alert_air', 54],
  [
    'CASH_COLLECTION_REPORT_LIST_REPORT_FORMAT',
    'Cash Collection Report List Report Format',
    'cash_collection_list',
    55,
  ],
  ['CLOSED_JOB_LIST_REPORT_FORMAT', 'Closed Job List Report Format', 'closed_job_list', 56],
  ['JOB_LIST_SUMMARY_REPORT_FORMAT', 'Job List Summary Report Format', 'job_list_summary', 57],
  [
    'PAYMENT_REQUEST_LIST_REPORT_FORMAT',
    'Payment Request List Report Format',
    'payment_request_list',
    58,
  ],
  [
    'JOB_HOUSE_RECORD_LIST_REPORT_FORMAT_1',
    'Job House Record List Report Format-1',
    'job_house_record_list_1',
    59,
  ],
  [
    'PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT',
    'Proforma Invoice All Charges Report Format',
    'proforma_invoice_all_charges',
    60,
  ],
];

const SHIPPER = {
  title: 'Shipper',
  lines: [
    '4G LOGISTICS INDIA PVT LTD',
    '10 DBS CENTRE NUNGAMBAKKAM HIGH ROAD',
    'CHENNAI TAMIL NADU 600084 INDIA',
  ],
};

const CONSIGNEE = {
  title: 'Consignee',
  lines: ['AL NASER TRADING COMPANY LLC', '30 AL MAKTHOOM BUILDING', 'SHARJAH UAE'],
};

const NOTIFY = {
  title: 'Notify Party',
  lines: CONSIGNEE.lines,
};

const SEA_META = [
  { k: 'Job / Shipment', v: 'B/EXP/19/0254' },
  { k: 'MBL No.', v: 'MBLCOPY87667888' },
  { k: 'HBL No.', v: 'PLMAAJEA00081' },
  { k: 'Vessel / Voyage', v: 'EVERGREEN MARINE / 9887' },
  { k: 'Port of Loading', v: 'CHENNAI (EX MADRAS), INDIA' },
  { k: 'Port of Discharge', v: 'JEBEL ALI, UNITED ARAB EMIRATES' },
  { k: 'ETD', v: '29-JAN-19' },
  { k: 'ETA', v: '07-FEB-19' },
  { k: 'Service Type', v: 'FCL / LCL' },
  { k: 'No. of Packages', v: '125' },
  { k: 'Gross Weight', v: '18,000.000 KGS' },
  { k: 'Measurement', v: '24.000 CBM' },
];

const CONTAINER_HEADERS = ['Container No.', 'Type', 'Seal', 'Pkgs', 'Weight', 'Volume'];
const CONTAINER_ROW = ['ABCU9877666', "20' DC", 'SL988888', '125', '18,000.000', '24.000'];

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

function opsDoc(docTitle, opts = {}) {
  const {
    headerColor = 'primary',
    badge,
    letterBody,
    extraGrid = [],
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
    demo: {
      invoiceNo: 'B/EXP/19/0254',
      invoiceDate: '28-JAN-19',
      letterBody,
      partyLeft: SHIPPER,
      partyMid: CONSIGNEE,
      partyNotify: NOTIFY,
      fieldGrid: [...SEA_META, ...extraGrid],
      tableHeaders: CONTAINER_HEADERS,
      tableRows: [CONTAINER_ROW],
      termsLines: [
        'Sample Other Reports layout — Fresa Gold report format preview.',
        ...(termsExtra ? [termsExtra] : []),
        'STC: VALVE MATERIALS FOR MACHINERY PARTS',
      ],
      remarks: badge,
    },
    blocks,
  });
}

const KINDS = {
  cargo_manifest: () =>
    opsDoc('CARGO MANIFEST', {
      headerColor: 'primary',
      badge: 'Cargo Manifest',
      extraGrid: [{ k: 'Layout', v: 'Cargo Manifest Report Format' }],
    }),
  container_load_plan: () =>
    opsDoc('CONTAINER LOAD PLAN', {
      headerColor: 'accent',
      badge: 'Load Plan',
      extraGrid: [{ k: 'Layout', v: 'Container Load Plan Report Format' }],
    }),
  freight_manifest_groupage_imports_lcl: () =>
    opsDoc('FREIGHT MANIFEST — GROUPAGE IMPORTS (LCL)', {
      headerColor: 'fill',
      badge: 'Groupage LCL Import',
      extraGrid: [
        { k: 'Layout', v: 'Freight Manifest For Groupage Imports LCL Report Format' },
        { k: 'Mode', v: 'LCL Import Groupage' },
      ],
    }),
  transshipment_list: () =>
    opsDoc('TRANSSHIPMENT LIST', {
      headerColor: 'orange',
      badge: 'Transshipment',
      extraGrid: [{ k: 'Layout', v: 'Transshipment List Report Format' }],
    }),
  booking_confirmation_1: () =>
    opsDoc('BOOKING CONFIRMATION — FORMAT 1', {
      headerColor: 'cyan',
      badge: 'Booking Confirmation-1',
      extraGrid: [{ k: 'Layout', v: 'Booking Confirmation Report Format-1' }],
      letterBody: 'We are pleased to confirm the booking details as below.',
    }),
  booking_confirmation_2: () =>
    opsDoc('BOOKING CONFIRMATION — FORMAT 2', {
      headerColor: 'primary',
      badge: 'Booking Confirmation-2',
      extraGrid: [{ k: 'Layout', v: 'Booking Confirmation Report Format-2' }],
      letterBody: 'Booking confirmation (Format-2) — sample export from Fresa Gold.',
    }),
  cargo_receipt_note_export_cfs: () =>
    opsDoc('CARGO RECEIPT NOTE — EXPORT CFS', {
      headerColor: 'accent',
      badge: 'Export CFS CRN',
      extraGrid: [{ k: 'Layout', v: 'Cargo Receipt Note For Export CFS Report Format' }],
    }),
  container_outturn: () =>
    opsDoc('CONTAINER OUTTURN REPORT', {
      headerColor: 'fill',
      badge: 'Outturn',
      extraGrid: [{ k: 'Layout', v: 'Container Outturn Report Format' }],
    }),
  container_unload_plan: () =>
    opsDoc('CONTAINER UNLOAD PLAN', {
      headerColor: 'orange',
      badge: 'Unload Plan',
      extraGrid: [{ k: 'Layout', v: 'Container Unload Plan Report Format' }],
    }),
  freight_manifest_lcl_exports: () =>
    opsDoc('FREIGHT MANIFEST — LCL EXPORTS', {
      headerColor: 'cyan',
      badge: 'LCL Exports',
      extraGrid: [
        { k: 'Layout', v: 'Freight Manifest LCL Exports Report Format' },
        { k: 'Mode', v: 'LCL Export' },
      ],
    }),
  sailing_confirmation: () =>
    opsDoc('SAILING CONFIRMATION', {
      headerColor: 'primary',
      badge: 'Sailing Confirmation',
      extraGrid: [{ k: 'Layout', v: 'Sailing Confirmation Report Format' }],
      letterBody: 'Vessel sailing confirmation for the shipment referenced below.',
    }),
  consol_igm_filling_letter_jasper: () =>
    opsDoc('CONSOL IGM FILLING LETTER', {
      headerColor: 'accent',
      badge: 'IGM Filling Letter',
      letterBody:
        'Please find enclosed the consol IGM filling particulars for customs processing.',
      extraGrid: [
        { k: 'Layout', v: 'Consol IGM Filling Letter Jasper Report Format' },
        { k: 'IGM No.', v: 'IGM/2019/004421' },
      ],
      termsExtra: 'Jasper consol IGM filling letter sample.',
    }),
  container_movement_facilitation_cell_note: () =>
    opsDoc('CONTAINER MOVEMENT FACILITATION CELL NOTE', {
      headerColor: 'fill',
      badge: 'CMFC Note',
      extraGrid: [
        { k: 'Layout', v: 'Container Movement Facilitation Cell Note Report Format' },
      ],
    }),
  exchange_letter_to_carrier_agent: () =>
    opsDoc('EXCHANGE LETTER TO CARRIER AGENT', {
      headerColor: 'cyan',
      badge: 'Exchange Letter',
      letterBody: 'Exchange letter to carrier agent — sample from Fresa Gold.',
      extraGrid: [{ k: 'Layout', v: 'Exchange Letter To Carrier Agent Report Format' }],
    }),
  import_cargo_manifest: () =>
    opsDoc('IMPORT CARGO MANIFEST', {
      headerColor: 'primary',
      badge: 'Import Manifest',
      extraGrid: [{ k: 'Layout', v: 'Import Cargo Manifest Report Format' }],
    }),
  import_tally_sheet: () =>
    opsDoc('IMPORT TALLY SHEET', {
      headerColor: 'accent',
      badge: 'Import Tally',
      extraGrid: [{ k: 'Layout', v: 'Import Tally Sheet Report Format' }],
    }),
  letter_of_guarantee: () =>
    opsDoc('LETTER OF GUARANTEE', {
      headerColor: 'orange',
      badge: 'LOG',
      letterBody: 'Letter of guarantee issued for the shipment referenced below.',
      extraGrid: [{ k: 'Layout', v: 'Letter OF Guarantee Report Format' }],
    }),
  rider_sheet_export_manifest: () =>
    opsDoc('RIDER SHEET — EXPORT MANIFEST', {
      headerColor: 'fill',
      badge: 'Rider Sheet',
      extraGrid: [{ k: 'Layout', v: 'Rider Sheet For Export Manifest Report Format' }],
    }),
  shipment_profit_and_loss: () =>
    opsDoc('SHIPMENT PROFIT AND LOSS', {
      headerColor: 'primary',
      badge: 'P&L',
      extraGrid: [{ k: 'Layout', v: 'Shipment Profit And Loss Report Format' }],
    }),
  shipment_status_confirmation: () =>
    opsDoc('SHIPMENT STATUS CONFIRMATION', {
      headerColor: 'accent',
      badge: 'Status Confirmation',
      letterBody: 'Shipment status confirmation for the consignment below.',
      extraGrid: [{ k: 'Layout', v: 'Shipment Status Confirmation Report Format' }],
    }),
  truck_cargo_pickup_request: () =>
    opsDoc('TRUCK CARGO PICKUP REQUEST', {
      headerColor: 'cyan',
      badge: 'Pickup Request',
      extraGrid: [{ k: 'Layout', v: 'Truck Cargo Pickup Request Report Format' }],
    }),
  carting_confirmation: () =>
    opsDoc('CARTING CONFIRMATION', {
      headerColor: 'orange',
      badge: 'Carting',
      extraGrid: [{ k: 'Layout', v: 'Carting Confirmation Report Format' }],
    }),
  container_vgm_form: () =>
    opsDoc('CONTAINER VGM FORM', {
      headerColor: 'fill',
      badge: 'VGM',
      extraGrid: [{ k: 'Layout', v: 'Container VGM Form Report Format' }],
    }),
  fcl_quotation: () =>
    opsDoc('FCL QUOTATION', {
      headerColor: 'primary',
      badge: 'FCL Quotation',
      extraGrid: [{ k: 'Layout', v: 'FCL Quotation Report Format' }],
      letterBody: 'FCL quotation — rates and terms as per below.',
    }),
  fcr_document: () =>
    opsDoc('FCR DOCUMENT', {
      headerColor: 'accent',
      badge: 'FCR',
      extraGrid: [{ k: 'Layout', v: 'FCR Document Report Format' }],
    }),
  import_security_filling_jasper_ams: () =>
    opsDoc('IMPORT SECURITY FILLING — AMS', {
      headerColor: 'primary',
      badge: 'ISF / AMS',
      extraGrid: [{ k: 'Layout', v: 'Import Security Filling Jasper AMS Report Format' }],
    }),
  isf_filing_document: () =>
    opsDoc('ISF FILING DOCUMENT', {
      headerColor: 'accent',
      badge: 'ISF Filing',
      extraGrid: [{ k: 'Layout', v: 'ISF Filing Document Report Format' }],
    }),
  loading_confirmation: () =>
    opsDoc('LOADING CONFIRMATION', {
      headerColor: 'fill',
      badge: 'Loading Confirmation',
      letterBody: 'Loading confirmation for the shipment referenced below.',
      extraGrid: [{ k: 'Layout', v: 'Loading Confirmation Report Format' }],
    }),
  pickup_confirmation: () =>
    opsDoc('PICKUP CONFIRMATION', {
      headerColor: 'cyan',
      badge: 'Pickup Confirmation',
      letterBody: 'Cargo pickup confirmation for the consignment below.',
      extraGrid: [{ k: 'Layout', v: 'Pickup Confirmation Report Format' }],
    }),
  pre_alert_to_client: () =>
    opsDoc('PRE ALERT TO CLIENT', {
      headerColor: 'orange',
      badge: 'Pre Alert',
      letterBody: 'Pre-alert to client — shipment particulars as below.',
      extraGrid: [{ k: 'Layout', v: 'Pre Alert To Client Report Format' }],
    }),
  prealert_usa_jasper: () =>
    opsDoc('PREALERT USA', {
      headerColor: 'primary',
      badge: 'Prealert USA',
      letterBody: 'USA pre-alert (Jasper) — sample export from Fresa Gold.',
      extraGrid: [{ k: 'Layout', v: 'Prealert USA Jasper Report Format' }],
    }),
  shipping_instruction: () =>
    opsDoc('SHIPPING INSTRUCTION', {
      headerColor: 'accent',
      badge: 'Shipping Instruction',
      extraGrid: [{ k: 'Layout', v: 'Shipping Instruction Report Format' }],
    }),
  stuffing_report: () =>
    opsDoc('STUFFING REPORT', {
      headerColor: 'fill',
      badge: 'Stuffing',
      extraGrid: [{ k: 'Layout', v: 'Stuffing Report Format' }],
    }),
  stuffing_report_jasper: () =>
    opsDoc('STUFFING REPORT — JASPER', {
      headerColor: 'cyan',
      badge: 'Stuffing Jasper',
      extraGrid: [{ k: 'Layout', v: 'Stuffing Report Jasper Report Format' }],
    }),
  surrendered_letter: () =>
    opsDoc('SURRENDERED LETTER', {
      headerColor: 'orange',
      badge: 'Surrendered',
      letterBody: 'Bill of lading surrender confirmation for the shipment below.',
      extraGrid: [{ k: 'Layout', v: 'Surrendered Letter Report Format' }],
    }),
  terminal_departure_tdr: () =>
    opsDoc('TERMINAL DEPARTURE REPORT (TDR)', {
      headerColor: 'primary',
      badge: 'TDR',
      extraGrid: [{ k: 'Layout', v: 'Terminal Departure Report (TDR) Report Format' }],
    }),
  daily_status_1: () =>
    opsDoc('DAILY STATUS REPORT — FORMAT 1', {
      headerColor: 'accent',
      badge: 'DSR Format-1',
      extraGrid: [{ k: 'Layout', v: 'Daily Status Report Format-1' }],
    }),
  daily_status_2: () =>
    opsDoc('DAILY STATUS REPORT — FORMAT 2', {
      headerColor: 'fill',
      badge: 'DSR Format-2',
      extraGrid: [{ k: 'Layout', v: 'Daily Status Report Format-2' }],
    }),
  job_card: () =>
    opsDoc('JOB CARD', {
      headerColor: 'cyan',
      badge: 'Job Card',
      extraGrid: [{ k: 'Layout', v: 'Job Card Report Format' }],
    }),
  air_quotation: () =>
    opsDoc('AIR QUOTATION', {
      headerColor: 'primary',
      badge: 'Air Quotation',
      letterBody: 'Air freight quotation — rates and terms as per below.',
      extraGrid: [{ k: 'Layout', v: 'Air Quotation Report Format' }],
    }),
  air_quotation_with_airline: () =>
    opsDoc('AIR QUOTATION WITH AIRLINE', {
      headerColor: 'accent',
      badge: 'Air Quotation + Airline',
      letterBody: 'Air quotation including airline particulars.',
      extraGrid: [{ k: 'Layout', v: 'Air Quotation With Airline Report Format' }],
    }),
  air_freight_atd_confirmation: () =>
    opsDoc('AIR FREIGHT ATD CONFIRMATION', {
      headerColor: 'primary',
      badge: 'ATD Confirmation',
      letterBody: 'Air freight ATD confirmation for the shipment below.',
      extraGrid: [{ k: 'Layout', v: 'Air Freight ATD Confirmation Report Format' }],
    }),
  barcode_awb: () =>
    opsDoc('BARCODE AWB', {
      headerColor: 'accent',
      badge: 'Barcode AWB',
      extraGrid: [{ k: 'Layout', v: 'Barcode AWB Report Format' }],
    }),
  booking_confirmation_air: () =>
    opsDoc('BOOKING CONFIRMATION — AIR', {
      headerColor: 'fill',
      badge: 'Air Booking',
      letterBody: 'Air booking confirmation particulars as below.',
      extraGrid: [{ k: 'Layout', v: 'Booking Confirmation Air Report Format' }],
    }),
  cargo_manifest_air_house: () =>
    opsDoc('CARGO MANIFEST — AIR HOUSE', {
      headerColor: 'cyan',
      badge: 'Air House Manifest',
      extraGrid: [{ k: 'Layout', v: 'Cargo Manifest Air House Report Format' }],
    }),
  cargo_manifest_air_jasper: () =>
    opsDoc('CARGO MANIFEST — AIR JASPER', {
      headerColor: 'orange',
      badge: 'Air Jasper Manifest',
      extraGrid: [{ k: 'Layout', v: 'Cargo Manifest Air Jasper Report format' }],
    }),
  cargo_manifest_air_lc_jasper: () =>
    opsDoc('CARGO MANIFEST — AIR LC JASPER', {
      headerColor: 'primary',
      badge: 'Air LC Jasper',
      extraGrid: [{ k: 'Layout', v: 'Cargo Manifest Air LC Jasper Report Format' }],
    }),
  shipment_freight_manifest: () =>
    opsDoc('SHIPMENT FREIGHT MANIFEST', {
      headerColor: 'accent',
      badge: 'Freight Manifest',
      extraGrid: [{ k: 'Layout', v: 'Shipment Freight Manifest Report Format' }],
    }),
  air_shipment_profit_and_loss: () =>
    opsDoc('AIR SHIPMENT PROFIT AND LOSS', {
      headerColor: 'fill',
      badge: 'Air P&L',
      extraGrid: [{ k: 'Layout', v: 'Air Shipment Profit And Loss Report Format' }],
    }),
  air_shipment_profit_and_loss_1: () =>
    opsDoc('AIR SHIPMENT PROFIT AND LOSS — FORMAT 1', {
      headerColor: 'cyan',
      badge: 'Air P&L Format-1',
      extraGrid: [{ k: 'Layout', v: 'Air Shipment Profit And Loss Report Format-1' }],
    }),
  job_house_record_list: () =>
    opsDoc('JOB HOUSE RECORD LIST', {
      headerColor: 'orange',
      badge: 'Job House List',
      extraGrid: [{ k: 'Layout', v: 'Job House Record List Report Format' }],
    }),
  mawb_draft: () =>
    opsDoc('MAWB — DRAFT', {
      headerColor: 'primary',
      badge: 'MAWB Draft',
      extraGrid: [{ k: 'Layout', v: 'MAWB Draft Report Format' }],
      termsExtra: 'DRAFT — Not negotiable unless marked original.',
    }),
  mawb_original_preprinted_kc: () =>
    opsDoc('MAWB — ORIGINAL PREPRINTED KC', {
      headerColor: 'accent',
      badge: 'MAWB Original KC',
      extraGrid: [{ k: 'Layout', v: 'MAWB Original Preprinted KC Report Format' }],
      termsExtra: 'ORIGINAL — Negotiable when duly endorsed.',
    }),
  pre_alert_air: () =>
    opsDoc('PRE ALERT — AIR', {
      headerColor: 'fill',
      badge: 'Pre Alert Air',
      letterBody: 'Air pre-alert for the shipment referenced below.',
      extraGrid: [{ k: 'Layout', v: 'Pre Alert Air Report Format' }],
    }),
  cash_collection_list: () =>
    opsDoc('CASH COLLECTION REPORT LIST', {
      headerColor: 'primary',
      badge: 'Cash Collection',
      extraGrid: [{ k: 'Layout', v: 'Cash Collection Report List Report Format' }],
    }),
  closed_job_list: () =>
    opsDoc('CLOSED JOB LIST', {
      headerColor: 'accent',
      badge: 'Closed Jobs',
      extraGrid: [{ k: 'Layout', v: 'Closed Job List Report Format' }],
    }),
  job_list_summary: () =>
    opsDoc('JOB LIST SUMMARY', {
      headerColor: 'fill',
      badge: 'Job List Summary',
      extraGrid: [{ k: 'Layout', v: 'Job List Summary Report Format' }],
    }),
  payment_request_list: () =>
    opsDoc('PAYMENT REQUEST LIST', {
      headerColor: 'orange',
      badge: 'Payment Request',
      extraGrid: [{ k: 'Layout', v: 'Payment Request List Report Format' }],
    }),
  job_house_record_list_1: () =>
    opsDoc('JOB HOUSE RECORD LIST — FORMAT 1', {
      headerColor: 'cyan',
      badge: 'Job House List-1',
      extraGrid: [{ k: 'Layout', v: 'Job House Record List Report Format-1' }],
    }),
  proforma_invoice_all_charges: () =>
    opsDoc('PROFORMA INVOICE — ALL CHARGES', {
      headerColor: 'primary',
      badge: 'Proforma All Charges',
      letterBody: 'Proforma invoice covering all shipment charges.',
      extraGrid: [{ k: 'Layout', v: 'Proforma Invoice All Charges Report Format' }],
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
const outJson = path.join(root, 'src/features/reports/data/otherReportsFormatUiLayouts.json');
const outTs = path.join(root, 'src/features/reports/data/otherReportsFormatUiLayouts.generated.ts');
fs.writeFileSync(outJson, JSON.stringify(layouts, null, 2) + '\n', 'utf8');
fs.writeFileSync(
  outTs,
  `import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';\n\n` +
    `/** Auto-generated Other Reports — run: node scripts/build-other-reports-format-ui-layouts.mjs */\n` +
    `export const OTHER_REPORTS_FORMAT_UI_LAYOUTS: InvoiceFormatUiLayout[] = ${JSON.stringify(layouts, null, 2)} as InvoiceFormatUiLayout[];\n`,
  'utf8',
);
console.log(`Wrote ${layouts.length} Other Reports layouts matched to Fresa report-format PDFs`);
