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

function fromLayouts(
  layouts: InvoiceFormatUiLayout[],
  family: ReportFamily,
  contexts: ReportContext[],
  kindPrefix: string,
): RegisteredFormatCatalogEntry[] {
  return layouts.map((row) => ({
    code: row.code,
    name: row.name,
    family: familyFromCode(row.code, family),
    contexts: contextsFromCode(row.code, contexts),
    kind: `${kindPrefix}_${row.formatNumber || row.code}`,
  }));
}

/** Every permanent JSON layout as a catalogue entry (openable PDF). */
export function listAllRegisteredFormatCatalogEntries(): RegisteredFormatCatalogEntry[] {
  const rows: RegisteredFormatCatalogEntry[] = [
    ...fromLayouts(listInvoiceFormatUiLayouts(), 'commercial', ['invoice'], 'invoice'),
    ...fromLayouts(listAccountsFormatUiLayouts(), 'finance', ['gl'], 'accounts'),
    ...fromLayouts(listWmsFormatUiLayouts(), 'wms', ['wms'], 'wms'),
    ...fromLayouts(listArrivalNoticeFormatUiLayouts(), 'sea_docs', ['job'], 'arrival'),
    ...fromLayouts(listDeliveryOrderFormatUiLayouts(), 'sea_docs', ['job'], 'delivery'),
    ...fromLayouts(listHawbFormatUiLayouts(), 'air_docs', ['job'], 'hawb'),
    ...fromLayouts(listHblFormatUiLayouts(), 'sea_docs', ['job'], 'hbl'),
    ...fromLayouts(listOtherReportsFormatUiLayouts(), 'other', ['job'], 'other'),
    ...fromLayouts(listQuotationFormatUiLayouts(), 'quotation', ['quotation'], 'quotation'),
    ...fromLayouts(listOpsListFormatUiLayouts(), 'ops_list', ['list', 'job'], 'ops'),
    ...fromLayouts(listCommercialExtraFormatUiLayouts(), 'commercial', ['invoice'], 'commercial'),
    ...fromLayouts(listSeaDocsExtraFormatUiLayouts(), 'sea_docs', ['job'], 'sea_air'),
    ...listLeftoverFormatUiLayouts().map((row) => {
      const isHbl = /^HBL/i.test(row.name) || /HBL/i.test(row.code);
      const family = familyFromCode(row.code, isHbl ? 'sea_docs' : 'commercial');
      const contexts = contextsFromCode(row.code, isHbl ? ['job'] : ['invoice']);
      return {
        code: row.code,
        name: row.name,
        family,
        contexts,
        kind: `leftover_${row.formatNumber || row.code}`,
      };
    }),
  ];

  const byCode = new Map<string, RegisteredFormatCatalogEntry>();
  for (const row of rows) {
    const key = row.code.toUpperCase();
    if (!byCode.has(key)) byCode.set(key, row);
  }
  return [...byCode.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
  );
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
