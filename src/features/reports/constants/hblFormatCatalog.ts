/**
 * HBL formats — official Fresa catalogue of 113 entries (95 Jasper/FG + 18 legacy).
 * Source of truth: scripts/hblOfficial113.mjs → regenerated via
 * `node scripts/build-hbl-format-ui-layouts.mjs`.
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listHblFormatUiLayouts } from '../data/hblFormatUiLayouts';
import { HBL_JASPER_PILOT_CONFIG } from '../templates/hbl/jasperPilot/hblJasperPilot.config';
import { REMAINING_FORMAT_CATALOG } from './remainingFormatCatalog.generated.ts';
import { HBL_OFFICIAL_CATALOG } from './hblOfficialCatalog.generated.ts';

export const FRESA_HBL_SAMPLE_BASE =
  'https://fresatechnologies.com/wp-content/fresa-std-files/fresagold/sample_reports/';

export const FRESA_HBL_REPORT_FORMAT_UPLOAD_BASE =
  'https://fresatechnologies.com/wp-content/uploads/report-formats/';

/** Layout kind key — see scripts/hblOfficial113.mjs */
export type HblFormatKind = string;

export type HblFormatSpec = {
  code: string;
  name: string;
  kind: HblFormatKind;
  sortOrder: number;
  family: 'sea_docs';
  /** Jasper/FG family vs legacy Sea-column drafts. */
  hblFamily?: 'jasper' | 'legacy';
  /** Classic print-family variant for live-data fallback. */
  variant?: 'combined' | 'jasper' | 'multimodal' | 'mt' | 'ocean' | string;
  samplePdfUrl: string;
};

export const HBL_FORMAT_CATALOG: HblFormatSpec[] = HBL_OFFICIAL_CATALOG.map((row) => ({
  code: row.code,
  name: row.name,
  kind: row.kind,
  sortOrder: row.sortOrder,
  family: 'sea_docs',
  hblFamily: row.hblFamily,
  variant: row.variant,
  // Broken Jasper-10 link stays empty string — do not invent a PDF URL.
  samplePdfUrl: row.samplePdfUrl || '',
}));

const HBL_EXTRA: HblFormatSpec[] = REMAINING_FORMAT_CATALOG.filter(
  (r) => r.bucket === 'hbl' || r.bucket === 'hbl_extra',
)
  .filter((r) => !HBL_FORMAT_CATALOG.some((o) => o.code.toUpperCase() === r.code.toUpperCase()))
  .map((r, i) => ({
    code: r.code,
    name: r.name,
    kind: `hbl_extra_${r.sortOrder || i + 1}`,
    sortOrder: 1000 + (r.sortOrder || i + 1),
    family: 'sea_docs' as const,
    samplePdfUrl: '',
  }));

/** Phase-3 pilot — marketing-page Jasper (FRESA-REF-0001), not FG_HBL_HKG. */
const HBL_JASPER_PILOT_SPEC: HblFormatSpec = {
  code: HBL_JASPER_PILOT_CONFIG.code,
  name: HBL_JASPER_PILOT_CONFIG.name,
  kind: 'hbl_jasper_pilot',
  sortOrder: 0,
  family: 'sea_docs',
  hblFamily: 'jasper',
  variant: 'jasper',
  samplePdfUrl: HBL_JASPER_PILOT_CONFIG.samplePdfUrl,
};

const ALL_HBL_FORMATS: HblFormatSpec[] = (() => {
  const by = new Map<string, HblFormatSpec>();
  // Pilot first so catalogue + AutoPdf resolve the correct Jasper reference URL.
  by.set(HBL_JASPER_PILOT_SPEC.code.toUpperCase(), HBL_JASPER_PILOT_SPEC);
  // Official 113 first (canonical names/URLs/order).
  for (const row of HBL_FORMAT_CATALOG) by.set(row.code.toUpperCase(), row);
  for (const row of HBL_EXTRA) {
    if (!by.has(row.code.toUpperCase())) by.set(row.code.toUpperCase(), row);
  }
  // Ensure every generated layout is addressable even if outside the 113.
  listHblFormatUiLayouts().forEach((layout, i) => {
    const key = layout.code.toUpperCase();
    const existing = by.get(key);
    if (existing) {
      by.set(key, {
        ...existing,
        name: existing.name || layout.name || layout.code,
      });
      return;
    }
    by.set(key, {
      code: layout.code,
      name: layout.name || layout.code,
      kind: `hbl_${layout.formatNumber || i + 1}`,
      sortOrder: 2000 + i,
      family: 'sea_docs',
      samplePdfUrl: '',
    });
  });
  return [...by.values()];
})();

const byCode = new Map(ALL_HBL_FORMATS.map((row) => [row.code.toUpperCase(), row]));

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

/** Official 113-row catalogue (Jasper + legacy), sorted by Fresa position. */
export function listOfficialHblFormats(): HblFormatSpec[] {
  return HBL_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listHblFormats(): HblFormatSpec[] {
  return ALL_HBL_FORMATS.slice().sort(
    (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
  );
}

export function resolveHblFormatDisplayName(code: string, fallbackName: string): string {
  return getHblFormatSpec(code)?.name || fallbackName;
}

export function hblFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listHblFormats(), searchQuery);
}
