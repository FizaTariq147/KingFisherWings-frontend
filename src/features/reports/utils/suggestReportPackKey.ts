/**
 * Suggest a Puppeteer pack key for a catalogue template.
 * Never invents keys — only returns a key present in GET /reports/templates/renderers.
 */
import type { ReportFamily } from '../types/reportCatalog.types';
import { FRESA_INVOICE_FORMAT_1 } from '../constants/fresaPdfParity.constants';

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
 * Best-effort pack suggestion from live renderer list.
 * Prefer specific shells, then family generic. Returns null if nothing matches.
 */
export function suggestReportPackKey(
  code: string,
  family: ReportFamily | string,
  options: ReportPackOption[],
): string | null {
  if (!options.length) return null;
  const c = code.trim().toUpperCase();
  const fam = String(family || '').toLowerCase();

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
    const sea = pick(options, [
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
    const air = pick(options, [
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
      (k) => /ops\.list|list_generic|delivered_jobs|dsr/i.test(k),
      hasPrefix('ops'),
    ]);
    if (ops) return ops;
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
