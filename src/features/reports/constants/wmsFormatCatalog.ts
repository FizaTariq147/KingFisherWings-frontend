/**
 * WMS Advance Shipping Note formats from Fresa sample PDFs (2020/03).
 */
import { catalogRowsMatchSearch } from '../utils/reportCatalogSearch';
import { listWmsFormatUiLayouts } from '../data/wmsFormatUiLayouts';
import { REMAINING_FORMAT_CATALOG } from './remainingFormatCatalog.generated.ts';

export type WmsFormatKind = string;

export type WmsFormatSpec = {
  code: string;
  name: string;
  kind: WmsFormatKind;
  sortOrder: number;
};

export const WMS_FORMAT_CATALOG: WmsFormatSpec[] = [
  {
    code: 'ADVANCE_SHIPPING_NOTE_FORMAT_1',
    name: 'Advance Shipping Note Format-1',
    kind: 'asn_format_1',
    sortOrder: 1,
  },
  {
    code: 'ADVANCE_SHIPPING_NOTE',
    name: 'Advance Shipping Note',
    kind: 'asn_standard',
    sortOrder: 2,
  },
  {
    code: 'ADVANCE_SHIPPING_NOTE_LOCATION_WISE',
    name: 'Advance Shipping Note Location Wise',
    kind: 'asn_location_wise',
    sortOrder: 3,
  },
  {
    code: 'ADVANCE_SHIPPING_NOTE_LOCATION_WISE_2',
    name: 'Advance Shipping Note Location Wise-2',
    kind: 'asn_location_wise_2',
    sortOrder: 4,
  },
  {
    code: 'ADVANCE_SHIPPING_NOTE_SUMMARY',
    name: 'Advance Shipping Note Summary',
    kind: 'asn_summary',
    sortOrder: 5,
  },
];

const WMS_EXTRA: WmsFormatSpec[] = REMAINING_FORMAT_CATALOG.filter(
  (r) => r.bucket === 'wms' || r.bucket === 'wms_extra',
).map((r, i) => ({
  code: r.code,
  name: r.name,
  kind: `wms_extra_${r.sortOrder || i + 1}`,
  sortOrder: 1000 + (r.sortOrder || i + 1),
}));

function buildAllWmsFormats(): WmsFormatSpec[] {
  const by = new Map<string, WmsFormatSpec>();
  for (const row of [...WMS_FORMAT_CATALOG, ...WMS_EXTRA]) by.set(row.code.toUpperCase(), row);
  listWmsFormatUiLayouts().forEach((layout, i) => {
    const key = layout.code.toUpperCase();
    const existing = by.get(key);
    by.set(key, {
      code: layout.code,
      name: layout.name || existing?.name || layout.code,
      kind: existing?.kind || `wms_${layout.formatNumber || i + 1}`,
      sortOrder: existing?.sortOrder ?? layout.formatNumber ?? 2000 + i,
    });
  });
  return [...by.values()].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

const ALL_WMS_FORMATS: WmsFormatSpec[] = buildAllWmsFormats();

const byCode = new Map(ALL_WMS_FORMATS.map((row) => [row.code.toUpperCase(), row]));

export function isWmsFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getWmsFormatSpec(code: string): WmsFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listWmsFormats(): WmsFormatSpec[] {
  return ALL_WMS_FORMATS.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveWmsFormatDisplayName(code: string, fallbackName: string): string {
  return getWmsFormatSpec(code)?.name || fallbackName;
}

export function wmsFormatsMatchSearch(searchQuery: string): boolean {
  return catalogRowsMatchSearch(listWmsFormats(), searchQuery);
}
