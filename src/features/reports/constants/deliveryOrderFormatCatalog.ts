/**
 * Delivery Order / Delivery Note / Confirmation formats from Fresa sample PDFs.
 * Each row includes the official sample PDF URL for catalog UI links.
 */
export const FRESA_DELIVERY_ORDER_SAMPLE_BASE =
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/';

export const FRESA_REPORT_FORMAT_UPLOAD_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

export type DeliveryOrderFormatKind =
  | 'delivery_confirmation'
  | 'delivery_confirmation_osa'
  | 'delivery_order_format_17'
  | 'do_fcl_vietnam'
  | 'do_lcl_vietnam_no_stamp'
  | 'fg_delivery_note'
  | 'fg_delivery_note_format_1'
  | 'fg_delivery_note_format_uk'
  | 'fg_consignment_delivery_note'
  | 'fg_consignment_delivery_note_format_1'
  | 'fg_delivery_noc_letter'
  | 'delivery_order_format_16_house'
  | 'fg_delivery_order_abudhabi'
  | 'fg_delivery_order_air'
  | 'fg_delivery_order_air_format_1'
  | 'fg_delivery_order_air_format_2'
  | 'do_sea_format_8'
  | 'delivery_order_format_10'
  | 'fg_delivery_order_sea_format_10'
  | 'fg_delivery_order_sea_format_3'
  | 'fg_delivery_order_sea_format_5'
  | 'fg_delivery_order_sea_format_6'
  | 'fg_delivery_order_sea_format_7'
  | 'fg_delivery_order_format_8'
  | 'delivery_order_format_9'
  | 'delivery_order_format_13'
  | 'delivery_order_format_14'
  | 'delivery_order_format_15'
  | 'fg_delivery_order_format_16'
  | 'delivery_order_format_18'
  | 'fg_delivery_order_sea_format_1'
  | 'delivery_order_format_3'
  | 'fg_delivery_order_air_usa'
  | 'fg_delivery_order_for_trucker'
  | 'fg_e_delivery_order'
  | 'fg_e_delivery_order_sea_format_1'
  | 'fg_export_delivery_order'
  | 'fg_notice_of_delivery'
  | 'proof_of_delivery'
  | 'proof_of_delivery_fg'
  | 'proof_of_delivery_rpm';

export type DeliveryOrderFormatSpec = {
  code: string;
  name: string;
  kind: DeliveryOrderFormatKind;
  sortOrder: number;
  family: 'sea_docs' | 'air_docs';
  /** Fresa Gold reference PDF (dynamic branding still from tenant layout JSON). */
  samplePdfUrl: string;
};

export const DELIVERY_ORDER_FORMAT_CATALOG: DeliveryOrderFormatSpec[] = [
  {
    code: 'DELIVERY_CONFIRMATION_REPORT_FORMAT',
    name: 'Delivery Confirmation Report Format',
    kind: 'delivery_confirmation',
    sortOrder: 1,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_REPORT_FORMAT_UPLOAD_BASE}delivery-confirmation-report-format.pdf`,
  },
  {
    code: 'DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT',
    name: 'Delivery Confirmation OSA Report Format',
    kind: 'delivery_confirmation_osa',
    sortOrder: 2,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}delivery_confirmation_osa_rpm_ref_733.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_17',
    name: 'Delivery Order Report Format-17',
    kind: 'delivery_order_format_17',
    sortOrder: 3,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}delivery_order_format_17_rpm_ref_1496.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_FCL_VIETNAM',
    name: 'Delivery Order FCL Vietnam',
    kind: 'do_fcl_vietnam',
    sortOrder: 4,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}d.o_fcl_vietnam_rpm_ref_411.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_LCL_VIETNAM_WITHOUT_STAMP',
    name: 'Delivery Order LCL Vietnam Without Stamp',
    kind: 'do_lcl_vietnam_no_stamp',
    sortOrder: 5,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}d.o_lcl_vietnam_without_stamp_rpm_ref_427.pdf`,
  },
  {
    code: 'FG_DELIVERY_NOTE',
    name: 'FG Delivery Note',
    kind: 'fg_delivery_note',
    sortOrder: 6,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_note_rpm_ref_1276.pdf`,
  },
  {
    code: 'FG_DELIVERY_NOTE_FORMAT_1',
    name: 'FG Delivery Note Format-1',
    kind: 'fg_delivery_note_format_1',
    sortOrder: 7,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_note_format1_rpm_ref_1337.pdf`,
  },
  {
    code: 'FG_DELIVERY_NOTE_FORMAT_UK',
    name: 'FG Delivery Note Format UK',
    kind: 'fg_delivery_note_format_uk',
    sortOrder: 8,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_note_format_uk_rpm_ref_1305.pdf`,
  },
  {
    code: 'FG_CONSIGNMENT_DELIVERY_NOTE',
    name: 'FG Consignment Delivery Note',
    kind: 'fg_consignment_delivery_note',
    sortOrder: 9,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_consignment_delivery_note_rpm_ref_1379.pdf`,
  },
  {
    code: 'FG_CONSIGNMENT_DELIVERY_NOTE_FORMAT_1',
    name: 'FG Consignment Delivery Note Format-1',
    kind: 'fg_consignment_delivery_note_format_1',
    sortOrder: 10,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_consignment_delivery_note_format1_rpm_ref_1445.pdf`,
  },
  {
    code: 'FG_DELIVERY_NOC_LETTER',
    name: 'FG Delivery NOC Letter',
    kind: 'fg_delivery_noc_letter',
    sortOrder: 11,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_noc_letter_rpm_ref_1320.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_16',
    name: 'Delivery Order Report Format-16 (House)',
    kind: 'delivery_order_format_16_house',
    sortOrder: 12,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}delivery_order_format16_house_rpm_ref_1133.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_ABU_DHABI',
    name: 'FG Delivery Order Abu Dhabi',
    kind: 'fg_delivery_order_abudhabi',
    sortOrder: 13,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_abudhabi_rpm_ref_808.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT',
    name: 'Delivery Order AIR Jasper Report Format',
    kind: 'fg_delivery_order_air',
    sortOrder: 14,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_REPORT_FORMAT_UPLOAD_BASE}delivery-order-air-jasper-report-format.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_AIR_FORMAT_1',
    name: 'FG Delivery Order Air Format-1',
    kind: 'fg_delivery_order_air_format_1',
    sortOrder: 15,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_air_format1_rpm_ref_1179.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_AIR_FORMAT_2',
    name: 'FG Delivery Order Air Format-2',
    kind: 'fg_delivery_order_air_format_2',
    sortOrder: 16,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_air_format2_rpm_ref_1471.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_8',
    name: 'Delivery Order Report Format-8 (FG SEA)',
    kind: 'do_sea_format_8',
    sortOrder: 17,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format8_rpm_ref_940.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_10',
    name: 'Delivery Order Report Format-10',
    kind: 'delivery_order_format_10',
    sortOrder: 18,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format10_rpm_ref_835.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_SEA_FORMAT_10',
    name: 'FG Delivery Order SEA Format-10',
    kind: 'fg_delivery_order_sea_format_10',
    sortOrder: 19,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format10_rpm_ref_1395.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_SEA_FORMAT_3',
    name: 'FG Delivery Order SEA Format-3',
    kind: 'fg_delivery_order_sea_format_3',
    sortOrder: 20,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format3_rpm_ref_560.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_SEA_FORMAT_5',
    name: 'FG Delivery Order SEA Format-5',
    kind: 'fg_delivery_order_sea_format_5',
    sortOrder: 21,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format5_rpm_ref_628.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_SEA_FORMAT_6',
    name: 'FG Delivery Order SEA Format-6',
    kind: 'fg_delivery_order_sea_format_6',
    sortOrder: 22,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format6_rpm_ref_668.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_SEA_FORMAT_7',
    name: 'FG Delivery Order SEA Format-7',
    kind: 'fg_delivery_order_sea_format_7',
    sortOrder: 23,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format7_rpm_ref_755.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_FORMAT_8',
    name: 'FG Delivery Order Format-8',
    kind: 'fg_delivery_order_format_8',
    sortOrder: 24,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format8_rpm_ref_777.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_9',
    name: 'Delivery Order Report Format-9',
    kind: 'delivery_order_format_9',
    sortOrder: 25,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format9_rpm_ref_803.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_13',
    name: 'Delivery Order Report Format-13',
    kind: 'delivery_order_format_13',
    sortOrder: 26,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format13_rpm_ref_886.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_14',
    name: 'Delivery Order Report Format-14',
    kind: 'delivery_order_format_14',
    sortOrder: 27,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format14_rpm_ref_896.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_15',
    name: 'Delivery Order Report Format-15',
    kind: 'delivery_order_format_15',
    sortOrder: 28,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format15_rpm_ref_1089.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_FORMAT_16',
    name: 'FG Delivery Order Format-16',
    kind: 'fg_delivery_order_format_16',
    sortOrder: 29,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format16_rpm_ref_1306.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_18',
    name: 'Delivery Order Report Format-18',
    kind: 'delivery_order_format_18',
    sortOrder: 30,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format18_rpm_ref_1505.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_SEA_FORMAT_1',
    name: 'FG Delivery Order SEA Format-1',
    kind: 'fg_delivery_order_sea_format_1',
    sortOrder: 31,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_sea_format1_rpm_ref_538.pdf`,
  },
  {
    code: 'DELIVERY_ORDER_REPORT_FORMAT_3',
    name: 'Delivery Order Report Format-3',
    kind: 'delivery_order_format_3',
    sortOrder: 32,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_format3_rpm_ref_629.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_AIR_USA',
    name: 'FG Delivery Order Air USA',
    kind: 'fg_delivery_order_air_usa',
    sortOrder: 33,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_air_usa_rpm_ref_650.pdf`,
  },
  {
    code: 'FG_DELIVERY_ORDER_FOR_TRUCKER',
    name: 'FG Delivery Order For Trucker',
    kind: 'fg_delivery_order_for_trucker',
    sortOrder: 34,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_delivery_order_for_trucker_rpm_ref_937.pdf`,
  },
  {
    code: 'FG_E_DELIVERY_ORDER',
    name: 'FG E-Delivery Order',
    kind: 'fg_e_delivery_order',
    sortOrder: 35,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_edelivery_order_rpm_ref_837.pdf`,
  },
  {
    code: 'FG_E_DELIVERY_ORDER_SEA_FORMAT_1',
    name: 'FG E-Delivery Order SEA Format-1',
    kind: 'fg_e_delivery_order_sea_format_1',
    sortOrder: 36,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_e_delivery_order_sea_format1_rpm_ref_1147.pdf`,
  },
  {
    code: 'FG_EXPORT_DELIVERY_ORDER',
    name: 'FG Export Delivery Order',
    kind: 'fg_export_delivery_order',
    sortOrder: 37,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_export_delivery_order_rpm_ref_1209.pdf`,
  },
  {
    code: 'FG_NOTICE_OF_DELIVERY',
    name: 'FG Notice Of Delivery',
    kind: 'fg_notice_of_delivery',
    sortOrder: 38,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_notice_of_delivery_rpm_ref_905.pdf`,
  },
  {
    code: 'PROOF_OF_DELIVERY_REPORT_FORMAT',
    name: 'Proof Of Delivery Report Format',
    kind: 'proof_of_delivery',
    sortOrder: 39,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_REPORT_FORMAT_UPLOAD_BASE}proof-of-delivery-report-format.pdf`,
  },
  {
    code: 'FG_PROOF_OF_DELIVERY',
    name: 'FG Proof Of Delivery / HBL PLMAAJEA00081',
    kind: 'proof_of_delivery_fg',
    sortOrder: 40,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}fg_proof_of_delivery_rpm_ref_847.pdf`,
  },
  {
    code: 'PROOF_OF_DELIVERY_RPM_SAMPLE',
    name: 'Proof Of Delivery (RPM Sample)',
    kind: 'proof_of_delivery_rpm',
    sortOrder: 41,
    family: 'sea_docs',
    samplePdfUrl: `${FRESA_DELIVERY_ORDER_SAMPLE_BASE}proof_of_delivery_rpm_ref_275.pdf`,
  },
];

const byCode = new Map(
  DELIVERY_ORDER_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]),
);

const REGISTRY_DELIVERY_ORDER = /^DELIVERY_ORDER_REPORT_FORMAT_\d+$/;
const REGISTRY_DELIVERY_AIR = /^DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT$/;

export function isDeliveryOrderFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (!needle) return false;
  if (byCode.has(needle)) return true;
  if (needle === 'DELIVERY_CONFIRMATION_REPORT_FORMAT') return true;
  if (REGISTRY_DELIVERY_ORDER.test(needle)) return true;
  if (REGISTRY_DELIVERY_AIR.test(needle)) return true;
  return false;
}

export function getDeliveryOrderFormatSpec(code: string): DeliveryOrderFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listDeliveryOrderFormats(): DeliveryOrderFormatSpec[] {
  return DELIVERY_ORDER_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveDeliveryOrderFormatDisplayName(code: string, fallbackName: string): string {
  return getDeliveryOrderFormatSpec(code)?.name || fallbackName;
}

/** True when search tokens match at least one Delivery Order catalog row or registry code. */
export function deliveryOrderFormatsMatchSearch(searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  const catalogHit = listDeliveryOrderFormats().some((row) => {
    const hay = `${row.name} ${row.code} ${row.kind} delivery order delivery note confirmation`.toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
  if (catalogHit) return true;
  const genericHay =
    'delivery order delivery note confirmation consignment noc vietnam fg do proof trucker export notice edelivery e-delivery';
  return tokens.every((token) => genericHay.includes(token) || token.includes('deliver'));
}
