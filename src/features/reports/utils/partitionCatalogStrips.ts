import type { ReportTemplate } from '../types/reportCatalog.types';
import { reportFamilyLabel } from '../types/reportCatalog.types';
import {
  invoiceV2ApplicabilityHint,
  invoiceV2ListRank,
  invoiceV2Suitability,
  invoiceV2Applies,
  type InvoiceFitInput,
} from '../engine/invoiceV2Applicability';
import { isInvoiceFlowCode } from '../flow/invoiceFlowCode';
import { invoiceV2SpecCodes } from '../engine/invoiceV2Codes';
import { isReportsV2Code } from '../engine/reportsV2Gate';
import { reportConformanceStatus } from './reportConformanceStatus';
import { reportsV2BadgeText } from '../engine/reportsV2Gate';
import {
  isReportSearchActive,
  reportCatalogRowMatchesSearch,
} from './reportCatalogSearch';

export type CatalogStripStatusChip = 'accepted' | 'approximate';

export type CatalogStripRow = {
  template: ReportTemplate;
  familyLabel: string;
  statusChip: CatalogStripStatusChip;
  /** One-line reason when the format is not suitable for the open record. */
  unsuitableReason: string | null;
  /** True when v2 can draw this code. */
  v2Capable: boolean;
};

export type CatalogStripsPartition = {
  recommended: CatalogStripRow[];
  /** Other module formats grouped by family (collapsed by default in UI). */
  otherByFamily: Array<{ family: string; familyLabel: string; items: CatalogStripRow[] }>;
  notSuitable: CatalogStripRow[];
};

function statusChipFor(code: string): CatalogStripStatusChip {
  return reportConformanceStatus(code) === 'accepted' ? 'accepted' : 'approximate';
}

function toRow(template: ReportTemplate, invoiceCurrency?: InvoiceFitInput): CatalogStripRow {
  const hint = invoiceV2ApplicabilityHint(template.code, invoiceCurrency);
  const unsuitable =
    hint && (hint.startsWith('not suitable') || hint.startsWith('not applicable'))
      ? hint
      : null;
  return {
    template,
    familyLabel: reportFamilyLabel(template.family),
    statusChip: statusChipFor(template.code),
    unsuitableReason: unsuitable,
    v2Capable: isReportsV2Code(template.code),
  };
}

function compareRecommended(a: CatalogStripRow, b: CatalogStripRow, invoiceCurrency?: InvoiceFitInput): number {
  const rank =
    invoiceV2ListRank(a.template.code, invoiceCurrency) -
    invoiceV2ListRank(b.template.code, invoiceCurrency);
  if (rank !== 0) return rank;
  return a.template.name.localeCompare(b.template.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Split module formats into Recommended / other-by-family / Not suitable.
 * Recommended = applicable, v2-capable, and suitable for the open record.
 * Does not change gating or status — only organises the catalogue list.
 */
export function partitionCatalogStrips(
  items: ReportTemplate[],
  options: { invoiceCurrency?: InvoiceFitInput } = {},
): CatalogStripsPartition {
  const invoiceCurrency = options.invoiceCurrency ?? null;
  const recommended: CatalogStripRow[] = [];
  const notSuitable: CatalogStripRow[] = [];
  const other: CatalogStripRow[] = [];

  for (const template of items) {
    const row = toRow(template, invoiceCurrency);
    const code = template.code;

    if (row.unsuitableReason) {
      notSuitable.push(row);
      continue;
    }

    const v2 = isReportsV2Code(code);
    if (v2) {
      if (invoiceV2SpecCodes.has(code) || isInvoiceFlowCode(code)) {
        const suitable = invoiceV2Suitability(code, invoiceCurrency).suitable;
        const applies = invoiceV2Applies(code, invoiceCurrency);
        if (suitable && applies) {
          recommended.push(row);
          continue;
        }
        // Wired invoice / flow code that is not a fit → other (hint already handled unsuitable).
        other.push(row);
        continue;
      }
      // Non-invoice wired breadth code → recommended when no unsuitability.
      recommended.push(row);
      continue;
    }

    // Invoice Formats / catalogue: every commercial invoice layout must be listed,
    // not only the small v2-wired subset (otherwise users only see one strip).
    const contexts = template.contexts || [];
    if (
      template.family === 'commercial' &&
      (contexts.includes('invoice') || /INVOICE|TAX_INVOICE|PROFORMA|DEBIT_NOTE|CREDIT_NOTE/i.test(code))
    ) {
      recommended.push(row);
      continue;
    }

    other.push(row);
  }

  recommended.sort((a, b) => compareRecommended(a, b, invoiceCurrency));
  notSuitable.sort((a, b) =>
    a.template.name.localeCompare(b.template.name, undefined, { numeric: true, sensitivity: 'base' }),
  );

  const familyMap = new Map<string, CatalogStripRow[]>();
  for (const row of other) {
    const key = row.template.family || 'other';
    const list = familyMap.get(key) ?? [];
    list.push(row);
    familyMap.set(key, list);
  }
  for (const list of familyMap.values()) {
    list.sort((a, b) =>
      a.template.name.localeCompare(b.template.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }
  const otherByFamily = [...familyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, familyItems]) => ({
      family,
      familyLabel: reportFamilyLabel(family),
      items: familyItems,
    }));

  return { recommended, otherByFamily, notSuitable };
}

/** Filter partitioned rows by search query (name / code). */
export function filterCatalogStripsPartition(
  partition: CatalogStripsPartition,
  searchQuery: string,
): CatalogStripsPartition {
  if (!isReportSearchActive(searchQuery)) return partition;
  const match = (row: CatalogStripRow) =>
    reportCatalogRowMatchesSearch(
      { name: row.template.name, code: row.template.code },
      searchQuery,
    );
  return {
    recommended: partition.recommended.filter(match),
    otherByFamily: partition.otherByFamily
      .map((g) => ({ ...g, items: g.items.filter(match) }))
      .filter((g) => g.items.length > 0),
    notSuitable: partition.notSuitable.filter(match),
  };
}

/** Filter by family key (`all` = no filter). */
export function filterCatalogStripsByFamily(
  partition: CatalogStripsPartition,
  family: string,
): CatalogStripsPartition {
  if (!family || family === 'all') return partition;
  const keep = (row: CatalogStripRow) => row.template.family === family;
  return {
    recommended: partition.recommended.filter(keep),
    otherByFamily: partition.otherByFamily
      .filter((g) => g.family === family)
      .map((g) => ({ ...g, items: g.items.filter(keep) }))
      .filter((g) => g.items.length > 0),
    notSuitable: partition.notSuitable.filter(keep),
  };
}

export function catalogStripStatusLabel(chip: CatalogStripStatusChip): string {
  return chip === 'accepted' ? 'Accepted' : reportsV2BadgeText('reference_only');
}
