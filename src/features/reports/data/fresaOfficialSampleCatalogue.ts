/**
 * Official Fresa Sample Report Formats — reference catalogue.
 * Source: https://fresatechnologies.com/sample-report-formats/
 *
 * Catalogue entry counts are not unique layout counts. Only rows with
 * verificationStatus `url_verified` have a confirmed direct PDF URL.
 * Do not invent JSON layouts from listed entry totals.
 */

export type FresaOfficialSampleSection =
  | 'invoice'
  | 'accounts'
  | 'arrival_notice'
  | 'hbl'
  | 'hawb'
  | 'delivery_order'
  | 'wms_asn'
  | 'other';

export type FresaSampleVerificationStatus =
  | 'url_verified'
  | 'pending_url_extraction'
  | 'catalogue_entry_only';

export type FresaOfficialSampleEntry = {
  section: FresaOfficialSampleSection;
  fresaName: string;
  samplePdfUrl: string | null;
  verificationStatus: FresaSampleVerificationStatus;
  /** PDF page count when inspected; null until verified (do not invent). */
  pageCount: number | null;
  freightnestCode?: string | null;
  notes?: string;
};

export type FresaOfficialSectionMeta = {
  section: FresaOfficialSampleSection;
  listedEntryCount: number;
  verificationStatus: FresaSampleVerificationStatus;
  notes?: string;
};

const HAWB_BASE = 'https://fresatechnologies.com/wp-content/uploads/report-formats/';
const WMS_BASE = 'https://fresatechnologies.com/wp-content/uploads/2020/03/';
const DO_BASE =
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/';

/** Section totals from the official catalogue page (entries, not unique designs). */
export const FRESA_OFFICIAL_SECTION_META: FresaOfficialSectionMeta[] = [
  {
    section: 'invoice',
    listedEntryCount: 116,
    verificationStatus: 'pending_url_extraction',
    notes: 'Direct PDF URLs not yet extracted',
  },
  {
    section: 'accounts',
    listedEntryCount: 27,
    verificationStatus: 'pending_url_extraction',
    notes: 'Direct PDF URLs not yet extracted',
  },
  {
    section: 'arrival_notice',
    listedEntryCount: 35,
    verificationStatus: 'pending_url_extraction',
    notes: 'Direct PDF URLs not yet extracted',
  },
  {
    section: 'hbl',
    listedEntryCount: 113,
    verificationStatus: 'pending_url_extraction',
    notes: 'Many FE HBL codes already have samplePdfUrl in hblFormatCatalog — pending full page reconcile',
  },
  {
    section: 'hawb',
    listedEntryCount: 5,
    verificationStatus: 'url_verified',
    notes: 'All 5 catalogue entries have verified direct PDFs',
  },
  {
    section: 'delivery_order',
    listedEntryCount: 43,
    verificationStatus: 'url_verified',
    notes: '40 direct PDFs verified; 3 cross-listed catalogue entries bring total to 43',
  },
  {
    section: 'wms_asn',
    listedEntryCount: 5,
    verificationStatus: 'url_verified',
    notes: 'All 5 ASN catalogue entries have verified direct PDFs',
  },
  {
    section: 'other',
    listedEntryCount: 57,
    verificationStatus: 'pending_url_extraction',
    notes: 'Direct PDF URLs not yet extracted',
  },
];

/** HAWB — 5 verified PDFs */
const HAWB_ENTRIES: FresaOfficialSampleEntry[] = [
  {
    section: 'hawb',
    fresaName: 'HAWB Draft Report Format',
    samplePdfUrl: `${HAWB_BASE}hawb-draft-report-format.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'HAWB_DRAFT_REPORT_FORMAT',
  },
  {
    section: 'hawb',
    fresaName: 'HAWB Draft Report Format 1',
    samplePdfUrl: `${HAWB_BASE}hawb-draft-report-format-1.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'HAWB_DRAFT_REPORT_FORMAT_1',
  },
  {
    section: 'hawb',
    fresaName: 'HAWB Draft Report Format 2',
    samplePdfUrl: `${HAWB_BASE}hawb-draft-report-format-2.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'HAWB_DRAFT_REPORT_FORMAT_2',
  },
  {
    section: 'hawb',
    fresaName: 'HAWB Original Pre Printed Report Format 1',
    samplePdfUrl: `${HAWB_BASE}hawb-original-pre-printed-report-format-1.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  },
  {
    section: 'hawb',
    fresaName: 'HAWB Original Pre Printed Report Format 2',
    samplePdfUrl: `${HAWB_BASE}hawb-original-pre-printed-report-format-2.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
  },
];

/** WMS / ASN — 5 verified PDFs */
const WMS_ENTRIES: FresaOfficialSampleEntry[] = [
  {
    section: 'wms_asn',
    fresaName: 'Advance Shipping Note Format 1',
    samplePdfUrl: `${WMS_BASE}ADVANCE-SHIPPING-NOTE-FORMAT1.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'ADVANCE_SHIPPING_NOTE_FORMAT_1',
  },
  {
    section: 'wms_asn',
    fresaName: 'Advance Shipping Note',
    samplePdfUrl: `${WMS_BASE}ADVANCE_SHIPPING_NOTE.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'ADVANCE_SHIPPING_NOTE',
  },
  {
    section: 'wms_asn',
    fresaName: 'Advance Shipping Note Location Wise',
    samplePdfUrl: `${WMS_BASE}ADVANCE_SHIPPING_NOTE_LOCATION_WISE.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'ADVANCE_SHIPPING_NOTE_LOCATION_WISE',
  },
  {
    section: 'wms_asn',
    fresaName: 'Advance Shipping Note Location Wise 1',
    samplePdfUrl: `${WMS_BASE}ADVANCE_SHIPPING_NOTE_LOCATION_WISE_.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'ADVANCE_SHIPPING_NOTE_LOCATION_WISE_2',
    notes: 'Mapped to Freightnest code ADVANCE_SHIPPING_NOTE_LOCATION_WISE_2 (trailing underscore filename)',
  },
  {
    section: 'wms_asn',
    fresaName: 'Advance Shipping Note Location Summary',
    samplePdfUrl: `${WMS_BASE}ADVANCE_SHIPPING_NOTE_SUMMARY.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'ADVANCE_SHIPPING_NOTE_SUMMARY',
  },
];

/** Delivery Order — 40 verified direct PDFs */
const DO_ENTRIES: FresaOfficialSampleEntry[] = [
  {
    section: 'delivery_order',
    fresaName: 'Collection/Delivery Note Jasper UK',
    samplePdfUrl: `${DO_BASE}fg_delivery_note_format_uk_rpm_ref_1305.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_NOTE_FORMAT_UK',
  },
  {
    section: 'delivery_order',
    fresaName: 'Consignment Delivery Note',
    samplePdfUrl: `${DO_BASE}fg_consignment_delivery_note_rpm_ref_1379.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_CONSIGNMENT_DELIVERY_NOTE',
  },
  {
    section: 'delivery_order',
    fresaName: 'Consignment Delivery Note Format 1',
    samplePdfUrl: `${DO_BASE}fg_consignment_delivery_note_format1_rpm_ref_1445.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_CONSIGNMENT_DELIVERY_NOTE_FORMAT_1',
  },
  {
    section: 'delivery_order',
    fresaName: 'D.O FCL Vietnam',
    samplePdfUrl: `${DO_BASE}d.o_fcl_vietnam_rpm_ref_411.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_FCL_VIETNAM',
  },
  {
    section: 'delivery_order',
    fresaName: 'D.O LCL Vietnam without Stamp',
    samplePdfUrl: `${DO_BASE}d.o_lcl_vietnam_without_stamp_rpm_ref_427.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_LCL_VIETNAM_WITHOUT_STAMP',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Confirmation',
    samplePdfUrl: `${DO_BASE}delivery_confirmation_rpm_ref_153.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_CONFIRMATION_REPORT_FORMAT',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Confirmation OSA',
    samplePdfUrl: `${DO_BASE}delivery_confirmation_osa_rpm_ref_733.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_CONFIRMATION_OSA_REPORT_FORMAT',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery NOC Letter Jasper',
    samplePdfUrl: `${DO_BASE}fg_delivery_noc_letter_rpm_ref_1320.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_NOC_LETTER',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Note Format 1 Jasper',
    samplePdfUrl: `${DO_BASE}fg_delivery_note_format1_rpm_ref_1337.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_NOTE_FORMAT_1',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Note Jasper',
    samplePdfUrl: `${DO_BASE}fg_delivery_note_rpm_ref_1276.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_NOTE',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Format 17',
    samplePdfUrl: `${DO_BASE}delivery_order_format_17_rpm_ref_1496.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_17',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Format 16',
    samplePdfUrl: `${DO_BASE}delivery_order_format16_house_rpm_ref_1133.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_16',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Abu Dhabi Jasper',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_abudhabi_rpm_ref_808.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_ABU_DHABI',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Air Jasper',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_air_rpm_ref_377.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_AIR_JASPER_REPORT_FORMAT',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Air Jasper Format 1',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_air_format1_rpm_ref_1179.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_AIR_FORMAT_1',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Air Jasper Format 2',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_air_format2_rpm_ref_1471.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_AIR_FORMAT_2',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper SEA Format 8',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format8_rpm_ref_940.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_8',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Courier',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format10_rpm_ref_835.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_10',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 10',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format10_rpm_ref_1395.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_SEA_FORMAT_10',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 3',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format3_rpm_ref_560.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_SEA_FORMAT_3',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 5',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format5_rpm_ref_628.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_SEA_FORMAT_5',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 6',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format6_rpm_ref_668.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_SEA_FORMAT_6',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 7',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format7_rpm_ref_755.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_SEA_FORMAT_7',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 8',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format8_rpm_ref_777.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_FORMAT_8',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 9',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format9_rpm_ref_803.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_9',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 13 USA',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format13_rpm_ref_886.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_13',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 14 USA',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format14_rpm_ref_896.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_14',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 15',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format15_rpm_ref_1089.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_15',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 16 US',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format16_rpm_ref_1306.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_FORMAT_16',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Jasper Format 18',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format18_rpm_ref_1505.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_18',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order Sea Jasper Format 1',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_sea_format1_rpm_ref_538.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_SEA_FORMAT_1',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order USA Jasper Format 2',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_format3_rpm_ref_629.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'DELIVERY_ORDER_REPORT_FORMAT_3',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order USA Air Jasper',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_air_usa_rpm_ref_650.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_AIR_USA',
  },
  {
    section: 'delivery_order',
    fresaName: 'Delivery Order for Trucker',
    samplePdfUrl: `${DO_BASE}fg_delivery_order_for_trucker_rpm_ref_937.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_DELIVERY_ORDER_FOR_TRUCKER',
  },
  {
    section: 'delivery_order',
    fresaName: 'E-Delivery Order Jasper',
    samplePdfUrl: `${DO_BASE}fg_edelivery_order_rpm_ref_837.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_E_DELIVERY_ORDER',
  },
  {
    section: 'delivery_order',
    fresaName: 'Electronic Delivery Order Jasper Format 1',
    samplePdfUrl: `${DO_BASE}fg_e_delivery_order_sea_format1_rpm_ref_1147.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_E_DELIVERY_ORDER_SEA_FORMAT_1',
  },
  {
    section: 'delivery_order',
    fresaName: 'Export Delivery Order Jasper',
    samplePdfUrl: `${DO_BASE}fg_export_delivery_order_rpm_ref_1209.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_EXPORT_DELIVERY_ORDER',
  },
  {
    section: 'delivery_order',
    fresaName: 'Notice of Delivery Jasper',
    samplePdfUrl: `${DO_BASE}fg_notice_of_delivery_rpm_ref_905.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_NOTICE_OF_DELIVERY',
  },
  {
    section: 'delivery_order',
    fresaName: 'Proof of Delivery',
    samplePdfUrl: `${DO_BASE}proof_of_delivery_rpm_ref_275.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'PROOF_OF_DELIVERY_REPORT_FORMAT',
    notes: 'Also mirrored as PROOF_OF_DELIVERY_RPM_SAMPLE in FE catalog',
  },
  {
    section: 'delivery_order',
    fresaName: 'Proof of Delivery Jasper Arabic',
    samplePdfUrl: `${DO_BASE}fg_proof_of_delivery_rpm_ref_847.pdf`,
    verificationStatus: 'url_verified',
    pageCount: null,
    freightnestCode: 'FG_PROOF_OF_DELIVERY',
  },
];

export const FRESA_OFFICIAL_SAMPLE_ENTRIES: FresaOfficialSampleEntry[] = [
  ...HAWB_ENTRIES,
  ...WMS_ENTRIES,
  ...DO_ENTRIES,
];

const byCode = new Map<string, FresaOfficialSampleEntry>();
for (const row of FRESA_OFFICIAL_SAMPLE_ENTRIES) {
  if (row.freightnestCode) {
    byCode.set(row.freightnestCode.toUpperCase(), row);
  }
}

export function listFresaOfficialSamples(
  section?: FresaOfficialSampleSection,
): FresaOfficialSampleEntry[] {
  if (!section) return FRESA_OFFICIAL_SAMPLE_ENTRIES.slice();
  return FRESA_OFFICIAL_SAMPLE_ENTRIES.filter((r) => r.section === section);
}

export function getFresaOfficialSampleByCode(
  code: string,
): FresaOfficialSampleEntry | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listUrlVerifiedFresaSamples(): FresaOfficialSampleEntry[] {
  return FRESA_OFFICIAL_SAMPLE_ENTRIES.filter((r) => r.verificationStatus === 'url_verified');
}

export function summarizeFresaOfficialCatalogue() {
  const listedTotal = FRESA_OFFICIAL_SECTION_META.reduce(
    (sum, s) => sum + s.listedEntryCount,
    0,
  );
  const urlVerified = listUrlVerifiedFresaSamples().length;
  const bySection: Record<string, { listed: number; urlVerified: number; status: string }> = {};
  for (const meta of FRESA_OFFICIAL_SECTION_META) {
    bySection[meta.section] = {
      listed: meta.listedEntryCount,
      urlVerified: listFresaOfficialSamples(meta.section).filter(
        (r) => r.verificationStatus === 'url_verified',
      ).length,
      status: meta.verificationStatus,
    };
  }
  return {
    listedTotal,
    urlVerifiedDirectPdfs: urlVerified,
    pendingListedEntries: listedTotal - urlVerified,
    bySection,
    note: 'listedTotal is catalogue entries, not unique layout designs',
  };
}
