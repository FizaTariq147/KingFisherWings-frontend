/**
 * Which official T&C PDF (if any) to append after a report layout.
 * - `bl` → BL_Terms_and_Conditions.pdf (HBL / MBL / Bill of Lading)
 * - `airway` → Airway_Terms_and_Conditions.pdf (HAWB / MAWB / AWB)
 * - `null` → do not append
 */
export type CustomerTermsKind = 'bl' | 'airway';

/**
 * Map a catalogue / job document format code to a T&C kind.
 * Intentionally narrow — ASN, DO, invoices, manifests, etc. return null.
 */
export function resolveCustomerTermsKind(code: string): CustomerTermsKind | null {
  const needle = code.trim().toUpperCase();
  if (!needle) return null;

  // Airway bill first so BARCODE_AWB / HAWB win over broad BL heuristics.
  if (
    /^(HAWB_|MAWB_|AWB_|AIRWAY_|AIR_WAYBILL_)/.test(needle) ||
    /(_HAWB_|_MAWB_|_AWB_)/.test(needle) ||
    /(^|_)(HAWB|MAWB)(_|$)/.test(needle)
  ) {
    return 'airway';
  }

  if (
    /^(HBL_|MBL_|FG_HBL_|LEFTOVER_HBL_|BL_)/.test(needle) ||
    /BILL_OF_LADING/.test(needle) ||
    /(^|_)(HBL|MBL)(_|$)/.test(needle)
  ) {
    return 'bl';
  }

  return null;
}
