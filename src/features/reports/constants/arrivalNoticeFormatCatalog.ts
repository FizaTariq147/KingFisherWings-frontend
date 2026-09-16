/**
 * Arrival Notice formats from Fresa sample PDFs (names as on samples / catalog).
 * Covers all 34 direct sample links as 29 unique catalog codes (Format-1..10,
 * Confirmation, Air, plus FG/SEA variants; official PDFs supersede rpm samples
 * for shared codes).
 */
export type ArrivalNoticeFormatKind =
  | 'format1_jasper'
  | 'format2_jasper'
  | 'format3_usa'
  | 'format4_usa'
  | 'cargo_arrival_notice_sea'
  | 'cargo_arrival_notice_sea_format6'
  | 'cargo_arrival_notice_sea_format7'
  | 'cargo_arrival_notice_sea_without_charges'
  | 'cargo_arrival_notice_sea_without_charges_format9'
  | 'sea_arrival_notice_fcl_vietnam'
  | 'arrival_confirmation'
  | 'cargo_arrival_notice_air'
  | 'arrival_confirmation_format1'
  | 'arrival_information'
  | 'fg_arrival_information'
  | 'fg_arrival_notice'
  | 'fg_arrival_notice_format2'
  | 'fg_arrival_notice_without_chg'
  | 'fg_arrival_notice_format3'
  | 'cargo_arrival_notice_air_without_charges'
  | 'fg_cargo_arrival_notice'
  | 'fg_cargo_arrival_notice_format1'
  | 'fg_cargo_arrival_notice_sea'
  | 'cargo_arrival_notice_sea_format2'
  | 'cargo_arrival_notice_sea_format3'
  | 'cargo_arrival_notice_sea_format1'
  | 'cargo_arrival_notice_sea_without_charges_format1'
  | 'sea_arrival_notice_lcl_vietnam'
  | 'fg_cargo_arrival_notice_sea_format3';

export type ArrivalNoticeFormatSpec = {
  code: string;
  name: string;
  kind: ArrivalNoticeFormatKind;
  sortOrder: number;
  family: 'sea_docs' | 'air_docs';
};

export const ARRIVAL_NOTICE_FORMAT_CATALOG: ArrivalNoticeFormatSpec[] = [
  // Official report-format samples (user links)
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_1_CARGO_ARRIVAL_NOTICE_JASPER',
    name: 'Arrival Notice Report Format-1 Cargo Arrival Notice Jasper',
    kind: 'format1_jasper',
    sortOrder: 1,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_2_CARGO_ARRIVAL_NOTICE_JASPER',
    name: 'Arrival Notice Report Format-2 Cargo Arrival Notice Jasper',
    kind: 'format2_jasper',
    sortOrder: 2,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_3_ARRIVAL_NOTICE_USA',
    name: 'Arrival Notice Report Format-3 Arrival Notice USA',
    kind: 'format3_usa',
    sortOrder: 3,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_4_ARRIVAL_NOTICE_USA',
    name: 'Arrival Notice Report Format-4 Arrival Notice USA',
    kind: 'format4_usa',
    sortOrder: 4,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_5_CARGO_ARRIVAL_NOTICE_SEA',
    name: 'Arrival Notice Report Format-5 Cargo Arrival Notice SEA',
    kind: 'cargo_arrival_notice_sea',
    sortOrder: 5,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_6_CARGO_ARRIVAL_NOTICE_SEA',
    name: 'Arrival Notice Report Format-6 Cargo Arrival Notice SEA',
    kind: 'cargo_arrival_notice_sea_format6',
    sortOrder: 6,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_7_CARGO_ARRIVAL_NOTICE_SEA',
    name: 'Arrival Notice Report Format-7 Cargo Arrival Notice SEA',
    kind: 'cargo_arrival_notice_sea_format7',
    sortOrder: 7,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_8_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES',
    name: 'Arrival Notice Report Format-8 Cargo Arrival Notice SEA Without Charges',
    kind: 'cargo_arrival_notice_sea_without_charges',
    sortOrder: 8,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_9_CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES',
    name: 'Arrival Notice Report Format-9 Cargo Arrival Notice SEA Without Charges',
    kind: 'cargo_arrival_notice_sea_without_charges_format9',
    sortOrder: 9,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_NOTICE_REPORT_FORMAT_10_SEA_ARRIVAL_NOTICE_FCL_VIETNAM',
    name: 'Arrival Notice Report Format-10 SEA Arrival Notice FCL Vietnam',
    kind: 'sea_arrival_notice_fcl_vietnam',
    sortOrder: 10,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_CONFIRMATION',
    name: 'Arrival Confirmation Report Format',
    kind: 'arrival_confirmation',
    sortOrder: 11,
    family: 'sea_docs',
  },
  {
    code: 'CARGO_ARRIVAL_NOTICE_AIR_REPORT_FORMAT',
    name: 'Cargo Arrival Notice Air Report Format',
    kind: 'cargo_arrival_notice_air',
    sortOrder: 12,
    family: 'air_docs',
  },

  // Earlier FG / variant samples (kept; not hidden)
  {
    code: 'ARRIVAL_CONFIRMATION_FORMAT_1',
    name: 'Arrival Confirmation Format-1',
    kind: 'arrival_confirmation_format1',
    sortOrder: 13,
    family: 'sea_docs',
  },
  {
    code: 'ARRIVAL_INFORMATION',
    name: 'Arrival Information',
    kind: 'arrival_information',
    sortOrder: 14,
    family: 'sea_docs',
  },
  {
    code: 'FG_ARRIVAL_INFORMATION',
    name: 'FG Arrival Information',
    kind: 'fg_arrival_information',
    sortOrder: 15,
    family: 'sea_docs',
  },
  {
    code: 'FG_ARRIVAL_NOTICE',
    name: 'FG Arrival Notice',
    kind: 'fg_arrival_notice',
    sortOrder: 16,
    family: 'sea_docs',
  },
  {
    code: 'FG_ARRIVAL_NOTICE_FORMAT_2',
    name: 'FG Arrival Notice Format-2',
    kind: 'fg_arrival_notice_format2',
    sortOrder: 17,
    family: 'sea_docs',
  },
  {
    code: 'FG_ARRIVAL_NOTICE_WITHOUT_CHARGES',
    name: 'FG Arrival Notice Without Charges',
    kind: 'fg_arrival_notice_without_chg',
    sortOrder: 18,
    family: 'sea_docs',
  },
  {
    code: 'FG_ARRIVAL_NOTICE_FORMAT_3',
    name: 'FG Arrival Notice Format-3',
    kind: 'fg_arrival_notice_format3',
    sortOrder: 19,
    family: 'sea_docs',
  },
  {
    code: 'CARGO_ARRIVAL_NOTICE_AIR_WITHOUT_CHARGES_REPORT_FORMAT',
    name: 'Cargo Arrival Notice Air Without Charges Report Format',
    kind: 'cargo_arrival_notice_air_without_charges',
    sortOrder: 20,
    family: 'air_docs',
  },
  {
    code: 'FG_CARGO_ARRIVAL_NOTICE',
    name: 'FG Cargo Arrival Notice',
    kind: 'fg_cargo_arrival_notice',
    sortOrder: 21,
    family: 'sea_docs',
  },
  {
    code: 'FG_CARGO_ARRIVAL_NOTICE_FORMAT_1',
    name: 'FG Cargo Arrival Notice Format-1',
    kind: 'fg_cargo_arrival_notice_format1',
    sortOrder: 22,
    family: 'sea_docs',
  },
  {
    code: 'FG_CARGO_ARRIVAL_NOTICE_SEA',
    name: 'FG Cargo Arrival Notice SEA',
    kind: 'fg_cargo_arrival_notice_sea',
    sortOrder: 23,
    family: 'sea_docs',
  },
  {
    code: 'CARGO_ARRIVAL_NOTICE_SEA_FORMAT_2',
    name: 'Cargo Arrival Notice SEA Format-2',
    kind: 'cargo_arrival_notice_sea_format2',
    sortOrder: 24,
    family: 'sea_docs',
  },
  {
    code: 'CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3',
    name: 'Cargo Arrival Notice SEA Format-3',
    kind: 'cargo_arrival_notice_sea_format3',
    sortOrder: 25,
    family: 'sea_docs',
  },
  {
    code: 'CARGO_ARRIVAL_NOTICE_SEA_FORMAT_1',
    name: 'Cargo Arrival Notice SEA Format-1',
    kind: 'cargo_arrival_notice_sea_format1',
    sortOrder: 26,
    family: 'sea_docs',
  },
  {
    code: 'CARGO_ARRIVAL_NOTICE_SEA_WITHOUT_CHARGES_FORMAT_1',
    name: 'Cargo Arrival Notice SEA Without Charges Format-1',
    kind: 'cargo_arrival_notice_sea_without_charges_format1',
    sortOrder: 27,
    family: 'sea_docs',
  },
  {
    code: 'SEA_ARRIVAL_NOTICE_LCL_VIETNAM',
    name: 'SEA Arrival Notice LCL Vietnam',
    kind: 'sea_arrival_notice_lcl_vietnam',
    sortOrder: 28,
    family: 'sea_docs',
  },
  {
    code: 'FG_CARGO_ARRIVAL_NOTICE_SEA_FORMAT_3',
    name: 'FG Cargo Arrival Notice SEA Format-3',
    kind: 'fg_cargo_arrival_notice_sea_format3',
    sortOrder: 29,
    family: 'sea_docs',
  },
];

const byCode = new Map(
  ARRIVAL_NOTICE_FORMAT_CATALOG.map((row) => [row.code.toUpperCase(), row]),
);

export function isArrivalNoticeFormatCode(code: string): boolean {
  return byCode.has(code.trim().toUpperCase());
}

export function getArrivalNoticeFormatSpec(code: string): ArrivalNoticeFormatSpec | undefined {
  return byCode.get(code.trim().toUpperCase());
}

export function listArrivalNoticeFormats(): ArrivalNoticeFormatSpec[] {
  return ARRIVAL_NOTICE_FORMAT_CATALOG.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function resolveArrivalNoticeFormatDisplayName(code: string, fallbackName: string): string {
  return getArrivalNoticeFormatSpec(code)?.name || fallbackName;
}

/** True when search tokens match at least one Arrival Notice catalog row. */
export function arrivalNoticeFormatsMatchSearch(searchQuery: string): boolean {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return false;
  const tokens = q.split(/\s+/).filter(Boolean);
  return listArrivalNoticeFormats().some((row) => {
    const hay = `${row.name} ${row.code} ${row.kind}`.toLowerCase();
    return tokens.every((token) => hay.includes(token));
  });
}
