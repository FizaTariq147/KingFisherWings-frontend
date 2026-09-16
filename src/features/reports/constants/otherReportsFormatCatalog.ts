/**
 * Other Reports from Fresa official report-format PDFs (names match registry / sample page).
 */
export const FRESA_OTHER_REPORTS_FORMAT_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

export type OtherReportsFormatKind =
  | 'cargo_manifest'
  | 'container_load_plan'
  | 'freight_manifest_groupage_imports_lcl'
  | 'transshipment_list'
  | 'booking_confirmation_1'
  | 'booking_confirmation_2'
  | 'cargo_receipt_note_export_cfs'
  | 'container_outturn'
  | 'container_unload_plan'
  | 'freight_manifest_lcl_exports'
  | 'sailing_confirmation'
  | 'consol_igm_filling_letter_jasper'
  | 'container_movement_facilitation_cell_note'
  | 'exchange_letter_to_carrier_agent'
  | 'import_cargo_manifest'
  | 'import_tally_sheet'
  | 'letter_of_guarantee'
  | 'rider_sheet_export_manifest'
  | 'shipment_profit_and_loss'
  | 'shipment_status_confirmation'
  | 'truck_cargo_pickup_request'
  | 'carting_confirmation'
  | 'container_vgm_form'
  | 'fcl_quotation'
  | 'fcr_document'
  | 'import_security_filling_jasper_ams'
  | 'isf_filing_document'
  | 'loading_confirmation'
  | 'pickup_confirmation'
  | 'pre_alert_to_client'
  | 'prealert_usa_jasper'
  | 'shipping_instruction'
  | 'stuffing_report'
  | 'stuffing_report_jasper'
  | 'surrendered_letter'
  | 'terminal_departure_tdr'
  | 'daily_status_1'
  | 'daily_status_2'
  | 'job_card'
  | 'air_quotation'
  | 'air_quotation_with_airline'
  | 'air_freight_atd_confirmation'
  | 'barcode_awb'
  | 'booking_confirmation_air'
  | 'cargo_manifest_air_house'
  | 'cargo_manifest_air_jasper'
  | 'cargo_manifest_air_lc_jasper'
  | 'shipment_freight_manifest'
  | 'air_shipment_profit_and_loss'
  | 'air_shipment_profit_and_loss_1'
  | 'job_house_record_list'
  | 'mawb_draft'
  | 'mawb_original_preprinted_kc'
  | 'pre_alert_air'
  | 'cash_collection_list'
  | 'closed_job_list'
  | 'job_list_summary'
  | 'payment_request_list'
  | 'job_house_record_list_1'
  | 'proforma_invoice_all_charges';

export type OtherReportsFormatSpec = {
  code: string;
  name: string;
  kind: OtherReportsFormatKind;
  sortOrder: number;
  family: 'sea_docs' | 'air_docs' | 'other' | 'quotation' | 'ops_list' | 'commercial';
  samplePdfUrl: string;
  /** Registry context — default job */
  contexts?: Array<'job' | 'quotation' | 'list' | 'invoice'>;
};

export const OTHER_REPORTS_FORMAT_CATALOG: OtherReportsFormatSpec[] = [
  {
    code: 'CARGO_MANIFEST_REPORT_FORMAT',
    name: 'Cargo Manifest Report Format',
    kind: 'cargo_manifest',
    sortOrder: 1,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}cargo-manifest-report-format.pdf`,
  },
  {
    code: 'CONTAINER_LOAD_PLAN_REPORT_FORMAT',
    name: 'Container Load Plan Report Format',
    kind: 'container_load_plan',
    sortOrder: 2,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}container-load-plan-report%20format.pdf`,
  },
  {
    code: 'FREIGHT_MANIFEST_FOR_GROUPAGE_IMPORTS_LCL_REPORT_FORMAT',
    name: 'Freight Manifest For Groupage Imports LCL Report Format',
    kind: 'freight_manifest_groupage_imports_lcl',
    sortOrder: 3,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}freight-manifest-for-groupage-imports-lcl-report%20format.pdf`,
  },
  {
    code: 'TRANSSHIPMENT_LIST_REPORT_FORMAT',
    name: 'Transshipment List Report Format',
    kind: 'transshipment_list',
    sortOrder: 4,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}transshipment-list-report-format.pdf`,
  },
  {
    code: 'BOOKING_CONFIRMATION_REPORT_FORMAT_1',
    name: 'Booking Confirmation Report Format-1',
    kind: 'booking_confirmation_1',
    sortOrder: 5,
    family: 'other',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}booking-confirmation-report-format-1-booking-confirmation.pdf`,
  },
  {
    code: 'BOOKING_CONFIRMATION_REPORT_FORMAT_2',
    name: 'Booking Confirmation Report Format-2',
    kind: 'booking_confirmation_2',
    sortOrder: 6,
    family: 'other',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}booking-confirmation-report-format-2-booking-confirmation.pdf`,
  },
  {
    code: 'CARGO_RECEIPT_NOTE_FOR_EXPORT_CFS_REPORT_FORMAT',
    name: 'Cargo Receipt Note For Export CFS Report Format',
    kind: 'cargo_receipt_note_export_cfs',
    sortOrder: 7,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}cargo-receipt-note-for-export-cfs-report-format.pdf`,
  },
  {
    code: 'CONTAINER_OUTTURN_REPORT_FORMAT',
    name: 'Container Outturn Report Format',
    kind: 'container_outturn',
    sortOrder: 8,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}container-outturn-report-format.pdf`,
  },
  {
    code: 'CONTAINER_UNLOAD_PLAN_REPORT_FORMAT',
    name: 'Container Unload Plan Report Format',
    kind: 'container_unload_plan',
    sortOrder: 9,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}container-unload-plan-report-format.pdf`,
  },
  {
    code: 'FREIGHT_MANIFEST_LCL_EXPORTS_REPORT_FORMAT',
    name: 'Freight Manifest LCL Exports Report Format',
    kind: 'freight_manifest_lcl_exports',
    sortOrder: 10,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}freight-manifest-lcl-exports-report-format.pdf`,
  },
  {
    code: 'SAILING_CONFIRMATION_REPORT_FORMAT',
    name: 'Sailing Confirmation Report Format',
    kind: 'sailing_confirmation',
    sortOrder: 11,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}sailing-confirmation-report-format.pdf`,
  },
  {
    code: 'CONSOL_IGM_FILLING_LETTER_JASPER_REPORT_FORMAT',
    name: 'Consol IGM Filling Letter Jasper Report Format',
    kind: 'consol_igm_filling_letter_jasper',
    sortOrder: 12,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}consol-igm-filling-letter-jasper-report-format.pdf`,
  },
  {
    code: 'CONTAINER_MOVEMENT_FACILITATION_CELL_NOTE_REPORT_FORMAT',
    name: 'Container Movement Facilitation Cell Note Report Format',
    kind: 'container_movement_facilitation_cell_note',
    sortOrder: 13,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}container-movement-facilitation-cell-note-report-format.pdf`,
  },
  {
    code: 'EXCHANGE_LETTER_TO_CARRIER_AGENT_REPORT_FORMAT',
    name: 'Exchange Letter To Carrier Agent Report Format',
    kind: 'exchange_letter_to_carrier_agent',
    sortOrder: 14,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}exchange-letter-to-carrier-agent-report-format.pdf`,
  },
  {
    code: 'IMPORT_CARGO_MANIFEST_REPORT_FORMAT',
    name: 'Import Cargo Manifest Report Format',
    kind: 'import_cargo_manifest',
    sortOrder: 15,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}import-cargo-manifest-report-format.pdf`,
  },
  {
    code: 'IMPORT_TALLY_SHEET_REPORT_FORMAT',
    name: 'Import Tally Sheet Report Format',
    kind: 'import_tally_sheet',
    sortOrder: 16,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}import-tally-sheet-report-format.pdf`,
  },
  {
    code: 'LETTER_OF_GUARANTEE_REPORT_FORMAT',
    name: 'Letter OF Guarantee Report Format',
    kind: 'letter_of_guarantee',
    sortOrder: 17,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}letter-of-guarantee-report-format.pdf`,
  },
  {
    code: 'RIDER_SHEET_FOR_EXPORT_MANIFEST_REPORT_FORMAT',
    name: 'Rider Sheet For Export Manifest Report Format',
    kind: 'rider_sheet_export_manifest',
    sortOrder: 18,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}rider-sheet-for-export-manifest-report-format.pdf`,
  },
  {
    code: 'SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT',
    name: 'Shipment Profit And Loss Report Format',
    kind: 'shipment_profit_and_loss',
    sortOrder: 19,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}shipment-profit-and-loss-report-format.pdf`,
  },
  {
    code: 'SHIPMENT_STATUS_CONFIRMATION_REPORT_FORMAT',
    name: 'Shipment Status Confirmation Report Format',
    kind: 'shipment_status_confirmation',
    sortOrder: 20,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}shipment-status-confirmation-report-format.pdf`,
  },
  {
    code: 'TRUCK_CARGO_PICKUP_REQUEST_REPORT_FORMAT',
    name: 'Truck Cargo Pickup Request Report Format',
    kind: 'truck_cargo_pickup_request',
    sortOrder: 21,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}truck-cargo-pickup-request-report-format.pdf`,
  },
  {
    code: 'CARTING_CONFIRMATION_REPORT_FORMAT',
    name: 'Carting Confirmation Report Format',
    kind: 'carting_confirmation',
    sortOrder: 22,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}carting-confirmation-report-format.pdf`,
  },
  {
    code: 'CONTAINER_VGM_FORM_REPORT_FORMAT',
    name: 'Container VGM Form Report Format',
    kind: 'container_vgm_form',
    sortOrder: 23,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}container-vgm-form-report-format.pdf`,
  },
  {
    code: 'FCL_QUOTATION_REPORT_FORMAT',
    name: 'FCL Quotation Report Format',
    kind: 'fcl_quotation',
    sortOrder: 24,
    family: 'quotation',
    contexts: ['quotation'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}fcl-quotation-report-format.pdf`,
  },
  {
    code: 'FCR_DOCUMENT_REPORT_FORMAT',
    name: 'FCR Document Report Format',
    kind: 'fcr_document',
    sortOrder: 25,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}fcr-document-report-format.pdf`,
  },
  {
    code: 'IMPORT_SECURITY_FILLING_JASPER_AMS_REPORT_FORMAT',
    name: 'Import Security Filling Jasper AMS Report Format',
    kind: 'import_security_filling_jasper_ams',
    sortOrder: 26,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}import-security-filling-jasper-ams-report-format.pdf`,
  },
  {
    code: 'ISF_FILING_DOCUMENT_REPORT_FORMAT',
    name: 'ISF Filing Document Report Format',
    kind: 'isf_filing_document',
    sortOrder: 27,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}isf-filing-document-report-format.pdf`,
  },
  {
    code: 'LOADING_CONFIRMATION_REPORT_FORMAT',
    name: 'Loading Confirmation Report Format',
    kind: 'loading_confirmation',
    sortOrder: 28,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}loading-confirmation-report-format.pdf`,
  },
  {
    code: 'PICKUP_CONFIRMATION_REPORT_FORMAT',
    name: 'Pickup Confirmation Report Format',
    kind: 'pickup_confirmation',
    sortOrder: 29,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}pickup-confirmation-report-format.pdf`,
  },
  {
    code: 'PRE_ALERT_TO_CLIENT_REPORT_FORMAT',
    name: 'Pre Alert To Client Report Format',
    kind: 'pre_alert_to_client',
    sortOrder: 30,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}pre-alert-to-client-report-format.pdf`,
  },
  {
    code: 'PREALERT_USA_JASPER_REPORT_FORMAT',
    name: 'Prealert USA Jasper Report Format',
    kind: 'prealert_usa_jasper',
    sortOrder: 31,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}prealert-usa-jasper-report-format.pdf`,
  },
  {
    code: 'SHIPPING_INSTRUCTION_REPORT_FORMAT',
    name: 'Shipping Instruction Report Format',
    kind: 'shipping_instruction',
    sortOrder: 32,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}shipping-instruction-report-format.pdf`,
  },
  {
    code: 'STUFFING_REPORT_FORMAT',
    name: 'Stuffing Report Format',
    kind: 'stuffing_report',
    sortOrder: 33,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}stuffing-report-format.pdf`,
  },
  {
    code: 'STUFFING_REPORT_JASPER_REPORT_FORMAT',
    name: 'Stuffing Report Jasper Report Format',
    kind: 'stuffing_report_jasper',
    sortOrder: 34,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}stuffing-report-jasper-report-format.pdf`,
  },
  {
    code: 'SURRENDERED_LETTER_REPORT_FORMAT',
    name: 'Surrendered Letter Report Format',
    kind: 'surrendered_letter',
    sortOrder: 35,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}surrendered-letter-report-format.pdf`,
  },
  {
    code: 'TERMINAL_DEPARTURE_REPORT_TDR_REPORT_FORMAT',
    name: 'Terminal Departure Report (TDR) Report Format',
    kind: 'terminal_departure_tdr',
    sortOrder: 36,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}terminal-departure-report-(tdr)-report-format.pdf`,
  },
  {
    code: 'DAILY_STATUS_REPORT_FORMAT_1',
    name: 'Daily Status Report Format-1',
    kind: 'daily_status_1',
    sortOrder: 37,
    family: 'ops_list',
    contexts: ['list', 'job'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}daily-status-report-format-1.pdf`,
  },
  {
    code: 'DAILY_STATUS_REPORT_FORMAT_2',
    name: 'Daily Status Report Format-2',
    kind: 'daily_status_2',
    sortOrder: 38,
    family: 'ops_list',
    contexts: ['list', 'job'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}daily-status-report-format-2.pdf`,
  },
  {
    code: 'JOB_CARD_REPORT_FORMAT',
    name: 'Job Card Report Format',
    kind: 'job_card',
    sortOrder: 39,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}job-card-report-format.pdf`,
  },
  {
    code: 'AIR_QUOTATION_REPORT_FORMAT',
    name: 'Air Quotation Report Format',
    kind: 'air_quotation',
    sortOrder: 40,
    family: 'quotation',
    contexts: ['quotation'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}air-quotation-report-format.pdf`,
  },
  {
    code: 'AIR_QUOTATION_WITH_AIRLINE_REPORT_FORMAT',
    name: 'Air Quotation With Airline Report Format',
    kind: 'air_quotation_with_airline',
    sortOrder: 41,
    family: 'quotation',
    contexts: ['quotation'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}air-quotation-with-airline-report-format.pdf`,
  },
  {
    code: 'AIR_FREIGHT_ATD_CONFIRMATION_REPORT_FORMAT',
    name: 'Air Freight ATD Confirmation Report Format',
    kind: 'air_freight_atd_confirmation',
    sortOrder: 42,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}air-freight-atd-confirmation-report-format.pdf`,
  },
  {
    code: 'BARCODE_AWB_REPORT_FORMAT',
    name: 'Barcode AWB Report Format',
    kind: 'barcode_awb',
    sortOrder: 43,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}barcode-awb-report-format.pdf`,
  },
  {
    code: 'BOOKING_CONFIRMATION_AIR_REPORT_FORMAT',
    name: 'Booking Confirmation Air Report Format',
    kind: 'booking_confirmation_air',
    sortOrder: 44,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}booking-confirmation-air-report-format.pdf`,
  },
  {
    code: 'CARGO_MANIFEST_AIR_HOUSE_REPORT_FORMAT',
    name: 'Cargo Manifest Air House Report Format',
    kind: 'cargo_manifest_air_house',
    sortOrder: 45,
    family: 'air_docs',
    // Fresa filename typo retained: "fomat"
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}cargo-manifest-air-house-report-fomat.pdf`,
  },
  {
    code: 'CARGO_MANIFEST_AIR_JASPER_REPORT_FORMAT',
    name: 'Cargo Manifest Air Jasper Report format',
    kind: 'cargo_manifest_air_jasper',
    sortOrder: 46,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}cargo-manifest-air-jasper-report-format.pdf`,
  },
  {
    code: 'CARGO_MANIFEST_AIR_LC_JASPER_REPORT_FORMAT',
    name: 'Cargo Manifest Air LC Jasper Report Format',
    kind: 'cargo_manifest_air_lc_jasper',
    sortOrder: 47,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}cargo-manifest-air-lc-jasper-report-format.pdf`,
  },
  {
    code: 'SHIPMENT_FREIGHT_MANIFEST_REPORT_FORMAT',
    name: 'Shipment Freight Manifest Report Format',
    kind: 'shipment_freight_manifest',
    sortOrder: 48,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}shipment-freight-manifest-report-format.pdf`,
  },
  {
    code: 'AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT',
    name: 'Air Shipment Profit And Loss Report Format',
    kind: 'air_shipment_profit_and_loss',
    sortOrder: 49,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}air-shipment-profit-and-loss-report-format.pdf`,
  },
  {
    code: 'AIR_SHIPMENT_PROFIT_AND_LOSS_REPORT_FORMAT_1',
    name: 'Air Shipment Profit And Loss Report Format-1',
    kind: 'air_shipment_profit_and_loss_1',
    sortOrder: 50,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}air-shipment-profit-and-loss-report-format-1.pdf`,
  },
  {
    code: 'JOB_HOUSE_RECORD_LIST_REPORT_FORMAT',
    name: 'Job House Record List Report Format',
    kind: 'job_house_record_list',
    sortOrder: 51,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}job-house-record-list-report-format.pdf`,
  },
  {
    code: 'MAWB_DRAFT_REPORT_FORMAT',
    name: 'MAWB Draft Report Format',
    kind: 'mawb_draft',
    sortOrder: 52,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}mawb-draft-report-format.pdf`,
  },
  {
    code: 'MAWB_ORIGINAL_PREPRINTED_KC_REPORT_FORMAT',
    name: 'MAWB Original Preprinted KC Report Format',
    kind: 'mawb_original_preprinted_kc',
    sortOrder: 53,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}mawb-original-preprinted-kc-report-format.pdf`,
  },
  {
    code: 'PRE_ALERT_AIR_REPORT_FORMAT',
    name: 'Pre Alert Air Report Format',
    kind: 'pre_alert_air',
    sortOrder: 54,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}pre-alert-air-report-format.pdf`,
  },
  {
    code: 'CASH_COLLECTION_REPORT_LIST_REPORT_FORMAT',
    name: 'Cash Collection Report List Report Format',
    kind: 'cash_collection_list',
    sortOrder: 55,
    family: 'ops_list',
    contexts: ['list', 'job'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}cash-collection-report-list-report-format.xlsx`,
  },
  {
    code: 'CLOSED_JOB_LIST_REPORT_FORMAT',
    name: 'Closed Job List Report Format',
    kind: 'closed_job_list',
    sortOrder: 56,
    family: 'ops_list',
    contexts: ['list', 'job'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}closed-job-list-report-format.xlsx`,
  },
  {
    code: 'JOB_LIST_SUMMARY_REPORT_FORMAT',
    name: 'Job List Summary Report Format',
    kind: 'job_list_summary',
    sortOrder: 57,
    family: 'ops_list',
    contexts: ['list', 'job'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}job-list-summary-report-format.xlsx`,
  },
  {
    code: 'PAYMENT_REQUEST_LIST_REPORT_FORMAT',
    name: 'Payment Request List Report Format',
    kind: 'payment_request_list',
    sortOrder: 58,
    family: 'ops_list',
    contexts: ['list', 'job'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}payment-request-list-report-format.xlsx`,
  },
  {
    code: 'JOB_HOUSE_RECORD_LIST_REPORT_FORMAT_1',
    name: 'Job House Record List Report Format-1',
    kind: 'job_house_record_list_1',
    sortOrder: 59,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}mawb-draft-report-format-1.pdf`,
  },
  {
    code: 'PROFORMA_INVOICE_ALL_CHARGES_REPORT_FORMAT',
    name: 'Proforma Invoice All Charges Report Format',
    kind: 'proforma_invoice_all_charges',
    sortOrder: 60,
    family: 'commercial',
    contexts: ['invoice'],
    samplePdfUrl: `${FRESA_OTHER_REPORTS_FORMAT_BASE}proforma-invoice-all-charges-report-format.pdf`,
  },
];

const byCode = new Map(OTHER_REPORTS_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

const CATALOG_CODES = new Set(OTHER_REPORTS_FORMAT_CATALOG.map((row) => row.code.toUpperCase()));

export function isOtherReportsFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (!needle) return false;
  if (CATALOG_CODES.has(needle)) return true;
  if (/^BOOKING_CONFIRMATION_REPORT_FORMAT_\d+$/.test(needle)) return true;
  if (/^DAILY_STATUS_REPORT_FORMAT_\d+$/.test(needle)) return true;
  if (/^MAWB_DRAFT_REPORT_FORMAT(_\d+)?$/.test(needle)) return true;
  return false;
}

export function getOtherReportsFormatSpec(code: string): OtherReportsFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listOtherReportsFormats(): OtherReportsFormatSpec[] {
  return OTHER_REPORTS_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveOtherReportsFormatDisplayName(code: string, fallbackName: string): string {
  return getOtherReportsFormatSpec(code)?.name || fallbackName;
}

export function otherReportsFormatsMatchSearch(searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  const catalogHit = listOtherReportsFormats().some((row) => {
    const hay =
      `${row.name} ${row.code} ${row.kind} other reports manifest booking sailing igm outturn`.toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
  if (catalogHit) return true;
  const genericHay =
    'other reports cargo manifest container load plan freight groupage transshipment booking confirmation receipt outturn unload sailing consol igm import tally guarantee rider profit loss status truck carting vgm fcl quotation fcr exchange letter movement facilitation isf ams loading pickup pre alert prealert stuffing surrendered tdr daily job card air airline shipping instruction atd barcode awb mawb house jasper shipment';
  return tokens.every((token) => genericHay.includes(token));
}
