/**
 * WMS Advance Shipping Note formats from Fresa sample PDFs (2020/03).
 */
export type WmsFormatKind =
  | 'asn_format_1'
  | 'asn_standard'
  | 'asn_location_wise'
  | 'asn_location_wise_2'
  | 'asn_summary';

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

const byCode = new Map(WMS_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]));

export function isWmsFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getWmsFormatSpec(code: string): WmsFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listWmsFormats(): WmsFormatSpec[] {
  return WMS_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveWmsFormatDisplayName(code: string, fallbackName: string): string {
  return getWmsFormatSpec(code)?.name || fallbackName;
}
