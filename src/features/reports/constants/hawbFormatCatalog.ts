/**
 * HAWB formats from Fresa official report-format PDFs (IATA Air Waybill shells).
 * https://fresatechnologies.com/sample-report-formats/
 *
 * Only five distinct sample PDFs exist on the Fresa CDN. Extra draft Format-3…N
 * codes share the base draft sample (stamped) until Fresa publishes more files.
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listHawbFormatUiLayouts } from '../data/hawbFormatUiLayouts';
import { FRESA_REPORT_REGISTRY } from '../data/fresaReportRegistry';

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
  /** True when CDN has no distinct file for this code — closest sample is used. */
  sampleIsFallback?: boolean;
};

const SAMPLE = {
  draft: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-draft-report-format.pdf`,
  draft1: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-draft-report-format-1.pdf`,
  draft2: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-draft-report-format-2.pdf`,
  original1: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-original-pre-printed-report-format-1.pdf`,
  original2: `${FRESA_HAWB_REPORT_FORMAT_BASE}hawb-original-pre-printed-report-format-2.pdf`,
} as const;

/** Five verified Fresa HAWB formats (distinct CDN PDFs). */
export const HAWB_FORMAT_CATALOG: HawbFormatSpec[] = [
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT',
    name: 'HAWB Draft Report Format',
    kind: 'hawb_draft',
    sortOrder: 1,
    family: 'air_docs',
    samplePdfUrl: SAMPLE.draft,
  },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT_1',
    name: 'HAWB Draft Report Format-1',
    kind: 'hawb_draft_format_1',
    sortOrder: 2,
    family: 'air_docs',
    samplePdfUrl: SAMPLE.draft1,
  },
  {
    code: 'HAWB_DRAFT_REPORT_FORMAT_2',
    name: 'HAWB Draft Report Format-2',
    kind: 'hawb_draft_format_2',
    sortOrder: 3,
    family: 'air_docs',
    samplePdfUrl: SAMPLE.draft2,
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
    name: 'HAWB Original Pre Printed Report Format-1',
    kind: 'hawb_original_pre_printed_1',
    sortOrder: 4,
    family: 'air_docs',
    samplePdfUrl: SAMPLE.original1,
  },
  {
    code: 'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
    name: 'HAWB Original Pre Printed Report Format-2',
    kind: 'hawb_original_pre_printed_2',
    sortOrder: 5,
    family: 'air_docs',
    samplePdfUrl: SAMPLE.original2,
  },
];

function draftSampleForIndex(n: number): { url: string; fallback: boolean } {
  if (n === 1) return { url: SAMPLE.draft1, fallback: false };
  if (n === 2) return { url: SAMPLE.draft2, fallback: false };
  // Format-3…N: no CDN file — reuse base draft and stamp the format label.
  return { url: SAMPLE.draft, fallback: true };
}

function originalSampleForIndex(n: number): { url: string; fallback: boolean } {
  if (n === 1) return { url: SAMPLE.original1, fallback: false };
  if (n === 2) return { url: SAMPLE.original2, fallback: false };
  return { url: SAMPLE.original1, fallback: true };
}

function hawbSpecFromCode(code: string, sortOrder: number): HawbFormatSpec {
  const upper = code.trim().toUpperCase();
  const draftExact = upper === 'HAWB_DRAFT_REPORT_FORMAT';
  const draftN = upper.match(/^HAWB_DRAFT_REPORT_FORMAT_(\d+)$/);
  const originalN = upper.match(/^HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_(\d+)$/);

  if (draftExact) {
    return {
      code: upper,
      name: 'HAWB Draft Report Format',
      kind: 'hawb_draft',
      sortOrder,
      family: 'air_docs',
      samplePdfUrl: SAMPLE.draft,
    };
  }
  if (draftN) {
    const n = Number(draftN[1]);
    const sample = draftSampleForIndex(n);
    return {
      code: upper,
      name: `HAWB Draft Report Format-${n}`,
      kind: n === 1 ? 'hawb_draft_format_1' : n === 2 ? 'hawb_draft_format_2' : `hawb_draft_format_${n}`,
      sortOrder,
      family: 'air_docs',
      samplePdfUrl: sample.url,
      sampleIsFallback: sample.fallback || undefined,
    };
  }
  if (originalN) {
    const n = Number(originalN[1]);
    const sample = originalSampleForIndex(n);
    return {
      code: upper,
      name: `HAWB Original Pre Printed Report Format-${n}`,
      kind:
        n === 1
          ? 'hawb_original_pre_printed_1'
          : n === 2
            ? 'hawb_original_pre_printed_2'
            : `hawb_original_pre_printed_${n}`,
      sortOrder,
      family: 'air_docs',
      samplePdfUrl: sample.url,
      sampleIsFallback: sample.fallback || undefined,
    };
  }
  return {
    code: upper,
    name: upper.replace(/_/g, ' '),
    kind: 'hawb_draft',
    sortOrder,
    family: 'air_docs',
    samplePdfUrl: SAMPLE.draft,
    sampleIsFallback: true,
  };
}

const VERIFIED_BY_CODE = new Map(
  HAWB_FORMAT_CATALOG.map((r) => [r.code.toUpperCase(), r]),
);

const ALL_HAWB_FORMATS: HawbFormatSpec[] = (() => {
  const by = new Map<string, HawbFormatSpec>();

  for (const row of HAWB_FORMAT_CATALOG) {
    by.set(row.code.toUpperCase(), row);
  }

  let order = HAWB_FORMAT_CATALOG.length + 1;
  for (const entry of FRESA_REPORT_REGISTRY) {
    const code = String(entry.code || '').trim().toUpperCase();
    if (!code.startsWith('HAWB_')) continue;
    if (by.has(code)) continue;
    by.set(code, hawbSpecFromCode(code, order++));
  }

  listHawbFormatUiLayouts().forEach((layout) => {
    const key = layout.code.toUpperCase();
    const existing = by.get(key);
    if (existing) {
      by.set(key, {
        ...existing,
        name: layout.name || existing.name,
        sortOrder: existing.sortOrder || layout.formatNumber || existing.sortOrder,
      });
      return;
    }
    const verified = VERIFIED_BY_CODE.get(key);
    if (verified) {
      by.set(key, verified);
      return;
    }
    by.set(key, hawbSpecFromCode(key, layout.formatNumber || order++));
  });

  return [...by.values()];
})();

const byCode = new Map(ALL_HAWB_FORMATS.map((row) => [row.code.toUpperCase(), row]));

export function isHawbFormatCode(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (!needle) return false;
  if (byCode.has(needle)) return true;
  return /^HAWB_(DRAFT_REPORT_FORMAT|ORIGINAL_PRE_PRINTED_REPORT_FORMAT)(_\d+)?$/i.test(
    needle,
  );
}

export function getHawbFormatSpec(code: string): HawbFormatSpec | undefined {
  const needle = code.trim().toUpperCase();
  const hit = byCode.get(needle);
  if (hit) return hit;
  if (isHawbFormatCode(needle)) return hawbSpecFromCode(needle, 999);
  return undefined;
}

export function listHawbFormats(): HawbFormatSpec[] {
  return ALL_HAWB_FORMATS.slice().sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code));
}

export function resolveHawbFormatDisplayName(code: string, fallbackName: string): string {
  return getHawbFormatSpec(code)?.name || fallbackName;
}

export function hawbFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listHawbFormats(), searchQuery);
}
