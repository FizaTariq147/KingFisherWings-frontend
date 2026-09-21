import type { ReportFamily } from '../types/reportCatalog.types';
import { getRegistryByCode } from '../data/fresaReportRegistry';

/**
 * Customer-facing transport documents get KingFisher Terms & Conditions on the
 * next PDF page (BL draft/original, HAWB, arrival notice, DO, booking, pre-alert…).
 *
 * Excluded:
 * - Invoice / commercial / quotation formats
 * - Admin / internal downloads (ops lists, finance, WMS stock reports)
 */
export function shouldAppendCustomerTermsPage(code: string): boolean {
  const needle = code.trim().toUpperCase();
  if (!needle) return false;

  if (
    /^(INVOICE_|QUOTATION_|PROFORMA_|DEBIT_NOTE_|CREDIT_NOTE_|LEFTOVER_INVOICE_|LEFTOVER_TAX_|LEFTOVER_PROFORMA_|LEFTOVER_SIMPLE_|LEFTOVER_STANDARD_|LEFTOVER_SAUDI_|LEFTOVER_VIETNAM_|LEFTOVER_OVERSEAS_|LEFTOVER_LAND_)/i.test(
      needle,
    )
  ) {
    return false;
  }

  if (
    /LIST_REPORT|DAILY_STATUS|PENDING_SHIPMENT|JOB_STATUS|JOB_NOT_CLOSED|TRIAL_BALANCE|PROFIT_AND_LOSS|STATEMENT_OF_ACCOUNTS|AGING|VOUCHER|OUTSTANDING_LETTER|WMS_|ADVANCE_SHIPPING|GL_/i.test(
      needle,
    )
  ) {
    return false;
  }

  const family = getRegistryByCode(needle)?.family as ReportFamily | undefined;
  if (
    family === 'commercial' ||
    family === 'quotation' ||
    family === 'finance' ||
    family === 'ops_list' ||
    family === 'wms'
  ) {
    return false;
  }

  if (family === 'sea_docs' || family === 'air_docs' || family === 'other') {
    return true;
  }

  return /HBL_|HAWB_|MAWB_|ARRIVAL_NOTICE_|DELIVERY_ORDER_|DELIVERY_NOTE_|BOOKING_CONFIRMATION_|PRE_ALERT_|CARGO_MANIFEST_|FG_HBL_|FG_ARRIVAL_|FG_DELIVERY_|LEFTOVER_HBL_|PROOF_OF_DELIVERY|STUFFING_REPORT|FCR_/i.test(
    needle,
  );
}
