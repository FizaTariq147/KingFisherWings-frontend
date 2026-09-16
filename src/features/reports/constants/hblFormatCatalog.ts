/**
 * HBL formats — catalog must stay 1:1 with scripts/build-hbl-format-ui-layouts.mjs CATALOG.
 */
export const FRESA_HBL_SAMPLE_BASE =
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/';

export const FRESA_HBL_REPORT_FORMAT_UPLOAD_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

function hblOfficialDraftSampleUrl(formatNumber: number): string {
  return `${FRESA_HBL_REPORT_FORMAT_UPLOAD_BASE}hbl-draft-report-format-${formatNumber}.pdf`;
}

/** Layout kind key — see scripts/build-hbl-format-ui-layouts.mjs */
export type HblFormatKind = string;

export type HblFormatSpec = {
  code: string;
  name: string;
  kind: HblFormatKind;
  sortOrder: number;
  family: 'sea_docs';
  samplePdfUrl: string;
};

/** RPM ref suffix in Fresa sample filenames (not always equal to format number). */
function hblSampleRefSuffix(formatNumber: number): string {
  const refByFormat: Record<number, string> = {
    23: '631',
    25: '643',
    26: '653',
    27: '655',
    29: '660',
    33: '684',
    40: '717',
    41: '721',
    42: '745',
    43: '754',
    44: '771',
    45: '776',
    46: '781',
    47: '785',
    48: '790',
    49: '795',
    50: '800',
    51: '805',
    52: '810',
    53: '815',
    54: '820',
    55: '825',
    56: '830',
    59: '845',
    60: '850',
    61: '855',
    63: '865',
    64: '870',
    65: '875',
    66: '880',
    67: '885',
    68: '890',
    69: '931',
    70: '900',
    72: '910',
    73: '915',
    75: '925',
    77: '935',
    83: '965',
    84: '970',
    85: '975',
    86: '980',
    87: '985',
    88: '1026',
    89: '1027',
    90: '1035',
    92: '1039',
    95: '1076',
    96: '1077',
    97: '1079',
    99: '1081',
    100: '1085',
    101: '1086',
    102: '1092',
    107: '1137',
    109: '1156',
    114: '1181',
    116: '1198',
    117: '1202',
    118: '1203',
    120: '1211',
    122: '1221',
    127: '1251',
    128: '1257',
    129: '1259',
    130: '1261',
    132: '1280',
    134: '1287',
    135: '1291',
    136: '1293',
    137: '1317',
    138: '1321',
    139: '1324',
    140: '1326',
    141: '1327',
    142: '1339',
    143: '1341',
    144: '1353',
    145: '1354',
    146: '1358',
    147: '1359',
    148: '1361',
    149: '1365',
    151: '1380',
    171: '1491',
    172: '1489',
  };
  return refByFormat[formatNumber] ?? String(formatNumber);
}

function hblDraftSampleUrl(formatNumber: number): string {
  // Official upload PDFs for early draft numbers; FG sample CDN for the rest.
  if (formatNumber <= 20) return hblOfficialDraftSampleUrl(formatNumber);
  if (formatNumber === 29) {
    return `${FRESA_HBL_SAMPLE_BASE}draft_hbl_html_format29_rpm_ref_660.pdf`;
  }
  return `${FRESA_HBL_SAMPLE_BASE}fg_hbl_format${formatNumber}_rpm_ref_${hblSampleRefSuffix(formatNumber)}.pdf`;
}

/**
 * Same order/codes as scripts/build-hbl-format-ui-layouts.mjs `CATALOG`.
 * Keep these two sources in sync when adding formats.
 */
const HBL_FORMAT_ROWS: Array<[code: string, name: string, kind: string, sortOrder: number]> = [
  ['HBL_DRAFT_REPORT_FORMAT_JASPER', 'HBL Draft Report Format Jasper', 'hbl_draft_jasper', 0],
  ['FG_HBL_HKG', 'FG HBL HKG', 'fg_hbl_hkg', 1],
  ['FG_HBL_FORMAT_1', 'FG HBL Format-1', 'fg_hbl_format_1', 2],
  ['FG_HBL_MAGICLOGISYS', 'FG HBL Magiclogisys', 'fg_hbl_magiclogisys', 3],
  ['HBL_DRAFT_REPORT_FORMAT_2', 'HBL Draft Report Format-2', 'hbl_draft_2', 4],
  ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(
    (n, i): [string, string, string, number] => [
      `HBL_DRAFT_REPORT_FORMAT_${n}`,
      `HBL Draft Report Format-${n}`,
      `hbl_draft_${n}`,
      5 + i,
    ],
  ),
  ['HBL_DRAFT_REPORT_FORMAT_14', 'HBL Draft Report Format-14', 'hbl_draft_14', 15],
  ['HBL_DRAFT_REPORT_FORMAT_15', 'HBL Draft Report Format-15', 'hbl_draft_15', 16],
  ['HBL_DRAFT_REPORT_FORMAT_16', 'HBL Draft Report Format-16', 'hbl_draft_16', 17],
  ['HBL_DRAFT_REPORT_FORMAT_17', 'HBL Draft Report Format-17', 'hbl_draft_17', 18],
  ['HBL_DRAFT_REPORT_FORMAT_18', 'HBL Draft Report Format-18', 'hbl_draft_18', 19],
  ['HBL_DRAFT_REPORT_FORMAT_19', 'HBL Draft Report Format-19', 'hbl_draft_19', 20],
  ['HBL_DRAFT_REPORT_FORMAT_20', 'HBL Draft Report Format-20', 'hbl_draft_20', 21],
  ['HBL_DRAFT_REPORT_FORMAT_23', 'HBL Draft Report Format-23', 'hbl_draft_23', 22],
  ['HBL_DRAFT_REPORT_FORMAT_25', 'HBL Draft Report Format-25', 'hbl_draft_25', 23],
  ['HBL_DRAFT_REPORT_FORMAT_26', 'HBL Draft Report Format-26', 'hbl_draft_26', 24],
  ['HBL_DRAFT_REPORT_FORMAT_27', 'HBL Draft Report Format-27', 'hbl_draft_27', 25],
  ['HBL_DRAFT_REPORT_FORMAT_29', 'HBL Draft Report Format-29', 'hbl_draft_29_html', 26],
  ['HBL_DRAFT_REPORT_FORMAT_33', 'HBL Draft Report Format-33', 'hbl_draft_33', 27],
  ['HBL_DRAFT_REPORT_FORMAT_40', 'HBL Draft Report Format-40', 'hbl_draft_40', 28],
  ['HBL_DRAFT_REPORT_FORMAT_41', 'HBL Draft Report Format-41', 'hbl_draft_41', 29],
  ['HBL_DRAFT_REPORT_FORMAT_42', 'HBL Draft Report Format-42', 'hbl_draft_42', 30],
  ['HBL_DRAFT_REPORT_FORMAT_43', 'HBL Draft Report Format-43', 'hbl_draft_43', 31],
  ['HBL_DRAFT_REPORT_FORMAT_44', 'HBL Draft Report Format-44', 'hbl_draft_44', 32],
  ['HBL_DRAFT_REPORT_FORMAT_45', 'HBL Draft Report Format-45', 'hbl_draft_45', 33],
  ['HBL_DRAFT_REPORT_FORMAT_46', 'HBL Draft Report Format-46', 'hbl_draft_46', 34],
  ['HBL_DRAFT_REPORT_FORMAT_47', 'HBL Draft Report Format-47', 'hbl_draft_47', 35],
  ['HBL_DRAFT_REPORT_FORMAT_48', 'HBL Draft Report Format-48', 'hbl_draft_48', 36],
  ['HBL_DRAFT_REPORT_FORMAT_49', 'HBL Draft Report Format-49', 'hbl_draft_49', 37],
  ['HBL_DRAFT_REPORT_FORMAT_50', 'HBL Draft Report Format-50', 'hbl_draft_50', 38],
  ['HBL_DRAFT_REPORT_FORMAT_51', 'HBL Draft Report Format-51', 'hbl_draft_51', 39],
  ['HBL_DRAFT_REPORT_FORMAT_52', 'HBL Draft Report Format-52', 'hbl_draft_52', 40],
  ['HBL_DRAFT_REPORT_FORMAT_53', 'HBL Draft Report Format-53', 'hbl_draft_53', 41],
  ['HBL_DRAFT_REPORT_FORMAT_54', 'HBL Draft Report Format-54', 'hbl_draft_54', 42],
  ['HBL_DRAFT_REPORT_FORMAT_55', 'HBL Draft Report Format-55', 'hbl_draft_55', 43],
  ['HBL_DRAFT_REPORT_FORMAT_56', 'HBL Draft Report Format-56', 'hbl_draft_56', 44],
  ['HBL_DRAFT_REPORT_FORMAT_59', 'HBL Draft Report Format-59', 'hbl_draft_59', 45],
  ['HBL_DRAFT_REPORT_FORMAT_60', 'HBL Draft Report Format-60', 'hbl_draft_60', 46],
  ['HBL_DRAFT_REPORT_FORMAT_61', 'HBL Draft Report Format-61', 'hbl_draft_61', 47],
  ['HBL_DRAFT_REPORT_FORMAT_63', 'HBL Draft Report Format-63', 'hbl_draft_63', 48],
  ['HBL_DRAFT_REPORT_FORMAT_64', 'HBL Draft Report Format-64', 'hbl_draft_64', 49],
  ['HBL_DRAFT_REPORT_FORMAT_65', 'HBL Draft Report Format-65', 'hbl_draft_65', 50],
  ['HBL_DRAFT_REPORT_FORMAT_66', 'HBL Draft Report Format-66', 'hbl_draft_66', 51],
  ['HBL_DRAFT_REPORT_FORMAT_67', 'HBL Draft Report Format-67', 'hbl_draft_67', 52],
  ['HBL_DRAFT_REPORT_FORMAT_68', 'HBL Draft Report Format-68', 'hbl_draft_68', 53],
  ['HBL_DRAFT_REPORT_FORMAT_69', 'HBL Draft Report Format-69', 'hbl_draft_69', 54],
  ['HBL_DRAFT_REPORT_FORMAT_70', 'HBL Draft Report Format-70', 'hbl_draft_70', 55],
  ['HBL_DRAFT_REPORT_FORMAT_72', 'HBL Draft Report Format-72', 'hbl_draft_72', 55],
  ['HBL_DRAFT_REPORT_FORMAT_73', 'HBL Draft Report Format-73', 'hbl_draft_73', 56],
  ['HBL_DRAFT_REPORT_FORMAT_75', 'HBL Draft Report Format-75', 'hbl_draft_75', 57],
  ['HBL_DRAFT_REPORT_FORMAT_77', 'HBL Draft Report Format-77', 'hbl_draft_77', 58],
  ['HBL_DRAFT_REPORT_FORMAT_83', 'HBL Draft Report Format-83', 'hbl_draft_83', 59],
  ['HBL_DRAFT_REPORT_FORMAT_84', 'HBL Draft Report Format-84', 'hbl_draft_84', 60],
  ['HBL_DRAFT_REPORT_FORMAT_85', 'HBL Draft Report Format-85', 'hbl_draft_85', 61],
  ['HBL_DRAFT_REPORT_FORMAT_86', 'HBL Draft Report Format-86', 'hbl_draft_86', 62],
  ['HBL_DRAFT_REPORT_FORMAT_87', 'HBL Draft Report Format-87', 'hbl_draft_87', 63],
  ['FG_HBL_ORIGINAL_FORMAT_87', 'FG HBL Original Format-87', 'fg_hbl_original_format_87', 64],
  ['HBL_DRAFT_REPORT_FORMAT_88', 'HBL Draft Report Format-88', 'hbl_draft_88', 66],
  ['HBL_DRAFT_REPORT_FORMAT_89', 'HBL Draft Report Format-89', 'hbl_draft_89', 67],
  ['HBL_DRAFT_REPORT_FORMAT_90', 'HBL Draft Report Format-90', 'hbl_draft_90', 68],
  ['HBL_DRAFT_REPORT_FORMAT_92', 'HBL Draft Report Format-92', 'hbl_draft_92', 69],
  ['HBL_DRAFT_REPORT_FORMAT_95', 'HBL Draft Report Format-95', 'hbl_draft_95', 70],
  ['HBL_DRAFT_REPORT_FORMAT_96', 'HBL Draft Report Format-96', 'hbl_draft_96', 71],
  ...[
    97, 99, 100, 101, 102, 107, 109, 114, 116, 117, 118, 120, 122, 127, 128, 129, 130, 132, 134,
    135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 151, 171, 172,
  ].map(
    (n, i): [string, string, string, number] => [
      `HBL_DRAFT_REPORT_FORMAT_${n}`,
      `HBL Draft Report Format-${n}`,
      `hbl_draft_${n}`,
      72 + i,
    ],
  ),
];

const SPECIAL_SAMPLE_URLS: Record<string, string> = {
  HBL_DRAFT_REPORT_FORMAT_JASPER: `${FRESA_HBL_REPORT_FORMAT_UPLOAD_BASE}hbl-draft-report-fomat-jasper.pdf`,
  FG_HBL_HKG: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_hkg_rpm_ref_245.pdf`,
  FG_HBL_FORMAT_1: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_format1_rpm_ref_388.pdf`,
  FG_HBL_MAGICLOGISYS: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_magiclogisys_rpm_ref_405.pdf`,
  FG_HBL_ORIGINAL_FORMAT_87: `${FRESA_HBL_SAMPLE_BASE}fg_hbl_original_format87_rpm_ref_1021.pdf`,
};

function resolveHblSamplePdfUrl(code: string): string {
  if (SPECIAL_SAMPLE_URLS[code]) return SPECIAL_SAMPLE_URLS[code];
  const match = /^HBL_DRAFT_REPORT_FORMAT_(\d+)$/.exec(code);
  if (match) return hblDraftSampleUrl(Number(match[1]));
  return FRESA_HBL_SAMPLE_BASE;
}

export const HBL_FORMAT_CATALOG: HblFormatSpec[] = HBL_FORMAT_ROWS.map(
  ([code, name, kind, sortOrder]) => ({
    code,
    name,
    kind,
    sortOrder,
    family: 'sea_docs',
    samplePdfUrl: resolveHblSamplePdfUrl(code),
  }),
);

const byCode = new Map(HBL_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

const REGISTRY_HBL_DRAFT = /^HBL_DRAFT_REPORT_FORMAT(_\d+|_JASPER)?$/;

export function isHblFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (!needle) return false;
  if (byCode.has(needle)) return true;
  if (REGISTRY_HBL_DRAFT.test(needle)) return true;
  if (needle.startsWith('FG_HBL_')) return true;
  return false;
}

export function getHblFormatSpec(code: string): HblFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listHblFormats(): HblFormatSpec[] {
  return HBL_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));
}

export function resolveHblFormatDisplayName(code: string, fallbackName: string): string {
  return getHblFormatSpec(code)?.name || fallbackName;
}

export function hblFormatsMatchSearch(searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  const catalogHit = listHblFormats().some((row) => {
    const hay = `${row.name} ${row.code} ${row.kind} hbl bill lading draft`.toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
  if (catalogHit) return true;
  const genericHay = 'hbl house bill lading draft original sea';
  return tokens.every((token) => genericHay.includes(token) || token.includes('hbl'));
}
