/**
 * Official Fresa HBL catalogue — 113 entries.
 * Source: https://fresatechnologies.com/sample-report-formats/
 * + FG Jasper CDN samples (positions 1–95) and legacy Sea-column drafts (96–113).
 *
 * Shared by build-hbl-format-ui-layouts.mjs and used to keep catalog codes/URLs in sync.
 */

export const FRESA_HBL_SAMPLE_BASE =
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/';

export const FRESA_HBL_UPLOAD_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

/** RPM refs from official Jasper PDF filenames. */
export const JASPER_RPM_REF = {
  14: 505,
  16: 556,
  20: 613,
  23: 631,
  25: 643,
  26: 653,
  27: 655,
  29: 660,
  33: 684,
  36: 703,
  40: 717,
  41: 721,
  42: 745,
  43: 754,
  44: 771,
  45: 776,
  46: 781,
  47: 785,
  48: 786,
  49: 787,
  50: 789,
  51: 790,
  52: 804,
  53: 819,
  54: 821,
  55: 824,
  56: 838,
  59: 872,
  60: 881,
  61: 887,
  63: 895,
  64: 909,
  65: 913,
  67: 915,
  66: 916,
  68: 924,
  69: 931,
  70: 933,
  72: 943,
  73: 956,
  75: 962,
  77: 1225,
  83: 1001,
  84: 1019,
  85: 1020,
  86: 1022,
  87: 1025,
  88: 1026,
  89: 1027,
  90: 1035,
  92: 1039,
  95: 1076,
  96: 1077,
  97: 1079,
  99: 1081,
  100: 1085,
  101: 1086,
  102: 1092,
  107: 1137,
  109: 1156,
  114: 1181,
  116: 1198,
  117: 1202,
  118: 1203,
  120: 1211,
  122: 1221,
  127: 1251,
  128: 1257,
  129: 1259,
  130: 1261,
  132: 1280,
  134: 1287,
  135: 1291,
  136: 1293,
  137: 1317,
  138: 1321,
  139: 1324,
  140: 1326,
  141: 1327,
  142: 1339,
  143: 1341,
  144: 1353,
  145: 1354,
  146: 1358,
  147: 1359,
  148: 1361,
  149: 1365,
  151: 1380,
  172: 1489,
  171: 1491,
};

/**
 * Shell variants from sampled official PDFs (not every number is unique visually).
 * combined | jasper | multimodal | mt | ocean
 */
export const VARIANT_BY_CODE = {
  FG_HBL_HKG: 'jasper',
  FG_HBL_FORMAT_1: 'combined',
  FG_HBL_FORMAT_10: 'jasper',
  FG_HBL_MAGICLOGISYS: 'mt',
  FG_HBL_FORMAT_14: 'multimodal',
  FG_HBL_FORMAT_16: 'multimodal',
  FG_HBL_FORMAT_20: 'ocean',
  FG_HBL_ORIGINAL_FORMAT_87: 'combined',
  HBL_DRAFT_REPORT_FORMAT_23: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_29: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_33: 'combined',
  HBL_DRAFT_REPORT_FORMAT_36: 'mt',
  HBL_DRAFT_REPORT_FORMAT_40: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_43: 'ocean',
  HBL_DRAFT_REPORT_FORMAT_50: 'combined',
  HBL_DRAFT_REPORT_FORMAT_70: 'mt',
  HBL_DRAFT_REPORT_FORMAT_87: 'combined',
  HBL_DRAFT_REPORT_FORMAT_100: 'combined',
  HBL_DRAFT_REPORT_FORMAT_140: 'jasper',
  HBL_DRAFT_REPORT_FORMAT_171: 'multimodal',
  // Legacy Sea-column drafts (sampled)
  HBL_DRAFT_REPORT_FORMAT_2: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_4: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_5: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_6: 'jasper',
  HBL_DRAFT_REPORT_FORMAT_7: 'ocean',
  HBL_DRAFT_REPORT_FORMAT_8: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_9: 'combined',
  HBL_DRAFT_REPORT_FORMAT_10: 'mt',
  HBL_DRAFT_REPORT_FORMAT_11: 'combined',
  HBL_DRAFT_REPORT_FORMAT_12: 'ocean',
  HBL_DRAFT_REPORT_FORMAT_13: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_14: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_15: 'mt',
  HBL_DRAFT_REPORT_FORMAT_16: 'multimodal',
  HBL_DRAFT_REPORT_FORMAT_17: 'ocean',
  HBL_DRAFT_REPORT_FORMAT_18: 'combined',
  HBL_DRAFT_REPORT_FORMAT_19: 'combined',
  HBL_DRAFT_REPORT_FORMAT_20: 'ocean',
};

const VARIANT_CYCLE = ['combined', 'multimodal', 'jasper', 'ocean', 'mt'];

function fgFormatUrl(n) {
  if (n === 29) return `${FRESA_HBL_SAMPLE_BASE}draft_hbl_html_format29_rpm_ref_660.pdf`;
  if (n === 36) return `${FRESA_HBL_SAMPLE_BASE}draft_hbl_html_format36_rpm_ref_703.pdf`;
  const ref = JASPER_RPM_REF[n];
  if (!ref) return null;
  return `${FRESA_HBL_SAMPLE_BASE}fg_hbl_format${n}_rpm_ref_${ref}.pdf`;
}

function legacyUrl(n) {
  return `${FRESA_HBL_UPLOAD_BASE}hbl-draft-report-format-${n}.pdf`;
}

function resolveVariant(code, sortOrder) {
  if (VARIANT_BY_CODE[code]) return VARIANT_BY_CODE[code];
  return VARIANT_CYCLE[sortOrder % VARIANT_CYCLE.length];
}

/**
 * Jasper family order (95) — colliding FG numbers 10/14/16/20 use FG_HBL_FORMAT_* codes
 * so legacy HBL_DRAFT_REPORT_FORMAT_* stay distinct catalogue rows.
 */
const JASPER_NUMBERED = [
  14, 16, 20, 23, 25, 26, 27, 29, 33, 36, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  52, 53, 54, 55, 56, 59, 60, 61, 63, 64, 65, 67, 66, 68, 69, 70, 72, 73, 75, 77, 83, 84,
  85, 86, 87, 88, 89, 90, 92, 95, 96, 97, 99, 100, 101, 102, 107, 109, 114, 116, 117, 118,
  120, 122, 127, 128, 129, 130, 132, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
  145, 146, 147, 148, 149, 151, 172, 171,
];

const COLLIDING_FG = new Set([10, 14, 16, 20]);

function jasperName(n) {
  if (n === 29) return 'HBL Draft 29';
  if (n === 33) return 'HBL Original 33';
  if (n === 36) return 'HBL Draft Jasper 36';
  if (n === 43) return 'HBL Draft Jasper 43 SGSIN';
  return `HBL Draft Jasper ${n}`;
}

function jasperCode(n) {
  if (COLLIDING_FG.has(n)) return `FG_HBL_FORMAT_${n}`;
  return `HBL_DRAFT_REPORT_FORMAT_${n}`;
}

function jasperKind(n) {
  if (n === 29) return 'hbl_draft_29_html';
  if (n === 36) return 'hbl_draft_36_html';
  if (COLLIDING_FG.has(n)) return `fg_hbl_format_${n}`;
  return `hbl_draft_${n}`;
}

/** @type {Array<{code:string,name:string,kind:string,sortOrder:number,family:'jasper'|'legacy',samplePdfUrl:string|null,variant:string,isOriginal?:boolean}>} */
export const HBL_OFFICIAL_113 = [];

function pushRow(row) {
  const sortOrder = HBL_OFFICIAL_113.length + 1;
  const variant = resolveVariant(row.code, sortOrder);
  HBL_OFFICIAL_113.push({ ...row, sortOrder, variant });
}

// --- Jasper 1–95 ---
pushRow({
  code: 'FG_HBL_HKG',
  name: 'HBL Draft Jasper',
  kind: 'fg_hbl_hkg',
  family: 'jasper',
  samplePdfUrl: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_hkg_rpm_ref_245.pdf`,
});
pushRow({
  code: 'FG_HBL_FORMAT_1',
  name: 'HBL Draft Jasper 1',
  kind: 'fg_hbl_format_1',
  family: 'jasper',
  samplePdfUrl: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_format1_rpm_ref_388.pdf`,
});
pushRow({
  code: 'FG_HBL_FORMAT_10',
  name: 'HBL Draft Jasper 10',
  kind: 'fg_hbl_format_10',
  family: 'jasper',
  // Official catalogue link is broken — no invented PDF URL.
  samplePdfUrl: null,
});
pushRow({
  code: 'FG_HBL_MAGICLOGISYS',
  name: 'HBL Draft Jasper 13',
  kind: 'fg_hbl_magiclogisys',
  family: 'jasper',
  samplePdfUrl: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_magiclogisys_rpm_ref_405.pdf`,
});

for (const n of JASPER_NUMBERED) {
  if (n === 87) {
    pushRow({
      code: 'HBL_DRAFT_REPORT_FORMAT_87',
      name: 'HBL Draft Jasper 87',
      kind: 'hbl_draft_87',
      family: 'jasper',
      samplePdfUrl: fgFormatUrl(87),
    });
    pushRow({
      code: 'FG_HBL_ORIGINAL_FORMAT_87',
      name: 'HBL Original Jasper 87',
      kind: 'fg_hbl_original_format_87',
      family: 'jasper',
      samplePdfUrl: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_original_format87_rpm_ref_1479.pdf`,
      isOriginal: true,
    });
    continue;
  }
  pushRow({
    code: jasperCode(n),
    name: jasperName(n),
    kind: jasperKind(n),
    family: 'jasper',
    samplePdfUrl: fgFormatUrl(n),
    isOriginal: n === 33,
  });
}

// --- Legacy 96–113 (Format 2, 4–20; no Format 3) ---
for (const n of [2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]) {
  pushRow({
    code: `HBL_DRAFT_REPORT_FORMAT_${n}`,
    name: `HBL Draft Report Format ${n}`,
    kind: `hbl_draft_${n}`,
    family: 'legacy',
    samplePdfUrl: legacyUrl(n),
  });
}

if (HBL_OFFICIAL_113.length !== 113) {
  throw new Error(`Expected 113 HBL catalogue rows, got ${HBL_OFFICIAL_113.length}`);
}

const codes = HBL_OFFICIAL_113.map((r) => r.code);
const dupes = codes.filter((c, i) => codes.indexOf(c) !== i);
if (dupes.length) {
  throw new Error(`Duplicate HBL codes: ${[...new Set(dupes)].join(', ')}`);
}
