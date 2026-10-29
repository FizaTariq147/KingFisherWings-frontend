/**
 * HAWB formats from Fresa official report-format PDFs (verified references only).
 * Draft Format-3…27 and Original Pre Printed Format-1 are excluded (unsupported / stub PDF).
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listHawbFormatUiLayouts } from '../data/hawbFormatUiLayouts';

export const FRESA_HAWB_REPORT_FORMAT_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

export type HawbFormatKind = string;

export type HawbFormatSpec = {
  code: string;
  name: string;
  kind: HawbFormatKind;
  sortOrder: number;
  family: 'air_docs';
  samplePdfUrl: string;
};

/** Four verified Fresa HAWB formats only. */
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
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    name: 'HAWB Original Pre Printed Report Format-2',
    kind: 'hawb_original_pre_printed_2',
    sortOrder: 4,
    family: 'air_docs',
    samplePdfUrl: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-original-pre-printed-report-format-2.pdf`,
  },
];

const VERIFIED_HAWB_CODES = new Set(HAWB_FORMAT_CATALOG.map((r) => r.code.toUpperCase()));

const ALL_HAWB_FORMATS: HawbFormatSpec[] = (() => {
  const by = new Map<string, HawbFormatSpec>();
  for (const row of HAWB_FORMAT_CATALOG) by.set(row.code.toUpperCase(), row);
  // Layout store is the source of truth for openable PDFs — keep catalog in sync.
  listHawbFormatUiLayouts().forEach((layout, i) => {
    const key = layout.code.toUpperCase();
    if (!VERIFIED_HAWB_CODES.has(key)) return;
    const existing = by.get(key);
    by.set(key, {
      code: layout.code,
      name: layout.name || existing?.name || layout.code,
      kind: existing?.kind || `hawb_${layout.formatNumber || i + 1}`,
      sortOrder: existing?.sortOrder ?? layout.formatNumber ?? i + 1,
      family: 'air_docs',
      samplePdfUrl: existing?.samplePdfUrl || FRESA_HAWB_REPORT_FORMAT_BASE,
    });
  });
  return [...by.values()];
})();

const byCode = new Map(ALL_HAWB_FORMATS.map((row) => [row.code.toUpperCase(), row]));

export function isHawbFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  return Boolean(needle) && byCode.has(needle);
}

export function getHawbFormatSpec(code: string): HawbFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listHawbFormats(): HawbFormatSpec[] {
  return ALL_HAWB_FORMATS.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveHawbFormatDisplayName(code: string, fallbackName: string): string {
  return getHawbFormatSpec(code)?.name || fallbackName;
}

export function hawbFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listHawbFormats(), searchQuery);
}
