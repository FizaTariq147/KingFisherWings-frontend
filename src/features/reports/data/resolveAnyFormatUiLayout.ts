import type { InvoiceFormatUiLayout } from '../types/invoiceFormatUiLayout.types';
import type { ReportContext, ReportFamily } from '../types/reportCatalog.types';
import { listInvoiceFormatUiLayouts, getInvoiceFormatUiLayout } from './invoiceFormatUiLayouts';
import { listAccountsFormatUiLayouts, getAccountsFormatUiLayout } from './accountsFormatUiLayouts';
import { listWmsFormatUiLayouts, getWmsFormatUiLayout } from './wmsFormatUiLayouts';
import {
  listArrivalNoticeFormatUiLayouts,
  getArrivalNoticeFormatUiLayout,
} from './arrivalNoticeFormatUiLayouts';
import {
  listDeliveryOrderFormatUiLayouts,
  getDeliveryOrderFormatUiLayout,
} from './deliveryOrderFormatUiLayouts';
import { listHawbFormatUiLayouts, getHawbFormatUiLayout } from './hawbFormatUiLayouts';
import { listHblFormatUiLayouts, getHblFormatUiLayout } from './hblFormatUiLayouts';
import {
  listOtherReportsFormatUiLayouts,
  getOtherReportsFormatUiLayout,
} from './otherReportsFormatUiLayouts';
import {
  listQuotationFormatUiLayouts,
  getQuotationFormatUiLayout,
} from './quotationFormatUiLayouts';
import { listOpsListFormatUiLayouts, getOpsListFormatUiLayout } from './opsListFormatUiLayouts';
import {
  listCommercialExtraFormatUiLayouts,
  getCommercialExtraFormatUiLayout,
} from './commercialExtraFormatUiLayouts';
import {
  listSeaDocsExtraFormatUiLayouts,
  getSeaDocsExtraFormatUiLayout,
} from './seaDocsExtraFormatUiLayouts';
import {
  listLeftoverFormatUiLayouts,
  getLeftoverFormatUiLayout,
} from './leftoverFormatUiLayouts';
import { getRegistryByCode } from './fresaReportRegistry';
import { layoutBlockSignature } from '../utils/layoutBlockSignature';

/**
 * Exact https://fresatechnologies.com/sample-report-formats/ HAWB / HBL codes.
 * Catalogue listing uses these only (extras live in leftover / deep-link fallbacks).
 */
const FRESA_PAGE_HAWB = new Set([
  'HAWB_DRAFT_REPORT_FORMAT',
  'HAWB_DRAFT_REPORT_FORMAT_1',
  'HAWB_DRAFT_REPORT_FORMAT_2',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_1',
  'HAWB_ORIGINAL_PRE_PRINTED_REPORT_FORMAT_2',
]);
const FRESA_PAGE_HBL = new Set([
  'HBL_DRAFT_REPORT_FORMAT_JASPER',
  'HBL_DRAFT_REPORT_FORMAT_2',
  ...[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(
    (n) => `HBL_DRAFT_REPORT_FORMAT_${n}`,
  ),
]);

export type RegisteredFormatCatalogEntry = {
  code: string;
  name: string;
  family: ReportFamily;
  contexts: ReportContext[];
  kind: string;
};

function familyFromCode(code: string, fallback: ReportFamily): ReportFamily {
  const reg = getRegistryByCode(code);
  if (reg?.family) return reg.family;
  return fallback;
}

function contextsFromCode(code: string, fallback: ReportContext[]): ReportContext[] {
  const reg = getRegistryByCode(code);
  if (reg?.contexts?.length) return reg.contexts as ReportContext[];
  return fallback;
}

type LayoutCatalogSource = {
  layouts: InvoiceFormatUiLayout[];
  family: ReportFamily;
  contexts: ReportContext[];
  kindPrefix: string;
};

/**
 * Every permanent JSON layout as a catalogue entry (openable PDF).
 * Dedupes by visual block signature so clone templates are not listed twice.
 */
export function listAllRegisteredFormatCatalogEntries(): RegisteredFormatCatalogEntry[] {
  const sources: LayoutCatalogSource[] = [
    { layouts: listInvoiceFormatUiLayouts(), family: 'commercial', contexts: ['invoice'], kindPrefix: 'invoice' },
    { layouts: listAccountsFormatUiLayouts(), family: 'finance', contexts: ['gl'], kindPrefix: 'accounts' },
    { layouts: listWmsFormatUiLayouts(), family: 'wms', contexts: ['wms'], kindPrefix: 'wms' },
    { layouts: listArrivalNoticeFormatUiLayouts(), family: 'sea_docs', contexts: ['job'], kindPrefix: 'arrival' },
    { layouts: listDeliveryOrderFormatUiLayouts(), family: 'sea_docs', contexts: ['job'], kindPrefix: 'delivery' },
    {
      layouts: listHawbFormatUiLayouts().filter((r) => FRESA_PAGE_HAWB.has(r.code.toUpperCase())),
      family: 'air_docs',
      contexts: ['job'],
      kindPrefix: 'hawb',
    },
    {
      layouts: listHblFormatUiLayouts().filter((r) => FRESA_PAGE_HBL.has(r.code.toUpperCase())),
      family: 'sea_docs',
      contexts: ['job'],
      kindPrefix: 'hbl',
    },
    { layouts: listOtherReportsFormatUiLayouts(), family: 'other', contexts: ['job'], kindPrefix: 'other' },
    { layouts: listQuotationFormatUiLayouts(), family: 'quotation', contexts: ['quotation'], kindPrefix: 'quotation' },
    { layouts: listOpsListFormatUiLayouts(), family: 'ops_list', contexts: ['list', 'job'], kindPrefix: 'ops' },
    {
      layouts: listCommercialExtraFormatUiLayouts(),
      family: 'commercial',
      contexts: ['invoice'],
      kindPrefix: 'commercial',
    },
    { layouts: listSeaDocsExtraFormatUiLayouts(), family: 'sea_docs', contexts: ['job'], kindPrefix: 'sea_air' },
  ];

  type Cand = {
    entry: RegisteredFormatCatalogEntry;
    sig: string;
    formatNumber: number;
  };
  const candidates: Cand[] = [];

  for (const src of sources) {
    for (const row of src.layouts) {
      candidates.push({
        entry: {
          code: row.code,
          name: row.name,
          family: familyFromCode(row.code, src.family),
          contexts: contextsFromCode(row.code, src.contexts),
          kind: `${src.kindPrefix}_${row.formatNumber || row.code}`,
        },
        sig: layoutBlockSignature(row.blocks) || `code:${row.code.toUpperCase()}`,
        formatNumber: Number(row.formatNumber) || 9999,
      });
    }
  }

  for (const row of listLeftoverFormatUiLayouts()) {
    const isHbl = /^HBL/i.test(row.name) || /HBL/i.test(row.code);
    const family = familyFromCode(row.code, isHbl ? 'sea_docs' : 'commercial');
    const contexts = contextsFromCode(row.code, isHbl ? ['job'] : ['invoice']);
    candidates.push({
      entry: {
        code: row.code,
        name: row.name,
        family,
        contexts,
        kind: `leftover_${row.formatNumber || row.code}`,
      },
      sig: layoutBlockSignature(row.blocks) || `code:${row.code.toUpperCase()}`,
      formatNumber: Number(row.formatNumber) || 9999,
    });
  }

  candidates.sort((a, b) => {
    if (a.formatNumber !== b.formatNumber) return a.formatNumber - b.formatNumber;
    return a.entry.name.localeCompare(b.entry.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  const byCode = new Map<string, Cand>();
  const bySig = new Map<string, Cand>();
  for (const cand of candidates) {
    const key = cand.entry.code.toUpperCase();
    if (byCode.has(key)) continue;
    if (bySig.has(cand.sig)) continue;
    byCode.set(key, cand);
    bySig.set(cand.sig, cand);
  }

  return [...byCode.values()]
    .map((c) => c.entry)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
}

/** Resolve a permanent JSON layout for any FRESA catalog / registry report code. */
export function resolveAnyFormatUiLayout(code: string): InvoiceFormatUiLayout | undefined {
  const needle = code.trim();
  if (!needle) return undefined;
  return (
    getInvoiceFormatUiLayout(needle) ??
    getAccountsFormatUiLayout(needle) ??
    getWmsFormatUiLayout(needle) ??
    getArrivalNoticeFormatUiLayout(needle) ??
    getDeliveryOrderFormatUiLayout(needle) ??
    getHawbFormatUiLayout(needle) ??
    getHblFormatUiLayout(needle) ??
    getOtherReportsFormatUiLayout(needle) ??
    getQuotationFormatUiLayout(needle) ??
    getOpsListFormatUiLayout(needle) ??
    getCommercialExtraFormatUiLayout(needle) ??
    getSeaDocsExtraFormatUiLayout(needle) ??
    getLeftoverFormatUiLayout(needle)
  );
}

export function hasAnyFormatUiLayout(code: string): boolean {
  return Boolean(resolveAnyFormatUiLayout(code));
}
