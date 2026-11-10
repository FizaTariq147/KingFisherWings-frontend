/**
 * Suggest a Puppeteer pack key for a catalogue template.
 * Never invents keys — only returns a key present in GET /reports/templates/renderers.
 */
import type { ReportFamily } from '../types/reportCatalog.types';
import { FRESA_INVOICE_FORMAT_1 } from '../constants/fresaPdfParity.constants';
import { FRESA_OPS_LIST_PACK } from '../constants/fresaCorePackShells.constants';
import { getRegistryByCode } from '../data/fresaReportRegistry';
import { preferredHblHawbPackKeyHint } from './fresaPackGenerateParams';

export type ReportPackOption = { key: string; label?: string; description?: string };

function pick(
  options: ReportPackOption[],
  predicates: Array<(key: string) => boolean>,
): string | null {
  for (const pred of predicates) {
    const hit = options.find((o) => pred(o.key));
    if (hit?.key) return hit.key;
  }
  return null;
}

function hasPrefix(prefix: string) {
  return (key: string) => key === prefix || key.startsWith(`${prefix}.`) || key.startsWith(prefix);
}

/**
 * Registry often stamps every HBL/HAWB code as *_draft. Prefer live
 * sea.hbl_original / air.hawb_final when the catalogue code is original/final.
 */
function refineHblHawbPackKey(
  code: string,
  options: ReportPackOption[],
  candidate: string | null,
): string | null {
  const hint = preferredHblHawbPackKeyHint(code);
  if (!hint) return candidate;

  if (hint === 'hbl_original') {
    return (
      pick(options, [(k) => /sea\.hbl_original|hbl_original/i.test(k)]) ?? candidate
    );
  }
  if (hint === 'hbl_draft') {
    return (
      pick(options, [(k) => /sea\.hbl_draft|hbl_draft/i.test(k)]) ?? candidate
    );
  }
  if (hint === 'hawb_final') {
    return (
      pick(options, [
        (k) => /air\.hawb_final|hawb_final/i.test(k),
        (k) => /air\.hawb_draft|hawb_draft/i.test(k),
      ]) ?? candidate
    );
  }
  if (hint === 'hawb_draft') {
    return (
      pick(options, [(k) => /air\.hawb_draft|hawb_draft/i.test(k)]) ?? candidate
    );
  }
  return candidate;
}

/**
 * Best-effort pack suggestion from live renderer list.
 * Prefer registry suggestedPackKey, then specific shells, then family generic.
 * Returns null if nothing matches live /renderers.
 */
export function suggestReportPackKey(
  code: string,
  family: ReportFamily | string,
  options: ReportPackOption[],
): string | null {
  if (!options.length) return null;
  const c = code.trim().toUpperCase();
  const fam = String(family || '').toLowerCase();

  const registryHint = getRegistryByCode(c)?.suggestedPackKey?.trim();
  if (registryHint) {
    const exact = options.find((o) => o.key === registryHint);
    if (exact?.key) {
      return refineHblHawbPackKey(c, options, exact.key);
    }
    const prefix = registryHint.split('.')[0];
    const sameFamily = options.find(
      (o) => o.key.startsWith(`${prefix}.`) && !/pending/i.test(o.key),
    );
    if (sameFamily?.key) {
      return refineHblHawbPackKey(c, options, sameFamily.key);
    }
  }

  if (c === FRESA_INVOICE_FORMAT_1.code || /INVOICE_REPORT_FORMAT_1_TAX_INVOICE_INDIA/i.test(c)) {
    const exact = pick(options, [
      (k) => k === FRESA_INVOICE_FORMAT_1.packKey,
      (k) => /invoice_tax_india_1|invoice.*india/i.test(k),
    ]);
    if (exact) return exact;
  }

  if (/^INVOICE_REPORT_FORMAT_/i.test(c) || fam === 'commercial') {
    const commercial = pick(options, [
      (k) => /commercial\.invoice/i.test(k),
      hasPrefix('commercial'),
      (k) => /invoice/i.test(k) && !/pending/i.test(k),
    ]);
    if (commercial) return commercial;
  }

  if (/^HBL_|^FG_HBL_/i.test(c) || (fam === 'sea_docs' && /HBL/i.test(c))) {
    const hint = preferredHblHawbPackKeyHint(c);
    const sea = pick(options, [
      ...(hint === 'hbl_original'
        ? [(k: string) => /sea\.hbl_original|hbl_original/i.test(k)]
        : [(k: string) => /sea\.hbl_draft|hbl_draft/i.test(k)]),
      (k) => /sea\.hbl|hbl_draft|hbl_original/i.test(k),
      hasPrefix('sea'),
    ]);
    if (sea) return sea;
  }

  if (/ARRIVAL_NOTICE|CARGO_ARRIVAL/i.test(c)) {
    const arrival = pick(options, [
      (k) => /arrival_notice|arrival/i.test(k),
      hasPrefix('sea'),
      hasPrefix('air'),
    ]);
    if (arrival) return arrival;
  }

  if (/DELIVERY_ORDER|DELIVERY_NOTE|PROOF_OF_DELIVERY/i.test(c)) {
    const delivery = pick(options, [
      (k) => /delivery_order|delivery/i.test(k),
      hasPrefix('sea'),
      hasPrefix('air'),
    ]);
    if (delivery) return delivery;
  }

  if (/^HAWB_|^MAWB_|^AIR_/i.test(c) || fam === 'air_docs') {
    const hint = preferredHblHawbPackKeyHint(c);
    const air = pick(options, [
      ...(hint === 'hawb_final'
        ? [
            (k: string) => /air\.hawb_final|hawb_final/i.test(k),
            // BE may only expose draft until final is seeded; still prefer hawb over mawb.
            (k: string) => /air\.hawb_draft|hawb_draft/i.test(k),
          ]
        : hint === 'hawb_draft'
          ? [(k: string) => /air\.hawb_draft|hawb_draft/i.test(k)]
          : []),
      (k) => /air\.hawb|hawb|mawb/i.test(k),
      hasPrefix('air'),
      hasPrefix('ops'),
    ]);
    if (air) return air;
  }

  if (
    fam === 'ops_list' ||
    /LIST_REPORT|DAILY_STATUS|PENDING_SHIPMENT|JOB_STATUS/i.test(c)
  ) {
    const ops = pick(options, [
      (k) => k === FRESA_OPS_LIST_PACK.key,
      (k) => /ops\.list|list_generic|delivered_jobs|dsr/i.test(k),
      hasPrefix('ops'),
    ]);
    if (ops) return ops;
  }

  if (fam === 'quotation' || /QUOTATION_REPORT|AIR_QUOTATION/i.test(c)) {
    const quote = pick(options, [
      (k) => /quotation\.shell|quotation/i.test(k),
      hasPrefix('quotation'),
      hasPrefix('commercial'),
    ]);
    if (quote) return quote;
  }

  if (
    fam === 'finance' ||
    /TRIAL_BALANCE|PROFIT_AND_LOSS|AGING|STATEMENT_OF_ACCOUNTS|OUTSTANDING_LETTER|VOUCHER/i.test(
      c,
    )
  ) {
    const finance = pick(options, [
      (k) => /finance\.|aging|trial_balance|profit_and_loss|statement/i.test(k),
      hasPrefix('finance'),
      hasPrefix('ops'),
    ]);
    if (finance) return finance;
  }

  if (fam === 'wms' || /WMS_|ADVANCE_SHIPPING/i.test(c)) {
    const wms = pick(options, [
      (k) => /wms\.|asn|stock/i.test(k),
      hasPrefix('wms'),
      hasPrefix('ops'),
    ]);
    if (wms) return wms;
  }

  if (fam === 'quotation' || /^QUOTATION_/i.test(c)) {
    const quote = pick(options, [
      (k) => /quotation/i.test(k),
      hasPrefix('commercial'),
      hasPrefix('ops'),
    ]);
    if (quote) return quote;
  }

  if (fam === 'sea_docs') {
    return pick(options, [hasPrefix('sea'), hasPrefix('ops')]);
  }

  return null;
}
