/**
 * HAWB formats from Fresa official report-format PDFs (names match registry / sample page).
 */
export const FRESA_HAWB_REPORT_FORMAT_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

export type HawbFormatKind =
  | 'hawb_draft'
  | 'hawb_draft_format_1'
  | 'hawb_draft_format_2'
  | 'hawb_original_pre_printed_1'
  | 'hawb_original_pre_printed_2';

export type HawbFormatSpec = {
  code: string;
  name: string;
  kind: HawbFormatKind;
  sortOrder: number;
  family: 'air_docs';
  samplePdfUrl: string;
};

export const HAWB_FORMAT_CATALOG: HawbFormatSpec[] = [
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT',
    name: 'HAWB Draft Report Format',
    kind: 'hawb_draft',
    sortOrder: 1,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-draft-report-format.pdf`,
  },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT_1',
    name: 'HAWB Draft Report Format-1',
    kind: 'hawb_draft_format_1',
    sortOrder: 2,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-draft-report-format-1.pdf`,
  },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT_2',
    name: 'HAWB Draft Report Format-2',
    kind: 'hawb_draft_format_2',
    sortOrder: 3,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-draft-report-format-2.pdf`,
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    name: 'HAWB Original Pre Printed Report Format-1',
    kind: 'hawb_original_pre_printed_1',
    sortOrder: 4,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-original-pre-printed-report-format-1.pdf`,
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    name: 'HAWB Original Pre Printed Report Format-2',
    kind: 'hawb_original_pre_printed_2',
    sortOrder: 5,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-original-pre-printed-report-format-2.pdf`,
  },
];

const byCode = new Map(HAWB_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

const REGISTRY_HAWB_DRAFT = /^HAWB_DRAFT_REPORT_FORMAT(_\d+)?$/;
const REGISTRY_HAWB_ORIGINAL = /^HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_\d+$/;

export function isHawbFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (!needle) return false;
  if (byCode.has(needle)) return true;
  if (REGISTRY_HAWB_DRAFT.test(needle)) return true;
  if (REGISTRY_HAWB_ORIGINAL.test(needle)) return true;
  return false;
}

export function getHawbFormatSpec(code: string): HawbFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listHawbFormats(): HawbFormatSpec[] {
  return HAWB_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveHawbFormatDisplayName(code: string, fallbackName: string): string {
  return getHawbFormatSpec(code)?.name || fallbackName;
}

export function hawbFormatsMatchSearch(searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  const catalogHit = listHawbFormats().some((row) => {
    const hay = `${row.name} ${row.code} ${row.kind} hawb house air waybill draft original`.toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
  if (catalogHit) return true;
  const genericHay = 'hawb house air waybill draft original pre printed mawb';
  return tokens.every((token) => genericHay.includes(token) || token.includes('hawb'));
}
